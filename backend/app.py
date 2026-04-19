from flask import Flask, jsonify
from flask_cors import CORS
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
# Run
# ─────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
