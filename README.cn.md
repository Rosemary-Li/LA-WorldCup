# LA x FIFA World Cup 2026 - 数据库驱动的洛杉矶观赛指南

这是 APAN5310 课程的全栈项目。项目围绕 2026 FIFA 世界杯洛杉矶赛区展开，使用 PostgreSQL 数据库、Flask REST API 和 React/Vite 前端，把比赛、球队、排名、酒店、餐厅、球迷活动、演出、景点和个性化旅行计划整合到一个可交互的网页体验中。

> 英文版：[README.md](README.md)

## 项目概述

项目的数据流是：

```text
原始 Excel / CSV 数据
        -> 清洗后的 CSV 数据
        -> PostgreSQL 维度建模数据库
        -> backend/queries.py 中的 SQL 查询函数
        -> backend/app.py 中的 Flask JSON API
        -> frontend/src/api.js 中的 React 数据请求
        -> frontend/src/main.jsx 中的 React 页面组件
```

前端不会直接连接 PostgreSQL。React 只请求 Flask API。数据库 host、用户名、密码、SSL 等敏感信息只保存在后端环境变量中。

## 当前页面流程

当前 React 前端是一个连续滚动的体验：

1. **Hero 首页**：展示 LA x WC26 项目入口。
2. **Matches**：展示 SoFi Stadium 的洛杉矶比赛日程。
3. **Match Detail Overlay**：点击某场比赛后打开弹窗，展示比赛信息、球队、球员、FIFA ranking、票务、附近酒店、餐厅和球迷活动。
4. **Explore LA**：先展示五张照片入口：Hotels、Restaurants、Fan Events、Shows、Attractions。
5. **Explore Category View**：点击某个分类后，在同一个区域内展示该分类列表。用户可以勾选想去的地点/活动，右侧显示 Pick 和地图上下文。
6. **Journey**：根据用户偏好调用后端 SQL 推荐池，生成个性化旅行计划。
7. **About Us**：展示团队成员介绍和 GitHub 链接。

Teams 和 FIFA Rankings 现在合并进比赛详情页，因为用户点开某场比赛时最需要这些信息。

## 技术栈

| 层级 | 技术 | 作用 |
|---|---|---|
| 数据库 | PostgreSQL | 存储比赛、球队、球员、排名、酒店、餐厅、活动、路线和地图数据 |
| ETL | Python, pandas, psycopg2 | 建表并导入清洗后的 CSV |
| 后端 | Flask, flask-cors, psycopg2, python-dotenv | 提供由数据库支撑的 JSON API |
| 前端 | React, Vite, CSS | 渲染交互式洛杉矶指南 |
| 地图 UI | 前端地图面板 | 展示 SoFi Stadium 和 Explore LA 选中内容的位置上下文 |

## 项目结构

```text
LA_WorldCup/
├── backend/
│   ├── app.py              # Flask 路由和 Journey 生成逻辑
│   ├── queries.py          # PostgreSQL 查询层和连接池
│   ├── setup_database.py   # 建表和 CSV 导入脚本
│   ├── requirements.txt    # Python 后端依赖
│   └── .env.example        # 数据库环境变量示例
│
├── frontend/
│   ├── index.html          # Vite 入口 HTML
│   ├── package.json        # React/Vite 脚本和依赖
│   ├── vite.config.js
│   ├── src/
│   │   ├── api.js          # 前端 API 客户端
│   │   ├── main.jsx        # React 应用、组件和状态
│   │   └── placeMedia.js   # Explore LA 官网链接和图片辅助逻辑
│   ├── css/styles.css      # 页面视觉系统和样式
│   └── images/             # Hero 和 Explore LA 图片资产
│
├── database/
│   ├── raw_data/           # 原始数据
│   ├── clean_data/         # 可导入数据库的清洗数据
│   └── docs/               # ER 图和数据说明
│
├── API_INTERFACE.md
├── API_INTERFACE.cn.md
├── README.md
└── README.cn.md
```

## 本地运行

### 后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

在 `backend/.env` 中填写私有数据库连接信息：

```text
DB_HOST=your-db-host
DB_PORT=25060
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_SSLMODE=require
```

启动 Flask：

```bash
python3 app.py
```

后端地址：

