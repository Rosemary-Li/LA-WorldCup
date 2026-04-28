# LA × FIFA World Cup 2026

Full-stack APAN5310 project for the FIFA World Cup 2026 Los Angeles experience. A React/Vite frontend talks to a Flask REST API backed by a normalized PostgreSQL database, helping visitors explore LA match schedules, team context, hotels, restaurants, fan events, shows, attractions, and personalized travel itineraries.

> 中文版：[README.cn.md](README.cn.md)
> API reference: [API_INTERFACE.md](API_INTERFACE.md)

---

## Architecture

```text
raw Excel / CSV files
    → cleaned CSV files
    → PostgreSQL dimensional schema (DigitalOcean managed)
    → SQL query layer        backend/queries.py
    → itinerary service      backend/services/itinerary.py
    → Flask JSON API         backend/app.py
    → React API client       frontend/src/api.js
    → React UI               frontend/src/
```

The browser never connects to PostgreSQL. React only calls Flask endpoints. Database credentials stay in `backend/.env`.

---

## User Flow

One scroll-snap page; six full-viewport sections plus a snap-aligned itinerary result panel.

1. **Photo Hero** — Full-bleed LA × WC26 landing slide.
2. **Matches** — Eight LA matches at SoFi Stadium. Multi-select with checkboxes; selected matches feed Journey. Click any row to open the match overlay.
3. **Match Overlay** — Stage, date/time, team flags + FIFA rankings, AI-generated match story (Anthropic), live H2H stats (API-Football), and Players to Watch with photos.
4. **Journey** — Step-card form: Your Matches · Who's Coming · Trip Preferences · Generate. The hero photo on the left switches per traveler type. CTA scrolls to Explore LA.
5. **Explore LA** — Magazine-style typography entry view (HOTEL · Restaurant · Show · Attraction · vertical FAN EVENT) with a featured photo that swaps on hover. Each category opens a split view with cards + Leaflet map, plus a magazine-style **search bar** (matches name / area / region / type / flavor as you type). "Build My Journey →" triggers itinerary generation.
6. **Itinerary** — Snap-aligned result panel with summary card (tags, match, hotel, picks count + hero photo), per-day timeline cards (per-activity photo, transit/duration/price chips), and a full-height map on the right. Hovering a timeline item highlights its marker; clicking the photo or arrow opens the official site. Each activity also gets hover-revealed action chips:
   - **✎ Edit / swap** opens an **Activity Picker** modal — search the entire DB (restaurants / events / shows / attractions) and replace the planner's pick with a real entry, or just adjust the time
   - **× Delete** removes the activity
   - **📅 Add to Google Calendar** opens a one-event Google Calendar URL pre-filled with the title, time, location
   - Per-day **+ Add activity from database** button at the bottom of each stack
   - Top-right of the summary card: **↓ Calendar** (downloads a multi-event `.ics` for batch import into any calendar app) and **✦ Share** (see below)
7. **About** — Team profiles with DiceBear avatars and GitHub links.

### Share modal (✦ Share button on the itinerary)

