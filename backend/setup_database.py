import psycopg2
import pandas as pd
import os

# ─────────────────────────────────────────
# 1. 数据库连接
# ─────────────────────────────────────────
conn = psycopg2.connect(
    host="db-postgresql-nyc1-44203-do-user-8018943-0.b.db.ondigitalocean.com",
    port=25060,
    dbname="wc1",
    user="team1",
    password="AVNS_bOAJIRjLfR2RbWztITa",
    sslmode="require"
)
cur = conn.cursor()
print("✅ 数据库连接成功")

# ─────────────────────────────────────────
# 2. 建表 (先建没有FK的表，再建有FK的表)
# ─────────────────────────────────────────

# ── Dimension Tables (先建) ──

cur.execute("""
CREATE TABLE IF NOT EXISTS dim_event_category (
    event_category_id   TEXT PRIMARY KEY,
    category            TEXT
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS dim_mode (
    mode_id     TEXT PRIMARY KEY,
    mode_name   TEXT,
    mode_group  TEXT,
    includes    TEXT,
    notes       TEXT
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS dim_place (
    place_id            TEXT PRIMARY KEY,
    place_type          TEXT,
    subtype             TEXT,
    name                TEXT,
    city                TEXT,
    state               TEXT,
    lat                 DECIMAL,
    lon                 DECIMAL,
    source              TEXT,
    needs_coord_verify  BOOLEAN
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS dim_team (
    team_id             TEXT PRIMARY KEY,
    country             TEXT UNIQUE,
    federation          TEXT,
    status              TEXT,
    possible_teams      TEXT,
    group_stage         TEXT,
    matches_in_la       TEXT,
    notes               TEXT,
    source_url          TEXT,
    last_verified       TEXT,
    update_after_playoff TEXT
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS dim_player (
    player_id   TEXT PRIMARY KEY,
    team        TEXT REFERENCES dim_team(country),
    player_name TEXT,
    position    TEXT,
    club        TEXT,
    age         NUMERIC,
    caps        NUMERIC,
    goals       NUMERIC,
    is_star     BOOLEAN,
    notes       TEXT
);
""")

# ── Fact Tables (後建) ──

cur.execute("""
CREATE TABLE IF NOT EXISTS fact_match (
    match_number    TEXT PRIMARY KEY,
    date            TEXT,
    day_of_week     TEXT,
    time_pt         TEXT,
    team1           TEXT,
    team2           TEXT,
    "group"         TEXT,
    stage           TEXT,
    venue           TEXT,
    venue_address   TEXT,
    notes           TEXT,
    source_url      TEXT
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS fact_ranking (
    ranking_id      TEXT PRIMARY KEY,
    rank            NUMERIC,
    country         TEXT,
    total_points    DECIMAL,
    previous_rank   NUMERIC,
    rank_change     NUMERIC,
    confederation   TEXT,
    last_updated    TEXT,
    source_url      TEXT,
    fetch_method    TEXT,
    fetched_at      TEXT,
    note            TEXT
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS fact_hotel (
    hotel_id            TEXT PRIMARY KEY,
    hotel_name          TEXT,
    region              TEXT,
    address             TEXT,
    postal_code         TEXT,
    star_rating         DECIMAL,
    room_count          NUMERIC,
    google_reviews_count NUMERIC,
    price_band          TEXT,
    latitude            DECIMAL,
    longitude           DECIMAL
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS fact_restaurant (
    restaurant_id       TEXT PRIMARY KEY,
    restaurant_name     TEXT,
    region              TEXT,
    address             TEXT,
    price_range         TEXT,
    flavor              TEXT,
    google_review_score DECIMAL,
    review_count        NUMERIC,
    disability_access   TEXT
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS fact_event (
    event_id            TEXT PRIMARY KEY,
    event_key           TEXT,
    event_name          TEXT,
    category            TEXT,
    event_type          TEXT,
    venue_name          TEXT,
    area                TEXT,
    city                TEXT,
    address             TEXT,
    start_date          TEXT,
    end_date            TEXT,
    event_time          TEXT,
    source_sheet        TEXT,
    record_id           TEXT,
    source_url          TEXT,
    verification_status TEXT,
    notes               TEXT,
    detail_type         TEXT,
    event_category_id   TEXT REFERENCES dim_event_category(event_category_id)
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS fact_route (
    route_id        TEXT PRIMARY KEY,
    origin_place_id TEXT REFERENCES dim_place(place_id),
    dest_place_id   TEXT REFERENCES dim_place(place_id),
    mode_id         TEXT REFERENCES dim_mode(mode_id),
    duration_min    NUMERIC,
    cost_low_usd    DECIMAL,
    cost_high_usd   DECIMAL,
    source          TEXT
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS fact_ticket (
    ticket_id       TEXT PRIMARY KEY,
    match_date      TEXT,
    match_time      TEXT,
    match_info      TEXT,
    stage           TEXT,
    seating_section TEXT,
    section_level   TEXT,
    ticket_category TEXT,
    price_usd       DECIMAL,
    ticket_status   TEXT,
    match_number    TEXT REFERENCES fact_match(match_number),
    matchup         TEXT
);
""")

