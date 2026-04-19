// ═══════════════════════════════════════════════════
//  API.JS — Fetch real data from Flask API
//  Overrides hardcoded variables in data.js
//  Load this AFTER data.js in index.html
// ═══════════════════════════════════════════════════

const API_BASE = "http://127.0.0.1:5000";

// ─────────────────────────────────────────
// Helper: fetch JSON from API
// ─────────────────────────────────────────
async function apiFetch(endpoint) {
  const res = await fetch(API_BASE + endpoint);
  if (!res.ok) throw new Error("API error: " + endpoint);
  return res.json();
}


// ─────────────────────────────────────────
// Load Matches
// ─────────────────────────────────────────
async function loadMatches() {
  const matches = await apiFetch("/api/matches");
  const players = await apiFetch("/api/players");

  // Group players by team
  const playersByTeam = {};
  players.forEach(p => {
    if (!playersByTeam[p.team]) playersByTeam[p.team] = [];
    playersByTeam[p.team].push(p);
  });

  // Map match_number to MATCH_DATA key
  const keyMap = {
    "M4":  "usa-paraguay",
    "M15": "iran-newzealand",
    "M26": "swiss-playoff",
    "M39": "belgium-iran",
    "M59": "playoff-usa",
    "M73": "r32-m73",
    "M84": "r32-m84",
    "M98": "qf-m98",
  };

  matches.forEach(m => {
    const key = keyMap[m.match_number];
    if (!key || !MATCH_DATA[key]) return;

    // Update date and stage
    MATCH_DATA[key].date = `${m.date} · ${m.day_of_week} · ${m.time_pt}`;
    MATCH_DATA[key].round = `${m.stage} · ${m.group || ""} · ${m.match_number}`;
    MATCH_DATA[key].venue = m.venue;

    // Update players from database
    const team1Players = (playersByTeam[m.team1] || []).slice(0, 2);
    const team2Players = (playersByTeam[m.team2] || []).slice(0, 2);
    const allPlayers = [...team1Players, ...team2Players];

    if (allPlayers.length > 0) {
      MATCH_DATA[key].players = allPlayers.map(p => ({
        num: p.player_id,
        name: p.player_name,
        pos: `${p.position} · ${p.club}`,
        team: p.team,
      }));
    }
  });

  console.log("✅ Matches loaded from API");
}


// ─────────────────────────────────────────
// Load Hotels
// ─────────────────────────────────────────
async function loadHotels() {
  const hotels = await apiFetch("/api/hotels");

  // Override HOTELS array with real data
  HOTELS.length = 0;
  hotels.forEach(h => {
    if (!h.hotel_name) return;
    HOTELS.push({
      name:    h.hotel_name,
      region:  h.region || "",
      address: h.address || "",
      stars:   Math.round(h.star_rating) || 3,
      price:   h.price_band ? `${h.price_band}/night` : "N/A",
      reviews: h.google_reviews_count || 0,
      emoji:   "🏨",
      lat:     h.latitude,
      lon:     h.longitude,
    });
  });

  console.log("✅ Hotels loaded from API:", HOTELS.length);
}


// ─────────────────────────────────────────
// Load Restaurants
// ─────────────────────────────────────────
async function loadRestaurants() {
  const restaurants = await apiFetch("/api/restaurants");

  // Override RESTAURANTS array with real data
  RESTAURANTS.length = 0;
  restaurants.forEach(r => {
    if (!r.restaurant_name) return;
    RESTAURANTS.push({
      name:    r.restaurant_name,
      region:  r.region || "",
      address: r.address || "",
      price:   r.price_range || "N/A",
      flavor:  r.flavor || "N/A",
      score:   r.google_review_score || 0,
      emoji:   "🍽️",
    });
  });

  console.log("✅ Restaurants loaded from API:", RESTAURANTS.length);
}


// ─────────────────────────────────────────
// Load Events (Fan Events)
// ─────────────────────────────────────────
async function loadEvents() {
  const events = await apiFetch("/api/events");

  // Override FAN_EVENTS array with real data
  FAN_EVENTS.length = 0;
  events.slice(0, 20).forEach(e => {
    if (!e.event_name) return;
    FAN_EVENTS.push({
      name:  e.event_name,
      area:  e.area || e.city || "",
      date:  e.start_date || "",
      price: "See details",
      desc:  e.event_type || e.category || "",
      emoji: "🎉",
    });
  });

  console.log("✅ Events loaded from API:", FAN_EVENTS.length);
}


// ─────────────────────────────────────────
// Load Map Data
// ─────────────────────────────────────────
async function loadMapData() {
  const data = await apiFetch("/api/map-data");
  window.MAP_DATA = data;
  console.log("✅ Map data loaded from API");
}


// ─────────────────────────────────────────
// Initialize: load all data on page load
// ─────────────────────────────────────────
async function initAPI() {
  try {
    await Promise.all([
      loadMatches(),
      loadHotels(),
      loadRestaurants(),
      loadEvents(),
      loadMapData(),
    ]);
    console.log("🎉 All data loaded from API successfully!");
  } catch (err) {
    console.warn("⚠️ API load failed, using hardcoded data as fallback.", err);
  }
}

// Run on page load
initAPI();
