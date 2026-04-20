// ═══════════════════════════════════════════════════
//  APP — projector, cards/tabs, scroll animations,
//        page initialisation
// ═══════════════════════════════════════════════════

// ═══════════════ PROJECTOR ═══════════════
const TOTAL_FRAMES = 6;
let currentFrame = 0;
let projTimer;
const FRAME_DURATION = 3200;

function runProjector() {
  const frames  = document.querySelectorAll(".film-frame");
  const counter = document.getElementById("filmCounter");
  const progress = document.getElementById("projProgress");

  projTimer = setInterval(() => {
    frames[currentFrame].classList.remove("active");
    currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
    frames[currentFrame].classList.add("active");
    counter.textContent = String(currentFrame + 1).padStart(2, "0") + " / " + String(TOTAL_FRAMES).padStart(2, "0");
    progress.style.width = ((currentFrame + 1) / TOTAL_FRAMES) * 100 + "%";
    if (currentFrame === TOTAL_FRAMES - 1) setTimeout(() => skipProjector(), FRAME_DURATION);
  }, FRAME_DURATION);

  progress.style.width = (1 / TOTAL_FRAMES) * 100 + "%";
}

function skipProjector() {
  clearInterval(projTimer);
  const screen = document.getElementById("projector-screen");
  screen.classList.add("fade-out");
  setTimeout(() => {
    screen.style.display = "none";
    document.body.style.overflow = "";
  }, 1000);
}

// ═══════════════ FILTER BAR ═══════════════
const HOTEL_FILTERS = [
  { label: "All",    value: "all" },
  { label: "Budget (100+/night)",  value: "100+" },
  { label: "Mid (200+/night)",     value: "200+" },
  { label: "Luxury (400+/night)",  value: "400+" },
];

const EVENT_FILTERS = [
  { label: "All",           value: "all" },
  { label: "Fan Festival",  value: "Fan Festival" },
  { label: "Fan Zone",      value: "Fan Zone" },
  { label: "Bar & Party",   value: "Bar" },
  { label: "MLS Match",     value: "MLS" },
  { label: "Community",     value: "Community" },
];

const SHOW_FILTERS = [
  { label: "All",            value: "all" },
  { label: "Live Music",     value: "Music" },
  { label: "Comedy",         value: "Comedy" },
  { label: "Outdoor Cinema", value: "Cinema" },
  { label: "Entertainment",  value: "Entertainment" },
  { label: "Culture",        value: "Culture" },
];

function renderFilterBar(filters, fnName) {
  const bar = document.getElementById("filterBar");
  if (!bar) return;
  bar.innerHTML = filters.map((f, i) =>
    `<button onclick="${fnName}('${f.value}',this)"
      style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;
             padding:0.3rem 0.8rem;border:1px solid var(--border-med);background:${i === 0 ? "var(--ink)" : "transparent"};
             color:${i === 0 ? "var(--paper)" : "var(--charcoal)"};cursor:pointer;transition:all 0.2s;"
      ${i === 0 ? 'data-active="1"' : ""}>${f.label}</button>`
  ).join("");
}

function activateFilterBtn(btn) {
  const bar = document.getElementById("filterBar");
  if (!bar) return;
  bar.querySelectorAll("button").forEach(b => {
    b.style.background = "transparent";
    b.style.color = "var(--charcoal)";
    delete b.dataset.active;
  });
  btn.style.background = "var(--ink)";
  btn.style.color = "var(--paper)";
  btn.dataset.active = "1";
}

// ═══════════════ FILTER ACTIONS ═══════════════
function filterHotels(band, btn) {
  activateFilterBtn(btn);
  if (band === "all") {
    renderHotelCards(HOTELS);
    return;
  }
  fetch(`${API_BASE}/api/hotels/price/${encodeURIComponent(band)}`)
    .then(r => r.json())
    .then(data => {
      const mapped = data.map(h => ({
        name:    h.hotel_name,
        region:  h.region || "",
        address: h.address || "",
        stars:   Math.round(h.star_rating) || 3,
        price:   h.price_band ? `${h.price_band}/night` : "N/A",
        emoji:   "🏨",
      }));
      renderHotelCards(mapped);
    });
}

