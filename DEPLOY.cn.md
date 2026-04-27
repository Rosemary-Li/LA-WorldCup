# 部署指南 — Vercel（前端）+ Render（后端）

整个应用跑在云上，本地不需要任何依赖。

> English version: [DEPLOY.md](DEPLOY.md)

```text
            users
              │
              ▼
    ┌─────────────────────────┐         ┌──────────────────────────┐
    │   Vercel (静态托管)      │  ────▶  │ Render (Flask + gunicorn) │
    │   la-worldcup.vercel.app│   API   │   la-worldcup.onrender.com │
    └─────────────────────────┘         └──────────────┬───────────┘
                                                       │
                                                       ▼
                                          ┌────────────────────────┐
                                          │  DigitalOcean Postgres │
                                          └────────────────────────┘
```

前端是 Vite 构建出的静态站点，部署在 Vercel；通过 `VITE_API_BASE` 调用部署在 Render 上的 Flask 后端。后端从 Render 的环境变量读取 PostgreSQL 凭据和可选的 Anthropic / API-Football key。浏览器永远看不到数据库或 API key。

---

## 先决条件

1. 把代码推到 GitHub 仓库。
2. 一个 PostgreSQL 托管实例（DigitalOcean / Neon / Supabase 都可以，只要支持 SSL `sslmode=require`）。按主 README 跑过建表与导入。
3. 免费 Render 账号：https://render.com
4. 免费 Vercel 账号：https://vercel.com
5. *（可选）* Anthropic API key — 启用 AI 赛事故事；没有的话前端会回退到内置硬编码故事。
6. *（可选）* API-Football key（api-sports.io）— 启用实时 H2H 数据；没有的话前端用内置的 `matchMeta.stats` fallback。

---

## 后端部署到 Render

### 方案 A — Blueprint（推荐）

仓库**根目录**带有 [`render.yaml`](render.yaml) Blueprint，Render 会自动读它来创建 web service。

1. Render 控制台 → **New +** → **Blueprint**。
2. 连接 GitHub 仓库。
3. **"Blueprint Path" 字段留空**（默认就是根目录的 `render.yaml`）。不要把 Render 给你的 URL 粘到这里 — 这个字段是仓库内的路径，不是部署 URL。
4. Render 检测到 `render.yaml`。确认服务参数：name `la-worldcup-api`、runtime `python`、root `backend`。
5. 设置 secret 环境变量（这些不会写入 `render.yaml`）：

   | Key | Value |
   |---|---|
   | `DB_HOST` | DigitalOcean Postgres host |
   | `DB_NAME` | 数据库名 |
   | `DB_USER` | 数据库用户名 |
   | `DB_PASSWORD` | 数据库密码 |
   | `ANTHROPIC_API_KEY` | 可选 |
   | `API_FOOTBALL_KEY` | 可选 |

   `DB_PORT=25060`、`DB_SSLMODE=require`、`PYTHON_VERSION=3.12.6` 来自 Blueprint，不用手动填。
6. 点 **Apply**。首次构建需要 3-5 分钟。
7. Render 会给你一个 URL，类似 `https://la-worldcup-api.onrender.com`。复制下来。

自检：

```bash
curl https://la-worldcup-api.onrender.com/api/matches | head -100
```

### 方案 B — 手动 web service

如果不想用 Blueprint：

1. Render 控制台 → **New +** → **Web Service** → 连接仓库。
2. **Root Directory:** `backend`
3. **Runtime:** Python
4. **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
5. **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 60`
6. **Health Check Path:** `/api/matches`
7. 添加和方案 A 一样的环境变量。

### 注意事项

- **免费方案冷启动：** 免费档 15 分钟没访问会休眠，第一个请求可能要 ~30 秒。前端对 `/api/itinerary` 设了 30 秒超时，冷启动时可能超时。要么升级到 Starter（$7/月）保持热机，要么接受首次加载慢。
- **CORS：** `app.py` 里的 `CORS(app)` 默认放开所有来源，作品集 demo 没问题。要锁定到 Vercel 域名，把它换成 `CORS(app, origins=["https://your-app.vercel.app"])`。
- **文件缓存：** `backend/.cache/match_stats.json` 每次部署都会清空（Render 文件系统是临时的）。内存缓存 + 前端的 `matchMeta` fallback 保证 UI 不会受影响。

---

## 前端部署到 Vercel

1. Vercel 控制台 → **Add New** → **Project** → 导入同一个 GitHub 仓库。
2. **Root Directory:** `frontend`（Vercel 会读 [`frontend/vercel.json`](frontend/vercel.json) 拿到其余配置）。
3. Framework：Vite（自动识别；JSON 里也显式锁了）。
4. **Environment Variables** — 加一个：

   | Key | Value |
   |---|---|
   | `VITE_API_BASE` | `https://la-worldcup-api.onrender.com`（结尾不要带 `/`） |

5. 点 **Deploy**。首次构建大约 1 分钟。
6. Vercel 会给你一个 URL，类似 `https://la-worldcup.vercel.app`。打开它。

自检：

- Photo Hero 加载出来。
- 滚到 Matches → 显示比赛（这一步通过证明 Render 后端可达 + CORS OK）。
- 点比赛 → MatchOverlay 显示球队信息。
- 在 Explore LA 触发 Build My Journey → 行程渲染出来。

Matches 一直空白时：

- 打开 DevTools → Network → 看 `api/matches` 和 `api/hotels` 请求。状态码 + 响应体可以告诉你是 CORS 问题、后端 5xx、还是 `VITE_API_BASE` 写错。
- 用 `curl` 直接打 Render URL 排除前端因素。
- 看 Render 日志（Render 控制台 → 服务 → **Logs**）找 traceback。

---

## 上线检查清单

- [ ] Postgres 凭据填在 Render 控制台（不进 git）
- [ ] Vercel 的 `VITE_API_BASE` 指向 Render URL 且结尾无 `/`
- [ ] `backend/.env` 与 `frontend/.env` 都在 `.gitignore`（push 前确认一下）
- [ ] 三个自检都通过：`/api/matches`、`/api/itinerary?...`、Vercel 首页
- [ ] *（可选）* 把 `app.py` 里的 CORS 锁定到 Vercel 域名
- [ ] *（可选）* Render 升级到 Starter 避免冷启动

---

## 后续更新

Vercel 和 Render 都默认在你 push 默认分支后自动重部署（Render 通过 Blueprint 里的 `autoDeploy: true`；Vercel 通过 Git 集成）。push → 两边各自重新构建 → 一两三分钟内上线。

只改前端只会触发 Vercel 重新部署；只改后端只会触发 Render。修改 Render 环境变量也会触发它的重启。
