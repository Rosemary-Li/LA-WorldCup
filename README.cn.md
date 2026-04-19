# LA × FIFA 世界杯 2026™ — 老好莱坞出品

以老好莱坞电影风格呈现的 2026 FIFA 世界杯洛杉矶赛区旅行导览。完整全栈应用：规范化 PostgreSQL 数据库 → Flask REST API → 纯静态前端网站。学术课程项目（APAN5310）。

> **Also available in:** [English README](README.md)

---

## 项目简介

面向计划前往英格尔伍德 SoFi Stadium 观赛的球迷（2026 年 6–7 月）。覆盖从原始数据 → 清洗后 CSV → 关系型数据库 → REST API → 前端网站的完整全栈流程。

**技术栈**

| 层级 | 技术 |
|---|---|
| 数据库 | PostgreSQL，托管于 DigitalOcean |
| 后端 | Python 3 · Flask · psycopg2 · flask-cors |
| 前端 | 纯 HTML / CSS / JavaScript，无框架，零构建步骤 |

**当前状态：** 三层架构全部完成并已联通。前端启动时从 API 加载真实数据库数据，API 不可达时自动回退到硬编码备用数据。

---

## 目录结构

```
LA_WorldCup/
├── backend/
│   ├── app.py                  # Flask API 服务——所有 /api/* 路由
│   ├── queries.py              # SQL 查询函数（psycopg2）
│   └── setup_database.py      # 一次性数据库初始化：建表 + 导入 CSV
│
├── frontend/
│   ├── index.html              # 入口页面——各区块空挂载点
│   ├── css/styles.css
│   ├── js/
│   │   ├── api.js              # 页面加载时请求 Flask，覆盖 data.js 中的数组
│   │   ├── data.js             # 硬编码备用数据（比赛、酒店、餐厅等）
│   │   ├── matches.js          # 比赛卡片 overlay——详情、H2H、球员、周边推荐
│   │   ├── itinerary.js        # 个性化逐日行程生成器
│   │   ├── explore.js          # 地图大头针筛选逻辑
│   │   └── app.js              # 标签卡片、滚动动效、放映机开场动画
│   └── sections/               # 各文件通过 innerHTML 注入对应页面区块
│       └── nav · hero · matches · overlay · showcase · itinerary
│           · explore · discover · about · footer
│
├── database/
│   ├── raw_data/               # 原始 Excel + CSV 数据文件
│   ├── clean_data/             # 清洗后可直接导入的 CSV（clean_<表名>.csv）
│   └── docs/                   # ER 图 + 数据清洗说明文档
│
├── archive/
│   └── la_worldcup_oldhollywood.html   # 早期单文件原型
│
├── README.md
└── README.cn.md
```

---

## 本地运行

```bash
# 终端 1 — 启动 Flask API
cd backend
python3 app.py
# → http://127.0.0.1:5000

# 终端 2 — 启动前端
cd frontend
python3 -m http.server 8080
# → http://localhost:8080
```

**依赖安装**（仅需一次）：
```bash
pip install flask flask-cors psycopg2-binary pandas
```

---

## 前端功能说明

### 赛程与比赛详情
8 场 LA 赛事以卡片形式展示。点击任意卡片弹出全屏 overlay，包含：
- 比赛信息（赛段、日期、场馆）
- 历史交锋记录（H2H）
- 明星球员看点（从 `dim_player` 经 API 实时拉取）
- 周边推荐标签页：酒店 / 餐厅 / 活动（均来自 API 真实数据）

### 酒店、餐厅与活动（Discover 板块）
标签切换式卡片网格。页面加载时 `api.js` 从数据库拉取实时数据并重新渲染，替换硬编码备用内容。四个标签：**酒店**（21家）· **餐厅**（32家）· **球迷活动** · **演出与娱乐**。

### 个性化行程生成器
用户选择五项参数，生成逐日行程：

| 参数 | 选项 |
|---|---|
| 旅行者类型 | 足球粉丝 · 家庭出游 · 背包客 · 豪华旅行者 |
| 预算档位 | 经济（$150–250/天）· 中档（$350–500/天）· 豪华（$700+/天） |
| 行程天数 | 1–7 天 |
| 比赛日期 | 8 场 LA 赛事中任选其一 |
| 旅行风格 | 文化 · 海滩 · 夜生活 · 电影 |

**生成逻辑：**
- 每种**旅行者类型**对应完全不同的活动集合——足球粉丝走 Fan Zone + 球迷酒吧路线；家庭出游主打博物馆和 Santa Monica 海滩；背包客全程免费/低价户外活动；豪华旅行者走 Rodeo Drive + 米其林餐厅路线。
- 每种类型内部，不同**预算档位**又有各自的活动列表，三者互不重叠。
- **第 1 天**：所选风格活动（vibe）固定追加在当天末尾，保证时间顺序正确（夜生活活动 22:00 排在最后而非最开头）。
- **比赛日**（3天及以上行程的第 3 天）：末尾固定替换为 ⚽ MATCH AT SOFI STADIUM，无论选择哪种旅行者类型。
- **第 2 天起**：在同类型活动池内轮转，避免每天内容完全重复。

---

## API 接口一览

