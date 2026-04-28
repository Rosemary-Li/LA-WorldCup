# API 接口文档

React 前端与 Flask/PostgreSQL 后端之间的数据契约。

- React 通过 `frontend/src/api.js` 发送 HTTP 请求。
- Flask 在 `backend/app.py` 接收并调用 `backend/queries.py`。
- 行程生成逻辑在 `backend/services/itinerary.py`。
- 赛事故事与实时 H2H 数据分别在 `backend/services/match_story.py`（Anthropic）和 `backend/services/match_data.py`（API-Football）。
- PostgreSQL 返回行；Flask 序列化为 JSON。
- 浏览器永不直接接触 PostgreSQL。

> English version: [API_INTERFACE.md](API_INTERFACE.md)

---

## 前端 API 客户端

所有请求都走 `frontend/src/api.js`。Base URL 从环境变量读取：

```js
export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:5001";
```

通过 `frontend/.env` 中的 `VITE_API_BASE` 指向任意后端 host。Vite 开发服务器同时把 `/api` 代理到该地址，开发环境下相对路径也能用。

### 超时 + abort

`apiFetch` 用 `AbortController` 包裹 `fetch`。默认超时 15s；`/api/itinerary` 因为生成可能比较慢，单独设置 30s。封装现在也支持 `method` + `body`，所以 POST 请求（如 `saveJourneyShare`）走同样的日志 + 超时链路：

```js
async function apiFetch(endpoint, { timeoutMs = 15000, method = "GET", body } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const init = { signal: ctrl.signal, method };
    if (body !== undefined) {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${endpoint}`, init);
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

后端卡住不会再让 UI 死锁。每个请求会用 `[api] →` / `[api] ✓` / `[api] ✗` 前缀打到浏览器 console。

### 启动时并行加载

App mount 时 `useSiteData` 调用 `loadSiteData()`，并行抓取所有主数据集：

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

返回 UI-ready 的 state：`{ matches, players, hotels, restaurants, fanEvents, shows, allEvents, rankings, teams }`。

### 失败自愈

`useSiteData` 最多重试 4 次，指数退避（1s, 2s, 4s）。同时暴露 `refetch()` 让用户在 `DataNotice` 的 "Retry" 按钮上手动重试：

```js
const { data, apiReady, apiError, refetch } = useSiteData();
```

如果重试都失败，`apiReady = false`，UI 显示带重试按钮的连接错误，而不是空白数据。

---

## 组件 → API 映射

| 组件 / Hook | 数据来源 |
|---|---|
| `useSiteData` | `loadSiteData()` — mount 时并行加载、退避重试、暴露 `refetch()` |
| `PhotoHero` | 无 |
| `Matches` | `data.matches`（预加载） |
| `MatchOverlay` | `data.matches/teams/rankings`；按需 `loadMatchStory(num)` + `loadMatchStats(num)` |
| `ExploreLA` | `data.hotels`, `data.restaurants`, `data.fanEvents`, `data.shows`, `data.allEvents` — 客户端通过 `lib/personaSort.js` 用 `journeyPrefs` + 当前 picks 重新排序 |
| `SyncMap` | 通过 props 接收选中项（不自己请求） |
| `Journey`（表单） | `selectedMatches`、`explorePicks`，来自 App state |
| `Journey.submit()` | `generateJourney()` → `GET /api/itinerary` |
| `JourneyResult` | `generateJourney()` 返回的 `data`；本地 state 承载编辑/添加/删除 |
| `ShareModal` | `saveJourneyShare(payload)` → `POST /api/itinerary/save`（拿短码用于分享 URL） |
| `App`（mount） | URL 含 `?i=<id>` 时：`loadJourneyShare(id)` → `GET /api/itinerary/share/<id>` → 渲染到 `JourneyResult` |
| `ActivityPicker` | 只读 `siteData`，不发请求（用 `useSiteData` 已经加载好的 explore pool） |
| `About` | 静态 |

---

## 接口列表

### `GET /api/matches`

LA 全部比赛，按日期排序。

```sql
SELECT match_number, date, day_of_week, time_pt,
       team1, team2, "group", stage, venue
FROM fact_match
ORDER BY date, time_pt
```

| 字段 | 说明 |
|---|---|
| `match_number` | 比赛 ID（如 `M4`） |
| `date` | 比赛日期 |
| `time_pt` | 太平洋时间开球时刻 |
| `team1`, `team2` | 球队名 |
| `stage` | 赛事阶段 |
| `venue` | 球场名称 |

---

### `GET /api/matches/<match_number>`

