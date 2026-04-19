# LA × FIFA 世界杯 2026™ — 老好莱坞出品

以老好莱坞电影风格呈现的 2026 FIFA 世界杯洛杉矶赛区旅行导览，涵盖 SQL 数据库设计与纯静态前端网站。学术课程项目（APAN5310）。

> **Also available in:** [English README](README.md)

---

## 项目简介

本项目完整覆盖了从原始数据 → 清洗后 CSV → 关系型数据库设计 → 前端网站的全流程。面向计划前往英格尔伍德 SoFi Stadium 观赛的球迷（2026 年 6–7 月），帮助用户查询赛程、购票参考、预订酒店、发现餐厅、规划一日行程。

**当前状态：** 数据库设计和数据层已完成。前端仍在开发中——目前 UI 使用硬编码数据，尚未接入数据库。

---

## 目录结构

```
LA_WorldCup/
├── front_end/                          # 静态网站（开发中）
│   ├── index.html
│   ├── css/styles.css
│   ├── js/
│   │   ├── data.js                     # 硬编码数据（待替换为数据库接口）
│   │   ├── matches.js / itinerary.js / explore.js / app.js
│   └── sections/                       # 各页面区块（JS 注入 HTML）
│       └── nav / hero / matches / overlay / showcase /
│           itinerary / explore / discover / about / footer
│
├── 2026SP_SQL_LA_World_Cup_sharedoc/   # 数据库项目文件夹
│   ├── clean_data/                     # 清洗后 CSV（可直接导入）
│   ├── data_cleaning_report/           # 数据清洗说明文档
│   ├── APAN5310_ER_Diagram_Simplified_v4.drawio(.html)   # ER 图
│   ├── LA-WC2026-Seat-information.xlsx
│   ├── LA_Hollywood_Events_Matched_Format.xlsx
│   ├── LA_World_Cup_Events.xlsx
│   ├── LA_World_Cup_Hotel_Restaurant.xlsx
│   └── la_world_cup_data_Games&Players.xlsx
│
├── data/                               # 其他原始数据（Excel）
│   ├── LA World Cup Soccer Events.xlsx
│   ├── LA_WC2026_other_sports_events.xlsx
│   └── la_attractions_database.xlsx
│
└── la_worldcup_oldhollywood.html       # 早期单文件原型稿
```

---

## 数据库设计

### 实体关系模型

采用星型模型（Star Schema），包含维度表和事实表。ER 图位于：`2026SP_SQL_LA_World_Cup_sharedoc/APAN5310_ER_Diagram_Simplified_v4.drawio.html`

### 数据表总览

**维度表（Dimension Tables）**

| 表名 | 行数 | 说明 |
|---|---|---|
| `dim_team` | 8 | 参与 LA 赛区的球队，含联合会、小组、LA 场次、FIFA 资格状态 |
| `dim_player` | 26 | 各队明星球员，含位置、效力俱乐部、年龄、出场数、进球数 |
| `dim_place` | 10 | 场馆、机场及交通枢纽（含经纬度） |
| `dim_mode` | 3 | 交通方式：公共交通、打车、自驾 |
| `dim_event_category` | 23 | 活动分类标签（球迷节、Fan Zone、MLB、网球等） |

**事实表（Fact Tables）**

| 表名 | 行数 | 说明 |
|---|---|---|
| `fact_match` | 8 | LA 全部 8 场比赛，含日期、时间、球队、小组、赛段、场馆 |
| `fact_ticket` | 46 | 每场比赛的票务选项，含区域、层级、类别、价格（美元）、余票状态 |
| `fact_hotel` | 21 | 酒店信息，含区域、地址、星级、房间数、价格档位、坐标 |
| `fact_restaurant` | 32 | 餐厅信息，含区域、菜系、价格区间、Google 评分 |
| `fact_event` | 139 | 全部活动：球迷节、体育赛事（MLB/NBA/网球等）、演出、Fan Zone |
| `fact_route` | 4 | 机场到 SoFi 的路线，含交通方式、耗时（分钟）、费用区间 |
| `fact_ranking` | 8 | 数据采集时 LA 参赛队的 FIFA 排名 |

