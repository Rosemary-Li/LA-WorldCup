# 前后端 API Interface 中文说明

这份文档说明 React 前端如何调用 Flask 后端，后端如何查询 PostgreSQL 数据库，以及返回的 JSON 数据如何被前端页面使用。

在本项目中，**API Interface** 指的是浏览器和服务器之间的数据接口合同：

- **前端**通过 `frontend/src/api.js` 发起 HTTP 请求。
- **后端**通过 `backend/app.py` 中的 Flask route 接收请求。
- **后端查询层**通过 `backend/queries.py` 执行 SQL。
- **数据库**是 PostgreSQL，数据来自 `database/clean_data/` 中的清洗后 CSV。
- **后端返回 JSON**，前端再把 JSON 转成页面组件需要的数据结构。

最重要的一点是：**前端浏览器不会直接连接 PostgreSQL**。数据库账号、密码、host 等信息只存在后端环境变量中，前端只能访问 Flask 暴露的 API。

```text
React 页面
  ↓ fetch()
frontend/src/api.js
  ↓ HTTP JSON
backend/app.py
  ↓ 调用查询函数
backend/queries.py
  ↓ SQL
PostgreSQL 数据库
```

## 1. 系统结构

项目分为三层：

1. **React 前端**
   - 主入口：`frontend/src/main.jsx`
   - API 封装：`frontend/src/api.js`
   - 本地前端地址：`http://127.0.0.1:5173`

2. **Flask 后端**
   - 主服务：`backend/app.py`
   - SQL 查询层：`backend/queries.py`
   - 后端 API 地址：`http://127.0.0.1:5000`

3. **PostgreSQL 数据库**
   - 清洗数据目录：`database/clean_data/`
   - 建表和导入逻辑：`backend/setup_database.py`

## 2. 前端 API 封装

所有前端请求集中写在 `frontend/src/api.js`。

```js
export const API_BASE = "http://127.0.0.1:5000";
```

通用请求函数：

```js
async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${endpoint}`);
  return res.json();
}
```

这表示：

- 所有请求都会发到 Flask 后端 `http://127.0.0.1:5000`。
- 前端期待后端返回 JSON。
- 如果后端返回错误状态码，前端会抛出错误。

## 3. 页面首次加载的数据

React 应用启动后，`App()` 会调用：

```js
loadSiteData()
```

这个函数一次性并行请求页面所需的大部分数据：

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

返回结果会被存进 React state：

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

如果后端不可用，前端会设置：

```js
apiReady = false
apiError = err
```

然后页面会显示数据库连接提示，而不是继续展示假的 fallback 数据。

## 4. Matches 比赛接口

### `GET /api/matches`

用途：返回所有洛杉矶比赛。

后端 route：

```py
@app.route("/api/matches")
def matches():
    return jsonify(queries.get_all_matches())
```

SQL 来源：

```sql
SELECT match_number, date, day_of_week, time_pt,
       team1, team2, "group", stage, venue
FROM fact_match
ORDER BY date, time_pt;
```

数据库表：

- `fact_match`

前端用途：

- `Matches` 页面展示比赛 schedule。
- `MatchOverlay` 点击比赛后，用 `match_number` 找到对应比赛。

主要字段：

| 字段 | 含义 |
|---|---|
| `match_number` | 比赛编号，如 `M4` |
| `date` | 比赛日期 |
| `day_of_week` | 星期 |
| `time_pt` | 太平洋时间开球时间 |
| `team1`, `team2` | 数据库里的两队名称 |
| `group` | 小组 |
| `stage` | 比赛阶段 |
| `venue` | 场馆 |

### `GET /api/matches/<match_number>`

用途：按比赛编号返回单场比赛详情。

SQL 来源：

```sql
SELECT match_number, date, day_of_week, time_pt,
       team1, team2, "group", stage, venue, venue_address, notes
FROM fact_match
WHERE match_number = %s;
```

当前前端主要使用首次加载的 `/api/matches` 数据，因此这个接口目前是备用详情接口。

## 5. Tickets 票务接口

### `GET /api/tickets`

用途：返回所有票务数据。

数据库表：

- `fact_ticket`

当前前端没有直接调用这个全量接口。

### `GET /api/tickets/<match_number>`

用途：返回某一场比赛的票务选项。

后端 route：

```py
@app.route("/api/tickets/<match_number>")
def tickets_by_match(match_number):
    return jsonify(queries.get_tickets_by_match(match_number))
```

SQL 来源：

```sql
SELECT ticket_id, seating_section, section_level,
       ticket_category, price_usd, ticket_status, matchup
FROM fact_ticket
WHERE match_number = %s
ORDER BY price_usd;
```

前端用途：

- `MatchOverlay` 里点击 `Tickets` tab 时调用。
- 前端函数是：

