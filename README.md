# LA x FIFA World Cup 2026 - Database-Driven Los Angeles Guide

Full-stack APAN5310 project for the FIFA World Cup 2026 Los Angeles host city experience. The application combines a normalized PostgreSQL database, a Flask REST API, and a React/Vite frontend to help visitors explore matches, teams, rankings, hotels, restaurants, fan events, shows, routes, maps, and personalized travel journeys.

> Chinese version: [README.cn.md](README.cn.md)

## Project Summary

This project is designed around a clear database-to-frontend pipeline:

```text
raw Excel / CSV files
        -> cleaned CSV files
        -> PostgreSQL dimensional schema
        -> SQL query functions in backend/queries.py
        -> Flask JSON API in backend/app.py
        -> React data loading in frontend/src/api.js
        -> React UI components in frontend/src/main.jsx
```

The frontend does not connect to the database directly. It only talks to the Flask API. Database credentials, host names, passwords, and SSL settings stay on the backend side in environment variables.

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Database | PostgreSQL | Stores normalized World Cup, travel, event, hotel, restaurant, route, and ranking data |
| ETL | Python, pandas, psycopg2 | Creates tables and imports cleaned CSV data |
| Backend | Flask, flask-cors, psycopg2, python-dotenv | Provides database-backed REST endpoints |
| Frontend | React, Vite, CSS | Renders the interactive Los Angeles guide |
| Map | Leaflet | Displays LA map locations and travel context |

## Repository Structure

```text
LA_WorldCup/
├── backend/
│   ├── app.py              # Flask routes and Journey generation logic
│   ├── queries.py          # PostgreSQL query layer and connection pool
│   ├── setup_database.py   # One-time schema creation and CSV import script
│   ├── requirements.txt    # Python backend dependencies
│   └── .env.example        # Example database environment variables
│
├── frontend/
│   ├── index.html          # Vite entry HTML
│   ├── package.json        # React/Vite scripts and dependencies
│   ├── vite.config.js
│   ├── src/
│   │   ├── api.js          # Frontend API client for Flask endpoints
│   │   └── main.jsx        # React components and app state
│   ├── css/styles.css      # Shared visual system and page styles
│   └── images/             # Hero and Explore LA images
│
├── database/
│   ├── raw_data/           # Original Excel / CSV source files
│   ├── clean_data/         # Clean import-ready CSV files
│   └── docs/               # ER diagram and cleaning documentation
│
├── archive/                # Earlier prototype
├── README.md
└── README.cn.md
```

## Local Setup

### 1. Backend

Create your backend environment:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a private `.env` file from the example:

```bash
cp .env.example .env
```

Fill in the database values:

```text
DB_HOST=your-db-host
DB_PORT=25060
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_SSLMODE=require
```

Start the Flask API:

```bash
python3 app.py
```

Backend URL:

```text
http://127.0.0.1:5000
```

### 2. Frontend

Install frontend dependencies:

```bash
cd frontend
npm install
```

Start the React development server:

```bash
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

Build production assets:

```bash
npm run build
```

## Main Features

- Match schedule for the eight Los Angeles World Cup matches at SoFi Stadium.
- Match detail overlay with team information, players, tickets, nearby hotels, restaurants, and fan events.
- Tournament guide for teams and FIFA rankings.
- Explore LA photo gateway that routes users into database-backed categories.
- Discover section for hotels, restaurants, fan events, shows, and transportation routes.
- Journey planner powered by backend SQL queries and user preferences.
- Leaflet map for stadium, hotel, restaurant, and event context.
- About Us page with team member profiles and GitHub links.

## Database Design

The database follows a dimensional modeling pattern. Dimension tables store stable entities. Fact tables store schedule, ticket, hospitality, event, route, and ranking records.

ER diagram:

```text
database/docs/APAN5310_ER_Diagram_Simplified_v4.drawio.html
```

### Dimension Tables

| Table | Purpose |
|---|---|
| `dim_team` | Countries, federations, group stage information, qualification status |
| `dim_player` | Player names, teams, positions, clubs, ages, caps, goals, star flags |
| `dim_place` | Stadiums, airports, and transport-related places with coordinates |
| `dim_mode` | Transportation mode metadata |
| `dim_event_category` | Event category labels used by event and Journey queries |

### Fact Tables

| Table | Purpose |
|---|---|
| `fact_match` | LA match schedule: match number, date, time, teams, group, stage, venue |
| `fact_ticket` | Ticket category, section, price, status, and match relationship |
| `fact_hotel` | Hotel region, address, star rating, price band, reviews, coordinates |
| `fact_restaurant` | Restaurant region, address, cuisine, price range, score, accessibility |
| `fact_event` | Fan events, shows, community events, sports events, and LA experiences |
| `fact_route` | Airport-to-SoFi and local transport route options |
| `fact_ranking` | FIFA ranking snapshot with rank changes and points |

### Detail Tables

| Table | Purpose |
|---|---|
| `event_experience_detail` | Duration, suitability, admission, transportation, and experience notes |
| `event_sports_detail` | Sport-specific details and ticket information |

## SQL Logic

All database reads are centralized in [backend/queries.py](backend/queries.py). This file is the source of truth for SQL access.

### Connection Handling

`queries.py` loads private connection values from `backend/.env` and creates a lazy PostgreSQL connection pool:

```python
psycopg2.pool.ThreadedConnectionPool(...)
```

The helper function `query(sql, params=None, conn=None)`:

1. Borrows a connection from the pool.
2. Runs parameterized SQL.
3. Uses `RealDictCursor` so rows become dictionaries.
4. Returns `list[dict]` for Flask `jsonify`.
5. Rolls back and returns the connection to the pool on database errors.

### Query Patterns

Simple ordered reads:

```sql
SELECT match_number, date, day_of_week, time_pt,
       team1, team2, "group", stage, venue
