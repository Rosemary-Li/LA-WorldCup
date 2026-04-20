# LA x FIFA 世界杯 2026 - 数据库驱动的洛杉矶观赛旅行指南

这是 APAN5310 课程的全栈项目。项目把 2026 FIFA 世界杯洛杉矶赛区相关数据整理为规范化 PostgreSQL 数据库，通过 Flask REST API 暴露给前端，再由纯 HTML/CSS/JavaScript 页面渲染成交互式旅行指南。

> English version: [README.md](README.md)

## 项目重点

本项目的核心不是单纯做一个展示页面，而是完成一条完整的数据链路：

```text
原始 Excel / CSV 数据
        -> 清洗后的 CSV
        -> PostgreSQL 维度/事实表模型
        -> backend/queries.py 中的 SQL 查询层
        -> backend/app.py 中的 Flask API
        -> frontend/js/api.js 中的数据加载器
        -> 前端交互页面
```

前端是数据库的客户端。页面先读取 `frontend/js/data.js` 中的备用静态数组；随后 `frontend/js/api.js` 请求 Flask API，把真实数据库数据写回这些数组，并重新渲染比赛、酒店、餐厅、活动、球队、排名、交通路线和地图相关内容。如果后端暂时不可用，页面仍会使用备用数据正常展示。

## 技术栈

| 层级 | 技术 | 作用 |
|---|---|---|
| 数据库 | 托管 PostgreSQL | 存储比赛、队伍、球员、票务、酒店、餐厅、活动、路线、排名等规范化数据 |
| ETL | Python, pandas, psycopg2 | 建表并导入清洗后的 CSV |
| 后端 | Flask, flask-cors, psycopg2 | 提供由 SQL 支撑的 `/api/*` JSON 接口 |
| 前端 | HTML, CSS, 原生 JavaScript | 渲染旅行指南并消费 API 数据 |
| 地图 | Leaflet | 展示洛杉矶地点和酒店坐标 |

## 目录结构

```text
LA_WorldCup/
├── backend/
│   ├── app.py              # Flask API 路由和 itinerary 业务逻辑
│   ├── queries.py          # SQL 查询函数；数据库读取的核心文件
│   └── setup_database.py   # 一次性建表和 CSV 导入脚本
│
├── frontend/
│   ├── index.html          # 静态入口，加载 sections 和功能 JS
│   ├── css/styles.css
│   ├── js/
│   │   ├── data.js         # API 不可用时使用的备用数据数组
│   │   ├── api.js          # 请求 API，并更新前端状态
│   │   ├── app.js          # Discover 标签页、筛选器、页面行为
│   │   ├── matches.js      # 比赛详情 overlay、票务、阵容、活动详情
│   │   ├── itinerary.js    # 调用 /api/itinerary 并渲染逐日行程
│   │   ├── explore.js      # Leaflet 地图大头针和筛选
│   │   └── fullpage.js     # 页面分区导航
│   └── sections/           # 每个 JS 文件通过 innerHTML 注入一个页面区块
│
├── database/
│   ├── raw_data/           # 原始数据文件
│   ├── clean_data/         # 可直接导入的 clean_<table>.csv
│   └── docs/               # ER 图和数据清洗报告
│
├── archive/                # 早期单文件原型
├── README.md
└── README.cn.md
```

## 本地运行

安装 Python 依赖：

```bash
pip install flask flask-cors psycopg2-binary pandas
```

启动 Flask API：

```bash
cd backend
python3 app.py
```

API 地址：

```text
http://127.0.0.1:5000
```

启动静态前端：

```bash
cd frontend
python3 -m http.server 8080
```

浏览器打开：

```text
http://localhost:8080
```

## 数据库设计

数据库采用维度建模 / 星型模型思路。维度表描述相对稳定的实体，例如队伍、球员、地点、交通方式、活动类别；事实表描述具体记录，例如比赛、票务、酒店、餐厅、活动、路线和排名。

ER 图位置：

```text
database/docs/APAN5310_ER_Diagram_Simplified_v4.drawio.html
```

### 维度表

| 表名 | 作用 | 被哪些功能使用 |
|---|---|---|
| `dim_team` | 洛杉矶赛区相关球队、联合会、小组、资格状态 | `/api/teams`，球员按队伍查询 |
| `dim_player` | 球员信息、俱乐部、统计数据、是否明星球员 | `/api/players`，比赛 overlay 阵容 |
| `dim_place` | 体育场、机场、交通枢纽及坐标 | `/api/routes`，`/api/map-data` |
| `dim_mode` | 交通方式元数据 | `/api/routes` |
| `dim_event_category` | 活动分类标签 | `/api/events`，行程生成器类别映射 |