```js
loadTickets(matchNumber)
```

页面展示逻辑：

| API 字段 | 页面展示 |
|---|---|
| `ticket_category` | 票种名称 |
| `seating_section` | 座位区域 |
| `section_level` | 层级 |
| `price_usd` | 价格 |
| `ticket_status` | 票务状态 |

## 6. Teams 球队接口

### `GET /api/teams`

用途：返回与洛杉矶比赛相关的球队。

数据库表：

- `dim_team`

SQL 来源：

```sql
SELECT team_id, country, federation, status,
       group_stage, matches_in_la
FROM dim_team
ORDER BY group_stage, country;
```

前端用途：

- 首次加载时通过 `loadSiteData()` 获取。
- `Tournament Guide` 独立页面已经删除。
- 现在球队信息被合并进 `MatchOverlay`，也就是用户点开某场比赛后看到球队上下文。

页面展示：

| API 字段 | 页面含义 |
|---|---|
| `country` | 国家/球队 |
| `federation` | 所属洲际足联 |
| `status` | 当前状态 |
| `group_stage` | 小组 |
| `matches_in_la` | 在 LA 的比赛编号 |

### `GET /api/teams/<country>`

用途：按国家名查询单个球队详情。

当前前端不单独调用该接口，因为 `/api/teams` 已经在首次加载时获取了所有需要的数据。

## 7. Players 球员接口

### `GET /api/players`

用途：返回球员数据。

可选参数：

| 参数 | 默认值 | 含义 |
|---|---:|---|
| `limit` | `500` | 返回数量 |
| `offset` | `0` | 分页偏移 |
| `search` | 无 | 按球员名或球队搜索 |

数据库表：

- `dim_player`

前端用途：

- 首次加载时获取部分球员数据。
- `MatchOverlay` 会展示当前比赛相关球队的球员 preview。

### `GET /api/players/<team_country>`

用途：返回某个国家队的完整球员名单。

SQL 来源：

```sql
SELECT player_id, player_name, position,
       club, age, caps, goals, is_star, notes
FROM dim_player
WHERE team = %s
ORDER BY is_star DESC, goals DESC;
```

前端用途：

- `MatchOverlay` 中点击 `Full Squad` 时调用。
- 前端函数：

```js
loadPlayersByTeam(team)
```

### `GET /api/players/stars`

用途：返回 star players。

当前前端暂时没有调用。

## 8. Rankings 排名接口

### `GET /api/rankings`

用途：返回 FIFA ranking 数据。

数据库表：

- `fact_ranking`

SQL 来源：

```sql
SELECT ranking_id, rank, country,
       total_points, previous_rank, rank_change,
       confederation
FROM fact_ranking
ORDER BY rank;
```

前端用途：

- 首次加载时获取。
- `MatchOverlay` 中用于展示：
  - 两队 FIFA 排名
  - ranking points
  - rank change
  - 右侧 ranking snapshot

设计说明：

- 排名不再单独放在 `Tournament Guide` 页面。
- 用户点击一场 match 后，直接看到对应两支球队的排名，更符合比赛详情逻辑。

## 9. Hotels 酒店接口

### `GET /api/hotels`

用途：返回所有酒店。

数据库表：

- `fact_hotel`

SQL 来源：

```sql
SELECT hotel_id, hotel_name, region, address,
       star_rating, price_band, latitude, longitude,
       google_reviews_count
FROM fact_hotel
ORDER BY star_rating DESC;
```

前端转换：

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

前端用途：

- `ExploreLA` 的 Hotels 选择列表。
- `ExploreLA` 地图 pin。
- `Discover` 的 hotel cards。
- `MatchOverlay` 的附近酒店推荐。

### `GET /api/hotels/region/<region>`

用途：按地区筛选酒店。

当前前端未直接调用。

### `GET /api/hotels/price/<price_band>`

用途：按价格带筛选酒店。

当前前端未直接调用。Journey 推荐酒店使用的是后端 helper：`recommend_hotels_for_budget()`。

## 10. Restaurants 餐厅接口

### `GET /api/restaurants`

用途：返回餐厅数据，可分页和筛选。

参数：

| 参数 | 默认值 | 含义 |
|---|---:|---|
| `limit` | `500` | 返回数量 |
| `offset` | `0` | 分页偏移 |
| `search` | 无 | 按餐厅名搜索 |
| `region` | 无 | 按区域筛选 |

数据库表：

- `fact_restaurant`

SQL 来源：

```sql
SELECT restaurant_id, restaurant_name, region,
       address, price_range, flavor,
       google_review_score, review_count, disability_access
FROM fact_restaurant
WHERE ...
ORDER BY google_review_score DESC
LIMIT %s OFFSET %s;
```

前端转换：

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

前端用途：

