# LA x FIFA 世界杯 2026 - 数据库驱动的洛杉矶观赛旅行指南

这是 APAN5310 课程的全栈项目。项目围绕 2026 FIFA 世界杯洛杉矶赛区展开，把比赛、球队、排名、酒店、餐厅、球迷活动、演出、交通路线和个性化旅行计划整合到一个 PostgreSQL 数据库中，再通过 Flask API 和 React/Vite 前端展示出来。

> English version: [README.md](README.md)

## 项目概览

本项目的重点是完整的数据到前端链路：

```text
原始 Excel / CSV 文件
        -> 清洗后的 CSV 文件
        -> PostgreSQL 维度模型
        -> backend/queries.py 中的 SQL 查询函数
        -> backend/app.py 中的 Flask JSON API
        -> frontend/src/api.js 中的 React 数据加载
        -> frontend/src/main.jsx 中的 React 页面组件
```

前端不会直接连接数据库。React 只请求 Flask API。数据库 host、用户名、密码、SSL 等敏感信息只保存在后端环境变量中。

## 技术栈

| 层级 | 技术 | 作用 |
|---|---|---|
| 数据库 | PostgreSQL | 存储世界杯、旅行、活动、酒店、餐厅、路线和排名数据 |
| ETL | Python, pandas, psycopg2 | 建表并导入清洗后的 CSV |
| 后端 | Flask, flask-cors, psycopg2, python-dotenv | 提供由数据库支撑的 REST API |
| 前端 | React, Vite, CSS | 渲染交互式洛杉矶观赛旅行指南 |
| 地图 | Leaflet | 展示洛杉矶地图地点和旅行信息 |

## 项目结构

```text
LA_WorldCup/
├── backend/
│   ├── app.py              # Flask 路由和 Journey 生成逻辑
│   ├── queries.py          # PostgreSQL 查询层和连接池
│   ├── setup_database.py   # 一次性建表和 CSV 导入脚本
│   ├── requirements.txt    # 后端 Python 依赖
│   └── .env.example        # 数据库环境变量示例
│
├── frontend/
│   ├── index.html          # Vite 入口 HTML
│   ├── package.json        # React/Vite 脚本和依赖
│   ├── vite.config.js
│   ├── src/
│   │   ├── api.js          # 调用 Flask API 的前端客户端
│   │   └── main.jsx        # React 组件和页面状态
│   ├── css/styles.css      # 视觉样式系统
│   └── images/             # Hero 和 Explore LA 图片
│
├── database/
│   ├── raw_data/           # 原始 Excel / CSV 数据
│   ├── clean_data/         # 可直接导入数据库的清洗后 CSV
│   └── docs/               # ER 图和数据清洗文档
│
├── archive/                # 早期原型
├── README.md
└── README.cn.md
```

## 本地运行

### 1. 后端

创建 Python 环境并安装依赖：

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

从示例文件创建私有 `.env`：

```bash
cp .env.example .env
```

填写数据库连接信息：

```text
DB_HOST=your-db-host
DB_PORT=25060
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_SSLMODE=require
```

启动 Flask API：

```bash
python3 app.py
```

后端地址：

```text
http://127.0.0.1:5000
```

### 2. 前端

安装前端依赖：

```bash
cd frontend
npm install
```

启动 React 开发服务器：

```bash
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

- 洛杉矶 SoFi Stadium 8 场世界杯比赛赛程。
- 比赛详情 overlay：球队、球员、票务、附近酒店、餐厅和活动。
- Tournament 页面：球队和 FIFA Rankings。
- Explore LA 图片入口：通过图片跳转到对应数据库分类。
- Discover 页面：酒店、餐厅、球迷活动、演出、交通路线。
- Journey 页面：根据用户偏好生成个性化旅行计划。
- Leaflet 地图：展示体育场、酒店、餐厅和活动位置。
- About Us 页面：团队成员简介和 GitHub 链接。

## 数据库设计

数据库使用维度建模思路。维度表描述稳定实体，事实表描述可查询的业务记录。

ER 图位置：

```text
database/docs/APAN5310_ER_Diagram_Simplified_v4.drawio.html
```

### 维度表

| 表名 | 作用 |
|---|---|
| `dim_team` | 国家队、所属足联、小组信息、晋级状态 |
| `dim_player` | 球员姓名、队伍、位置、俱乐部、年龄、出场、进球、明星球员标记 |
| `dim_place` | 体育场、机场和交通地点，以及经纬度 |
| `dim_mode` | 交通方式元数据 |
| `dim_event_category` | 活动分类标签，用于活动查询和 Journey 推荐 |

### 事实表

| 表名 | 作用 |
|---|---|
| `fact_match` | 洛杉矶比赛赛程：比赛编号、日期、时间、队伍、小组、阶段、场馆 |
| `fact_ticket` | 票务类别、座位区域、价格、状态和比赛关系 |
| `fact_hotel` | 酒店区域、地址、星级、价格档、评论数、坐标 |
| `fact_restaurant` | 餐厅区域、地址、菜系、价格区间、评分、无障碍信息 |
| `fact_event` | 球迷活动、演出、社区活动、体育活动和洛杉矶体验 |
| `fact_route` | 机场到 SoFi 和本地交通路线 |
| `fact_ranking` | FIFA 排名快照、排名变化和积分 |

### 详情表

| 表名 | 作用 |
|---|---|
| `event_experience_detail` | 推荐时长、适合人群、入场方式、交通和体验说明 |
| `event_sports_detail` | 体育活动专属信息和票价信息 |

## SQL 逻辑

所有数据库读取都集中在 [backend/queries.py](backend/queries.py)。这个文件是数据库访问的核心。

### 数据库连接

`queries.py` 从 `backend/.env` 读取私有连接配置，并懒加载 PostgreSQL 连接池：

```python
psycopg2.pool.ThreadedConnectionPool(...)
```

通用查询函数 `query(sql, params=None, conn=None)` 负责：

1. 从连接池借出连接。
2. 执行参数化 SQL。
3. 使用 `RealDictCursor`，让每行结果变成字典。
4. 返回 `list[dict]`，方便 Flask 直接 `jsonify`。
5. 数据库异常时 rollback，并把连接放回连接池。

### 常见查询模式

简单排序查询：

```sql
SELECT match_number, date, day_of_week, time_pt,
       team1, team2, "group", stage, venue
