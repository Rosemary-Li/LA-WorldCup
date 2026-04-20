import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../css/styles.css";
import {
  API_BASE,
  generateJourney,
  loadEventDetail,
  loadPlayersByTeam,
  loadSiteData,
  loadTickets,
} from "./api.js";

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
          <li><a href="#la-showcase">Map</a></li>
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

function ExploreLA({ data, apiReady, apiError }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [hoverCategory, setHoverCategory] = useState("stadium");
  const [selectedIds, setSelectedIds] = useState([]);
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
      .map((h, i) => ({ id: `hotel-${i}-${h.name}`, type: "hotel", name: h.name, lat: Number(h.lat), lng: Number(h.lon), detail: `${h.region} · ${h.price}` }));
    const restaurants = (data.restaurants || [])
      .map((r, i) => {
        const [lat, lng] = coordsFor(`${r.region} ${r.address}`, i);
        return { id: `restaurant-${i}-${r.name}`, type: "restaurant", name: r.name, lat, lng, detail: `${r.region} · ${r.flavor} · ${r.price}` };
      });
    const events = (data.fanEvents || [])
      .map((e, i) => {
        const [lat, lng] = coordsFor(`${e.area} ${e.venue} ${e.name}`, i);
        return { id: `event-${e.id || i}`, type: "event", name: e.name, lat, lng, detail: `${e.area || "Los Angeles"} · ${e.desc}` };
      });
    const shows = (data.shows || [])
      .map((s, i) => {
        const [lat, lng] = coordsFor(`${s.area} ${s.venue} ${s.name}`, i);
        return { id: `show-${s.id || i}`, type: "event", name: s.name, lat, lng, detail: `${s.area || s.venue || "Los Angeles"} · ${s.desc}` };
      });
    const attractions = (data.allEvents || [])
      .filter((item) => attractionCats.has(item.categoryId))
      .map((item, i) => {
        const [lat, lng] = coordsFor(`${item.area} ${item.venue} ${item.name}`, i);
        return { id: `attraction-${item.id || i}`, type: "attraction", name: item.name, lat, lng, detail: `${item.area || item.venue || "Los Angeles"} · ${item.desc}` };
      });
    return {
      hotels,
      restaurants,
      events,
      shows,
      attractions,
    };
  }, [data.allEvents, data.hotels, data.restaurants, data.fanEvents, data.shows]);
  const currentCategory = activeCategory || hoverCategory;
  const visibleItems = exploreItems[activeCategory] || [];
  const previewItems = activeCategory ? visibleItems.filter((item) => selectedIds.includes(item.id)) : exploreItems[currentCategory] || [];
  const toggleItem = (id) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((itemId) => itemId !== id) : [...ids, id]);
  const openCategory = (category) => {
    setActiveCategory(category);
    setHoverCategory(category);
    setSelectedIds((exploreItems[category] || []).slice(0, 2).map((item) => item.id));
  };
  return (
    <section id="la-showcase">
      <div className="lg-header">
        <h2 className="lg-title">Explore LA</h2>
        {activeCategory && <p className="lg-sub">Choose one or more places and watch them appear on the live map.</p>}
      </div>
      {!activeCategory ? (
        <div className="lg-grid">
          {cards.map((card, i) => card.photo ? (
            <div key={i} className={`lg-photo ${card.cls || ""}`} style={{ "--lg-img": `url('images/${card.img}')` }} aria-hidden="true" />
          ) : (
            <button
              key={card.category}
              className={`lg-card ${card.cls || ""} ${hoverCategory === card.category ? "map-active" : ""}`}
              type="button"
              onMouseEnter={() => setHoverCategory(card.category)}
              onMouseLeave={() => setHoverCategory("stadium")}
              onFocus={() => setHoverCategory(card.category)}
              onClick={() => openCategory(card.category)}
              aria-label={`Open ${card.label}`}
              style={{ "--lg-img": `url('images/${card.img}')` }}
            >
              <span className="lg-card-inner"><span className="lg-face lg-front" /><span className="lg-face lg-back"><span className="lg-kicker">{card.kicker}</span><span className="lg-name">{card.label}</span><span className="lg-action">{card.action}</span></span></span>
            </button>
          ))}
        </div>
      ) : (
        <div className="lg-split">
          <div className="lg-left">
            <div className="lg-picker">
              <div className="lg-picker-top">
                <button className="lg-back-btn" type="button" onClick={() => setActiveCategory(null)}>← All</button>
                <div>
                  <div className="lg-picker-kicker">Build Your Map</div>
                  <div className="lg-picker-title">{categories.find(([key]) => key === activeCategory)?.[1]}</div>
                </div>
              </div>
              <div className="lg-category-tabs">
                {categories.map(([key, label]) => (
                  <button key={key} className={key === activeCategory ? "active" : ""} type="button" aria-pressed={key === activeCategory} onClick={() => openCategory(key)}>{label}</button>
                ))}
              </div>
              <div className="lg-check-list">
                {apiError ? (
                  <DataNotice title="Backend API is unavailable" detail="Start the Flask server and reload the page to load database-backed places." />
                ) : !apiReady ? (
                  <DataNotice title="Loading database content" detail="The page is waiting for the Flask API before rendering selectable places." />
                ) : visibleItems.length === 0 ? (
                  <DataNotice title="No database rows found" detail="This category has no rows from the current backend query." />
                ) : visibleItems.map((item) => (
                  <label key={item.id} className="lg-check-row">
                    <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleItem(item.id)} />
                    <span>
                      <strong>{item.name}</strong>
                      <em>{item.detail}</em>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="lg-map-panel">
            <div className="lg-map-head">
              <span>Live Map</span>
              <strong>{`${selectedIds.length} Selected`}</strong>
            </div>
            <SyncMap mode={currentCategory} places={previewItems} />
          </div>
        </div>
      )}
    </section>
  );
}

function SyncMap({ mode, places = [] }) {
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const defaultCenter = [33.9534, -118.3391];

  useEffect(() => {
    if (!window.L || mapRef.current) return;
    const map = window.L.map("showcase-map", { center: defaultCenter, zoom: 13, zoomControl: false, attributionControl: true });
    mapRef.current = map;
    layerRef.current = window.L.layerGroup().addTo(map);
    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: "© OSM © CARTO", subdomains: "abcd", maxZoom: 19 }).addTo(map);
    window.L.control.zoom({ position: "bottomright" }).addTo(map);
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    if (!window.L || !mapRef.current || !layerRef.current) return;
    const color = { stadium: "#f4d35e", hotel: "#9fd3ff", restaurant: "#f7a072", event: "#c2f970", attraction: "#ff8ac6", route: "#d7b8ff" };
    const icon = (type) => window.L.divIcon({
      className: "",
      html: `<div style="width:${type === "stadium" ? 18 : 11}px;height:${type === "stadium" ? 18 : 11}px;border-radius:50%;background:${color[type] || "#ddd"};border:2px solid #fff;box-shadow:${type === "stadium" ? "0 0 18px rgba(244,211,94,.95)" : "0 0 10px rgba(255,255,255,.35)"};"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    const stadium = { type: "stadium", name: "SoFi Stadium", lat: defaultCenter[0], lng: defaultCenter[1], detail: "World Cup match venue · Inglewood" };
    const visiblePlaces = [stadium, ...places];
    layerRef.current.clearLayers();
    const markers = visiblePlaces.map((p) => {
      const marker = window.L.marker([p.lat, p.lng], { icon: icon(p.type) })
        .bindPopup(`<div class="lf-popup"><div class="lf-popup-type">${p.type}</div><div class="lf-popup-name">${p.name}</div><div class="lf-popup-detail">${p.detail}</div></div>`, { className: "lf-popup-wrap", closeButton: false });
      marker.addTo(layerRef.current);
      if (p.type === "stadium") marker.openPopup();
      return marker;
    });
    if (mode === "stadium" || markers.length === 1) {
      mapRef.current.flyTo(defaultCenter, 13, { duration: 0.8 });
    } else {
      const bounds = window.L.featureGroup(markers).getBounds();
      mapRef.current.fitBounds(bounds.pad(0.25), { maxZoom: 13, animate: true });
    }
  }, [mode, places]);

  return <div id="showcase-map" />;
}

function DataNotice({ title, detail }) {
  return <div className="rec-card" style={{ gridColumn: "1 / -1", minHeight: 180, display: "flex", alignItems: "center" }}><div className="rec-card-body"><div className="rec-card-tag">Database Connection</div><div className="rec-card-name">{title}</div><div className="rec-card-sub">{detail}</div></div></div>;
}

function Discover({ data, apiReady, apiError, activeTab, setActiveTab, onOpenEvent }) {
  const [filter, setFilter] = useState("all");
  useEffect(() => setFilter("all"), [activeTab]);
  const list = useMemo(() => {
    if (activeTab === "hotels" && filter !== "all") return data.hotels.filter((h) => h.price.startsWith(filter));
    if (activeTab === "events" && filter !== "all") return data.fanEvents.filter((e) => e.desc.includes(filter));
    if (activeTab === "shows" && filter !== "all") return data.shows.filter((e) => e.desc.includes(filter));
    return { hotels: data.hotels, restaurants: data.restaurants, events: data.fanEvents, shows: data.shows, routes: data.routes }[activeTab] || [];
  }, [activeTab, data, filter]);
  const tabs = [["hotels", "Hotels"], ["restaurants", "Restaurants"], ["events", "Fan Events"], ["shows", "Shows"], ["routes", "Getting There"]];
  const filters = activeTab === "hotels" ? ["all", "100+", "200+", "400+"] : activeTab === "events" ? ["all", "Fan Festival", "Fan Zone", "Bar", "MLS", "Community"] : activeTab === "shows" ? ["all", "Music", "Comedy", "Cinema", "Entertainment", "Culture"] : [];
  return (
    <section id="discover">
      <div className="section-divider" style={{ marginBottom: "1.5rem" }}><div className="d1" /><div className="d2" /></div>
      <div className="section-masthead"><div className="section-title">Discover Los Angeles</div><div className="section-folio">Hotels · Dining · Events · Transport</div></div>
      <div className="tab-bar">{tabs.map(([key, label]) => <button key={key} className={`tab-btn ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>{label}</button>)}</div>
      <div id="filterBar" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", padding: "0.8rem 0 0.2rem" }}>{filters.map((f) => <button key={f} onClick={() => setFilter(f)} data-active={filter === f ? "1" : undefined} style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.8rem", border: "1px solid var(--border-med)", background: filter === f ? "var(--ink)" : "transparent", color: filter === f ? "var(--paper)" : "var(--charcoal)", cursor: "pointer" }}>{f === "all" ? "All" : f}</button>)}</div>
      <div className="cards-grid" id="cardsGrid">{apiError ? <DataNotice title="Backend API is unavailable" detail="Start the Flask server and reload the page to load database-backed content." /> : !apiReady ? <DataNotice title="Loading database content" detail="The page is waiting for the Flask API before rendering cards." /> : list.map((item, i) => <DiscoverCard key={`${activeTab}-${i}`} item={item} tab={activeTab} onOpenEvent={onOpenEvent} />)}</div>
    </section>
  );
}

