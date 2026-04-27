"""
Two-phase itinerary builder.

Phase A  build_candidate_pools  — convert DB rows + picks into scored candidates
Phase B  fill_day_slots         — select best candidate per slot under constraints

Scoring replaces ad-hoc priority rules.  Hard constraints become very large
negative weights; soft preferences are moderate positive/negative weights.
Same param set + same variant always yields the same schedule (deterministic
seed).  Pass variant=1/2/... to explore alternative schedules.
"""

import hashlib
import json
import math
import random
from collections import defaultdict
from pathlib import Path

import queries

_CONFIG_DIR = Path(__file__).parent.parent / "config"

with open(_CONFIG_DIR / "matches.json") as _f:
    MATCH_INFO: dict = json.load(_f)

with open(_CONFIG_DIR / "areas.json") as _f:
    AREA_COORDS: dict = json.load(_f)

# ─────────────────────────────────────────
# Static configuration
# ─────────────────────────────────────────

# ─────────────────────────────────────────
# Three orthogonal dimensions for itinerary scoring
#
# TYPE_CATS  (WHO)  — group composition & social dynamic.
#   Drives what *kind* of venue atmosphere suits this traveler.
#   No spending-level assumptions; budget is handled separately.
#
# VIBE_CATS  (WHAT) — activity theme preference.
#   Orthogonal to traveler type so any combination is meaningful:
#   e.g. "solo + football" ≠ "friends + football".
#
# HOTEL_BAND / REST_PRICE  (HOW MUCH) — spending level.
#   Derived from the budget field, never from traveler type.
# ─────────────────────────────────────────

TYPE_CATS: dict[str, set[int]] = {
    # WHO you are traveling with → social atmosphere of the activity
    "solo":    {14, 16, 17, 19, 21},       # cinema, beach, landmarks, culture/museum, nature  — independent, self-paced
    "family":  {4, 6, 14, 16, 17, 19},     # community programs, MLS, cinema, beach, landmarks, culture  — accessible & safe
    "couple":  {5, 7, 12, 13, 18},         # clubs, special events, music, comedy, entertainment  — intimate & curated
    "friends": {1, 2, 10, 11, 12},         # fan festivals, fan zones, bars/party, fan meetups, music  — social & buzzy
    "group":   {1, 2, 3, 6, 8, 11},        # fan festivals, fan zones, official activities, MLS, fan community, meetups  — large-group scale
}

VIBE_CATS: dict[str, set[int]] = {
    # WHAT theme/atmosphere you want  — stacks on top of traveler-type score
    "football":  {1, 2, 8, 10, 11},        # fan festivals, fan zones, fan community, bars/party, fan meetups
    "culture":   {4, 17, 19},              # community programs, urban landmarks, culture/museum
    "beach":     {16, 21},                 # coastal/beach, nature/outdoors
    "nightlife": {5, 10, 12, 13},          # clubs, bars/party, live music, comedy
    "film":      {7, 17, 18, 20},          # special events, urban landmarks (Hollywood Walk of Fame), entertainment, shopping
}
HOTEL_BAND = {"budget": "100+", "mid": "200+", "luxury": "400+"}
REST_PRICE  = {
    "budget": ["$10-20", "$20-30"],
    "mid":    ["$30-50"],
    "luxury": ["$50-100", "$100+"],
}

# Which time-of-day slots each dim_event_category fits.
# Keys must match NORMAL_DAY_TEMPLATE / MATCH_DAY_TEMPLATE slot_id values.
SLOT_FIT: dict[int, list[str]] = {
    1:  ["all_day"],                    # Fan Festival
    2:  ["all_day"],                    # Fan Zone
    3:  ["morning", "afternoon"],       # Official Activity
    4:  ["morning", "afternoon"],       # Community Program
    5:  ["evening"],                    # Club Event
    6:  ["afternoon", "evening"],       # MLS Match
    7:  ["afternoon", "evening"],       # Special Event
    8:  ["all_day"],                    # Fan Community
    9:  ["all_day"],
    10: ["evening"],                    # Bar / Party
    11: ["all_day"],                    # Fan Meetup
    12: ["evening"],                    # Live Music
    13: ["evening"],                    # Comedy
    14: ["evening"],                    # Outdoor Cinema
    15: ["evening"],
    16: ["morning", "afternoon"],       # Coastal / Beach
    17: ["morning", "afternoon"],       # Urban Icon / Landmark
    18: ["afternoon", "evening"],       # Entertainment
    19: ["morning", "afternoon"],       # Culture / Museum
    20: ["afternoon", "evening"],       # Shopping
    21: ["morning", "afternoon"],       # Nature
    22: ["morning", "afternoon"],
    23: ["all_day"],
}