```text
http://127.0.0.1:5000
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端地址：

```text
http://127.0.0.1:5173
```

构建生产版本：

```bash
npm run build
```

## 主要功能

- **数据库驱动的比赛日程**：展示 SoFi Stadium 的八场洛杉矶世界杯比赛。
- **比赛详情弹窗**：把单场比赛、球队、排名、球员、票务、附近酒店、餐厅和活动放在同一个上下文中。
- **Explore LA 照片墙**：五个数据库分类入口：Hotels、Restaurants、Fan Events、Shows、Attractions。
- **Explore LA Picks**：用户可以勾选想去的地点/活动，选择结果会保存在前端状态和浏览器 local storage 中，并传入 Journey 生成逻辑。
- **官网链接**：只有点击明确的 `Official Site` 字段才会跳转到外部官网，图片本身不会直接跳走。
- **Journey 生成器**：由 Flask 后端根据 SQL 推荐池和用户偏好生成旅行计划。
- **About Us 页面**：展示团队成员介绍、个人 GitHub 和项目 GitHub。

## 数据库设计

数据库采用维度建模思路。Dimension tables 存储稳定实体，Fact tables 存储比赛、票务、酒店、餐厅、活动、路线和排名等业务记录。

ER 图位置：

```text
database/docs/APAN5310_ER_Diagram_Simplified_v4.drawio.html
```

### 维度表

| 表 | 作用 |
|---|---|
| `dim_team` | 国家、足联、小组、晋级状态 |
| `dim_player` | 球员姓名、球队、位置、俱乐部、年龄、出场、进球、明星球员标记 |
| `dim_place` | 体育场、机场和交通相关地点及坐标 |
| `dim_mode` | 交通方式元数据 |
| `dim_event_category` | 活动分类标签，用于活动查询和 Journey 推荐 |

### 事实表

| 表 | 作用 |
|---|---|
| `fact_match` | 洛杉矶比赛日程：比赛编号、日期、时间、球队、小组、阶段、场馆 |
| `fact_ticket` | 票务类别、区域、价格、状态和比赛关系 |
| `fact_hotel` | 酒店区域、地址、星级、价格带、评论数、坐标 |
| `fact_restaurant` | 餐厅区域、地址、菜系、价格、评分、无障碍信息 |
| `fact_event` | 球迷活动、演出、社区活动、体育活动和 LA 体验 |
| `fact_route` | 机场到 SoFi 和本地交通路线 |
| `fact_ranking` | FIFA 排名快照、排名变化和积分 |

### 详情表

| 表 | 作用 |
|---|---|
| `event_experience_detail` | 时长、适合人群、入场信息、交通和体验说明 |
| `event_sports_detail` | 体育活动详情和票务信息 |

## SQL 逻辑

所有数据库读取都集中在 [backend/queries.py](backend/queries.py)。[backend/app.py](backend/app.py) 中的 Flask route 调用这些查询函数，然后返回 JSON。

### 连接管理

`queries.py` 从 `backend/.env` 读取私有连接信息，并创建懒加载 PostgreSQL 连接池：

```python
psycopg2.pool.ThreadedConnectionPool(...)
```

通用函数 `query(sql, params=None, conn=None)` 会：

1. 从连接池借出连接。
2. 执行参数化 SQL。
3. 使用 `RealDictCursor` 把每一行转成字典。
4. 返回 `list[dict]`，方便 Flask `jsonify`。
5. 遇到数据库错误时 rollback，并把连接归还连接池。

### 核心查询模式

比赛日程：

```sql
SELECT match_number, date, day_of_week, time_pt,
       team1, team2, "group", stage, venue
FROM fact_match
ORDER BY date, time_pt;
```

按比赛查票务：

```sql
SELECT ticket_id, seating_section, section_level,
       ticket_category, price_usd, ticket_status, matchup
FROM fact_ticket
WHERE match_number = %s
ORDER BY price_usd;
```

活动数据、分类标签和官网链接：

```sql
SELECT e.event_id, e.event_name, e.event_type, e.category,
       e.area, e.venue_name, e.start_date, e.source_url,
       c.category AS category_label
FROM fact_event e
LEFT JOIN dim_event_category c
       ON e.event_category_id = c.event_category_id
