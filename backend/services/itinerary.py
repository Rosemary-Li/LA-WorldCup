import hashlib
import json
import random
from collections import deque
from pathlib import Path

import queries

_CONFIG_DIR = Path(__file__).parent.parent / "config"

with open(_CONFIG_DIR / "matches.json") as f:
    MATCH_INFO: dict = json.load(f)

with open(_CONFIG_DIR / "areas.json") as f:
    AREA_COORDS: dict = json.load(f)

TYPE_CATS = {
    "football":   [1, 2, 3, 8, 10, 11],
    "family":     [4, 6, 7, 14, 16, 17, 19],
    "backpacker": [14, 16, 17, 19, 21, 4],
    "luxury":     [5, 7, 12, 13, 18, 19, 20],
}
VIBE_CATS = {
    "culture":   [17, 19, 4],
    "beach":     [16, 21],
    "nightlife": [5, 10, 12, 13, 15],
    "film":      [7, 18, 20],
}
HOTEL_BAND = {"budget": "100+", "mid": "200+", "luxury": "400+"}
REST_PRICE = {
    "budget": ["$10-20", "$20-30"],
    "mid":    ["$30-50"],
    "luxury": ["$50-100", "$100+"],
}

DAY_SLOTS  = ["09:30", "12:30", "15:00", "18:00", "20:30"]
DAY_LABELS = [
    "Day 1 · Arrival & First Impressions",
    "Day 2 · The Beautiful Game",
    "Day 3 · Match Day",
    "Day 4 · Explore LA",
    "Day 5 · Hollywood & Beyond",
    "Day 6 · LA Beaches",
    "Day 7 · Final Day",
]


def _area_latlon(area_str):
    if not area_str:
        return None, None
    key = str(area_str).strip().lower()
    for k, coords in AREA_COORDS.items():
        if k in key:
            return coords
    return None, None


def _meal_label(time_slot):
    try:
        hour = int(str(time_slot).split(":", 1)[0])
    except (TypeError, ValueError):
        return "Meal"
    if hour < 11:
        return "Breakfast"
    if hour < 16:
        return "Lunch"
    return "Dinner"


def _event_to_activity(evt, time_slot):
    parts = [p for p in [evt.get("venue_name"), evt.get("area") or evt.get("city")] if p]
    ticket = evt.get("ticket_price") or evt.get("admission_info")
    if ticket:
        parts.append(str(ticket))
    lat, lng = _area_latlon(evt.get("area") or evt.get("city"))
    act = {
        "time":   time_slot,
        "title":  evt["event_name"],
        "desc":   " · ".join(parts),
        "source": "event",
        "id":     evt["event_id"],
    }
    if lat is not None:
        act["lat"] = lat
        act["lng"] = lng
    return act


def _rest_to_activity(rest, time_slot):
    score = f"⭐ {rest['google_review_score']}" if rest.get("google_review_score") else ""
    parts = [p for p in [rest.get("region"), rest.get("flavor"), rest.get("price_range"), score] if p]
    lat, lng = _area_latlon(rest.get("region"))
    act = {
        "time":   time_slot,
        "title":  f"{_meal_label(time_slot)} at {rest['restaurant_name']}",
        "desc":   " · ".join(parts),
        "source": "restaurant",
        "id":     rest["restaurant_id"],
    }
    if lat is not None:
        act["lat"] = lat
        act["lng"] = lng
    return act


def _parse_explore_picks(raw):
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
    except (TypeError, ValueError):
        return []
    if not isinstance(parsed, list):
        return []
    picks = []
    for item in parsed[:20]:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or "").strip()
        if not name:
            continue
        picks.append({
            "id":          str(item.get("id") or name),
            "category":    str(item.get("category") or "pick").strip().lower(),
            "markerType":  str(item.get("markerType") or ""),
            "name":        name,
            "detail":      str(item.get("detail") or "").strip(),
            "officialUrl": str(item.get("officialUrl") or ""),
            "lat":         item.get("lat"),
            "lng":         item.get("lng"),
        })
    return picks


def _pick_to_activity(pick, time_slot):
    category = pick.get("category", "pick")
    prefix = {
        "restaurants": f"{_meal_label(time_slot)} at",
        "events":      "Fan event:",
        "shows":       "Show:",
        "attractions": "Visit",
    }.get(category, "Explore")
    act = {
        "time":   time_slot,
        "title":  f"{prefix} {pick['name']}",
        "desc":   pick.get("detail") or "Saved from Explore LA",
        "source": "explore_pick",
        "id":     pick.get("id"),
    }
    try:
        lat = float(pick.get("lat") or 0)
        lng = float(pick.get("lng") or 0)
        if lat and lng:
            act["lat"] = lat
            act["lng"] = lng
    except (TypeError, ValueError):
        pass
    return act