- Generates a 1080×1920 IG-Stories-shaped poster of the trip via `html2canvas` (lazy-loaded so it doesn't bloat the initial bundle). The card grows taller for long trips — width stays at 1080.
- Persists the current itinerary to Postgres (`POST /api/itinerary/save`) and embeds a short `?i=<id>` link in every share, so the recipient sees the **exact same plan** instead of the homepage.
- Five action buttons: **Copy link · X · LinkedIn · Reddit · Download PNG**. On mobile a prominent IG-gradient CTA at the top calls `navigator.share({ files: [pngFile], url: shareUrl })`, opening the OS share sheet so the user can hand the image directly to Instagram (Story / Feed / Direct).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL (DigitalOcean managed) |
| ETL | Python, pandas, psycopg2 |
| Backend | Flask 3.1, flask-cors, psycopg2-binary, python-dotenv |
| LLM (match story) | Anthropic SDK — Claude Opus 4.7 with `messages.parse()` + Pydantic |
| Sports data | API-Football (api-sports.io) — H2H, form, rankings |
| Frontend | React 19, Vite 7 |
| Typography | Playfair Display (single font, app-wide) |
| Maps | Leaflet.js via CDN + CARTO Dark Matter tiles |
| Place imagery | One-shot Node scripts → og:image / Wikipedia → local files |
| Share posters | `html2canvas` (lazy-imported) → 1080×1920 PNG → Web Share API + per-platform intent URLs |
| Calendar export | RFC 5545 `.ics` builder + Google Calendar `eventedit` URLs (`frontend/src/lib/calendar.js`) |

---

## Repository Structure

```text
LA_WorldCup/
├── backend/
│   ├── app.py                    # Flask routes (thin controller)
│   ├── queries.py                # PostgreSQL query layer + connection pool
│   ├── setup_database.py         # Schema creation + CSV import
│   ├── requirements.txt          # Pinned Python dependencies
│   ├── .env / .env.example       # DB + API keys (gitignored)
│   ├── services/
│   │   ├── itinerary.py          # Two-phase journey generator
│   │   ├── match_story.py        # Anthropic match-story generator (with circuit breaker)
│   │   └── match_data.py         # API-Football integration (3-layer cache)
│   ├── config/
│   │   ├── matches.json          # Match metadata
│   │   └── areas.json            # LA area → lat/lon mapping
│   └── .cache/                   # match_stats.json (file cache for API-Football)
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js            # Dev proxy for /api
│   ├── package.json
│   ├── .env / .env.example       # VITE_API_BASE
│   ├── css/
│   │   ├── styles.css            # Entry point — @import the modules below
│   │   └── modules/              # Per-section modules (split from old monolith)
│   │       ├── globals.css       # Palette, snap layout, page dots, root vars
│   │       ├── nav.css           # Top navigation bar
│   │       ├── shared.css        # <section> defaults + mount-* fillers
│   │       ├── photo-hero.css    # Landing slide
│   │       ├── matches.css       # Schedule + table + nav buttons
│   │       ├── match-overlay.css # Modal shell + mo2-* page styles
│   │       ├── journey.css       # Hero + step cards + result
│   │       ├── explore-la.css    # Magazine + opened-category split view
│   │       ├── about.css         # Team grid + bios
│   │       └── section-divider.css
│   ├── public/images/
│   │   ├── *                     # bundled hero + category fallback images
│   │   └── places/               # 100+ scraped per-place photos (og:image / Wikipedia)
│   ├── scripts/
│   │   ├── scrape-place-images.mjs        # Pass 1: og:image scrape from PLACE_URLS
│   │   ├── scrape-place-images-retry.mjs  # Pass 2: Wikipedia fallback
│   │   ├── scrape-place-images-retry2.mjs # Pass 3: REST API + backoff
│   │   ├── scrape-place-images-retry3.mjs # Pass 4: hotels via parent-chain articles
│   │   ├── scrape-place-images-retry4.mjs # Pass 5: neighborhood fallbacks
│   │   ├── scrape-place-images-retry5.mjs # Restaurants — JPG-only enforced
│   │   └── scrape-place-images-retry6.mjs # Shows + attractions + fan events
│   └── src/
│       ├── main.jsx              # App root, lifted state, scroll callbacks
│       ├── api.js                # Fetch wrapper with AbortController timeout
│       ├── placeMedia.js         # Resolves name → official URL + image
│       ├── placeImages.json      # Generated by scrape scripts (118 entries)
│       ├── components/
│       │   ├── Nav.jsx           # Top nav with smart Itinerary scroll
│       │   ├── SyncMap.jsx       # Leaflet map with name-first highlight matching
│       │   ├── ExCard.jsx        # Explore item card
│       │   ├── FilterRow.jsx     # Pill / select filter row
│       │   ├── DataNotice.jsx    # Loading / error / retry banner
│       │   ├── ShareCard.jsx     # Off-screen 1080×1920 IG-Stories template
│       │   ├── ShareModal.jsx    # Share sheet (preview + 5 social buttons + IG CTA on mobile)
│       │   └── ActivityPicker.jsx # Modal: pick a real DB activity to add/swap on the itinerary
│       ├── lib/
│       │   ├── calendar.js       # ICS builder + Google Calendar URL helpers
│       │   └── explorePool.js    # Shared activity pool (used by ExploreLA + ActivityPicker)
│       ├── sections/
│       │   ├── PhotoHero.jsx
│       │   ├── Matches.jsx       # Schedule with multi-select
│       │   ├── ExploreLA.jsx     # Magazine entry + opened category view (with search bar)
│       │   ├── Journey.jsx       # Form + JourneyResult (edit/add/delete + Calendar + Share)
│       │   ├── MatchOverlay.jsx
│       │   └── About.jsx
│       ├── hooks/
│       │   └── useSiteData.js    # Parallel fetch + retry-with-backoff + refetch
│       └── constants/
│           ├── matches.js        # matchRows, matchMeta
│           ├── explore.js        # Category config, AREA_COORDS
│           └── journey.js        # Form field config, activity marks
│
├── database/
│   ├── raw_data/
│   ├── clean_data/
│   ├── migrations/
│   │   └── 001_journey_share.sql # journey_share table for persisted share links
│   └── docs/                     # ER diagram
│
├── backend/scripts/
│   └── init_share_table.py       # One-shot runner for the journey_share migration
│
├── archive/                      # Prior iterations (historical reference)
├── API_INTERFACE.md / .cn.md     # Endpoint reference (this + Chinese)
└── README.md / .cn.md            # This file (+ Chinese)
```

---

## Local Setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSLMODE
# Optional: ANTHROPIC_API_KEY (match story), API_FOOTBALL_KEY (live stats)

# Apply the share-link migration once (idempotent):
python3 scripts/init_share_table.py

python3 app.py
# → http://127.0.0.1:5001
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Default: VITE_API_BASE=http://127.0.0.1:5001
npm install
npm run dev
# → http://127.0.0.1:5173
```

> **Different machines / ports:** only `frontend/.env` needs to change — no source code edits required.

### Place image pipeline (one-shot, optional)

The repo ships with `frontend/src/placeImages.json` and `frontend/public/images/places/` already populated (118 entries, ~100 unique JPG files). Re-run only if you change the URL list in `placeMedia.js`:

```bash
node frontend/scripts/scrape-place-images.mjs           # initial og:image pass
node frontend/scripts/scrape-place-images-retry2.mjs    # Wikipedia REST fallbacks
# (additional retry scripts handle hotels / restaurants / shows / fan events)
```

The scrapers use polite UA strings + exponential backoff and are safe to re-run.

---

## Database Design

Dimensional model — dimension tables hold stable reference data, fact tables hold transactional records, and the detail tables enrich `fact_event` with itinerary-grade metadata.

### Dimension Tables

| Table | Contents |
|---|---|
| `dim_team` | Countries, federations, group stage, qualification status |
| `dim_player` | Names, teams, positions, clubs, ages, caps, goals, star flags |
| `dim_place` | Stadiums, airports, transport places with coordinates |
| `dim_mode` | Transport mode metadata |
| `dim_event_category` | Category labels referenced by event + journey queries |

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
| `event_experience_detail` | 14 columns: key_experience, recommended_duration, suitable_for, transportation, spatial_character, planning_tag, ticket_price, admission_info, price_level, crowdedness, intensity_level, night_friendly, photo_value, commercial_level |
| `event_sports_detail` | Sport type and competition info |

All 14 `event_experience_detail` columns are now surfaced in the `/api/itinerary` payload and rendered as chips in the Itinerary view.

### Share table

| Table | Contents |
|---|---|
| `journey_share` | `id` (8-char URL-safe), `payload` (JSONB itinerary), `created_at`, `view_count`. Created by [`database/migrations/001_journey_share.sql`](database/migrations/001_journey_share.sql) — apply with `python3 backend/scripts/init_share_table.py`. |

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
| 09:30 | Morning activity |
| 12:30 | Lunch (restaurant) |
| 15:00 | Afternoon activity (different category) |
| 18:00 | Evening / vibe activity |
| 20:30 | Dinner (restaurant) |

Match day: morning activity → lunch → match. No evening slots.

**Scoring + rules** (`itinerary.py` Phase B — `fill_day_slots`):
- Hard penalties (≤ −500 → skipped): same restaurant repeated, same event category twice in a day, same activity reused across days.
- Soft bonuses: traveler-type match, vibe match, slot fit, day anchor area, near stadium on match day, Explore LA pick.
- Soft penalties: wrong area, cross-day category repeat, area overload (≥3 activities in one area).
- Same parameter set + same `variant` → deterministic output.
- **No upper limit on days** — the previous 7-day cap was removed; itineraries scale with the date range the user picks.

Match dates and LA area coordinates live in `backend/config/matches.json` and `backend/config/areas.json` — update them without touching Python.

---

## Place Image Pipeline

Each Explore LA card and each Itinerary activity shows a real place photo. The pipeline:

1. **Source list** — `PLACE_URLS` in `frontend/src/placeMedia.js` maps lowercase place names → official URLs (~110 entries).
2. **Scrape** — `frontend/scripts/scrape-place-images*.mjs` fetch each official site, extract `og:image` / `twitter:image`, download to `frontend/public/images/places/{slug}.jpg`. Failures (sites without og:image, 403/404, etc.) fall back to Wikipedia REST API summary photos via curated alternate articles.
3. **Map** — `frontend/src/placeImages.json` (generated) holds `{ "<lowercase name>": "images/places/{slug}.jpg" }`.
4. **Resolution chain** — at render time `mediaForPlace(name, category)` returns:
   - the local scraped image if present, else
   - a live thum.io screenshot of the official site, else
   - a per-category bundled fallback (`images/hotel.jpg`, etc. — `events` rotates across 5 photos by name hash so cards don't all look the same).

Re-running the scrapers is safe and idempotent. The repo ships with the JSON map + downloaded images so a clean clone works without running them.

---

## Reliability + UX Hardening

- **API timeouts** — `frontend/src/api.js` wraps `fetch` with `AbortController` (15s default; 30s for `/api/itinerary`). A hung backend can no longer freeze the UI.
- **Self-healing data load** — `useSiteData` retries up to 4 times with exponential backoff (1s, 2s, 4s) and exposes a `refetch()` callback so the user can manually retry from the `DataNotice` banner.
- **Map highlight match** — `SyncMap` matches by name first (precise) then falls back to coords (catches deduped collision-mate markers). Hover always fires, even for activities without coords.
- **Click-through** — Itinerary activity photos and right-side `›` arrows open the official site in a new tab.
- **Diagnostic logging** — every link in the click chain logs to console with `[explore]` / `[journey]` / `[api]` prefixes, so silent failures are observable in DevTools.
- **Build button** — gated inside the click handler instead of via `disabled={…}` (which made React route clicks to `noop1` and silently drop them).
- **Mobile responsive overhaul** — the whole site now adapts at `<= 768px`: scroll-snap is relaxed (touch swipes feel jerky against `mandatory`), nav collapses to a single centered row, Explore LA stacks the map under the cards, Journey form switches to single-column with stacked traveler/stat cards, the share button moves below the summary card, and the result page hides the side map (the timeline is the deliverable on a phone).
- **Defensive overflow guard** — every `#mount-*` section gets `overflow-x: hidden; max-width: 100vw` on mobile so any single overflowing child can't push the whole page wider than the viewport.

---

## API Summary

See [API_INTERFACE.md](API_INTERFACE.md) for full request/response shapes.

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
| `GET /api/events` | Events, shows, attractions (joined with experience details) |
| `GET /api/itinerary` | Personalized journey generation (now ships full 14-field detail per activity) |
| `GET /api/match-story/<match_number>` | LLM-generated match story (Anthropic; circuit breaker on credit-out) |
| `GET /api/match-stats/<match_number>` | Live H2H + form (API-Football, 3-layer cache) |
| `POST /api/itinerary/save` | Persist a generated/edited itinerary, returns short ID |
| `GET /api/itinerary/share/<id>` | Re-hydrate a shared itinerary; auto-bumps `view_count` |

---

## Security

- Browser never sees database credentials.
- All SQL uses parameterized queries — no string interpolation with user input.
- `backend/.env` and `frontend/.env` are gitignored.
- Anthropic + API-Football keys live only in `backend/.env`; the frontend never sees them.

---

## Smoke Tests

```bash
# Backend health
curl http://127.0.0.1:5001/api/matches | head -100
curl http://127.0.0.1:5001/api/hotels  | head -100

# Itinerary (default)
curl "http://127.0.0.1:5001/api/itinerary?type=solo&budget=mid&days=3&match_date=jun12&vibe=culture"

# Itinerary with Explore LA picks
curl "http://127.0.0.1:5001/api/itinerary?type=couple&budget=luxury&days=5&match_date=jun21&vibe=nightlife&picks=%5B%7B%22id%22%3A%22hotel-0-Ritz%22%2C%22category%22%3A%22hotels%22%2C%22name%22%3A%22Ritz-Carlton%22%2C%22detail%22%3A%22Downtown%22%2C%22markerType%22%3A%22hotel%22%2C%22lat%22%3A34.045%2C%22lng%22%3A-118.264%7D%5D"
```
