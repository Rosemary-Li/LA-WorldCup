from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import queries

app = Flask(__name__)
CORS(app)  # Allow frontend to call this API


# ─────────────────────────────────────────
# Matches
# ─────────────────────────────────────────

@app.route("/api/matches")
def matches():
    return jsonify(queries.get_all_matches())

@app.route("/api/matches/<match_number>")
def match_detail(match_number):
    return jsonify(queries.get_match_by_id(match_number))


# ─────────────────────────────────────────
# Tickets
# ─────────────────────────────────────────

@app.route("/api/tickets")
def tickets():
    return jsonify(queries.get_all_tickets())

@app.route("/api/tickets/<match_number>")
def tickets_by_match(match_number):
    return jsonify(queries.get_tickets_by_match(match_number))


# ─────────────────────────────────────────
# Teams
# ─────────────────────────────────────────

@app.route("/api/teams")
def teams():
    return jsonify(queries.get_all_teams())

@app.route("/api/teams/<country>")
def team_detail(country):
    return jsonify(queries.get_team_by_country(country))


# ─────────────────────────────────────────
# Players
# ─────────────────────────────────────────

@app.route("/api/players")
def players():
    return jsonify(queries.get_all_players())

@app.route("/api/players/stars")
def star_players():
    return jsonify(queries.get_star_players())

@app.route("/api/players/<team_country>")
def players_by_team(team_country):
    return jsonify(queries.get_players_by_team(team_country))


# ─────────────────────────────────────────
# Rankings
# ─────────────────────────────────────────

@app.route("/api/rankings")
def rankings():
    return jsonify(queries.get_all_rankings())


# ─────────────────────────────────────────
# Hotels
# ─────────────────────────────────────────

@app.route("/api/hotels")
def hotels():
    return jsonify(queries.get_all_hotels())

@app.route("/api/hotels/region/<region>")
def hotels_by_region(region):
    return jsonify(queries.get_hotels_by_region(region))

@app.route("/api/hotels/price/<price_band>")
def hotels_by_price(price_band):
    return jsonify(queries.get_hotels_by_price(price_band))


# ─────────────────────────────────────────
# Restaurants
# ─────────────────────────────────────────

@app.route("/api/restaurants")
def restaurants():
    return jsonify(queries.get_all_restaurants())

@app.route("/api/restaurants/flavor/<flavor>")
def restaurants_by_flavor(flavor):
    return jsonify(queries.get_restaurants_by_flavor(flavor))


# ─────────────────────────────────────────
# Events
# ─────────────────────────────────────────

@app.route("/api/events")
def events():
    return jsonify(queries.get_all_events())

@app.route("/api/events/category/<category>")
def events_by_category(category):
    return jsonify(queries.get_events_by_category(category))

@app.route("/api/events/<event_id>")
def event_detail(event_id):
    return jsonify(queries.get_event_detail(event_id))


# ─────────────────────────────────────────
# Transport Routes
# ─────────────────────────────────────────

@app.route("/api/routes")
def routes():
    return jsonify(queries.get_all_routes())


# ─────────────────────────────────────────
# Map Data
# ─────────────────────────────────────────

@app.route("/api/map-data")
def map_data():
    return jsonify(queries.get_map_data())


# ─────────────────────────────────────────
# Itinerary
# ─────────────────────────────────────────

# Maps traveler type → dim_event_category IDs
_TYPE_CATS = {
    "football":   [1, 2, 3, 8, 10, 11],   # Fan Festival, Fan Zone, Official, Fan Community, Bar/Party, Meetup
    "family":     [4, 6, 7, 14, 16, 17, 19],  # Community, MLS, Special, Cinema, Coastal, Urban, Culture
    "backpacker": [14, 16, 17, 19, 21, 4],    # Cinema, Coastal, Urban, Culture, Nature, Community
    "luxury":     [5, 7, 12, 13, 18, 19, 20], # Club, Special, Music, Comedy, Entertainment, Culture, Commercial
}
_VIBE_CATS = {
    "culture":   [17, 19, 4],
    "beach":     [16, 21],
    "nightlife": [5, 10, 12, 13, 15],
    "film":      [7, 18, 20],
}
_HOTEL_BAND = {"budget": "100+", "mid": "200+", "luxury": "400+"}
_REST_PRICE  = {
    "budget": ["$10-20", "$20-30"],
    "mid":    ["$30-50"],
    "luxury": ["$50-100", "$100+"],
}
_MATCH_INFO = {
    "jun12": {"date": "June 12", "time": "18:00", "label": "USA vs Paraguay (M4)"},
    "jun15": {"date": "June 15", "time": "18:00", "label": "Iran vs New Zealand (M15)"},
    "jun18": {"date": "June 18", "time": "12:00", "label": "Switzerland vs UEFA Playoff A (M26)"},
    "jun21": {"date": "June 21", "time": "12:00", "label": "Belgium vs Iran (M39)"},
    "jun25": {"date": "June 25", "time": "19:00", "label": "UEFA Playoff C vs USA (M59)"},
    "jun28": {"date": "June 28", "time": "12:00", "label": "Round of 32 (M73)"},
    "jul2":  {"date": "July 2",  "time": "12:00", "label": "Round of 32 (M84)"},
    "jul10": {"date": "July 10", "time": "12:00", "label": "Quarter-Finals (M98)"},
}
_DAY_SLOTS  = ["09:30", "12:30", "15:00", "18:00", "20:30"]
_DAY_LABELS = [
    "Day 1 · Arrival & First Impressions",
    "Day 2 · The Beautiful Game",
    "Day 3 · Match Day",
    "Day 4 · Explore LA",
    "Day 5 · Hollywood & Beyond",
    "Day 6 · LA Beaches",
    "Day 7 · Final Day",
]

