# API 接口文档

React 前端与 Flask/PostgreSQL 后端之间的数据契约。

- React 通过 `frontend/src/api.js` 发送 HTTP 请求。
- Flask 在 `backend/app.py` 接收请求，调用 `backend/queries.py`。
- 行程生成逻辑独立于 `backend/services/itinerary.py`。
- PostgreSQL 返回数据行；Flask 序列化为 JSON。
- 浏览器不直接接触 PostgreSQL。

> English version: [API_INTERFACE.md](API_INTERFACE.md)

---

## 前端 API 客户端

所有请求通过 `frontend/src/api.js` 发送，基础 URL 从环境变量读取：

```js
export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:5001";
```

在 `frontend/.env` 中设置 `VITE_API_BASE` 即可指向任意后端地址，无需修改源码。Vite 开发服务器同时将 `/api` 请求代理至同一目标。

应用挂载时，`loadSiteData()` 并行拉取所有主数据集：

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

返回 UI 可直接使用的状态：`{ matches, players, hotels, restaurants, fanEvents, shows, allEvents, rankings, teams }`。

加载失败时，`apiReady = false`，UI 显示连接错误提示，不展示空数据。

---

## 组件 → API 映射

| 组件 / Hook | 数据来源 |
|---|---|
| `useSiteData` | `loadSiteData()` — 挂载时并行拉取 |
| `PhotoHero` | 无 |
| `Matches` | `data.matches`（预加载） |
| `MatchOverlay` | `data.matches/teams/rankings`；按需调用 `loadTickets()`、`loadPlayersByTeam()` |
| `ExploreLA` | `data.hotels`、`data.restaurants`、`data.fanEvents`、`data.shows`、`data.allEvents` |
| `SyncMap` | 通过 props 传入选中项（无 API 调用） |
| `Journey` | `generateJourney()` → `GET /api/itinerary` |
| `About` | 静态数据 |

---

## 接口详情

### `GET /api/matches`

按日期排序的所有洛杉矶赛事。

```sql
SELECT match_number, date, day_of_week, time_pt,
       team1, team2, "group", stage, venue
FROM fact_match
ORDER BY date, time_pt
```

| 字段 | 说明 |
|---|---|
| `match_number` | 比赛编号，如 `M4` |
| `date` | 比赛日期 |
| `time_pt` | 开球时间（太平洋时间） |
| `team1`、`team2` | 数据库中的队伍名称 |
| `stage` | 赛制阶段 |
| `venue` | 球场名称 |

---

### `GET /api/matches/<match_number>`

含场馆地址和备注的单场比赛详情。接口可用，前端大部分展示使用预加载数据。

---

### `GET /api/tickets/<match_number>`

单场门票选项，在 `MatchOverlay` 的门票标签页打开时按需调用。

```sql
SELECT ticket_id, seating_section, section_level,
       ticket_category, price_usd, ticket_status, matchup
FROM fact_ticket
WHERE match_number = %s
ORDER BY price_usd
```

| 字段 | 前端用途 |
|---|---|
| `ticket_category` | 卡片标题（自动去除中文括号注释） |
| `seating_section` | 看台区域 |
| `price_usd` | 显示为 `$XXX` |
| `ticket_status` | 颜色标注：绿色 = 有票，红色 = 售罄 |

---

### `GET /api/teams`

所有参与洛杉矶赛事的球队，用于 `MatchOverlay` 的球队信息展示。

| 字段 | 说明 |
|---|---|
| `country` | 队伍名称 |
| `federation` | 所属联合会 |
| `status` | 资格状态 |
| `group_stage` | 分组代码 |
| `matches_in_la` | 洛杉矶赛事参与情况 |

---

### `GET /api/rankings`

所有洛杉矶赛事球队的 FIFA 排名快照。

| 字段 | 说明 |
|---|---|
| `country` | 国家/地区 |
| `rank` | FIFA 排名 |
| `total_points` | 排名积分 |
| `rank_change` | 与上次排名的变化 |

---

### `GET /api/players`

全部球员。可选查询参数：`limit`（默认 500）、`offset`（默认 0）、`search`。

### `GET /api/players/stars`

仅返回明星球员（`is_star = true`）。

### `GET /api/players/<team_country>`

