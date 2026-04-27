// Retry pass 6: Shows + Attractions + Fan Events.
// Replaces non-jpg entries with JPG photos sourced from Wikipedia, plus 1 missing fan event.

import { promises as fs } from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../public/images/places");
const OUT_JSON   = path.resolve(__dirname, "../src/placeImages.json");

const OVERRIDES = {
  // ── Shows (echo) ──
  "the echo live indie show":        "Echo Park, Los Angeles",
  "the echo dj night":               "Echo Park, Los Angeles",

  // ── Attractions (8 non-jpg) ──
  "malibu (zuma/point dume)":        "Zuma Beach",
  "universal studios hollywood":     "Universal Studios Hollywood",
  "disneyland anaheim":              "Sleeping Beauty Castle",
  "warner bros studio tour":         "Warner Bros.",
  "paramount studios":               "Hollywood, Los Angeles",
  "rodeo drive":                     "Rodeo Drive",
  "abbot kinney blvd":               "Venice, Los Angeles",
  "topanga canyon":                  "Topanga State Park",

  // ── Fan Events (9 non-jpg + 1 missing) ──
  "fútbol is life: animated sportraits by lyndon j. barrois, sr.": "Los Angeles County Museum of Art",
  "guelaguetza":                     "Oaxacan cuisine",
  "wirtshaus":                       "Bavarian cuisine",
  "la riot squad (lars)":            "BMO Stadium",
  "the 3253":                        "BMO Stadium",
  "possibly perfect stakes (live racing day)":             "Santa Anita Park",
  "daytona stakes + summertime oaks (live racing day)":    "Santa Anita Park",
  "san juan capistrano stakes (live racing day)":          "Santa Anita Park",
  "socal pro series: los angeles":   "Pickleball",
  "socal pro series: claremont":     "Pickleball",
};

const slugify = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const UA = "LAxWC26-DemoApp/1.0 (https://github.com/Rosemary-Li/LA-WorldCup; non-commercial educational project)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithTimeout(url, ms = 15000, opts = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal, redirect: "follow", headers: { accept: "*/*", ...(opts.headers || {}) } });
  } finally { clearTimeout(id); }
}

async function fetchWikiSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetchWithTimeout(url, 12000, { headers: { "user-agent": UA, accept: "application/json" } });
    if (res.ok) return await res.json();
    if (res.status !== 429) throw new Error(`wiki HTTP ${res.status}`);
    await sleep(1500 * Math.pow(2, attempt - 1));
  }
  throw new Error("wiki HTTP 429 (3 retries)");
}

function isJpg(contentType, url) {
  if (contentType) {
    const t = contentType.toLowerCase();
    if (t.includes("jpeg")) return true;
    if (t.includes("png") || t.includes("webp") || t.includes("svg") || t.includes("avif") || t.includes("gif")) return false;
  }
  try {
    const u = new URL(url);
    return /\.(jpe?g)(?:$|\?)/i.test(u.pathname);
  } catch { return false; }
}

async function downloadImage(imgUrl, outPath) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetchWithTimeout(imgUrl, 20000, { headers: { "user-agent": UA } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 800) throw new Error(`tiny image (${buf.length}B)`);
      await fs.writeFile(outPath, buf);
      return { bytes: buf.length };
    }
    if (res.status !== 429) throw new Error(`HTTP ${res.status}`);
    await sleep(2000 * Math.pow(2, attempt - 1));
  }
  throw new Error("HTTP 429 (4 retries)");
}

async function processWiki(title, slug) {
  const data = await fetchWikiSummary(title);
  const imgUrl = data?.originalimage?.source || data?.thumbnail?.source;
  if (!imgUrl) throw new Error("no image in wiki summary");
  const probe = await fetchWithTimeout(imgUrl, 8000, { method: "HEAD", headers: { "user-agent": UA } }).catch(() => null);
  const ct = probe?.ok ? probe.headers.get("content-type") : null;
  if (!isJpg(ct, imgUrl)) throw new Error(`not a jpg (ct=${ct || "?"})`);
  const outPath = path.join(PUBLIC_DIR, `${slug}.jpg`);
  const { bytes } = await downloadImage(imgUrl, outPath);
  return { bytes, relPath: `images/places/${slug}.jpg` };
}

async function main() {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  let existing = {};
  try { existing = JSON.parse(await fs.readFile(OUT_JSON, "utf8")); } catch {}

  const groups = new Map();
  for (const [name, title] of Object.entries(OVERRIDES)) {
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push(name);
  }
  const items = [...groups.entries()];
  console.log(`Shows/Attractions/Fan Events retry: ${items.length} unique articles for ${Object.keys(OVERRIDES).length} entries...`);

  let i = 0, replaced = 0, added = 0;
  for (const [title, names] of items) {
    i++;
    const slug = slugify(names[0]);
    try {
      const out = await processWiki(title, slug);
      console.log(`  [${i}/${items.length}] ✓ ${slug}.jpg (${(out.bytes / 1024).toFixed(0)}KB) ← ${title}`);
      for (const n of names) {
        if (existing[n]) replaced++; else added++;
        existing[n] = out.relPath;
      }
    } catch (err) {
      console.log(`  [${i}/${items.length}] ✗ ${slug}: ${err.message} ← ${title}`);
    }
    await sleep(600);
  }

  const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(OUT_JSON, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\nMap now has ${Object.keys(sorted).length} entries (+${added} added, ${replaced} replaced) → ${OUT_JSON}`);
}

main().catch((err) => { console.error("FATAL:", err); process.exit(1); });
