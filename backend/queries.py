import json
import logging
import os
import secrets
import psycopg2
import psycopg2.extras
import psycopg2.pool
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

log = logging.getLogger(__name__)

LATEST_MATCH_OVERRIDES = {
    "M26": {
        "team2": "Bosnia and Herzegovina",
        "notes": "European Play-Off A winner confirmed as Bosnia and Herzegovina",
    },
    "M59": {
        "team1": "Türkiye",
        "time_pt": "19:00",
        "notes": "European Play-Off C winner confirmed as Türkiye",
    },
}

LATEST_TICKET_MATCHUPS = {
    "M26": "Switzerland vs Bosnia and Herzegovina",
    "M59": "Türkiye vs USA",
}

LATEST_TEAM_RENAMES = {
    "UEFA Playoff A Winner": {
        "country": "Bosnia and Herzegovina",
        "status": "Scheduled in LA",
        "possible_teams": "-",
        "notes": "European Play-Off A winner - Group B",
        "last_verified": "2026-03-31",
        "update_after_playoff": "No",
    },
    "UEFA Playoff C Winner": {
        "country": "Türkiye",
        "status": "Scheduled in LA",
        "possible_teams": "-",
        "notes": "European Play-Off C winner - Group D",
        "last_verified": "2026-03-31",
        "update_after_playoff": "No",
    },
}


def _with_latest_match_data(rows):
    updated = []
    for row in rows:
        item = dict(row)
        item.update(LATEST_MATCH_OVERRIDES.get(item.get("match_number"), {}))
        updated.append(item)
    return updated


def _with_latest_ticket_data(rows):
    updated = []
    for row in rows:
        item = dict(row)
        matchup = LATEST_TICKET_MATCHUPS.get(item.get("match_number"))
        if matchup:
            item["matchup"] = matchup
            if "match_info" in item:
                match_num = str(item.get("match_number", "")).replace("M", "")
                item["match_info"] = f"Match {match_num}: {matchup}"
            if item.get("match_number") == "M59" and "match_time" in item:
                item["match_time"] = "19:00:00"
        updated.append(item)
    return updated


def _with_latest_team_data(rows):
    teams = []
    seen = set()
    for row in rows:
        item = dict(row)
        item.update(LATEST_TEAM_RENAMES.get(item.get("country"), {}))
        country = item.get("country")
        if country in seen:
            continue
        seen.add(country)
        teams.append(item)
    return teams

# ─────────────────────────────────────────
# Connection Pool (lazy-initialized)
# ─────────────────────────────────────────
_pool = None

def _get_pool():
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=2,
            maxconn=10,
            host=os.getenv("DB_HOST"),
            port=int(os.getenv("DB_PORT", 5432)),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            sslmode=os.getenv("DB_SSLMODE", "require"),
        )
    return _pool

@contextmanager
def _conn():
    """Borrow a connection from the pool; rollback and return it on error."""
    pool = _get_pool()
    conn = pool.getconn()
    try:
        yield conn
    except psycopg2.Error:
        conn.rollback()  # reset broken transaction before returning to pool
        raise
    finally:
        pool.putconn(conn)

def query(sql, params=None, conn=None):
    """Execute a query and return a list of dicts.

    Pass conn= to reuse an existing connection (avoids extra round-trips
    in functions that run multiple queries, e.g. get_event_detail).
    Raises psycopg2.Error on DB failure — callers can catch if needed.
    """
    def _run(c):
        with c.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            try:
                cur.execute(sql, params or [])
                return [dict(r) for r in cur.fetchall()]
            except psycopg2.Error as exc:
                log.error("Query failed: %s | params=%s | error=%s", sql.strip(), params, exc)
                raise

    if conn is not None:
        return _run(conn)
    with _conn() as c:
        return _run(c)


# ─────────────────────────────────────────
# 1. Matches
# ─────────────────────────────────────────

def get_all_matches():
    """Return all matches ordered by date."""
    return _with_latest_match_data(query("""
        SELECT match_number, date, day_of_week, time_pt,
               team1, team2, "group", stage, venue
        FROM fact_match
        ORDER BY date, time_pt
    """))

