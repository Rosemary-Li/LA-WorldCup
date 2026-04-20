# LA x FIFA World Cup 2026 - Database-Driven Travel Guide

A full-stack academic project for APAN5310. The application turns curated FIFA World Cup 2026 Los Angeles data into a normalized PostgreSQL database, exposes it through a Flask REST API, and renders it in a pure HTML/CSS/JavaScript frontend using backend API data.

> Also available in Chinese: [README.cn.md](README.cn.md)

## Project Focus

This project is primarily a database-to-frontend application. The main work is not only the visual site, but the complete data path:

```text
raw Excel / CSV sources
        -> cleaned CSV files
        -> PostgreSQL dimensional schema
        -> SQL query layer in backend/queries.py
        -> Flask routes in backend/app.py
        -> frontend/js/api.js data loaders
        -> interactive frontend sections
```

The frontend is designed as a client of the database. `frontend/js/api.js` fetches data from Flask and maps the API responses into the frontend state used by match cards, hotel cards, restaurant cards, event cards, rankings, teams, transport routes, and map data.

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Database | Managed PostgreSQL | Stores normalized match, team, player, ticket, hotel, restaurant, event, route, and ranking data |
| ETL | Python, pandas, psycopg2 | Creates tables and imports cleaned CSV files |
| Backend | Flask, flask-cors, psycopg2 | Provides `/api/*` JSON endpoints backed by SQL queries |
| Frontend | HTML, CSS, vanilla JavaScript | Renders the travel guide and consumes API data |
| Map | Leaflet | Displays LA place and hotel coordinates |

## Repository Structure

```text
LA_WorldCup/
├── backend/
│   ├── app.py              # Flask API routes and Journey logic
│   ├── queries.py          # SQL query functions; one source of truth for DB reads
│   └── setup_database.py   # One-time schema creation and CSV import script
│
├── frontend/
│   ├── index.html          # Static entry point; loads section scripts and feature JS
│   ├── css/styles.css
│   ├── js/
│   │   ├── data.js         # Frontend data containers loaded before API mapping
│   │   ├── api.js          # Fetches API data and updates frontend state
│   │   ├── app.js          # Discover tab rendering, filters, and page behavior
│   │   ├── matches.js      # Match overlay, tickets, squads, event details
│   │   ├── itinerary.js    # Calls /api/itinerary and renders Journeys
│   │   ├── explore.js      # Leaflet map markers and filters
│   │   └── fullpage.js     # Section navigation
│   └── sections/           # JS files that inject page sections through innerHTML
│
├── database/
│   ├── raw_data/           # Original source files
│   ├── clean_data/         # Import-ready clean_<table>.csv files
│   └── docs/               # ER diagram and data-cleaning reports
│
├── archive/                # Early single-file prototype
├── README.md
└── README.cn.md
```

## Running Locally

Install Python dependencies:

```bash
pip install flask flask-cors psycopg2-binary pandas
```

Start the Flask API:

```bash
cd backend
python3 app.py
```

The API runs at:

```text
http://127.0.0.1:5000
```

Start the static frontend:

```bash
cd frontend
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080
```

## Database Design

The database uses a dimensional/star-schema style model. Dimension tables describe stable entities such as teams, players, places, transport modes, and event categories. Fact tables describe measurable or transactional records such as matches, tickets, hotels, restaurants, events, routes, and rankings.

ER diagram:

```text
database/docs/APAN5310_ER_Diagram_Simplified_v4.drawio.html
```

### Dimension Tables

| Table | Purpose | Used by |
|---|---|---|
| `dim_team` | Teams playing in LA, federation, group, status | `/api/teams`, player joins by team name |
| `dim_player` | Player profile, club, stats, `is_star` flag | `/api/players`, match overlay squads |
| `dim_place` | Stadiums, airports, transport hubs with coordinates | `/api/routes`, `/api/map-data` |
| `dim_mode` | Transport mode metadata | `/api/routes` |
| `dim_event_category` | Event category labels | `/api/events`, Journey category mapping |

### Fact Tables

| Table | Purpose | Main SQL Pattern |
|---|---|---|
| `fact_match` | LA match schedule | Ordered by `date, time_pt` |
| `fact_ticket` | Ticket sections, categories, prices, availability | Filtered by `match_number`, ordered by `price_usd` |
| `fact_hotel` | Hotel metadata, region, price band, coordinates | Filtered by region or price band |
| `fact_restaurant` | Restaurant metadata, cuisine, price, rating | Filtered by `flavor ILIKE` or price range |
| `fact_event` | Fan events, shows, sports, fan zones | Joined to event category; filtered by category |
| `fact_route` | Airport-to-SoFi travel options | Joined to `dim_place` and `dim_mode` |
| `fact_ranking` | FIFA ranking snapshot | Ordered by rank |

### Detail Tables

| Table | Purpose |
|---|---|
| `event_experience_detail` | Experience-oriented event metadata: duration, suitability, intensity, admission, transportation |
| `event_sports_detail` | Sports-event-specific details such as sport type and ticket information |

## SQL Logic Layer

All database reads are centralized in [backend/queries.py](backend/queries.py). The file defines a small `query(sql, params=None)` helper that:

1. Uses the database adapter to run approved read queries.
2. Executes parameterized SQL.
3. Uses `RealDictCursor` so every row becomes a Python dictionary.
4. Returns `list[dict]` to Flask, ready for `jsonify`.

### Core SQL Patterns

**Simple ordered reads**

Examples: `get_all_matches()`, `get_all_hotels()`, `get_all_rankings()`.

```sql
SELECT match_number, date, day_of_week, time_pt,
       team1, team2, "group", stage, venue
FROM fact_match
ORDER BY date, time_pt;
```

**Parameterized filters**

Examples: `get_tickets_by_match(match_number)`, `get_team_by_country(country)`, `get_players_by_team(team_country)`.

```sql
SELECT ticket_id, seating_section, section_level,
       ticket_category, price_usd, ticket_status, matchup
FROM fact_ticket
WHERE match_number = %s
ORDER BY price_usd;
```

Parameters are passed separately, for example `[match_number]`, instead of interpolating user input into SQL strings.

**Flexible text search**

Examples: hotel region, restaurant flavor, event category.

```sql
WHERE region ILIKE %s
```

This lets routes like `/api/hotels/region/Hollywood` match broader region strings without exact-case matching.

**Fact-to-dimension joins**

Events are joined with `dim_event_category` so the API can return both raw category fields and human-readable labels:

```sql
SELECT e.event_id, e.event_name, e.category,
       e.event_category_id, e.event_type,
       c.category AS category_label
FROM fact_event e
LEFT JOIN dim_event_category c
       ON e.event_category_id = c.event_category_id
ORDER BY e.start_date;
```

Routes use two aliases of `dim_place` plus `dim_mode`, which turns foreign keys into readable route cards:

```sql
FROM fact_route r
JOIN dim_place o ON r.origin_place_id = o.place_id
JOIN dim_place d ON r.dest_place_id = d.place_id
JOIN dim_mode  m ON r.mode_id = m.mode_id
```

**Event detail composition**

`get_event_detail(event_id)` first reads the base row from `fact_event`, then conditionally attaches:

- `experience_detail` from `event_experience_detail`
- `sports_detail` from `event_sports_detail`

That gives the frontend one event-detail response while preserving normalized tables in SQL.

**Journey SQL helpers**

The Journey endpoint maps user preferences to SQL filters:

| User Input | Backend Mapping | SQL Effect |
|---|---|---|
| Traveler type | `_TYPE_CATS` category id list | `event_category_id IN (...)` |
| Vibe | `_VIBE_CATS` category id list | separate event pool |
| Budget | `_HOTEL_BAND`, `_REST_PRICE` | hotel `price_band`, restaurant `price_range` |
| Days | clamped to 1-7 | controls output length |
| Match date | `_MATCH_INFO` | inserts fixed SoFi match activity |

The SQL helper `get_events_by_categories(category_ids)` joins `fact_event` to `dim_event_category` and `event_experience_detail`, then returns event rows that the Flask route turns into activities.

## ETL and Table Creation

[backend/setup_database.py](backend/setup_database.py) performs the one-time database setup:

1. Connects to PostgreSQL.
2. Creates dimension tables first.
3. Creates fact tables with foreign keys.
4. Creates event detail tables last.
5. Reads cleaned CSV files from `database/clean_data/`.
6. Inserts rows with `ON CONFLICT DO NOTHING`.

The load order matters because several tables reference earlier tables:

```text
dimensions -> facts -> details
dim_team   -> dim_player
dim_place  -> fact_route
dim_mode   -> fact_route
fact_match -> fact_ticket
fact_event -> event_experience_detail / event_sports_detail
```

## Backend API Layer

[backend/app.py](backend/app.py) defines a controlled Flask API layer over the SQL functions. The frontend never connects to the database directly and never receives database credentials, host details, or raw connection settings. Each route returns only the JSON fields needed by the UI.

Most routes simply call one query function and return a filtered response:

```python
@app.route("/api/matches")
def matches():
    return jsonify(queries.get_all_matches())
```

This keeps responsibilities separated:

| File | Responsibility |
|---|---|
| `queries.py` | Owns the SQL read logic and schema-specific field selection |
| `app.py` | Owns HTTP routes, request parameters, and public JSON response shape |
| `api.js` | Maps public API JSON into frontend state |

### API Endpoints

