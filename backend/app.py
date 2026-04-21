import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
import queries
from services.itinerary import build_itinerary

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

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
    limit  = request.args.get("limit",  500, type=int)
    offset = request.args.get("offset", 0,   type=int)
    search = request.args.get("search")
    return jsonify(queries.get_all_players(limit=limit, offset=offset, search=search))

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
    return jsonify(queries.get_hotels_by_price_band(price_band))


# ─────────────────────────────────────────
# Restaurants
# ─────────────────────────────────────────

@app.route("/api/restaurants")
def restaurants():
    limit  = request.args.get("limit",  500, type=int)
    offset = request.args.get("offset", 0,   type=int)
    search = request.args.get("search")
    region = request.args.get("region")
    return jsonify(queries.get_all_restaurants(limit=limit, offset=offset, search=search, region=region))

@app.route("/api/restaurants/flavor/<flavor>")
def restaurants_by_flavor(flavor):
    return jsonify(queries.get_restaurants_by_flavor(flavor))


# ─────────────────────────────────────────
# Events
# ─────────────────────────────────────────

@app.route("/api/events")
def events():
    limit  = request.args.get("limit",  500, type=int)
    offset = request.args.get("offset", 0,   type=int)
    search = request.args.get("search")
    area   = request.args.get("area")
    return jsonify(queries.get_all_events(limit=limit, offset=offset, search=search, area=area))

@app.route("/api/events/category/<category>")
def events_by_category(category):
    return jsonify(queries.get_events_by_category(category))

@app.route("/api/events/<event_id>")
def event_detail(event_id):
    return jsonify(queries.get_event_detail(event_id))


# ─────────────────────────────────────────
# Journey
# ─────────────────────────────────────────

@app.route("/api/itinerary")
def itinerary():
    traveler = request.args.get("type", "football")
    budget   = request.args.get("budget", "mid")
    try:
        days = int(request.args.get("days", 3))
    except (TypeError, ValueError):
        days = 3
    days     = min(max(days, 1), 7)
    match_dt = request.args.get("match_date", "jun12")
    vibe     = request.args.get("vibe", "culture")
    picks_raw = request.args.get("picks")

    try:
        result = build_itinerary(traveler, budget, days, match_dt, vibe, picks_raw)
    except Exception:
        app.logger.exception("Could not build journey")
        return jsonify({"error": "Could not build journey"}), 500

    return jsonify(result)


# ─────────────────────────────────────────
# Run
# ─────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5001)
