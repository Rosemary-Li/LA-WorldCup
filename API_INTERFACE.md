# Frontend-Backend API Interface Documentation

This document explains the current interface between the React frontend and the Flask/PostgreSQL backend.

In this project, **API interface** means the contract between the browser and the server:

- React sends HTTP requests through `frontend/src/api.js`.
- Flask receives those requests in `backend/app.py`.
- Flask calls SQL functions in `backend/queries.py`.
- PostgreSQL returns rows.
- Flask serializes those rows as JSON.
- React maps the JSON into UI state used by components in `frontend/src/main.jsx`.

The browser never connects to PostgreSQL directly. Credentials remain in backend environment variables.

## 1. Current Frontend Pages

The current React app renders these sections:

| UI Section | React Component | API Usage |
|---|---|---|
| Hero | `PhotoHero` | No API |
| Matches | `Matches` | Uses `/api/matches` loaded by `loadSiteData()` |
| Match detail | `MatchOverlay` | Uses matches, teams, rankings, players, hotels, restaurants, events; loads tickets on demand |
| Explore LA | `ExploreLA` | Uses hotels, restaurants, and event categories loaded by `loadSiteData()` |
| Explore map panel | `SyncMap` | Uses selected frontend place/event data |
| Journey | `Journey` | Calls `/api/itinerary` through `generateJourney()` |
| About Us | `About` | Static team/profile content |

Team, player, ticket, and FIFA ranking context is shown from the match detail overlay.

## 2. Frontend API Wrapper

All frontend API calls are centralized in `frontend/src/api.js`.

```js
export const API_BASE = "http://127.0.0.1:5000";
```

```js
async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${endpoint}`);
  return res.json();
}
```

Every request:

- Uses Flask at `http://127.0.0.1:5000`.
- Expects JSON.
- Throws if Flask returns a non-2xx response.

## 3. Initial Data Loading

When `App()` mounts, it calls:

```js
loadSiteData()
```

`loadSiteData()` requests the main datasets in parallel:

```js
Promise.all([
  apiFetch("/api/matches"),
  apiFetch("/api/players"),
  apiFetch("/api/hotels"),
  apiFetch("/api/restaurants"),
  apiFetch("/api/events"),
  apiFetch("/api/rankings"),
  apiFetch("/api/teams"),
]);
```

It returns UI-ready state:

```js
{
  matches,
  players,
  hotels,
  restaurants,
  fanEvents,
  shows,
  allEvents,
  rankings,
  teams
}
```

Current rendered pages mainly use `matches`, `players`, `hotels`, `restaurants`, `fanEvents`, `shows`, `allEvents`, `rankings`, and `teams`.

If loading fails, `App()` sets:

```js
apiReady = false
apiError = err
```

The UI then shows database connection messaging instead of fake fallback data.

## 4. Matches API

### `GET /api/matches`

Returns all Los Angeles match rows.

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

- `Matches` schedule table.
- `MatchOverlay` selected match detail.
- Match day selection context in Journey.

Important fields:

| API Field | Meaning |
|---|---|
| `match_number` | Match ID such as `M4` |
| `date` | Match date |
| `day_of_week` | Day label |
| `time_pt` | Pacific Time kickoff |
| `team1`, `team2` | Teams from database |
| `group` | Group code |
| `stage` | Tournament stage |
| `venue` | Stadium |

### `GET /api/matches/<match_number>`

Returns one match by match number.

Current frontend status:

- Available from backend.
- The current React UI usually uses preloaded `/api/matches` data instead of calling this route separately.

## 5. Match Detail APIs

The match detail overlay is a composition of several data sources.

### Teams: `GET /api/teams`

Database table:

- `dim_team`

Frontend usage:

- Loaded by `loadSiteData()`.
- Used in `MatchOverlay` to show team context for the selected match.

Common fields:

| API Field | UI Meaning |
|---|---|
| `country` | Team name |
| `federation` | Confederation |
| `status` | Qualification/status label |
| `group_stage` | Group |
| `matches_in_la` | LA match involvement |

### Rankings: `GET /api/rankings`

Database table:

- `fact_ranking`

Frontend usage:

- Loaded by `loadSiteData()`.
- Used next to team/match context so users can compare teams while viewing a specific match.

Common fields:

| API Field | UI Meaning |
|---|---|
| `country` | Country/team |
| `fifa_rank` | FIFA rank |
| `points` | Ranking points |
| `previous_points` | Previous points |
| `rank_change` | Rank movement |

