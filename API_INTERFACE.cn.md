# 前后端 API Interface 中文说明

这份文档说明当前 React 前端和 Flask/PostgreSQL 后端之间的数据接口关系。

在本项目中，**API interface** 指浏览器和服务器之间的数据合同：

- React 通过 `frontend/src/api.js` 发起 HTTP 请求。
- Flask 在 `backend/app.py` 中接收请求。
- Flask 调用 `backend/queries.py` 中的 SQL 查询函数。
- PostgreSQL 返回查询结果。
- Flask 把结果序列化成 JSON。
- React 把 JSON 转成 `frontend/src/main.jsx` 中组件需要的 UI state。

前端浏览器不会直接连接 PostgreSQL。数据库账号、密码、host 和 SSL 信息都只存在后端环境变量中。

## 1. 当前前端页面

当前 React app 渲染这些部分：

| 页面部分 | React 组件 | API 使用 |
|---|---|---|
| Hero | `PhotoHero` | 不调用 API |
| Matches | `Matches` | 使用 `loadSiteData()` 加载的 `/api/matches` |
| 比赛详情 | `MatchOverlay` | 使用 matches、teams、rankings、players、hotels、restaurants、events；票务按需加载 |
| Explore LA | `ExploreLA` | 使用 hotels、restaurants 和 event categories |
| Explore 地图面板 | `SyncMap` | 使用前端选中的地点/活动数据 |
| Journey | `Journey` | 通过 `generateJourney()` 调用 `/api/itinerary` |
| About Us | `About` | 静态团队介绍内容 |

球队、球员、票务和 FIFA ranking 信息现在放在比赛详情弹窗中展示。

## 2. 前端 API 封装

所有前端请求集中在 `frontend/src/api.js`。

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

每个请求都会：

- 访问 Flask 后端 `http://127.0.0.1:5000`。
- 期待 JSON 返回。
- 如果 Flask 返回非 2xx 状态码，就抛出错误。

## 3. 页面首次加载

`App()` 挂载后会调用：

```js
loadSiteData()
```

`loadSiteData()` 并行请求主要数据：

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

返回的前端 state 是：

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

当前渲染页面主要使用：

- `matches`
- `players`
- `hotels`
- `restaurants`
- `fanEvents`
- `shows`
- `allEvents`
- `rankings`
- `teams`

如果加载失败，`App()` 会设置：

```js
apiReady = false
apiError = err
```

页面会显示数据库连接提示，而不是展示假的 fallback 数据。

## 4. Matches API

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

- `Matches` 比赛日程。
- `MatchOverlay` 单场比赛详情。
- Journey 中的比赛日期上下文。

主要字段：

| API 字段 | 含义 |
|---|---|
| `match_number` | 比赛编号，如 `M4` |
| `date` | 比赛日期 |
| `day_of_week` | 星期 |
| `time_pt` | 太平洋时间开球 |
| `team1`, `team2` | 数据库中的球队 |
| `group` | 小组 |
| `stage` | 比赛阶段 |
| `venue` | 场馆 |

### `GET /api/matches/<match_number>`

用途：按比赛编号返回单场比赛。

当前前端状态：

- 后端可用。
- 当前 React 通常使用预加载的 `/api/matches` 数据，不额外调用这个接口。

## 5. 比赛详情相关接口

比赛详情弹窗不是单一接口，而是多个数据源组合出来的。

### Teams: `GET /api/teams`

数据库表：

- `dim_team`

前端用途：

- 通过 `loadSiteData()` 首次加载。
- 在 `MatchOverlay` 中展示选中比赛的球队上下文。

常用字段：

| API 字段 | 页面含义 |
|---|---|
| `country` | 球队/国家 |
| `federation` | 所属足联 |
| `status` | 晋级/状态标签 |
| `group_stage` | 小组 |
| `matches_in_la` | 是否涉及洛杉矶比赛 |

### Rankings: `GET /api/rankings`

数据库表：

- `fact_ranking`

前端用途：

