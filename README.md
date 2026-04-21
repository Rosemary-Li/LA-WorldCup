# LA × FIFA World Cup 2026

Full-stack APAN5310 project for the FIFA World Cup 2026 Los Angeles experience. A React/Vite frontend talks to a Flask REST API backed by a normalized PostgreSQL database, helping visitors explore LA match schedules, team context, hotels, restaurants, fan events, shows, attractions, and personalized travel journeys.

> 中文版：[README.cn.md](README.cn.md)

---

## Architecture

```text
raw Excel / CSV files
    → cleaned CSV files
    → PostgreSQL dimensional schema
    → SQL query layer        backend/queries.py
    → itinerary service      backend/services/itinerary.py
    → Flask JSON API         backend/app.py
    → React API client       frontend/src/api.js
    → React UI               frontend/src/
```

The browser never connects to PostgreSQL. React only calls Flask endpoints. Database credentials stay in `backend/.env`.

---

## User Flow

One scrollable page with smooth scroll-snap between sections:

1. **Hero** — LA × WC26 landing with a looping photo hero. Three step-buttons — *Pick your match → Explore the city → Generate your trip* — jump directly to each section.
2. **Matches** — Eight Los Angeles matches at SoFi Stadium. Click any row to open the match overlay.
3. **Match Overlay** — Stage, date/time, team flags with FIFA rankings, match storyline, head-to-head history. Tabs: Tickets · Hotels · Restaurants · Fan Events · Squad. Bottom CTA links to Explore LA.
4. **Explore LA** — Five categories: Hotels, Restaurants, Fan Events, Shows, Attractions. Cards show thum.io website screenshots and link to official sites. Selections persist across categories and appear as colored pins on a live Leaflet map. "Build My Journey →" passes picks to the Journey section.
5. **Journey** — Form inputs (traveler type, budget, days, match date, vibe preference). Submits to `/api/itinerary`, which builds a day-by-day schedule from SQL recommendation pools, prioritizing Explore LA picks. Result shows a timeline on the left and a live route map on the right; hover a timeline item to highlight it on the map.
6. **About** — Team profiles with DiceBear avatars and GitHub links.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL (DigitalOcean managed) |
| ETL | Python, pandas, psycopg2 |
| Backend | Flask 3.1, flask-cors, psycopg2-binary, python-dotenv |
| Frontend | React 19, Vite 7, CSS (Cormorant Garamond + DM Mono) |
| Maps | Leaflet.js via CDN + CARTO Dark Matter tiles |
| Card images | thum.io website screenshot service |

---

## Repository Structure

```text
LA_WorldCup/
├── backend/
│   ├── app.py                  # Flask routes (thin controller only)
│   ├── queries.py              # PostgreSQL query layer and connection pool
│   ├── setup_database.py       # Schema creation and CSV import
│   ├── requirements.txt        # Pinned Python dependencies
│   ├── .env.example
│   ├── services/
│   │   └── itinerary.py        # Journey generation logic
│   └── config/
│       ├── matches.json        # Match date/label mapping
│       └── areas.json          # LA area → lat/lon mapping
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx            # App root and mount (47 lines)
│   │   ├── api.js              # API client (reads VITE_API_BASE)
│   │   ├── placeMedia.js       # Official URLs and thum.io image helpers
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Nav.jsx
│   │   │   ├── SyncMap.jsx
│   │   │   ├── ExCard.jsx
│   │   │   ├── FilterRow.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── DataNotice.jsx
│   │   │   └── Nearby.jsx      # Nearby + TicketCard
│   │   ├── sections/           # Page sections
│   │   │   ├── PhotoHero.jsx
│   │   │   ├── Matches.jsx
│   │   │   ├── ExploreLA.jsx
│   │   │   ├── Journey.jsx     # Journey form + JourneyResult
│   │   │   ├── MatchOverlay.jsx
│   │   │   └── About.jsx
│   │   ├── hooks/
│   │   │   └── useSiteData.js  # Data loading hook
│   │   └── constants/
│   │       ├── matches.js      # matchRows, matchMeta
│   │       ├── explore.js      # Category config, area coords
│   │       └── journey.js      # Form field config, activity marks
│   ├── css/styles.css
│   ├── images/
│   ├── .env                    # VITE_API_BASE (not committed)
│   ├── .env.example
│   └── vite.config.js          # Dev proxy for /api
│
├── database/
│   ├── raw_data/
│   ├── clean_data/
│   └── docs/                   # ER diagram
│
├── archive/                    # Prior iterations (historical reference)
├── API_INTERFACE.md
└── README.md
```