function DiscoverCard({ item, tab, onOpenEvent }) {
  if (tab === "hotels") return <div className="rec-card"><div className="rec-card-img">{item.emoji}</div><div className="rec-card-body"><div className="rec-card-tag">Hotel · {item.region}</div><div className="rec-card-name">{item.name}</div><div className="rec-card-sub">{item.address}</div><div className="rec-card-price">{item.price} · <span className="stars">{"★".repeat(item.stars)}</span></div></div></div>;
  if (tab === "restaurants") return <div className="rec-card"><div className="rec-card-img">{item.emoji}</div><div className="rec-card-body"><div className="rec-card-tag">{item.flavor} · {item.region}</div><div className="rec-card-name">{item.name}</div><div className="rec-card-sub">{item.address}</div><div className="rec-card-price">{item.price} · <span className="stars">★</span> {item.score}</div></div></div>;
  if (tab === "routes") return <div className="rec-card"><div className="rec-card-img">{{ transit: "🚇", rideshare: "🚖", drive: "🚗" }[item.mode_group] || "🗺"}</div><div className="rec-card-body"><div className="rec-card-tag">{item.mode_name}</div><div className="rec-card-name">{item.origin_name} → {item.dest_name}</div><div className="rec-card-sub">{item.includes || item.mode_group}</div><div className="rec-card-price">{item.duration_min} min · ${item.cost_low_usd}–${item.cost_high_usd}</div></div></div>;
  return <button className="rec-card" style={{ cursor: "pointer", textAlign: "left" }} onClick={() => item.id && onOpenEvent(item.id)}><div className="rec-card-img">{item.emoji}</div><div className="rec-card-body"><div className="rec-card-tag">{tab === "shows" ? "Entertainment" : "Fan Event"} · {item.area || item.venue}</div><div className="rec-card-name">{item.name}</div><div className="rec-card-sub">{item.desc}</div><div className="rec-card-price">{item.date} · {item.price}</div></div></button>;
}