### 事实表

| 表名 | 作用 | 主要 SQL 模式 |
|---|---|---|
| `fact_match` | 洛杉矶 8 场比赛赛程 | 按 `date, time_pt` 排序 |
| `fact_ticket` | 票务区域、类别、价格、状态 | 按 `match_number` 筛选，按 `price_usd` 排序 |
| `fact_hotel` | 酒店区域、星级、价格档位、坐标 | 按区域或价格档筛选 |
| `fact_restaurant` | 餐厅菜系、价格、评分 | 按 `flavor ILIKE` 或价格区间筛选 |
| `fact_event` | 球迷活动、演出、体育赛事、Fan Zone | 关联活动类别，按类别筛选 |
| `fact_route` | 机场到 SoFi 的交通方案 | 关联地点维度表和交通方式维度表 |
| `fact_ranking` | FIFA 排名快照 | 按排名排序 |

### 详情表

| 表名 | 作用 |
|---|---|
| `event_experience_detail` | 活动体验信息：推荐时长、适合人群、强度、门票、交通、拍照价值等 |
| `event_sports_detail` | 体育活动专属信息：运动类型、票价、赛事说明等 |

## SQL 查询层逻辑

所有数据库读取都集中在 [backend/queries.py](backend/queries.py)。该文件定义了一个 `query(sql, params=None)` 工具函数：

1. 通过数据库适配器执行经过封装的只读查询。
2. 执行参数化 SQL。
3. 使用 `RealDictCursor`，让每一行结果都变成 Python 字典。
4. 返回 `list[dict]`，方便 Flask 直接 `jsonify`。

### 主要 SQL 模式

**简单排序查询**

例如 `get_all_matches()`、`get_all_hotels()`、`get_all_rankings()`。

```sql
SELECT match_number, date, day_of_week, time_pt,
       team1, team2, "group", stage, venue
FROM fact_match
ORDER BY date, time_pt;
```

**参数化筛选**

例如 `get_tickets_by_match(match_number)`、`get_team_by_country(country)`、`get_players_by_team(team_country)`。

```sql
SELECT ticket_id, seating_section, section_level,
       ticket_category, price_usd, ticket_status, matchup
FROM fact_ticket
WHERE match_number = %s
ORDER BY price_usd;
```

这里的用户输入会作为参数列表传入，例如 `[match_number]`，而不是直接拼进 SQL 字符串。

**模糊文本筛选**

酒店区域、餐厅菜系、活动类别都使用类似模式：

```sql
WHERE region ILIKE %s
```

这样 `/api/hotels/region/Hollywood` 可以匹配更宽泛的区域文本，并且不区分大小写。

**事实表与维度表关联**

活动列表会把 `fact_event` 和 `dim_event_category` 关联起来，让 API 同时返回原始类别字段和可读的类别标签：

```sql
SELECT e.event_id, e.event_name, e.category,
       e.event_category_id, e.event_type,
       c.category AS category_label
FROM fact_event e
LEFT JOIN dim_event_category c
       ON e.event_category_id = c.event_category_id
ORDER BY e.start_date;
```

交通路线使用两个 `dim_place` 别名加上 `dim_mode`，把外键转成前端可直接展示的路线卡片：

```sql
FROM fact_route r
JOIN dim_place o ON r.origin_place_id = o.place_id
JOIN dim_place d ON r.dest_place_id = d.place_id
JOIN dim_mode  m ON r.mode_id = m.mode_id
```

**活动详情组合**

`get_event_detail(event_id)` 会先读取 `fact_event` 主记录，再按情况补充：

- `event_experience_detail` 中的 `experience_detail`
- `event_sports_detail` 中的 `sports_detail`

这样数据库仍保持规范化，但前端只需要请求一个活动详情接口。

**行程生成器 SQL helper**

个性化行程接口会把用户输入映射成 SQL 条件：