# Scoring weights — adjust here without touching generation logic.
W = {
    # Bonuses
    "pick":             50,    # candidate was selected in Explore LA
    "pick_quota":       20,    # daily pick quota (MAX_PICKS_PER_DAY) not yet reached
    "type_match":       25,    # matches traveler type category
    "vibe_match":       15,    # matches vibe preference category
    "slot_fit":         20,    # fits morning / afternoon / evening
    "day_anchor":       20,    # in the day's anchor area
    "neighbor_area":     8,    # within ~8 km of anchor
    "hotel_area":       20,    # same area as hotel (fallback when no anchor)
    "near_stadium":     15,    # within 10 km of SoFi (match-day slots)
    # Soft penalties
    "wrong_area":      -10,    # noticeably far from anchor
    "cross_day_cat":   -25,    # same event category used on a prior day
    "area_overload":    -8,    # 3+ activities in the same area today
    # Hard penalties (knock below -500 threshold → skipped)
    "slot_mismatch":  -600,    # does not fit this time slot at all
    "same_day_cat":  -1000,    # event category already used today
    "rest_repeat":   -1000,    # same restaurant already used today
    "activity_used": -1000,    # exact activity already used on a prior day
}

MAX_PICKS_PER_DAY = 2
STADIUM_AREA      = "inglewood"
NEIGHBOR_KM       = 8.0   # distance threshold for "neighboring area"

DAY_LABELS = [
    "Day 1 · Arrival & First Impressions",
    "Day 2 · The Beautiful Game",
    "Day 3 · Match Day",
    "Day 4 · Explore LA",
    "Day 5 · Hollywood & Beyond",
    "Day 6 · LA Beaches",
    "Day 7 · Final Day",
]

# Each slot: time, candidate type, slot_id for suitability lookup.
# near_stadium=True  → bonus score when candidate is close to SoFi.
NORMAL_DAY_TEMPLATE = [
    {"time": "09:30", "type": "event",      "slot_id": "morning"},
    {"time": "12:30", "type": "restaurant", "slot_id": "lunch"},
    {"time": "15:00", "type": "event",      "slot_id": "afternoon"},
    {"time": "18:00", "type": "event",      "slot_id": "evening"},
    {"time": "20:30", "type": "restaurant", "slot_id": "dinner"},
]
MATCH_DAY_TEMPLATE = [
    {"time": "09:30", "type": "event",      "slot_id": "morning",  "near_stadium": True},
    {"time": "12:00", "type": "restaurant", "slot_id": "lunch",    "near_stadium": True},
    {"time": None,    "type": "match",      "slot_id": None},
]
NOON_MATCH_DAY_TEMPLATE = [
    {"time": "09:30", "type": "event",      "slot_id": "morning", "near_stadium": True},
    {"time": None,    "type": "match",      "slot_id": None},
    {"time": "20:30", "type": "restaurant", "slot_id": "dinner",  "near_stadium": True},
]

# ─────────────────────────────────────────
# Area utilities
# ─────────────────────────────────────────

def _area_key(text: str) -> str:
    """Normalise a free-text area string to a key present in AREA_COORDS."""
    if not text:
        return ""
    s = text.strip().lower()
    for k in AREA_COORDS:
        if k in s:
            return k
    return s

def _latlon(area_key: str) -> tuple:
    coords = AREA_COORDS.get(area_key)
    return tuple(coords) if coords else (None, None)