function Journey({ onViewMap }) {
  const [form, setForm] = useState({ type: "football", budget: "mid", days: "5", match_date: "jun12", vibe: "culture" });
  const [loading, setLoading] = useState(false);
  const [journey, setJourney] = useState(null);
  const [error, setError] = useState("");
  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  async function submit() {
    setLoading(true); setError(""); setJourney(null);
    try { setJourney(await generateJourney(form)); }
    catch { setError("Unable to connect to the server. Please make sure the Flask API is running."); }
    finally { setLoading(false); }
  }
  return (
    <section id="itinerary">
      <div className="section-divider" style={{ marginBottom: "1.5rem" }}><div className="d1" /><div className="d2" /></div>
      <div className="section-masthead"><div className="section-title">Journey</div><div className="section-folio">Your Cinematic LA Story</div></div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "var(--silver)", fontSize: "1rem", marginBottom: "3rem", maxWidth: 600, lineHeight: 1.7 }}>Tell us who you are and what you love. We'll craft a cinematic LA World Cup experience just for you.</p>
        <div style={{ maxWidth: 900 }}>
          <div className="builder-controls">
            <Select label="Traveler Type" value={form.type} onChange={(v) => update("type", v)} options={[["football", "⚽ Football Fan"], ["family", "Family"], ["backpacker", "Backpacker"], ["luxury", "✦ Luxury Traveler"]]} />
            <Select label="Budget per Day" value={form.budget} onChange={(v) => update("budget", v)} options={[["budget", "$100–200 (Budget)"], ["mid", "$200–400 (Mid-Range)"], ["luxury", "$400+ (Luxury)"]]} />
            <Select label="Days in LA" value={form.days} onChange={(v) => update("days", v)} options={[["3", "3 Days"], ["5", "5 Days"], ["7", "7 Days"]]} />
          </div>
          <div className="builder-controls" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Select label="Match Date to See" value={form.match_date} onChange={(v) => update("match_date", v)} options={[["jun12", "Jun 12 · USA vs Paraguay (M4)"], ["jun15", "Jun 15 · Iran vs New Zealand (M15)"], ["jun18", "Jun 18 · Switzerland vs UEFA Playoff A (M26)"], ["jun21", "Jun 21 · Belgium vs Iran (M39)"], ["jun25", "Jun 25 · UEFA Playoff C vs USA (M59)"], ["jun28", "Jun 28 · Round of 32 (M73)"], ["jul2", "Jul 2 · Round of 32 (M84)"], ["jul10", "Jul 10 · Quarter-Finals (M98)"]]} />
            <Select label="Vibe Preference" value={form.vibe} onChange={(v) => update("vibe", v)} options={[["culture", "Culture & History"], ["beach", "Beach & Nature"], ["nightlife", "Nightlife & Shows"], ["film", "Hollywood & Film"]]} />
          </div>
          <button className="generate-btn" onClick={submit}>✦ GENERATE MY PERSONALIZED TRAVELING SCHEDULE ✦</button>
          <div className={`itinerary-result ${loading || journey || error ? "visible" : ""}`}>
            {loading && <div className="loading-bar" style={{ marginBottom: "2rem" }} />}
            {error && <p style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.75rem", color: "var(--silver)", padding: "2rem" }}>{error}</p>}
            {journey && <JourneyResult data={journey} onViewMap={onViewMap} />}
          </div>
        </div>
    </section>
  );
}