def get_match_by_id(match_number):
    """Return a single match by match number."""
    return _with_latest_match_data(query("""
        SELECT match_number, date, day_of_week, time_pt,
               team1, team2, "group", stage, venue, venue_address, notes
        FROM fact_match
        WHERE match_number = %s
    """, [match_number]))


# ─────────────────────────────────────────
# 2. Tickets
# ─────────────────────────────────────────

def get_tickets_by_match(match_number):
    """Return all ticket options for a given match."""
    return _with_latest_ticket_data(query("""
        SELECT ticket_id, match_number, seating_section, section_level,
               ticket_category, price_usd, ticket_status, matchup
        FROM fact_ticket
        WHERE match_number = %s
        ORDER BY price_usd
    """, [match_number]))

def get_all_tickets():
    """Return all ticket options."""
    return _with_latest_ticket_data(query("""
        SELECT ticket_id, match_number, matchup,
               match_date, seating_section, section_level,
               ticket_category, price_usd, ticket_status
        FROM fact_ticket
        ORDER BY match_date, price_usd
    """))


# ─────────────────────────────────────────
# 3. Teams
# ─────────────────────────────────────────

def get_all_teams():
    """Return all teams playing in LA."""
    return _with_latest_team_data(query("""
        SELECT team_id, country, federation, status,
               group_stage, matches_in_la
        FROM dim_team
        ORDER BY group_stage, country
    """))

def get_team_by_country(country):
    """Return a single team by country name."""
    rows = _with_latest_team_data(query("""
        SELECT team_id, country, federation, status,
               possible_teams, group_stage, matches_in_la, notes
        FROM dim_team
        WHERE country = %s
    """, [country]))
    if rows:
        return rows

    old_country = next((old for old, new in LATEST_TEAM_RENAMES.items() if new["country"] == country), None)
    if not old_country:
        return []
    return _with_latest_team_data(query("""
        SELECT team_id, country, federation, status,
               possible_teams, group_stage, matches_in_la, notes
        FROM dim_team
        WHERE country = %s
    """, [old_country]))


# ─────────────────────────────────────────
# 4. Players
# ─────────────────────────────────────────

def get_all_players(limit=500, offset=0, search=None):
    """Return players with optional name/team search and pagination."""
    if search:
        return query("""
            SELECT player_id, player_name, team, position,
                   club, age, caps, goals, is_star
            FROM dim_player
            WHERE player_name ILIKE %s OR team ILIKE %s
            ORDER BY team, is_star DESC
            LIMIT %s OFFSET %s
        """, [f"%{search}%", f"%{search}%", limit, offset])
    return query("""
        SELECT player_id, player_name, team, position,
               club, age, caps, goals, is_star
        FROM dim_player
        ORDER BY team, is_star DESC
        LIMIT %s OFFSET %s
    """, [limit, offset])

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

def get_hotels_by_price_band(price_band):
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

def get_all_restaurants(limit=500, offset=0, search=None, region=None):
    """Return restaurants with optional name/region search and pagination."""
    conditions = []
    params = []
    if search:
        conditions.append("restaurant_name ILIKE %s")
        params.append(f"%{search}%")
    if region:
        conditions.append("region ILIKE %s")
        params.append(f"%{region}%")
    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    return query(f"""
        SELECT restaurant_id, restaurant_name, region,
               address, price_range, flavor,
               google_review_score, review_count, disability_access
        FROM fact_restaurant
        {where}
        ORDER BY google_review_score DESC
        LIMIT %s OFFSET %s
    """, params + [limit, offset])

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

def get_all_events(limit=500, offset=0, search=None, area=None):
    """Return events with optional name/area search and pagination."""
    conditions = []
    params = []
    if search:
        conditions.append("e.event_name ILIKE %s")
        params.append(f"%{search}%")
    if area:
        conditions.append("(e.area ILIKE %s OR e.city ILIKE %s)")
        params.extend([f"%{area}%", f"%{area}%"])
    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    return query(f"""
        SELECT e.event_id, e.event_name, e.category,
               e.event_category_id,
               e.event_type, e.venue_name, e.area, e.city,
               e.start_date, e.end_date, e.event_time,
               e.detail_type, e.source_url, c.category AS category_label
        FROM fact_event e
        LEFT JOIN dim_event_category c
               ON e.event_category_id = c.event_category_id
        {where}
        ORDER BY e.start_date
        LIMIT %s OFFSET %s
    """, params + [limit, offset])

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
    with _conn() as conn:
        base = query("""
            SELECT e.*, c.category AS category_label
            FROM fact_event e
            LEFT JOIN dim_event_category c
                   ON e.event_category_id = c.event_category_id
            WHERE e.event_id = %s
        """, [event_id], conn=conn)

        if not base:
            return None

        event = base[0]

        exp = query("SELECT * FROM event_experience_detail WHERE event_id = %s", [event_id], conn=conn)
        if exp:
            event["experience_detail"] = exp[0]

        spt = query("SELECT * FROM event_sports_detail WHERE event_id = %s", [event_id], conn=conn)
        if spt:
            event["sports_detail"] = spt[0]

        return event


