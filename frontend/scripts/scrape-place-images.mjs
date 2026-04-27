// One-shot scraper: fetch each official URL, extract og:image, download locally.
// Run from repo root: node frontend/scripts/scrape-place-images.mjs
//
// Output:
//   frontend/public/images/places/{slug}.{ext}     ← downloaded images
//   frontend/src/placeImages.json                  ← { "<place name lowercase>": "images/places/{slug}.ext" }
//
// Strategy:
//   1. Group entries by URL so duplicate URLs (e.g. Hollywood Bowl × 3) only fetch once.
//   2. For each unique URL: fetch HTML → og:image (or twitter:image) → download.
//   3. Skip + log any failures; placeMedia.js will fall back to its existing screenshot service.

import { promises as fs } from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../public/images/places");
const OUT_JSON   = path.resolve(__dirname, "../src/placeImages.json");

const PLACE_URLS = {
  "the west hollywood edition": "https://www.editionhotels.com/weho/",
  "petit ermitage": "https://www.petitermitage.com/",
  "andaz west hollywood": "https://www.hyatt.com/andaz/laxss-andaz-west-hollywood",
  "best western plus sunset plaza": "https://www.bestwestern.com/",
  "ramada plaza by wyndham": "https://www.wyndhamhotels.com/ramada/west-hollywood-california/ramada-plaza-west-hollywood-hotel-and-suites/overview",
  "w los angeles - west beverly": "https://www.marriott.com/en-us/hotels/laxwb-w-los-angeles-west-beverly-hills/overview/",
  "plaza la reina": "https://www.plazalareina.com/",
  "kimpton hotel palomar": "https://www.ihg.com/kimptonhotels/hotels/us/en/hotel-palomar-beverly-hills-ca/laxww/hoteldetail",
  "holiday inn express west la": "https://www.ihg.com/holidayinnexpress/hotels/us/en/los-angeles/laxwl/hoteldetail",
  "royal palace westwood hotel": "https://www.royalpalacewestwood.com/",
  "the ritz-carlton, dtla": "https://www.ritzcarlton.com/en/hotels/laxlz-the-ritz-carlton-los-angeles/overview/",
  "the ritz-carlton, los angeles": "https://www.ritzcarlton.com/en/hotels/laxlz-the-ritz-carlton-los-angeles/overview/",
  "hotel figueroa": "https://www.hotelfigueroa.com/",
  "courtyard l.a. live": "https://www.marriott.com/en-us/hotels/laxcy-courtyard-los-angeles-l-a-live/overview/",
  "moxy downtown los angeles": "https://www.marriott.com/en-us/hotels/laxox-moxy-downtown-los-angeles/overview/",
  "freehand los angeles": "https://freehandhotels.com/los-angeles/",
  "shutters on the beach": "https://www.shuttersonthebeach.com/",
  "hotel erwin": "https://www.hotelerwin.com/",
  "hilton santa monica": "https://www.hilton.com/en/hotels/smopchh-hilton-santa-monica-hotel-and-suites/",
  "hampton inn & suites": "https://www.hilton.com/en/hotels/laxsmhx-hampton-suites-santa-monica/",
  "venice on the beach hotel": "https://www.veniceonthebeachhotel.com/",
  "norah": "https://www.norahrestaurant.com/",
  "dialog cafe": "https://www.dialogcafe.la/",
  "night + market weho": "https://www.nightmarketla.com/",
  "katsuya west hollywood": "https://www.katsuyarestaurant.com/",
  "rosaline": "https://www.rosalinela.com/",
  "gracias madre": "https://www.graciasmadre.com/",
  "cecconi’s west hollywood": "https://www.cecconiswesthollywood.com/",
  "cecconi's west hollywood": "https://www.cecconiswesthollywood.com/",
  "zinqué": "https://www.lezinque.com/",
  "zinque": "https://www.lezinque.com/",
  "the boiling crab": "https://theboilingcrab.com/",
  "in-n-out burger": "https://www.in-n-out.com/",
  "kazunori": "https://www.kazunorisushi.com/",
  "tsujita la artisan noodle": "https://www.tsujita.com/",
  "bella pita": "https://www.bellapita.com/",
  "cava": "https://cava.com/",
  "pomodoro trattoria": "https://www.pomodorotrattoria.com/",
  "le pain quotidien": "https://www.lepainquotidien.com/",
  "philippe the original": "https://www.philippes.com/",
  "eggslut": "https://www.eggslut.com/",
  "daikokuya ramen": "https://www.daikoku-ten.com/",
  "marugame monzo": "https://www.marugamemonzo.com/",
  "cabra la": "https://thehoxton.com/downtown-la/cabra/",
  "holbox": "https://www.holboxla.com/",
  "maccheroni republic": "https://www.maccheronirepublic.com/",
  "kendall’s brasserie": "https://www.patinagroup.com/kendalls-brasserie",
  "kendall's brasserie": "https://www.patinagroup.com/kendalls-brasserie",
  "hiho cheeseburger": "https://www.hiho.la/",
  "blue plate taco": "https://www.blueplatetaco.com/",
  "hae jang chon": "https://www.haejangchon.com/",
  "tatsu ramen": "https://www.tatsuramen.com/",
  "socalo": "https://www.socalo.com/",
  "cha cha chicken": "https://www.chachachicken.com/",
  "forma restaurant & cheese bar": "https://www.formarestaurant.com/",
  "pasjoli": "https://www.pasjoli.com/",
  "hollywood bowl orchestra night": "https://www.hollywoodbowl.com/",
  "hollywood bowl jazz night": "https://www.hollywoodbowl.com/",
  "hollywood bowl guest artist night": "https://www.hollywoodbowl.com/",
  "hollywood improv stand-up show": "https://improv.com/hollywood/",
  "hollywood improv late show": "https://improv.com/hollywood/",
  "cinespia outdoor movie": "https://cinespia.org/",
  "the echo live indie show": "https://www.theecho.com/",
  "the echo dj night": "https://www.theecho.com/",
  "the comedy store stand-up": "https://thecomedystore.com/",
  "comedy store late night": "https://thecomedystore.com/",
  "troubadour live concert": "https://troubadour.com/",
  "troubadour indie night": "https://troubadour.com/",
  "the roxy theatre live show": "https://www.theroxy.com/",
  "laugh factory comedy night": "https://www.laughfactory.com/hollywood",
  "santa monica": "https://www.santamonica.com/",
  "venice beach": "https://www.visitveniceca.com/",
  "malibu (zuma/point dume)": "https://beaches.lacounty.gov/zuma-beach/",
  "laguna beach": "https://www.visitlagunabeach.com/",
  "huntington beach": "https://www.surfcityusa.com/",
  "hollywood sign": "https://www.hollywoodsign.org/",
  "walk of fame": "https://walkoffame.com/",
  "griffith observatory": "https://griffithobservatory.org/",
  "downtown la": "https://www.discoverlosangeles.com/things-to-do/downtown-los-angeles",
  "universal studios hollywood": "https://www.universalstudioshollywood.com/",
  "disneyland anaheim": "https://disneyland.disney.go.com/",
  "warner bros studio tour": "https://www.wbstudiotour.com/",
  "paramount studios": "https://www.paramountstudiotour.com/",
  "getty center": "https://www.getty.edu/visit/center/",
  "lacma": "https://www.lacma.org/",
  "the broad": "https://www.thebroad.org/",
  "getty villa": "https://www.getty.edu/visit/villa/",
  "rodeo drive": "https://rodeodrive-bh.com/",
  "the grove": "https://thegrovela.com/",
  "abbot kinney blvd": "https://www.abbotkinneyblvd.com/",
  "melrose avenue": "https://www.discoverlosangeles.com/things-to-do/the-guide-to-melrose-avenue",
  "runyon canyon": "https://www.laparks.org/park/runyon-canyon",
  "griffith park trails": "https://www.laparks.org/griffithpark/",
  "el matador beach": "https://beaches.lacounty.gov/el-matador-beach/",
  "topanga canyon": "https://www.parks.ca.gov/?page_id=629",
  "game on! science, sports & play": "https://californiasciencecenter.org/",
  "fútbol is life: animated sportraits by lyndon j. barrois, sr.": "https://www.lacma.org/",
  "lights, camera, goal!!!: community free day at the academy museum": "https://www.academymuseum.org/",
  "ye olde king's head": "https://www.yeoldekingshead.com/",
  "tom's watch bar": "https://tomswatchbar.com/",
  "guelaguetza": "https://www.ilovemole.com/",
  "wirtshaus": "https://www.wirtshausla.com/",
  "la riot squad (lars)": "https://lariotsquad.com/",
  "the 3253": "https://the3252.net/",
  "los angeles angels vs tampa bay rays": "https://www.mlb.com/angels",
  "los angeles angels vs baltimore orioles": "https://www.mlb.com/angels",
  "los angeles angels vs athletics": "https://www.mlb.com/angels",
  "los angeles dodgers vs tampa bay rays": "https://www.mlb.com/dodgers",
  "los angeles dodgers vs baltimore orioles": "https://www.mlb.com/dodgers",
  "los angeles dodgers vs san diego padres": "https://www.mlb.com/dodgers",
  "los angeles sparks vs minnesota lynx": "https://sparks.wnba.com/",
  "los angeles sparks vs new york liberty": "https://sparks.wnba.com/",
  "los angeles sparks vs seattle storm": "https://sparks.wnba.com/",
  "los angeles sparks vs indiana fever": "https://sparks.wnba.com/",
  "los angeles sparks vs chicago sky": "https://sparks.wnba.com/",
  "possibly perfect stakes (live racing day)": "https://www.santaanita.com/",
  "daytona stakes + summertime oaks (live racing day)": "https://www.santaanita.com/",
  "san juan capistrano stakes (live racing day)": "https://www.santaanita.com/",
  "socal pro series: los angeles": "https://socalproseries.com/",
  "socal pro series: claremont": "https://socalproseries.com/",
};

