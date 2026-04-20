# Frontend-Backend API Interface Documentation

This document explains how the React frontend communicates with the Flask backend, which database tables power each API, and how the returned JSON is transformed into UI state.

In this project, **API Interface** means the contract between the browser and the server:

- **The frontend sends** HTTP requests from React through `frontend/src/api.js`.
- **The backend receives** those requests in Flask routes defined in `backend/app.py`.
- **The backend reads** PostgreSQL through SQL functions in `backend/queries.py`.
- **The backend returns** JSON objects or JSON arrays.
- **The frontend transforms** that JSON into the objects used by React components.

The most important rule is: **the browser never connects to PostgreSQL directly**. All database access is behind the Flask API.

## 1. System Overview

The project uses a three-layer structure:

1. **React frontend**
   - Main entry: `frontend/src/main.jsx`
   - API wrapper: `frontend/src/api.js`
   - Dev server: `http://127.0.0.1:5173`

2. **Flask backend**
   - Main server: `backend/app.py`
   - Query layer: `backend/queries.py`
   - API base URL used by React: `http://127.0.0.1:5000`

3. **PostgreSQL database**
   - Loaded from cleaned CSV files in `database/clean_data/`
   - Schema and ETL setup: `backend/setup_database.py`

The frontend never queries PostgreSQL directly. It only calls Flask API endpoints. Flask then calls functions in `queries.py`, which execute SQL against PostgreSQL and return JSON.

```text
React UI
  ↓ fetch()
frontend/src/api.js
  ↓ HTTP JSON
backend/app.py
  ↓ Python function call
backend/queries.py
  ↓ SQL
PostgreSQL tables
```

## 2. Frontend API Wrapper

All frontend API requests are centralized in `frontend/src/api.js`.

```js
export const API_BASE = "http://127.0.0.1:5000";
```

The helper function:

```js
async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${endpoint}`);
  return res.json();
}
```

This means every frontend request:

- Uses `http://127.0.0.1:5000` as the backend host.
- Expects JSON.
- Throws an error if Flask returns a non-2xx status.

## 3. Initial Page Data Loading

When the app first mounts, `App()` calls:

```js
loadSiteData()
```

This function makes parallel requests to the backend:

```js
Promise.all([
  apiFetch("/api/matches"),
  apiFetch("/api/players"),
  apiFetch("/api/hotels"),
  apiFetch("/api/restaurants"),
  apiFetch("/api/events"),
  apiFetch("/api/rankings"),
  apiFetch("/api/teams"),
  apiFetch("/api/routes"),
  apiFetch("/api/map-data").catch(() => null),
]);
```

The result is stored in React state:

```js
data = {
  matches,
  players,
  hotels,
  restaurants,
  fanEvents,
  shows,
  allEvents,
  rankings,
  teams,
  routes,
  mapData
}
```

If the backend is unavailable, the frontend sets `apiReady = false` and shows database connection notices instead of fake fallback content.

## 4. Core API Endpoints

### 4.1 Matches

#### `GET /api/matches`

Returns all Los Angeles matches.

Backend route:

```py
@app.route("/api/matches")
def matches():
    return jsonify(queries.get_all_matches())
```

SQL source:

```sql
SELECT match_number, date, day_of_week, time_pt,
       team1, team2, "group", stage, venue
FROM fact_match
ORDER BY date, time_pt;
```

Database table:

- `fact_match`

Frontend usage:

- Loaded inside `loadSiteData()`.
- Used by `Matches` to display the schedule.
- Used by `MatchOverlay` to find the selected match detail by `match_number`.

Important fields:

| Field | Meaning |
|---|---|
| `match_number` | Match ID such as `M4`, `M15`, `M26` |
| `date` | Match date |
| `day_of_week` | Day label |
| `time_pt` | Pacific Time kickoff |
| `team1`, `team2` | Match teams from the database |
| `group` | Group code |
| `stage` | Group Stage, Round of 32, Quarter-Final, etc. |
| `venue` | Stadium name |

#### `GET /api/matches/<match_number>`

Returns one match by match number.

Backend route:

```py
@app.route("/api/matches/<match_number>")
def match_detail(match_number):
    return jsonify(queries.get_match_by_id(match_number))
```

SQL source:

```sql
SELECT match_number, date, day_of_week, time_pt,
       team1, team2, "group", stage, venue, venue_address, notes
FROM fact_match
WHERE match_number = %s;
```

Current frontend status:

- The frontend primarily uses the preloaded `/api/matches` data.
- This endpoint is available for future direct detail loading.

### 4.2 Tickets

#### `GET /api/tickets`

