"""
API-Football integration for real team stats and H2H data.

Three-layer cache:
  1. In-memory dict (process lifetime)
  2. JSON file at backend/.cache/match_stats.json (survives restarts)
  3. Caller falls back to hardcoded matchMeta.stats on null/error

Free tier is 100 calls/day. With 8 matches and 9 unique countries:
  - 9 team_id lookups + 9 team_stats fetches = 18 calls
  - ~7 H2H pair fetches = 7 calls
  - Total first-time cost: ~25 calls. Cached afterward.
"""

import json
import logging
import os
from pathlib import Path
from typing import Optional

import requests

log = logging.getLogger(__name__)

API_BASE   = "https://v3.football.api-sports.io"
CACHE_DIR  = Path(__file__).parent.parent / ".cache"
CACHE_FILE = CACHE_DIR / "match_stats.json"

_cache: Optional[dict] = None


# ── Cache helpers ─────────────────────────────────────────────────────────

def _load_cache() -> dict:
    global _cache
    if _cache is not None:
        return _cache
    CACHE_DIR.mkdir(exist_ok=True)
    if CACHE_FILE.exists():
        try:
            _cache = json.loads(CACHE_FILE.read_text())
        except Exception:
            log.warning("Cache file corrupted, starting fresh")
            _cache = {}
    else:
        _cache = {}
    _cache.setdefault("team_id",    {})  # country (lowercase) → team_id
    _cache.setdefault("team_stats", {})  # country (lowercase) → stats dict
    _cache.setdefault("h2h",        {})  # "home|away" (lowercase) → h2h dict
    return _cache


def _save_cache() -> None:
    if _cache is None:
        return
    try:
        CACHE_FILE.write_text(json.dumps(_cache, indent=2, default=str))
    except Exception:
        log.exception("Failed to save cache")


# ── API client ────────────────────────────────────────────────────────────

def _api_get(path: str, params: Optional[dict] = None):
    key = os.getenv("API_FOOTBALL_KEY")
    if not key:
        raise RuntimeError("API_FOOTBALL_KEY not configured in backend/.env")

    url = f"{API_BASE}{path}"
    headers = {"x-apisports-key": key}
    r = requests.get(url, params=params, headers=headers, timeout=10)
    r.raise_for_status()
    body = r.json()
    if body.get("errors"):
        log.warning("api-football errors for %s: %s", path, body["errors"])
        return None
    return body.get("response", [])


# ── Team ID lookup ────────────────────────────────────────────────────────

# Hardcoded national team IDs (verified from API-Football v3).
# Avoids burning a /teams lookup call AND avoids the "search returns club team" bug.
_NATIONAL_TEAM_IDS = {
    "usa":                     2384,
    "united states":           2384,
    "paraguay":                12,
    "iran":                    25,
    "ir iran":                 25,
    "new zealand":             14,
    "switzerland":             15,
    "bosnia and herzegovina":  1,
    "bosnia & herzegovina":    1,
    "belgium":                 2,
    "türkiye":                 21,
    "turkey":                  21,
    "italy":                   768,
}

# Query both 2024 and 2023, then pick the most recent 10 across both
# (national teams play few games per year, so single-season samples are tiny).
SEASONS = [2024, 2023]


def get_team_id(country: str) -> Optional[int]:
    key = country.lower().strip()
    if key in _NATIONAL_TEAM_IDS:
        return _NATIONAL_TEAM_IDS[key]

    # Fallback: cached API lookup (only if not in our hardcoded list)
    cache = _load_cache()
    if key in cache["team_id"]:
        return cache["team_id"][key]
    try:
        results = _api_get("/teams", {"search": country}) or []
        national = next((r for r in results if r.get("team", {}).get("national")), None)
        if national:
            tid = national["team"]["id"]
            cache["team_id"][key] = tid
            _save_cache()
            log.info("Resolved team_id for %s → %d", country, tid)
            return tid
    except Exception:
        log.exception("team_id lookup failed for %s", country)
    return None


# ── Team stats (last 10 fixtures) ─────────────────────────────────────────

