import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../css/styles.css";
import {
  generateJourney,
  loadPlayersByTeam,
  loadSiteData,
  loadTickets,
} from "./api.js";
import { mediaForPlace } from "./placeMedia.js";

const matchRows = [
  { key: "M4", badge: "#1D428A", group: "Group D", teams: ["🇺🇸", "USA", "Paraguay", "🇵🇾"], date: "June 12", sub: "Friday · 6:00 pm PT" },
  { key: "M15", badge: "#239F40", group: "Group G", teams: ["🇮🇷", "IR Iran", "New Zealand", "🇳🇿"], date: "June 15", sub: "Monday · 6:00 pm PT" },
  { key: "M26", badge: "#C8102E", group: "Group B", teams: ["🇨🇭", "Switzerland", "TBD", ""], date: "June 18", sub: "Thursday · 12:00 pm PT", awayTbd: true },
  { key: "M39", badge: "#C49A00", group: "Group G", teams: ["🇧🇪", "Belgium", "IR Iran", "🇮🇷"], date: "June 21", sub: "Sunday · 12:00 pm PT" },
  { key: "M59", badge: "#E30A17", group: "Group D", teams: ["", "TBD", "USA", "🇺🇸"], date: "June 25", sub: "Thursday · 7:00 pm PT", homeTbd: true },
  { key: "M73", badge: "#5C4033", group: "Round of 32", teams: ["", "TBD", "TBD", ""], date: "June 28", sub: "Sunday · 12:00 pm PT", homeTbd: true, awayTbd: true },
  { key: "M84", badge: "#37474F", group: "Round of 32", teams: ["", "TBD", "TBD", ""], date: "July 2", sub: "Thursday · 12:00 pm PT", homeTbd: true, awayTbd: true },
  { key: "M98", badge: "#1A1A2E", group: "Quarter-Final", teams: ["", "TBD", "TBD", ""], date: "July 10", sub: "Friday · 12:00 pm PT", homeTbd: true, awayTbd: true },
];

const matchMeta = {
  M4: { home: { flag: "🇺🇸", name: "USA", country: "United States" }, away: { flag: "🇵🇾", name: "PAR", country: "Paraguay" }, highlight: "USMNT opens the World Cup on home soil against Paraguay in a pivotal Group D clash.", h2h: { total: 5, team1wins: 3, draws: 1 } },
  M15: { home: { flag: "🇮🇷", name: "IRI", country: "Iran" }, away: { flag: "🇳🇿", name: "NZL", country: "New Zealand" }, highlight: "Iran face New Zealand in a decisive Group G encounter at SoFi Stadium.", h2h: { total: 2, team1wins: 1, draws: 0 } },
  M26: { home: { flag: "🇨🇭", name: "SUI", country: "Switzerland" }, away: { flag: "❓", name: "TBD", country: "UEFA Playoff A Winner" }, highlight: "Switzerland take on the UEFA Playoff A qualifier in a must-watch Group B battle.", h2h: { total: 0, team1wins: 0, draws: 0 } },
  M39: { home: { flag: "🇧🇪", name: "BEL", country: "Belgium" }, away: { flag: "🇮🇷", name: "IRI", country: "Iran" }, highlight: "Belgium face Iran in a critical Group G match that could determine which teams advance.", h2h: { total: 1, team1wins: 1, draws: 0 } },
  M59: { home: { flag: "❓", name: "TBD", country: "UEFA Playoff C Winner" }, away: { flag: "🇺🇸", name: "USA", country: "United States" }, highlight: "USA's final group stage match brings the home crowd back to SoFi Stadium.", h2h: { total: 0, team1wins: 0, draws: 0 } },
  M73: { home: { flag: "❓", name: "TBD", country: "To Be Determined" }, away: { flag: "❓", name: "TBD", country: "To Be Determined" }, highlight: "Round of 32 match — teams to be determined after group stage.", h2h: { total: 0, team1wins: 0, draws: 0 } },
  M84: { home: { flag: "❓", name: "TBD", country: "To Be Determined" }, away: { flag: "❓", name: "TBD", country: "To Be Determined" }, highlight: "Round of 32 match — teams to be determined after group stage.", h2h: { total: 0, team1wins: 0, draws: 0 } },
  M98: { home: { flag: "❓", name: "TBD", country: "To Be Determined" }, away: { flag: "❓", name: "TBD", country: "To Be Determined" }, highlight: "Quarter-Final — the road to the World Cup Final runs through SoFi Stadium.", h2h: { total: 0, team1wins: 0, draws: 0 } },
};

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function Nav() {
  return (
    <nav>
      <div className="nav-masthead">
        <div className="nav-title">A cinematic journey through football, glamour &amp; the City of Angels — where the silver screen meets the beautiful game.</div>
        <div className="nav-logo">LA × WC26</div>
      </div>
      <div className="nav-bar">
        <div className="nav-rule">Est. June 11, 2026</div>
        <ul className="nav-links">
          <li><a href="#matches">Matches</a></li>
          <li><a href="#la-showcase">Explore LA</a></li>
          <li><a href="#itinerary">Journey</a></li>
          <li><a href="#about">About Us</a></li>
        </ul>
        <div className="nav-rule">SoFi Stadium · Inglewood</div>
      </div>
    </nav>
  );
}

