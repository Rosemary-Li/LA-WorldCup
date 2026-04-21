# LA × FIFA 世界杯 2026

APAN5310 课程全栈项目，围绕 2026 FIFA 世界杯洛杉矶赛区展开。React/Vite 前端调用 Flask REST API，后端由 PostgreSQL 数据库驱动，帮助球迷探索洛杉矶的比赛日程、球队背景、酒店、餐厅、球迷活动、演出、景点和个性化旅行计划。

> 英文版：[README.md](README.md)

## 数据流

```text
原始 Excel / CSV 文件
    → 清洗后的 CSV 文件
    → PostgreSQL 维度建模数据库
    → SQL 查询函数   backend/queries.py
    → Flask JSON API  backend/app.py
    → React API 客户端 frontend/src/api.js
    → React UI        frontend/src/main.jsx
```

浏览器不会直接连接 PostgreSQL。React 只调用 Flask 接口。数据库账号密码保存在 `backend/.env` 中。

## 用户流程

整个 app 是一个支持 scroll-snap 的连续滚动体验：

1. **Hero** — LA × WC26 入口。三个快捷按钮：*选择比赛 → 探索城市 → 生成行程*，可直接跳转到对应板块。
2. **Matches** — SoFi Stadium 的八场洛杉矶比赛。点击任意一场打开详情弹窗。
3. **Match Overlay** — 展示赛事阶段、日期时间、两队旗帜和 FIFA 排名、比赛故事线、历史交锋记录，以及 Tabs：票务 / 附近酒店 / 附近餐厅 / 球迷活动 / 阵容。弹窗底部有"探索 LA →"跳转入口。
4. **Explore LA** — 左侧卡片列表，右侧实时 Leaflet 地图。五个分类：酒店、餐厅、球迷活动、演出、景点。卡片通过 thum.io 展示网站截图，可点击跳转官网。选中的地点以地图 pin 显示，可跨分类累积。"生成我的行程 →" 滚动到行程板块。
5. **Journey** — 表单输入（旅行者类型、预算、天数、比赛日期、氛围偏好）。调用后端 SQL 推荐池，结合 Explore LA 已选项生成逐日行程。左侧展示时间线，右侧为实时路线地图。鼠标悬停时间线条目可在地图上高亮显示。
6. **About Us** — 团队成员介绍、DiceBear 头像和 GitHub 链接。

## 技术栈

| 层级 | 技术 |
|---|---|
| 数据库 | PostgreSQL（DigitalOcean 托管） |
| ETL | Python、pandas、psycopg2 |
| 后端 | Flask、flask-cors、psycopg2、python-dotenv |
| 前端 | React 19、Vite、CSS（Cormorant Garamond + DM Mono） |
| 地图 | Leaflet（CDN 引入） |
| 卡片图片 | thum.io 网站截图服务 |

## 项目结构

```text
LA_WorldCup/
├── backend/
│   ├── app.py              # Flask 路由和 Journey 生成逻辑
│   ├── queries.py          # PostgreSQL 查询层和连接池
│   ├── setup_database.py   # 建表和 CSV 导入脚本
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api.js          # 前端 API 客户端和数据映射
│   │   ├── main.jsx        # 所有 React 组件和 app 状态
│   │   └── placeMedia.js   # 官网链接和 thum.io 图片辅助逻辑
│   ├── css/styles.css
│   └── images/
│
├── database/
│   ├── raw_data/
│   ├── clean_data/
│   └── docs/               # ER 图
│
├── API_INTERFACE.md
└── README.md
```

## 本地运行

### 后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# 填写 DB_HOST、DB_PORT、DB_NAME、DB_USER、DB_PASSWORD、DB_SSLMODE
python3 app.py
# → http://127.0.0.1:5001
```

### 前端

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## 数据库设计

采用维度建模。维度表存储稳定实体，事实表存储业务记录。

### 维度表

| 表 | 内容 |
|---|---|
| `dim_team` | 国家、足联、小组、晋级状态 |
| `dim_player` | 姓名、球队、位置、俱乐部、年龄、出场数、进球数、明星标记 |
| `dim_place` | 体育场、机场、交通地点及坐标 |
| `dim_mode` | 交通方式元数据 |
| `dim_event_category` | 活动分类标签，用于活动查询和 Journey 推荐 |

### 事实表

| 表 | 内容 |
|---|---|
| `fact_match` | 比赛编号、日期、时间、球队、小组、阶段、场馆 |
| `fact_ticket` | 票种、座位区域、价格、状态及比赛外键 |
| `fact_hotel` | 区域、地址、星级、价格带、评论数、坐标 |
| `fact_restaurant` | 区域、地址、菜系、价格区间、评分 |
| `fact_event` | 球迷活动、演出、社区活动、体育赛事和 LA 体验 |
| `fact_route` | 机场到场馆及本地交通路线 |
| `fact_ranking` | FIFA 排名快照、排名变化和积分 |

### 详情表

| 表 | 内容 |
|---|---|
| `event_experience_detail` | 时长、适合人群、入场信息、交通说明 |
| `event_sports_detail` | 运动类型和赛事信息 |

## Journey 逻辑

`GET /api/itinerary` 将用户输入映射到 SQL 推荐池，生成逐日行程。

每个普通日的结构：

| 时间 | 内容 |
|---|---|
| 09:30 | 上午活动（类型活动，分类不重复） |
| 12:30 | 午餐（餐厅） |
| 15:00 | 下午活动（分类与上午不同） |
| 18:00 | 傍晚活动（氛围活动，分类再次不同） |
| 20:30 | 晚餐（餐厅） |

比赛当天：上午活动 → 午餐 → 比赛，之后不安排其他活动。

每日规则：

- 同一天不安排相同分类的活动。
- 活动从 deque 中依次取用，避免跨天重复。
- 餐厅在午餐/晚餐池中循环，确保午餐和晚餐不同。
- 如果在 Explore LA 中选择了酒店，同区域的餐厅和活动会优先排入行程。
- Explore LA 的 picks 会在通用推荐之前优先插入行程。

## API 说明

完整接口文档见 [API_INTERFACE.cn.md](API_INTERFACE.cn.md)。

| 接口 | 用途 |
|---|---|
| `GET /api/matches` | 比赛日程 |
| `GET /api/tickets/<match_number>` | 某场比赛的票务选项 |
| `GET /api/teams` | 球队背景 |
| `GET /api/players` | 球员数据 |
| `GET /api/players/<team>` | 某队球员（阵容 Tab） |
| `GET /api/rankings` | FIFA 排名 |
| `GET /api/hotels` | 酒店列表（含坐标） |
| `GET /api/restaurants` | 餐厅列表 |
| `GET /api/events` | 活动、演出、景点 |
| `GET /api/itinerary` | 个性化行程生成 |

## 安全说明

- 浏览器不会接触数据库账号密码。
- 所有 SQL 使用参数化查询，不拼接用户输入。
- `backend/.env` 不得提交到 Git（已列入 `.gitignore`）。

## 快速测试

```bash
curl http://127.0.0.1:5001/api/matches
curl http://127.0.0.1:5001/api/hotels
curl "http://127.0.0.1:5001/api/itinerary?type=football&budget=mid&days=5&match_date=jun12&vibe=culture"
```