def _dist_km(a1: str, a2: str) -> float:
    """Haversine distance between two area-centroid keys."""
    c1, c2 = _latlon(a1), _latlon(a2)
    if None in c1 or None in c2:
        return 999.0
    lat1, lon1 = c1
    lat2, lon2 = c2
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def _is_neighbor(a1: str, a2: str) -> bool:
    return _dist_km(a1, a2) < NEIGHBOR_KM

# ─────────────────────────────────────────
# Candidate construction
# ─────────────────────────────────────────

def _cat_id(row: dict) -> int:
    for k in ("event_category_id", "category_id"):
        v = row.get(k)
        if v is not None:
            try:
                return int(v)
            except (TypeError, ValueError):
                pass
    return 0

def _event_candidate(evt: dict) -> dict:
    cat   = _cat_id(evt)
    area  = _area_key(str(evt.get("area") or evt.get("city") or ""))
    lat, lng = _latlon(area)
    parts = [p for p in [evt.get("venue_name"), evt.get("area") or evt.get("city")] if p]
    ticket = evt.get("ticket_price") or evt.get("admission_info")
    if ticket:
        parts.append(str(ticket))
    return {
        "item_id":   str(evt.get("event_id", "")),
        "title":     evt["event_name"],
        "desc":      " · ".join(parts),
        "source":    "event",
        "cat_id":    cat,
        "cat_label": str(evt.get("category_label") or evt.get("category") or "misc").strip().lower(),
        "area":      area,
        "lat":       lat,
        "lng":       lng,
        "slot_fit":  SLOT_FIT.get(cat, ["all_day"]),
        "is_pick":   False,
    }

def _rest_candidate(rest: dict) -> dict:
    area = _area_key(str(rest.get("region") or ""))
    lat, lng = _latlon(area)
    score_str = f"⭐ {rest['google_review_score']}" if rest.get("google_review_score") else ""
    parts = [p for p in [rest.get("region"), rest.get("flavor"), rest.get("price_range"), score_str] if p]
    return {
        "item_id":   str(rest.get("restaurant_id", "")),
        "title":     rest["restaurant_name"],
        "desc":      " · ".join(parts),
        "source":    "restaurant",
        "cat_id":    -1,
        "cat_label": "restaurant",
        "area":      area,
        "lat":       lat,
        "lng":       lng,
        "slot_fit":  ["lunch", "dinner"],
        "is_pick":   False,
    }

def _pick_candidate(pick: dict) -> dict:
    cat    = pick.get("category", "pick")
    detail = pick.get("detail", "")
    area   = _area_key(detail.split("·")[0].strip() if detail else "")
    lat = lng = None
    try:
        raw_lat = pick.get("lat")
        raw_lng = pick.get("lng")
        if raw_lat and raw_lng:
            lat = float(raw_lat)
            lng = float(raw_lng)
    except (TypeError, ValueError):
        pass
    slot_map = {
        "restaurants": ["lunch", "dinner"],
        "events":      ["all_day"],
        "shows":       ["evening"],
        "attractions": ["morning", "afternoon"],
    }
    return {
        "item_id":   str(pick.get("id") or pick.get("name", "")),
        "title":     pick.get("name", ""),
        "desc":      detail or "Saved from Explore LA",
        "source":    "explore_pick",
        "cat_id":    0,
        "cat_label": cat,
        "area":      area,
        "lat":       lat,
        "lng":       lng,
        "slot_fit":  slot_map.get(cat, ["all_day"]),
        "is_pick":   True,
    }

# ─────────────────────────────────────────
# Scoring
# ─────────────────────────────────────────