| Endpoint | SQL Source | Frontend Use |
|---|---|---|
| `GET /api/matches` | `fact_match` | Updates `MATCH_DATA` schedule cards |
| `GET /api/matches/<match_number>` | `fact_match` | Single match detail |
| `GET /api/tickets` | `fact_ticket` | Ticket datasets |
| `GET /api/tickets/<match_number>` | `fact_ticket WHERE match_number = %s` | Match overlay ticket tab |
| `GET /api/teams` | `dim_team` | Discover Teams tab |
| `GET /api/players` | `dim_player` | Star players on match cards |
| `GET /api/players/<team_country>` | `dim_player WHERE team = %s` | Full Squad overlay tab |
| `GET /api/players/stars` | `dim_player WHERE is_star = TRUE` | Star-player views |
| `GET /api/hotels` | `fact_hotel` | Hotel cards |
| `GET /api/hotels/region/<region>` | `fact_hotel WHERE region ILIKE %s` | Region filtering |
| `GET /api/hotels/price/<price_band>` | `fact_hotel WHERE price_band = %s` | Hotel price filter |
| `GET /api/restaurants` | `fact_restaurant` | Restaurant cards |
| `GET /api/restaurants/flavor/<flavor>` | `fact_restaurant WHERE flavor ILIKE %s` | Cuisine filtering |
| `GET /api/events` | `fact_event LEFT JOIN dim_event_category` | Fan Events and Shows tabs |
| `GET /api/events/category/<category>` | `fact_event WHERE category ILIKE %s` | Event category filter |
| `GET /api/events/<event_id>` | `fact_event` plus detail tables | Event detail overlay |
| `GET /api/rankings` | `fact_ranking` | FIFA Rankings tab |
| `GET /api/routes` | `fact_route` joined to places and modes | Getting There tab |
| `GET /api/map-data` | `fact_hotel`, `dim_place` | Map pins |
| `GET /api/itinerary` | event, hotel, restaurant helper queries | Journey builder |

## Frontend and Backend Connection

The frontend is static, but it behaves like a live data client.

### Load Order

[frontend/index.html](frontend/index.html) loads files in this order:

1. Section files in `frontend/sections/` create DOM containers.
2. Leaflet loads for the map.
3. `frontend/js/data.js` defines frontend data containers.
4. `frontend/js/api.js` fetches backend API data and populates those containers.
5. Feature scripts render cards, overlays, Journey, map, and full-page navigation.

### State Replacement Flow

`frontend/js/api.js` uses `API_BASE = "http://127.0.0.1:5000"` and calls all major endpoints on page load:

```javascript
await Promise.all([
  loadMatches(),
  loadHotels(),
  loadRestaurants(),
  loadEvents(),
  loadMapData(),
  loadRankings(),
  loadTeams(),
  loadRoutes(),
]);
```

Each loader maps database field names into frontend-friendly objects:

| Database/API Field | Frontend Field |
|---|---|
| `hotel_name` | `name` |
| `price_band` | `price` |
| `google_review_score` | `score` |
| `event_category_id` | fan event vs show grouping |
| `match_number` | match overlay ticket lookup key |

If the API is unavailable, database-backed cards are not rendered; the page asks the user to start the Flask server and reload.

## Main User Features

| Feature | Data Source | Files |
|---|---|---|
| LA match schedule | `fact_match`, `dim_player` | `api.js`, `sections/matches.js`, `js/matches.js` |
| Match detail overlay | `MATCH_DATA`, tickets, players, events | `js/matches.js` |
| Discover tabs | hotels, restaurants, events, teams, rankings, routes | `api.js`, `app.js` |
| Event detail overlay | `fact_event` plus detail tables | `queries.py`, `app.py`, `matches.js` |
| Journey builder | event category SQL, hotels, restaurants, match metadata | `app.py`, `queries.py`, `itinerary.js` |
| LA map | static map pins plus `/api/map-data` support | `explore.js` |

## Journey Logic

The Journey builder is the most explicit example of backend business logic sitting on top of SQL:

1. The frontend sends query parameters: `type`, `budget`, `days`, `match_date`, and `vibe`.
2. Flask maps traveler type and vibe into event category id lists.
3. SQL pulls matching events from `fact_event`, joined to category and experience-detail tables.
4. SQL pulls hotels by `price_band`.
5. SQL pulls restaurants by `price_range`.
6. Flask shuffles results with a stable hash seed so the same inputs produce the same Journey.
7. Day 3 becomes match day for trips of 3+ days.
8. The endpoint returns a JSON object that the frontend renders as a timeline.

Example:

```text
/api/itinerary?type=football&budget=mid&days=5&match_date=jun12&vibe=culture
```

## Development Checks

Python syntax:

```bash
python3 -m py_compile backend/app.py backend/queries.py
```

JavaScript syntax:

```bash
node --check frontend/js/api.js
node --check frontend/js/app.js
node --check frontend/js/matches.js
node --check frontend/js/itinerary.js
node --check frontend/js/explore.js
node --check frontend/js/fullpage.js
```

## Notes

- The frontend directory is `frontend/`, not `front_end/`.
- The app is intentionally framework-light: no bundler, no frontend framework, and no build step.
- Database hostnames, usernames, passwords, SSL settings, and other secrets should be kept outside README files and source code. Use environment variables or a secrets manager for any shared or deployed environment.
- The API uses CORS so the static frontend server on port `8080` can call the Flask server on port `5000`.

## Data Sources

| Dataset | Source |
|---|---|
| Match schedule | SoFi Stadium official site, Los Angeles World Cup 2026 materials |
| Tickets | Seat and ticket reference spreadsheets |
| Hotels and restaurants | Manual curation and public review data |
| Events | Discover Los Angeles, Los Angeles World Cup 2026 sources, venue pages |
| FIFA rankings | FIFA ranking source or course demo values |
| Routes | Public route research |
| Players | Public football profile data |
