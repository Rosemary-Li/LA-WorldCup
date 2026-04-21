# API Interface Documentation

Contract between the React frontend and the Flask/PostgreSQL backend.

- React sends HTTP requests via `frontend/src/api.js`.
- Flask receives them in `backend/app.py` and calls `backend/queries.py`.
- Journey generation logic lives in `backend/services/itinerary.py`.
- PostgreSQL returns rows; Flask serializes them as JSON.
- The browser never touches PostgreSQL directly.

> 中文版：[API_INTERFACE.cn.md](API_INTERFACE.cn.md)

---

## Frontend API Client

All requests go through `frontend/src/api.js`. The base URL is read from an environment variable:

```js
export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:5001";
```

Set `VITE_API_BASE` in `frontend/.env` to point at any backend host. The Vite dev server also proxies `/api` requests to the same target, so relative paths work in development.

On app mount, `loadSiteData()` fetches all primary datasets in parallel:

```js
Promise.all([
  apiFetch("/api/matches"),
  apiFetch("/api/players"),
  apiFetch("/api/hotels"),
  apiFetch("/api/restaurants"),
  apiFetch("/api/events"),
  apiFetch("/api/rankings"),
  apiFetch("/api/teams"),
])
```

Returns UI-ready state: `{ matches, players, hotels, restaurants, fanEvents, shows, allEvents, rankings, teams }`.

If loading fails, `apiReady = false` and the UI shows a connection error instead of blank data.

---

## Component → API Map

| Component / Hook | Data source |
|---|---|
| `useSiteData` | `loadSiteData()` — parallel fetch on mount |
| `PhotoHero` | None |
| `Matches` | `data.matches` (preloaded) |
| `MatchOverlay` | `data.matches/teams/rankings`; `loadTickets()` on demand; `loadPlayersByTeam()` on demand |
| `ExploreLA` | `data.hotels`, `data.restaurants`, `data.fanEvents`, `data.shows`, `data.allEvents` |
| `SyncMap` | Selected items passed as props (no API call) |
| `Journey` | `generateJourney()` → `GET /api/itinerary` |
| `About` | Static |

---

## Endpoints

### `GET /api/matches`

All Los Angeles matches ordered by date.

```sql
SELECT match_number, date, day_of_week, time_pt,
       team1, team2, "group", stage, venue
FROM fact_match
ORDER BY date, time_pt
```

| Field | Description |
|---|---|
| `match_number` | Match ID, e.g. `M4` |
| `date` | Match date |
| `time_pt` | Kickoff time (Pacific) |
| `team1`, `team2` | Team names from database |
| `stage` | Tournament stage |
| `venue` | Stadium name |

---

### `GET /api/matches/<match_number>`

Single match detail including venue address and notes. Available but the frontend uses preloaded data for most display purposes.

---

### `GET /api/tickets/<match_number>`

Ticket options for one match. Called on demand when the Tickets tab opens in `MatchOverlay`.

```sql
SELECT ticket_id, seating_section, section_level,
       ticket_category, price_usd, ticket_status, matchup
FROM fact_ticket
WHERE match_number = %s
ORDER BY price_usd
```

| Field | UI usage |
|---|---|
| `ticket_category` | Card title (Chinese parentheticals stripped) |
| `seating_section` | Seat area |
| `price_usd` | Displayed as `$XXX` |
| `ticket_status` | Color-coded: green = Available, red = Sold Out |

---

### `GET /api/teams`

All teams playing in LA. Used in `MatchOverlay` for team context.

| Field | Description |
|---|---|
| `country` | Team name |
| `federation` | Confederation |
| `status` | Qualification status |
| `group_stage` | Group code |
| `matches_in_la` | Match involvement in LA |

---

### `GET /api/rankings`

FIFA ranking snapshot for all LA teams.

| Field | Description |
|---|---|
| `country` | Country |
| `rank` | FIFA rank |
| `total_points` | Ranking points |
| `rank_change` | Movement from previous ranking |

---

### `GET /api/players`

All players. Optional query params: `limit` (default 500), `offset` (default 0), `search`.

### `GET /api/players/stars`

Star players only (`is_star = true`).

### `GET /api/players/<team_country>`

Players for one team. Called on demand when the Squad tab opens in `MatchOverlay`.

| Field | UI usage |
|---|---|
| `player_name` | Name (star players suffixed with `★`) |
| `position` | Position |
| `club` | Club name |
| `caps` | International appearances |
| `goals` | International goals |

---

