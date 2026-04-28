import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import DataNotice from "../components/DataNotice.jsx";
import ExCard from "../components/ExCard.jsx";
import FilterRow from "../components/FilterRow.jsx";
import SyncMap from "../components/SyncMap.jsx";
import { buildExploreItems } from "../lib/explorePool.js";
import { personaActive, personaSummary, sortByPersona } from "../lib/personaSort.js";
import {
  CATEGORY_EMOJIS,
  CATEGORY_FILTERS,
  CATEGORY_PAGE_SUBTITLES,
  CATEGORY_PAGE_TITLES,
  EXPLORE_CATEGORIES,
  EXPLORE_PICKS_KEY,
} from "../constants/explore.js";

const ExploreLA = forwardRef(function ExploreLA(
  { data, apiReady, apiError, journeyLoading = false, journeyPrefs = null, onGoJourney, onPicksChange, onRetry },
  ref
) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedIds, setSelectedIds]       = useState([]);
  const [activeFilters, setActiveFilters]   = useState({});
  const [searchQuery, setSearchQuery]       = useState("");
  const [personaSort, setPersonaSort]       = useState(true);

  // Lets the parent reset us back to the magazine entry view (e.g. when the user
  // clicks "Explore LA" from the Journey CTA, even after they previously drilled in).
  useImperativeHandle(ref, () => ({
    resetToEntry: () => {
      setActiveCategory(null);
      setActiveFilters({});
      setSearchQuery("");
    },
  }));

  const exploreItems = useMemo(() => buildExploreItems(data), [data.allEvents, data.hotels, data.restaurants, data.fanEvents, data.shows]);
  const allExploreItems = useMemo(() => [
    ...exploreItems.hotels, ...exploreItems.restaurants,
    ...exploreItems.events, ...exploreItems.shows, ...exploreItems.attractions,
  ], [exploreItems]);

  const visibleItems  = exploreItems[activeCategory] || [];
  const selectedItems = useMemo(() => allExploreItems.filter((item) => selectedIds.includes(item.id)), [allExploreItems, selectedIds]);

  const filteredItems = useMemo(() => {
    const defs = CATEGORY_FILTERS[activeCategory] || [];
    const q = searchQuery.trim().toLowerCase();
    return visibleItems.filter((item) => {
      // Filter chips (region / price / etc.) take priority — they're explicit picks.
      if (!defs.every(({ key }) => !activeFilters[key] || item[key] === activeFilters[key])) return false;
      if (!q) return true;
      // Match against the fields that show up on the card so search "feels"
      // intuitive: name, area / region, type, flavor, etc.
      return [item.name, item.detail, item.area, item.region, item.type, item.flavor]
        .some((field) => field && String(field).toLowerCase().includes(q));
    });
  }, [visibleItems, activeCategory, activeFilters, searchQuery]);

  const personaOn   = personaSort && personaActive(journeyPrefs, selectedItems);
  const sortedItems = useMemo(
    () => (personaOn ? sortByPersona(filteredItems, activeCategory, journeyPrefs, selectedItems) : filteredItems),
    [filteredItems, activeCategory, journeyPrefs, selectedItems, personaOn]
  );
  const personaLabel = personaOn ? personaSummary(activeCategory, journeyPrefs, selectedItems) : "";

  const selectedByCategory = useMemo(() => {
    const counts = {};
    for (const [cat, items] of Object.entries(exploreItems)) {
      counts[cat] = items.filter((item) => selectedIds.includes(item.id)).length;
    }
    return counts;
  }, [exploreItems, selectedIds]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(EXPLORE_PICKS_KEY) || "[]");
      if (Array.isArray(saved)) setSelectedIds(saved.map((item) => item.id).filter(Boolean));
    } catch { setSelectedIds([]); }
  }, []);

  useEffect(() => {
    if (!apiReady) return;
    const picks = selectedItems.map(({ id, category, markerType, name, detail, lat, lng, officialUrl }) => ({
      id, category, markerType, name, detail, lat, lng, officialUrl,
    }));
    localStorage.setItem(EXPLORE_PICKS_KEY, JSON.stringify(picks));
    onPicksChange?.(picks);
  }, [apiReady, selectedItems, onPicksChange]);

  const toggleItem   = (id) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  const setFilter    = (key, val) => setActiveFilters((prev) => ({ ...prev, [key]: val }));
  const openCategory = (category) => { setActiveCategory(category); setActiveFilters({}); setSearchQuery(""); };

  const [hoverCat, setHoverCat] = useState(null);
  const HOVER_IMAGES = {
    hotels:      "Hotel_1.jpg",
    restaurants: "Resturant.jpg",
    events:      "Fansevent_1.jpg",
    shows:       "shows_4.jpg",
    attractions: "Attraction_1.jpg",
  };
  const HOVER_LABELS = {
    hotels:      "Hotels",
    restaurants: "Restaurants",
    events:      "Fan Events",
    shows:       "Shows",
    attractions: "Attractions",
  };
  const heroImg   = HOVER_IMAGES[hoverCat] || "LA2.jpg";
  const heroLabel = HOVER_LABELS[hoverCat] || "Los Angeles";

  return (
    <section id="la-showcase">
      {!activeCategory ? (
        <div className="lg-magazine">
          <button
            className="lg-mag-vertical"
            type="button"
            onClick={() => openCategory("events")}
            onMouseEnter={() => setHoverCat("events")}
            onMouseLeave={() => setHoverCat(null)}
          >
            Fan Event
          </button>

          <div className="lg-mag-stack">
            <div className="lg-mag-eyebrow">
              <span>Explore</span>
              <em>Los Angeles · N° 26</em>
            </div>

            <button
              className="lg-mag-link lg-mag-link--attr"
              type="button"
              onClick={() => openCategory("attractions")}
              onMouseEnter={() => setHoverCat("attractions")}
              onMouseLeave={() => setHoverCat(null)}
            >
              Attraction
            </button>

            <button
              className="lg-mag-link lg-mag-link--hotel"
              type="button"
              onClick={() => openCategory("hotels")}
              onMouseEnter={() => setHoverCat("hotels")}
              onMouseLeave={() => setHoverCat(null)}
            >
              HOTEL
            </button>

            <div className="lg-mag-row">
              <button
                className="lg-mag-link lg-mag-link--rest"
                type="button"
                onClick={() => openCategory("restaurants")}
                onMouseEnter={() => setHoverCat("restaurants")}
                onMouseLeave={() => setHoverCat(null)}
              >
                Restaurant
              </button>
              <button
                className="lg-mag-link lg-mag-link--show"
                type="button"
                onClick={() => openCategory("shows")}
                onMouseEnter={() => setHoverCat("shows")}
                onMouseLeave={() => setHoverCat(null)}
              >
                Show
              </button>
            </div>
          </div>

          <div
            className="lg-mag-photo"
            style={{ backgroundImage: `url('images/${heroImg}')` }}
          >
            <span className="lg-mag-photo-tag">{heroLabel}</span>
          </div>
        </div>
      ) : (
        <div className="ex-wrap">
          <div className="ex-topbar">
            <button className="ex-back-btn" type="button" onClick={() => setActiveCategory(null)}>← Explore</button>
            <div className="ex-cat-tabs">
              {EXPLORE_CATEGORIES.map(([key, label]) => (
                <button key={key} className={key === activeCategory ? "active" : ""} type="button" onClick={() => openCategory(key)}>
                  {label}
                  {selectedByCategory[key] > 0 && <span className="ex-cat-badge">{selectedByCategory[key]}</span>}
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
            <div className="ex-search">
              <span className="ex-search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                className="ex-search-input"
                placeholder={`Search ${CATEGORY_PAGE_TITLES[activeCategory]?.toLowerCase() || "activities"}…`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search activities"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="ex-search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >×</button>
              )}
            </div>
          </div>
          <div className="ex-filters">
            {(CATEGORY_FILTERS[activeCategory] || []).map(({ key, label, select }) => (
              <FilterRow key={key} items={visibleItems} filterKey={key} label={label} activeValue={activeFilters[key] || null} onSelect={(val) => setFilter(key, val)} select={!!select} />
            ))}
          </div>
          {personaActive(journeyPrefs, selectedItems) && (
            <div className="ex-persona-bar">
              <span className="ex-persona-dot" aria-hidden="true">✦</span>
              <span className="ex-persona-text">
                {personaSort
                  ? <>Sorted for you{personaLabel && <em> · {personaLabel}</em>}</>
                  : "Default order"}
              </span>
              <button
                type="button"
                className="ex-persona-toggle"
                onClick={() => setPersonaSort((on) => !on)}
              >
                {personaSort ? "Show default order" : "Sort by my preferences"}
              </button>
            </div>
          )}
          <div className="ex-body">
            <div className="ex-cards-col">
              {apiError ? (
                <DataNotice title="Backend unavailable" detail="Start the Flask server and click Retry." onRetry={onRetry} />
              ) : !apiReady ? (
                <DataNotice title="Loading…" detail="Waiting for data." />
              ) : sortedItems.length === 0 ? (
                <DataNotice
                  title="No results"
                  detail={searchQuery ? `No matches for "${searchQuery}". Try a different search or clear the filters.` : "Try adjusting the filters."}
                />
              ) : (
                <div className="ex-cards">
                  {sortedItems.map((item, i) => (
                    <ExCard
                      key={item.id}
                      item={item}
                      category={activeCategory}
                      selected={selectedIds.includes(item.id)}
                      onToggle={toggleItem}
                      index={i + 1}
                    />
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
              <button
                className={`ex-go-btn${journeyLoading ? " ex-go-btn--busy" : ""}`}
                type="button"
                aria-busy={journeyLoading || undefined}
                onClick={() => {
                  console.info("[explore] Build My Journey clicked", { journeyLoading, picks: selectedItems.length });
                  if (journeyLoading) {
                    console.warn("[explore] click ignored — journey already generating");
                    return;
                  }
                  if (typeof onGoJourney !== "function") {
                    console.error("[explore] onGoJourney is not a function — wiring broken in main.jsx");
                    return;
                  }
                  onGoJourney();
                }}
              >
                {journeyLoading ? "Building…" : "Build My Journey →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

export default ExploreLA;