function Select({ label, value, onChange, options }) {
  return <div className="control-group"><label>{label}</label><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>;
}

function JourneyResult({ data, onViewMap }) {
  const budgetLabel = data.budget_label === "budget" ? "$150–250/day" : data.budget_label === "mid" ? "$350–500/day" : "$700+/day";
  return (
    <>
      <div style={{ marginBottom: "2rem", padding: "1.2rem", background: "var(--paper)", borderLeft: "3px solid var(--ink)" }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--silver)", marginBottom: "0.4rem" }}>Your Journey</div>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem", color: "var(--charcoal)" }}>Curated for: <strong>{data.traveler}</strong> · Budget: <strong>{data.budget_label}</strong> · {data.days.length} days · Match: <strong>{data.match.date} · {data.match.label}</strong></p>
        {data.hotel && <p style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.65rem", color: "var(--silver)", marginTop: "0.4rem" }}>🏨 Recommended stay: <strong>{data.hotel.hotel_name}</strong> · {data.hotel.region} · {data.hotel.star_rating}★ · ${data.hotel.price_band}/night</p>}
      </div>
      {data.days.map((day) => <div className="day-block" key={day.label}><div className="day-label">{day.label}</div>{day.activities.map((act, i) => <div className="timeline-item" key={`${act.time}-${i}`}><div className="timeline-time">{act.time}</div><div className="timeline-content"><div className="title">{act.title}</div><div className="desc">{act.desc}</div></div></div>)}</div>)}
      <div style={{ marginTop: "2rem", padding: "1.2rem", border: "1.5px solid var(--border-med)", background: "var(--paper)" }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--silver)", marginBottom: "0.3rem" }}>✦ Your LA World Cup Story is Ready</div>
        <p style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.65rem", color: "var(--silver)", marginBottom: "1rem" }}>Estimated budget: {budgetLabel} · {data.days.length}-day journey · Match: {data.match.date} at SoFi Stadium</p>
        <button onClick={() => onViewMap("inglewood")} style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", border: "1.5px solid var(--ink)", background: "transparent", color: "var(--ink)", padding: "0.55rem 1.4rem", cursor: "pointer" }}>📍 View on Map</button>
      </div>
    </>
  );
}