def _score_candidate(
    c: dict,
    slot: dict,
    day_used_cats: set,       # event cat_labels already used today
    day_used_rest: set,       # restaurant item_ids already used today
    day_area_count: dict,     # area → activity count today
    day_picks_used: int,
    day_anchor: str,          # primary area this day revolves around
    global_used_ids: set,     # event item_ids used on any prior day
    global_cat_counts: dict,  # cat_label → times used across all days
    ctx: dict,
) -> tuple[float, list[str]]:
    score  = 0.0
    why: list[str] = []

    slot_id    = slot.get("slot_id")
    is_rest    = c["cat_label"] == "restaurant"
    hotel_area = ctx["hotel_area"]

    # ── Hard constraints ──────────────────────────────────────────────
    if not is_rest and c["item_id"] and c["item_id"] in global_used_ids:
        score += W["activity_used"]
        why.append("already used on a prior day")

    if not is_rest and c["cat_label"] in day_used_cats:
        score += W["same_day_cat"]
        why.append("category already used today")

    if is_rest and c["item_id"] and c["item_id"] in day_used_rest:
        score += W["rest_repeat"]
        why.append("same restaurant already today")

    # ── Slot suitability ─────────────────────────────────────────────
    if slot_id and c["slot_fit"]:
        if slot_id in c["slot_fit"] or "all_day" in c["slot_fit"]:
            score += W["slot_fit"]
            why.append(f"fits {slot_id} slot")
        else:
            score += W["slot_mismatch"]
            why.append(f"poor fit for {slot_id} slot")

    # ── Explore LA pick ───────────────────────────────────────────────
    if c["is_pick"]:
        score += W["pick"]
        why.append("selected in Explore LA")
        if day_picks_used < MAX_PICKS_PER_DAY:
            score += W["pick_quota"]
            why.append("daily pick quota not reached yet")

    # ── Traveler type ─────────────────────────────────────────────────
    if c["cat_id"] in ctx["type_cats"]:
        score += W["type_match"]
        why.append("matches traveler type")

    # ── Vibe preference ───────────────────────────────────────────────
    if c["cat_id"] in ctx["vibe_cats"]:
        score += W["vibe_match"]
        why.append(f"matches {ctx['vibe']} vibe")

    # ── Area coherence ────────────────────────────────────────────────
    anchor = day_anchor or hotel_area
    area   = c["area"]
    if area and anchor:
        if area == anchor:
            score += W["day_anchor"]
            why.append("in day anchor area")
        elif _is_neighbor(area, anchor):
            score += W["neighbor_area"]
            why.append("near day anchor area")
        else:
            score += W["wrong_area"]
    elif area and hotel_area:
        if area == hotel_area:
            score += W["hotel_area"]
            why.append("near hotel area")
        elif _is_neighbor(area, hotel_area):
            score += W["neighbor_area"]
            why.append("near hotel area")

    # ── Match-day proximity bonus ─────────────────────────────────────
    if slot.get("near_stadium") and area:
        if _dist_km(area, STADIUM_AREA) < 10:
            score += W["near_stadium"]
            why.append("close to SoFi Stadium")

    # ── Cross-day soft penalty ────────────────────────────────────────
    if not is_rest and not c["is_pick"] and c["cat_label"] in global_cat_counts:
        score += W["cross_day_cat"]
        why.append("category used on a prior day")

    # ── Area overload ─────────────────────────────────────────────────
    if area and day_area_count.get(area, 0) >= 3:
        score += W["area_overload"]
        why.append("area already heavy today")

    return score, why

# ─────────────────────────────────────────
# Parse explore picks
# ─────────────────────────────────────────

def _parse_picks(raw: str) -> list[dict]:
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
    except (TypeError, ValueError):
        return []
    if not isinstance(parsed, list):
        return []
    out = []
    for item in parsed[:20]:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or "").strip()
        if not name:
            continue
        out.append({
            "id":          str(item.get("id") or name),
            "category":    str(item.get("category") or "pick").strip().lower(),
            "markerType":  str(item.get("markerType") or ""),
            "name":        name,
            "detail":      str(item.get("detail") or "").strip(),
            "officialUrl": str(item.get("officialUrl") or ""),
            "lat":         item.get("lat"),
            "lng":         item.get("lng"),
        })
    return out

# ─────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────

def _meal_label(time_str: str) -> str:
    try:
        h = int(time_str.split(":")[0])
    except (ValueError, AttributeError):
        return "Meal"
    return "Breakfast" if h < 11 else "Lunch" if h < 16 else "Dinner"

def _day_label(d: int, is_match_day: bool, match_info: dict) -> str:
    if is_match_day:
        return f"Day 3 · Match Day — {match_info['label']}"
    return DAY_LABELS[d] if d < len(DAY_LABELS) else f"Day {d + 1}"