### `GET /api/hotels`

All hotels ordered by star rating descending.

Frontend mapping in `loadSiteData()`:

```js
{
  name:    h.hotel_name,
  region:  cleanParenthetical(h.region),   // strips "(注释)" style annotations
  address: h.address,
  stars:   Math.round(h.star_rating) || 3,
  price:   h.price_band ? `${h.price_band}/night` : "N/A",
  reviews: h.google_reviews_count || 0,
  lat:     h.latitude,
  lon:     h.longitude
}
```

Used for: Explore LA Hotels tab, map pins, `MatchOverlay` nearby hotels, and Journey hotel recommendation.

Additional endpoints (available, not called by current UI):
- `GET /api/hotels/region/<region>`
- `GET /api/hotels/price/<price_band>`

---

### `GET /api/restaurants`

Query params: `limit` (default 500), `offset`, `search`, `region`.

Frontend mapping:

```js
{
  name:   r.restaurant_name,
  region: r.region,
  price:  r.price_range,
  flavor: r.flavor,
  score:  r.google_review_score
}
```

Used for: Explore LA Restaurants tab, `MatchOverlay` nearby restaurants, Journey meal slots.

Additional endpoint: `GET /api/restaurants/flavor/<flavor>`

---

### `GET /api/events`

Query params: `limit` (default 500), `offset`, `search`, `area`.

Joins `fact_event` with `dim_event_category`. Returns `source_url` for official site links.

Frontend category split at load time:

```js
showCats     = new Set([12, 13, 14, 15])      // → data.shows
fanEventCats = new Set([1-11, 23])             // → data.fanEvents
// all events → data.allEvents (Attractions drawn from category IDs 16-22)
```

Additional endpoints:
- `GET /api/events/category/<category>`
- `GET /api/events/<event_id>` — full detail including `event_experience_detail` and `event_sports_detail` joins

---

### `GET /api/itinerary`

Generates a personalized day-by-day trip plan. Logic lives in `backend/services/itinerary.py`; the Flask route only parses query params.

**Query parameters:**

| Parameter | Default | Values |
|---|---|---|
| `type` | `football` | `football`, `family`, `backpacker`, `luxury` |
| `budget` | `mid` | `budget`, `mid`, `luxury` |
| `days` | `3` | 1–7 |
| `match_date` | `jun12` | `jun12`, `jun15`, `jun18`, `jun21`, `jun25`, `jun28`, `jul2`, `jul10` |
| `vibe` | `culture` | `culture`, `beach`, `nightlife`, `film` |
| `picks` | `[]` | URL-encoded JSON array of Explore LA selected items |

**`picks` item shape:**

```json
{
  "id": "hotel-0-The Ritz-Carlton",
  "category": "hotels",
  "name": "The Ritz-Carlton, DTLA",
  "detail": "Downtown · 400+/night",
  "markerType": "hotel",
  "lat": 34.0452,
  "lng": -118.2643,
  "officialUrl": "https://..."
}
```

**Backend logic (in `services/itinerary.py`):**

1. Maps `type` → event category IDs → `get_events_by_categories()`
2. Maps `vibe` → vibe event category IDs → `get_events_by_categories()`
3. Maps `budget` → `recommend_hotels_for_budget()` and `recommend_restaurants_for_budget()`
4. Deduplicates: vibe events that already appear in type events are moved to the vibe pool only
5. Shuffles with a deterministic seed so same params yield the same schedule
6. Extracts base area from the selected hotel pick (or top recommended hotel); floats same-area restaurants and events to the front
7. Inserts Explore LA activity picks first (up to 2 per day)
8. Builds each day from deque-based pools with per-day category deduplication:

| Time | Slot |
|---|---|
| 09:30 | Morning activity (type event, unique category) |
| 12:30 | Lunch (restaurant) |
| 15:00 | Afternoon activity (different category) |
| 18:00 | Evening/vibe activity (different category again) |
| 20:30 | Dinner (restaurant) |

Match day: morning activity → lunch → match. No evening slots.

**Match date and area coordinate configuration:**

Match labels live in `backend/config/matches.json`. LA area coordinates live in `backend/config/areas.json`. Both are loaded at service startup — no code change needed to update them.

**Response shape:**