单场比赛详情，含场馆地址、备注。可用；前端大部分场景用预加载数据。

---

### `GET /api/tickets/<match_number>`

单场票务选项。

```sql
SELECT ticket_id, seating_section, section_level,
       ticket_category, price_usd, ticket_status, matchup
FROM fact_ticket
WHERE match_number = %s
ORDER BY price_usd
```

| 字段 | UI 用途 |
|---|---|
| `ticket_category` | 卡片标题 |
| `seating_section` | 座位区 |
| `price_usd` | 显示为 `$XXX` |
| `ticket_status` | 颜色：绿 = Available，红 = Sold Out |

---

### `GET /api/teams`

LA 全部参赛球队。`MatchOverlay` 用作球队上下文。

| 字段 | 说明 |
|---|---|
| `country` | 队名 |
| `federation` | 足联 |
| `status` | 晋级状态 |
| `group_stage` | 小组 |
| `matches_in_la` | 在 LA 的比赛参与情况 |

---

### `GET /api/rankings`

LA 全部参赛队的 FIFA 排名快照。

| 字段 | 说明 |
|---|---|
| `country` | 国家 |
| `rank` | FIFA 名次 |
| `total_points` | 排名积分 |
| `rank_change` | 较上一期的变化 |

---

### `GET /api/players`

全部球员。可选参数：`limit`（默认 500）、`offset`（默认 0）、`search`。

### `GET /api/players/stars`

仅星级球员（`is_star = true`）。

### `GET /api/players/<team_country>`

单队大名单。开球队详情时按需加载。

---

### `GET /api/hotels`

按星级降序的全部酒店。

`loadSiteData()` 中的前端映射：

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

用途：Explore LA 酒店视图、地图标记、Journey 酒店推荐。

附加：`GET /api/hotels/region/<region>`、`GET /api/hotels/price/<price_band>`。

---

### `GET /api/restaurants`

可选参数：`limit`（默认 500）、`offset`、`search`、`region`。

```js
{ name: r.restaurant_name, region: r.region, price: r.price_range, flavor: r.flavor, score: r.google_review_score }
```

用途：Explore LA 餐厅视图、Journey 用餐时段。

附加：`GET /api/restaurants/flavor/<flavor>`。

---

### `GET /api/events`

可选参数：`limit`（默认 500）、`offset`、`search`、`area`。

JOIN `fact_event` 与 `dim_event_category`，返回 `source_url` 用于官方网站链接。

加载时前端按类别分流（`api.js`）：

```js
showCats     = new Set([12, 13, 14, 15])           // → data.shows
fanEventCats = new Set([1,2,3,4,5,6,7,8,9,10,11,23]) // → data.fanEvents
// 全部 events → data.allEvents（景点取 16-22）
```

附加：
- `GET /api/events/category/<category>`
- `GET /api/events/<event_id>` — 含 `event_experience_detail` 与 `event_sports_detail` 的完整详情

---

### `GET /api/itinerary`

生成个性化按天行程。逻辑在 `backend/services/itinerary.py`，路由只做参数解析。

#### 查询参数

| 参数 | 默认 | 取值 |
|---|---|---|
| `type` | `solo` | `solo`、`family`、`couple`、`friends`、`group` |
| `budget` | `mid` | `budget`、`mid`、`luxury` |
| `days` | `3` | 任意正整数（之前的 7 天上限已移除） |
| `match_date` | `jun12` | `jun12`、`jun15`、`jun18`、`jun21`、`jun25`、`jun28`、`jul2`、`jul10` |
| `vibe` | `culture` | `football`、`culture`、`beach`、`nightlife`、`film` |
| `picks` | `[]` | URL 编码的 JSON 数组（Explore LA 选中项） |
| `variant` | `0` | 整数种子偏移；用于在确定性 shuffle 上探索备选方案 |

#### `picks` 单项结构

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

#### 后端逻辑（Phase A → Phase B）

1. **Phase A — `build_candidate_pools`**：把 DB 行 + picks 转成评分候选 dict。每个 event 候选还会带上 JOIN 出来的 `event_experience_detail` 列，放在 `details` 字段下。
2. **Phase B — `fill_day_slots`**：每个槽位应用评分权重（见 `itinerary.py` 中的 `W`），执行硬约束，挑出可行的最高分候选。同参数 + 同 `variant` ⇒ 输出确定一致。

普通日结构：

| 时间 | 槽位 |
|---|---|
| 09:30 | 上午活动 |
| 12:30 | 午餐（餐厅） |
| 15:00 | 下午活动（不同类别） |
| 18:00 | 晚间 / vibe 活动 |
| 20:30 | 晚餐（餐厅） |

