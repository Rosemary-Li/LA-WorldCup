// Final retry: only the names still missing after retry pass 1.
// Uses longer sleep (600ms) + corrected Wikipedia titles + on-429 backoff.

import { promises as fs } from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../public/images/places");
const OUT_JSON   = path.resolve(__dirname, "../src/placeImages.json");

// Pass-2 fixes:
//  • Cuisines without an infobox image → swap to a more iconic article.
//  • Troubadour URL was wrong → "Troubadour" then "Troubadour (Los Angeles)" probably exists; use Wikipedia search via REST or the disambiguation-suffix variant.
const OVERRIDES = {
  "night + market weho":              { kind: "wiki", value: "Pad thai" },
  "rosaline":                         { kind: "wiki", value: "Ceviche" },
  "bella pita":                       { kind: "wiki", value: "Pita" },
  "cha cha chicken":                  { kind: "wiki", value: "Jamaican cuisine" },
  "socalo":                           { kind: "wiki", value: "Tacos" },
  "troubadour live concert":          { kind: "wiki", value: "Troubadour" },
  "troubadour indie night":           { kind: "wiki", value: "Troubadour" },
  "the roxy theatre live show":       { kind: "wiki", value: "The Roxy Theatre" },
  "laugh factory comedy night":       { kind: "wiki", value: "Laugh Factory" },
  "hollywood sign":                   { kind: "wiki", value: "Hollywood Sign" },
  "disneyland anaheim":               { kind: "wiki", value: "Disneyland" },
  "warner bros studio tour":          { kind: "wiki", value: "Warner Bros. Studio Tour Hollywood" },
  "downtown la":                      { kind: "wiki", value: "Downtown Los Angeles" },
  "lacma":                            { kind: "wiki", value: "Los Angeles County Museum of Art" },
  "the broad":                        { kind: "wiki", value: "The Broad" },
  "el matador beach":                 { kind: "wiki", value: "Malibu, California" },
  "melrose avenue":                   { kind: "wiki", value: "Melrose Avenue" },
  "griffith park trails":             { kind: "wiki", value: "Griffith Park" },
  "tom's watch bar":                  { kind: "wiki", value: "Sports bar" },
};

const slugify = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const UA_WIKI = "LAxWC26-DemoApp/1.0 (https://github.com/Rosemary-Li/LA-WorldCup; non-commercial educational project)";

async function fetchWithTimeout(url, ms = 12000, opts = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal, redirect: "follow", headers: { accept: "*/*", ...(opts.headers || {}) } });
  } finally { clearTimeout(id); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWikiSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  // Up to 3 attempts on 429, with 1.5s/3s/6s waits.
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetchWithTimeout(url, 12000, {
      headers: { "user-agent": UA_WIKI, accept: "application/json" },
    });
    if (res.ok) return await res.json();
    if (res.status !== 429) throw new Error(`wiki HTTP ${res.status}`);
    const delay = 1500 * Math.pow(2, attempt - 1);
    await sleep(delay);
  }
  throw new Error("wiki HTTP 429 (3 retries)");
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

async function downloadImage(imgUrl, outPath) {
  // Wikimedia Commons CDN throttles binary downloads — retry on 429 with backoff.
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetchWithTimeout(imgUrl, 20000, { headers: { "user-agent": UA_WIKI } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 800) throw new Error(`tiny image (${buf.length}B)`);
      await fs.writeFile(outPath, buf);
      return { bytes: buf.length };
    }
    if (res.status !== 429) throw new Error(`HTTP ${res.status}`);
    await sleep(2000 * Math.pow(2, attempt - 1));   // 2s, 4s, 8s, 16s
  }
  throw new Error("HTTP 429 (4 retries)");
}

async function processWiki(title, slug) {
  const data = await fetchWikiSummary(title);
  const imgUrl = data?.originalimage?.source || data?.thumbnail?.source;
  if (!imgUrl) throw new Error("no image in wiki summary");
  const probe = await fetchWithTimeout(imgUrl, 8000, { method: "HEAD", headers: { "user-agent": UA_WIKI } }).catch(() => null);
  const ct = probe?.ok ? probe.headers.get("content-type") : null;
  const ext = extOf(ct, imgUrl);
  if (ext === "svg") throw new Error("svg (skipped)");
  const outPath = path.join(PUBLIC_DIR, `${slug}.${ext}`);
  const { bytes } = await downloadImage(imgUrl, outPath);
  return { ext, bytes, relPath: `images/places/${slug}.${ext}` };
}

async function main() {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  let existing = {};
  try { existing = JSON.parse(await fs.readFile(OUT_JSON, "utf8")); } catch {}

  const targetToNames = new Map();
  for (const [name, target] of Object.entries(OVERRIDES)) {
    const key = `${target.kind}:${target.value}`;
    if (!targetToNames.has(key)) targetToNames.set(key, { target, names: [] });
    targetToNames.get(key).names.push(name);
  }
  const items = [...targetToNames.values()];
  console.log(`Final retry: ${items.length} unique targets covering ${Object.keys(OVERRIDES).length} names...`);

  let i = 0, added = 0;
  for (const { target, names } of items) {
    i++;
    const slug = slugify(names[0]);
    try {
      const out = await processWiki(target.value, slug);
      console.log(`  [${i}/${items.length}] ✓ ${slug}.${out.ext} (${(out.bytes / 1024).toFixed(0)}KB) ← ${target.value}`);
      for (const n of names) {
        if (!existing[n]) added++;
        existing[n] = out.relPath;
      }
    } catch (err) {
      console.log(`  [${i}/${items.length}] ✗ ${slug}: ${err.message} ← ${target.value}`);
    }
    await sleep(600);
  }

  const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(OUT_JSON, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\nMap now has ${Object.keys(sorted).length} entries (+${added} this pass) → ${OUT_JSON}`);
}

main().catch((err) => { console.error("FATAL:", err); process.exit(1); });