| 路径 | 说明 |
|---|---|
| `GET /api/matches` | 所有 8 场 LA 比赛 |
| `GET /api/matches/<场次号>` | 单场比赛详情（含场馆、备注） |
| `GET /api/tickets` | 全部 46 个票务选项 |
| `GET /api/tickets/<场次号>` | 某场比赛的票务 |
| `GET /api/teams` | 所有 LA 参赛队伍 |
| `GET /api/players` | 所有球员 |
| `GET /api/players/stars` | 仅明星球员 |
| `GET /api/hotels` | 所有酒店（支持 `/region/<r>` 或 `/price/<p>` 筛选） |
| `GET /api/restaurants` | 所有餐厅（支持 `/flavor/<f>` 筛选） |
| `GET /api/events` | 全部 139 条活动（支持 `/category/<c>` 筛选） |
| `GET /api/rankings` | LA 参赛队 FIFA 排名 |
| `GET /api/routes` | 机场→SoFi 交通路线 |
| `GET /api/map-data` | 酒店与地点坐标（地图大头针用） |

---

## 数据库设计

采用星型模型（Star Schema）。ER 图：`database/docs/APAN5310_ER_Diagram_Simplified_v4.drawio.html`

**维度表（Dimension Tables）**

| 表名 | 行数 | 说明 |
|---|---|---|
| `dim_team` | 8 | 参赛队伍——联合会、小组、LA 场次、FIFA 资格状态 |
| `dim_player` | 26 | 球员——位置、俱乐部、年龄、出场数、进球数、是否明星 |
| `dim_place` | 10 | 场馆、机场、交通枢纽（含经纬度） |
| `dim_mode` | 3 | 交通方式：公共交通 · 打车 · 自驾 |
| `dim_event_category` | 23 | 活动分类标签 |

**事实表（Fact Tables）**

| 表名 | 行数 | 说明 |
|---|---|---|
| `fact_match` | 8 | 日期、时间、球队、小组、赛段、场馆 |
| `fact_ticket` | 46 | 看台区域、层级、类别、价格（美元）、余票状态 |
| `fact_hotel` | 21 | 区域、星级、价格档位、坐标 |
| `fact_restaurant` | 32 | 菜系、价格区间、Google 评分 |
| `fact_event` | 139 | 球迷节、体育赛事、演出、Fan Zone |
| `fact_route` | 4 | 机场→SoFi：交通方式、耗时、费用区间 |
| `fact_ranking` | 8 | 数据采集时的 FIFA 排名 |

**详情表（Detail Tables）**

| 表名 | 行数 | 说明 |
|---|---|---|
| `event_experience_detail` | 111 | 建议游玩时长、强度、拍照价值、交通方式、规划标签 |
| `event_sports_detail` | 28 | 运动类型、门票价格、赛事信息 |

所有已清洗 CSV：`database/clean_data/clean_<表名>.csv`

---

## LA 赛程一览

所有比赛地点：**SoFi Stadium** · 1001 S. Stadium Drive, Inglewood, CA 90301

| 场次 | 日期 | 时间（PT） | 对阵 | 赛段 |
|---|---|---|---|---|
| M4 | 2026年6月12日（周五） | 18:00 | 美国 vs 巴拉圭 | 小组赛 D组 |
| M15 | 2026年6月15日（周一） | 18:00 | 伊朗 vs 新西兰 | 小组赛 G组 |
| M26 | 2026年6月18日（周四） | 12:00 | 瑞士 vs UEFA附加赛A | 小组赛 B组 |
| M39 | 2026年6月21日（周日） | 12:00 | 比利时 vs 伊朗 | 小组赛 G组 |
| M59 | 2026年6月25日（周四） | 19:00 | UEFA附加赛C vs 美国 | 小组赛 D组 |
| M73 | 2026年6月28日（周日） | 12:00 | TBD vs TBD | 32强赛 |
| M84 | 2026年7月2日（周四） | 12:00 | TBD vs TBD | 32强赛 |
| M98 | 2026年7月10日（周五） | 12:00 | TBD vs TBD | 四分之一决赛 |

---

## 票价参考

8 场比赛共 46 个票务选项 · 数据来源：`database/clean_data/clean_fact_ticket.csv`

| 类别 | 价格（美元） | 备注 |
|---|---|---|
| VIP 款待票 | $3,000 | Pechanga Founders Club，一层 |
| 一类票 | $450 | 下层边线区（111–115区） |
| 二类票 | ~$200–350 | 中档座位 |
| 三/四类票 | ~$80–150 | 上层区域 |

---

## 交通：机场 → SoFi Stadium

| 出发地 | 交通方式 | 耗时 | 费用 |
|---|---|---|---|
| LAX（洛杉矶国际机场） | 公共交通 | 46 分钟 | $2–4 |
| BUR（伯班克机场） | 公共交通 | 112 分钟 | $12–16 |

---

## 数据来源

| 数据集 | 来源 |
|---|---|
| 比赛赛程 | SoFi Stadium 官网 · losangelesfwc26.com |
| 票价信息 | LA-WC2026-Seat-information.xlsx |
| 酒店与餐厅 | 人工整理 + Google 评论 |
| 活动信息 | discoverlosangeles.com · losangelesfwc26.com · 各场馆官网 |
| FIFA 排名 | FIFA API（失败时使用演示数据，已在 `note` 列标注） |
| 交通路线 | Rome2rio |
| 球员信息 | 公开足球数据库 |