ORDER BY e.start_date, e.event_name;
```

Journey 推荐池：

```sql
SELECT *
FROM fact_event
WHERE event_category_id = ANY(%s)
ORDER BY start_date, event_name
LIMIT %s;
```

## 后端 API

详细接口说明见 [API_INTERFACE.cn.md](API_INTERFACE.cn.md)。

当前 React 主要使用这些接口：

| 接口 | 用途 |
|---|---|
| `GET /api/matches` | 比赛日程和比赛详情弹窗 |
| `GET /api/tickets/<match_number>` | 比赛详情里的 Tickets tab |
| `GET /api/players` | 预加载球员数据 |
| `GET /api/players/<team_country>` | 查询某队球员 |
| `GET /api/teams` | 比赛详情中的球队上下文 |
| `GET /api/rankings` | 比赛详情中的 FIFA ranking 上下文 |
| `GET /api/hotels` | Explore LA hotels 和比赛附近酒店 |
| `GET /api/restaurants` | Explore LA restaurants 和比赛附近餐厅 |
| `GET /api/events` | Fan Events、Shows、Attractions 和 Journey 活动池 |
| `GET /api/itinerary` | 个性化 Journey 生成 |

当前公开 API 重点服务 Matches、Explore LA、Journey 和 About Us 所需的数据。

## 前端数据流

[frontend/src/api.js](frontend/src/api.js) 封装 API 请求。`loadSiteData()` 会请求主要数据集，并把后端返回的行数据转成 UI 更容易使用的对象：

- `matches`
- `players`
- `hotels`
- `restaurants`
- `fanEvents`
- `shows`
- `allEvents`
- `rankings`
- `teams`

[frontend/src/main.jsx](frontend/src/main.jsx) 当前渲染：

- `PhotoHero`
- `Matches`
- `MatchOverlay`
- `ExploreLA`
- `Journey`
- `About`
- `Footer`

当前项目不使用假的 fallback 数据。如果 Flask 或 PostgreSQL 不可用，页面会显示数据库连接提示。

## Explore LA 逻辑

Explore LA 有五个分类：

| 页面分类 | 数据来源 |
|---|---|
| Hotels | `/api/hotels` |
| Restaurants | `/api/restaurants` |
| Fan Events | `/api/events`，按 fan-event category IDs 过滤 |
| Shows | `/api/events`，按 show category IDs 过滤 |
| Attractions | `/api/events`，从 event/experience 数据中过滤 |

每个条目可以展示：

- 名称
- Region 或 area
- 分类相关信息
- 本地/fallback 图片
- 明确的 `Official Site` 链接
- 可勾选状态

用户选择的内容会保存在前端 state 和浏览器 local storage 中。点击 `Go` 会跳转到 Journey 部分，生成 Journey 时这些 picks 会传给 `/api/itinerary`。

## Journey 逻辑

`GET /api/itinerary` 会把用户输入映射成 SQL 推荐池。

| 用户输入 | 后端映射 |
|---|---|
| `type` | football、family、backpacker、luxury 等活动分类组 |
| `budget` | 酒店价格带和餐厅价格范围 |
| `days` | 旅行天数，限制在 1 到 7 天 |
| `match_date` | 插入计划中的比赛标签和日期 |
| `vibe` | culture、beach、nightlife、film 等额外活动池 |
| `picks` | Explore LA 选择结果的 JSON 列表，用来优先放入行程 |

后端生成步骤：

1. 用 `get_events_by_categories()` 拉取活动池。
2. 用 `recommend_hotels_for_budget()` 拉取酒店推荐。
3. 用 `recommend_restaurants_for_budget()` 拉取餐厅推荐。
4. 解析 Explore LA picks，并优先把选中的餐厅、活动、演出和景点插入行程。
5. 如果用户选择了 hotel pick，则优先把它作为推荐住宿。
6. 根据用户参数生成稳定 hash seed。
7. 返回每日活动、酒店推荐、比赛信息、预算标签、traveler 类型和 `picks_used`。

## 隐私和安全

- 浏览器不会拿到数据库账号或密码。
- 前端只接收 Flask 返回的 JSON。
- `backend/.env` 不应该提交到 Git。
- SQL 查询使用参数化占位符处理用户输入。
- 外部官网跳转必须由用户点击明确链接触发。

## 快速测试

构建前端：

```bash
cd frontend
npm run build
```

测试 API：

```bash
curl http://127.0.0.1:5000/api/matches
curl http://127.0.0.1:5000/api/hotels
curl "http://127.0.0.1:5000/api/itinerary?type=football&budget=mid&days=5&match_date=jun12&vibe=culture"
```
