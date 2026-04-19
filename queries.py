import psycopg2
import psycopg2.extras

# ─────────────────────────────────────────
# Database Connection
# ─────────────────────────────────────────
def get_connection():
    return psycopg2.connect(
        host="db-postgresql-nyc1-44203-do-user-8018943-0.b.db.ondigitalocean.com",
        port=25060,
        dbname="wc1",
        user="team1",
        password="AVNS_bOAJIRjLfR2RbWztITa",
        sslmode="require"
    )

def query(sql, params=None):
    """Execute a query and return a list of dicts."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(sql, params or [])
    results = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in results]


# ─────────────────────────────────────────
# 1. Matches
# ─────────────────────────────────────────

def get_all_matches():
    """Return all matches ordered by date."""
    return query("""
        SELECT match_number, date, day_of_week, time_pt,
               team1, team2, "group", stage, venue
        FROM fact_match
        ORDER BY date, time_pt
    """)

def get_match_by_id(match_number):
    """Return a single match by match number."""
    return query("""
        SELECT match_number, date, day_of_week, time_pt,
               team1, team2, "group", stage, venue, venue_address, notes
        FROM fact_match
        WHERE match_number = %s
    """, [match_number])


# ─────────────────────────────────────────
# 2. Tickets
# ─────────────────────────────────────────

def get_tickets_by_match(match_number):
    """Return all ticket options for a given match."""
    return query("""
        SELECT ticket_id, seating_section, section_level,
               ticket_category, price_usd, ticket_status, matchup
        FROM fact_ticket
        WHERE match_number = %s
        ORDER BY price_usd
    """, [match_number])

def get_all_tickets():
    """Return all ticket options."""
    return query("""
        SELECT ticket_id, match_number, matchup,
               match_date, seating_section, section_level,
               ticket_category, price_usd, ticket_status
        FROM fact_ticket
        ORDER BY match_date, price_usd
    """)


# ─────────────────────────────────────────
# 3. Teams
# ─────────────────────────────────────────

def get_all_teams():
    """Return all teams playing in LA."""
    return query("""
        SELECT team_id, country, federation, status,
               group_stage, matches_in_la
        FROM dim_team
        ORDER BY group_stage, country
    """)

def get_team_by_country(country):
    """Return a single team by country name."""
    return query("""
        SELECT team_id, country, federation, status,
               possible_teams, group_stage, matches_in_la, notes
        FROM dim_team
        WHERE country = %s
    """, [country])


# ─────────────────────────────────────────
# 4. Players
# ─────────────────────────────────────────

def get_all_players():
    """Return all players."""
    return query("""
        SELECT player_id, player_name, team, position,
               club, age, caps, goals, is_star
        FROM dim_player
        ORDER BY team, is_star DESC
    """)

def get_players_by_team(team_country):
    """Return all players for a given team."""
    return query("""
        SELECT player_id, player_name, position,
               club, age, caps, goals, is_star, notes
        FROM dim_player
        WHERE team = %s
        ORDER BY is_star DESC, goals DESC
    """, [team_country])

def get_star_players():
    """Return only star players."""
    return query("""
        SELECT player_id, player_name, team, position,
               club, age, caps, goals
        FROM dim_player
        WHERE is_star = TRUE
        ORDER BY goals DESC
    """)


# ─────────────────────────────────────────
# 5. FIFA Rankings
# ─────────────────────────────────────────

def get_all_rankings():
    """Return FIFA rankings for all LA teams."""
    return query("""
        SELECT ranking_id, rank, country,
               total_points, previous_rank, rank_change,
               confederation
        FROM fact_ranking
        ORDER BY rank
    """)


# ─────────────────────────────────────────
# 6. Hotels
# ─────────────────────────────────────────

def get_all_hotels():
    """Return all hotels ordered by star rating."""
    return query("""
        SELECT hotel_id, hotel_name, region, address,
               star_rating, price_band, latitude, longitude,
               google_reviews_count
        FROM fact_hotel
        ORDER BY star_rating DESC
    """)

def get_hotels_by_region(region):
    """Return hotels filtered by region."""
    return query("""
        SELECT hotel_id, hotel_name, region, address,
               star_rating, price_band, latitude, longitude
        FROM fact_hotel
        WHERE region ILIKE %s
        ORDER BY star_rating DESC
    """, [f"%{region}%"])

def get_hotels_by_price(price_band):
    """Return hotels filtered by price band."""
    return query("""
        SELECT hotel_id, hotel_name, region, address,
               star_rating, price_band, latitude, longitude
        FROM fact_hotel
        WHERE price_band = %s
        ORDER BY star_rating DESC
    """, [price_band])


# ─────────────────────────────────────────
# 7. Restaurants
# ─────────────────────────────────────────

def get_all_restaurants():
    """Return all restaurants ordered by review score."""
    return query("""
        SELECT restaurant_id, restaurant_name, region,
               address, price_range, flavor,
               google_review_score, review_count, disability_access
        FROM fact_restaurant
        ORDER BY google_review_score DESC
    """)

def get_restaurants_by_flavor(flavor):
    """Return restaurants filtered by cuisine type."""
    return query("""
        SELECT restaurant_id, restaurant_name, region,
               address, price_range, flavor, google_review_score
        FROM fact_restaurant
        WHERE flavor ILIKE %s
        ORDER BY google_review_score DESC
    """, [f"%{flavor}%"])


# ─────────────────────────────────────────
# 8. Events
# ─────────────────────────────────────────

def get_all_events():
    """Return all events with category label."""
    return query("""
        SELECT e.event_id, e.event_name, e.category,
               e.event_type, e.venue_name, e.area, e.city,
               e.start_date, e.end_date, e.event_time,
               e.detail_type, c.category AS category_label
        FROM fact_event e
        LEFT JOIN dim_event_category c
               ON e.event_category_id = c.event_category_id
        ORDER BY e.start_date
    """)

def get_events_by_category(category):
    """Return events filtered by category."""
    return query("""
        SELECT e.event_id, e.event_name, e.category,
               e.venue_name, e.area, e.city,
               e.start_date, e.end_date, e.event_time
        FROM fact_event e
        WHERE e.category ILIKE %s
        ORDER BY e.start_date
    """, [f"%{category}%"])

def get_event_detail(event_id):
    """Return full event detail including experience or sports sub-detail."""
    base = query("""
        SELECT e.*, c.category AS category_label
        FROM fact_event e
        LEFT JOIN dim_event_category c
               ON e.event_category_id = c.event_category_id
        WHERE e.event_id = %s
    """, [event_id])

    if not base:
        return None

    event = base[0]

    exp = query("SELECT * FROM event_experience_detail WHERE event_id = %s", [event_id])
    if exp:
        event["experience_detail"] = exp[0]

    spt = query("SELECT * FROM event_sports_detail WHERE event_id = %s", [event_id])
    if spt:
        event["sports_detail"] = spt[0]

    return event


# ─────────────────────────────────────────
# 9. Transport Routes
# ─────────────────────────────────────────

def get_all_routes():
    """Return all airport-to-SoFi transport routes."""
    return query("""
        SELECT r.route_id,
               o.name AS origin_name, o.city AS origin_city,
               d.name AS dest_name, d.city AS dest_city,
               m.mode_name, m.mode_group, m.includes,
               r.duration_min, r.cost_low_usd, r.cost_high_usd
        FROM fact_route r
        JOIN dim_place o ON r.origin_place_id = o.place_id
        JOIN dim_place d ON r.dest_place_id = d.place_id
        JOIN dim_mode  m ON r.mode_id = m.mode_id
        ORDER BY r.duration_min
    """)


# ─────────────────────────────────────────
# 10. Map Data
# ─────────────────────────────────────────

def get_map_data():
    """Return all geo coordinates for Leaflet.js map pins."""
    hotels = query("""
        SELECT hotel_id AS id, hotel_name AS name,
               'hotel' AS type, region,
               latitude AS lat, longitude AS lon,
               star_rating, price_band
        FROM fact_hotel
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    """)

    places = query("""
        SELECT place_id AS id, name, place_type AS type,
               city AS region, lat, lon
        FROM dim_place
        WHERE lat IS NOT NULL AND lon IS NOT NULL
    """)

    return {
        "hotels": hotels,
        "places": places
    }


# ─────────────────────────────────────────
# Test (run this file directly to verify)
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("── Matches ──")
    matches = get_all_matches()
    for m in matches:
        print(f"  {m['match_number']} | {m['date']} | {m['team1']} vs {m['team2']}")

    print("\n── Star Players ──")
    stars = get_star_players()
    for p in stars:
        print(f"  {p['player_name']} ({p['team']}) - {p['goals']} goals")

    print("\n── Hotels ──")
    hotels = get_all_hotels()
    for h in hotels[:3]:
        print(f"  {h['hotel_name']} | {h['region']} | {h['price_band']}")

    print("\n── Transport Routes ──")
    routes = get_all_routes()
    for r in routes:
        print(f"  {r['origin_name']} -> {r['dest_name']} | {r['mode_name']} | {r['duration_min']}min | ${r['cost_low_usd']}-{r['cost_high_usd']}")

    print("\nAll queries tested successfully!")