**详情表（Detail Tables）**

| 表名 | 行数 | 说明 |
|---|---|---|
| `event_experience_detail` | 111 | 体验类活动的丰富属性：建议游玩时长、强度、拍照价值、交通方式、规划标签 |
| `event_sports_detail` | 28 | 体育赛事专属字段：运动类型、门票价格、赛事信息 |

### 清洗后数据（CSV）

所有已清洗、可直接导入的 CSV 文件位于 `2026SP_SQL_LA_World_Cup_sharedoc/clean_data/`，命名规则：`clean_<表名>.csv`。

---

## LA 赛程一览

所有比赛地点：**SoFi Stadium**，1001 S. Stadium Drive, Inglewood, CA 90301。

| 场次 | 日期 | 时间（PT） | 对阵 | 赛段 |
|---|---|---|---|---|
| M4 | 2026年6月12日（周五） | 18:00 | 美国 vs 巴拉圭 | 小组赛 D组 |
| M15 | 2026年6月15日（周一） | 18:00 | 伊朗 vs 新西兰 | 小组赛 G组 |
| M26 | 2026年6月18日（周四） | 12:00 | 瑞士 vs UEFA附加赛A | 小组赛 B组 |
| M39 | 2026年6月21日（周日） | 12:00 | 比利时 vs 伊朗 | 小组赛 G组 |
| M59 | 2026年6月25日（周四） | 19:00 | UEFA附加赛C vs 美国 | 小组赛 D组 |
| M73 | 2026年6月28日（周日） | 12:00 | TBD vs TBD | 32强 |
| M84 | 2026年7月2日（周四） | 12:00 | TBD vs TBD | 32强 |
| M98 | 2026年7月10日（周五） | 12:00 | TBD vs TBD | 四分之一决赛 |

---

## 票价参考

数据来源：`clean_fact_ticket.csv`（8场比赛共 46 个票务选项）

| 类别 | 价格（美元） | 备注 |
|---|---|---|
| VIP 款待票 | $3,000 | Pechanga Founders Club，一层 |
| 一类票 | $450 | 下层边线区（111–115区） |
| 二类票 | ~$200–350 | 中档座位 |
| 三/四类票 | ~$80–150 | 上层区域 |

---

## 交通：机场 → SoFi Stadium

数据来源：`clean_fact_route.csv`

| 出发地 | 交通方式 | 耗时 | 费用 |
|---|---|---|---|
| LAX（洛杉矶国际机场） | 公共交通 | 46 分钟 | $2–4 |
| BUR（伯班克机场） | 公共交通 | 112 分钟 | $12–16 |

---

## 前端网站（开发中）

纯静态网站，无框架，无构建步骤。

**当前状态：** 所有页面区块通过 `sections/*.js` 将 HTML 注入 `index.html` 中的挂载点。数据目前硬编码在 `js/data.js`（为完整数据库的子集）。

**规划中：** 通过 API 层接入完整数据库，支持动态筛选、票务余量查询，以及 139 条活动数据的完整呈现。

### 本地运行

```bash
cd front_end
python3 -m http.server 8080
# 访问 http://localhost:8080
```

### 技术栈

- 纯 HTML / CSS / JavaScript — 无框架，零依赖
- 字体：Playfair Display、IM Fell English、Cormorant Garamond、DM Mono（Google Fonts）
- `IntersectionObserver` 触发滚动淡入动效
- 放映机开场动画（当前已注释禁用，可在 `app.js` 中重新启用）

---

## 数据来源

| 数据集 | 来源 |
|---|---|
| 比赛赛程 | SoFi Stadium 官网、losangelesfwc26.com |
| 票价信息 | LA-WC2026-Seat-information.xlsx |
| 酒店与餐厅 | 人工整理 + Google 评论 |
| 活动信息 | discoverlosangeles.com、losangelesfwc26.com、各场馆官网 |
| FIFA 排名 | FIFA API（失败时使用演示数据，已在 `note` 列标注） |
| 交通路线 | Rome2rio |
| 球员信息 | 公开足球数据库 |