- 通过 `loadSiteData()` 首次加载。
- 在比赛详情中与球队信息一起展示，方便用户比较两队排名。

常用字段：

| API 字段 | 页面含义 |
|---|---|
| `country` | 国家/球队 |
| `fifa_rank` | FIFA 排名 |
| `points` | 当前积分 |
| `previous_points` | 之前积分 |
| `rank_change` | 排名变化 |

### Players: `GET /api/players`

数据库表：

- `dim_player`

前端用途：

- 通过 `loadSiteData()` 首次加载。
- 用于比赛/球队的球员上下文。

可选接口：

```text
GET /api/players/<team_country>
```

这个接口可以按球队查询球员，适合未来做更细的球队详情。

### Tickets: `GET /api/tickets/<match_number>`

数据库表：

- `fact_ticket`

前端用途：

- 由 `loadTickets(matchNumber)` 按需调用。
- 用户在 `MatchOverlay` 中打开 Tickets tab 时触发。

SQL 来源：

```sql
SELECT ticket_id, seating_section, section_level,
       ticket_category, price_usd, ticket_status, matchup
FROM fact_ticket
WHERE match_number = %s
ORDER BY price_usd;
```

页面映射：

| API 字段 | 页面展示 |
|---|---|
| `ticket_category` | 票种名称 |
| `seating_section` | 座位区域 |
| `section_level` | 座位层级 |
| `price_usd` | 价格 |
| `ticket_status` | 票务状态 |

## 6. Explore LA 相关接口

Explore LA 当前有五个分类：

| Explore 分类 | 数据来源 | 前端 state |
|---|---|---|
| Hotels | `/api/hotels` | `data.hotels` |
| Restaurants | `/api/restaurants` | `data.restaurants` |
| Fan Events | `/api/events` 按 category IDs 过滤 | `data.fanEvents` |
| Shows | `/api/events` 按 category IDs 过滤 | `data.shows` |
| Attractions | 从 `/api/events` 的全部 events 中过滤 | `data.allEvents` |

Explore LA 初始页是照片墙。点击一个分类后，在同一个 section 中打开该分类。

### Hotels: `GET /api/hotels`

数据库表：

- `fact_hotel`

前端映射：

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

用途：

- Explore LA Hotels 列表。
- 有坐标时显示地图 pin。
- `MatchOverlay` 中的附近酒店上下文。

### Restaurants: `GET /api/restaurants`

查询参数：

| 参数 | 含义 |
|---|---|
| `limit` | 最大返回行数 |
| `offset` | 分页偏移 |
| `search` | 可选餐厅名称搜索 |
| `region` | 可选地区过滤 |

数据库表：

- `fact_restaurant`

前端映射：

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

用途：

- Explore LA Restaurants 列表。
- 餐厅 picks。
- `MatchOverlay` 中的附近餐厅。
- Journey 餐厅推荐池。

### Events: `GET /api/events`

查询参数：

| 参数 | 含义 |
|---|---|
| `limit` | 最大返回行数 |
| `offset` | 分页偏移 |
| `search` | 可选活动名称搜索 |
| `area` | 可选区域过滤 |

数据库表：

- `fact_event`
- `dim_event_category`

重要 SQL 行为：

- 活动数据会 join `dim_event_category`。
- 返回 `source_url`，方便前端显示明确的 `Official Site` 链接。

前端映射：

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

分类拆分：

```js
showCats = new Set([12, 13, 14, 15])
fanEventCats = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 23])
```

用途：

- Fan Events。
- Shows。
- Attractions。
- Journey 活动推荐池。

### 官网链接行为

Explore LA 卡片点击图片不会跳出当前 app。只有用户点击明确的 `Official Site` 链接时，才会打开外部官网。

`frontend/src/placeMedia.js` 用于匹配地点/活动的官网 URL 和图片逻辑。后端 event rows 也可以通过 `source_url` 提供官网链接。

## 7. Explore Picks

Explore LA 的选择逻辑在前端管理：

