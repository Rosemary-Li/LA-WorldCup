# LA × FIFA 世界杯 2026

APAN5310 课程全栈项目 —— 为 2026 FIFA 世界杯洛杉矶赛区打造的访客体验平台。React/Vite 前端通过 Flask REST API 连接 PostgreSQL 数据库，帮助访客探索赛程、球队资料、酒店、餐厅、球迷活动、演出、景点，并生成个性化旅行计划。

> English version: [README.md](README.md)

---

## 架构总览

```text
原始 Excel / CSV 文件
    → 清洗后的 CSV 文件
    → PostgreSQL 维度建模
    → SQL 查询层          backend/queries.py
    → 行程生成服务         backend/services/itinerary.py
    → Flask JSON API      backend/app.py
    → React API 客户端    frontend/src/api.js
    → React 界面          frontend/src/
```

浏览器不直接连接数据库。React 只调用 Flask 接口。数据库凭证保存在 `backend/.env`，不进入版本控制。

---

## 用户流程

整个页面是一个可滚动的单页应用，各板块之间支持平滑 scroll-snap：

1. **Hero** — LA × WC26 落地页，循环播放照片轮播。三个步骤按钮：*选择比赛 → 探索城市 → 生成行程*，点击直接跳转对应板块。
2. **赛程** — SoFi 球场举办的八场洛杉矶赛事。点击任意行打开比赛详情浮层。
3. **比赛浮层** — 赛制、日期/时间、球队旗帜 + FIFA 排名、赛事故事、历史交锋。标签页：门票 · 酒店 · 餐厅 · 球迷活动 · 阵容。底部 CTA 链接至探索 LA 板块。
4. **探索 LA** — 五个类别：酒店、餐厅、球迷活动、演出、景点。卡片展示官网截图（thum.io）并链接至官方网站。选择会跨类别保留，并在右侧 Leaflet 地图上显示为彩色图钉。"生成我的旅程 →" 将所选内容传递给行程生成器。
5. **旅程** — 表单输入（旅行者类型、预算、天数、比赛日期、偏好氛围）。提交到 `/api/itinerary`，后端从 SQL 推荐池生成逐日行程，优先排入探索 LA 的选择。结果左侧显示时间轴，右侧显示实时路线地图；鼠标悬停时间轴条目可在地图上高亮对应位置。
6. **关于我们** — 团队成员简介，附 DiceBear 头像和 GitHub 链接。

---

## 技术栈

| 层级 | 技术选型 |
|---|---|
| 数据库 | PostgreSQL（DigitalOcean 托管） |
| ETL | Python、pandas、psycopg2 |
| 后端 | Flask 3.1、flask-cors、psycopg2-binary、python-dotenv |
| 前端 | React 19、Vite 7、CSS（Cormorant Garamond + DM Mono） |
| 地图 | Leaflet.js（CDN）+ CARTO Dark Matter 瓦片 |
| 卡片图片 | thum.io 网站截图服务 |

---

## 项目结构

```text
LA_WorldCup/
├── backend/
│   ├── app.py                  # Flask 路由（仅负责收参数和返回 JSON）
│   ├── queries.py              # PostgreSQL 查询层和连接池
│   ├── setup_database.py       # 建表和 CSV 导入
│   ├── requirements.txt        # 锁定版本的 Python 依赖
│   ├── .env.example
│   ├── services/
│   │   └── itinerary.py        # 行程生成逻辑
│   └── config/
│       ├── matches.json        # 比赛日期/标签映射
│       └── areas.json          # LA 区域 → 经纬度映射
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx            # App 根组件和挂载（47 行）
│   │   ├── api.js              # API 客户端（读取 VITE_API_BASE）
│   │   ├── placeMedia.js       # 官方链接和 thum.io 图片辅助
│   │   ├── components/         # 可复用 UI 组件
│   │   │   ├── Nav.jsx
│   │   │   ├── SyncMap.jsx
│   │   │   ├── ExCard.jsx
│   │   │   ├── FilterRow.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── DataNotice.jsx
│   │   │   └── Nearby.jsx      # Nearby + TicketCard
│   │   ├── sections/           # 页面各板块
│   │   │   ├── PhotoHero.jsx
│   │   │   ├── Matches.jsx
│   │   │   ├── ExploreLA.jsx
│   │   │   ├── Journey.jsx     # 表单 + JourneyResult
│   │   │   ├── MatchOverlay.jsx
│   │   │   └── About.jsx
│   │   ├── hooks/
│   │   │   └── useSiteData.js  # 数据加载 Hook
│   │   └── constants/
│   │       ├── matches.js      # matchRows、matchMeta
│   │       ├── explore.js      # 类别配置、区域坐标
│   │       └── journey.js      # 表单字段配置、活动标签
│   ├── css/styles.css
│   ├── images/
│   ├── .env                    # VITE_API_BASE（不提交）
│   ├── .env.example
│   └── vite.config.js          # 开发代理 /api
│
├── database/
│   ├── raw_data/
│   ├── clean_data/
│   └── docs/                   # ER 图
│
├── archive/                    # 历史版本（仅供参考）
├── API_INTERFACE.md
├── API_INTERFACE.cn.md
└── README.md
```