Returns all ticket options.

Database table:

- `fact_ticket`

SQL source:

```sql
SELECT ticket_id, match_number, matchup,
       match_date, seating_section, section_level,
       ticket_category, price_usd, ticket_status
FROM fact_ticket
ORDER BY match_date, price_usd;
```

Current frontend status:

- Not loaded during initial page load.
- Available for future all-ticket pages.

#### `GET /api/tickets/<match_number>`

Returns ticket options for one match.

Backend route:

```py
@app.route("/api/tickets/<match_number>")
def tickets_by_match(match_number):
    return jsonify(queries.get_tickets_by_match(match_number))
```

SQL source:

```sql
SELECT ticket_id, seating_section, section_level,
       ticket_category, price_usd, ticket_status, matchup
FROM fact_ticket
WHERE match_number = %s
ORDER BY price_usd;
```

Frontend usage:

- Called by `loadTickets(matchNumber)` in `frontend/src/api.js`.
- Triggered inside `MatchOverlay` when the user clicks the `Tickets` tab.
- The result is stored in local overlay state:

```js
const [tickets, setTickets] = useState(null);
```

UI mapping:

| API field | UI location |
|---|---|
| `ticket_category` | Ticket card title |
| `seating_section` | Ticket card subtitle |
| `section_level` | Ticket card subtitle |
| `price_usd` | Ticket price |
| `ticket_status` | Status text and color |

The frontend removes Chinese parenthetical text from `ticket_category` before display.

### 4.3 Teams

#### `GET /api/teams`

Returns teams related to Los Angeles matches.

Database table:

- `dim_team`

SQL source:

```sql
SELECT team_id, country, federation, status,
       group_stage, matches_in_la
FROM dim_team
ORDER BY group_stage, country;
```

Frontend usage:

- Loaded inside `loadSiteData()`.
- Used by `MatchOverlay` to show team intelligence for the selected match.
- Independent `Tournament Guide` page has been removed; team data now appears inside match detail.

UI mapping in `MatchOverlay`:

| API field | UI location |
|---|---|
| `country` | Team name |
| `federation` | Team federation |
| `status` | Qualification / schedule status |
| `group_stage` | Group label |
| `matches_in_la` | LA match list |

#### `GET /api/teams/<country>`

Returns one team by exact country name.

SQL source:

```sql
SELECT team_id, country, federation, status,
       possible_teams, group_stage, matches_in_la, notes
FROM dim_team
WHERE country = %s;
```

Current frontend status:

- Not currently called by React.
- The app uses the preloaded `/api/teams` result for match detail.

### 4.4 Players

#### `GET /api/players`

Returns players, with optional pagination and search.

Query parameters:

| Parameter | Default | Meaning |
|---|---:|---|
| `limit` | `500` | Maximum rows |
| `offset` | `0` | Pagination offset |
| `search` | none | Filters by player name or team |

Database table:

- `dim_player`

SQL source without search:

```sql
SELECT player_id, player_name, team, position,
       club, age, caps, goals, is_star
FROM dim_player
ORDER BY team, is_star DESC
LIMIT %s OFFSET %s;
```

Frontend usage:

- Loaded inside `loadSiteData()`.
- Used by `MatchOverlay` to show a small preview of players for the selected teams.

#### `GET /api/players/<team_country>`

Returns all players for one team.

SQL source:

```sql
SELECT player_id, player_name, position,
       club, age, caps, goals, is_star, notes
FROM dim_player
WHERE team = %s
ORDER BY is_star DESC, goals DESC;
```

Frontend usage:

- Called by `loadPlayersByTeam(team)`.
- Triggered in `MatchOverlay` when the user clicks `Full Squad`.

#### `GET /api/players/stars`

Returns only star players.

Current frontend status:

- Not currently called by React.
- Available for a future star-player section.

### 4.5 FIFA Rankings

#### `GET /api/rankings`

Returns FIFA ranking records.

Database table:

- `fact_ranking`

SQL source:

```sql
SELECT ranking_id, rank, country,
       total_points, previous_rank, rank_change,
       confederation
FROM fact_ranking
ORDER BY rank;
```

Frontend usage:

- Loaded inside `loadSiteData()`.
- Used by `MatchOverlay` to show:
  - FIFA rank
  - total points
  - rank change
  - ranking snapshot beside match detail

Important note:

- Rankings are no longer shown in a separate `Tournament Guide` page.
- They are merged into the match detail workflow, so clicking a match gives context for the two teams.

### 4.6 Hotels

#### `GET /api/hotels`

Returns all hotels ordered by star rating.

Database table:

- `fact_hotel`