比赛日：上午 → 午餐 → 比赛，无晚间槽位。

#### 响应结构

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

#### `details`（每条活动）

来自 `event_experience_detail`。后端在序列化前会过滤掉空 / `NaN` / null，所以 JSON 里只会有实际有数据的字段。前端把每个字段渲染成活动标题下方的 chip（`Journey.jsx` 中的 `activityChips()`）：

| 字段 | 前端 chip |
|---|---|
| `transportation` | 🚗 |
| `recommended_duration` | ⏱ |
| `ticket_price` | 🎟 |
| `admission_info` | ✓ |
| `suitable_for` | 👥 |
| `spatial_character` | 🏛 |
| `planning_tag` | ✦ |
| `key_experience` | ✎ |
| `price_level` | $（格式化为 N/5） |
| `intensity_level` | ⚡（格式化为 N/5） |
| `crowdedness` | 👣 |
| `night_friendly` | 🌙（格式化为 N/5） |
| `photo_value` | 📷（格式化为 N/5） |
| `commercial_level` | 🛍 |

#### `source` 取值

| `source` | 显示标签 | 来源 |
|---|---|---|
| `event` | `EVENT` | `fact_event` 行 |
| `restaurant` | `DINE` | `fact_restaurant` 行 |
| `match` | `MATCH` | 固定的比赛活动 |
| `explore_pick` | `PICK` | 用户 Explore LA 选项 |
| `custom` | `PLAN` | 行程生成后用 Activity Picker 添加的活动 |

---

### `POST /api/itinerary/save`

把生成（或用户编辑）后的行程持久化，让短 URL 能再次打开同一份计划。`ShareModal` 在用户点 **Share** 时调用。

**请求体** — 完整 `JourneyResult` payload（与 `GET /api/itinerary` 返回结构相同）：

```json
{
  "days":     [...],
  "hotel":    {...},
  "match":    {...},
  "traveler": "solo",
  "budget_label": "mid",
  "picks_used": [...]
}
```

**响应：**

```json
{ "id": "RPgiSHq8" }
```

`id` 是 8 位 URL-safe 字符串（`secrets.token_urlsafe(6)[:8]`）。前端构造 `https://la-world-cup-journey.vercel.app/?i=<id>`，Copy / X / LinkedIn / Reddit / 系统分享按钮统一用这个 URL。

**约束：**
- Body 必须是带 `days` 数组的 JSON 对象，否则 400。
- Body 大小上限 200 KB（≈ 30 天行程）超过返回 413。
- ID 碰撞最多重试 5 次再报错（6 字节随机基本不会撞）。

---

### `GET /api/itinerary/share/<id>`

按短码恢复保存的行程。`App` 在 mount 时检测到 URL 里有 `?i=<id>` 就调用。

**行为：**
- 用 `UPDATE … RETURNING` 原子地把 `view_count` +1，方便后续做哪些分享有流量的分析。
- 返回原始 payload（结构和 `/api/itinerary/save` 的请求体一致）。
- 找不到对应行 → 404；`id` 为空或 > 32 字符 → 400。
- 加载完成后前端会用 `history.replaceState` 把 `?i=<id>` 从 URL 中清掉，避免手动刷新重新拉取。

```bash
curl http://127.0.0.1:5001/api/itinerary/share/RPgiSHq8 | head -40
```

---

### `GET /api/match-story/<match_number>`

LLM 生成的赛前导读。由 `services/match_story.py` 调用 Anthropic Claude Opus 4.7，使用 `messages.parse()` + Pydantic `MatchStory` schema。

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

**行为：**
- 按 `match_number` 在内存中缓存。
- **熔断器：** 一旦遇到额度耗尽 / 限流类错误，前端会在本次会话内停止调用此接口，回退到硬编码的 `matchMeta.story`。UI 不会降级。
- Anthropic 错误返回 503（前端视为 fallback 信号）；其他错误返回 500。

---

### `GET /api/match-stats/<match_number>`

实时 H2H + 近况数据。由 `services/match_data.py` 调用 API-Football（api-sports.io）拉取双方球队。

```json
{
  "home": { "winRate": 58, "goalsPerGame": 1.7, "form": ["W","D","W","L","W"], "goalsConceded": 0.8 },
  "away": { "winRate": 42, "goalsPerGame": 1.3, "form": ["L","W","D","L","W"], "goalsConceded": 1.1 },
  "h2h": { "total": 12, "team1wins": 5, "draws": 4, "team2wins": 3 },
  "lastMeeting": { "date": "2022-09-23", "type": "Friendly", "homeScore": 0, "awayScore": 0 },
  "allTime": { "matches": 12, "team1wins": 5, "draws": 4 }
}
```