---

## 本地启动

### 后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 填写：DB_HOST、DB_PORT、DB_NAME、DB_USER、DB_PASSWORD、DB_SSLMODE
python3 app.py
# → http://127.0.0.1:5001
```

### 前端

```bash
cd frontend
cp .env.example .env
# 默认：VITE_API_BASE=http://127.0.0.1:5001
# 换电脑或换端口时只改这一行，不需要改源码
npm install
npm run dev
# → http://127.0.0.1:5173
```

> **换电脑 / 换端口**：只需修改 `frontend/.env`，无需改动任何源代码。

---

## 数据库设计

维度建模 —— 维度表存储稳定的参照数据，事实表存储交易记录。

### 维度表

| 表名 | 内容 |
|---|---|
| `dim_team` | 国家/地区、联合会、小组赛分组、资格状态 |
| `dim_player` | 球员姓名、所属队伍、位置、俱乐部、年龄、出场次数、进球数、明星标记 |
| `dim_place` | 球场、机场、交通地点及经纬度 |
| `dim_mode` | 交通方式元数据 |
| `dim_event_category` | 活动类别标签（供活动查询和行程生成使用） |

### 事实表

| 表名 | 内容 |
|---|---|
| `fact_match` | 比赛编号、日期、时间、参赛队、分组、赛制、场馆 |
| `fact_ticket` | 票种、看台区域、价格、状态、关联比赛 |
| `fact_hotel` | 区域、地址、星级、价格档位、评价数量、经纬度 |
| `fact_restaurant` | 区域、地址、菜系、价格区间、评分 |
| `fact_event` | 球迷活动、演出、社区活动、体育赛事、洛杉矶体验 |
| `fact_route` | 机场至场馆及本地交通路线 |
| `fact_ranking` | FIFA 排名快照，含排名变化和积分 |

### 详情表

| 表名 | 内容 |
|---|---|
| `event_experience_detail` | 时长、适合人群、门票信息、交通备注 |
| `event_sports_detail` | 运动类型和赛事信息 |

---

## 行程生成逻辑

`GET /api/itinerary` 由 `backend/services/itinerary.py` 处理，`app.py` 中的路由只负责解析参数并调用 `build_itinerary()`。

**参数映射：**

| 参数 | 映射目标 |
|---|---|
| `type` | 活动类别 ID → `get_events_by_categories()` |
| `vibe` | 氛围类别 ID → `get_events_by_categories()` |
| `budget` | 价格档位 → `recommend_hotels_for_budget()` / `recommend_restaurants_for_budget()` |
| `picks` | 用户在探索 LA 中的选择，优先插入行程 |

**普通日的每日结构：**

| 时间 | 安排 |
|---|---|
| 09:30 | 上午活动（按旅行者类型） |
| 12:30 | 午餐（餐厅） |
| 15:00 | 下午活动（不重复类别） |
| 18:00 | 夜间/氛围活动 |
| 20:30 | 晚餐（餐厅） |

比赛日：上午活动 → 午餐 → 比赛，无晚间安排。

**每日规则：**
- 同一天内不重复同类别活动。
- 活动从双端队列中消费，跨天不重复。
- 餐厅循环取用，确保午餐和晚餐不同。
- 若选择了酒店，同区域的餐厅和活动优先排在前面。
- 探索 LA 选择优先于通用推荐（每天最多 2 项）。
- 相同参数集始终产生相同结果（确定性种子）。

比赛日期和 LA 区域坐标分别存储在 `backend/config/matches.json` 和 `backend/config/areas.json`，无需修改 Python 代码即可更新。

---

## API 概览

完整接口文档见 [API_INTERFACE.cn.md](API_INTERFACE.cn.md)。

| 接口 | 用途 |
|---|---|
| `GET /api/matches` | 所有洛杉矶赛程 |
| `GET /api/matches/<match_number>` | 单场比赛详情 |
| `GET /api/tickets/<match_number>` | 单场门票选项 |
| `GET /api/teams` | 球队信息 |
| `GET /api/players` | 球员列表（支持分页和搜索） |
| `GET /api/players/<team>` | 单支球队阵容 |
| `GET /api/rankings` | FIFA 排名快照 |
| `GET /api/hotels` | 含坐标的酒店列表 |
| `GET /api/restaurants` | 餐厅列表（支持筛选） |
| `GET /api/events` | 活动、演出、景点 |
| `GET /api/itinerary` | 个性化行程生成 |

---

## 安全说明

- 浏览器不接触数据库凭证。
- 所有 SQL 使用参数化查询，不对用户输入做字符串拼接。
- `backend/.env` 和 `frontend/.env` 均已加入 `.gitignore`，不提交至版本控制。

---

## 冒烟测试

```bash
# 后端基础接口
curl http://127.0.0.1:5001/api/matches
curl http://127.0.0.1:5001/api/hotels
curl "http://127.0.0.1:5001/api/itinerary?type=football&budget=mid&days=3&match_date=jun12&vibe=culture"
```