| 用户输入 | 后端映射 | SQL 效果 |
|---|---|---|
| 旅行者类型 | `_TYPE_CATS` 活动类别 id 列表 | `event_category_id IN (...)` |
| 旅行风格 | `_VIBE_CATS` 活动类别 id 列表 | 单独生成 vibe 活动池 |
| 预算 | `_HOTEL_BAND`, `_REST_PRICE` | 酒店 `price_band`，餐厅 `price_range` |
| 天数 | 限制在 1-7 天 | 控制返回天数 |
| 比赛日期 | `_MATCH_INFO` | 插入固定 SoFi 比赛活动 |

`get_events_by_categories(category_ids)` 会查询 `fact_event`，并关联 `dim_event_category` 和 `event_experience_detail`，返回的活动行再由 Flask 转换为每日时间线。

## ETL 与建表逻辑

[backend/setup_database.py](backend/setup_database.py) 负责一次性数据库初始化：

1. 连接 PostgreSQL。
2. 先创建维度表。
3. 再创建带外键的事实表。
4. 最后创建活动详情表。
5. 从 `database/clean_data/` 读取清洗后的 CSV。
6. 使用 `ON CONFLICT DO NOTHING` 插入数据，避免重复导入时报错。

导入顺序很重要，因为部分表依赖前面已经存在的表：

```text
维度表 -> 事实表 -> 详情表
dim_team   -> dim_player
dim_place  -> fact_route
dim_mode   -> fact_route
fact_match -> fact_ticket
fact_event -> event_experience_detail / event_sports_detail
```

## 后端 API 层

[backend/app.py](backend/app.py) 是受控的 Flask API 层，负责把后端 SQL 查询结果整理成前端可用的 JSON。前端不会直接连接数据库，也不会接触数据库账号、密码、host、SSL 配置等敏感信息；API 只返回页面需要展示的字段。

大部分 API 路由都很薄，只负责调用 `queries.py` 中的 SQL 函数并返回经过整理的响应：

```python
@app.route("/api/matches")
def matches():
    return jsonify(queries.get_all_matches())
```

因此三层职责比较清晰：

| 文件 | 职责 |
|---|---|
| `queries.py` | 负责 SQL 读取逻辑和与 schema 相关的字段选择 |
| `app.py` | 负责 HTTP 路由、请求参数和公开 JSON 响应结构 |
| `api.js` | 负责把公开 API JSON 映射到前端状态 |

### API 接口

| 接口 | SQL 来源 | 前端用途 |
|---|---|---|
| `GET /api/matches` | `fact_match` | 更新比赛卡片 |
| `GET /api/matches/<match_number>` | `fact_match` | 单场比赛详情 |
| `GET /api/tickets` | `fact_ticket` | 票务数据集 |
| `GET /api/tickets/<match_number>` | `fact_ticket WHERE match_number = %s` | 比赛 overlay 的票务标签页 |
| `GET /api/teams` | `dim_team` | Discover 中的 Teams 标签 |
| `GET /api/players` | `dim_player` | 比赛卡片明星球员 |
| `GET /api/players/<team_country>` | `dim_player WHERE team = %s` | Full Squad 阵容标签页 |
| `GET /api/players/stars` | `dim_player WHERE is_star = TRUE` | 明星球员视图 |
| `GET /api/hotels` | `fact_hotel` | 酒店卡片 |
| `GET /api/hotels/region/<region>` | `fact_hotel WHERE region ILIKE %s` | 区域筛选 |
| `GET /api/hotels/price/<price_band>` | `fact_hotel WHERE price_band = %s` | 酒店价格筛选 |
| `GET /api/restaurants` | `fact_restaurant` | 餐厅卡片 |
| `GET /api/restaurants/flavor/<flavor>` | `fact_restaurant WHERE flavor ILIKE %s` | 菜系筛选 |
| `GET /api/events` | `fact_event LEFT JOIN dim_event_category` | Fan Events 和 Shows 标签 |
| `GET /api/events/category/<category>` | `fact_event WHERE category ILIKE %s` | 活动类别筛选 |
| `GET /api/events/<event_id>` | `fact_event` 加详情表 | 活动详情 overlay |
| `GET /api/rankings` | `fact_ranking` | FIFA Rankings 标签 |
| `GET /api/routes` | `fact_route` 关联地点和交通方式 | Getting There 标签 |
| `GET /api/map-data` | `fact_hotel`, `dim_place` | 地图大头针 |
| `GET /api/itinerary` | 活动、酒店、餐厅 helper 查询 | 个性化行程生成器 |

## 前后端如何连接

前端是静态页面，但它按实时数据客户端的方式工作。