def build_itinerary(traveler, budget, days, match_dt, vibe, explore_picks_raw):
    type_cats = TYPE_CATS.get(traveler, TYPE_CATS["football"])
    vibe_cats = VIBE_CATS.get(vibe, [])

    events      = queries.get_events_by_categories(type_cats)
    vibe_events = queries.get_events_by_categories(vibe_cats) if vibe_cats else []
    hotels      = queries.recommend_hotels_for_budget(HOTEL_BAND.get(budget, "200+"))
    restaurants = queries.recommend_restaurants_for_budget(REST_PRICE.get(budget, ["$30-50"]))

    type_ids    = {e["event_id"] for e in events}
    vibe_events = [e for e in vibe_events if e["event_id"] not in type_ids]

    seed_src = f"{traveler}|{budget}|{match_dt}|{vibe}".encode("utf-8")
    seed     = int(hashlib.sha256(seed_src).hexdigest()[:8], 16)
    rng      = random.Random(seed)
    rng.shuffle(events)
    rng.shuffle(vibe_events)
    rng.shuffle(restaurants)

    explore_picks  = _parse_explore_picks(explore_picks_raw)
    picked_hotels  = [p for p in explore_picks if p["category"] == "hotels"]

    base_area = ""
    if picked_hotels:
        detail    = picked_hotels[0].get("detail", "")
        base_area = detail.split("·")[0].strip().lower()
    elif hotels:
        base_area = (hotels[0].get("region") or "").lower()

    if base_area:
        def _area_match(region_str):
            return base_area in (region_str or "").lower() or (region_str or "").lower() in base_area
        restaurants = sorted(restaurants, key=lambda r: 0 if _area_match(r.get("region")) else 1)
        events      = sorted(events,      key=lambda e: 0 if _area_match(e.get("area") or e.get("city")) else 1)
        vibe_events = sorted(vibe_events, key=lambda e: 0 if _area_match(e.get("area") or e.get("city")) else 1)

    picked_activities = [p for p in explore_picks if p["category"] in {"restaurants", "events", "shows", "attractions"}]

    match_info = MATCH_INFO.get(match_dt, MATCH_INFO["jun12"])
    match_activity = {
        "time":   match_info["time"],
        "title":  "⚽ MATCH AT SOFI STADIUM",
        "desc":   f"{match_info['label']} · 1001 S. Stadium Drive, Inglewood · Kickoff!",
        "source": "match",
    }

    evt_pool  = deque(events)
    vibe_pool = deque(vibe_events)
    rest_pool = deque(restaurants * 3)

    def _pick_event(pool, used_cats):
        for _ in range(len(pool)):
            evt = pool[0]
            cat = (evt.get("category_label") or evt.get("category") or "misc").strip().lower()
            pool.rotate(-1)
            if cat not in used_cats:
                used_cats.add(cat)
                return evt
        if pool:
            pool.rotate(-1)
            return pool[-1]
        return None

    def _next_rest():
        if rest_pool:
            r = rest_pool.popleft()
            rest_pool.append(r)
            return r
        return None

    pick_idx    = 0
    result_days = []

    for d in range(days):
        is_match_day = (d == 2 and days >= 3)
        label = _DAY_LABEL(d, is_match_day, match_info)
        activities = []
        used_cats  = set()

        while pick_idx < len(picked_activities) and len(activities) < 2:
            activities.append(_pick_to_activity(picked_activities[pick_idx], DAY_SLOTS[len(activities)]))
            pick_idx += 1

        if is_match_day:
            evt = _pick_event(evt_pool, used_cats)
            if evt:  activities.append(_event_to_activity(evt, "09:30"))
            rest = _next_rest()
            if rest: activities.append(_rest_to_activity(rest, "12:30"))
            activities.append(match_activity)
        else:
            evt = _pick_event(evt_pool, used_cats)
            if evt:  activities.append(_event_to_activity(evt, "09:30"))
            rest = _next_rest()
            if rest: activities.append(_rest_to_activity(rest, "12:30"))
            evt2 = _pick_event(evt_pool, used_cats)
            if evt2: activities.append(_event_to_activity(evt2, "15:00"))
            vibe_time = "21:00" if vibe == "nightlife" else "18:00"
            vibe_evt = _pick_event(vibe_pool, used_cats)
            if vibe_evt: activities.append(_event_to_activity(vibe_evt, vibe_time))
            rest2 = _next_rest()
            if rest2: activities.append(_rest_to_activity(rest2, "20:30"))

        result_days.append({"day_num": d + 1, "label": label, "activities": activities})

    picked_hotel = None
    if picked_hotels:
        first        = picked_hotels[0]
        detail_parts = [p.strip() for p in first.get("detail", "").split(" · ") if p.strip()]
        picked_hotel = {
            "hotel_name": first["name"],
            "region":     detail_parts[0] if detail_parts else "Explore LA pick",
            "star_rating": "",
            "price_band": detail_parts[1] if len(detail_parts) > 1 else "Selected",
        }

    return {
        "days":         result_days,
        "hotel":        picked_hotel or (hotels[0] if hotels else None),
        "match":        match_info,
        "budget_label": budget,
        "traveler":     traveler,
        "picks_used":   explore_picks,
    }


def _DAY_LABEL(d, is_match_day, match_info):
    if is_match_day:
        return f"Day 3 · Match Day — {match_info['label']}"
    if d < len(DAY_LABELS):
        return DAY_LABELS[d]
    return f"Day {d + 1}"
