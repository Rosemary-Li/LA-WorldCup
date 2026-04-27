// Retry pass for entries that failed in scrape-place-images.mjs.
// For Wikipedia targets we use the REST API (page/summary) instead of HTML
// scraping — it serves clean JSON with the canonical originalimage/thumbnail
// and is far less prone to rate-limiting. Other alternates fall back to og:image.

import { promises as fs } from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../public/images/places");
const OUT_JSON   = path.resolve(__dirname, "../src/placeImages.json");

// name → { kind: "wiki" | "url", value }.
// "wiki" → Wikipedia article title (UTF-8, spaces or underscores OK).
// "url"  → fall back to og:image scrape on the given page.
const OVERRIDES = {
  // ── Hotels ──
  "hilton santa monica":              { kind: "wiki", value: "Santa Monica, California" },
  "hampton inn & suites":             { kind: "wiki", value: "Santa Monica Pier" },
  "venice on the beach hotel":        { kind: "wiki", value: "Venice, Los Angeles" },

  // ── Restaurants (no specific Wikipedia page → cuisine/category) ──
  "dialog cafe":                      { kind: "wiki", value: "Coffeehouse" },
  "night + market weho":              { kind: "wiki", value: "Thai cuisine" },
  "katsuya west hollywood":           { kind: "wiki", value: "Sushi" },
  "rosaline":                         { kind: "wiki", value: "Peruvian cuisine" },
  "in-n-out burger":                  { kind: "wiki", value: "In-N-Out Burger" },
  "tsujita la artisan noodle":        { kind: "wiki", value: "Tsukemen" },
  "pomodoro trattoria":               { kind: "wiki", value: "Italian cuisine" },
  "cava":                             { kind: "wiki", value: "Mediterranean cuisine" },
  "cecconi’s west hollywood":         { kind: "wiki", value: "Italian cuisine" },
  "cecconi's west hollywood":         { kind: "wiki", value: "Italian cuisine" },
  "kazunori":                         { kind: "wiki", value: "Hand roll" },
  "daikokuya ramen":                  { kind: "wiki", value: "Tonkotsu ramen" },
  "maccheroni republic":              { kind: "wiki", value: "Pasta" },
  "hiho cheeseburger":                { kind: "wiki", value: "Cheeseburger" },
  "cabra la":                         { kind: "wiki", value: "Peruvian cuisine" },
  "bella pita":                       { kind: "wiki", value: "Pita" },
  "cha cha chicken":                  { kind: "wiki", value: "Caribbean cuisine" },
  "socalo":                           { kind: "wiki", value: "Mexican cuisine" },

  // ── Shows ──
  "the comedy store stand-up":        { kind: "wiki", value: "The Comedy Store" },
  "comedy store late night":          { kind: "wiki", value: "The Comedy Store" },
  "troubadour live concert":          { kind: "wiki", value: "Troubadour (Los Angeles)" },
  "troubadour indie night":           { kind: "wiki", value: "Troubadour (Los Angeles)" },
  "the roxy theatre live show":       { kind: "wiki", value: "The Roxy Theatre" },
  "laugh factory comedy night":       { kind: "wiki", value: "Laugh Factory" },
  "cinespia outdoor movie":           { kind: "wiki", value: "Hollywood Forever Cemetery" },

  // ── Attractions ──
  "santa monica":                     { kind: "wiki", value: "Santa Monica, California" },
  "hollywood sign":                   { kind: "wiki", value: "Hollywood Sign" },
  "disneyland anaheim":               { kind: "wiki", value: "Disneyland" },
  "warner bros studio tour":          { kind: "wiki", value: "Warner Bros. Studio Tour Hollywood" },
  "paramount studios":                { kind: "wiki", value: "Paramount Pictures" },
  "downtown la":                      { kind: "wiki", value: "Downtown Los Angeles" },
  "lacma":                            { kind: "wiki", value: "Los Angeles County Museum of Art" },
  "the broad":                        { kind: "wiki", value: "The Broad" },
  "el matador beach":                 { kind: "wiki", value: "Malibu, California" },
  "melrose avenue":                   { kind: "wiki", value: "Melrose Avenue" },
  "griffith park trails":             { kind: "wiki", value: "Griffith Park" },

  // ── Fan events ──
  "game on! science, sports & play":  { kind: "wiki", value: "California Science Center" },
  "ye olde king's head":              { kind: "wiki", value: "Santa Monica, California" },
  "tom's watch bar":                  { kind: "wiki", value: "Sports bar" },
  "la riot squad (lars)":             { kind: "wiki", value: "Los Angeles FC" },
};

// ── Helpers ──────────────────────────────────────────────────────────────

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

// Wikipedia's policy requires a UA that identifies the project + contact.
const UA_WIKI    = "LAxWC26-DemoApp/1.0 (https://github.com/Rosemary-Li/LA-WorldCup; non-commercial educational project)";
const UA_GENERIC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function fetchWithTimeout(url, ms = 12000, opts = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      ...opts,
      signal: ctrl.signal,
      redirect: "follow",
      headers: { accept: "*/*", ...(opts.headers || {}) },
    });
  } finally {
    clearTimeout(id);
  }
}

