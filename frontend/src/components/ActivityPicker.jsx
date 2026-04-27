import { useEffect, useMemo, useRef, useState } from "react";
import { activityFromPoolItem, buildExploreItems } from "../lib/explorePool.js";

const CATEGORY_LABEL = {
  restaurants: "DINE",
  events:      "EVENT",
  shows:       "SHOW",
  attractions: "ATTRACTION",
  hotels:      "HOTEL",
};

const CATEGORY_FILTERS = [
  ["all",         "All"],
  ["restaurants", "Restaurants"],
  ["events",      "Fan Events"],
  ["shows",       "Shows"],
  ["attractions", "Attractions"],
];

// How many results to actually render — keeps the modal lightweight even
// when the search matches hundreds of rows.
const MAX_VISIBLE = 60;

export default function ActivityPicker({
  open,
  onClose,
  onSave,
  siteData,
  mode = "add",                   // "add" | "edit"
  dayLabel,
  initialTime = "12:00",
  initialActivity = null,         // if editing, the current itinerary activity
}) {
  const [time,         setTime]         = useState(initialTime);
  const [query,        setQuery]        = useState("");
  const [category,     setCategory]     = useState("all");
  const [pickedItem,   setPickedItem]   = useState(null);
  const [keepCurrent,  setKeepCurrent]  = useState(mode === "edit");
  const inputRef = useRef(null);

  // Reset state every time the picker opens — otherwise stale picks from a
  // previous edit bleed into the next session.
  useEffect(() => {
    if (!open) return;
    setTime(initialTime);
    setQuery("");
    setCategory("all");
    setPickedItem(null);
    setKeepCurrent(mode === "edit");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, mode, initialTime]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const pool = useMemo(() => {
    if (!siteData) return [];
    const built = buildExploreItems(siteData);
    // Hotels are excluded by default — they're a stay, not a daytime activity.
    return [
      ...built.restaurants,
      ...built.events,
      ...built.shows,
      ...built.attractions,
    ];
  }, [siteData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return [item.name, item.detail, item.region, item.area, item.type, item.flavor]
        .some((field) => field && String(field).toLowerCase().includes(q));
    });
  }, [pool, query, category]);

  if (!open) return null;

  const visible = filtered.slice(0, MAX_VISIBLE);
  const moreCount = Math.max(0, filtered.length - visible.length);

  function handleSave() {
    if (mode === "edit" && keepCurrent) {
      // User just changed the time on the existing activity — patch in place.
      onSave({ keepCurrent: true, time });
      return;
    }
    if (!pickedItem) return;
    const next = activityFromPoolItem(pickedItem, time);
    onSave({ keepCurrent: false, activity: next });
  }

  const canSave = (mode === "edit" && keepCurrent) || !!pickedItem;

  return (
    <div className="ap-backdrop" onClick={onClose}>
      <div className="ap-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="ap-head">
          <div>
            <span className="ap-eyebrow">{mode === "edit" ? "Edit activity" : "Add activity"}</span>
            <h2 className="ap-title">{dayLabel || "Pick from the LA database"}</h2>
          </div>
          <button className="ap-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="ap-time-row">
          <label className="ap-time-label">Start time</label>
          <input
            type="time"
            className="ap-time-input"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {mode === "edit" && initialActivity && (
          <label className="ap-keep">
            <input
              type="checkbox"
              checked={keepCurrent}
              onChange={(e) => setKeepCurrent(e.target.checked)}
            />
            <span>
              Keep current activity (<strong>{initialActivity.title}</strong>) — change time only
            </span>
          </label>
        )}

        <div className={`ap-search-row ${keepCurrent ? "ap-search-row--disabled" : ""}`}>
          <span className="ap-search-icon">⌕</span>
          <input
            ref={inputRef}
            type="search"
            className="ap-search-input"
            placeholder="Search restaurants, events, shows, attractions…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (keepCurrent) setKeepCurrent(false); }}
            disabled={keepCurrent}
          />
        </div>

        <div className={`ap-cats ${keepCurrent ? "ap-cats--disabled" : ""}`}>
          {CATEGORY_FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={category === key ? "ap-cat ap-cat--on" : "ap-cat"}
              onClick={() => { setCategory(key); if (keepCurrent) setKeepCurrent(false); }}
              disabled={keepCurrent}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ap-list">
          {keepCurrent ? (
            <div className="ap-list-empty">Uncheck "Keep current activity" to pick a different one.</div>
          ) : visible.length === 0 ? (
            <div className="ap-list-empty">
              {pool.length === 0 ? "Loading activities…" : `No matches for "${query}".`}
            </div>
          ) : (
            <>
              {visible.map((item) => {
                const isPicked = pickedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={isPicked ? "ap-row ap-row--on" : "ap-row"}
                    onClick={() => setPickedItem(item)}
                  >
                    <span className="ap-row-tag">{CATEGORY_LABEL[item.category] || "PLAN"}</span>
                    <span className="ap-row-body">
                      <strong className="ap-row-name">{item.name}</strong>
                      <span className="ap-row-meta">{item.detail}</span>
                    </span>
                    {isPicked && <span className="ap-row-check">✓</span>}
                  </button>
                );
              })}
              {moreCount > 0 && (
                <div className="ap-list-more">+{moreCount} more — refine your search to narrow down</div>
              )}
            </>
          )}
        </div>

        <footer className="ap-foot">
          <button type="button" className="ap-btn ap-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="ap-btn ap-btn--primary"
            onClick={handleSave}
            disabled={!canSave}
          >
            {mode === "edit" ? "Save changes" : "Add to itinerary"}
          </button>
        </footer>
      </div>
    </div>
  );
}