SQL source:

```sql
SELECT hotel_id, hotel_name, region, address,
       star_rating, price_band, latitude, longitude,
       google_reviews_count
FROM fact_hotel
ORDER BY star_rating DESC;
```

Frontend transformation:

In `loadSiteData()`, backend fields are mapped into UI-friendly hotel objects:

```js
{
  name: h.hotel_name,
  region: cleanParenthetical(h.region),
  address: h.address || "",
  stars: Math.round(h.star_rating) || 3,
  price: h.price_band ? `${h.price_band}/night` : "N/A",
  reviews: h.google_reviews_count || 0,
  emoji: "🏨",
  lat: h.latitude,
  lon: h.longitude,
}
```

Frontend usage:

- `ExploreLA`: selectable hotel list and map pins.
- `Discover`: hotel cards.
- `MatchOverlay`: nearby hotel suggestions.

#### `GET /api/hotels/region/<region>`

Returns hotels filtered by region using `ILIKE`.

Current frontend status:

- Not currently called by React.

#### `GET /api/hotels/price/<price_band>`

Returns hotels filtered by exact price band.

Current frontend status:

- Not currently called directly by React.
- Journey recommendations use backend helper `recommend_hotels_for_budget()` instead.

### 4.7 Restaurants

#### `GET /api/restaurants`

Returns restaurants with optional pagination and filtering.

Query parameters:

| Parameter | Default | Meaning |
|---|---:|---|
| `limit` | `500` | Maximum rows |
| `offset` | `0` | Pagination offset |
| `search` | none | Filters by restaurant name |
| `region` | none | Filters by region |

Database table:

- `fact_restaurant`

SQL source:

```sql
SELECT restaurant_id, restaurant_name, region,
       address, price_range, flavor,
       google_review_score, review_count, disability_access
FROM fact_restaurant
WHERE ...
ORDER BY google_review_score DESC
LIMIT %s OFFSET %s;
```

Frontend transformation:

```js
{
  name: r.restaurant_name,
  region: r.region || "",
  address: r.address || "",
  price: r.price_range || "N/A",
  flavor: r.flavor || "N/A",
  score: r.google_review_score || 0,
  emoji: "🍽️",
}
```

Frontend usage:

- `ExploreLA`: selectable restaurant list and inferred map pins.
- `Discover`: restaurant cards.
- `MatchOverlay`: nearby restaurant suggestions.
- `Journey`: backend uses restaurants for generated daily schedules.

#### `GET /api/restaurants/flavor/<flavor>`

Returns restaurants filtered by cuisine/flavor.

Current frontend status:

- Not currently called by React.

### 4.8 Events

#### `GET /api/events`

Returns event records with optional pagination and filters.

Query parameters:

| Parameter | Default | Meaning |
|---|---:|---|
| `limit` | `500` | Maximum rows |
| `offset` | `0` | Pagination offset |
| `search` | none | Filters by event name |
| `area` | none | Filters by area or city |

Database tables:

- `fact_event`
- `dim_event_category`

SQL source:

```sql
SELECT e.event_id, e.event_name, e.category,
       e.event_category_id,
       e.event_type, e.venue_name, e.area, e.city,
       e.start_date, e.end_date, e.event_time,
       e.detail_type, c.category AS category_label
FROM fact_event e
LEFT JOIN dim_event_category c
       ON e.event_category_id = c.event_category_id
WHERE ...
ORDER BY e.start_date
LIMIT %s OFFSET %s;
```

Frontend transformation:

`loadSiteData()` converts events into three frontend collections:

1. `fanEvents`
2. `shows`
3. `allEvents`

Category logic:

```js
const showCats = new Set([12, 13, 14, 15]);
const fanEventCats = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 23]);
```

Frontend event object:

```js
{
  id: event.event_id,
  name: event.event_name,
  area: event.area || event.city || "",
  date: event.start_date || "",
  price: "See details",
  desc: event.event_type || event.category || "",
  venue: event.venue_name || "",
  category: event.category_label || event.category || "",
  categoryId: catId,
  emoji: showCats.has(catId) ? "🎭" : "🎉",
}
```

Frontend usage:

- `ExploreLA`: Fan Events, Shows, and Attractions categories.
- `Discover`: fan events and shows.
- `MatchOverlay`: nearby event suggestions.
- `Journey`: event pools for personalized travel plans.

Explore LA category mapping:

| Explore LA category | Data source |
|---|---|
| `Fan Events` | `fanEvents` |
| `Shows` | `shows` |
| `Attractions` | `allEvents` filtered by category IDs `16, 17, 18, 19, 20, 21, 22` |

