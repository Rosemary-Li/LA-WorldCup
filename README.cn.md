# LA × FIFA 世界杯 2026

APAN5310 全栈课程项目，主题是 2026 年 FIFA 世界杯洛杉矶赛区的旅行体验。前端基于 React/Vite，通过 Flask REST API 访问规范化的 PostgreSQL 数据库，帮助访客浏览 LA 赛程、球队信息、酒店、餐厅、球迷活动、演出、景点，并生成个性化行程。

> English version: [README.md](README.md)
> API 文档：[API_INTERFACE.cn.md](API_INTERFACE.cn.md)

---

## 系统架构

```text
原始 Excel / CSV
    → 清洗后的 CSV
    → PostgreSQL 维度模型（DigitalOcean 托管）
    → SQL 查询层        backend/queries.py
    → 行程生成服务       backend/services/itinerary.py
    → Flask JSON API    backend/app.py
    → React API 客户端   frontend/src/api.js
    → React 界面        frontend/src/
```

浏览器永远不直接访问 PostgreSQL。React 只调用 Flask 接口，数据库凭据保存在 `backend/.env`。

---

## 用户流程

单页 scroll-snap 设计，六个全屏 section 加一个对齐到 snap 的行程结果页。

1. **Photo Hero** — 全屏 LA × WC26 落地页。
2. **Matches** — SoFi 体育场的 8 场 LA 比赛。多选（复选框），被选比赛会传递到 Journey；点行号弹出比赛详情。
3. **Match Overlay** — 阶段、日期、球队旗帜 + FIFA 排名、AI 生成的赛事故事（Anthropic）、实时 H2H 数据（API-Football）、Players to Watch 球星卡。
4. **Journey** — 步骤卡式表单：Your Matches · Who's Coming · Trip Preferences · Generate。左侧 hero 照片随旅行者类型切换；CTA 跳转到 Explore LA。
5. **Explore LA** — 杂志风排版入口（HOTEL · Restaurant · Show · Attraction · 竖排 FAN EVENT）+ 悬停切换的特色照片。点任一类别进入卡片+地图分屏视图，并附带杂志风**搜索栏**（边输入边过滤 name / area / region / type / flavor）；"Build My Journey →" 触发行程生成。
6. **Itinerary** — Snap 对齐的行程结果页：摘要卡（标签、比赛、酒店、picks 数 + 主图）、按天的时间线卡片（每条带照片、交通/时长/票价 chips）、右侧全高度地图。悬停时间线项目会高亮地图上的标记；点照片或箭头跳转到该地点的官网。每条活动 hover 还会显示一组操作按钮：
   - **✎ 编辑 / 替换** 弹出 **Activity Picker** 模态 — 在整个数据库里搜索（餐厅 / 活动 / 演出 / 景点）选一条真实数据替换规划器给的活动，或者只改时间
   - **× 删除** 移除该活动
   - **📅 添加到 Google Calendar** 打开预填好（标题、时间、地点）的 Google Calendar 单事件创建页
   - 每一天列表底部还有 **+ Add activity from database** 按钮
   - 摘要卡右上角：**↓ Calendar**（下载多事件 `.ics` 用任意日历 app 一次性导入）+ **✦ Share**（见下）
7. **About** — 团队介绍 + DiceBear 头像 + GitHub 链接。

### 分享模态（行程页右上 ✦ Share 按钮）

- 通过 `html2canvas`（懒加载，不污染初始 bundle）生成 1080×1920 IG-Stories 比例的行程海报。短行程严格 1080×1920；长行程宽度不变，高度按内容延展。
- 同时把当前行程持久化到 Postgres（`POST /api/itinerary/save`），所有分享链接都带上 `?i=<id>` 短码，对方打开看到的是**完全相同的行程**，不是首页。
- 五个动作按钮：**Copy link · X · LinkedIn · Reddit · Download PNG**。手机端顶部还有一个 IG 渐变大 CTA，调用 `navigator.share({ files: [pngFile], url: shareUrl })` → 系统分享菜单 → 用户点 Instagram → IG 打开后自选 Story / Feed / Direct。

---

## 技术栈