function extOf(contentType, fallbackUrl) {
  if (contentType) {
    const t = contentType.toLowerCase();
    if (t.includes("jpeg")) return "jpg";
    if (t.includes("png"))  return "png";
    if (t.includes("webp")) return "webp";
    if (t.includes("avif")) return "avif";
    if (t.includes("gif"))  return "gif";
    if (t.includes("svg"))  return "svg";
  }
  try {
    const u = new URL(fallbackUrl);
    const m = u.pathname.match(/\.([a-z0-9]{2,5})(?:$|\?)/i);
    if (m) return m[1].toLowerCase();
  } catch {}
  return "jpg";
}

async function downloadImage(imgUrl, outPath, ua) {
  const res = await fetchWithTimeout(imgUrl, 15000, { headers: { "user-agent": ua } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 800) throw new Error(`tiny image (${buf.length}B)`);
  await fs.writeFile(outPath, buf);
  return { bytes: buf.length };
}

// Wikipedia REST: returns JSON with originalimage.source (full) or thumbnail.source.
async function processWiki(title, slug) {
  const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  const res = await fetchWithTimeout(apiUrl, 12000, {
    headers: { "user-agent": UA_WIKI, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`wiki HTTP ${res.status}`);
  const data = await res.json();
  const imgUrl = data?.originalimage?.source || data?.thumbnail?.source;
  if (!imgUrl) throw new Error("no image in wiki summary");

  // For the actual binary download, browsers/Wikimedia require a sane UA but allow generic UAs.
  const probe = await fetchWithTimeout(imgUrl, 8000, {
    method: "HEAD",
    headers: { "user-agent": UA_WIKI },
  }).catch(() => null);
  const ct = probe?.ok ? probe.headers.get("content-type") : null;
  const ext = extOf(ct, imgUrl);
  if (ext === "svg") throw new Error("svg (skipped)");

  const outPath = path.join(PUBLIC_DIR, `${slug}.${ext}`);
  const { bytes } = await downloadImage(imgUrl, outPath, UA_WIKI);
  return { ext, bytes, relPath: `images/places/${slug}.${ext}` };
}

// (kept for url-style overrides if any are added later)
function extractOgImage(html, baseUrl) {
  const patterns = [
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image:src["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) {
      try { return new URL(m[1], baseUrl).toString(); } catch {}
    }
  }
  return null;
}

async function processUrl(url, slug) {
  const htmlRes = await fetchWithTimeout(url, 12000, { headers: { "user-agent": UA_GENERIC } });
  if (!htmlRes.ok) throw new Error(`page HTTP ${htmlRes.status}`);
  const html = await htmlRes.text();
  const ogUrl = extractOgImage(html, url);
  if (!ogUrl) throw new Error("no og:image");
  const probe = await fetchWithTimeout(ogUrl, 8000, { method: "HEAD", headers: { "user-agent": UA_GENERIC } }).catch(() => null);
  const ct = probe?.ok ? probe.headers.get("content-type") : null;
  const ext = extOf(ct, ogUrl);
  if (ext === "svg") throw new Error("svg (skipped)");
  const outPath = path.join(PUBLIC_DIR, `${slug}.${ext}`);
  const { bytes } = await downloadImage(ogUrl, outPath, UA_GENERIC);
  return { ext, bytes, relPath: `images/places/${slug}.${ext}` };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  let existing = {};
  try {
    existing = JSON.parse(await fs.readFile(OUT_JSON, "utf8"));
  } catch {
    console.warn(`(${OUT_JSON} not found — starting empty)`);
  }

  // Group by override target to dedupe (multiple names → same Wikipedia article).
  const targetToNames = new Map();
  for (const [name, target] of Object.entries(OVERRIDES)) {
    const key = `${target.kind}:${target.value}`;
    if (!targetToNames.has(key)) targetToNames.set(key, { target, names: [] });
    targetToNames.get(key).names.push(name);
  }
  const items = [...targetToNames.values()];
  console.log(`Retry: ${items.length} unique alternates covering ${Object.keys(OVERRIDES).length} names...`);

  // Run sequentially to be polite to Wikipedia (avoids 429).
  let i = 0;
  for (const { target, names } of items) {
    i++;
    const slug = slugify(names[0]);
    try {
      const out = target.kind === "wiki"
        ? await processWiki(target.value, slug)
        : await processUrl(target.value, slug);
      console.log(`  [${i}/${items.length}] ✓ ${slug}.${out.ext} (${(out.bytes / 1024).toFixed(0)}KB) ← ${target.kind}:${target.value}`);
      for (const n of names) existing[n] = out.relPath;
    } catch (err) {
      console.log(`  [${i}/${items.length}] ✗ ${slug}: ${err.message} ← ${target.kind}:${target.value}`);
    }
    // Small pause between requests
    await sleep(150);
  }

  const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(OUT_JSON, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\nMap now has ${Object.keys(sorted).length} entries → ${OUT_JSON}`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