# ─────────────────────────────────────────
# 11. Journey helpers
# ─────────────────────────────────────────

def get_events_by_categories(category_ids, limit=80):
    """Return events in the given category_id list, joined with experience detail."""
    if not category_ids:
        return []
    placeholders = ','.join(['%s'] * len(category_ids))
    return query(f"""
        SELECT e.event_id, e.event_name, e.category,
               e.event_category_id,
               e.venue_name, e.area, e.city,
               e.start_date, e.end_date, e.event_time,
               c.category AS category_label,
               ed.ticket_price, ed.admission_info, ed.recommended_duration
        FROM fact_event e
        LEFT JOIN dim_event_category c ON e.event_category_id = c.event_category_id
        LEFT JOIN event_experience_detail ed ON e.event_id = ed.event_id
        WHERE e.event_category_id::int IN ({placeholders})
        ORDER BY e.event_id
        LIMIT %s
    """, category_ids + [limit])

def recommend_hotels_for_budget(price_band):
    """Return up to 3 hotels matching the price band, ordered by star rating."""
    return query("""
        SELECT hotel_id, hotel_name, region, address,
               star_rating, price_band, google_reviews_count,
               latitude, longitude
        FROM fact_hotel
        WHERE price_band = %s
        ORDER BY star_rating DESC, google_reviews_count DESC
        LIMIT 3
    """, [price_band])

def recommend_restaurants_for_budget(price_ranges, limit=20):
    """Return restaurants matching any of the given price_range values."""
    if not price_ranges:
        return []
    placeholders = ','.join(['%s'] * len(price_ranges))
    return query(f"""
        SELECT restaurant_id, restaurant_name, region,
               address, price_range, flavor, google_review_score
        FROM fact_restaurant
        WHERE price_range IN ({placeholders})
        ORDER BY google_review_score DESC
        LIMIT %s
    """, price_ranges + [limit])


# ─────────────────────────────────────────
# Journey share — persist a generated itinerary so the user can share a URL
# ─────────────────────────────────────────

# 8-char URL-safe ID (~5 trillion combinations) — short enough to look clean
# in a URL, long enough that guessing is not practical.
_SHARE_ID_BYTES = 6


def _new_share_id():
    return secrets.token_urlsafe(_SHARE_ID_BYTES)[:8]


def save_journey_share(payload):
    """Persist an itinerary payload and return its short ID.

    Retries on the (extremely rare) event of an ID collision so callers
    don't have to handle UNIQUE-violation errors.
    """
    payload_json = json.dumps(payload)
    for _ in range(5):
        share_id = _new_share_id()
        try:
            with _conn() as conn, conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO journey_share (id, payload) VALUES (%s, %s::jsonb)",
                    (share_id, payload_json),
                )
                conn.commit()
            return share_id
        except psycopg2.errors.UniqueViolation:
            continue
    raise RuntimeError("Could not allocate a unique share ID after 5 attempts")


def get_journey_share(share_id):
    """Return the saved payload, or None if no row matches.

    Bumps view_count atomically so we can later see which shares get traffic.
    """
    rows = query(
        """
        UPDATE journey_share
           SET view_count = view_count + 1
         WHERE id = %s
        RETURNING payload, created_at, view_count
        """,
        (share_id,),
    )
    if not rows:
        return None
    return rows[0]["payload"]


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

    print("\n── Restaurants ──")
    restaurants = get_all_restaurants(limit=3)
    for r in restaurants:
        print(f"  {r['restaurant_name']} | {r['region']} | {r['price_range']}")

    print("\nAll queries tested successfully!")