function MapSection({ focusArea }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const places = [
    { type: "stadium", area: "inglewood", lat: 33.9534, lng: -118.3391, name: "SoFi Stadium", detail: "Inglewood · 70,240 capacity · 8 World Cup matches" },
    { type: "hotel", area: "weho", lat: 34.0907, lng: -118.3797, name: "The West Hollywood EDITION", detail: "West Hollywood · ★★★★★ · $400+/night" },
    { type: "hotel", area: "dtla", lat: 34.0503, lng: -118.2553, name: "The Biltmore Los Angeles", detail: "Downtown LA · Historic" },
    { type: "restaurant", area: "weho", lat: 34.0862, lng: -118.3772, name: "Norah", detail: "West Hollywood · American" },
    { type: "restaurant", area: "dtla", lat: 34.0401, lng: -118.2311, name: "Bestia", detail: "Arts District · Italian" },
    { type: "event", area: "dtla", lat: 34.0141, lng: -118.2879, name: "FIFA Fan Festival™ LA", detail: "Exposition Park · Live broadcasts" },
    { type: "event", area: "hollywood", lat: 34.1122, lng: -118.339, name: "Hollywood Bowl Orchestra Night", detail: "Hollywood · Outdoor concert" },
  ];
  const areaViews = { weho: [34.0901, -118.376], dtla: [34.043, -118.2671], hollywood: [34.1017, -118.329], santamonica: [34.0143, -118.4912], inglewood: [33.9534, -118.3392] };
  useEffect(() => {
    if (!window.L || mapRef.current) return;
    const map = window.L.map("leaflet-map", { center: [34.043, -118.32], zoom: 12, zoomControl: false, attributionControl: true });
    mapRef.current = map;
    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: "© OSM © CARTO", subdomains: "abcd", maxZoom: 19 }).addTo(map);
    window.L.control.zoom({ position: "bottomright" }).addTo(map);
    markersRef.current = places.map((place) => {
      const marker = window.L.marker([place.lat, place.lng]).bindPopup(`<div class="lf-popup"><div class="lf-popup-type">${place.type}</div><div class="lf-popup-name">${place.name}</div><div class="lf-popup-detail">${place.detail}</div></div>`);
      marker.addTo(map);
      return { marker, ...place };
    });
    return () => { map.remove(); mapRef.current = null; markersRef.current = []; };
  }, []);
  useEffect(() => {
    if (focusArea && mapRef.current && areaViews[focusArea]) mapRef.current.flyTo(areaViews[focusArea], 15, { duration: 1.2 });
  }, [focusArea]);
  return (
    <section id="explore">
      <div className="section-masthead"><div className="section-title">Map</div><div className="section-folio">Stadium · Hotels · Dining · Events</div></div>
      <div className="explore-layout">
        <div className="filter-panel">
          <div className="filter-title">Live LA Map</div>
          <div className="filter-group">
            <div className="filter-group-label">Database Layer</div>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.62rem", color: "var(--silver)", lineHeight: 1.7 }}>
              Stadium, hotels, restaurants, and fan events are visualized as a fast reference layer for the Los Angeles trip.
            </p>
          </div>
          <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-ink)" }}>
            <div className="filter-group-label" style={{ marginBottom: "0.6rem" }}>Legend</div>
            <div className="lf-legend-item"><span className="lf-legend-dot" style={{ background: "#fff", boxShadow: "0 0 6px rgba(255,255,255,0.7)" }} />SoFi Stadium</div>
            <div className="lf-legend-item"><span className="lf-legend-dot" style={{ background: "#b0b0b0" }} />Hotels</div>
            <div className="lf-legend-item"><span className="lf-legend-dot" style={{ background: "#d0d0d0" }} />Restaurants</div>
            <div className="lf-legend-item"><span className="lf-legend-dot" style={{ background: "#888" }} />Fan Events</div>
          </div>
        </div>
        <div id="leaflet-map" />
      </div>
    </section>
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

