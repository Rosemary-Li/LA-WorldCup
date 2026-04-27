# API Interface Documentation

Contract between the React frontend and the Flask/PostgreSQL backend.

- React sends HTTP requests via `frontend/src/api.js`.
- Flask receives them in `backend/app.py` and calls `backend/queries.py`.
- Journey generation logic lives in `backend/services/itinerary.py`.
- Match story and live H2H stats live in `backend/services/match_story.py` (Anthropic) and `backend/services/match_data.py` (API-Football).
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

### Timeout + abort

`apiFetch` wraps `fetch` with an `AbortController`. Default timeout is 15s; `/api/itinerary` uses 30s because itinerary generation can be slow:

```js
async function apiFetch(endpoint, { timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { signal: ctrl.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} on ${endpoint}${text ? ` — ${text.slice(0,200)}` : ""}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`Request timed out after ${timeoutMs/1000}s: ${endpoint}`);
    throw err;
  } finally { clearTimeout(t); }
}
```

A hung backend can no longer freeze the UI. Each request logs `[api] →` / `[api] ✓` / `[api] ✗` to the browser console with the actual error message.

### Initial parallel fetch

On app mount, `useSiteData` calls `loadSiteData()` which fetches all primary datasets in parallel:

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

### Self-heal on failure

`useSiteData` retries the parallel fetch up to 4 times with exponential backoff (1s, 2s, 4s) before settling into the error state. It also exposes a `refetch()` callback so the user can manually retry from the `DataNotice` "Retry" button:

```js
const { data, apiReady, apiError, refetch } = useSiteData();
```

If all retries fail, `apiReady = false` and the UI shows a connection error with a retry button instead of blank data.

---

## Component → API Map

| Component / Hook | Data source |
|---|---|
| `useSiteData` | `loadSiteData()` — parallel fetch on mount, retry-with-backoff, exposes `refetch()` |
| `PhotoHero` | None |
| `Matches` | `data.matches` (preloaded) |
| `MatchOverlay` | `data.matches/teams/rankings`; `loadMatchStory(num)` + `loadMatchStats(num)` on demand |
| `ExploreLA` | `data.hotels`, `data.restaurants`, `data.fanEvents`, `data.shows`, `data.allEvents` |
| `SyncMap` | Selected items passed as props (no API call) |
| `Journey` (form) | `selectedMatches`, `explorePicks` from App state |
| `Journey.submit()` | `generateJourney()` → `GET /api/itinerary` |
| `JourneyResult` | The `data` returned by `generateJourney()` |
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

Single match detail including venue address and notes. Available; the frontend uses preloaded data for most display.

---

### `GET /api/tickets/<match_number>`

Ticket options for one match.

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

Players for one team. Called on demand when a team panel opens.

---

### `GET /api/hotels`

All hotels ordered by star rating descending.

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

Used for: Explore LA Hotels view, map pins, and Journey hotel recommendation.

Additional: `GET /api/hotels/region/<region>`, `GET /api/hotels/price/<price_band>`.

---

### `GET /api/restaurants`

Query params: `limit` (default 500), `offset`, `search`, `region`.

```js
{ name: r.restaurant_name, region: r.region, price: r.price_range, flavor: r.flavor, score: r.google_review_score }
```

Used for: Explore LA Restaurants view, Journey meal slots.

Additional: `GET /api/restaurants/flavor/<flavor>`.

---

### `GET /api/events`

Query params: `limit` (default 500), `offset`, `search`, `area`.

Joins `fact_event` with `dim_event_category`. Returns `source_url` for official site links.

Frontend category split at load time (`api.js`):

```js
showCats     = new Set([12, 13, 14, 15])           // → data.shows
fanEventCats = new Set([1,2,3,4,5,6,7,8,9,10,11,23]) // → data.fanEvents
// All events → data.allEvents (Attractions drawn from category IDs 16-22)
```

Additional:
- `GET /api/events/category/<category>`
- `GET /api/events/<event_id>` — full detail with `event_experience_detail` and `event_sports_detail` joins

---

### `GET /api/itinerary`

Generates a personalized day-by-day trip plan. Logic in `backend/services/itinerary.py`; the Flask route only parses query params.

#### Query parameters

| Parameter | Default | Values |
|---|---|---|
| `type` | `solo` | `solo`, `family`, `couple`, `friends`, `group` |
| `budget` | `mid` | `budget`, `mid`, `luxury` |
| `days` | `3` | any positive integer (the previous 7-day cap was removed) |
| `match_date` | `jun12` | `jun12`, `jun15`, `jun18`, `jun21`, `jun25`, `jun28`, `jul2`, `jul10` |
| `vibe` | `culture` | `football`, `culture`, `beach`, `nightlife`, `film` |
| `picks` | `[]` | URL-encoded JSON array of Explore LA selected items |
| `variant` | `0` | Integer seed offset; bumps the deterministic shuffle to explore alternates |

#### `picks` item shape

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

#### Backend logic (Phase A → Phase B)

1. **Phase A — `build_candidate_pools`**: turns DB rows + picks into scored candidate dicts. Each event candidate also carries the joined `event_experience_detail` columns under `details`.
2. **Phase B — `fill_day_slots`**: per slot, applies the scoring weights (see `W` in `itinerary.py`), enforces hard constraints, and picks the highest-scoring viable candidate. Same parameter set + same `variant` ⇒ deterministic schedule.

Daily structure (regular day):

| Time | Slot |
|---|---|
| 09:30 | Morning activity |
| 12:30 | Lunch (restaurant) |
| 15:00 | Afternoon activity (different category) |
| 18:00 | Evening / vibe activity |
| 20:30 | Dinner (restaurant) |

Match day: morning → lunch → match. No evening slots.