| 层 | 技术 |
|---|---|
| 数据库 | PostgreSQL (DigitalOcean 托管) |
| ETL | Python, pandas, psycopg2 |
| 后端 | Flask 3.1, flask-cors, psycopg2-binary, python-dotenv |
| LLM（赛事故事） | Anthropic SDK — Claude Opus 4.7，搭配 `messages.parse()` + Pydantic |
| 体育数据 | API-Football (api-sports.io) — H2H、近况、排名 |
| 前端 | React 19, Vite 7 |
| 字体 | Playfair Display（全局唯一字体） |
| 地图 | Leaflet.js (CDN) + CARTO Dark Matter 瓦片 |
| 地点照片 | 一次性 Node 脚本 → og:image / Wikipedia → 本地文件 |
| 分享海报 | `html2canvas`（懒加载）→ 1080×1920 PNG → Web Share API + 各平台 intent URL |
| 日历导出 | RFC 5545 `.ics` 生成器 + Google Calendar `eventedit` URL（`frontend/src/lib/calendar.js`） |

---

## 仓库结构

```text
LA_WorldCup/
├── backend/
│   ├── app.py                    # Flask 路由（只做参数解析的薄壳）
│   ├── queries.py                # PostgreSQL 查询层 + 连接池
│   ├── setup_database.py         # 建表 + CSV 导入
│   ├── requirements.txt          # 锁定版本的 Python 依赖
│   ├── .env / .env.example       # 数据库 + API key（不进 git）
│   ├── services/
│   │   ├── itinerary.py          # 两阶段行程生成器
│   │   ├── match_story.py        # Anthropic 赛事故事生成（带熔断器）
│   │   └── match_data.py         # API-Football 集成（三层缓存）
│   ├── config/
│   │   ├── matches.json          # 比赛元数据
│   │   └── areas.json            # LA 区域 → lat/lon 映射
│   └── .cache/                   # match_stats.json (API-Football 文件缓存)
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js            # /api 开发代理
│   ├── package.json
│   ├── .env / .env.example       # VITE_API_BASE
│   ├── css/
│   │   ├── styles.css            # 入口文件 — @import 下面的模块
│   │   └── modules/              # 按 section 拆分的模块（原 5K 行单文件已拆分）
│   │       ├── globals.css       # 调色板、snap 布局、页面圆点、根变量
│   │       ├── nav.css           # 顶部导航
│   │       ├── shared.css        # <section> 默认样式 + mount-* 占位
│   │       ├── photo-hero.css    # 落地页
│   │       ├── matches.css       # 赛程 + 表格 + 导航按钮
│   │       ├── match-overlay.css # 模态外壳 + mo2-* 详情样式
│   │       ├── journey.css       # Hero + 步骤卡 + 行程结果
│   │       ├── explore-la.css    # 杂志入口 + 类别分屏视图
│   │       ├── about.css         # 团队网格 + 简介
│   │       └── section-divider.css
│   ├── public/images/
│   │   ├── *                     # 内置 hero + 类别 fallback 图
│   │   └── places/               # 100+ 张抓取的地点照片（og:image / Wikipedia）
│   ├── scripts/
│   │   ├── scrape-place-images.mjs        # Pass 1：从 PLACE_URLS 抓 og:image
│   │   ├── scrape-place-images-retry.mjs  # Pass 2：Wikipedia 备用
│   │   ├── scrape-place-images-retry2.mjs # Pass 3：REST API + 退避
│   │   ├── scrape-place-images-retry3.mjs # Pass 4：酒店 - 用母品牌词条
│   │   ├── scrape-place-images-retry4.mjs # Pass 5：邻域备用
│   │   ├── scrape-place-images-retry5.mjs # 餐厅 - 强制 JPG
│   │   └── scrape-place-images-retry6.mjs # 演出 + 景点 + 球迷活动
│   └── src/
│       ├── main.jsx              # App 根组件，提升的状态、滚动回调
│       ├── api.js                # 带 AbortController 超时的 fetch 封装
│       ├── placeMedia.js         # 地点名 → 官网 URL + 图片
│       ├── placeImages.json      # 由抓取脚本生成（118 条）
│       ├── components/
│       │   ├── Nav.jsx           # 顶部导航，Itinerary 智能滚动
│       │   ├── SyncMap.jsx       # Leaflet 地图，按 name 优先匹配高亮
│       │   ├── ExCard.jsx        # Explore 卡片
│       │   ├── FilterRow.jsx     # 胶囊 / 下拉筛选
│       │   ├── DataNotice.jsx    # 加载/错误/重试横幅
│       │   ├── ShareCard.jsx     # 离屏 1080×1920 IG Stories 模板
│       │   ├── ShareModal.jsx    # 分享模态（预览 + 5 个社交按钮 + 手机端 IG CTA）
│       │   └── ActivityPicker.jsx # 模态：从 DB 选真实活动添加 / 替换到行程
│       ├── lib/
│       │   ├── calendar.js       # ICS 生成器 + Google Calendar URL helper
│       │   └── explorePool.js    # 共享 activity pool（ExploreLA + ActivityPicker 共用）
│       ├── sections/
│       │   ├── PhotoHero.jsx
│       │   ├── Matches.jsx       # 多选赛程
│       │   ├── ExploreLA.jsx     # 杂志入口 + 类别分屏（带搜索栏）
│       │   ├── Journey.jsx       # 表单 + JourneyResult（编辑/添加/删除 + Calendar + Share）
│       │   ├── MatchOverlay.jsx
│       │   └── About.jsx
│       ├── hooks/
│       │   └── useSiteData.js    # 并行 fetch + 退避重试 + refetch
│       └── constants/
│           ├── matches.js        # matchRows, matchMeta
│           ├── explore.js        # 类别配置, AREA_COORDS
│           └── journey.js        # 表单字段配置, activity marks
│
├── database/
│   ├── raw_data/
│   ├── clean_data/
│   ├── migrations/
│   │   └── 001_journey_share.sql # 持久化分享链接的 journey_share 表
│   └── docs/                     # ER 图
│
├── backend/scripts/
│   └── init_share_table.py       # 一次性应用 journey_share 迁移
│
├── archive/                      # 历史迭代版本
├── API_INTERFACE.md / .cn.md     # 接口参考（英文 + 中文）
└── README.md / .cn.md            # 本文件（中英文）
```