### Players: `GET /api/players`

Database table:

- `dim_player`

Frontend usage:

- Loaded by `loadSiteData()`.
- Used for match/team player context.

Optional endpoint:

```text
GET /api/players/<team_country>
```

This returns players for one team and can be used for future direct team detail loading.

### Tickets: `GET /api/tickets/<match_number>`

Database table:

- `fact_ticket`

Frontend usage:

- Called on demand by `loadTickets(matchNumber)`.
- Triggered when the user opens the Tickets tab in `MatchOverlay`.

SQL source:

```sql
SELECT ticket_id, seating_section, section_level,
       ticket_category, price_usd, ticket_status, matchup
FROM fact_ticket
WHERE match_number = %s
ORDER BY price_usd;
```

UI mapping:

| API Field | UI Location |
|---|---|
| `ticket_category` | Ticket card title |
| `seating_section` | Seat area |
| `section_level` | Seat level |
| `price_usd` | Price |
| `ticket_status` | Availability/status |

## 6. Explore LA APIs

Explore LA has five current categories:

| Explore Category | Data Source | Frontend State |
|---|---|---|
| Hotels | `/api/hotels` | `data.hotels` |
| Restaurants | `/api/restaurants` | `data.restaurants` |
| Fan Events | `/api/events` filtered by category IDs | `data.fanEvents` |
| Shows | `/api/events` filtered by category IDs | `data.shows` |
| Attractions | `/api/events` filtered from all events | `data.allEvents` |

The first Explore LA screen is a photo wall. Clicking a card opens that category inside the same section.

### Hotels: `GET /api/hotels`

Database table:

- `fact_hotel`

Frontend mapping in `loadSiteData()`:

```js
{
  name: h.hotel_name,
  region: cleanParenthetical(h.region),
  address: h.address || "",
  stars: Math.round(h.star_rating) || 3,
  price: h.price_band ? `${h.price_band}/night` : "N/A",
  reviews: h.google_reviews_count || 0,
  lat: h.latitude,
  lon: h.longitude
}
```

Used for:

- Explore LA Hotels list.
- Map pins when hotel coordinates exist.
- Nearby hotel context in `MatchOverlay`.

### Restaurants: `GET /api/restaurants`

Query parameters:

| Parameter | Meaning |
|---|---|
| `limit` | Max rows |
| `offset` | Pagination offset |
| `search` | Optional restaurant name search |
| `region` | Optional region filter |

Database table:

- `fact_restaurant`

Frontend mapping:

```js
{
  name: r.restaurant_name,
  region: r.region || "",
  address: r.address || "",
  price: r.price_range || "N/A",
  flavor: r.flavor || "N/A",
  score: r.google_review_score || 0
}
```

Used for:

- Explore LA Restaurants list.
- Restaurant shortlist picks.
- Nearby restaurant context in `MatchOverlay`.
- Journey restaurant recommendation pools.

### Events: `GET /api/events`

Query parameters:

| Parameter | Meaning |
|---|---|
| `limit` | Max rows |
| `offset` | Pagination offset |
| `search` | Optional event name search |
| `area` | Optional area filter |

Database tables:

- `fact_event`
- `dim_event_category`

Important SQL behavior:

- Event rows are joined to `dim_event_category`.
- `source_url` is returned so the frontend can show an explicit `Official Site` link.

Frontend mapping:

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
  officialUrl: event.source_url || ""
}
```

Category split:

```js
showCats = new Set([12, 13, 14, 15])
fanEventCats = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 23])
```

Used for:

- Fan Events.
- Shows.
- Attractions.
- Journey activity pools.

### Official Website Behavior

Explore LA cards do not navigate away when the image is clicked. External navigation only happens when the user clicks the explicit `Official Site` link.

`frontend/src/placeMedia.js` helps match items to official URLs and image behavior. Backend event rows can also provide `source_url`.

## 7. Explore Picks

Explore LA selections are managed in the frontend:

- Users can select hotels, restaurants, fan events, shows, and attractions.
- Selected items appear in the Pick panel.
- Picks are saved to browser local storage.
- The `Go` button moves users to the Journey section.
- The `Journey` component receives the current picks from `App()` state.
- When the user generates a Journey, the frontend sends up to 12 selected picks to `/api/itinerary` as a JSON-encoded `picks` query parameter.
- Flask parses those picks and prioritizes them in the generated schedule.

## 8. Journey API

### `GET /api/itinerary`

Generates a personalized travel plan.

Frontend function:

```js
generateJourney(params)
```

Backend route:

```py
@app.route("/api/itinerary")
def itinerary():
    ...