- `ExploreLA` 的 Restaurants 选择列表。
- `Discover` 的 restaurant cards。
- `MatchOverlay` 的附近餐厅推荐。
- Journey 生成路线时，后端会根据预算选择餐厅。

### `GET /api/restaurants/flavor/<flavor>`

用途：按 cuisine/flavor 筛选餐厅。

当前前端未直接调用。

## 11. Events 活动接口

### `GET /api/events`

用途：返回活动数据，可分页、按名称搜索、按区域筛选。

参数：

| 参数 | 默认值 | 含义 |
|---|---:|---|
| `limit` | `500` | 返回数量 |
| `offset` | `0` | 分页偏移 |
| `search` | 无 | 按活动名称搜索 |
| `area` | 无 | 按 area 或 city 筛选 |

数据库表：

- `fact_event`
- `dim_event_category`

SQL 来源：

```sql
SELECT e.event_id, e.event_name, e.category,
       e.event_category_id,
       e.event_type, e.venue_name, e.area, e.city,
       e.start_date, e.end_date, e.event_time,
       e.detail_type, c.category AS category_label
FROM fact_event e
LEFT JOIN dim_event_category c
       ON e.event_category_id = c.event_category_id
ORDER BY e.start_date
LIMIT %s OFFSET %s;
```

前端会把 events 分成三类：

```js
const showCats = new Set([12, 13, 14, 15]);
const fanEventCats = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 23]);
```

转换后的 event object：

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

前端用途：

- `ExploreLA` 中的 Fan Events。
- `ExploreLA` 中的 Shows。
- `ExploreLA` 中的 Attractions。
- `Discover` 的 event/show cards。
- `MatchOverlay` 的附近 events 推荐。
- Journey 生成个性化旅行计划。

Explore LA 五类入口对应：

| Explore LA 分类 | 数据来源 |
|---|---|
| Hotels | `/api/hotels` |
| Restaurants | `/api/restaurants` |
| Fan Events | `/api/events` 中 category ID 为 `1-11, 23` 的数据 |
| Shows | `/api/events` 中 category ID 为 `12, 13, 14, 15` 的数据 |
| Attractions | `/api/events` 中 category ID 为 `16, 17, 18, 19, 20, 21, 22` 的数据 |

### `GET /api/events/<event_id>`

用途：返回单个 event 的完整详情。

数据库表：

- `fact_event`
- `dim_event_category`
- `event_experience_detail`
- `event_sports_detail`

后端逻辑：

1. 查询 `fact_event` 基础信息。
2. join `dim_event_category` 获取分类 label。
3. 查询 `event_experience_detail`。
4. 查询 `event_sports_detail`。
5. 把详情作为 nested object 返回：
   - `experience_detail`
   - `sports_detail`

前端用途：

- 点击 event card 后调用。
- 结果展示在 `EventOverlay` 弹窗中。

### `GET /api/events/category/<category>`

用途：按活动类别字符串进行 `ILIKE` 查询。

当前前端未直接调用。

## 12. Routes 交通接口

### `GET /api/routes`

用途：返回从机场/地点到 SoFi Stadium 的交通路线。

数据库表：

- `fact_route`
- `dim_place`
- `dim_mode`

SQL 来源：

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

前端用途：

- 首次加载时获取。
- `Discover` 如果打开 routes/transport tab，可以展示交通卡片。
- 用户之前要求 Getting There 更适合放在 Journey 逻辑里，因此 Explore LA 初始照片墙不再放 Getting There。

## 13. Map Data 地图接口

### `GET /api/map-data`

用途：返回可放在地图上的坐标数据。

返回结构：

```json
{
  "hotels": [...],
  "places": [...]
}
```

数据来源：

- `fact_hotel`
- `dim_place`

前端用途：

- 首次加载时尝试获取。
- 当前 `ExploreLA` 地图主要使用 hotel 自带经纬度。
- Restaurants/events 如果数据库没有精确经纬度，前端会根据 area 文本推测一个大致坐标用于展示。
- SoFi Stadium 默认显示在地图上，并用特殊颜色突出。

## 14. Journey 个性化旅行计划接口

### `GET /api/itinerary`

用途：根据用户偏好生成旅行 schedule。

参数：

| 参数 | 默认值 | 前端选项 |
|---|---|---|
| `type` | `football` | `football`, `family`, `backpacker`, `luxury` |
| `budget` | `mid` | `budget`, `mid`, `luxury` |
| `days` | `3` | `3`, `5`, `7` |
| `match_date` | `jun12` | `jun12`, `jun15`, `jun18`, `jun21`, `jun25`, `jun28`, `jul2`, `jul10` |
| `vibe` | `culture` | `culture`, `beach`, `nightlife`, `film` |

后端逻辑：