FROM fact_match
ORDER BY date, time_pt;
```

Parameterized filters:

```sql
SELECT ticket_id, seating_section, section_level,
       ticket_category, price_usd, ticket_status, matchup
FROM fact_ticket
WHERE match_number = %s
ORDER BY price_usd;
```

Search and pagination:

```sql
WHERE restaurant_name ILIKE %s
ORDER BY google_review_score DESC
LIMIT %s OFFSET %s;
```

Fact-to-dimension joins:

```sql
SELECT e.event_id, e.event_name, e.category,
       e.event_category_id, c.category AS category_label
FROM fact_event e
LEFT JOIN dim_event_category c
       ON e.event_category_id = c.event_category_id
ORDER BY e.start_date;
```

Route joins:

```sql
FROM fact_route r
JOIN dim_place o ON r.origin_place_id = o.place_id
JOIN dim_place d ON r.dest_place_id = d.place_id
JOIN dim_mode  m ON r.mode_id = m.mode_id
```

Event detail composition:

- Base event row comes from `fact_event`.
- Experience metadata comes from `event_experience_detail`.
- Sports metadata comes from `event_sports_detail`.
- Flask returns one composed JSON object to the frontend.

## Backend API

[backend/app.py](backend/app.py) exposes a controlled JSON API. The React app calls these endpoints, never the database.

Core endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /api/matches` | LA match schedule |
| `GET /api/matches/<match_number>` | Single match |
| `GET /api/tickets/<match_number>` | Ticket data for a match |
| `GET /api/teams` | Teams |
| `GET /api/players?limit=&offset=&search=` | Players with pagination/search |
| `GET /api/players/<team_country>` | Players for one team |
| `GET /api/rankings` | FIFA rankings |
| `GET /api/hotels` | Hotels |
| `GET /api/hotels/region/<region>` | Hotels by region |
| `GET /api/hotels/price/<price_band>` | Hotels by price band |
| `GET /api/restaurants?limit=&offset=&search=&region=` | Restaurants with filters |
| `GET /api/events?limit=&offset=&search=&area=` | Events with filters |
| `GET /api/events/category/<category>` | Events by category |
| `GET /api/events/<event_id>` | Composed event detail |
| `GET /api/routes` | Transportation routes |
| `GET /api/map-data` | Map layer data |
| `GET /api/itinerary` | Personalized Journey |

## Journey Logic

The Journey endpoint maps user preferences into SQL-backed recommendation pools.

| User Input | Backend Mapping |
|---|---|
| Traveler type | `_TYPE_CATS` event category IDs |
| Vibe | `_VIBE_CATS` event category IDs |
| Budget | `_HOTEL_BAND` and `_REST_PRICE` |
| Days | Clamped to 1-7 days |
| Match date | `_MATCH_INFO` fixed SoFi match activity |

The endpoint then:

1. Queries candidate events by category.
2. Queries hotels by budget band.
3. Queries restaurants by budget range.
4. Uses a stable SHA-256 seed so the same inputs produce a consistent plan.
5. Returns a structured day-by-day schedule.

## Frontend Architecture

The React frontend is organized in two main files:

- [frontend/src/api.js](frontend/src/api.js): API client and response mapping.
- [frontend/src/main.jsx](frontend/src/main.jsx): React components, state, overlays, tabs, and page interactions.

The app loads database-backed data with:

```js
loadSiteData()
```

That function calls the Flask API, maps backend rows into UI-friendly objects, and stores them in React state. Components then render from state:

- `Matches`
- `Tournament`
- `ExploreLA`
- `Discover`
- `Journey`
- `MapSection`
- `About`

If the backend is unavailable, the database-backed sections show a connection message instead of silently switching to fallback data.

## Privacy and Security Notes

- Database credentials are not hard-coded in source code.
- Private connection values belong in `backend/.env`.
- `backend/.env.example` documents required variables without exposing secrets.
- The React frontend only receives JSON fields needed for display.
- The database remains behind the Flask API boundary.
- `.gitignore` excludes `.env`, `node_modules/`, `dist/`, `.DS_Store`, and Python cache files.

## Useful Commands

Backend:

```bash
cd backend
source .venv/bin/activate
python3 app.py
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
```

Quick API smoke test:

```bash
curl http://127.0.0.1:5000/api/matches
curl http://127.0.0.1:5000/api/hotels
curl http://127.0.0.1:5000/api/itinerary
```

## Current Status

The current version runs as a React frontend on Vite and a Flask backend on port `5000`.

```text
Frontend: http://127.0.0.1:5173
Backend:  http://127.0.0.1:5000
```