function EventOverlay({ eventId, onClose }) {
  const [event, setEvent] = useState(null);
  useEffect(() => { if (eventId) loadEventDetail(eventId).then(setEvent).catch(() => setEvent({ error: true })); }, [eventId]);
  if (!eventId) return null;
  const exp = event?.experience_detail || {};
  const spt = event?.sports_detail || {};
  const ticket = exp.ticket_price || spt.approx_price || exp.admission_info || "See venue";
  const hasSports = spt.sport_type || spt.competition_event_info || spt.approx_price;
  const hasExpExtras = exp.suitable_for || exp.recommended_duration || exp.intensity_level;
  return (
    <div id="eventOverlay" className="overlay" style={{ display: "block" }}>
      <button className="overlay-close" onClick={onClose}>×</button>
      <div className="overlay-inner small"><div id="eventOverlayContent">
        {!event
          ? <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.7rem", color: "var(--silver)", padding: "2rem" }}>Loading...</div>
          : event.error
          ? <div style={{ padding: "2rem" }}>Could not load event details.</div>
          : <>
              <div style={{ borderBottom: "2px solid var(--ink)", marginBottom: "1.5rem", paddingBottom: "0.5rem" }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--silver)", marginBottom: "0.4rem" }}>{event.category_label || event.category || "Event"}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>{event.event_name}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <Info label="Venue" value={event.venue_name || "—"} />
                <Info label="Location" value={event.area || event.city || "—"} />
                <Info label="Dates" value={event.end_date && event.end_date !== event.start_date ? `${event.start_date} – ${event.end_date}` : event.start_date || "—"} />
                <Info label="Admission" value={ticket} />
              </div>
              {exp.key_experience && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1rem", lineHeight: 1.7, color: "var(--charcoal)", borderLeft: "2px solid var(--ink)", paddingLeft: "1rem", marginBottom: "1.5rem" }}>{exp.key_experience}</div>}
              {hasExpExtras && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                  {exp.suitable_for && <Info label="Suitable For" value={exp.suitable_for} />}
                  {exp.recommended_duration && <Info label="Duration" value={exp.recommended_duration} />}
                  {exp.intensity_level && <Info label="Intensity" value={exp.intensity_level} />}
                </div>
              )}
              {hasSports && (
                <div style={{ borderTop: "1px solid var(--border-med)", paddingTop: "1.2rem" }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--silver)", marginBottom: "0.8rem" }}>Sports Info</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {spt.sport_type && <Info label="Sport" value={spt.sport_type} />}
                    {spt.approx_price && <Info label="Ticket Price" value={spt.approx_price} />}
                    {spt.competition_event_info && <Info label="Event Info" value={spt.competition_event_info} />}
                  </div>
                </div>
              )}
            </>
        }
      </div></div>
    </div>
  );
}

