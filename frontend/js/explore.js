// ═══════════════════════════════════════════════════
//  EXPLORE — Leaflet map initialisation + filters
// ═══════════════════════════════════════════════════

// ── Marker data ─────────────────────────────────────
const MAP_PLACES = [
  // Stadium
  { type:'stadium', area:'inglewood',
    lat:33.9534, lng:-118.3391,
    name:'SoFi Stadium',
    detail:'Inglewood · 70,240 capacity · 8 World Cup matches' },

  // Hotels
  { type:'hotel', area:'weho',
    lat:34.0907, lng:-118.3797,
    name:'The West Hollywood EDITION',
    detail:'West Hollywood · ★★★★★ · $400+/night' },
  { type:'hotel', area:'weho',
    lat:34.0912, lng:-118.3712,
    name:'Andaz West Hollywood',
    detail:'West Hollywood · ★★★★ · $200+/night' },
  { type:'hotel', area:'dtla',
    lat:34.0503, lng:-118.2553,
    name:'The Biltmore Los Angeles',
    detail:'Downtown LA · ★★★★★ · $400+/night · Historic' },
  { type:'hotel', area:'santamonica',
    lat:34.0072, lng:-118.4905,
    name:'Shutters on the Beach',
    detail:'Santa Monica · ★★★★★ · $400+/night · Oceanfront' },

  // Restaurants
  { type:'restaurant', area:'weho',
    lat:34.0862, lng:-118.3772,
    name:'Norah',
    detail:'West Hollywood · American · $50–100 · ★ 4.6' },
  { type:'restaurant', area:'weho',
    lat:34.0901, lng:-118.3761,
    name:'Night + Market WeHo',
    detail:'West Hollywood · Asian · $30–50 · ★ 4.6' },
  { type:'restaurant', area:'dtla',
    lat:34.0401, lng:-118.2311,
    name:'Bestia',
    detail:'Arts District · Italian · $50–100 · ★ 4.7' },
  { type:'restaurant', area:'santamonica',
    lat:34.0215, lng:-118.4938,
    name:'Cassia',
    detail:'Santa Monica · Asian Fusion · $30–50 · ★ 4.5' },

  // Fan Events
  { type:'event', area:'dtla',
    lat:34.0141, lng:-118.2879,
    name:'FIFA Fan Festival™ LA',
    detail:'Exposition Park · Jun 11–15 · Free · Live broadcasts' },
  { type:'event', area:'hollywood',
    lat:34.1122, lng:-118.3390,
    name:'Hollywood Bowl Orchestra Night',
    detail:'Hollywood · Jun 16 · $40–120 · Outdoor concert' },
  { type:'event', area:'hollywood',
    lat:34.0921, lng:-118.3134,
    name:'Cinespia Outdoor Movie',
    detail:'Hollywood Forever Cemetery · Jun 18 · $25–35' },
  { type:'event', area:'hollywood',
    lat:34.0740, lng:-118.3614,
    name:'Farmers Market Fan Zone',
    detail:'Fairfax District · Jun 18–21 · Free · FIFA Fan Zone' },
];

// ── Area fly-to positions ────────────────────────────
const AREA_VIEWS = {
  weho:        { center:[34.0901, -118.3760], zoom:15 },
  dtla:        { center:[34.0430, -118.2671], zoom:15 },
  hollywood:   { center:[34.1017, -118.3290], zoom:15 },
  santamonica: { center:[34.0143, -118.4912], zoom:15 },
  inglewood:   { center:[33.9534, -118.3392], zoom:15 },
};
const LA_DEFAULT = { center:[34.0430, -118.3200], zoom:12 };

// ── State ────────────────────────────────────────────
let leafletMap   = null;
let activeType   = 'all';
let activeArea   = null;
let lMarkers     = []; // {marker, type, area}