```json
{
  "days": [
    {
      "day_num": 1,
      "label": "Day 1 · Arrival & First Impressions",
      "activities": [
        {
          "time": "09:30",
          "title": "Tom's Watch Bar",
          "desc": "West Hollywood · Watch Party",
          "source": "event",
          "id": "EVT_042",
          "lat": 34.09,
          "lng": -118.36
        },
        {
          "time": "12:30",
          "title": "Lunch at Forma Restaurant & Cheese Bar",
          "desc": "Santa Monica · Italian · $50-100 · ⭐ 4.5",
          "source": "restaurant",
          "id": "RST_007",
          "lat": 34.0195,
          "lng": -118.4912
        }
      ]
    }
  ],
  "hotel": {
    "hotel_name": "Hotel Erwin",
    "region": "Venice",
    "star_rating": 4,
    "price_band": "200+",
    "latitude": 33.985,
    "longitude": -118.4695
  },
  "match": {
    "date": "June 12",
    "time": "18:00",
    "label": "USA vs Paraguay (M4)"
  },
  "budget_label": "mid",
  "traveler": "football",
  "picks_used": []
}
```

`lat`/`lng` are included on activities when available (exact coordinates from `fact_hotel`, or area-centroid approximations for events/restaurants from `config/areas.json`). The frontend uses these to highlight timeline items on the map on hover.

Activity `source` values:

| `source` | Label shown | Origin |
|---|---|---|
| `event` | `EVENT` | `fact_event` row |
| `restaurant` | `DINE` | `fact_restaurant` row |
| `match` | `MATCH` | Fixed match activity |
| `explore_pick` | `PICK` | User-selected Explore LA item |

---

## Explore LA Picks Flow

1. User selects cards in Explore LA → stored in React state (`ExploreLA.jsx`) and `localStorage`.
2. On page refresh, `localStorage` is cleared — selections always start fresh per visit.
3. "Build My Journey →" scrolls to Journey; picks are passed via `App` state down to `Journey`.
4. On submission, up to 12 picks are serialized as JSON and sent as the `picks` query parameter.
5. `services/itinerary.py` separates hotel picks (for area-matching) from activity picks (for schedule insertion).
6. The response includes `picks_used` so the frontend can display a count of incorporated picks.

---

## All Endpoints

| Endpoint | Status |
|---|---|
| `GET /api/matches` | Used |
| `GET /api/matches/<match_number>` | Available |
| `GET /api/tickets/<match_number>` | Used (on demand) |
| `GET /api/tickets` | Available |
| `GET /api/teams` | Used |
| `GET /api/teams/<country>` | Available |
| `GET /api/players` | Used |
| `GET /api/players/stars` | Available |
| `GET /api/players/<team_country>` | Used (on demand) |
| `GET /api/rankings` | Used |
| `GET /api/hotels` | Used |
| `GET /api/hotels/region/<region>` | Available |
| `GET /api/hotels/price/<price_band>` | Available |
| `GET /api/restaurants` | Used |
| `GET /api/restaurants/flavor/<flavor>` | Available |
| `GET /api/events` | Used |
| `GET /api/events/category/<category>` | Available |
| `GET /api/events/<event_id>` | Available |
| `GET /api/itinerary` | Used |

---

## Database → API Map

| Table | Endpoints |
|---|---|
| `fact_match` | `/api/matches`, `/api/matches/<match_number>` |
| `fact_ticket` | `/api/tickets`, `/api/tickets/<match_number>` |
| `dim_team` | `/api/teams`, `/api/teams/<country>` |
| `dim_player` | `/api/players`, `/api/players/<team>`, `/api/players/stars` |
| `fact_ranking` | `/api/rankings` |
| `fact_hotel` | `/api/hotels`, `/api/hotels/region/<r>`, `/api/hotels/price/<p>`, `/api/itinerary` |
| `fact_restaurant` | `/api/restaurants`, `/api/restaurants/flavor/<f>`, `/api/itinerary` |
| `fact_event` | `/api/events`, `/api/events/<id>`, `/api/events/category/<c>`, `/api/itinerary` |
| `dim_event_category` | Joined in `/api/events`, `/api/itinerary` |
| `event_experience_detail` | Joined in `/api/events/<id>` |
| `event_sports_detail` | `/api/events/<id>` |
| `fact_route` | In database — not exposed by current API |
| `dim_place` | In database — not exposed by current API |
| `dim_mode` | In database — not exposed by current API |

---

## Security Boundary

The frontend reads `VITE_API_BASE` from its environment — it never sees:

- Database host, username, password, or SSL mode
- Raw SQL
- Connection pool internals

All user-controlled query parameters flow through parameterized SQL in `queries.py`. No string interpolation with user input anywhere in the codebase.