---

## 本地启动

### 后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 填入: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSLMODE
# 可选: ANTHROPIC_API_KEY (赛事故事), API_FOOTBALL_KEY (实时数据)

# 一次性应用 share 链接迁移（幂等）：
python3 scripts/init_share_table.py

python3 app.py
# → http://127.0.0.1:5001
```

### 前端

```bash
cd frontend
cp .env.example .env
# 默认: VITE_API_BASE=http://127.0.0.1:5001
npm install
npm run dev
# → http://127.0.0.1:5173
```

> **不同机器 / 端口**：只需要改 `frontend/.env`，无需改源码。

### 地点照片抓取（可选，一次性）

仓库已经包含 `frontend/src/placeImages.json` 和 `frontend/public/images/places/`（118 条记录，~100 张唯一 JPG）。只有当你修改了 `placeMedia.js` 中的 URL 列表才需要重跑：

```bash
node frontend/scripts/scrape-place-images.mjs           # 第一轮 og:image
node frontend/scripts/scrape-place-images-retry2.mjs    # Wikipedia REST 备用
# (其他 retry 脚本针对酒店 / 餐厅 / 演出 / 球迷活动)
```

抓取脚本带礼貌 UA + 指数退避，可以反复运行。

---

## 数据库设计

维度模型 — 维度表存放稳定的参考数据，事实表存放交易记录，详情表为 `fact_event` 补充行程级别的元数据。

### 维度表

| 表 | 内容 |
|---|---|
| `dim_team` | 国家、足联、小组、晋级状态 |
| `dim_player` | 姓名、球队、位置、俱乐部、年龄、出场、进球、巨星标记 |
| `dim_place` | 体育场、机场、交通点 + 坐标 |
| `dim_mode` | 交通方式元数据 |
| `dim_event_category` | 类别标签，被 event 与行程查询引用 |

### 事实表

| 表 | 内容 |
|---|---|
| `fact_match` | 比赛编号、日期、时间、球队、小组、阶段、场馆 |
| `fact_ticket` | 类别、座位区、价格、状态、比赛 FK |
| `fact_hotel` | 区域、地址、星级、价格档、评论数、lat/lon |
| `fact_restaurant` | 区域、地址、菜系、价格区间、评分 |
| `fact_event` | 球迷活动、演出、社区活动、体育赛事、LA 体验 |
| `fact_route` | 机场到场馆 + 本地交通路线 |
| `fact_ranking` | FIFA 排名快照，含名次变化和积分 |

### 详情表

| 表 | 内容 |
|---|---|
| `event_experience_detail` | 14 列：key_experience、recommended_duration、suitable_for、transportation、spatial_character、planning_tag、ticket_price、admission_info、price_level、crowdedness、intensity_level、night_friendly、photo_value、commercial_level |
| `event_sports_detail` | 运动类型与赛事信息 |

`event_experience_detail` 全部 14 列现在都通过 `/api/itinerary` 下发，在 Itinerary 页面渲染为 chips。

### 分享表

| 表 | 内容 |
|---|---|
| `journey_share` | `id`（8 位 URL-safe）、`payload`（JSONB 行程）、`created_at`、`view_count`。由 [`database/migrations/001_journey_share.sql`](database/migrations/001_journey_share.sql) 创建 — 用 `python3 backend/scripts/init_share_table.py` 应用。 |

---

## 行程生成逻辑

`GET /api/itinerary` 由 `backend/services/itinerary.py` 处理。`app.py` 里的路由只做参数解析后调用 `build_itinerary()`。

**输入 → 候选池映射：**

| 输入 | 映射到 |
|---|---|
| `type` | 事件类别 ID → `get_events_by_categories()` |
| `vibe` | Vibe 类别 ID → `get_events_by_categories()` |
| `budget` | 价格档 → `recommend_hotels_for_budget()` / `recommend_restaurants_for_budget()` |
| `picks` | 用户在 Explore LA 选择的项目，优先注入到行程 |

**单日结构（普通日）：**

| 时间 | 槽位 |
|---|---|
| 09:30 | 上午活动 |
| 12:30 | 午餐（餐厅） |
| 15:00 | 下午活动（不同类别） |
| 18:00 | 晚间 / vibe 活动 |
| 20:30 | 晚餐（餐厅） |

比赛日：上午活动 → 午餐 → 比赛，无晚间槽位。

**评分 + 规则**（`itinerary.py` Phase B — `fill_day_slots`）：
- 硬扣分（≤ −500 → 直接跳过）：同餐厅当日重复、同事件类别当日重复、同活动跨天重复。
- 软加分：traveler-type 命中、vibe 命中、时段契合、所在 day-anchor 区域、比赛日靠近体育场、Explore LA picks。
- 软扣分：区域偏远、跨天重复类别、单日同区域 ≥3 项的 area overload。
- 同参数 + 同 `variant` → 输出确定一致。
- **不再限制天数** — 之前的 7 天上限已移除，行程长度跟随用户选定的日期范围。

比赛日期与 LA 区域坐标在 `backend/config/matches.json` / `areas.json`，改动无需修改 Python。

---

## 地点照片管线

每张 Explore LA 卡片和每条 Itinerary 活动都展示真实地点照片。流程：

1. **来源列表** — `frontend/src/placeMedia.js` 的 `PLACE_URLS` 把小写地点名映射到官网（约 110 条）。
2. **抓取** — `frontend/scripts/scrape-place-images*.mjs` 拉取每个官网，提取 `og:image` / `twitter:image`，下载到 `frontend/public/images/places/{slug}.jpg`。失败的（没有 og:image / 403 / 404）走 Wikipedia REST API summary 备用文章。
3. **映射** — `frontend/src/placeImages.json`（自动生成）保存 `{ "<小写地点名>": "images/places/{slug}.jpg" }`。
4. **解析链** — 渲染时 `mediaForPlace(name, category)` 依次返回：
   - 本地抓取的图片（若有）
   - 否则，thum.io 实时网站截图
   - 否则，按类别的内置 fallback (`images/hotel.jpg` 等；`events` 按名字哈希在 5 张图之间轮换)。

抓取脚本是幂等的，可重复运行。仓库已带 JSON 映射 + 下载好的图片，clone 后无需再跑。

---

## 可靠性 + UX 强化

- **API 超时** — `frontend/src/api.js` 用 `AbortController` 包裹 `fetch`（默认 15s，`/api/itinerary` 30s）。后端卡住不会再让 UI 死锁。
- **数据自愈** — `useSiteData` 最多重试 4 次，指数退避（1s, 2s, 4s），并暴露 `refetch()` 让用户在 `DataNotice` 横幅上手动重试。
- **地图高亮匹配** — `SyncMap` 先按 name 匹配（精确），失败再按坐标 fallback（覆盖被去重合并的同坐标标记）。鼠标悬停始终触发，即使活动没有坐标。
- **跳转官网** — Itinerary 活动的照片和右侧 `›` 箭头都会在新标签打开官方网站。
- **诊断日志** — 点击链路上每一环都会用 `[explore]` / `[journey]` / `[api]` 前缀打到 console，DevTools 里能直接看到失败位置。
- **Build 按钮** — 在点击 handler 内部判断状态，而不是用 `disabled={…}`（后者会让 React 把点击路由到 `noop1`，默默丢弃）。
- **手机端响应式重构** — `<= 768px` 时全站自适应：scroll-snap 关掉（mandatory 在触屏上手感很差）、nav 收成单行居中、Explore LA 把地图堆到卡片下方、Journey 表单改单列堆叠（traveler 和 stat cards 都堆叠）、Share 按钮改贴在摘要卡底部、行程结果页隐藏侧边地图（手机上时间线才是正主）。
- **横向溢出兜底** — 每个 `#mount-*` 在手机端都加 `overflow-x: hidden; max-width: 100vw`，单个子元素再怎么超长也不会撑爆整页。