```

Query parameters:

| Parameter | Default | Meaning |
|---|---:|---|
| `type` | `football` | Traveler type: football, family, backpacker, luxury |
| `budget` | `mid` | Budget level: budget, mid, luxury |
| `days` | `3` | Number of generated days, clamped to 1-7 |
| `match_date` | `jun12` | Match day selection |
| `vibe` | `culture` | Extra activity vibe: culture, beach, nightlife, film |
| `picks` | `[]` | JSON list of selected Explore LA picks |

Backend mapping:

| Input | SQL Helper |
|---|---|
| `type` | `get_events_by_categories(type_cats)` |
| `vibe` | `get_events_by_categories(vibe_cats)` |
| `budget` | `recommend_hotels_for_budget()` |
| `budget` | `recommend_restaurants_for_budget()` |
| `picks` | Parsed in Flask and inserted into the generated schedule before generic recommendations |

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
          "id": 101
        }
      ]
    }
  ],
  "hotel": {},
  "match": {},
  "budget_label": "mid",
  "traveler": "football",
  "picks_used": []
}
```

Frontend usage:

- `Journey` calls `generateJourney(params)`.
- `JourneyResult` renders returned days, activities, hotel, and match context.

## 9. Available Backend Endpoints

| Endpoint | Current Status |
|---|---|
| `GET /api/matches` | Used |
| `GET /api/matches/<match_number>` | Available, mostly preloaded instead |
| `GET /api/tickets` | Available for future all-ticket pages |
| `GET /api/tickets/<match_number>` | Used by match detail |
| `GET /api/teams` | Used |
| `GET /api/teams/<country>` | Available |
| `GET /api/players` | Used |
| `GET /api/players/stars` | Available |
| `GET /api/players/<team_country>` | Available |
| `GET /api/rankings` | Used |
| `GET /api/hotels` | Used |
| `GET /api/hotels/region/<region>` | Available |
| `GET /api/hotels/price/<price_band>` | Available |
| `GET /api/restaurants` | Used |
| `GET /api/restaurants/flavor/<flavor>` | Available |
| `GET /api/events` | Used |
| `GET /api/events/category/<category>` | Available |
| `GET /api/events/<event_id>` | Available for future event detail views |
| `GET /api/itinerary` | Used |

## 10. Database Table-to-API Map

| Database Table | Main API Endpoints |
|---|---|
| `fact_match` | `/api/matches`, `/api/matches/<match_number>` |
| `fact_ticket` | `/api/tickets`, `/api/tickets/<match_number>` |
| `dim_team` | `/api/teams`, `/api/teams/<country>` |
| `dim_player` | `/api/players`, `/api/players/<team_country>`, `/api/players/stars` |
| `fact_ranking` | `/api/rankings` |
| `fact_hotel` | `/api/hotels`, `/api/hotels/region/<region>`, `/api/hotels/price/<price_band>` |
| `fact_restaurant` | `/api/restaurants`, `/api/restaurants/flavor/<flavor>`, `/api/itinerary` helpers |
| `fact_event` | `/api/events`, `/api/events/<event_id>`, `/api/events/category/<category>`, `/api/itinerary` helpers |
| `dim_event_category` | `/api/events`, `/api/events/<event_id>`, `/api/itinerary` helpers |
| `event_experience_detail` | `/api/events/<event_id>`, `/api/itinerary` helpers |
| `event_sports_detail` | `/api/events/<event_id>` |
| `fact_route` | Stored in database, not exposed by the current public API |
| `dim_place` | Stored in database, not exposed by the current public API |
| `dim_mode` | Stored in database, not exposed by the current public API |

## 11. Privacy and Security Boundary

The frontend only knows:

```js
API_BASE = "http://127.0.0.1:5000"
```

It does not know:

- Database host
- Database username
- Database password
- SSL mode
- Raw SQL queries

Those stay in:

- `backend/.env`
- `backend/queries.py`
- PostgreSQL

## 12. Smoke Tests

Start Flask first:

```bash
cd backend
python3 app.py
```

Then test:

```bash
curl -s http://127.0.0.1:5000/api/matches
curl -s http://127.0.0.1:5000/api/hotels
curl -s http://127.0.0.1:5000/api/events
curl -s "http://127.0.0.1:5000/api/itinerary?type=football&budget=mid&days=5&match_date=jun12&vibe=culture"
```
