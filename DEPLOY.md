# Deployment Guide — Vercel (frontend) + Render (backend)

End-to-end setup so the app runs entirely in the cloud, no local dependencies.

> 中文版：[DEPLOY.cn.md](DEPLOY.cn.md)

```text
            users
              │
              ▼
    ┌─────────────────────────┐         ┌──────────────────────────┐
    │   Vercel (static)       │  ────▶  │   Render (Flask + gunicorn) │
    │   la-worldcup.vercel.app│   API   │   la-worldcup.onrender.com │
    └─────────────────────────┘         └──────────────┬───────────┘
                                                       │
                                                       ▼
                                          ┌────────────────────────┐
                                          │  DigitalOcean Postgres │
                                          └────────────────────────┘
```

The frontend is a static Vite build hosted on Vercel. It calls the Flask backend on Render via `VITE_API_BASE`. The backend reads PostgreSQL credentials and optional Anthropic / API-Football keys from Render env vars. Browsers never see DB or API keys.

---

## Prerequisites

1. A GitHub repo with this codebase pushed.
2. A managed PostgreSQL instance (DigitalOcean / Neon / Supabase — anything reachable over SSL with `sslmode=require`). Run the schema + import as documented in the main README.
3. Free Render account: https://render.com
4. Free Vercel account: https://vercel.com
5. *(Optional)* Anthropic API key — enables AI match stories. Without it, the frontend falls back to bundled story data.
6. *(Optional)* API-Football key (api-sports.io) — enables live H2H stats. Without it, the frontend uses the bundled `matchMeta.stats` fallback.

---

## Backend on Render

### Option A — Blueprint (recommended)

The repo ships a [`render.yaml`](render.yaml) Blueprint at the **repo root**. Render reads it and creates the web service for you.

1. Render dashboard → **New +** → **Blueprint**.
2. Connect the GitHub repo.
3. **Leave the "Blueprint Path" field blank** (default = `render.yaml` at the root). Don't paste the Render URL here — that's a common mistake; the field expects a path inside your repo.
4. Render detects `render.yaml`. Confirm the service: name `la-worldcup-api`, runtime `python`, root `backend`.
5. Set the secret env vars (Render won't store them in `render.yaml`):

   | Key | Value |
   |---|---|
   | `DB_HOST` | DigitalOcean Postgres host |
   | `DB_NAME` | DB name |
   | `DB_USER` | DB user |
   | `DB_PASSWORD` | DB password |
   | `ANTHROPIC_API_KEY` | optional |
   | `API_FOOTBALL_KEY` | optional |

   `DB_PORT=25060`, `DB_SSLMODE=require`, and `PYTHON_VERSION=3.12.6` come from the Blueprint and don't need to be entered.
6. Click **Apply**. First build takes 3-5 min.
7. Render gives you a URL like `https://la-worldcup-api.onrender.com`. Copy it.

Smoke test:

```bash
curl https://la-worldcup-api.onrender.com/api/matches | head -100
```

### Option B — Manual web service

If you prefer not to use the Blueprint:

1. Render dashboard → **New +** → **Web Service** → connect the repo.
2. **Root Directory:** `backend`
3. **Runtime:** Python
4. **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
5. **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 60`
6. **Health Check Path:** `/api/matches`
7. Add the same env vars as in Option A.

### Notes

- **Free plan cold start:** the free tier sleeps after 15 min of inactivity, so the first request can take ~30 s. The frontend has a 30 s timeout on `/api/itinerary`, but on cold start the load may exceed it. Upgrade to Starter ($7/mo) to keep it warm, or accept the first-load latency.
- **CORS:** `CORS(app)` in `app.py` is open by default (any origin). Fine for a portfolio demo. To restrict to your Vercel domain, replace with `CORS(app, origins=["https://your-app.vercel.app"])`.
- **File cache:** `backend/.cache/match_stats.json` is wiped on each deploy (Render filesystems are ephemeral). The in-memory cache + frontend `matchMeta` fallback keep the UI working.

---

## Frontend on Vercel

1. Vercel dashboard → **Add New** → **Project** → import the same GitHub repo.
2. **Root Directory:** `frontend` (Vercel will read [`frontend/vercel.json`](frontend/vercel.json) for the rest).
3. Framework: Vite (auto-detected; the JSON also pins it explicitly).
4. **Environment Variables** — add one:

   | Key | Value |
   |---|---|
   | `VITE_API_BASE` | `https://la-worldcup-api.onrender.com` (no trailing slash) |

5. Click **Deploy**. First build is ~1 min.
6. Vercel gives you a URL like `https://la-worldcup.vercel.app`. Open it.

Smoke test:

- The Photo Hero loads.
- Scroll → Matches loads (this confirms the Render backend is reachable + CORS is OK).
- Click a match → MatchOverlay opens with team data.
- Build a journey from Explore LA → itinerary renders.

If Matches stays empty:

- Open DevTools → Network → look for `api/matches` and `api/hotels` requests. The status + response body tells you whether it's a CORS issue, a backend 5xx, or `VITE_API_BASE` is wrong.
- Run the smoke test against the Render URL with `curl` to isolate.
- Check Render logs (Render dashboard → service → **Logs**) for tracebacks.

---

## Production checklist

- [ ] Postgres credentials in Render dashboard (not in git)
- [ ] `VITE_API_BASE` in Vercel env vars points at the Render URL with no trailing slash
- [ ] `backend/.env` and `frontend/.env` are in `.gitignore` (verify before pushing)
- [ ] Smoke test all three: `/api/matches`, `/api/itinerary?...`, the Vercel home page
- [ ] *(Optional)* Tighten CORS in `app.py` to the Vercel domain
- [ ] *(Optional)* Upgrade Render to Starter to avoid cold starts

---

## Updating

Both Vercel and Render auto-deploy on push to the default branch (Render via `autoDeploy: true` in the Blueprint; Vercel via its Git integration). Push → both services rebuild → live in ~1-3 min each.

Frontend-only changes only redeploy Vercel. Backend-only changes only redeploy Render. Render's free instance also redeploys when env vars change.