### 加载顺序

[frontend/index.html](frontend/index.html) 的脚本加载顺序如下：

1. `frontend/sections/` 中的文件先创建页面 DOM 区块。
2. 加载 Leaflet 地图库。
3. `frontend/js/data.js` 定义备用数据数组。
4. `frontend/js/api.js` 请求后端 API，并覆盖备用数组。
5. 其他功能脚本负责渲染卡片、overlay、行程、地图和页面导航。

### 前端状态替换流程

`frontend/js/api.js` 使用：

```javascript
const API_BASE = "http://127.0.0.1:5000";
```

页面加载时并行请求主要接口：

```javascript
await Promise.all([
  loadMatches(),
  loadHotels(),
  loadRestaurants(),
  loadEvents(),
  loadMapData(),
  loadRankings(),
  loadTeams(),
  loadRoutes(),
]);
```

每个 loader 都会把数据库字段转换成前端卡片需要的字段：

| 数据库/API 字段 | 前端字段 |
|---|---|
| `hotel_name` | `name` |
| `price_band` | `price` |
| `google_review_score` | `score` |
| `event_category_id` | 用来区分 fan event 和 show |
| `match_number` | 用于比赛 overlay 查询票务 |

如果 API 请求失败，`catch` 会保留 `data.js` 中的备用数组，页面不会空白。

## 主要功能与数据来源

| 功能 | 数据来源 | 相关文件 |
|---|---|---|
| 洛杉矶赛程 | `fact_match`, `dim_player` | `api.js`, `sections/matches.js`, `js/matches.js` |
| 比赛详情 overlay | `MATCH_DATA`, tickets, players, events | `js/matches.js` |
| Discover 标签页 | 酒店、餐厅、活动、球队、排名、路线 | `api.js`, `app.js` |
| 活动详情 overlay | `fact_event` 加详情表 | `queries.py`, `app.py`, `matches.js` |
| 个性化行程 | 活动类别 SQL、酒店、餐厅、比赛元数据 | `app.py`, `queries.py`, `itinerary.js` |
| 洛杉矶地图 | 静态地图点和 `/api/map-data` 支持 | `explore.js` |

## 个性化行程生成逻辑

行程生成器是“SQL + 后端业务逻辑 + 前端渲染”结合最明显的部分：

1. 前端发送 `type`、`budget`、`days`、`match_date`、`vibe` 五个参数。
2. Flask 把旅行者类型和旅行风格映射成活动类别 id。
3. SQL 从 `fact_event` 中查询对应活动，并关联类别表和体验详情表。
4. SQL 按 `price_band` 查询酒店。
5. SQL 按 `price_range` 查询餐厅。
6. Flask 使用稳定 hash seed 打乱结果，让同一组输入得到稳定行程。
7. 3 天及以上行程中，第 3 天固定为比赛日。
8. API 返回 JSON，前端渲染成逐日 timeline。

示例：

```text
/api/itinerary?type=football&budget=mid&days=5&match_date=jun12&vibe=culture
```

## 开发检查

Python 语法检查：

```bash
python3 -m py_compile backend/app.py backend/queries.py
```

JavaScript 语法检查：

```bash
node --check frontend/js/api.js
node --check frontend/js/app.js
node --check frontend/js/matches.js
node --check frontend/js/itinerary.js
node --check frontend/js/explore.js
node --check frontend/js/fullpage.js
```

## 说明

- 前端目录名是 `frontend/`，不是 `front_end/`。
- 项目刻意保持轻量：没有前端框架，没有打包工具，也没有构建步骤。
- 数据库 host、用户名、密码、SSL 配置等敏感信息不应写入 README，也不应提交到共享代码仓库。共享或部署环境应使用环境变量或密钥管理服务。
- 后端开启了 CORS，因此 `8080` 端口的静态前端可以请求 `5000` 端口的 Flask API。

## 数据来源

| 数据集 | 来源 |
|---|---|
| 比赛赛程 | SoFi Stadium 官方信息、Los Angeles World Cup 2026 相关资料 |
| 票务 | 座位和票价参考表 |
| 酒店与餐厅 | 人工整理和公开评价数据 |
| 活动 | Discover Los Angeles、Los Angeles World Cup 2026 资料、场馆页面 |
| FIFA 排名 | FIFA 排名数据或 fallback 演示数据 |
| 交通路线 | 公开路线调研 |
| 球员 | 公开足球资料 |
