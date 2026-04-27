// ─────────────────────────────────────────────────────────────────
// Shared "explore item pool" — turns the raw siteData fetched in
// useSiteData() into the typed, coord-bearing items used by:
//   • ExploreLA (browse/filter UI)
//   • JourneyResult ActivityPicker (let user swap planner output for any
//     real DB activity)
//
// Originally lived inside ExploreLA.jsx; moved here so both consumers
// stay in sync without copy-paste drift.
// ─────────────────────────────────────────────────────────────────

import { mediaForPlace } from "../placeMedia.js";
import { AREA_COORDS, TYPE_LABELS } from "../constants/explore.js";

export function coordsFor(text = "", index = 0) {
  const hit = Object.entries(AREA_COORDS).find(([key]) => text.toLowerCase().includes(key.toLowerCase()));
  const base = hit ? hit[1] : [34.043, -118.32];
  const offset = (index % 5) * 0.006;
  return [base[0] + offset, base[1] - offset];
}

export function buildExploreItems(data = {}) {
  const attractionCats = new Set([16, 17, 18, 19, 20, 21, 22]);
  const officialEventCats = new Set([1, 2, 3, 6]);
  const cleanType = (cat) => TYPE_LABELS[cat] || cat || "";

  const hotels = (data.hotels || [])
    .filter((h) => h.lat && h.lon)
    .map((h, i) => ({
      id: `hotel-${i}-${h.name}`, category: "hotels", markerType: "hotel",
      name: h.name, lat: Number(h.lat), lng: Number(h.lon),
      detail: `${h.region} · ${h.price}`, region: h.region || "", price: h.price || "",
      stars: h.stars ? `${h.stars}★` : "", starsNum: Number(h.stars) || 0,
      ...mediaForPlace(h.name, "hotels"),
    }));

  const restaurants = (data.restaurants || []).map((r, i) => {
    const [lat, lng] = coordsFor(`${r.region} ${r.address}`, i);
    return {
      id: `restaurant-${i}-${r.name}`, category: "restaurants", markerType: "restaurant",
      name: r.name, lat, lng, detail: `${r.region} · ${r.flavor} · ${r.price}`,
      region: r.region || "", flavor: r.flavor || "", price: r.price || "",
      ...mediaForPlace(r.name, "restaurants"),
    };
  });

  const events = (data.fanEvents || []).map((e, i) => {
    const [lat, lng] = coordsFor(`${e.area} ${e.venue} ${e.name}`, i);
    const type = officialEventCats.has(e.categoryId) ? "Official" : "Fan Scene";
    const where = e.area || e.venue || "Los Angeles";
    return {
      id: `event-${e.id || i}`, category: "events", markerType: "event",
      name: e.name, lat, lng, detail: `${where} · ${type}`,
      area: e.area || e.venue || "", type, ...mediaForPlace(e.name, "events", e.officialUrl),
    };
  });

  const shows = (data.shows || []).map((s, i) => {
    const [lat, lng] = coordsFor(`${s.area} ${s.venue} ${s.name}`, i);
    const type = cleanType(s.category);
    return {
      id: `show-${s.id || i}`, category: "shows", markerType: "event",
      name: s.name, lat, lng, detail: `${s.area || s.venue || "Los Angeles"} · ${type}`,
      area: s.area || s.venue || "", type, ...mediaForPlace(s.name, "shows", s.officialUrl),
    };
  });

  const attractions = (data.allEvents || [])
    .filter((item) => attractionCats.has(item.categoryId))
    .map((item, i) => {
      const [lat, lng] = coordsFor(`${item.area} ${item.venue} ${item.name}`, i);
      const type = cleanType(item.category);
      return {
        id: `attraction-${item.id || i}`, category: "attractions", markerType: "attraction",
        name: item.name, lat, lng, detail: `${item.area || item.venue || "Los Angeles"} · ${type}`,
        area: item.area || item.venue || "", type, ...mediaForPlace(item.name, "attractions", item.officialUrl),
      };
    });

  return { hotels, restaurants, events, shows, attractions };
}

// Maps the explore-pool item into the shape JourneyResult expects on each
// activity (so the user can drop it straight into the timeline).
const POOL_TO_SOURCE = {
  restaurants: "restaurant",
  events:      "event",
  shows:       "event",
  attractions: "explore_pick",
  hotels:      "explore_pick",
};

export function activityFromPoolItem(poolItem, time = "12:00") {
  if (!poolItem) return null;
  return {
    time,
    title: poolItem.name,
    desc:  poolItem.detail || "",
    source: POOL_TO_SOURCE[poolItem.category] || "custom",
    lat:   poolItem.lat,
    lng:   poolItem.lng,
    officialUrl: poolItem.officialUrl || "",
  };
}