# ── Detail Tables (最後建) ──

cur.execute("""
CREATE TABLE IF NOT EXISTS event_experience_detail (
    event_id            TEXT PRIMARY KEY REFERENCES fact_event(event_id),
    key_experience      TEXT,
    recommended_duration TEXT,
    suitable_for        TEXT,
    intensity_level     TEXT,
    night_friendly      TEXT,
    photo_value         TEXT,
    commercial_level    TEXT,
    crowdedness         TEXT,
    price_level         TEXT,
    transportation      TEXT,
    spatial_character   TEXT,
    planning_tag        TEXT,
    ticket_price        TEXT,
    admission_info      TEXT
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS event_sports_detail (
    event_id                TEXT PRIMARY KEY REFERENCES fact_event(event_id),
    sport_type              TEXT,
    approx_price            TEXT,
    competition_event_info  TEXT
);
""")

conn.commit()
print("✅ 所有表建立成功")

# ─────────────────────────────────────────
# 3. 导入数据 (ETL)
# ─────────────────────────────────────────

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../database/clean_data")


def load_csv(filename, table_name):
    filepath = os.path.join(DATA_DIR, filename)
    df = pd.read_csv(filepath)
    df = df.where(pd.notnull(df), None)  # 把NaN转成None
    cols = ", ".join([f'"{c}"' for c in df.columns])
    placeholders = ", ".join(["%s"] * len(df.columns))
    sql = f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
    for _, row in df.iterrows():
        cur.execute(sql, list(row))
    conn.commit()
    print(f"✅ {filename} → {table_name} ({len(df)} 行)")


# 先导入没有FK的表
load_csv("clean_dim_event_category.csv", "dim_event_category")
load_csv("clean_dim_mode.csv",           "dim_mode")
load_csv("clean_dim_place.csv",          "dim_place")
load_csv("clean_dim_team.csv",           "dim_team")

# 再导入有FK的表
load_csv("clean_dim_player.csv",         "dim_player")
load_csv("clean_fact_match.csv",         "fact_match")
load_csv("clean_fact_ranking.csv",       "fact_ranking")
load_csv("clean_fact_hotel.csv",         "fact_hotel")
load_csv("clean_fact_restaurant.csv",    "fact_restaurant")
load_csv("clean_fact_event.csv",         "fact_event")
load_csv("clean_fact_route.csv",         "fact_route")
load_csv("clean_fact_ticket.csv",        "fact_ticket")

# 最後导入detail表
load_csv("clean_event_experience_detail.csv", "event_experience_detail")
load_csv("clean_event_sports_detail.csv",     "event_sports_detail")

print("\n🎉 所有数据导入完成！")

# ─────────────────────────────────────────
# 4. 验证数据
# ─────────────────────────────────────────

tables = [
    "dim_event_category", "dim_mode", "dim_place", "dim_team", "dim_player",
    "fact_match", "fact_ranking", "fact_hotel", "fact_restaurant",
    "fact_event", "fact_route", "fact_ticket",
    "event_experience_detail", "event_sports_detail"
]

print("\n── 各表行数 ──")
for table in tables:
    cur.execute(f"SELECT COUNT(*) FROM {table}")
    count = cur.fetchone()[0]
    print(f"  {table}: {count} 行")

cur.close()
conn.close()
print("\n✅ 数据库连接已关闭")