---

## 接口一览

详见 [API_INTERFACE.cn.md](API_INTERFACE.cn.md)。

| 接口 | 用途 |
|---|---|
| `GET /api/matches` | LA 全部比赛 |
| `GET /api/matches/<match_number>` | 单场比赛详情 |
| `GET /api/tickets/<match_number>` | 单场票务选项 |
| `GET /api/teams` | 球队信息 |
| `GET /api/players` | 球员列表（分页 + 搜索） |
| `GET /api/players/<team>` | 单队大名单 |
| `GET /api/rankings` | FIFA 排名快照 |
| `GET /api/hotels` | 酒店（含坐标） |
| `GET /api/restaurants` | 餐厅（可筛选） |
| `GET /api/events` | 活动 / 演出 / 景点（已 JOIN 详情表） |
| `GET /api/itinerary` | 行程生成（每条活动现在带完整 14 字段详情） |
| `GET /api/match-story/<match_number>` | LLM 生成赛事故事（Anthropic；额度耗尽时熔断） |
| `GET /api/match-stats/<match_number>` | 实时 H2H + 近况（API-Football，三层缓存） |
| `POST /api/itinerary/save` | 持久化生成 / 编辑后的行程，返回短码 |
| `GET /api/itinerary/share/<id>` | 按短码加载分享行程；自动 +1 `view_count` |

---

## 安全

- 浏览器永远看不到数据库凭据。
- 全部 SQL 使用参数化查询 — 用户输入不会拼字符串。
- `backend/.env` 与 `frontend/.env` 都在 `.gitignore`。
- Anthropic + API-Football key 只放在 `backend/.env`，前端不会接触。

---

## 自检命令

```bash
# 后端健康
curl http://127.0.0.1:5001/api/matches | head -100
curl http://127.0.0.1:5001/api/hotels  | head -100

# 行程（默认参数）
curl "http://127.0.0.1:5001/api/itinerary?type=solo&budget=mid&days=3&match_date=jun12&vibe=culture"

# 行程 + Explore LA picks
curl "http://127.0.0.1:5001/api/itinerary?type=couple&budget=luxury&days=5&match_date=jun21&vibe=nightlife&picks=%5B%7B%22id%22%3A%22hotel-0-Ritz%22%2C%22category%22%3A%22hotels%22%2C%22name%22%3A%22Ritz-Carlton%22%2C%22detail%22%3A%22Downtown%22%2C%22markerType%22%3A%22hotel%22%2C%22lat%22%3A34.045%2C%22lng%22%3A-118.264%7D%5D"
```
