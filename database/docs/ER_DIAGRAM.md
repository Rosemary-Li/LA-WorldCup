# ER Diagram — derived from `backend/queries.py`

Reverse-engineered from every `SELECT` and `JOIN` in [`backend/queries.py`](../../backend/queries.py).
Renders natively on GitHub via Mermaid.

> 简体中文：see relationship summary at the bottom.

---

## Diagram

```mermaid
erDiagram
    dim_team                  ||--o{ dim_player        : "team = country"
    dim_team                  ||--o{ fact_ranking      : "country (string FK)"
    dim_team                  ||--o{ fact_match        : "team1 / team2 = country"
    dim_event_category        ||--o{ fact_event        : "event_category_id"
    fact_match                ||--o{ fact_ticket       : "match_number"
    fact_event                ||--o| event_experience_detail : "event_id (1:0..1)"
    fact_event                ||--o| event_sports_detail     : "event_id (1:0..1)"

    dim_team {
        int    team_id        PK
        string country
        string federation
        string status
        string possible_teams
        string group_stage
        int    matches_in_la
        string notes
    }
    dim_player {
        int    player_id      PK
        string player_name
        string team           FK "→ dim_team.country"
        string position
        string club
        int    age
        int    caps
        int    goals
        bool   is_star
        string notes
    }
    dim_event_category {
        int    event_category_id PK
        string category
    }

    fact_match {
        string match_number   PK
        date   date
        string day_of_week
        time   time_pt
        string team1          FK "→ dim_team.country"
        string team2          FK "→ dim_team.country"
        string group
        string stage
        string venue
        string venue_address
        string notes
    }
    fact_ticket {
        int    ticket_id      PK
        string match_number   FK "→ fact_match.match_number"
        string matchup
        date   match_date
        string seating_section
        string section_level
        string ticket_category
        decimal price_usd
        string ticket_status
    }
    fact_ranking {
        int    ranking_id     PK
        int    rank
        string country        FK "→ dim_team.country"
        int    total_points
        int    previous_rank
        int    rank_change
        string confederation
    }
    fact_hotel {
        int    hotel_id       PK
        string hotel_name
        string region
        string address
        int    star_rating
        string price_band
        float  latitude
        float  longitude
        int    google_reviews_count
    }
    fact_restaurant {
        int    restaurant_id  PK
        string restaurant_name
        string region
        string address
        string price_range
        string flavor
        float  google_review_score
        int    review_count
        bool   disability_access
    }
    fact_event {
        string event_id          PK
        string event_name
        string category
        int    event_category_id FK "→ dim_event_category"
        string event_type
        string venue_name
        string area
        string city
        date   start_date
        date   end_date
        time   event_time
        string detail_type
        string source_url
    }
    event_experience_detail {
        string event_id              PK,FK "→ fact_event.event_id"
        string key_experience
        string recommended_duration
        string suitable_for
        string transportation
        string spatial_character
        string planning_tag
        string ticket_price
        string admission_info
        string price_level
        string crowdedness
        string intensity_level
        string night_friendly
        string photo_value
        string commercial_level
    }
    event_sports_detail {
        string event_id              PK,FK "→ fact_event.event_id"
    }
```

---

## Relationship summary

| From → To | Cardinality | Join key | Source |
|---|---|---|---|
| `dim_team` → `dim_player` | 1 : N | `dim_team.country = dim_player.team` | `get_players_by_team()` |
| `dim_team` → `fact_match` | 1 : N (twice) | `dim_team.country = fact_match.team1 / team2` | `fact_match` schema |
| `dim_team` → `fact_ranking` | 1 : 0..1 | `country` (no enforced FK; matched by string) | `get_all_rankings()` |
| `dim_event_category` → `fact_event` | 1 : N | `event_category_id` | `LEFT JOIN` in `get_all_events()` / `get_events_by_categories()` |
| `fact_match` → `fact_ticket` | 1 : N | `match_number` | `get_tickets_by_match()` |
| `fact_event` → `event_experience_detail` | 1 : 0..1 | `event_id` | `LEFT JOIN` in `get_events_by_categories()` and `get_event_detail()` |
| `fact_event` → `event_sports_detail` | 1 : 0..1 | `event_id` | `get_event_detail()` |

**Standalone tables** (no relationships referenced in `queries.py`):
- `fact_hotel`
- `fact_restaurant`

These two are queried independently for Explore LA browsing and Journey budget recommendations; their relevance to a match / venue is computed at runtime by area string matching, not by a database FK.

---

## Notes on enforcement

- `dim_team`-related joins use **country name strings**, not surrogate IDs. The schema treats country as the natural key — but there's no DB-enforced foreign key (which is why `_with_latest_team_data()` in `queries.py` has to splice in renames for confirmed playoff winners after the fact).
- `event_id` on the two detail tables is treated as both PK and FK (one row per event at most).
- `event_category_id` is stored as `text` in `fact_event` (note the `::int` cast in `get_events_by_categories()`).

---

## Tables documented in the README but not referenced by `queries.py`

The main README mentions three additional tables that exist in the schema but aren't queried by the current backend:
- `dim_place` — stadiums, airports, transport places
- `dim_mode` — transport mode metadata
- `fact_route` — airport-to-venue and local routes

They aren't drawn above because no SQL in `queries.py` touches them. If/when a route-planning endpoint is added, this diagram should be updated.