// ── Helpers ───────────────────────────────────────────────────────────────

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")  // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function fetchWithTimeout(url, ms = 12000, opts = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      ...opts,
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": UA, accept: "*/*", ...(opts.headers || {}) },
    });
  } finally {
    clearTimeout(id);
  }
}

function extractOgImage(html, baseUrl) {
  // Look for og:image, og:image:secure_url, twitter:image, twitter:image:src
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
      try {
        return new URL(m[1], baseUrl).toString();
      } catch {
        // ignore malformed
      }
    }
  }
  return null;
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
  // fallback: parse from URL
  try {
    const u = new URL(fallbackUrl);
    const m = u.pathname.match(/\.([a-z0-9]{2,5})(?:$|\?)/i);
    if (m) return m[1].toLowerCase();
  } catch {}
  return "jpg";
}

async function downloadImage(imgUrl, outPath) {
  const res = await fetchWithTimeout(imgUrl, 15000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 800) throw new Error(`tiny image (${buf.length}B)`);
  await fs.writeFile(outPath, buf);
  return { bytes: buf.length };
}

async function processUrl(url, slug) {
  const htmlRes = await fetchWithTimeout(url, 12000);
  if (!htmlRes.ok) throw new Error(`page HTTP ${htmlRes.status}`);
  const html = await htmlRes.text();
  const ogUrl = extractOgImage(html, url);
  if (!ogUrl) throw new Error("no og:image");

  // Probe headers for content-type to pick the extension
  const probe = await fetchWithTimeout(ogUrl, 8000, { method: "HEAD" }).catch(() => null);
  const ct = probe?.ok ? probe.headers.get("content-type") : null;
  const ext = extOf(ct, ogUrl);
  if (ext === "svg") throw new Error("svg (skipped)");

  const outPath = path.join(PUBLIC_DIR, `${slug}.${ext}`);
  const { bytes } = await downloadImage(ogUrl, outPath);
  return { ogUrl, ext, bytes, relPath: `images/places/${slug}.${ext}` };
}

// ── Concurrency limiter ─────────────────────────────────────────────────

async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let i = 0;
  const runners = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx).catch((err) => ({ error: err.message || String(err) }));
    }
  });
  await Promise.all(runners);
  return results;
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  // Group by URL — fetch each unique URL once, then map back to all names.
  const urlToNames = new Map();
  for (const [name, url] of Object.entries(PLACE_URLS)) {
    if (!urlToNames.has(url)) urlToNames.set(url, []);
    urlToNames.get(url).push(name);
  }
  const uniqueUrls = [...urlToNames.keys()];
  console.log(`Scraping ${uniqueUrls.length} unique URLs (${Object.keys(PLACE_URLS).length} total entries)...`);

  let done = 0;
  const fetched = await runWithConcurrency(uniqueUrls, 6, async (url) => {
    const firstName = urlToNames.get(url)[0];
    const slug = slugify(firstName);
    try {
      const out = await processUrl(url, slug);
      done++;
      console.log(`  [${done}/${uniqueUrls.length}] ✓ ${slug}.${out.ext} (${(out.bytes / 1024).toFixed(0)}KB) ← ${url}`);
      return { url, slug, ...out };
    } catch (err) {
      done++;
      console.log(`  [${done}/${uniqueUrls.length}] ✗ ${slug}: ${err.message} ← ${url}`);
      return { url, slug, error: err.message || String(err) };
    }
  });

  // Build name → relPath map (skip failures)
  const map = {};
  for (const r of fetched) {
    if (!r || r.error || !r.relPath) continue;
    for (const name of urlToNames.get(r.url)) {
      map[name] = r.relPath;
    }
  }

  await fs.writeFile(OUT_JSON, JSON.stringify(map, null, 2) + "\n");
  console.log(`\nWrote ${Object.keys(map).length} entries → ${OUT_JSON}`);
  const failures = fetched.filter((r) => r && r.error).length;
  console.log(`Failures: ${failures} / ${uniqueUrls.length}`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
