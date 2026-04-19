# LA × FIFA World Cup 2026™ — An Old Hollywood Production

A cinematic travel guide for the 2026 FIFA World Cup Los Angeles matches. Full-stack web application: normalized PostgreSQL database → Flask REST API → pure-static frontend. Academic project for APAN5310.

> **Also available in:** [中文 README](README.cn.md)

---

## Project Overview

Targets visitors planning to attend matches at SoFi Stadium, Inglewood, CA (June–July 2026). Covers the full pipeline from raw data → cleaned CSVs → relational database → REST API → frontend website.

**Tech stack**

| Layer | Technology |
|---|---|
| Database | PostgreSQL hosted on DigitalOcean |
| Backend | Python 3 · Flask · psycopg2 · flask-cors |
| Frontend | Pure HTML / CSS / JavaScript — no frameworks, no build step |

**Status:** All three layers complete and connected. Frontend loads live data from the API on startup; falls back to hardcoded data if the API is unreachable.

---

## Repository Structure

```
LA_WorldCup/
├── backend/
│   ├── app.py                  # Flask API server — all /api/* routes
│   ├── queries.py              # SQL query functions (psycopg2)
│   └── setup_database.py      # One-time DB init: CREATE TABLE + import CSVs
│
├── frontend/
│   ├── index.html              # Entry point — empty mount-point divs
│   ├── css/styles.css
│   ├── js/
│   │   ├── api.js              # Fetches from Flask on load; overwrites data.js arrays
│   │   ├── data.js             # Hardcoded fallback data (matches, hotels, restaurants…)
│   │   ├── matches.js          # Match card overlay — details, H2H, players, nearby
│   │   ├── itinerary.js        # Personalised day-by-day itinerary generator
│   │   ├── explore.js          # Map pin filter logic
│   │   └── app.js              # Tab cards, scroll animations, projector intro
│   └── sections/               # Each file injects one page section via innerHTML
│       └── nav · hero · matches · overlay · showcase · itinerary
│           · explore · discover · about · footer
│
├── database/
│   ├── raw_data/               # Original Excel + CSV source files
│   ├── clean_data/             # Import-ready CSVs (clean_<table>.csv)
│   └── docs/                   # ER diagram + data cleaning reports
│
├── archive/
│   └── la_worldcup_oldhollywood.html   # Early single-file prototype
│
├── README.md
└── README.cn.md
```

---

## Running Locally

```bash
# Terminal 1 — Flask API
cd backend
python3 app.py
# → http://127.0.0.1:5000

# Terminal 2 — Frontend
cd frontend
python3 -m http.server 8080
# → http://localhost:8080
```

**Install dependencies once:**
```bash
pip install flask flask-cors psycopg2-binary pandas
```

---

## Frontend Features

### Match Schedule
Eight LA matches displayed as cards. Clicking any card opens a full-screen overlay with:
- Match details (round, date, venue)
- Head-to-head record
- Star players to watch (pulled from `dim_player` via API)
- Nearby Hotels / Restaurants / Events tabs (pulled from API)

### Hotels, Restaurants & Events (Discover)
Tab-switched card grid. On page load, `api.js` fetches live data from the database and re-renders the grid, replacing the hardcoded fallback. Four tabs: **Hotels** (21) · **Restaurants** (32) · **Fan Events** · **Shows & Entertainment**.

### Personalised Itinerary Builder
Users select five inputs to generate a day-by-day itinerary:

| Input | Options |
|---|---|
| Traveler type | Football Fan · Family · Backpacker · Luxury Traveler |
| Budget | Budget ($150–250/day) · Mid ($350–500/day) · Luxury ($700+/day) |
| Trip length | 1–7 days |
| Match date | One of the 8 LA match dates |
| Vibe | Culture · Beach · Nightlife · Film |