def get_team_stats(country: str) -> Optional[dict]:
    cache = _load_cache()
    key = country.lower().strip()
    if key in cache["team_stats"]:
        return cache["team_stats"][key]

    team_id = get_team_id(country)
    if not team_id:
        return None

    try:
        # Free plan: can't use `last`, must use `season`. Pull multiple seasons for a fuller sample.
        all_fixtures = []
        for season in SEASONS:
            batch = _api_get("/fixtures", {"team": team_id, "season": season}) or []
            all_fixtures.extend(batch)
        # Only count fixtures with a final score (skip scheduled/postponed)
        finished = [f for f in all_fixtures
                    if f.get("fixture", {}).get("status", {}).get("short") in ("FT", "AET", "PEN")
                    and f.get("goals", {}).get("home") is not None]
        if not finished:
            return None

        # Sort by date desc (most recent first); take last 10
        finished.sort(key=lambda f: f.get("fixture", {}).get("date", ""), reverse=True)
        fixtures = finished[:10]

        wins = draws = losses = 0
        gf = ga = 0
        form = []

        for f in fixtures:
            home_t  = f["teams"]["home"]
            away_t  = f["teams"]["away"]
            hs      = f["goals"]["home"] or 0
            as_     = f["goals"]["away"] or 0
            is_home = home_t["id"] == team_id

            won = home_t["winner"] if is_home else away_t["winner"]
            if won is True:
                wins += 1; form.append("W")
            elif won is False:
                losses += 1; form.append("L")
            else:
                draws += 1; form.append("D")

            gf += hs if is_home else as_
            ga += as_ if is_home else hs

        n = len(fixtures)
        stats = {
            "winRate":       round((wins / n) * 100),
            "goalsPerGame":  round(gf / n, 1),
            "form":          form[:5],          # most recent 5
            "goalsConceded": round(ga / n, 1),
        }
        cache["team_stats"][key] = stats
        _save_cache()
        log.info("Team stats for %s: %s", country, stats)
        return stats
    except Exception:
        log.exception("team stats fetch failed for %s", country)
        return None


# ── Head-to-head + last meeting ───────────────────────────────────────────

def get_h2h(home: str, away: str) -> Optional[dict]:
    cache    = _load_cache()
    pair_key = f"{home.lower().strip()}|{away.lower().strip()}"
    if pair_key in cache["h2h"]:
        return cache["h2h"][pair_key]

    home_id = get_team_id(home)
    away_id = get_team_id(away)
    if not home_id or not away_id:
        return None

    try:
        # Free plan: drop `last` param, get all H2H fixtures
        all_fixtures = _api_get("/fixtures/headtohead",
                                {"h2h": f"{home_id}-{away_id}"}) or []
        # Only finished matches
        finished = [f for f in all_fixtures
                    if f.get("fixture", {}).get("status", {}).get("short") in ("FT", "AET", "PEN")
                    and f.get("goals", {}).get("home") is not None]
        # Sort by date desc and cap at 20
        finished.sort(key=lambda f: f.get("fixture", {}).get("date", ""), reverse=True)
        fixtures = finished[:20]

        team1wins = team2wins = draws = 0
        home_total_goals = 0
        away_total_goals = 0

        for f in fixtures:
            home_t = f["teams"]["home"]
            away_t = f["teams"]["away"]
            hs     = f["goals"]["home"] or 0
            as_    = f["goals"]["away"] or 0

            # Map fixture sides to our home/away
            if home_t["id"] == home_id:
                home_total_goals += hs
                away_total_goals += as_
                if home_t["winner"] is True:   team1wins += 1
                elif away_t["winner"] is True: team2wins += 1
                else:                          draws += 1
            else:
                home_total_goals += as_
                away_total_goals += hs
                if away_t["winner"] is True:   team1wins += 1
                elif home_t["winner"] is True: team2wins += 1
                else:                          draws += 1

        # Last meeting (most recent fixture; API returns desc by date)
        last_meeting = None
        if fixtures:
            f = fixtures[0]
            home_t = f["teams"]["home"]
            hs     = f["goals"]["home"] or 0
            as_    = f["goals"]["away"] or 0
            if home_t["id"] == home_id:
                hs_out, as_out = hs, as_
            else:
                hs_out, as_out = as_, hs
            last_meeting = {
                "date":      f.get("fixture", {}).get("date", "")[:10],
                "type":      f.get("league", {}).get("name", "Match"),
                "homeScore": hs_out,
                "awayScore": as_out,
            }

        result = {
            "h2h": {
                "total":     len(fixtures),
                "team1wins": team1wins,
                "draws":     draws,
                "team2wins": team2wins,
            },
            "lastMeeting": last_meeting,
            "allTime": {
                "homeGoals": home_total_goals,
                "awayGoals": away_total_goals,
            },
        }
        cache["h2h"][pair_key] = result
        _save_cache()
        log.info("H2H %s vs %s: %d meetings", home, away, len(fixtures))
        return result
    except Exception:
        log.exception("h2h fetch failed for %s vs %s", home, away)
        return None


# ── Combined endpoint helper ──────────────────────────────────────────────

def get_match_stats(home: str, away: str) -> dict:
    """Return a partial stats dict. Any field may be None — caller falls back."""
    home_stats = get_team_stats(home)
    away_stats = get_team_stats(away)
    h2h_data   = get_h2h(home, away)

    return {
        "home":        home_stats,
        "away":        away_stats,
        "h2h":         h2h_data["h2h"]         if h2h_data else None,
        "lastMeeting": h2h_data["lastMeeting"] if h2h_data else None,
        "allTime":     h2h_data["allTime"]     if h2h_data else None,
    }