function PhotoHero() {
  const [current, setCurrent] = useState(0);
  const slides = ["hero1.jpg", "hero2.jpg", "hero3.jpg", "hero4.jpg"];

  useEffect(() => {
    const timer = setInterval(() => setCurrent((n) => (n + 1) % slides.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="photo-hero">
      {slides.map((slide, i) => (
        <div key={slide} className={`ph-slide ${i === current ? "active" : ""}`} style={{ backgroundImage: `url('images/${slide}')` }} />
      ))}
      <div className="ph-overlay" />
      <div className="ph-text">
        <div className="ph-eyebrow">✦ FIFA World Cup 2026™ · Los Angeles ✦</div>
        <h1 className="ph-headline">THE <em>BEAUTIFUL</em><br />GAME COMES TO<br /><span className="ph-outline">HOLLYWOOD</span></h1>
        <p className="ph-sub">June – July 2026 · SoFi Stadium · Inglewood, California</p>
      </div>
      <div className="ph-dots">
        {slides.map((slide, i) => <button key={slide} className={`ph-dot ${i === current ? "active" : ""}`} onClick={() => setCurrent(i)} />)}
      </div>
      <div className="ph-cta-wrap">
        <button className="ph-cta" onClick={() => scrollToId("matches")}>
          <span className="ph-cta-label">Start Your Adventure</span>
          <span className="ph-cta-arrow">↓</span>
        </button>
      </div>
    </div>
  );
}

function Matches({ data, onOpenMatch }) {
  return (
    <section id="matches">
      <div className="ms-header">
        <div className="ms-eyebrow">✦ Eight Matches · One Venue ✦</div>
        <h1 className="ms-title">Los Angeles<br />Match Schedule</h1>
        <div className="ms-sub">SoFi Stadium · 1001 S. Stadium Drive, Inglewood, CA</div>
      </div>
      <div className="ms-list">
        {matchRows.map((row) => (
          <button className="ms-item" key={row.key} onClick={() => onOpenMatch(row.key)} style={{ "--accent": row.badge }}>
            <div className="ms-item-left">
              <div className="ms-item-key">{row.key}</div>
              <div className="ms-item-group">{row.group}</div>
            </div>
            <div className="ms-item-teams">
              {!row.homeTbd && <span className="ms-item-flag">{row.teams[0]}</span>}
              <span className="ms-item-name">{row.teams[1]}</span>
              <span className="ms-item-vs">vs</span>
              <span className="ms-item-name">{row.teams[2]}</span>
              {!row.awayTbd && <span className="ms-item-flag">{row.teams[3]}</span>}
            </div>
            <div className="ms-item-right">
              <div className="ms-item-date">{row.date}</div>
              <div className="ms-item-time">{row.sub}</div>
            </div>
            <div className="ms-item-arrow">›</div>
          </button>
        ))}
      </div>
      <div className="ms-footer-hint">Click any match to view details, tickets &amp; nearby picks</div>
      <button className="ms-nav-btn ms-home-btn" type="button" onClick={() => scrollToId("photo-hero")}>
        <span className="ms-nav-arrow">←</span>
        <span className="ms-nav-text">Home</span>
      </button>
      <button className="ms-nav-btn ms-explore-btn" type="button" onClick={() => scrollToId("la-showcase")}>
        <span className="ms-nav-text">Explore LA</span>
        <span className="ms-nav-arrow">→</span>
      </button>
    </section>
  );
}


const CATEGORY_FILTERS = {
  hotels:      [{ key: "region", label: "Region" }, { key: "price", label: "Price" }, { key: "stars", label: "Stars" }],
  restaurants: [{ key: "region", label: "Region" }, { key: "flavor", label: "Cuisine" }, { key: "price", label: "Price" }],
  events:      [{ key: "type", label: "Type" }],
  shows:       [{ key: "area", label: "Area" }, { key: "type", label: "Type" }],
  attractions: [{ key: "type", label: "Type" }],
};

const CATEGORY_DESCS = {
  hotels:      "Where to stay · World Cup edition",
  restaurants: "Curated dining around the city",
  events:      "Official FIFA activations & local fan culture",
  shows:       "Live music, comedy & entertainment across LA",
  attractions: "Beaches, landmarks & only-in-LA experiences",
};

const CATEGORY_PAGE_TITLES = {
  hotels: "Hotels near WC26 venues",
  restaurants: "Restaurants near WC26 venues",
  events: "Fan events around Los Angeles",
  shows: "Shows near your World Cup trip",
  attractions: "Attractions around Los Angeles",
};

const CATEGORY_PAGE_SUBTITLES = {
  hotels: "Find upscale accommodations close to the World Cup action in Los Angeles.",
  restaurants: "Pick memorable dining stops for match days and city days.",
  events: "Choose fan zones, watch parties, and official football activations.",
  shows: "Add music, comedy, cinema, and nightlife to the trip.",
  attractions: "Save landmarks, beaches, museums, studios, and only-in-LA experiences.",
};

const CATEGORY_EMOJIS = { hotels: "🏨", restaurants: "🍽️", events: "🎉", shows: "🎭", attractions: "🗺️" };
const CATEGORY_COLORS = { hotels: "#1a1a2e", restaurants: "#1e120a", events: "#0d1f14", shows: "#1a0d2b", attractions: "#0d1a1a" };

const TYPE_LABELS = {
  "Fan Community / Live game party": "Watch Party",
  "Fan Community": "Community",
  "Community Program": "Community",
  "Other Sports Events": "Sports",
  "Official Activity": "Official",
  "Club Event": "Club",
  "Special Event": "Special",
  "Fan Meetup": "Meetup",
  "Bar/Party": "Bar / Party",
  "MLS Match": "MLS",
  "Live Music": "Music",
  "Outdoor Cinema": "Cinema",
  "Urban Icon": "Landmark",
  "Coastal": "Beach & Coast",
  "Commercial": "Shopping",
  "Unknown": "Other",
};

const EXPLORE_PICKS_KEY = "laWorldCupExplorePicks";

function ExploreLA({ data, apiReady, apiError, onGoJourney, onPicksChange }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const cards = [
    { category: "hotels", label: "Hotels", kicker: "Stay", action: "Choose stays", img: "LA1.jpg" },
    { category: "restaurants", label: "Restaurants", kicker: "Taste", action: "Choose dining", img: "LA2.jpg" },
    { category: "events", label: "Fan Events", kicker: "Gather", action: "Choose events", img: "LA3.jpg" },
    { category: "shows", label: "Shows", kicker: "After Dark", action: "Choose shows", img: "LA4.jpg" },
    { category: "attractions", label: "Attractions", kicker: "Theme Park", action: "Choose activities", img: "LA7.jpg" },
  ];
  const categories = [
    ["hotels", "Hotels"],
    ["restaurants", "Restaurants"],
    ["events", "Fan Events"],
    ["shows", "Shows"],
    ["attractions", "Attractions"],
  ];
  const exploreItems = useMemo(() => {
    const attractionCats = new Set([16, 17, 18, 19, 20, 21, 22]);
    const areaCoords = {
      "West Hollywood": [34.0901, -118.376],
      WeHo: [34.0901, -118.376],
      Westwood: [34.061, -118.443],
      "Downtown LA": [34.043, -118.267],
      Downtown: [34.043, -118.267],
      "Arts District": [34.0401, -118.2311],
      Hollywood: [34.1017, -118.329],
      Fairfax: [34.074, -118.3614],
      "Santa Monica": [34.0143, -118.4912],
      Venice: [33.985, -118.4695],
      Inglewood: [33.9534, -118.3391],
      Anaheim: [33.8121, -117.919],
      "Orange County": [33.8121, -117.919],
      Burbank: [34.1808, -118.309],
      Carson: [33.8317, -118.2817],
      "Long Beach": [33.7701, -118.1937],
      "South El Monte": [34.0519, -118.0467],
      Pomona: [34.0551, -117.7499],
      Downey: [33.94, -118.1332],
      "East Los Angeles": [34.0333, -118.1667],
      "Los Feliz": [34.1083, -118.2872],
      "Studio City": [34.1396, -118.3871],
    };
    const coordsFor = (text = "", index = 0) => {
      const hit = Object.entries(areaCoords).find(([key]) => text.toLowerCase().includes(key.toLowerCase()));
      const base = hit ? hit[1] : [34.043, -118.32];
      const offset = (index % 5) * 0.006;
      return [base[0] + offset, base[1] - offset];
    };
    const hotels = (data.hotels || [])
      .filter((h) => h.lat && h.lon)
      .map((h, i) => ({ id: `hotel-${i}-${h.name}`, category: "hotels", markerType: "hotel", name: h.name, lat: Number(h.lat), lng: Number(h.lon), detail: `${h.region} · ${h.price}`, region: h.region || "", price: h.price || "", stars: h.stars ? `${h.stars}★` : "", ...mediaForPlace(h.name, "hotels") }));
    const restaurants = (data.restaurants || [])
      .map((r, i) => {
        const [lat, lng] = coordsFor(`${r.region} ${r.address}`, i);
        return { id: `restaurant-${i}-${r.name}`, category: "restaurants", markerType: "restaurant", name: r.name, lat, lng, detail: `${r.region} · ${r.flavor} · ${r.price}`, region: r.region || "", flavor: r.flavor || "", price: r.price || "", ...mediaForPlace(r.name, "restaurants") };
      });
    const cleanType = (cat) => TYPE_LABELS[cat] || cat || "";
    const officialEventCats = new Set([1, 2, 3, 6]); // Fan Festival, Fan Zone, Official Activity, MLS Match
    const events = (data.fanEvents || [])
      .map((e, i) => {
        const [lat, lng] = coordsFor(`${e.area} ${e.venue} ${e.name}`, i);
        const type = officialEventCats.has(e.categoryId) ? "Official" : "Fan Scene";
        return { id: `event-${e.id || i}`, category: "events", markerType: "event", name: e.name, lat, lng, detail: `${e.area || "Los Angeles"} · ${type}`, area: e.area || "", type, ...mediaForPlace(e.name, "events", e.officialUrl) };
      });
    const shows = (data.shows || [])
      .map((s, i) => {
        const [lat, lng] = coordsFor(`${s.area} ${s.venue} ${s.name}`, i);
        const type = cleanType(s.category);
        return { id: `show-${s.id || i}`, category: "shows", markerType: "event", name: s.name, lat, lng, detail: `${s.area || s.venue || "Los Angeles"} · ${type}`, area: s.area || s.venue || "", type, ...mediaForPlace(s.name, "shows", s.officialUrl) };
      });
    const attractions = (data.allEvents || [])
      .filter((item) => attractionCats.has(item.categoryId))
      .map((item, i) => {
        const [lat, lng] = coordsFor(`${item.area} ${item.venue} ${item.name}`, i);
        const type = cleanType(item.category);
        return { id: `attraction-${item.id || i}`, category: "attractions", markerType: "attraction", name: item.name, lat, lng, detail: `${item.area || item.venue || "Los Angeles"} · ${type}`, area: item.area || item.venue || "", type, ...mediaForPlace(item.name, "attractions", item.officialUrl) };
      });
    return {
      hotels,
      restaurants,
      events,
      shows,
      attractions,
    };
  }, [data.allEvents, data.hotels, data.restaurants, data.fanEvents, data.shows]);
  const allExploreItems = useMemo(() => [
    ...exploreItems.hotels,
    ...exploreItems.restaurants,
    ...exploreItems.events,
    ...exploreItems.shows,
    ...exploreItems.attractions,
  ], [exploreItems]);
  const visibleItems = exploreItems[activeCategory] || [];
  const selectedItems = useMemo(() => allExploreItems.filter((item) => selectedIds.includes(item.id)), [allExploreItems, selectedIds]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(EXPLORE_PICKS_KEY) || "[]");
      if (Array.isArray(saved)) setSelectedIds(saved.map((item) => item.id).filter(Boolean));
    } catch {
      setSelectedIds([]);
    }
  }, []);
  useEffect(() => {
    if (!apiReady) return;
    const picks = selectedItems.map(({ id, category, markerType, name, detail, lat, lng, officialUrl }) => ({
      id, category, markerType, name, detail, lat, lng, officialUrl,
    }));
    localStorage.setItem(EXPLORE_PICKS_KEY, JSON.stringify(picks));
    onPicksChange?.(picks);
  }, [apiReady, selectedItems, onPicksChange]);
  const selectedByCategory = useMemo(() => {
    const counts = {};
    for (const [cat, items] of Object.entries(exploreItems)) {
      counts[cat] = items.filter((item) => selectedIds.includes(item.id)).length;
    }
    return counts;
  }, [exploreItems, selectedIds]);
  const filteredItems = useMemo(() => {
    const defs = CATEGORY_FILTERS[activeCategory] || [];
    return visibleItems.filter((item) => defs.every(({ key }) => !activeFilters[key] || item[key] === activeFilters[key]));
  }, [visibleItems, activeCategory, activeFilters]);
  const toggleItem = (id) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((itemId) => itemId !== id) : [...ids, id]);
  const setFilter = (key, val) => setActiveFilters((prev) => ({ ...prev, [key]: val }));
  const openCategory = (category) => {
    setActiveCategory(category);
    setActiveFilters({});
  };
  return (
    <section id="la-showcase">
      {!activeCategory ? (
        <div className="lg-grid">
          {cards.map((card, i) => card.photo ? (
            <div key={i} className={`lg-photo ${card.cls || ""}`} style={{ "--lg-img": `url('images/${card.img}')` }} aria-hidden="true" />
          ) : (
            <button
              key={card.category}
              className={`lg-card ${card.cls || ""}`}
              type="button"
              onClick={() => openCategory(card.category)}
              aria-label={`Open ${card.label}`}
              style={{ "--lg-img": `url('images/${card.img}')` }}
            >
              <span className="lg-card-inner"><span className="lg-face lg-front" /><span className="lg-face lg-back"><span className="lg-kicker">{card.kicker}</span><span className="lg-name">{card.label}</span><span className="lg-action">{card.action}</span></span></span>
            </button>
          ))}
        </div>
      ) : (
        <div className="ex-wrap">
          <div className="ex-topbar">
            <button className="ex-back-btn" type="button" onClick={() => setActiveCategory(null)}>← Explore</button>
            <div className="ex-cat-tabs">
              {categories.map(([key, label]) => (
                <button key={key} className={key === activeCategory ? "active" : ""} type="button" onClick={() => openCategory(key)}>
                  {label}{selectedByCategory[key] > 0 && <span className="ex-cat-badge">{selectedByCategory[key]}</span>}
                </button>
              ))}
            </div>
            {selectedIds.length > 0 && (
              <button className="ex-clear-btn" type="button" onClick={() => setSelectedIds([])}>
                {selectedIds.length} selected · Clear
              </button>
            )}
          </div>
          <div className="ex-head">
            <div>
              <div className="ex-head-title">{CATEGORY_PAGE_TITLES[activeCategory]}</div>
              <div className="ex-head-sub">{CATEGORY_PAGE_SUBTITLES[activeCategory]}</div>
            </div>
          </div>
          <div className="ex-filters">
            {(CATEGORY_FILTERS[activeCategory] || []).map(({ key, label, select }) => (
              <FilterRow key={key} items={visibleItems} filterKey={key} label={label} activeValue={activeFilters[key] || null} onSelect={(val) => setFilter(key, val)} select={!!select} />
            ))}
          </div>
          <div className="ex-body">
            <div className="ex-cards-col">
              {apiError ? (
                <DataNotice title="Backend unavailable" detail="Start the Flask server and reload." />
              ) : !apiReady ? (
                <DataNotice title="Loading…" detail="Waiting for data." />
              ) : filteredItems.length === 0 ? (
                <DataNotice title="No results" detail="Try adjusting the filters." />
              ) : (
                <div className="ex-cards">
                  {filteredItems.map((item, i) => (
                    <ExCard key={item.id} item={item} category={activeCategory} selected={selectedIds.includes(item.id)} onToggle={toggleItem} index={i + 1} />
                  ))}
                </div>
              )}
            </div>
            <div className="ex-map-col">
              <div className="ex-pick-panel">
                <div className="ex-pick-head">
                  <span>Pick</span>
                  <strong>{selectedItems.length}</strong>
                </div>
                <div className="ex-pick-list">
                  {selectedItems.length === 0 ? (
                    <div className="ex-pick-empty">Select hotels, restaurants, events, shows, or attractions.</div>
                  ) : selectedItems.slice(0, 6).map((item) => (
                    <div className="ex-pick-item" key={item.id}>
                      <span>{CATEGORY_EMOJIS[item.category] || "📍"}</span>
                      <div>
                        <strong>{item.name}</strong>
                        <em>{item.detail}</em>
                      </div>
                    </div>
                  ))}
                  {selectedItems.length > 6 && <div className="ex-pick-more">+{selectedItems.length - 6} more saved picks</div>}
                </div>
              </div>
              <div className="ex-map-box">
                <SyncMap mode={activeCategory} places={selectedItems} />
              </div>
              <button className="ex-go-btn" type="button" onClick={onGoJourney}>
                Go
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


function ExCard({ item, category, selected, onToggle, index }) {
  const [imageSrc, setImageSrc] = useState(item.imageUrl);
  useEffect(() => {
    setImageSrc(item.imageUrl);
  }, [item.imageUrl]);
  const openOfficial = (event) => {
    event.stopPropagation();
    if (item.officialUrl) window.open(item.officialUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <button className={`ex-card${selected ? " ex-card--on" : ""}`} type="button" onClick={() => onToggle(item.id)}>
      <span className="ex-card-index">{index}</span>
      <div
        className={`ex-card-thumb${item.officialUrl ? " ex-card-thumb--link" : ""}`}
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.18), rgba(0,0,0,.32)), url('${item.fallbackImage || "images/LA5.jpg"}')`, backgroundColor: CATEGORY_COLORS[category] || "#111" }}
        title={item.officialUrl ? "Open official website" : "Official website not available in the dataset"}
      >
        {imageSrc && imageSrc !== item.fallbackImage && (
          <img className="ex-card-img" src={imageSrc} alt="" loading="lazy" onError={() => setImageSrc(null)} />
        )}
        <span className="ex-card-emoji">{CATEGORY_EMOJIS[category] || "📍"}</span>
        {selected && <span className="ex-card-check">✓</span>}
        {item.officialUrl && <span className="ex-card-site" onClick={openOfficial}>Official Site ↗</span>}
      </div>
      <div className="ex-card-body">
        <div className="ex-card-name">{item.name}</div>
        <div className="ex-card-detail">{item.detail}</div>
        <div className="ex-card-meta">
          {item.stars && <span>{item.stars}</span>}
          {item.price && <span>{item.price}</span>}
          {item.type && <span>{item.type}</span>}
          {item.flavor && <span>{item.flavor}</span>}
        </div>
      </div>
    </button>
  );
}

function FilterRow({ items, filterKey, label, activeValue, onSelect, select = false }) {
  const values = [...new Set(items.map((item) => item[filterKey]).filter(Boolean))].sort();
  if (values.length <= 1) return null;
  if (select) {
    return (
      <div className="lg-filter-row">
        <span className="lg-filter-label">{label}</span>
        <select className="lg-filter-select" value={activeValue || ""} onChange={(e) => onSelect(e.target.value || null)}>
          <option value="">All</option>
          {values.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div className="lg-filter-row">
      <span className="lg-filter-label">{label}</span>
      <div className="lg-filter-pills">
        <button className={`lg-filter-pill${!activeValue ? " active" : ""}`} type="button" onClick={() => onSelect(null)}>All</button>
        {values.map((v) => (
          <button key={v} className={`lg-filter-pill${activeValue === v ? " active" : ""}`} type="button" onClick={() => onSelect(v)}>{v}</button>
        ))}
      </div>
    </div>
  );
}

function SyncMap({ mode, places = [] }) {
  const rawMapId = useId();
  const mapId = `map-${rawMapId.replace(/:/g, "")}`;
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const defaultCenter = [33.9534, -118.3391];
  useEffect(() => {
    if (!window.L || mapRef.current) return;
    const map = window.L.map(mapId, { center: defaultCenter, zoom: 13, zoomControl: false, attributionControl: true });
    mapRef.current = map;
    layerRef.current = window.L.layerGroup().addTo(map);
    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: "© OSM © CARTO", subdomains: "abcd", maxZoom: 19 }).addTo(map);
    window.L.control.zoom({ position: "bottomright" }).addTo(map);
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, [mapId]);
  useEffect(() => {
    if (!window.L || !mapRef.current || !layerRef.current) return;
    const color = { stadium: "#f4d35e", hotel: "#9fd3ff", restaurant: "#f7a072", event: "#c2f970", attraction: "#ff8ac6" };
    const icon = (type) => window.L.divIcon({
      className: "",
      html: `<div style="width:${type === "stadium" ? 18 : 11}px;height:${type === "stadium" ? 18 : 11}px;border-radius:50%;background:${color[type] || "#ddd"};border:2px solid #fff;box-shadow:${type === "stadium" ? "0 0 18px rgba(244,211,94,.95)" : "0 0 10px rgba(255,255,255,.35)"};"></div>`,
      iconSize: [18, 18], iconAnchor: [9, 9],
    });
    const stadium = { markerType: "stadium", name: "SoFi Stadium", lat: defaultCenter[0], lng: defaultCenter[1], detail: "World Cup venue · Inglewood" };
    layerRef.current.clearLayers();
    const markers = [stadium, ...places].map((p) => {
      const mt = p.markerType || "event";
      const marker = window.L.marker([p.lat, p.lng], { icon: icon(mt) })
        .bindPopup(`<div class="lf-popup"><div class="lf-popup-type">${mt}</div><div class="lf-popup-name">${p.name}</div><div class="lf-popup-detail">${p.detail}</div></div>`, { className: "lf-popup-wrap", closeButton: false });
      marker.addTo(layerRef.current);
      if (mt === "stadium") marker.openPopup();
      return marker;
    });
    if (places.length === 0) {
      mapRef.current.flyTo(defaultCenter, 13, { duration: 0.8 });
    } else {
      const bounds = window.L.featureGroup(markers).getBounds();
      mapRef.current.fitBounds(bounds.pad(0.25), { maxZoom: 13, animate: true });
    }
  }, [mode, places]);
  return <div id={mapId} className="showcase-map" />;
}