**How it works:**
- Each **traveler type** maps to a completely different activity set — Football Fan gets Fan Zones and match bars; Family gets museums and Santa Monica Pier; Backpacker gets free outdoor spots; Luxury Traveler gets Rodeo Drive and Michelin restaurants.
- Each **budget level** within a type has its own activity list.
- **Day 1** always ends with the chosen vibe activity (e.g. Sunset Strip nightlife at 22:00 goes last, not first).
- **Match Day** (Day 3 for 3+ day trips) always closes with ⚽ MATCH AT SOFI STADIUM, regardless of traveler type.
- **Days 2+** rotate through the type's activity pool so days don't repeat identically.

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/matches` | All 8 LA matches |
| `GET /api/matches/<id>` | Single match with venue and notes |
| `GET /api/tickets` | All 46 ticket options |
| `GET /api/tickets/<id>` | Tickets for one match |
| `GET /api/teams` | All LA teams |
| `GET /api/players` | All players |
| `GET /api/players/stars` | Star players only |
| `GET /api/hotels` | All hotels (filter by `/region/<r>` or `/price/<p>`) |
| `GET /api/restaurants` | All restaurants (filter by `/flavor/<f>`) |
| `GET /api/events` | All 139 events (filter by `/category/<c>`) |
| `GET /api/rankings` | FIFA rankings for LA teams |
| `GET /api/routes` | Airport → SoFi transport routes |
| `GET /api/map-data` | Hotel + place coordinates for map pins |

---

## Database Design

Star-schema / dimensional model. ER diagram: `database/docs/APAN5310_ER_Diagram_Simplified_v4.drawio.html`

**Dimension tables**

| Table | Rows | Description |
|---|---|---|
| `dim_team` | 8 | Teams — federation, group, LA matches, FIFA status |
| `dim_player` | 26 | Players — position, club, age, caps, goals, is_star |
| `dim_place` | 10 | Venues, airports, transport hubs (lat/lon) |
| `dim_mode` | 3 | Transport modes: transit · rideshare · drive |
| `dim_event_category` | 23 | Event category labels |

**Fact tables**

| Table | Rows | Description |
|---|---|---|
| `fact_match` | 8 | Date, time, teams, group, stage, venue |
| `fact_ticket` | 46 | Section, level, category, price (USD), availability |
| `fact_hotel` | 21 | Region, star rating, price band, coordinates |
| `fact_restaurant` | 32 | Cuisine, price range, Google review score |
| `fact_event` | 139 | Fan festivals, sports, shows, fan zones |
| `fact_route` | 4 | Airport → SoFi: mode, duration, cost range |
| `fact_ranking` | 8 | FIFA rankings at time of data collection |

**Detail tables**

| Table | Rows | Description |
|---|---|---|
| `event_experience_detail` | 111 | Duration, intensity, photo value, transport, planning tag |
| `event_sports_detail` | 28 | Sport type, ticket price, competition info |

All cleaned CSVs: `database/clean_data/clean_<table_name>.csv`

---

## LA Match Schedule

All matches at **SoFi Stadium** · 1001 S. Stadium Drive, Inglewood, CA 90301

| Match | Date | Time (PT) | Teams | Stage |
|---|---|---|---|---|
| M4 | Jun 12, 2026 (Fri) | 18:00 | USA vs Paraguay | Group D |
| M15 | Jun 15, 2026 (Mon) | 18:00 | Iran vs New Zealand | Group G |
| M26 | Jun 18, 2026 (Thu) | 12:00 | Switzerland vs UEFA Playoff A | Group B |
| M39 | Jun 21, 2026 (Sun) | 12:00 | Belgium vs Iran | Group G |
| M59 | Jun 25, 2026 (Thu) | 19:00 | UEFA Playoff C vs USA | Group D |
| M73 | Jun 28, 2026 (Sun) | 12:00 | TBD vs TBD | Round of 32 |
| M84 | Jul 2, 2026 (Thu) | 12:00 | TBD vs TBD | Round of 32 |
| M98 | Jul 10, 2026 (Fri) | 12:00 | TBD vs TBD | Quarter-Final |

---

## Ticket Pricing Reference

46 options across all 8 matches · source: `database/clean_data/clean_fact_ticket.csv`

| Category | Price (USD) | Notes |
|---|---|---|
| VIP Hospitality | $3,000 | Pechanga Founders Club, Level 1 |
| Category 1 | $450 | Lower Sideline (Sections 111–115) |
| Category 2 | ~$200–350 | Mid-tier seating |
| Category 3 / 4 | ~$80–150 | Upper levels |

---

## Transport: Airports → SoFi Stadium

| Origin | Mode | Duration | Cost |
|---|---|---|---|
| LAX | Public Transit | 46 min | $2–4 |
| BUR (Burbank) | Public Transit | 112 min | $12–16 |

---

## Data Sources

| Dataset | Source |
|---|---|
| Match schedule | SoFi Stadium official site · losangelesfwc26.com |
| Ticket pricing | LA-WC2026-Seat-information.xlsx |
| Hotels & restaurants | Manual curation + Google Reviews |
| Events | discoverlosangeles.com · losangelesfwc26.com · individual venue sites |
| FIFA rankings | FIFA API (fallback: demo values marked in `note` column) |
| Routes | Rome2rio |
| Players | Public football databases |