def _event_to_activity(evt, time_slot):
    parts = [p for p in [evt.get("venue_name"), evt.get("area") or evt.get("city")] if p]
    ticket = evt.get("ticket_price") or evt.get("admission_info")
    if ticket:
        parts.append(str(ticket))
    return {
        "time":   time_slot,
        "title":  evt["event_name"],
        "desc":   " · ".join(parts),
        "source": "event",
        "id":     evt["event_id"],
    }

def _rest_to_activity(rest, time_slot):
    score = f"⭐ {rest['google_review_score']}" if rest.get("google_review_score") else ""
    parts = [p for p in [rest.get("region"), rest.get("flavor"), rest.get("price_range"), score] if p]
    return {
        "time":   time_slot,
        "title":  f"Dinner at {rest['restaurant_name']}",
        "desc":   " · ".join(parts),
        "source": "restaurant",
        "id":     rest["restaurant_id"],
    }

@app.route("/api/itinerary")
def itinerary():
    traveler = request.args.get("type", "football")
    budget   = request.args.get("budget", "mid")
    days     = min(max(int(request.args.get("days", 3)), 1), 7)
    match_dt = request.args.get("match_date", "jun12")
    vibe     = request.args.get("vibe", "culture")

    type_cats = _TYPE_CATS.get(traveler, _TYPE_CATS["football"])
    vibe_cats = _VIBE_CATS.get(vibe, [])

    events       = queries.get_events_by_categories(type_cats)
    vibe_events  = queries.get_events_by_categories(vibe_cats) if vibe_cats else []
    hotels       = queries.get_hotel_for_budget(_HOTEL_BAND.get(budget, "200+"))
    restaurants  = queries.get_restaurants_for_budget(_REST_PRICE.get(budget, ["$30-50"]))

    # Deduplicate: vibe events that also appear in type events stay only in vibe pool
    type_ids = {e["event_id"] for e in events}
    vibe_events = [e for e in vibe_events if e["event_id"] not in type_ids]

    # Reproducible shuffle keyed to inputs so same params → same itinerary
    seed = hash((traveler, budget, match_dt, vibe)) % (2 ** 32)
    rng = random.Random(seed)
    rng.shuffle(events)
    rng.shuffle(vibe_events)
    rng.shuffle(restaurants)

    match_info = _MATCH_INFO.get(match_dt, _MATCH_INFO["jun12"])
    match_activity = {
        "time":   match_info["time"],
        "title":  "⚽ MATCH AT SOFI STADIUM",
        "desc":   f"{match_info['label']} · 1001 S. Stadium Drive, Inglewood · Kickoff!",
        "source": "match",
    }

    evt_idx  = 0
    rest_idx = 0
    result_days = []

    for d in range(days):
        is_match_day = (d == 2 and days >= 3)
        label = _DAY_LABELS[d] if d < len(_DAY_LABELS) else f"Day {d + 1}"
        if is_match_day:
            label = f"Day 3 · Match Day — {match_info['label']}"

        activities = []

        if is_match_day:
            # 2 morning activities then the match
            for slot in range(2):
                evt = events[evt_idx % len(events)]
                evt_idx += 1
                activities.append(_event_to_activity(evt, _DAY_SLOTS[slot]))
            activities.append(match_activity)

        elif d == 0:
            # Day 1: 3 type events, 1 restaurant dinner, 1 vibe event at end
            for slot in range(3):
                evt = events[evt_idx % len(events)]
                evt_idx += 1
                activities.append(_event_to_activity(evt, _DAY_SLOTS[slot]))
            if restaurants:
                activities.append(_rest_to_activity(restaurants[rest_idx % len(restaurants)], _DAY_SLOTS[3]))
                rest_idx += 1
            if vibe_events:
                vibe_time = "22:00" if vibe == "nightlife" else _DAY_SLOTS[4]
                activities.append(_event_to_activity(vibe_events[0], vibe_time))

        else:
            # Regular days: 3 type events, 1 vibe activity, 1 restaurant dinner
            for slot in range(3):
                evt = events[evt_idx % len(events)]
                evt_idx += 1
                activities.append(_event_to_activity(evt, _DAY_SLOTS[slot]))
            if vibe_events:
                vi = (d - 1) % len(vibe_events)
                activities.append(_event_to_activity(vibe_events[vi], _DAY_SLOTS[3]))
            if restaurants:
                activities.append(_rest_to_activity(restaurants[rest_idx % len(restaurants)], _DAY_SLOTS[4]))
                rest_idx += 1

        result_days.append({"day_num": d + 1, "label": label, "activities": activities})

    return jsonify({
        "days":        result_days,
        "hotel":       hotels[0] if hotels else None,
        "match":       match_info,
        "budget_label": budget,
        "traveler":    traveler,
    })


# ─────────────────────────────────────────
# Run
# ─────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
