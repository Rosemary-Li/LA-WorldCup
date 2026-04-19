# LA × FIFA World Cup 2026™ — An Old Hollywood Production

A cinematic travel guide for the 2026 FIFA World Cup Los Angeles matches, combining a normalized SQL database with a pure-static frontend. Built as an academic project for APAN5310.

> **Also available in:** [中文 README](README.cn.md)

---

## Project Overview

This project covers the full pipeline from raw data → cleaned CSVs → relational database design → frontend website. It targets visitors planning to attend World Cup matches at SoFi Stadium in Inglewood, CA (June–July 2026), helping them find matches, buy tickets, book hotels, discover restaurants, and plan day itineraries.

**Status:** Database and data layers are complete. Frontend is connected to the Flask API backend.

---

## Repository Structure

```
LA_WorldCup/
├── backend/                            # Python / Flask API server
│   ├── app.py                          # Flask routes (/api/matches, /api/hotels, ...)
│   ├── queries.py                      # SQL query functions (psycopg2)
│   └── setup_database.py              # One-time DB setup: CREATE TABLE + CSV import
│
├── frontend/                           # Static website (pure HTML/CSS/JS)
│   ├── index.html                      # Entry point — section mount points
│   ├── css/styles.css
│   ├── js/
│   │   ├── api.js                      # Fetches live data from Flask, overrides data.js
│   │   ├── data.js                     # Hardcoded fallback data
│   │   ├── matches.js                  # Match overlay logic
│   │   ├── itinerary.js               # Itinerary builder
│   │   ├── explore.js                  # Map filter logic
│   │   └── app.js                      # Projector, tab cards, scroll animations
│   └── sections/                       # Page sections injected into mount points
│       └── nav / hero / matches / overlay / showcase /
│           itinerary / explore / discover / about / footer
│
├── database/                           # All data assets
│   ├── raw_data/                       # Original Excel + CSV source files
│   ├── clean_data/                     # Cleaned, import-ready CSVs (clean_*.csv)
│   └── docs/                           # ER diagram + data cleaning reports
│
├── archive/                            # Early single-file prototype
│   └── la_worldcup_oldhollywood.html
│
├── README.md
└── README.cn.md
```

---

## Database Design

### Entity-Relationship Model

The schema follows a star-schema / dimensional model with dimension tables and fact tables. The ER diagram is at `database/docs/APAN5310_ER_Diagram_Simplified_v4.drawio.html`.

### Tables

**Dimension tables**

| Table | Rows | Description |
|---|---|---|
| `dim_team` | 8 | Teams playing in LA, with federation, group, LA match numbers, FIFA status |
| `dim_player` | 26 | Star players per team — position, club, age, caps, goals |
| `dim_place` | 10 | Venues, airports, and transport hubs (with lat/lon) |
| `dim_mode` | 3 | Transport modes: transit, rideshare, drive |
| `dim_event_category` | 23 | Event category labels (Fan Festival, Fan Zone, MLB, Tennis, etc.) |

**Fact tables**

| Table | Rows | Description |
|---|---|---|
| `fact_match` | 8 | All LA matches — date, time, teams, group, stage, venue |
| `fact_ticket` | 46 | Ticket options per match — section, level, category, price (USD), availability |
| `fact_hotel` | 21 | Hotels — region, address, star rating, room count, price band, coordinates |
| `fact_restaurant` | 32 | Restaurants — region, cuisine, price range, Google review score |
| `fact_event` | 139 | All events — fan festivals, sports (MLB/NBA/tennis/etc.), shows, fan zones |
| `fact_route` | 4 | Airport-to-SoFi routes — mode, duration (min), cost range |
| `fact_ranking` | 8 | FIFA rankings for LA teams at time of data collection |

**Detail tables**

| Table | Rows | Description |
|---|---|---|
| `event_experience_detail` | 111 | Rich attributes for experience events: duration, intensity, photo value, transportation, planning tag |
| `event_sports_detail` | 28 | Sports-specific fields: sport type, ticket price, competition info |

### Clean Data (CSV)

All cleaned, import-ready CSVs are in `database/clean_data/`. Naming convention: `clean_<table_name>.csv`.

---

## LA Match Schedule

All matches at **SoFi Stadium**, 1001 S. Stadium Drive, Inglewood, CA 90301.

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

Prices sourced from `clean_fact_ticket.csv` (46 options across all 8 matches):

| Category | Price (USD) | Notes |
|---|---|---|
| VIP Hospitality | $3,000 | Pechanga Founders Club, Level 1 |
| Category 1 | $450 | Lower Sideline (Sections 111–115) |
| Category 2 | ~$200–350 | Mid-tier seating |
| Category 3 / 4 | ~$80–150 | Upper levels |

---

## Transport: Airports → SoFi Stadium

From `database/clean_data/clean_fact_route.csv`:

| Origin | Mode | Duration | Cost |
|---|---|---|---|
| LAX | Public Transit | 46 min | $2–4 |
| BUR (Burbank) | Public Transit | 112 min | $12–16 |

---

## Frontend (In Progress)

The website is built as a pure static site — no framework, no build step.

**Current state:** All sections render from `sections/*.js` injecting HTML into mount points in `index.html`. `js/api.js` fetches live data from the Flask backend at startup and overrides the hardcoded fallback data in `js/data.js`.

### Running locally

```bash
# 1. Start the Flask API (terminal 1)
cd backend
python3 app.py
# API runs at http://127.0.0.1:5000

# 2. Serve the frontend (terminal 2)
cd frontend
python3 -m http.server 8080
# Visit http://localhost:8080
```

### Tech stack

- Pure HTML / CSS / JavaScript — no frameworks, no bundlers
- Fonts: Playfair Display, IM Fell English, Cormorant Garamond, DM Mono (Google Fonts)
- Scroll animations via `IntersectionObserver`
- Film projector intro animation (currently disabled — re-enable in `app.js`)

---

## Data Sources

| Dataset | Source |
|---|---|
| Match schedule | SoFi Stadium official site, losangelesfwc26.com |
| Ticket pricing | LA-WC2026-Seat-information.xlsx |
| Hotels & restaurants | Manual curation + Google Reviews |
| Events | discoverlosangeles.com, losangelesfwc26.com, individual venue sites |
| FIFA rankings | FIFA API (fallback: demo values, marked in `note` column) |
| Routes | Rome2rio |
| Players | Public football databases |