#### Response shape

```json
{
  "days": [
    {
      "day_num": 1,
      "label": "Day 1 · Arrival & First Impressions",
      "activities": [
        {
          "time": "09:30",
          "title": "LACMA",
          "desc": "Urban · Mid City",
          "source": "event",
          "id": "75",
          "reason": ["fits morning slot", "matches traveler type"],
          "lat": 34.0639,
          "lng": -118.3592,
          "details": {
            "key_experience":        "Urban Light installation",
            "recommended_duration":  "2-3 hours",
            "suitable_for":          "Tourists",
            "transportation":        "Transit + Car",
            "spatial_character":     "Urban embedded",
            "planning_tag":          "Exhibition",
            "ticket_price":          "$25",
            "admission_info":        "Reservation recommended",
            "price_level":           "1.0",
            "crowdedness":           "High",
            "intensity_level":       "1",
            "night_friendly":        "1.0",
            "photo_value":           "5.0",
            "commercial_level":      "Medium"
          }
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
  "traveler": "solo",
  "picks_used": [],
  "variant": 0
}
```

#### `details` (per activity)

Surfaced from `event_experience_detail`. Empty / `NaN` / null fields are filtered out at the backend before serialization, so the JSON only carries fields with real data. The frontend renders each as a chip under the activity title (`activityChips()` in `Journey.jsx`):

| Field | Frontend chip |
|---|---|
| `transportation` | 🚗 |
| `recommended_duration` | ⏱ |
| `ticket_price` | 🎟 |
| `admission_info` | ✓ |
| `suitable_for` | 👥 |
| `spatial_character` | 🏛 |
| `planning_tag` | ✦ |
| `key_experience` | ✎ |
| `price_level` | $ (formatted N/5) |
| `intensity_level` | ⚡ (formatted N/5) |
| `crowdedness` | 👣 |
| `night_friendly` | 🌙 (formatted N/5) |
| `photo_value` | 📷 (formatted N/5) |
| `commercial_level` | 🛍 |

#### `source` values

| `source` | Label shown | Origin |
|---|---|---|
| `event` | `EVENT` | `fact_event` row |
| `restaurant` | `DINE` | `fact_restaurant` row |
| `match` | `MATCH` | Fixed match activity |
| `explore_pick` | `PICK` | User-selected Explore LA item |

---

### `GET /api/match-story/<match_number>`

LLM-generated match preview. Backed by `services/match_story.py` which calls Anthropic Claude Opus 4.7 with `messages.parse()` + a Pydantic `MatchStory` schema.

```json
{
  "title":   "A Pacific Northwest debut against a Conmebol contender",
  "desc":    "USA opens its home World Cup at SoFi against a battle-tested Paraguay side …",
  "bullets": [
    "USA's tournament opener — full Rose Bowl crowd expected",
    "Paraguay returns to the World Cup after 16 years",
    "First competitive meeting in this format since 2022"
  ]
}
```

**Behavior:**
- Cached per `match_number` in memory.
- **Circuit breaker:** if a credit-out / quota error fires, the frontend stops calling the endpoint for the rest of the session and renders the hardcoded `matchMeta.story` fallback. No UI degradation.
- Returns 503 on Anthropic-side failures (frontend treats as fallback signal); 500 on other errors.

---

### `GET /api/match-stats/<match_number>`

Live H2H + form data. Backed by `services/match_data.py` which calls API-Football (api-sports.io) for the two teams in the match.

```json
{
  "home": { "winRate": 58, "goalsPerGame": 1.7, "form": ["W","D","W","L","W"], "goalsConceded": 0.8 },
  "away": { "winRate": 42, "goalsPerGame": 1.3, "form": ["L","W","D","L","W"], "goalsConceded": 1.1 },
  "h2h": { "total": 12, "team1wins": 5, "draws": 4, "team2wins": 3 },
  "lastMeeting": { "date": "2022-09-23", "type": "Friendly", "homeScore": 0, "awayScore": 0 },
  "allTime": { "matches": 12, "team1wins": 5, "draws": 4 }
}
```

**Caching strategy** (`match_data.py`):
1. In-memory dict (process lifetime)
2. JSON file at `backend/.cache/match_stats.json` (survives restarts)
3. Hardcoded `matchMeta.stats` fallback in the frontend (always works without API key)

The frontend's `MatchOverlay` merges API data field-by-field with the hardcoded fallback — per-team stats fall back independently, but H2H falls back as a unit so contradictions like "0 prior meetings" + "Last meeting in 2014" can't appear.

---

## Explore LA Picks Flow

1. User selects cards in Explore LA → stored in `selectedIds` state and persisted to `localStorage` (key `laWorldCupExplorePicks`).
2. `App` lifts the picks via `onPicksChange` so `Journey` can include them in the API call.
3. "Build My Journey →" inside ExploreLA calls `journeyRef.current?.submit()` on the Journey component (forwardRef + useImperativeHandle). The submit:
   - immediately scrolls to `#mount-journey-result` (snap-disabled during the smooth scroll so mandatory snap doesn't fight it),
   - serializes up to 12 picks as JSON in the `picks` query param,
   - fires `generateJourney()`.
4. Backend `services/itinerary.py` separates hotel picks (for area-matching) from activity picks (for schedule insertion).
5. The response includes `picks_used` so the frontend can display a count of incorporated picks.
6. Re-entry guard: a `submittingRef` blocks duplicate submits while one is in flight — and the 30s `apiFetch` timeout guarantees the lock self-releases even if the backend hangs.

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
| `GET /api/match-story/<match_number>` | Used (on demand, circuit-breaker protected) |
| `GET /api/match-stats/<match_number>` | Used (on demand, 3-layer cache) |