- 用户可以选择 hotels、restaurants、fan events、shows、attractions。
- 选中的内容会出现在 Pick 面板中。
- Picks 会保存到浏览器 local storage。
- `Go` 按钮会把用户带到 Journey section。
- `Journey` 组件会从 `App()` state 接收当前 picks。
- 用户生成 Journey 时，前端会把最多 12 个 picks 作为 JSON 编码后的 `picks` 参数传给 `/api/itinerary`。
- Flask 会解析这些 picks，并优先把它们放入生成的行程。

## 8. Journey API

### `GET /api/itinerary`

用途：生成个性化旅行计划。

前端函数：

```js
generateJourney(params)
```

后端 route：

```py
@app.route("/api/itinerary")
def itinerary():
    ...
```

查询参数：

| 参数 | 默认值 | 含义 |
|---|---:|---|
| `type` | `football` | 旅行者类型：football、family、backpacker、luxury |
| `budget` | `mid` | 预算：budget、mid、luxury |
| `days` | `3` | 生成天数，限制在 1-7 |
| `match_date` | `jun12` | 比赛日选择 |
| `vibe` | `culture` | 额外活动氛围：culture、beach、nightlife、film |
| `picks` | `[]` | Explore LA 选择结果的 JSON 列表 |

后端映射：

| 输入 | SQL helper |
|---|---|
| `type` | `get_events_by_categories(type_cats)` |
| `vibe` | `get_events_by_categories(vibe_cats)` |
| `budget` | `recommend_hotels_for_budget()` |
| `budget` | `recommend_restaurants_for_budget()` |
| `picks` | Flask 解析后优先插入生成行程 |

返回结构：

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

前端用途：

- `Journey` 调用 `generateJourney(params)`。
- `JourneyResult` 展示每日活动、酒店和比赛上下文。

## 9. 后端接口总表

| 接口 | 当前状态 |
|---|---|
| `GET /api/matches` | 使用中 |
| `GET /api/matches/<match_number>` | 可用，当前多使用预加载数据 |
| `GET /api/tickets` | 可用于未来全量票务页面 |
| `GET /api/tickets/<match_number>` | 比赛详情中使用 |
| `GET /api/teams` | 使用中 |
| `GET /api/teams/<country>` | 可用 |
| `GET /api/players` | 使用中 |
| `GET /api/players/stars` | 可用 |
| `GET /api/players/<team_country>` | 可用 |
| `GET /api/rankings` | 使用中 |
| `GET /api/hotels` | 使用中 |
| `GET /api/hotels/region/<region>` | 可用 |
| `GET /api/hotels/price/<price_band>` | 可用 |
| `GET /api/restaurants` | 使用中 |
| `GET /api/restaurants/flavor/<flavor>` | 可用 |
| `GET /api/events` | 使用中 |
| `GET /api/events/category/<category>` | 可用 |
| `GET /api/events/<event_id>` | 可用于未来活动详情 |
| `GET /api/itinerary` | 使用中 |

## 10. 数据库表和 API 对应关系

| 数据库表 | 主要 API |
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
| `fact_route` | 保存在数据库中，当前公开 API 不暴露 |
| `dim_place` | 保存在数据库中，当前公开 API 不暴露 |
| `dim_mode` | 保存在数据库中，当前公开 API 不暴露 |

## 11. 隐私和安全边界

前端只知道：

```js
API_BASE = "http://127.0.0.1:5000"
```

前端不知道：

- 数据库 host
- 数据库用户名
- 数据库密码
- SSL 模式
- 原始 SQL 查询

这些信息只存在于：

- `backend/.env`
- `backend/queries.py`
- PostgreSQL

## 12. 快速测试

先启动 Flask：

```bash
cd backend
python3 app.py
```

再测试接口：

```bash
curl -s http://127.0.0.1:5000/api/matches
curl -s http://127.0.0.1:5000/api/hotels
curl -s http://127.0.0.1:5000/api/events
curl -s "http://127.0.0.1:5000/api/itinerary?type=football&budget=mid&days=5&match_date=jun12&vibe=culture"
```
