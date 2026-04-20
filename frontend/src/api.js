export const API_BASE = "http://127.0.0.1:5000";

async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${endpoint}`);
  return res.json();
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
    routes,
    mapData,
  ] = await Promise.all([
    apiFetch("/api/matches"),
    apiFetch("/api/players"),
    apiFetch("/api/hotels"),
    apiFetch("/api/restaurants"),
    apiFetch("/api/events"),
    apiFetch("/api/rankings"),
    apiFetch("/api/teams"),
    apiFetch("/api/routes"),
    apiFetch("/api/map-data").catch(() => null),
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
    routes,
    mapData,
  };
}

export async function loadEventDetail(id) {
  return apiFetch(`/api/events/${encodeURIComponent(id)}`);
}

export async function loadTickets(matchNumber) {
  return apiFetch(`/api/tickets/${encodeURIComponent(matchNumber)}`);
}

export async function loadPlayersByTeam(team) {
  return apiFetch(`/api/players/${encodeURIComponent(team)}`);
}

export async function generateJourney(params) {
  const query = new URLSearchParams(params);
  return apiFetch(`/api/itinerary?${query.toString()}`);
}