function DataNotice({ title, detail }) {
  return <div className="rec-card" style={{ gridColumn: "1 / -1", minHeight: 180, display: "flex", alignItems: "center" }}><div className="rec-card-body"><div className="rec-card-tag">Database Connection</div><div className="rec-card-name">{title}</div><div className="rec-card-sub">{detail}</div></div></div>;
}

const JOURNEY_SELECTS = [
  {
    key: "type",
    icon: "01",
    label: "Traveler Type",
    options: [["football", "Football Fan"], ["family", "Family"], ["backpacker", "Backpacker"], ["luxury", "Luxury Traveler"]],
  },
  {
    key: "budget",
    icon: "02",
    label: "Budget per Day",
    options: [["budget", "$100-200"], ["mid", "$200-400"], ["luxury", "$400+"]],
  },
  {
    key: "days",
    icon: "03",
    label: "Days in LA",
    options: [["3", "3 Days"], ["5", "5 Days"], ["7", "7 Days"]],
  },
  {
    key: "match_date",
    icon: "04",
    label: "Match Date",
    wide: true,
    options: [["jun12", "Jun 12 · USA vs Paraguay (M4)"], ["jun15", "Jun 15 · Iran vs New Zealand (M15)"], ["jun18", "Jun 18 · Switzerland vs UEFA Playoff A (M26)"], ["jun21", "Jun 21 · Belgium vs Iran (M39)"], ["jun25", "Jun 25 · UEFA Playoff C vs USA (M59)"], ["jun28", "Jun 28 · Round of 32 (M73)"], ["jul2", "Jul 2 · Round of 32 (M84)"], ["jul10", "Jul 10 · Quarter-Finals (M98)"]],
  },
  {
    key: "vibe",
    icon: "05",
    label: "Vibe Preference",
    options: [["culture", "Culture & History"], ["beach", "Beach & Nature"], ["nightlife", "Nightlife & Shows"], ["film", "Hollywood & Film"]],
  },
];