function filterEvents(cat, btn) {
  activateFilterBtn(btn);
  if (cat === "all") {
    renderEventCards(FAN_EVENTS);
    return;
  }
  fetch(`${API_BASE}/api/events/category/${encodeURIComponent(cat)}`)
    .then(r => r.json())
    .then(data => {
      const mapped = data.map(e => ({
        id:    e.event_id,
        name:  e.event_name,
        area:  e.area || e.city || "",
        date:  e.start_date || "",
        price: "See details",
        desc:  e.event_type || e.category || "",
        emoji: "🎉",
      }));
      renderEventCards(mapped);
    });
}

function filterShows(cat, btn) {
  activateFilterBtn(btn);
  if (cat === "all") {
    renderShowCards(SHOWS);
    return;
  }
  fetch(`${API_BASE}/api/events/category/${encodeURIComponent(cat)}`)
    .then(r => r.json())
    .then(data => {
      const mapped = data.map(e => ({
        id:    e.event_id,
        name:  e.event_name,
        venue: e.venue_name || e.area || "",
        date:  e.start_date || "",
        price: "See details",
        desc:  e.event_type || e.category || "",
        emoji: "🎭",
      }));
      renderShowCards(mapped);
    });
}

// ═══════════════ CARD RENDERERS ═══════════════
function renderHotelCards(data) {
  const grid = document.getElementById("cardsGrid");
  grid.innerHTML = data.map(h =>
    `<div class="rec-card"><div class="rec-card-img">${h.emoji}</div><div class="rec-card-body">
      <div class="rec-card-tag">Hotel · ${h.region}</div>
      <div class="rec-card-name">${h.name}</div>
      <div class="rec-card-sub">${h.address}</div>
      <div class="rec-card-price">${h.price} · <span class="stars">${"★".repeat(h.stars)}</span></div>
    </div></div>`
  ).join("");
}

function renderEventCards(data) {
  const grid = document.getElementById("cardsGrid");
  grid.innerHTML = data.map(e =>
    `<div class="rec-card" style="cursor:pointer" onclick="openEventDetail(${e.id})">
      <div class="rec-card-img">${e.emoji}</div><div class="rec-card-body">
      <div class="rec-card-tag">Fan Event · ${e.area}</div>
      <div class="rec-card-name">${e.name}</div>
      <div class="rec-card-sub">${e.desc}</div>
      <div class="rec-card-price">${e.date} · ${e.price}</div>
    </div></div>`
  ).join("");
}

function renderShowCards(data) {
  const grid = document.getElementById("cardsGrid");
  grid.innerHTML = data.map(s =>
    `<div class="rec-card" style="cursor:pointer" onclick="${s.id ? `openEventDetail(${s.id})` : ""}">
      <div class="rec-card-img">${s.emoji}</div><div class="rec-card-body">
      <div class="rec-card-tag">Entertainment · ${s.venue}</div>
      <div class="rec-card-name">${s.name}</div>
      <div class="rec-card-sub">${s.desc}</div>
      <div class="rec-card-price">${s.date} · ${s.price}</div>
    </div></div>`
  ).join("");
}

// ═══════════════ CARDS / TABS ═══════════════
function switchTab(tab, btn) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderCards(tab);
}