FROM fact_match
ORDER BY date, time_pt;
```

参数化筛选：

```sql
SELECT ticket_id, seating_section, section_level,
       ticket_category, price_usd, ticket_status, matchup
FROM fact_ticket
WHERE match_number = %s
ORDER BY price_usd;
```

搜索与分页：

```sql
WHERE restaurant_name ILIKE %s
ORDER BY google_review_score DESC
LIMIT %s OFFSET %s;
```

事实表与维度表关联：

```sql
SELECT e.event_id, e.event_name, e.category,
       e.event_category_id, c.category AS category_label
FROM fact_event e
LEFT JOIN dim_event_category c
       ON e.event_category_id = c.event_category_id
ORDER BY e.start_date;
```

路线查询关联：

```sql
FROM fact_route r
JOIN dim_place o ON r.origin_place_id = o.place_id
JOIN dim_place d ON r.dest_place_id = d.place_id
JOIN dim_mode  m ON r.mode_id = m.mode_id
```

活动详情组合：

- 主活动信息来自 `fact_event`。
- 体验类信息来自 `event_experience_detail`。
- 体育类信息来自 `event_sports_detail`。
- Flask 把这些结果组合成一个 JSON 返回给前端。

## 后端 API

[backend/app.py](backend/app.py) 提供受控 JSON API。React 只调用这些接口，不直接连接数据库。

核心接口：

| Endpoint | 作用 |
|---|---|
| `GET /api/matches` | 洛杉矶比赛赛程 |
| `GET /api/matches/<match_number>` | 单场比赛 |
| `GET /api/tickets/<match_number>` | 某场比赛的票务数据 |
| `GET /api/teams` | 球队信息 |
| `GET /api/players?limit=&offset=&search=` | 球员分页和搜索 |
| `GET /api/players/<team_country>` | 某队球员 |
| `GET /api/rankings` | FIFA 排名 |
| `GET /api/hotels` | 酒店 |
| `GET /api/hotels/region/<region>` | 按区域筛选酒店 |
| `GET /api/hotels/price/<price_band>` | 按价格档筛选酒店 |
| `GET /api/restaurants?limit=&offset=&search=&region=` | 餐厅筛选 |
| `GET /api/events?limit=&offset=&search=&area=` | 活动筛选 |
| `GET /api/events/category/<category>` | 按类别筛选活动 |
| `GET /api/events/<event_id>` | 活动详情 |
| `GET /api/routes` | 交通路线 |
| `GET /api/map-data` | 地图数据层 |
| `GET /api/itinerary` | 个性化 Journey |

## Journey 逻辑

Journey 接口会把用户输入映射成 SQL 推荐池。

| 用户输入 | 后端映射 |
|---|---|
| 旅行者类型 | `_TYPE_CATS` 活动类别 ID |
| 旅行风格 | `_VIBE_CATS` 活动类别 ID |
| 预算 | `_HOTEL_BAND` 和 `_REST_PRICE` |
| 天数 | 限制在 1-7 天 |
| 比赛日期 | `_MATCH_INFO` 固定 SoFi 比赛活动 |

接口执行流程：

1. 按活动类别查询候选活动。
2. 按预算档查询酒店。
3. 按预算范围查询餐厅。
4. 使用稳定的 SHA-256 seed，让相同输入生成一致结果。
5. 返回按天组织的旅行时间线。

## 前端架构

React 前端主要由两个文件组成：

- [frontend/src/api.js](frontend/src/api.js)：封装 Flask API 请求和数据映射。
- [frontend/src/main.jsx](frontend/src/main.jsx)：React 组件、页面状态、overlay、tab 和交互逻辑。

应用通过：

```js
loadSiteData()
```

加载后端数据库数据。这个函数会请求 Flask API，把后端返回的行数据转成 UI 更容易使用的对象，再写入 React state。页面组件根据 state 渲染：

- `Matches`
- `Tournament`
- `ExploreLA`
- `Discover`
- `Journey`
- `MapSection`
- `About`

如果后端不可用，数据库驱动的页面会显示连接提示，不会静默切换到备用假数据。

## 隐私与安全

- 数据库账号密码不写在源代码里。
- 私有连接信息放在 `backend/.env`。
- `backend/.env.example` 只说明需要哪些变量，不暴露真实密钥。
- React 前端只接收页面展示需要的 JSON 字段。
- 数据库被 Flask API 隔离，前端不能直接访问数据库。
- `.gitignore` 会忽略 `.env`、`node_modules/`、`dist/`、`.DS_Store` 和 Python 缓存文件。

## 常用命令

后端：

```bash
cd backend
source .venv/bin/activate
python3 app.py
```

前端：

```bash
cd frontend
npm run dev
npm run build
```

快速测试 API：

```bash
curl http://127.0.0.1:5000/api/matches
curl http://127.0.0.1:5000/api/hotels
curl http://127.0.0.1:5000/api/itinerary
```

## 当前运行状态

当前版本使用 Vite 启动 React 前端，Flask 后端运行在 `5000` 端口。

```text
Frontend: http://127.0.0.1:5173
Backend:  http://127.0.0.1:5000
```