单支球队的球员列表，在 `MatchOverlay` 的阵容标签页打开时按需调用。

| 字段 | 前端用途 |
|---|---|
| `player_name` | 球员姓名（明星球员后缀 `★`） |
| `position` | 位置 |
| `club` | 俱乐部 |
| `caps` | 国际出场次数 |
| `goals` | 国际进球数 |

---

### `GET /api/hotels`

按星级降序排列的全部酒店。

`loadSiteData()` 中的前端字段映射：

```js
{
  name:    h.hotel_name,
  region:  cleanParenthetical(h.region),   // 去除"（注释）"式标注
  address: h.address,
  stars:   Math.round(h.star_rating) || 3,
  price:   h.price_band ? `${h.price_band}/night` : "N/A",
  reviews: h.google_reviews_count || 0,
  lat:     h.latitude,
  lon:     h.longitude
}
```

用途：探索 LA 酒店标签页、地图图钉、`MatchOverlay` 附近酒店、行程酒店推荐。

额外接口（可用，当前 UI 未调用）：
- `GET /api/hotels/region/<region>`
- `GET /api/hotels/price/<price_band>`

---

### `GET /api/restaurants`

查询参数：`limit`（默认 500）、`offset`、`search`、`region`。

前端字段映射：

```js
{
  name:   r.restaurant_name,
  region: r.region,
  price:  r.price_range,
  flavor: r.flavor,
  score:  r.google_review_score
}
```

用途：探索 LA 餐厅标签页、`MatchOverlay` 附近餐厅、行程餐食安排。

额外接口：`GET /api/restaurants/flavor/<flavor>`

---

### `GET /api/events`

查询参数：`limit`（默认 500）、`offset`、`search`、`area`。

`fact_event` 与 `dim_event_category` 联表查询，返回 `source_url` 用于官方网站链接。

前端在加载时按类别 ID 拆分：

```js
showCats     = new Set([12, 13, 14, 15])      // → data.shows（演出）
fanEventCats = new Set([1-11, 23])             // → data.fanEvents（球迷活动）
// 全部活动 → data.allEvents（景点从类别 ID 16-22 中筛选）
```

额外接口：
- `GET /api/events/category/<category>`
- `GET /api/events/<event_id>` — 含 `event_experience_detail` 和 `event_sports_detail` 联表的完整详情

---

### `GET /api/itinerary`

生成个性化逐日旅行计划。逻辑在 `backend/services/itinerary.py`；Flask 路由只解析参数并调用 `build_itinerary()`。

**查询参数：**

| 参数 | 默认值 | 可选值 |
|---|---|---|
| `type` | `football` | `football`、`family`、`backpacker`、`luxury` |
| `budget` | `mid` | `budget`、`mid`、`luxury` |
| `days` | `3` | 1–7 |
| `match_date` | `jun12` | `jun12`、`jun15`、`jun18`、`jun21`、`jun25`、`jun28`、`jul2`、`jul10` |
| `vibe` | `culture` | `culture`、`beach`、`nightlife`、`film` |
| `picks` | `[]` | URL 编码的 JSON 数组，包含探索 LA 选中项 |

**`picks` 单项结构：**

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

**后端逻辑（`services/itinerary.py`）：**

1. `type` → 活动类别 ID → `get_events_by_categories()`
2. `vibe` → 氛围类别 ID → `get_events_by_categories()`
3. `budget` → `recommend_hotels_for_budget()` / `recommend_restaurants_for_budget()`
4. 去重：已出现在 type 池中的 vibe 活动仅保留在 vibe 池
5. 确定性种子打乱：相同参数集返回相同行程
6. 从选中酒店（或首选推荐酒店）提取基础区域，同区域餐厅和活动优先排前
7. 探索 LA 活动选择优先插入每日行程（每天最多 2 项）
8. 从双端队列池中按类别去重构建每日行程：

| 时间 | 安排 |
|---|---|
| 09:30 | 上午活动（旅行者类型活动，类别不重复） |
| 12:30 | 午餐（餐厅） |
| 15:00 | 下午活动（不同类别） |
| 18:00 | 夜间/氛围活动 |
| 20:30 | 晚餐（餐厅） |

比赛日：上午活动 → 午餐 → 比赛，无晚间安排。

**比赛日期和区域坐标配置：**

