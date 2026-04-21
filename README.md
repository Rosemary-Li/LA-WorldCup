# LA × FIFA World Cup 2026

Full-stack APAN5310 project for the FIFA World Cup 2026 Los Angeles experience. A React/Vite frontend talks to a Flask REST API backed by a normalized PostgreSQL database, helping visitors explore LA match schedules, team context, hotels, restaurants, fan events, shows, attractions, and personalized travel journeys.

> Chinese version: [README.cn.md](README.cn.md)

## Pipeline

```text
raw Excel / CSV files
    → cleaned CSV files
    → PostgreSQL dimensional schema
    → SQL query functions   backend/queries.py
    → Flask JSON API        backend/app.py
    → React API client      frontend/src/api.js
    → React UI              frontend/src/main.jsx
```

The browser never connects to PostgreSQL. React only calls Flask endpoints. Credentials stay in `backend/.env`.

## User Flow

The app is one scrollable experience with scroll-snap between sections:

1. **Hero** — LA × WC26 landing. Three step-buttons: *Pick your match → Explore the city → Generate your trip* jump directly to each section.
2. **Matches** — Eight Los Angeles matches at SoFi Stadium. Click any match to open the detail overlay.
3. **Match Overlay** — Stage, date/time, team flags + FIFA rankings, match storyline, head-to-head history, then tabs: Tickets / Hotels / Restaurants / Fan Events / Squad. A bottom CTA links to Explore LA.
4. **Explore LA** — Split layout: card grid on the left, live Leaflet map on the right. Five categories: Hotels, Restaurants, Fan Events, Shows, Attractions. Cards show website screenshots via thum.io and link to official sites. Selections persist across categories and appear as pins on the map. "Build My Journey →" scrolls to Journey.
5. **Journey** — Form inputs (traveler type, budget, days, match date, vibe). Generates a day-by-day schedule from SQL recommendation pools, prioritizing Explore LA picks. Result shows a timeline on the left and a live route map on the right. Hover a timeline item to highlight it on the map.
6. **About Us** — Team profiles with DiceBear avatars and GitHub links.

## Tech Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL (DigitalOcean managed) |
| ETL | Python, pandas, psycopg2 |
| Backend | Flask, flask-cors, psycopg2, python-dotenv |
| Frontend | React 19, Vite, CSS (Cormorant Garamond + DM Mono) |
| Maps | Leaflet via CDN |
| Card images | thum.io website screenshot service |

## Repository Structure

```text
LA_WorldCup/
├── backend/
│   ├── app.py              # Flask routes and Journey generation logic
│   ├── queries.py          # PostgreSQL query layer and connection pool
│   ├── setup_database.py   # Schema creation and CSV import
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api.js          # Frontend API client and data mapping
│   │   ├── main.jsx        # All React components and app state
│   │   └── placeMedia.js   # Official URLs and thum.io image helpers
│   ├── css/styles.css
│   └── images/
│
├── database/
│   ├── raw_data/
│   ├── clean_data/
│   └── docs/               # ER diagram
│
├── API_INTERFACE.md
└── README.md
```

## Local Setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# fill in DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSLMODE
python3 app.py
# → http://127.0.0.1:5001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Database Design

Dimensional model — dimension tables hold stable entities, fact tables hold transactional data.

### Dimension Tables

| Table | Contents |
|---|---|
| `dim_team` | Countries, federations, group stage, qualification status |
| `dim_player` | Names, teams, positions, clubs, ages, caps, goals, star flags |
| `dim_place` | Stadiums, airports, transport places with coordinates |
| `dim_mode` | Transport mode metadata |
| `dim_event_category` | Category labels used by event and Journey queries |

### Fact Tables

| Table | Contents |
|---|---|
| `fact_match` | Match number, date, time, teams, group, stage, venue |
| `fact_ticket` | Category, section, price, status, match FK |
| `fact_hotel` | Region, address, star rating, price band, reviews, lat/lon |
| `fact_restaurant` | Region, address, cuisine, price range, review score |
| `fact_event` | Fan events, shows, community events, sports events, LA experiences |
| `fact_route` | Airport-to-venue and local transport routes |
| `fact_ranking` | FIFA ranking snapshot with rank changes and points |

### Detail Tables

| Table | Contents |
|---|---|
| `event_experience_detail` | Duration, suitability, admission, transportation notes |
| `event_sports_detail` | Sport type and competition info |

## Journey Logic

`GET /api/itinerary` maps user inputs to SQL-backed recommendation pools and builds a daily schedule.

Each regular day follows this structure:

| Time | Slot |
|---|---|
| 09:30 | Morning activity (type event) |
| 12:30 | Lunch (restaurant) |
| 15:00 | Afternoon activity (different category) |
| 18:00 | Evening activity (vibe event) |
| 20:30 | Dinner (restaurant) |

Match day: morning activity → lunch → match. No extra activities after kickoff.

Rules enforced per day:
- No two activities from the same category.
- Events are consumed from a deque to avoid repeating across days.
- Restaurants cycle through a pool so lunch ≠ dinner.
- If a hotel is selected in Explore LA, restaurants and events from the same area are prioritized.
- Explore LA picks are inserted into the schedule before generic recommendations.

## API Summary

See [API_INTERFACE.md](API_INTERFACE.md) for full endpoint documentation.

| Endpoint | Purpose |
|---|---|
| `GET /api/matches` | Match schedule |
| `GET /api/tickets/<match_number>` | Ticket options for a match |
| `GET /api/teams` | Team context |
| `GET /api/players` | Player data |
| `GET /api/players/<team>` | Players for one team (Squad tab) |
| `GET /api/rankings` | FIFA rankings |
| `GET /api/hotels` | Hotel list with coordinates |
| `GET /api/restaurants` | Restaurant list |
| `GET /api/events` | Events, shows, attractions |
| `GET /api/itinerary` | Personalized journey generation |

## Security Notes

- Browser never sees database credentials.
- All SQL uses parameterized queries — no string interpolation with user input.
- `backend/.env` must not be committed (listed in `.gitignore`).

## Smoke Tests

```bash
curl http://127.0.0.1:5001/api/matches
curl http://127.0.0.1:5001/api/hotels
curl "http://127.0.0.1:5001/api/itinerary?type=football&budget=mid&days=5&match_date=jun12&vibe=culture"
```
