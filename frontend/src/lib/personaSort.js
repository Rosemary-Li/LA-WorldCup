// ─────────────────────────────────────────────────────────────────
// Persona-aware ranking for Explore LA cards.
//
// Combines three signals from the Journey form:
//   • budget   → preferred price tier (hotels + restaurants)
//   • picks    → distance anchor (first selected hotel; else SoFi Stadium)
//   • vibe     → boosts events / shows / attractions whose `type` matches
//
// Pure function — same input always produces the same order.
// ─────────────────────────────────────────────────────────────────

// Hotels: api.js wraps the band with "/night", so match both forms.
const HOTEL_TIERS = {
  "100+": 1, "100+/night": 1,
  "200+": 2, "200+/night": 2,
  "400+": 3, "400+/night": 3,
};

const RESTAURANT_TIERS = {
  "$10-20": 1,
  "$20-30": 2,
  "$30-50": 3,
  "$50-100": 4,
  "$100+": 5,
};

const BUDGET_TO_HOTEL_TIER = { budget: 1, mid: 2, luxury: 3 };
const BUDGET_TO_RESTAURANT_TIER = { budget: 2, mid: 3, luxury: 4 };

const VIBE_TO_TYPES = {
  football:  ["Watch Party", "Official", "MLS", "Sports", "Bar / Party", "Meetup"],
  culture:   ["Landmark", "Museum", "Community", "Special"],
  beach:     ["Beach & Coast", "Outdoor"],
  nightlife: ["Bar / Party", "Club", "Music", "Comedy", "Cinema"],
  film:      ["Cinema", "Music", "Landmark", "Shopping"],
};

// SoFi Stadium — fallback anchor when the user has no hotel pick yet.
const SOFI = [33.953, -118.339];

function distKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function anchorFor(picks) {
  const hotel = picks?.find((p) => p.category === "hotels" && p.lat && p.lng);
  if (hotel) return { coords: [Number(hotel.lat), Number(hotel.lng)], label: hotel.name };
  return { coords: SOFI, label: "SoFi Stadium" };
}

export function sortByPersona(items, category, prefs, picks) {
  if (!items?.length) return items;
  if (!prefs?.budget && !prefs?.vibe && !picks?.length) return items;

  const { coords: anchor } = anchorFor(picks);

  const score = (item) => {
    let s = 0;

    // Distance: closer wins. ~0.5 points per km.
    const lat = Number(item.lat);
    const lng = Number(item.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      s += distKm([lat, lng], anchor) * 0.5;
    } else {
      s += 50; // unknown coords sink to the bottom
    }

    if (category === "hotels") {
      const tier = HOTEL_TIERS[item.price] ?? 99;
      const target = BUDGET_TO_HOTEL_TIER[prefs?.budget];
      if (target) s += Math.abs(tier - target) * 10;
    } else if (category === "restaurants") {
      const tier = RESTAURANT_TIERS[item.price] ?? 99;
      const target = BUDGET_TO_RESTAURANT_TIER[prefs?.budget];
      if (target) s += Math.abs(tier - target) * 5;
    } else {
      // events / shows / attractions
      const preferred = VIBE_TO_TYPES[prefs?.vibe] || [];
      if (item.type && preferred.includes(item.type)) s -= 10;
    }

    return s;
  };

  return [...items].sort((a, b) => score(a) - score(b));
}

export function personaActive(prefs, picks) {
  return !!(prefs?.budget || prefs?.vibe || picks?.length);
}

export function personaSummary(category, prefs, picks) {
  const parts = [];
  const hotelPick = picks?.find((p) => p.category === "hotels");

  if (category === "hotels" && prefs?.budget) {
    parts.push(`Daily budget · ${prefs.budget}`);
  } else if (category === "restaurants") {
    if (hotelPick) parts.push(`Near ${hotelPick.name}`);
    if (prefs?.budget) parts.push(`Budget · ${prefs.budget}`);
  } else if (prefs?.vibe) {
    parts.push(`Vibe · ${prefs.vibe}`);
  }

  if (!parts.length && hotelPick) parts.push(`Near ${hotelPick.name}`);
  return parts.join(" · ");
}