def _match_day_template(match_info: dict) -> list[dict]:
    try:
        kickoff_hour = int(str(match_info.get("time", "")).split(":", 1)[0])
    except (TypeError, ValueError):
        kickoff_hour = 18
    return NOON_MATCH_DAY_TEMPLATE if kickoff_hour <= 13 else MATCH_DAY_TEMPLATE

# ─────────────────────────────────────────
# Main entry point
# ─────────────────────────────────────────

def build_itinerary(
    traveler:   str,
    budget:     str,
    days:       int,
    match_dt:   str,
    vibe:       str,
    picks_raw:  str,
    variant:    int = 0,
) -> dict:
    """
    Two-phase itinerary builder.

    variant  integer seed offset so the same params can produce different
             schedules without losing reproducibility (0 = default).
    """
    explore_picks = _parse_picks(picks_raw)
    match_info    = MATCH_INFO.get(match_dt, MATCH_INFO["jun12"])
    type_cats     = TYPE_CATS.get(traveler) or TYPE_CATS["solo"]
    vibe_cats     = VIBE_CATS.get(vibe, set())

    seed = int(hashlib.sha256(
        f"{traveler}|{budget}|{match_dt}|{vibe}|{variant}".encode()
    ).hexdigest()[:8], 16)
    rng = random.Random(seed)

    # ── Fetch data ─────────────────────────────────────────────────────
    events      = queries.get_events_by_categories(list(type_cats))
    vibe_evts   = queries.get_events_by_categories(list(vibe_cats)) if vibe_cats else []
    hotels      = queries.recommend_hotels_for_budget(HOTEL_BAND.get(budget, "200+"))
    restaurants = queries.recommend_restaurants_for_budget(REST_PRICE.get(budget, ["$30-50"]))

    # Deduplicate: vibe events that overlap with type events go only into vibe pool
    type_ids  = {e["event_id"] for e in events}
    vibe_evts = [e for e in vibe_evts if e["event_id"] not in type_ids]

    rng.shuffle(events)
    rng.shuffle(vibe_evts)
    rng.shuffle(restaurants)

    # ── Hotel / anchor area ────────────────────────────────────────────
    picked_hotels = [p for p in explore_picks if p["category"] == "hotels"]
    if picked_hotels:
        hotel_area = _area_key(picked_hotels[0].get("detail", "").split("·")[0].strip())
    elif hotels:
        hotel_area = _area_key(hotels[0].get("region", ""))
    else:
        hotel_area = ""

    ctx = {
        "traveler":   traveler,
        "budget":     budget,
        "type_cats":  type_cats,
        "vibe_cats":  vibe_cats,
        "hotel_area": hotel_area,
        "vibe":       vibe,
    }

    # ── Phase A: build candidate pools ────────────────────────────────
    activity_picks = [p for p in explore_picks if p["category"] != "hotels"]
    pick_pool      = [_pick_candidate(p) for p in activity_picks]   # shrinks as picks are consumed
    event_pool     = [_event_candidate(e) for e in events + vibe_evts]
    rest_pool      = [_rest_candidate(r) for r in restaurants]

    # ── Phase B: day-by-day selection ─────────────────────────────────
    global_used_ids   = set()           # event item_ids used on any prior day
    global_cat_counts = defaultdict(int)  # cat_label → count across all days

    result_days = []

    for d in range(days):
        is_match_day = (d == 2 and days >= 3)
        template     = _match_day_template(match_info) if is_match_day else NORMAL_DAY_TEMPLATE
        label        = _day_label(d, is_match_day, match_info)

        # Day anchor: match day → near stadium; otherwise first pick's area or hotel
        if is_match_day:
            day_anchor = STADIUM_AREA
        elif pick_pool:
            day_anchor = pick_pool[0]["area"] or hotel_area
        else:
            day_anchor = hotel_area

        day_used_cats  = set()
        day_used_rest  = set()
        day_area_count: dict[str, int] = defaultdict(int)
        day_picks_used = 0

        activities = []

        for slot in template:
            # ── Fixed match slot ────────────────────────────────────
            if slot["type"] == "match":
                activities.append({
                    "time":   match_info["time"],
                    "title":  "⚽ MATCH AT SOFI STADIUM",
                    "desc":   f"{match_info['label']} · 1001 S. Stadium Drive, Inglewood · Kickoff!",
                    "source": "match",
                    "reason": ["scheduled match"],
                })
                continue

            is_rest_slot = slot["type"] == "restaurant"

            # ── Build candidate list for this slot ──────────────────
            if is_rest_slot:
                rest_picks = [c for c in pick_pool if c["cat_label"] in ("restaurants", "restaurant")]
                candidates = rest_picks + rest_pool
            else:
                evt_picks  = [c for c in pick_pool if c["cat_label"] not in ("restaurants", "restaurant", "hotels")]
                candidates = evt_picks + event_pool

            # ── Score every candidate ───────────────────────────────
            scored: list[tuple[float, list[str], dict]] = []
            for c in candidates:
                s, why = _score_candidate(
                    c, slot,
                    day_used_cats, day_used_rest, day_area_count, day_picks_used,
                    day_anchor, global_used_ids, global_cat_counts, ctx,
                )
                scored.append((s + rng.random() * 0.5, why, c))  # tiny jitter for tie-breaking

            scored.sort(key=lambda x: x[0], reverse=True)

            # ── Tiered selection ────────────────────────────────────
            # Tier 1: score ≥ 0            (good match on all dimensions)
            # Tier 2: score ≥ -50          (minor mismatches)
            # Tier 3: score > -500         (at least no hard constraint violated)
            # Fallback: best available     (something rather than nothing)
            chosen: dict | None = None
            chosen_why: list[str] = []
            for tier_threshold in (0, -50, -500):
                for s, why, c in scored:
                    if s >= tier_threshold:
                        chosen = c
                        chosen_why = why
                        break
                if chosen:
                    break
            if chosen is None and scored:
                chosen     = scored[0][2]
                chosen_why = ["fallback - best available"]

            if chosen is None:
                continue

            # ── Build activity object ───────────────────────────────
            time_str = slot["time"]
            title    = f"{_meal_label(time_str)} at {chosen['title']}" if is_rest_slot else chosen["title"]
            act: dict = {
                "time":   time_str,
                "title":  title,
                "desc":   chosen["desc"],
                "source": chosen["source"],
                "id":     chosen["item_id"],
                "reason": chosen_why,
            }
            if chosen.get("lat") is not None:
                act["lat"] = chosen["lat"]
                act["lng"] = chosen["lng"]

            activities.append(act)

            # ── Update state ────────────────────────────────────────
            if is_rest_slot:
                day_used_rest.add(chosen["item_id"])
            else:
                day_used_cats.add(chosen["cat_label"])
                if not chosen["is_pick"]:
                    global_used_ids.add(chosen["item_id"])
                    global_cat_counts[chosen["cat_label"]] += 1

            if chosen["area"]:
                day_area_count[chosen["area"]] += 1
                if not day_anchor:
                    day_anchor = chosen["area"]   # first activity anchors the day

            if chosen["is_pick"]:
                day_picks_used += 1
                if chosen in pick_pool:
                    pick_pool.remove(chosen)

        result_days.append({"day_num": d + 1, "label": label, "activities": activities})

    # ── Hotel for response ─────────────────────────────────────────────
    picked_hotel = None
    if picked_hotels:
        first = picked_hotels[0]
        parts = [p.strip() for p in first.get("detail", "").split("·") if p.strip()]
        picked_hotel = {
            "hotel_name":  first["name"],
            "region":      parts[0] if parts else "Explore LA pick",
            "star_rating": "",
            "price_band":  parts[1] if len(parts) > 1 else "Selected",
        }

    return {
        "days":         result_days,
        "hotel":        picked_hotel or (hotels[0] if hotels else None),
        "match":        match_info,
        "budget_label": budget,
        "traveler":     traveler,
        "picks_used":   explore_picks,
        "variant":      variant,
    }
