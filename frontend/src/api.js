export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:5001";

// Per-request timeout. Without this, a hung backend would lock submit()
// forever (the await never resolves → finally never runs → loading stays true).
const DEFAULT_TIMEOUT_MS = 15000;

async function apiFetch(endpoint, { timeoutMs = DEFAULT_TIMEOUT_MS, method = "GET", body } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  const url = `${API_BASE}${endpoint}`;
  console.debug(`[api] → ${method} ${url}`);
  try {
    const init = { signal: ctrl.signal, method };
    if (body !== undefined) {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(body);
    }
    const res = await fetch(url, init);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} on ${endpoint}${text ? ` — ${text.slice(0, 200)}` : ""}`);
    }
    const json = await res.json();
    console.debug(`[api] ✓ ${endpoint}`);
    return json;
  } catch (err) {
    if (err.name === "AbortError") {
      console.error(`[api] ✗ ${endpoint} timed out after ${timeoutMs}ms`);
      throw new Error(`Request timed out after ${timeoutMs / 1000}s: ${endpoint}`);
    }
    console.error(`[api] ✗ ${endpoint}: ${err.message}`);
    throw err;
  } finally {
    clearTimeout(t);
  }
}

function cleanParenthetical(value) {
  return (value || "").replace(/\s*\([^)]*\)/g, "").trim();
}

export async function loadSiteData() {
  const [
    matches,
    players,
    hotels,
    restaurants,
    events,
    rankings,
    teams,
  ] = await Promise.all([
    apiFetch("/api/matches"),
    apiFetch("/api/players"),
    apiFetch("/api/hotels"),
    apiFetch("/api/restaurants"),
    apiFetch("/api/events"),
    apiFetch("/api/rankings"),
    apiFetch("/api/teams"),
  ]);

  const showCats = new Set([12, 13, 14, 15]);
  const fanEventCats = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 23]);
  const fanEvents = [];
  const shows = [];
  const allEvents = [];

  events.forEach((event) => {
    if (!event.event_name) return;
    const catId = Number.parseInt(event.event_category_id, 10) || 0;
    const item = {
      id: event.event_id,
      name: event.event_name,
      area: event.area || event.city || "",
      date: event.start_date || "",
      price: "See details",
      desc: event.event_type || event.category || "",
      venue: event.venue_name || "",
      category: event.category_label || event.category || "",
      categoryId: catId,
      officialUrl: event.source_url || "",
      emoji: showCats.has(catId) ? "🎭" : "🎉",
    };
    allEvents.push(item);
    if (showCats.has(catId)) shows.push(item);
    else if (fanEventCats.has(catId)) fanEvents.push(item);
  });

  return {
    matches,
    players,
    hotels: hotels.filter((h) => h.hotel_name).map((h) => ({
      name: h.hotel_name,
      region: cleanParenthetical(h.region),
      address: h.address || "",
      stars: Math.round(h.star_rating) || 3,
      price: h.price_band ? `${h.price_band}/night` : "N/A",
      reviews: h.google_reviews_count || 0,
      emoji: "🏨",
      lat: h.latitude,
      lon: h.longitude,
    })),
    restaurants: restaurants.filter((r) => r.restaurant_name).map((r) => ({
      name: r.restaurant_name,
      region: r.region || "",
      address: r.address || "",
      price: r.price_range || "N/A",
      flavor: r.flavor || "N/A",
      score: r.google_review_score || 0,
      emoji: "🍽️",
    })),
    fanEvents,
    shows,
    allEvents,
    rankings,
    teams,
  };
}

export async function loadTickets(matchNumber) {
  return apiFetch(`/api/tickets/${encodeURIComponent(matchNumber)}`);
}

export async function loadPlayersByTeam(team) {
  return apiFetch(`/api/players/${encodeURIComponent(team)}`);
}

export async function loadMatchStory(matchNumber) {
  return apiFetch(`/api/match-story/${encodeURIComponent(matchNumber)}`);
}

export async function loadMatchStats(matchNumber) {
  return apiFetch(`/api/match-stats/${encodeURIComponent(matchNumber)}`);
}

export async function generateJourney(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value) || (value && typeof value === "object")) {
      query.set(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  // Itinerary generation can be slow (multi-day plan, many picks) — give it more headroom.
  return apiFetch(`/api/itinerary?${query.toString()}`, { timeoutMs: 30000 });
}

// ── Journey share (persisted to Postgres so a short URL re-opens the same plan)
export async function saveJourneyShare(payload) {
  const { id } = await apiFetch("/api/itinerary/save", {
    method: "POST",
    body: payload,
    timeoutMs: 15000,
  });
  return id;
}

export async function loadJourneyShare(id) {
  return apiFetch(`/api/itinerary/share/${encodeURIComponent(id)}`, { timeoutMs: 15000 });
}
