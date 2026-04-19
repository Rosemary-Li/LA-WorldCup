# LA × FIFA 世界杯 2026™ — 老好莱坞出品

以老好莱坞电影风格呈现的 2026 FIFA 世界杯洛杉矶赛区旅行导览。完整的全栈 Web 应用，包含规范化 PostgreSQL 数据库、Flask REST API 与纯静态前端网站。学术课程项目（APAN5310）。

> **Also available in:** [English README](README.md)

---

## 项目简介

本项目完整覆盖了从原始数据 → 清洗后 CSV → 关系型数据库 → REST API → 前端网站的全栈流程。面向计划前往英格尔伍德 SoFi Stadium 观赛的球迷（2026 年 6–7 月），帮助用户查询赛程、票价参考、预订酒店、发现餐厅、规划一日行程。

**技术栈：**
- **数据库：** PostgreSQL（托管于 DigitalOcean）
- **后端：** Python / Flask REST API（`psycopg2`、`flask-cors`）
- **前端：** 纯 HTML / CSS / JavaScript，无框架，零构建步骤

**当前状态：** 三层架构全部完成并已联通。前端启动时从 Flask API 加载真实数据库数据，API 不可用时自动回退到硬编码备用数据。

---

## 目录结构

```
LA_WorldCup/
├── backend/                            # Python / Flask API 服务
│   ├── app.py                          # Flask 路由（/api/matches、/api/hotels 等）
│   ├── queries.py                      # SQL 查询函数（psycopg2）
│   └── setup_database.py              # 一次性数据库初始化：建表 + CSV 导入
│
├── frontend/                           # 静态网站（纯 HTML/CSS/JS）
│   ├── index.html                      # 入口页面——各区块挂载点
│   ├── css/styles.css
│   ├── js/
│   │   ├── api.js                      # 请求 Flask API，覆盖 data.js 中的硬编码数据
│   │   ├── data.js                     # 硬编码备用数据（API 失败时使用）
│   │   ├── matches.js                  # 比赛详情 overlay 逻辑
│   │   ├── itinerary.js               # 行程生成器
│   │   ├── explore.js                  # 地图筛选逻辑
│   │   └── app.js                      # 放映机动画、标签卡片、滚动动效
│   └── sections/                       # 各页面区块（JS 注入 HTML 至挂载点）
│       └── nav / hero / matches / overlay / showcase /
│           itinerary / explore / discover / about / footer
│
├── database/                           # 所有数据资产
│   ├── raw_data/                       # 原始 Excel + CSV 数据文件
│   ├── clean_data/                     # 清洗后可直接导入的 CSV（clean_*.csv）
│   └── docs/                           # ER 图 + 数据清洗说明文档
│
├── archive/                            # 早期单文件原型
│   └── la_worldcup_oldhollywood.html
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
# API 运行于 http://127.0.0.1:5000

# 终端 2 — 启动前端
cd frontend
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

**依赖安装**（仅需一次）：
```bash
pip install flask flask-cors psycopg2-binary pandas
```

---

## API 接口一览

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/matches` | 所有 8 场 LA 比赛 |
| GET | `/api/matches/<场次号>` | 单场比赛详情 |
| GET | `/api/tickets` | 所有票务选项 |
| GET | `/api/tickets/<场次号>` | 某场比赛的票务 |
| GET | `/api/teams` | 所有 LA 参赛队伍 |
| GET | `/api/players` | 所有球员 |
| GET | `/api/players/stars` | 仅明星球员 |
| GET | `/api/hotels` | 所有酒店 |
| GET | `/api/restaurants` | 所有餐厅 |
| GET | `/api/events` | 所有活动 |
| GET | `/api/rankings` | FIFA 排名 |
| GET | `/api/routes` | 机场→SoFi 交通路线 |
| GET | `/api/map-data` | 地图大头针坐标数据 |

---

## 数据库设计

### 实体关系模型

采用星型模型（Star Schema），包含维度表和事实表。ER 图位于：`database/docs/APAN5310_ER_Diagram_Simplified_v4.drawio.html`

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
| `fact_hotel` | 21 | 酒店信息，含区域、地址、星级、价格档位、坐标 |
| `fact_restaurant` | 32 | 餐厅信息，含区域、菜系、价格区间、Google 评分 |
| `fact_event` | 139 | 全部活动：球迷节、体育赛事（MLB/NBA/网球等）、演出、Fan Zone |
| `fact_route` | 4 | 机场到 SoFi 的路线，含交通方式、耗时（分钟）、费用区间 |
| `fact_ranking` | 8 | 数据采集时 LA 参赛队的 FIFA 排名 |

**详情表（Detail Tables）**

| 表名 | 行数 | 说明 |
|---|---|---|
| `event_experience_detail` | 111 | 体验类活动的丰富属性：建议游玩时长、强度、拍照价值、交通方式、规划标签 |
| `event_sports_detail` | 28 | 体育赛事专属字段：运动类型、门票价格、赛事信息 |

所有已清洗可直接导入的 CSV 文件位于 `database/clean_data/`，命名规则：`clean_<表名>.csv`。

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
| M73 | 2026年6月28日（周日） | 12:00 | TBD vs TBD | 32强赛 |
| M84 | 2026年7月2日（周四） | 12:00 | TBD vs TBD | 32强赛 |
| M98 | 2026年7月10日（周五） | 12:00 | TBD vs TBD | 四分之一决赛 |

---

## 票价参考

8场比赛共 46 个票务选项（数据来源：`database/clean_data/clean_fact_ticket.csv`）：

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
| 比赛赛程 | SoFi Stadium 官网、losangelesfwc26.com |
| 票价信息 | LA-WC2026-Seat-information.xlsx |
| 酒店与餐厅 | 人工整理 + Google 评论 |
| 活动信息 | discoverlosangeles.com、losangelesfwc26.com、各场馆官网 |
| FIFA 排名 | FIFA API（失败时使用演示数据，已在 `note` 列标注） |
| 交通路线 | Rome2rio |
| 球员信息 | 公开足球数据库 |