// ── Icon factory ─────────────────────────────────────
function makeIcon(type, highlighted) {
  const cfg = {
    stadium:    { bg:'#ffffff', shadow:'0 0 10px rgba(255,255,255,0.9)', size:13 },
    hotel:      { bg:'#b0b0b0', shadow:'none', size:10 },
    restaurant: { bg:'#d0d0d0', shadow:'none', size:10 },
    event:      { bg:'#888888', shadow:'none', size:10 },
  }[type] || { bg:'#aaa', shadow:'none', size:10 };

  const s = highlighted ? cfg.size + 3 : cfg.size;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${s}px;height:${s}px;border-radius:50%;
      background:${cfg.bg};
      box-shadow:${cfg.shadow};
      border:1.5px solid rgba(255,255,255,0.4);
      cursor:pointer;
      transition:transform 0.15s;
    "></div>`,
    iconSize:   [s, s],
    iconAnchor: [s/2, s/2],
    popupAnchor:[0, -s/2 - 4],
  });
}

// ── Popup HTML ───────────────────────────────────────
function popupHTML(place) {
  const typeLabel = { stadium:'Stadium', hotel:'Hotel', restaurant:'Restaurant', event:'Fan Event' }[place.type] || '';
  return `<div class="lf-popup">
    <div class="lf-popup-type">${typeLabel}</div>
    <div class="lf-popup-name">${place.name}</div>
    <div class="lf-popup-detail">${place.detail}</div>
  </div>`;
}

// ── Apply current type + area filters ────────────────
function applyFilters() {
  if (!leafletMap) return;
  lMarkers.forEach(({ marker, type, area }) => {
    const typeOk = activeType === 'all' || type === activeType;
    const areaOk = !activeArea || area === activeArea;
    if (typeOk && areaOk) {
      marker.addTo(leafletMap);
    } else {
      marker.remove();
    }
  });
}

// ── Category filter ──────────────────────────────────
function filterMap(type, btn) {
  activeType = type;
  document.querySelectorAll('.filter-btn:not([data-area])').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyFilters();
}

// ── Area filter + fly-to ─────────────────────────────
function filterArea(area, btn) {
  if (!leafletMap) return;
  // Toggle off if same area clicked again
  if (activeArea === area) {
    activeArea = null;
    document.querySelectorAll('[data-area]').forEach(b => b.classList.remove('active'));
    leafletMap.flyTo(LA_DEFAULT.center, LA_DEFAULT.zoom, { duration: 1.2 });
  } else {
    activeArea = area;
    document.querySelectorAll('[data-area]').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const v = AREA_VIEWS[area];
    if (v) leafletMap.flyTo(v.center, v.zoom, { duration: 1.2 });
  }
  applyFilters();
}

// ── Called from itinerary "View on Map" ──────────────
function highlightArea(area) {
  const btn = document.querySelector(`[data-area="${area}"]`);
  filterArea(area, btn);
}

// ── Init map ─────────────────────────────────────────
(function initLeafletMap() {
  const el = document.getElementById('leaflet-map');
  if (!el || !window.L) return;

  leafletMap = L.map('leaflet-map', {
    center: LA_DEFAULT.center,
    zoom:   LA_DEFAULT.zoom,
    zoomControl: false,
    attributionControl: true,
  });

  // CartoDB Dark Matter tile
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright" style="color:#555">OSM</a> © <a href="https://carto.com/attributions" style="color:#555">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(leafletMap);

  // Zoom control bottom-right
  L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

  // Add all markers
  MAP_PLACES.forEach(place => {
    const marker = L.marker([place.lat, place.lng], { icon: makeIcon(place.type) })
      .bindPopup(popupHTML(place), {
        className:   'lf-popup-wrap',
        closeButton: false,
        maxWidth:    230,
      });

    marker.on('mouseover', function() { this.openPopup(); });
    marker.on('mouseout',  function() { this.closePopup(); });

    marker.addTo(leafletMap);
    lMarkers.push({ marker, type: place.type, area: place.area });
  });
})();