function Info({ label, value }) {
  return <div><div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--silver)", marginBottom: "0.2rem" }}>{label}</div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.95rem" }}>{value}</div></div>;
}

function App() {
  const [data, setData] = useState({ matches: [], players: [], hotels: [], restaurants: [], fanEvents: [], shows: [], rankings: [], teams: [], routes: [], mapData: null });
  const [apiReady, setApiReady] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [discoverTab, setDiscoverTab] = useState("hotels");
  const [matchNumber, setMatchNumber] = useState(null);
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    loadSiteData().then((loaded) => { setData(loaded); setApiReady(true); setApiError(null); }).catch((err) => { setApiError(err); setApiReady(false); });
  }, []);

  function viewMap(area) {
    setTimeout(() => scrollToId("la-showcase"), 40);
  }

  return (
    <>
      <Nav />
      <div id="mount-photohero"><PhotoHero /></div>
      <div id="mount-matches"><Matches data={data} onOpenMatch={setMatchNumber} /></div>
      <div id="mount-showcase"><ExploreLA data={data} apiReady={apiReady} apiError={apiError} /></div>
      <div id="mount-discover"><Discover data={data} apiReady={apiReady} apiError={apiError} activeTab={discoverTab} setActiveTab={setDiscoverTab} onOpenEvent={setEventId} /></div>
      <div id="mount-itinerary"><Journey onViewMap={viewMap} /></div>
      <div id="mount-about"><About /></div>
      <div id="mount-footer"><Footer /></div>
      <MatchOverlay matchNumber={matchNumber} data={data} onClose={() => setMatchNumber(null)} />
      <EventOverlay eventId={eventId} onClose={() => setEventId(null)} />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