#### `GET /api/events/<event_id>`

Returns one full event detail.

Database tables:

- `fact_event`
- `dim_event_category`
- `event_experience_detail`
- `event_sports_detail`

Backend logic:

1. Fetch base event from `fact_event`.
2. Join category label from `dim_event_category`.
3. Fetch matching `event_experience_detail`.
4. Fetch matching `event_sports_detail`.
5. Attach detail rows as nested objects:
   - `experience_detail`
   - `sports_detail`

Frontend usage:

- Called by `loadEventDetail(id)`.
- Triggered by clicking event cards.
- Rendered in `EventOverlay`.

#### `GET /api/events/category/<category>`

Returns events where `fact_event.category ILIKE %category%`.

Current frontend status:

- Not currently called by React.

### 4.9 Routes

#### `GET /api/routes`

Returns transport route options.

Database tables:

- `fact_route`
- `dim_place`
- `dim_mode`

SQL source:

```sql
SELECT r.route_id,
       o.name AS origin_name, o.city AS origin_city,
       d.name AS dest_name, d.city AS dest_city,
       m.mode_name, m.mode_group, m.includes,
       r.duration_min, r.cost_low_usd, r.cost_high_usd
FROM fact_route r
JOIN dim_place o ON r.origin_place_id = o.place_id
JOIN dim_place d ON r.dest_place_id = d.place_id
JOIN dim_mode  m ON r.mode_id = m.mode_id
ORDER BY r.duration_min;
```

Frontend usage:

- Loaded inside `loadSiteData()`.
- Used by `Discover` if the transport/routes tab is active.
- Journey currently uses route navigation conceptually, but generated journey output is produced by `/api/itinerary`.

### 4.10 Map Data

#### `GET /api/map-data`

Returns coordinate data for map pins.

Database tables:

- `fact_hotel`
- `dim_place`

Backend response structure:

```json
{
  "hotels": [...],
  "places": [...]
}
```

Hotel SQL:

```sql
SELECT hotel_id AS id, hotel_name AS name,
       'hotel' AS type, region,
       latitude AS lat, longitude AS lon,
       star_rating, price_band
FROM fact_hotel
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

Place SQL:

```sql
SELECT place_id AS id, name, place_type AS type,
       city AS region, lat, lon