function renderCards(tab) {
  const grid    = document.getElementById("cardsGrid");
  const filterBar = document.getElementById("filterBar");
  if (filterBar) filterBar.innerHTML = "";

  if (tab === "hotels") {
    renderFilterBar(HOTEL_FILTERS, "filterHotels");
    renderHotelCards(HOTELS);

  } else if (tab === "restaurants") {
    grid.innerHTML = RESTAURANTS.map(r =>
      `<div class="rec-card"><div class="rec-card-img">${r.emoji}</div><div class="rec-card-body">
        <div class="rec-card-tag">${r.flavor} · ${r.region}</div>
        <div class="rec-card-name">${r.name}</div>
        <div class="rec-card-sub">${r.address}</div>
        <div class="rec-card-price">${r.price} · <span class="stars">★</span> ${r.score}</div>
      </div></div>`
    ).join("");

  } else if (tab === "events") {
    renderFilterBar(EVENT_FILTERS, "filterEvents");
    renderEventCards(FAN_EVENTS);

  } else if (tab === "shows") {
    renderFilterBar(SHOW_FILTERS, "filterShows");
    renderShowCards(SHOWS);

  } else if (tab === "teams") {
    const confColors = { UEFA:"#003399", CONCACAF:"#c8102e", AFC:"#006633", CAF:"#009f3d", CONMEBOL:"#fcdd04" };
    grid.innerHTML = TEAMS.map(t =>
      `<div class="rec-card"><div class="rec-card-img">⚽</div><div class="rec-card-body">
        <div class="rec-card-tag" style="color:${confColors[t.federation]||"var(--silver)"};">${t.federation}</div>
        <div class="rec-card-name">${t.country}</div>
        <div class="rec-card-sub">Group ${t.group_stage || "TBD"} · ${t.status || "Qualified"}</div>
        <div class="rec-card-price">${t.matches_in_la} match${t.matches_in_la !== 1 ? "es" : ""} in Los Angeles</div>
      </div></div>`
    ).join("");

  } else if (tab === "rankings") {
    grid.innerHTML = RANKINGS.map(r => {
      const change = r.rank_change > 0 ? `▲${r.rank_change}` : r.rank_change < 0 ? `▼${Math.abs(r.rank_change)}` : "–";
      const changeColor = r.rank_change > 0 ? "#2d8a3e" : r.rank_change < 0 ? "#c0392b" : "var(--silver)";
      return `<div class="rec-card"><div class="rec-card-img" style="font-family:'DM Mono',monospace;font-size:1.6rem;font-weight:700;">#${r.rank}</div><div class="rec-card-body">
        <div class="rec-card-tag">${r.confederation}</div>
        <div class="rec-card-name">${r.country}</div>
        <div class="rec-card-sub">${parseFloat(r.total_points).toFixed(1)} FIFA points</div>
        <div class="rec-card-price" style="color:${changeColor};">${change} from previous ranking</div>
      </div></div>`;
    }).join("");

  } else if (tab === "routes") {
    const modeEmoji = { transit:"🚇", rideshare:"🚖", drive:"🚗" };
    grid.innerHTML = ROUTES.map(r =>
      `<div class="rec-card"><div class="rec-card-img">${modeEmoji[r.mode_group] || "🗺"}</div><div class="rec-card-body">
        <div class="rec-card-tag">${r.mode_name}</div>
        <div class="rec-card-name">${r.origin_name} → ${r.dest_name}</div>
        <div class="rec-card-sub">${r.includes || r.mode_group}</div>
        <div class="rec-card-price">${r.duration_min} min · $${r.cost_low_usd}–${r.cost_high_usd}</div>
      </div></div>`
    ).join("");
  }
}

renderCards("hotels");

// ═══════════════ VIEW ON MAP ═══════════════
function viewOnMap(area) {
  const exploreMount = document.getElementById('mount-explore');
  if (!exploreMount) return;
  exploreMount.scrollIntoView({ behavior: 'smooth' });
  // Wait for scroll to settle, then fly map to area
  setTimeout(() => {
    if (typeof highlightArea === 'function') highlightArea(area);
  }, 800);
}

// Scroll animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.08 }
);
document.querySelectorAll(".match-card,.rec-card").forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(16px)";
  el.style.transition = "opacity 0.4s,transform 0.4s";
  observer.observe(el);
});
