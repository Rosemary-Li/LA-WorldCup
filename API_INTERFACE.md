# API Interface Documentation

Contract between the React frontend and the Flask/PostgreSQL backend.

- React sends HTTP requests via `frontend/src/api.js`.
- Flask receives them in `backend/app.py` and calls `backend/queries.py`.
- PostgreSQL returns rows; Flask serializes them as JSON.
- The browser never touches PostgreSQL directly.

---

## Frontend API Client

All requests go through `frontend/src/api.js`:

```js
export const API_BASE = "http://127.0.0.1:5001";

async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${endpoint}`);
  return res.json();
}
```

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

If loading fails, `apiReady = false` and the UI shows a connection error instead of fake data.

---

## Component → API Map

| Component | Data source |
|---|---|
| `PhotoHero` | None |
| `Matches` | `data.matches` (preloaded) |
| `MatchOverlay` | `data.matches/teams/rankings/players`; `loadTickets()` on demand; `loadPlayersByTeam()` on demand |
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

Key fields:

| Field | Description |
|---|---|
| `match_number` | Match ID, e.g. `M4` |
| `date` | Match date |
| `time_pt` | Kickoff time (Pacific) |
| `team1`, `team2` | Teams from database |
| `stage` | Tournament stage |
| `venue` | Stadium name |

---

### `GET /api/matches/<match_number>`

Single match with venue address and notes. Available but the frontend primarily uses preloaded data.

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
| `ticket_category` | Card title |
| `seating_section` | Seat area |
| `price_usd` | Price |
| `ticket_status` | Available / Sold Out |

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

All players. Optional query params: `limit`, `offset`, `search`.

### `GET /api/players/stars`

Star players only.

### `GET /api/players/<team_country>`

Players for one team. Called on demand when Squad tab opens in `MatchOverlay`.

---

### `GET /api/hotels`

All hotels ordered by star rating.

Frontend mapping in `loadSiteData()`:

```js
{
  name:    h.hotel_name,
  region:  cleanParenthetical(h.region),
  address: h.address,
  stars:   Math.round(h.star_rating) || 3,
  price:   h.price_band ? `${h.price_band}/night` : "N/A",
  reviews: h.google_reviews_count || 0,
  lat:     h.latitude,
  lon:     h.longitude
}
```

Used for Explore LA Hotels, map pins, and `MatchOverlay` nearby hotels.

Additional endpoints (available, not used by current UI):
- `GET /api/hotels/region/<region>`
- `GET /api/hotels/price/<price_band>`

---

### `GET /api/restaurants`

Query params: `limit`, `offset`, `search`, `region`.

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

Used for Explore LA Restaurants, `MatchOverlay` nearby restaurants, and Journey meal slots.

Additional endpoint: `GET /api/restaurants/flavor/<flavor>`

---

### `GET /api/events`

Query params: `limit`, `offset`, `search`, `area`.

Joins `fact_event` with `dim_event_category`. Returns `source_url` for official site links.

Frontend category split:

```js
showCats     = new Set([12, 13, 14, 15])
fanEventCats = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 23])
```

- `showCats` → `data.shows`
- `fanEventCats` → `data.fanEvents`
- all events → `data.allEvents` (Attractions drawn from here)

Additional endpoints:
- `GET /api/events/category/<category>`
- `GET /api/events/<event_id>` — full detail including experience/sports sub-detail

---

### `GET /api/itinerary`

Generates a personalized day-by-day trip plan.

**Query parameters:**

| Parameter | Default | Values |
|---|---|---|
| `type` | `football` | `football`, `family`, `backpacker`, `luxury` |
| `budget` | `mid` | `budget`, `mid`, `luxury` |
| `days` | `3` | 1–7 |
| `match_date` | `jun12` | `jun12`, `jun15`, `jun18`, `jun21`, `jun25`, `jun28`, `jul2`, `jul10` |
| `vibe` | `culture` | `culture`, `beach`, `nightlife`, `film` |
| `picks` | `[]` | JSON array of Explore LA selected items |

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

**Backend logic:**

1. Maps `type` → event category IDs → `get_events_by_categories()`
2. Maps `vibe` → vibe event category IDs → `get_events_by_categories()`
3. Maps `budget` → `recommend_hotels_for_budget()` and `recommend_restaurants_for_budget()`
4. If a hotel pick is present, extracts its region and sorts same-area restaurants and events to the front
5. Inserts Explore LA picks into the schedule first (up to 2 per day)
6. Builds each day using a deque-based pool with category deduplication:

| Time | Slot |
|---|---|
| 09:30 | Morning activity (type event, unique category) |
| 12:30 | Lunch (restaurant) |
| 15:00 | Afternoon activity (different category from morning) |
| 18:00 | Evening/vibe activity (different category again) |
| 20:30 | Dinner (restaurant) |

Match day: morning activity → lunch → match. No evening slots.

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
          "desc": "West Hollywood · Fan bar",
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
    "hotel_name": "The Ritz-Carlton, DTLA",
    "region": "Downtown",
    "star_rating": 5,
    "price_band": "400+",
    "latitude": 34.0452,
    "longitude": -118.2643
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

`lat`/`lng` are included on activities when coordinates are available (from `fact_hotel`, or area-based approximation for events/restaurants). The frontend uses these to highlight timeline items on the map on hover.

---

## Explore LA Picks Flow

1. User selects cards in Explore LA → stored in React state.
2. On page refresh, `localStorage` is cleared — selections always start fresh.
3. "Build My Journey →" scrolls to Journey section; picks are passed via `App()` state.
4. On Journey generation, up to 12 picks are serialized as JSON and sent as `picks` query param.
5. Flask parses picks, separates hotel picks from activity picks, and inserts activity picks first in the schedule.
6. The response includes `picks_used` so the frontend can confirm which picks were incorporated.

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
| `dim_event_category` | joined in `/api/events`, `/api/itinerary` |
| `event_experience_detail` | joined in `/api/events/<id>`, `/api/itinerary` |
| `event_sports_detail` | `/api/events/<id>` |
| `fact_route` | In database — not exposed by current API |
| `dim_place` | In database — not exposed by current API |
| `dim_mode` | In database — not exposed by current API |

---

## Security Boundary

The frontend only knows `API_BASE = "http://127.0.0.1:5001"`. It never sees:

- Database host, username, password, or SSL mode
- Raw SQL
- Connection pool internals

All user-controlled query parameters are passed through parameterized SQL in `queries.py`.