---

## Local Setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSLMODE
python3 app.py
# → http://127.0.0.1:5001
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Default: VITE_API_BASE=http://127.0.0.1:5001
# Change this if your backend runs on a different host or port
npm install
npm run dev
# → http://127.0.0.1:5173
```

> **Different machines / ports:** only `frontend/.env` needs to change — no source code edits required.

---

## Database Design

Dimensional model — dimension tables hold stable reference data, fact tables hold transactional records.

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

---

## Journey Logic

`GET /api/itinerary` is handled by `backend/services/itinerary.py`. The route in `app.py` only parses query params and calls `build_itinerary()`.

**Input → pool mapping:**

| Input | Mapped to |
|---|---|
| `type` | Event category IDs → `get_events_by_categories()` |
| `vibe` | Vibe category IDs → `get_events_by_categories()` |
| `budget` | Price band → `recommend_hotels_for_budget()` / `recommend_restaurants_for_budget()` |
| `picks` | User-selected Explore LA items, inserted first into the schedule |

**Daily structure (regular day):**

| Time | Slot |
|---|---|
| 09:30 | Morning activity (type event) |
| 12:30 | Lunch (restaurant) |
| 15:00 | Afternoon activity (different category) |
| 18:00 | Evening/vibe activity |
| 20:30 | Dinner (restaurant) |

Match day: morning activity → lunch → match. No evening slots.

**Rules enforced per day:**
- No two activities from the same event category.
- Events consumed from a deque — no repeats across days.
- Restaurants cycle so lunch ≠ dinner.
- Hotel region (from picks or top recommendation) floats same-area restaurants and events to the front.
- Explore LA picks are inserted before generic recommendations (up to 2 per day).
- Same seed for the same parameter set — consistent results on reload.

Match dates and LA area coordinates live in `backend/config/matches.json` and `backend/config/areas.json` — update them without touching Python code.

---

## API Summary

See [API_INTERFACE.md](API_INTERFACE.md) for full endpoint documentation.

| Endpoint | Purpose |
|---|---|
| `GET /api/matches` | All LA match schedule |
| `GET /api/matches/<match_number>` | Single match detail |
| `GET /api/tickets/<match_number>` | Ticket options for one match |
| `GET /api/teams` | Team context |
| `GET /api/players` | Player list (paginated, searchable) |
| `GET /api/players/<team>` | Squad for one team |
| `GET /api/rankings` | FIFA rankings snapshot |
| `GET /api/hotels` | Hotels with coordinates |
| `GET /api/restaurants` | Restaurants (filterable) |
| `GET /api/events` | Events, shows, attractions |
| `GET /api/itinerary` | Personalized journey generation |

---

## Security Notes

- Browser never sees database credentials.
- All SQL uses parameterized queries — no string interpolation with user input.
- `backend/.env` and `frontend/.env` must not be committed (both listed in `.gitignore`).

---

## Smoke Tests

```bash
# Backend health
curl http://127.0.0.1:5001/api/matches
curl http://127.0.0.1:5001/api/hotels
curl "http://127.0.0.1:5001/api/itinerary?type=football&budget=mid&days=3&match_date=jun12&vibe=culture"

# With picks
curl "http://127.0.0.1:5001/api/itinerary?type=luxury&budget=luxury&days=5&match_date=jun21&vibe=nightlife&picks=%5B%7B%22id%22%3A%22hotel-0-Ritz%22%2C%22category%22%3A%22hotels%22%2C%22name%22%3A%22Ritz-Carlton%22%2C%22detail%22%3A%22Downtown%20%C2%B7%20400%2B%2Fnight%22%2C%22markerType%22%3A%22hotel%22%2C%22lat%22%3A34.045%2C%22lng%22%3A-118.264%7D%5D"
```