1. 根据 `type` 选择一组 event category IDs。
2. 根据 `vibe` 再选择一组补充 event category IDs。
3. 根据 `budget` 选择 hotel price band 和 restaurant price ranges。
4. SQL 查询 events、hotels、restaurants。
5. 用用户参数生成稳定随机 seed，让相同输入得到相同 schedule。
6. 把用户选择的比赛插入 match day。
7. 返回完整行程 JSON。

返回结构示例：

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

前端用途：

- `Journey` 页面点击生成按钮时调用。
- 前端函数：

```js
generateJourney(params)
```

## 15. 前端页面和 API 的对应关系

| 前端页面/功能 | React 组件 | API |
|---|---|---|
| 首页 Hero | `PhotoHero` | 不调用 API |
| 比赛 schedule | `Matches` | `/api/matches` |
| 比赛详情弹窗 | `MatchOverlay` | `/api/matches`, `/api/teams`, `/api/rankings`, `/api/players` |
| 比赛票务 | `MatchOverlay` Tickets tab | `/api/tickets/<match_number>` |
| 完整球员名单 | `MatchOverlay` Full Squad tab | `/api/players/<team_country>` |
| Explore LA 照片墙 | `ExploreLA` | 使用已加载 hotels/restaurants/events |
| Explore LA 地图 | `SyncMap` | 使用已加载数据和地图坐标 |
| Discover cards | `Discover` | 使用已加载 hotels/restaurants/events/routes |
| Event 详情弹窗 | `EventOverlay` | `/api/events/<event_id>` |
| Journey 生成 | `Journey` | `/api/itinerary` |
| About Us | `About` | 静态前端数据 |

## 16. 数据库表和 API 对应关系

| 数据库表 | API |
|---|---|
| `fact_match` | `/api/matches`, `/api/matches/<match_number>` |
| `fact_ticket` | `/api/tickets`, `/api/tickets/<match_number>` |
| `dim_team` | `/api/teams`, `/api/teams/<country>` |
| `dim_player` | `/api/players`, `/api/players/<team_country>`, `/api/players/stars` |
| `fact_ranking` | `/api/rankings` |
| `fact_hotel` | `/api/hotels`, `/api/hotels/region/<region>`, `/api/hotels/price/<price_band>`, `/api/map-data` |
| `fact_restaurant` | `/api/restaurants`, `/api/restaurants/flavor/<flavor>`, Journey helper |
| `fact_event` | `/api/events`, `/api/events/<event_id>`, `/api/events/category/<category>`, Journey helper |
| `dim_event_category` | `/api/events`, `/api/events/<event_id>`, Journey helper |
| `event_experience_detail` | `/api/events/<event_id>`, Journey helper |
| `event_sports_detail` | `/api/events/<event_id>` |
| `fact_route` | `/api/routes` |
| `dim_place` | `/api/routes`, `/api/map-data` |
| `dim_mode` | `/api/routes` |

## 17. 隐私和安全边界

前端不会暴露数据库连接信息。

数据库连接只在 `backend/queries.py` 中通过环境变量读取：

```py
host=os.getenv("DB_HOST")
port=int(os.getenv("DB_PORT", 5432))
dbname=os.getenv("DB_NAME")
user=os.getenv("DB_USER")
password=os.getenv("DB_PASSWORD")
sslmode=os.getenv("DB_SSLMODE", "require")
```

浏览器只知道：

```js
http://127.0.0.1:5000
```

这比把数据库账号写在前端安全得多。

## 18. 本地运行顺序

启动后端：

```bash
cd backend
python3 app.py
```

启动前端：

```bash
cd frontend
npm run dev
```

打开页面：

```text
http://127.0.0.1:5173
```

快速测试 API：

```bash
curl -s http://127.0.0.1:5000/api/matches
curl -s http://127.0.0.1:5000/api/events
curl -s "http://127.0.0.1:5000/api/itinerary?type=football&budget=mid&days=5&match_date=jun12&vibe=culture"
```

## 19. 当前设计决策

1. **Tournament Guide 不再单独存在**
   - Teams 和 Rankings 已并入 match detail。
   - 用户点击一场比赛后，直接看到两队信息和排名，更符合用户路径。

2. **Explore LA 只保留五个入口**
   - Hotels
   - Restaurants
   - Fan Events
   - Shows
   - Attractions

3. **Explore LA 初始页只显示照片墙**
   - 地图不会一开始显示。
   - 用户点击某个分类后，才进入左侧选择列表和右侧地图。

4. **Journey 由后端生成**
   - 行程不是前端写死的。
   - 后端根据数据库中的 events、hotels、restaurants 生成结果。

5. **后端数据是唯一真实来源**
   - 如果 Flask 后端不可用，页面会显示连接提示。
   - 前端不会继续使用假的备用数据来伪装数据库结果。