比赛标签存储在 `backend/config/matches.json`，LA 区域坐标存储在 `backend/config/areas.json`，服务启动时加载，无需修改 Python 代码即可更新。

**响应结构：**

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

有坐标时，活动对象包含 `lat`/`lng`（酒店来自 `fact_hotel` 精确坐标，活动/餐厅来自 `config/areas.json` 区域中心点近似值）。前端用这些坐标在鼠标悬停时高亮地图标记。

活动 `source` 取值说明：

| `source` | 显示标签 | 数据来源 |
|---|---|---|
| `event` | `EVENT` | `fact_event` 行 |
| `restaurant` | `DINE` | `fact_restaurant` 行 |
| `match` | `MATCH` | 固定比赛活动 |
| `explore_pick` | `PICK` | 用户在探索 LA 中选择的项目 |

---

## 探索 LA 选择传递流程

1. 用户在探索 LA 中选择卡片 → 存储到 `ExploreLA.jsx` 的 React 状态和 `localStorage`。
2. 页面刷新时 `localStorage` 清空 —— 每次访问始终重新选择。
3. 点击"生成我的旅程 →" 滚动至行程板块；选择通过 `App` 状态向下传递给 `Journey`。
4. 提交时最多 12 个选择被序列化为 JSON，作为 `picks` 查询参数发送。
5. `services/itinerary.py` 将酒店选择（用于区域匹配）与活动选择（用于行程插入）分开处理。
6. 响应包含 `picks_used`，前端据此显示已纳入的选择数量。

---

## 全部接口一览

| 接口 | 状态 |
|---|---|
| `GET /api/matches` | 已使用 |
| `GET /api/matches/<match_number>` | 可用 |
| `GET /api/tickets/<match_number>` | 已使用（按需） |
| `GET /api/tickets` | 可用 |
| `GET /api/teams` | 已使用 |
| `GET /api/teams/<country>` | 可用 |
| `GET /api/players` | 已使用 |
| `GET /api/players/stars` | 可用 |
| `GET /api/players/<team_country>` | 已使用（按需） |
| `GET /api/rankings` | 已使用 |
| `GET /api/hotels` | 已使用 |
| `GET /api/hotels/region/<region>` | 可用 |
| `GET /api/hotels/price/<price_band>` | 可用 |
| `GET /api/restaurants` | 已使用 |
| `GET /api/restaurants/flavor/<flavor>` | 可用 |
| `GET /api/events` | 已使用 |
| `GET /api/events/category/<category>` | 可用 |
| `GET /api/events/<event_id>` | 可用 |
| `GET /api/itinerary` | 已使用 |

---

## 数据库 → 接口映射

| 数据库表 | 对应接口 |
|---|---|
| `fact_match` | `/api/matches`、`/api/matches/<match_number>` |
| `fact_ticket` | `/api/tickets`、`/api/tickets/<match_number>` |
| `dim_team` | `/api/teams`、`/api/teams/<country>` |
| `dim_player` | `/api/players`、`/api/players/<team>`、`/api/players/stars` |
| `fact_ranking` | `/api/rankings` |
| `fact_hotel` | `/api/hotels`、`/api/hotels/region/<r>`、`/api/hotels/price/<p>`、`/api/itinerary` |
| `fact_restaurant` | `/api/restaurants`、`/api/restaurants/flavor/<f>`、`/api/itinerary` |
| `fact_event` | `/api/events`、`/api/events/<id>`、`/api/events/category/<c>`、`/api/itinerary` |
| `dim_event_category` | 联表于 `/api/events`、`/api/itinerary` |
| `event_experience_detail` | 联表于 `/api/events/<id>` |
| `event_sports_detail` | `/api/events/<id>` |
| `fact_route` | 数据库中存在，当前 API 未暴露 |
| `dim_place` | 数据库中存在，当前 API 未暴露 |
| `dim_mode` | 数据库中存在，当前 API 未暴露 |

---

## 安全边界

前端仅从环境变量读取 `VITE_API_BASE`，不接触：

- 数据库 host、用户名、密码、SSL 模式
- 原始 SQL
- 连接池内部状态

所有用户控制的查询参数在 `queries.py` 中通过参数化 SQL 处理，代码库中无任何用户输入的字符串拼接。