FROM dim_place
WHERE lat IS NOT NULL AND lon IS NOT NULL;
```

Frontend usage:

- Loaded inside `loadSiteData()`, but with `.catch(() => null)` so the page can still report backend status cleanly if map data fails.
- Current `ExploreLA` map uses hotel coordinates directly and infers approximate coordinates for restaurants/events based on area text when exact coordinates are not present.

### 4.11 Journey

#### `GET /api/itinerary`

Generates a personalized travel schedule.

Query parameters:

| Parameter | Default | Values used by frontend |
|---|---|---|
| `type` | `football` | `football`, `family`, `backpacker`, `luxury` |
| `budget` | `mid` | `budget`, `mid`, `luxury` |
| `days` | `3` | `3`, `5`, `7` |
| `match_date` | `jun12` | `jun12`, `jun15`, `jun18`, `jun21`, `jun25`, `jun28`, `jul2`, `jul10` |
| `vibe` | `culture` | `culture`, `beach`, `nightlife`, `film` |

Frontend usage:

- Called by `generateJourney(params)`.
- Triggered when the user clicks the Journey generate button.
- Result is rendered by `JourneyResult`.

Backend logic:

1. Convert `type` and `vibe` into event category IDs.
2. Convert `budget` into hotel price band and restaurant price ranges.
3. Fetch event pools through `queries.get_events_by_categories()`.
4. Fetch hotel recommendations through `recommend_hotels_for_budget()`.
5. Fetch restaurant recommendations through `recommend_restaurants_for_budget()`.
6. Build a deterministic schedule using a SHA-256 seed from user parameters.
7. Insert the selected match into the schedule.

Response shape:

```json
{
  "days": [
    {
      "day_num": 1,
      "label": "Day 1 · Arrival & First Impressions",
      "activities": [
        {
          "time": "09:30",
          "title": "Activity name",
          "desc": "Venue · Area · Admission",
          "source": "event",
          "id": 1
        }
      ]
    }
  ],
  "hotel": {
    "hotel_id": 1,
    "hotel_name": "Hotel name",
    "region": "Region",
    "address": "Address",
    "star_rating": 4,
    "price_band": "200+",
    "google_reviews_count": 1000
  },
  "match": {
    "date": "June 12",
    "time": "18:00",
    "label": "USA vs Paraguay (M4)"
  },
  "budget_label": "mid",
  "traveler": "football"
}
```

## 5. Frontend Feature-to-API Map

| Frontend feature | Component/function | API used |
|---|---|---|
| Match schedule | `Matches` | `/api/matches` via `loadSiteData()` |
| Match detail popup | `MatchOverlay` | Preloaded `/api/matches`, `/api/teams`, `/api/rankings`, `/api/players` |
| Match tickets tab | `MatchOverlay` | `/api/tickets/<match_number>` |
| Full squad tab | `MatchOverlay` | `/api/players/<team_country>` |
| Explore LA photo wall | `ExploreLA` | Uses preloaded hotel/restaurant/event data |
| Explore LA map | `SyncMap` | Uses selected frontend data; SoFi Stadium hardcoded; hotels use API coordinates |
| Discover cards | `Discover` | Preloaded hotels/restaurants/events/routes |
| Event detail popup | `EventOverlay` | `/api/events/<event_id>` |
| Journey generator | `Journey` | `/api/itinerary?...` |
| About Us | `About` | Static frontend data |

## 6. Database Table-to-API Map

| Database table | Main API endpoints |
|---|---|
| `fact_match` | `/api/matches`, `/api/matches/<match_number>` |
| `fact_ticket` | `/api/tickets`, `/api/tickets/<match_number>` |
| `dim_team` | `/api/teams`, `/api/teams/<country>` |
| `dim_player` | `/api/players`, `/api/players/<team_country>`, `/api/players/stars` |
| `fact_ranking` | `/api/rankings` |
| `fact_hotel` | `/api/hotels`, `/api/hotels/region/<region>`, `/api/hotels/price/<price_band>`, `/api/map-data` |
| `fact_restaurant` | `/api/restaurants`, `/api/restaurants/flavor/<flavor>`, `/api/itinerary` helpers |
| `fact_event` | `/api/events`, `/api/events/<event_id>`, `/api/events/category/<category>`, `/api/itinerary` helpers |
| `dim_event_category` | `/api/events`, `/api/events/<event_id>`, `/api/itinerary` helpers |
| `event_experience_detail` | `/api/events/<event_id>`, `/api/itinerary` helpers |
| `event_sports_detail` | `/api/events/<event_id>` |
| `fact_route` | `/api/routes` |
| `dim_place` | `/api/routes`, `/api/map-data` |
| `dim_mode` | `/api/routes` |

## 7. Error Handling and Backend Availability

Frontend error behavior:

- `apiFetch()` throws if a response is not OK.
- `loadSiteData()` sets:
  - `apiReady = true` on success.
  - `apiReady = false` and `apiError = err` on failure.
- UI sections display database connection notices instead of silently showing fake data.

Backend error behavior:

- Most API routes rely on query functions and return JSON directly.
- `/api/itinerary` catches exceptions and returns:

```json
{
  "error": "Could not build journey"
}
```

with HTTP status `500`.

## 8. Privacy and Data Boundary

The frontend does not receive database credentials. Database access is restricted to the Flask backend.

Credentials are loaded only inside `backend/queries.py` through environment variables:

```py
host=os.getenv("DB_HOST")
port=int(os.getenv("DB_PORT", 5432))
dbname=os.getenv("DB_NAME")
user=os.getenv("DB_USER")
password=os.getenv("DB_PASSWORD")
sslmode=os.getenv("DB_SSLMODE", "require")
```

The React app only knows the API base URL:

```js
http://127.0.0.1:5000
```

This keeps the database connection details out of browser code.

## 9. Recommended Local Run Order

Start the backend:

```bash
cd backend
python3 app.py
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

Quick API checks:

```bash
curl -s http://127.0.0.1:5000/api/matches
curl -s http://127.0.0.1:5000/api/events
curl -s "http://127.0.0.1:5000/api/itinerary?type=football&budget=mid&days=5&match_date=jun12&vibe=culture"
```

## 10. Current Design Decisions

1. `Tournament Guide` is no longer a standalone page.
   - Team and ranking data now appears inside `MatchOverlay`.
   - This makes the user flow more natural: choose a match first, then inspect team context.

2. Explore LA has five entry categories.
   - Hotels
   - Restaurants
   - Fan Events
   - Shows
   - Attractions

3. Explore LA initially shows only the five photo cards.
   - The map appears only after the user clicks one category.
   - Selected items are shown on the map.

4. Journey is generated by the backend.
   - It uses SQL-selected event, hotel, and restaurant pools.
   - It does not rely on static frontend fallback data.

5. Backend data is the source of truth.
   - If the backend is unavailable, the frontend reports that state rather than pretending data exists.