**缓存策略**（`match_data.py`）：
1. 进程内存 dict
2. JSON 文件 `backend/.cache/match_stats.json`（重启后仍可用）
3. 前端硬编码的 `matchMeta.stats` 兜底（无 API key 也能正常显示）

`MatchOverlay` 在前端把 API 数据按字段与硬编码兜底合并 — 双方球队的 stats 独立 fallback，但 H2H 整体 fallback，避免出现 "0 次交手" + "上次交锋 2014 年" 这种自相矛盾的展示。

---

## Explore LA Picks 流程

1. 用户在 Explore LA 选卡片 → 存入 `selectedIds` state，并写入 `localStorage`（key 为 `laWorldCupExplorePicks`）。
2. `App` 通过 `onPicksChange` 把 picks 提升到全局，使 `Journey` 调用 API 时能带上。
3. ExploreLA 中点 "Build My Journey →" 会调用 Journey 组件的 `journeyRef.current?.submit()`（forwardRef + useImperativeHandle）。submit 内部：
   - 立即滚动到 `#mount-journey-result`（平滑滚动期间临时关掉 snap，避免 mandatory snap 把它拽走），
   - 把最多 12 个 picks 序列化成 JSON 放进 `picks` 查询参数，
   - 触发 `generateJourney()`。
4. 后端 `services/itinerary.py` 把酒店 picks（用于区域匹配）与活动 picks（用于排程注入）分离。
5. 响应里带上 `picks_used`，前端可显示已纳入的 picks 数。
6. 防重入：`submittingRef` 在请求飞行期间会拦截重复 submit — 加上 `apiFetch` 的 30s 超时，即便后端卡住，锁也会自动释放。

### Persona 个性化排序（纯前端）

在卡片渲染前，`ExploreLA` 把过滤后的列表交给 `frontend/src/lib/personaSort.js` 重排。**完全在客户端**，不动任何 API、不发额外请求。输入：

- `journeyPrefs` — `{ type, budget, vibe }`，由 `Journey` 表单的 `useEffect` 通过 `onPrefsChange` 实时同步上来。
- `selectedItems` — 用户在 Explore 当前已选项，作为距离锚点（已选酒店优先；否则 SoFi Stadium）。

按类别评分（值越小排越前）：

- **Hotels** — `|价格档 − 预算目标档| × 10` + `距离(km) × 0.5`。
- **Restaurants** — `|价格档 − 预算目标档| × 5` + `距离(km) × 0.5`（锚点 = 已选酒店；没选时回落 SoFi）。
- **Events / Shows / Attractions** — 若 `item.type` 命中 `VIBE_TO_TYPES[vibe]` 则 `−10`，再叠加同样的距离项。

卡片网格上方的 `✦ Sorted for you` 横幅会显示当前生效的信号，并提供一键切回默认插入顺序的按钮。Persona 信号**不会**传给后端 — 不论排序模式如何，发给 `/api/itinerary` 的 `picks` 负载都完全一致。

---

## 全部接口

| 接口 | 状态 |
|---|---|
| `GET /api/matches` | 在用 |
| `GET /api/matches/<match_number>` | 可用 |
| `GET /api/tickets/<match_number>` | 在用（按需） |
| `GET /api/tickets` | 可用 |
| `GET /api/teams` | 在用 |
| `GET /api/teams/<country>` | 可用 |
| `GET /api/players` | 在用 |
| `GET /api/players/stars` | 可用 |
| `GET /api/players/<team_country>` | 在用（按需） |
| `GET /api/rankings` | 在用 |
| `GET /api/hotels` | 在用 |
| `GET /api/hotels/region/<region>` | 可用 |
| `GET /api/hotels/price/<price_band>` | 可用 |
| `GET /api/restaurants` | 在用 |
| `GET /api/restaurants/flavor/<flavor>` | 可用 |
| `GET /api/events` | 在用 |
| `GET /api/events/category/<category>` | 可用 |
| `GET /api/events/<event_id>` | 可用 |
| `GET /api/itinerary` | 在用 |
| `POST /api/itinerary/save` | 在用（点 Share 时持久化到 `journey_share` 表） |
| `GET /api/itinerary/share/<id>` | 在用（URL 含 `?i=<id>` 时加载，自动 +1 `view_count`） |
| `GET /api/match-story/<match_number>` | 在用（按需，带熔断器） |
| `GET /api/match-stats/<match_number>` | 在用（按需，三层缓存） |