const ACTIVITY_MARKS = {
  event: "EVENT",
  restaurant: "DINE",
  match: "MATCH",
  explore_pick: "PICK",
};

function Journey({ explorePicks = [] }) {
  const [form, setForm] = useState({ type: "football", budget: "mid", days: "5", match_date: "jun12", vibe: "culture" });
  const [loading, setLoading] = useState(false);
  const [journey, setJourney] = useState(null);
  const [error, setError] = useState("");
  const resultRef = useRef(null);
  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  async function submit() {
    setLoading(true); setError(""); setJourney(null);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    const journeyPicks = explorePicks.slice(0, 12).map(({ id, category, name, detail, officialUrl, lat, lng, markerType }) => ({ id, category, name, detail, officialUrl, lat, lng, markerType }));
    try {
      const result = await generateJourney({ ...form, picks: journeyPicks });
      setJourney(result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
    catch {
      setError("Unable to connect to the server. Please make sure the Flask API is running.");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
    finally { setLoading(false); }
  }
  return (
    <section id="itinerary" className="journey-section">
      <div className="journey-shell">
        <div className="journey-planner-screen">
          <div className="journey-hero">
            <div className="journey-kicker">Personalized Plan</div>
            <h1>Plan Your LA World Cup Journey</h1>
            <p>Craft a personalized travel experience in seconds, then turn your Explore LA picks into a real day-by-day route.</p>
            <div className="journey-hero-stats">
              <span>SoFi Stadium</span>
              <span>Explore LA Picks</span>
              <span>Live Route Map</span>
            </div>
          </div>
          <div className="journey-builder-card">
            {explorePicks.length > 0 && (
              <div className="journey-picks-note">
                <span>{explorePicks.length} Explore LA picks connected</span>
                <em>{explorePicks.slice(0, 3).map((pick) => pick.name).join(" · ")}{explorePicks.length > 3 ? ` · +${explorePicks.length - 3} more` : ""}</em>
              </div>
            )}
            <div className="journey-form-grid">
              {JOURNEY_SELECTS.map((field) => (
                <Select
                  key={field.key}
                  icon={field.icon}
                  label={field.label}
                  value={form[field.key]}
                  onChange={(v) => update(field.key, v)}
                  options={field.options}
                  wide={field.wide}
                />
              ))}
            </div>
            <button className="generate-btn" onClick={submit} disabled={loading}>
              {loading ? "Crafting your journey..." : "Generate My Journey"}
            </button>
          </div>
          <div className="journey-screen-footer">
            <span>Scroll or generate to view your timeline and map</span>
            <span>↓</span>
          </div>
        </div>
        <div ref={resultRef} className={`itinerary-result ${loading || journey || error ? "visible" : ""}`}>
          {loading && <div className="journey-loading"><div className="loading-bar" /><span>Crafting your journey...</span></div>}
          {error && <p className="journey-error">{error}</p>}
          {journey && <JourneyResult data={journey} />}
        </div>
      </div>
    </section>
  );
}

function Select({ icon, label, value, onChange, options, wide }) {
  return <div className={`control-group${wide ? " control-group--wide" : ""}`}><div className="control-icon">{icon}</div><label>{label}</label><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>;
}

function JourneyResult({ data }) {
  const budgetLabel = data.budget_label === "budget" ? "$150–250/day" : data.budget_label === "mid" ? "$350–500/day" : "$700+/day";
  const formatHotelPrice = (value) => {
    if (!value) return "";
    const text = String(value);
    const priced = /^\d/.test(text) ? `$${text}` : text;
    return priced.includes("night") ? priced : `${priced}/night`;
  };
  const hotelBits = data.hotel ? [
    data.hotel.region,
    data.hotel.star_rating ? `${data.hotel.star_rating}★` : "",
    formatHotelPrice(data.hotel.price_band),
  ].filter(Boolean).join(" · ") : "";
  const mapPlaces = (data.picks_used || [])
    .filter((pick) => Number.isFinite(Number(pick.lat)) && Number.isFinite(Number(pick.lng)))
    .map((pick) => ({
      name: pick.name,
      detail: pick.detail || "Explore LA pick",
      lat: Number(pick.lat),
      lng: Number(pick.lng),
      markerType: pick.markerType || (pick.category === "hotels" ? "hotel" : pick.category === "restaurants" ? "restaurant" : pick.category === "attractions" ? "attraction" : "event"),
    }));
  const badgeLabel = (value = "") => value.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
  return (
    <div className="journey-result-layout">
      <div className="journey-timeline">
        <div className="journey-summary-card">
          <div className="journey-summary-tags">
            <span>{badgeLabel(data.traveler)}</span>
            <span>{badgeLabel(data.budget_label)} Budget</span>
            <span>{data.days.length} Days</span>
            <span>{budgetLabel}</span>
          </div>
          <h2>{data.match.label}</h2>
          <p>Match: {data.match.date} at SoFi Stadium</p>
          {data.hotel && <p>Stay: <strong>{data.hotel.hotel_name}</strong>{hotelBits ? ` · ${hotelBits}` : ""}</p>}
          {data.picks_used?.length > 0 && <p>{data.picks_used.length} Explore LA picks included in this journey.</p>}
        </div>
        {data.days.map((day) => (
          <div className="day-block" key={day.label}>
            <div className="day-label">{day.label}</div>
            <div className="day-stack">
              {day.activities.map((act, i) => (
                <div className="timeline-item" key={`${act.time}-${i}`}>
                  <div className="timeline-time">{act.time}</div>
                  <div className="timeline-content">
                    <div className="timeline-mark">{ACTIVITY_MARKS[act.source] || "PLAN"}</div>
                    <div className="title">{act.title}</div>
                    <div className="desc">{act.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <aside className="journey-map-panel">
        <div className="journey-map-head">
          <span>Live Route Map</span>
          <strong>{mapPlaces.length ? `${mapPlaces.length} picks` : "SoFi Stadium"}</strong>
        </div>
        <div className="journey-map-box"><SyncMap mode="journey" places={mapPlaces} /></div>
        <div className="journey-map-note">Selected Explore LA picks appear here with SoFi Stadium highlighted as the match venue.</div>
      </aside>
    </div>
  );
}

function About() {
  const team = [
    ["Angeline Yu", "Data & Product Strategy", "Helping data organization and product planning, transforming World Cup match information into a clear, interactive, and user-centered experience.", "https://github.com/Angeline-777", "AngelineYu", "f7d6c5"],
    ["Bruce Yu", "Team Energy & Operations", "Good boy yeah！", "https://github.com/Hongqiuzi", "BruceYu", "c0d9ee"],
    ["Richard Zhang", "Analytics & Growth", "Passionate about analytics leveraging data-driven insights to scale high-impact brand growth.", "https://github.com/richardzhang1028-glitch", "RichardZhang", "d8e7c7"],
    ["Richelle Liu", "Product & User Experience", "Not a big fan of FIFA but big fan of AI, data, product and Day yi.", "https://github.com/ririchelle", "RichelleLiu", "f3c5d8"],
    ["Rosemary Li", "Full-Stack & Data Engineering Lead", "Building the project across the full stack: designing database-backed API logic and connecting PostgreSQL data to a React interface for World Cup visitors.", "https://github.com/Rosemary-Li", "RosemaryLi", "e8d7b5"],
    ["Shenghan Gao", "Backend & Data Engineering", "Turning messy, real-world data into clean, structured datasets — making it ready for seamless ETL and reliable database integration.", "https://github.com/Shenghan-Gao", "ShenghanGao", "c7d8d6"],
  ];
  return <section id="about"><div className="about-header"><div className="about-title">Meet Our Team</div><a className="about-team-link" href="https://github.com/Rosemary-Li/LA-WorldCup" target="_blank" rel="noreferrer">Project GitHub</a></div><div className="team-grid">{team.map(([name, role, bio, github, seed, bg]) => <div className="team-card" key={name}><img className="team-photo" src={`https://api.dicebear.com/8.x/notionists/svg?seed=${seed}&backgroundColor=${bg}`} alt={`${name} cartoon avatar`} /><div className="team-info"><div className="team-name">{name}</div><div className="team-role">{role}</div><div className="team-bio">{bio}</div><a className="team-github" href={github} target="_blank" rel="noreferrer">GitHub</a></div></div>)}</div></section>;
}

function Footer() {
  return <footer><div className="footer-masthead">LA × WC26</div><div className="footer-links"><a href="#photo-hero">Home</a><a href="#matches">Matches</a><a href="#itinerary">Journey</a><a href="#la-showcase">Explore</a><a href="https://www.discoverlosangeles.com/fifaworldcupla" target="_blank" rel="noreferrer">Official LA Tourism</a><a href="#about">About Us</a></div><p className="footer-copy">FIFA World Cup 2026™ Los Angeles · June 11 – July 19, 2026 · SoFi Stadium</p></footer>;
}

const countryAliases = {
  "united states": "usa",
  "us": "usa",
  "u.s.": "usa",
  "ir iran": "iran",
};

function countryKey(value = "") {
  const key = String(value).trim().toLowerCase();
  return countryAliases[key] || key;
}

function findTeamInfo(teams, metaTeam, dbName) {
  const keys = [dbName, metaTeam.country, metaTeam.name].filter(Boolean).map(countryKey);
  return teams.find((team) => keys.includes(countryKey(team.country))) || null;
}

function findRankingInfo(rankings, metaTeam, teamInfo) {
  const keys = [teamInfo?.country, metaTeam.country, metaTeam.name].filter(Boolean).map(countryKey);
  return rankings.find((ranking) => keys.includes(countryKey(ranking.country))) || null;
}

function rankChangeText(change) {
  const value = Number(change);
  if (!Number.isFinite(value) || value === 0) return "No change";
  return value > 0 ? `Up ${value}` : `Down ${Math.abs(value)}`;
}

function TeamIntelCard({ label, metaTeam, teamInfo, ranking }) {
  return (
    <div className="team-intel-card">
      <div className="team-intel-top">
        <span className="team-intel-label">{label}</span>
        <span className="team-intel-flag">{metaTeam.flag}</span>
      </div>
      <div className="team-intel-name">{teamInfo?.country || metaTeam.country}</div>
      <div className="team-intel-meta">
        <span>{teamInfo?.federation || ranking?.confederation || "TBD"}</span>
        <span>Group {teamInfo?.group_stage || "TBD"}</span>
      </div>
      <div className="team-intel-status">{teamInfo?.status || "Team details will update when confirmed."}</div>
      <div className="team-intel-stats">
        <div><strong>{ranking ? `#${ranking.rank}` : "TBD"}</strong><span>FIFA Rank</span></div>
        <div><strong>{ranking ? Number.parseFloat(ranking.total_points).toFixed(1) : "TBD"}</strong><span>Points</span></div>
        <div><strong>{teamInfo?.matches_in_la || "TBD"}</strong><span>LA Match</span></div>
      </div>
      {ranking && <div className="team-intel-change">{rankChangeText(ranking.rank_change)} from previous ranking</div>}
    </div>
  );
}

function RankingSnapshot({ rankings, activeCountries }) {
  const activeKeys = activeCountries.map(countryKey);
  const rows = rankings.filter((ranking) => activeKeys.includes(countryKey(ranking.country)));
  const fallbackRows = rows.length ? rows : rankings.slice(0, 6);
  return (
    <aside className="ranking-snapshot">
      <div className="ranking-title">FIFA Ranking Snapshot</div>
      {fallbackRows.map((ranking) => (
        <div className="ranking-row" key={`${ranking.country}-${ranking.rank}`}>
          <span>#{ranking.rank}</span>
          <strong>{ranking.country}</strong>
          <em>{Number.parseFloat(ranking.total_points).toFixed(1)}</em>
        </div>
      ))}
    </aside>
  );
}

function MatchOverlay({ matchNumber, data, onClose }) {
  const [panel, setPanel] = useState("hotels");
  const [tickets, setTickets] = useState(null);
  const [squad, setSquad] = useState(null);
  if (!matchNumber) return null;
  const dbMatch = data.matches.find((m) => m.match_number === matchNumber) || {};
  const meta = matchMeta[matchNumber] || matchMeta.M4;
  const homeTeam = findTeamInfo(data.teams, meta.home, dbMatch.team1);
  const awayTeam = findTeamInfo(data.teams, meta.away, dbMatch.team2);
  const homeRanking = findRankingInfo(data.rankings, meta.home, homeTeam);
  const awayRanking = findRankingInfo(data.rankings, meta.away, awayTeam);
  const activeCountries = [homeTeam?.country, awayTeam?.country, meta.home.country, meta.away.country].filter(Boolean);
  const playerTeams = [homeTeam?.country, awayTeam?.country, dbMatch.team1, dbMatch.team2, meta.home.name, meta.away.name].filter(Boolean).map(countryKey);
  const players = data.players.filter((p) => playerTeams.includes(countryKey(p.team))).slice(0, 4);
  async function openTickets() { setPanel("tickets"); if (!tickets && dbMatch.match_number) setTickets(await loadTickets(dbMatch.match_number).catch(() => [])); }
  async function openSquad() {
    setPanel("squad");
    if (!squad) {
      const teamNames = [homeTeam?.country, awayTeam?.country].filter((name) => name && countryKey(name) !== "to be determined" && !countryKey(name).includes("playoff"));
      const rows = await Promise.all(teamNames.map((name) => loadPlayersByTeam(name).catch(() => [])));
      setSquad(rows.flat());
    }
  }
  return (
    <div id="matchOverlay" className="overlay" style={{ display: "block" }}><button className="overlay-close" onClick={onClose}>×</button><div className="overlay-inner"><div id="overlayContent">
      <div style={{ borderBottom: "3px solid var(--ink)", marginBottom: "2rem", paddingBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--silver)" }}>{dbMatch.stage || meta.round} · {matchNumber}</span><span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.62rem", color: "var(--silver)" }}>{dbMatch.date || ""}</span></div>
      <div className="detail-hero"><div className="detail-team"><span className="detail-flag">{meta.home.flag}</span><div className="detail-name">{meta.home.name}</div><div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", color: "var(--silver)" }}>{meta.home.country}</div></div><div className="detail-vs-block"><span className="detail-vs">versus</span><div className="detail-match-info">{dbMatch.venue || "SoFi Stadium, Inglewood"}</div>{dbMatch.venue_address && <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.55rem", color: "var(--silver)", marginTop: "0.3rem" }}>{dbMatch.venue_address}</div>}</div><div className="detail-team"><span className="detail-flag">{meta.away.flag}</span><div className="detail-name">{meta.away.name}</div><div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", color: "var(--silver)" }}>{meta.away.country}</div></div></div>
      <div className="match-intel">
        <div className="team-intel-grid">
          <TeamIntelCard label="Home Team" metaTeam={meta.home} teamInfo={homeTeam} ranking={homeRanking} />
          <TeamIntelCard label="Away Team" metaTeam={meta.away} teamInfo={awayTeam} ranking={awayRanking} />
        </div>
        <RankingSnapshot rankings={data.rankings} activeCountries={activeCountries} />
      </div>
      <div style={{ marginBottom: "2.5rem" }}><div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--silver)", marginBottom: "0.8rem" }}>Match Storyline</div><p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.1rem", lineHeight: 1.7, color: "var(--charcoal)" }}>{meta.highlight}</p></div>
      <div className="h2h-block"><div className="h2h-stat"><div className="h2h-num">{meta.h2h.total}</div><div className="h2h-label">Total Meetings</div></div><div className="h2h-stat"><div className="h2h-num">{meta.h2h.team1wins}</div><div className="h2h-label">{meta.home.name} Wins</div></div><div className="h2h-stat"><div className="h2h-num">{meta.h2h.draws}</div><div className="h2h-label">Draws</div></div></div>
      <div className="players-row" style={{ marginBottom: "2.5rem" }}>{players.map((p) => <div className="player-card" key={p.player_id}><div className="player-number">{p.player_id}</div><div><div className="player-name">{p.player_name}</div><div className="player-pos">{p.position} · {p.club}</div><div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", color: "var(--silver)", marginTop: "0.15rem" }}>{p.team}</div></div></div>)}</div>
      <div className="nearby-tabs"><button className={`nearby-tab ${panel === "hotels" ? "active" : ""}`} onClick={() => setPanel("hotels")}>Hotels</button><button className={`nearby-tab ${panel === "restaurants" ? "active" : ""}`} onClick={() => setPanel("restaurants")}>Restaurants</button><button className={`nearby-tab ${panel === "events" ? "active" : ""}`} onClick={() => setPanel("events")}>Events</button><button className={`nearby-tab ${panel === "tickets" ? "active" : ""}`} onClick={openTickets}>Tickets</button><button className={`nearby-tab ${panel === "squad" ? "active" : ""}`} onClick={openSquad}>Full Squad</button></div>
      <div className="nearby-grid">{panel === "hotels" && data.hotels.slice(0, 6).map((h) => <Nearby key={h.name} name={h.name} sub={h.region} price={`${h.price} · ${"★".repeat(h.stars)}`} />)}{panel === "restaurants" && data.restaurants.slice(0, 6).map((r) => <Nearby key={r.name} name={r.name} sub={`${r.flavor} · ${r.region}`} price={`${r.price} · ★ ${r.score}`} />)}{panel === "events" && data.fanEvents.slice(0, 6).map((e) => <Nearby key={e.name} name={`${e.emoji} ${e.name}`} sub={`${e.area} · ${e.date}`} price={e.price} />)}{panel === "tickets" && (tickets ? tickets.length === 0 ? <DataNotice title="No ticket data" detail="Ticket information is not available for this match." /> : tickets.map((t) => <TicketCard key={t.ticket_id} t={t} />) : <DataNotice title="Loading ticket data" detail="Please wait." />)}{panel === "squad" && (squad ? squad.map((p) => <Nearby key={p.player_id} name={`${p.player_name}${p.is_star ? " ★" : ""}`} sub={`${p.position} · ${p.club}`} price={`Age ${p.age} · ${p.caps} caps · ${p.goals} goals`} />) : <DataNotice title="Loading squad data" detail="Please wait." />)}</div>
    </div></div></div>
  );
}

function Nearby({ name, sub, price }) {
  return <div className="nearby-card"><div className="nearby-name">{name}</div><div className="nearby-sub">{sub}</div><div className="nearby-price">{price}</div></div>;
}

function TicketCard({ t }) {
  const statusColor = t.ticket_status === "Available" ? "#2d8a3e" : t.ticket_status === "Sold Out" ? "#c0392b" : "var(--silver)";
  const ticketCategory = (t.ticket_category || "").replace(/\s*\([^)]*[\u3400-\u9fff][^)]*\)/g, "");
  return (
    <div className="nearby-card">
      <div className="nearby-name">{ticketCategory}</div>
      <div className="nearby-sub">{t.seating_section}{t.section_level ? ` · ${t.section_level}` : ""}{t.stage ? ` · ${t.stage}` : ""}</div>
      <div className="nearby-price" style={{ color: statusColor }}>${Number.parseFloat(t.price_usd).toFixed(0)} · {t.ticket_status}</div>
    </div>
  );
}


function App() {
  const [data, setData] = useState({ matches: [], players: [], hotels: [], restaurants: [], fanEvents: [], shows: [], allEvents: [], rankings: [], teams: [] });
  const [apiReady, setApiReady] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [matchNumber, setMatchNumber] = useState(null);
  const [explorePicks, setExplorePicks] = useState([]);

  useEffect(() => {
    loadSiteData().then((loaded) => { setData(loaded); setApiReady(true); setApiError(null); }).catch((err) => { setApiError(err); setApiReady(false); });
  }, []);

  return (
    <>
      <Nav />
      <div id="mount-photohero"><PhotoHero /></div>
      <div id="mount-matches"><Matches data={data} onOpenMatch={setMatchNumber} /></div>
      <div id="mount-showcase"><ExploreLA data={data} apiReady={apiReady} apiError={apiError} onGoJourney={() => scrollToId("itinerary")} onPicksChange={setExplorePicks} /></div>
      <div id="mount-itinerary"><Journey explorePicks={explorePicks} /></div>
      <div id="mount-about"><About /></div>
      <div id="mount-footer"><Footer /></div>
      <MatchOverlay matchNumber={matchNumber} data={data} onClose={() => setMatchNumber(null)} />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
