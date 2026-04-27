import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { generateJourney } from "../api.js";
import SyncMap from "../components/SyncMap.jsx";
import ActivityPicker from "../components/ActivityPicker.jsx";
import ShareCard from "../components/ShareCard.jsx";
import ShareModal from "../components/ShareModal.jsx";
import { buildIcsBlob, dateForDay, googleCalendarUrl, parseMatchDate } from "../lib/calendar.js";
import { mediaForPlace } from "../placeMedia.js";
import { ACTIVITY_MARKS, JOURNEY_SELECTS, TRAVELER_TYPES } from "../constants/journey.js";
import { matchRows } from "../constants/matches.js";

// Map an activity's "source" → category understood by mediaForPlace, so we can
// reuse the scraped place images as activity thumbnails on the itinerary.
const SOURCE_TO_CATEGORY = {
  restaurant:   "restaurants",
  event:        "events",
  explore_pick: "events",
  match:        null, // matches use the SoFi Stadium hero
};
// Strip meal-prefix backend prepends so PLACE_URLS lookup hits the bare name.
//   "Lunch at Forma Restaurant & Cheese Bar" → "Forma Restaurant & Cheese Bar"
function bareTitle(title = "") {
  return title.replace(/^(Breakfast|Brunch|Lunch|Dinner|Drinks|Coffee)\s+at\s+/i, "");
}
function activityPhoto(act) {
  if (act.source === "match") return "images/match.jpg";
  const cat = SOURCE_TO_CATEGORY[act.source] || "events";
  // mediaForPlace.imageUrl can be a local scraped photo, a thum.io screenshot,
  // or the per-category fallback. All are valid backgrounds.
  return mediaForPlace(bareTitle(act.title), cat).imageUrl;
}
function activityUrl(act) {
  if (act.source === "match") {
    return "https://www.sofistadium.com/";
  }
  const cat = SOURCE_TO_CATEGORY[act.source] || "events";
  return mediaForPlace(bareTitle(act.title), cat).officialUrl || "";
}

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

// ── Lucide-style inline SVG icons ─────────────────────────────────────────
const SVG = (children) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IconWallet   = () => SVG(<><path d="M19 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" /><path d="M16 14h.01" /><path d="M21 9V6a2 2 0 0 0-2-2H6a3 3 0 0 0 0 6h15" /></>);
const IconCalendar = () => SVG(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>);
const IconSparkle  = () => SVG(<><path d="M12 3l1.9 5.5L19.5 10 14 12l-2 5.5L10 12 4.5 10 10 8.5 12 3z" /></>);

// Larger 24px traveler-type icons
const TSVG = (children) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const TRAVELER_ICONS = {
  solo:    () => TSVG(<><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 0 0-16 0" /></>),
  family:  () => TSVG(<><circle cx="9" cy="7" r="3.5" /><path d="M2 21v-1a5.5 5.5 0 0 1 11 0v1" /><circle cx="17.5" cy="11" r="2.5" /><path d="M14 21v-1a3.5 3.5 0 0 1 7 0v1" /></>),
  couple:  () => TSVG(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></>),
  friends: () => TSVG(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  group:   () => TSVG(<><circle cx="9" cy="9" r="3.5" /><circle cx="17" cy="9" r="2.5" /><path d="M2 20v-1a5 5 0 0 1 10 0v1" /><path d="M14 20v-1a3.5 3.5 0 0 1 7 0v1" /></>),
};

// ── Helpers ───────────────────────────────────────────────────────────────

function shortMonthDate(date = "") {
  return date.toUpperCase().replace("JUNE", "JUN").replace("JULY", "JUL");
}
function dayName(sub = "") { return sub.split("·")[0].trim(); }

// Descriptions for the 4 stat cards (per value)
const BUDGET_DESC = {
  budget:  "Smart spending, no compromises",
  mid:     "Balanced and enjoyable",
  luxury:  "Premium experience throughout",
};
const VIBE_DESC = {
  football:  "The passion of the game, the joy of togetherness",
  culture:   "Hollywood history & museum gems",
  beach:     "Sun, surf, and Pacific shores",
  nightlife: "Sunset Strip energy from dusk till dawn",
  film:      "Walk where the stars walked",
};

// ── Result component (kept same as before) ────────────────────────────────

export function JourneyResult({ data, siteData }) {
  const [highlight, setHighlight] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const hoverTimer = useRef(null);
  const shareCardRef = useRef(null);

  // Local working copy of the days — every edit / add / delete mutates this,
  // not the prop. Reset whenever a fresh itinerary arrives from the planner.
  const [editedDays, setEditedDays] = useState(data.days || []);
  // { mode: "add"|"edit", dayIdx, actIdx?, time }
  const [pickerState, setPickerState] = useState(null);
  useEffect(() => {
    setEditedDays(data.days || []);
    setPickerState(null);
  }, [data]);

  // Mirror the editable copy back into a data-shaped object so ShareCard /
  // ShareModal / map all see the user's latest edits, not the original plan.
  const editedData = useMemo(() => ({ ...data, days: editedDays }), [data, editedDays]);

  function openEditPicker(dayIdx, actIdx) {
    const act = editedDays[dayIdx]?.activities?.[actIdx];
    if (!act) return;
    setPickerState({ mode: "edit", dayIdx, actIdx, time: act.time || "12:00", current: act });
  }

  function openAddPicker(dayIdx) {
    setPickerState({ mode: "add", dayIdx, time: "12:00", current: null });
  }

  function closePicker() { setPickerState(null); }

  // Apply the user's choice from the picker. `result` shape:
  //   { keepCurrent: true,  time }                — edit mode, time-only change
  //   { keepCurrent: false, activity }            — swap or add a DB-backed item
  function handlePickerSave(result) {
    if (!pickerState) return;
    const { mode, dayIdx, actIdx } = pickerState;

    setEditedDays((prev) => prev.map((day, di) => {
      if (di !== dayIdx) return day;

      if (mode === "add") {
        return { ...day, activities: [...day.activities, result.activity] };
      }

      return {
        ...day,
        activities: day.activities.map((act, ai) => {
          if (ai !== actIdx) return act;
          if (result.keepCurrent) return { ...act, time: result.time };
          // Swap in the new activity but preserve the user's time choice.
          return { ...result.activity, time: result.time };
        }),
      };
    }));
    setPickerState(null);
  }

  function deleteActivity(dayIdx, actIdx) {
    setEditedDays((prev) => prev.map((day, di) => di !== dayIdx ? day : {
      ...day,
      activities: day.activities.filter((_, ai) => ai !== actIdx),
    }));
  }

  // Match date drives every day's actual calendar date — used by both the
  // ICS download and the per-activity Google Calendar links.
  const matchDate = useMemo(() => parseMatchDate(data?.match?.date), [data]);

  function handleDownloadIcs() {
    const blob = buildIcsBlob(editedData);
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "la-wc26-journey.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  // Captures the off-screen ShareCard into a PNG blob. Width is locked to
  // 1080; height is whatever the card actually rendered (>= 1920 for short
  // trips, taller for trips with many days). Passed into the modal so it
  // owns the preview lifecycle.
  const generatePng = useCallback(async () => {
    const node = shareCardRef.current;
    if (!node) throw new Error("ShareCard not mounted");
    // Lazy-load html2canvas — keeps the initial bundle small for users who
    // never hit the share button.
    const html2canvas = (await import("html2canvas")).default;

    // Measure the actual rendered card. The frame has min-height: 1920px so
    // a one-day trip stays IG-Stories shaped; a 20-day trip grows to fit.
    const rect = node.getBoundingClientRect();
    const renderHeight = Math.max(1920, Math.round(rect.height));

    const canvas = await html2canvas(node, {
      width: 1080,
      height: renderHeight,
      windowWidth: 1080,
      windowHeight: renderHeight,
      scale: 1,
      useCORS: true,
      backgroundColor: "#0d0d0d",
      logging: false,
    });
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    if (!blob) throw new Error("canvas.toBlob returned null");
    return blob;
  }, []);

  const budgetLabel = data.budget_label === "budget" ? "$150–250/day" : data.budget_label === "mid" ? "$350–500/day" : "$700+/day";

  const formatHotelPrice = (value) => {
    if (!value) return "";
    const text = String(value);
    const priced = /^\d/.test(text) ? `$${text}` : text;
    return priced.includes("night") ? priced : `${priced}/night`;
  };

  const hotelBits = data.hotel
    ? [data.hotel.region, data.hotel.star_rating ? `${data.hotel.star_rating}★` : "", formatHotelPrice(data.hotel.price_band)].filter(Boolean).join(" · ")
    : "";

  const hasCoord = (o) => Number.isFinite(Number(o?.lat)) && Number.isFinite(Number(o?.lng));

  const pickPlaces = (data.picks_used || []).filter(hasCoord).map((p) => ({
    name: p.name, detail: p.detail || "Explore LA pick",
    lat: Number(p.lat), lng: Number(p.lng),
    markerType: p.markerType || (p.category === "hotels" ? "hotel" : p.category === "restaurants" ? "restaurant" : p.category === "attractions" ? "attraction" : "event"),
  }));

  const activityPlaces = (editedDays || []).flatMap((day) =>
    (day.activities || []).filter(hasCoord).map((act) => ({
      name: act.title, detail: act.desc || "",
      lat: Number(act.lat), lng: Number(act.lng),
      markerType: act.source === "restaurant" ? "restaurant" : act.source === "match" ? "stadium" : "event",
    }))
  );

  const hotelPlace = data.hotel && hasCoord(data.hotel)
    ? [{ name: data.hotel.hotel_name, detail: data.hotel.region || "", lat: Number(data.hotel.latitude), lng: Number(data.hotel.longitude), markerType: "hotel" }]
    : [];

  const seen = new Set();
  const mapPlaces = [...hotelPlace, ...pickPlaces, ...activityPlaces].filter((p) => {
    const key = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const badgeLabel = (value = "") => value.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

  return (
    <div className="journey-result-layout">
      {/* Off-screen IG-Stories template — captured by html2canvas on demand.
          Uses the EDITED data so the share card reflects the user's tweaks. */}
      <ShareCard ref={shareCardRef} data={editedData} />

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        onGeneratePng={generatePng}
        data={editedData}
      />

      <ActivityPicker
        open={!!pickerState}
        onClose={closePicker}
        onSave={handlePickerSave}
        siteData={siteData}
        mode={pickerState?.mode || "add"}
        dayLabel={pickerState ? editedDays[pickerState.dayIdx]?.label : ""}
        initialTime={pickerState?.time || "12:00"}
        initialActivity={pickerState?.current || null}
      />

      <div className="journey-timeline">
        <div className="journey-summary-card">
          <div className="jr-summary-actions">
            <button
              type="button"
              className="sc-share-btn jr-action-btn"
              onClick={handleDownloadIcs}
              title="Download .ics — import into Google / Apple / Outlook Calendar"
            >
              <span className="sc-share-icon">↓</span>
              <span>Calendar</span>
            </button>
            <button
              type="button"
              className="sc-share-btn jr-action-btn"
              onClick={() => setShareOpen(true)}
              title="Share your journey"
            >
              <span className="sc-share-icon">✦</span>
              <span>Share</span>
            </button>
          </div>
          <div className="journey-summary-info">
            <div className="journey-summary-tags">
              <span>{badgeLabel(data.traveler)}</span>
              <span>{badgeLabel(data.budget_label)} Budget</span>
              <span>{data.days.length} Days</span>
              <span>{budgetLabel}</span>
            </div>
            <h2>{data.match.label}</h2>
            <p><span className="jr-summary-icon">▦</span> Match: {data.match.date} at SoFi Stadium</p>
            {data.hotel && <p><span className="jr-summary-icon">⌂</span> Stay: <strong>{data.hotel.hotel_name}</strong>{hotelBits ? ` · ${hotelBits}` : ""}</p>}
            {data.picks_used?.length > 0 && <p><span className="jr-summary-icon">✦</span> {data.picks_used.length} Explore LA picks included in this journey.</p>}
          </div>
          <div className="journey-summary-photo" style={{ backgroundImage: "url('images/match.jpg')" }} />
        </div>

        {editedDays.map((day, dayIdx) => {
          const dayDate = dateForDay(matchDate, day.day_num ?? dayIdx + 1);
          return (
            <div className="day-block" key={day.label || `day-${dayIdx}`}>
              <div className="day-label">{day.label}</div>
              <div className="day-stack">
                {day.activities.map((act, i) => {
                  const itemKey = `${dayIdx}-${i}`;
                  const hasCoordAct = Number.isFinite(Number(act.lat)) && Number.isFinite(Number(act.lng));
                  const isActive = !!highlight && highlight.name === act.title;
                  const photo = activityPhoto(act);
                  const url = activityUrl(act);
                  const calUrl = googleCalendarUrl(act, dayDate);

                  return (
                    <div
                      key={itemKey}
                      className={`timeline-item${hasCoordAct ? " timeline-item--mappable" : ""}${isActive ? " timeline-item--active" : ""}`}
                      onMouseEnter={() => {
                        clearTimeout(hoverTimer.current);
                        hoverTimer.current = setTimeout(
                          () => setHighlight({
                            name: act.title,
                            lat: hasCoordAct ? Number(act.lat) : null,
                            lng: hasCoordAct ? Number(act.lng) : null,
                          }),
                          200
                        );
                      }}
                      onMouseLeave={() => { clearTimeout(hoverTimer.current); setHighlight(null); }}
                    >
                      <div className="timeline-time">
                        <span className="timeline-dot" />
                        {act.time}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-mark">{ACTIVITY_MARKS[act.source] || "PLAN"}</div>
                        <div className="title">{act.title}</div>
                        <div className="desc">{act.desc}</div>
                      </div>
                      {photo && (
                        url ? (
                          <a
                            className="timeline-photo timeline-photo--link"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Open official site for ${act.title}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.04), rgba(0,0,0,0.18)), url('${photo}')` }}
                          />
                        ) : (
                          <div
                            className="timeline-photo"
                            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.04), rgba(0,0,0,0.18)), url('${photo}')` }}
                          />
                        )
                      )}
                      {url ? (
                        <a
                          className="timeline-arrow timeline-arrow--link"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Open official site for ${act.title}`}
                          onClick={(e) => e.stopPropagation()}
                        >›</a>
                      ) : (
                        hasCoordAct && <span className="timeline-arrow">›</span>
                      )}

                      {/* Edit / delete / Google-Calendar — appear on hover */}
                      <div className="timeline-actions" onClick={(e) => e.stopPropagation()}>
                        {calUrl && (
                          <a
                            className="timeline-action timeline-action--cal"
                            href={calUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Add to Google Calendar"
                            onClick={(e) => e.stopPropagation()}
                          >📅</a>
                        )}
                        <button
                          type="button"
                          className="timeline-action timeline-action--edit"
                          onClick={(e) => { e.stopPropagation(); openEditPicker(dayIdx, i); }}
                          title="Swap activity / change time"
                        >✎</button>
                        <button
                          type="button"
                          className="timeline-action timeline-action--del"
                          onClick={(e) => { e.stopPropagation(); deleteActivity(dayIdx, i); }}
                          title="Delete activity"
                        >×</button>
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="timeline-add-btn"
                  onClick={() => openAddPicker(dayIdx)}
                >
                  + Add activity from database
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <aside className="journey-map-panel">
        <div className="journey-map-box"><SyncMap mode="journey" places={mapPlaces} highlight={highlight} /></div>
      </aside>
    </div>
  );
}

// ── Main Journey component ────────────────────────────────────────────────

// World Cup window — date input bounds
const WC_START = "2026-06-01";
const WC_END   = "2026-07-19";

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const ms = new Date(end + "T00:00:00") - new Date(start + "T00:00:00");
  return Math.max(1, Math.round(ms / 86400000) + 1);   // inclusive both ends
}
function shortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const Journey = forwardRef(function Journey(
  { explorePicks = [], selectedMatches = [], onClearMatches, onPrefsChange, onGoExplore, setJourney, setLoading, setError },
  ref
) {
  const [form, setForm] = useState({
    type: "solo",
    budget: "mid",
    days: "5",
    match_date: "jun12",
    vibe: "football",
    startDate: "2026-06-11",
    endDate:   "2026-06-15",
  });

  // Guards against double-clicks on "Build My Journey" while a request is already in-flight.
  // useRef avoids a re-render and dodges any prop staleness on the lifted loading state.
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!selectedMatches.length) return;
    const row = matchRows.find((r) => r.key === selectedMatches[0]);
    if (row?.dateKey) setForm((f) => ({ ...f, match_date: row.dateKey }));
  }, [selectedMatches]);

  useEffect(() => {
    onPrefsChange?.({ type: form.type, budget: form.budget, vibe: form.vibe });
  }, [form.type, form.budget, form.vibe]);

  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const tripDays = Math.max(1, daysBetween(form.startDate, form.endDate));

  const selectedRows = selectedMatches.map((k) => matchRows.find((r) => r.key === k)).filter(Boolean);

  async function submit() {
    console.info("[journey] submit() called", {
      submittingInFlight: submittingRef.current,
      form,
      tripDays,
      selectedMatchKeys: selectedMatches,
      explorePicksCount: explorePicks.length,
    });

    // Edge case: double-click while a request is in-flight.
    if (submittingRef.current) {
      console.warn("[journey] submit() ignored — previous request still in-flight (submittingRef=true). " +
        "If this state persists, the previous fetch hung; api.js now has a 30s timeout so it should self-recover.");
      return;
    }
    submittingRef.current = true;

    setLoading(true); setError(""); setJourney(null);

    // Jump to the itinerary section immediately so the user sees the loading state.
    // The body uses scroll-snap mandatory; temporarily disable it so the smooth scroll
    // reliably lands on #mount-journey-result instead of being yanked to the nearest
    // snap target. Restore after the scroll has settled (~700ms covers most distances).
    const target = document.getElementById("mount-journey-result");
    if (!target) {
      console.error("[journey] #mount-journey-result not in DOM — itinerary section won't be visible");
    } else {
      const prevSnap = document.body.style.scrollSnapType;
      document.body.style.scrollSnapType = "none";
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => { document.body.style.scrollSnapType = prevSnap; }, 800);
    }

    const journeyPicks = explorePicks.slice(0, 12).map(({ id, category, name, detail, officialUrl, lat, lng, markerType }) => ({ id, category, name, detail, officialUrl, lat, lng, markerType }));
    try {
      console.info("[journey] generateJourney() request fired");
      const result = await generateJourney({ ...form, days: String(tripDays), picks: journeyPicks });
      console.info("[journey] generateJourney() resolved — days:", result?.days?.length);
      setJourney(result);
    } catch (err) {
      console.error("[journey] generateJourney() failed:", err);
      // Surface the actual error so the user (or future-me) doesn't have to open
      // DevTools to know what went wrong. Common shapes:
      //   • TypeError: Failed to fetch       → backend down / wrong port / CORS
      //   • Request timed out after 30s      → backend hung
      //   • HTTP 500 ... — <body>            → backend exception (body included)
      //   • HTTP 4xx ...                     → bad request shape
      const raw = err?.message || String(err);
      let msg;
      if (raw.includes("timed out")) {
        msg = "Itinerary generation timed out after 30s — try again or check the Flask logs.";
      } else if (raw.includes("Failed to fetch") || raw.includes("NetworkError")) {
        msg = "Cannot reach the Flask API. Is it running on port 5001?";
      } else {
        msg = `Generation failed — ${raw}`;
      }
      setError(msg);
    } finally {
      setLoading(false);
      submittingRef.current = false;
      console.info("[journey] submit() finished, lock released");
    }
  }
  useImperativeHandle(ref, () => ({ submit }));

  return (
    <section id="itinerary" className="jr-section">
      <div className="jr-grid">

        {/* ── LEFT: Hero ── */}
        <div className="jr-hero">
          <div className="jr-hero-overlay" />
          <div className="jr-hero-content">
            <span className="jr-kicker">Your Personalized Plan</span>
            <h1 className="jr-headline">
              Plan Your<br />
              <em className="jr-headline-accent">LA</em> World Cup<br />
              Journey
            </h1>
          </div>
        </div>

        {/* ── RIGHT: Content ── */}
        <div className="jr-content">

          {/* Your Matches */}
          <div className="jr-card">
            <div className="jr-card-head">
              <span className="jr-trophy">✦</span>
              <span className="jr-card-title">Your Matches ({selectedRows.length})</span>
              {selectedRows.length > 0 && (
                <button className="jr-view-all" onClick={onClearMatches}>Clear</button>
              )}
            </div>
            {selectedRows.length > 0 && (
              <div className="jr-match-list">
                {selectedRows.map((row, i) => (
                  <div className="jr-match-row" key={row.key} style={{ "--m-color": row.badge }}>
                    <div className="jr-match-key">
                      <strong>{row.key}</strong>
                      <em>{row.group}</em>
                    </div>
                    <div className="jr-match-teams">
                      {!row.homeTbd && <span className="jr-match-flag">{row.teams[0]}</span>}
                      <span className="jr-match-name">{row.teams[1]}</span>
                      <span className="jr-match-vs">vs</span>
                      <span className="jr-match-name">{row.teams[2]}</span>
                      {!row.awayTbd && <span className="jr-match-flag">{row.teams[3]}</span>}
                    </div>
                    <div className="jr-match-date">
                      <span className="jr-cal">▦</span>
                      <div>
                        <strong>{shortMonthDate(row.date)}</strong>
                        <em>{dayName(row.sub)}</em>
                      </div>
                    </div>
                    {i === 0 && selectedRows.length > 1 && (
                      <span className="jr-match-primary">primary</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button className="jr-add-more" type="button" onClick={() => scrollToId("matches")}>
              <span className="jr-add-more-plus">+</span>
              <span>{selectedRows.length === 0 ? "Browse Matches" : "Add More Matches"}</span>
            </button>
          </div>

          {/* Who's Coming */}
          <div className="jr-section-block">
            <div className="jr-section-label">Who's Coming to LA?</div>
            <div className="jr-traveler-grid">
              {TRAVELER_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`jr-traveler ${form.type === t.key ? "jr-traveler--on" : ""}`}
                  onClick={() => update("type", t.key)}
                >
                  <span className="jr-traveler-icon">{(TRAVELER_ICONS[t.key] || (() => null))()}</span>
                  <strong className="jr-traveler-label">{t.label}</strong>
                  <em className="jr-traveler-tag">{t.tagline}</em>
                </button>
              ))}
            </div>
          </div>

          {/* Trip Preferences */}
          <div className="jr-section-block">
            <div className="jr-section-label">Trip Preferences</div>
            <div className="jr-stats-grid">

              <div className="jr-stat jr-stat--select">
                <span className="jr-stat-icon"><IconWallet /></span>
                <span className="jr-stat-tag">Daily Budget</span>
                <select
                  className="jr-stat-select"
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                >
                  {JOURNEY_SELECTS.find((f) => f.key === "budget").options.map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <em className="jr-stat-desc">{BUDGET_DESC[form.budget]}</em>
              </div>

              <div className="jr-stat jr-stat--dates">
                <span className="jr-stat-icon"><IconCalendar /></span>
                <span className="jr-stat-tag">Trip Dates</span>
                <div className="jr-date-row">
                  <input
                    type="date"
                    className="jr-date-input"
                    value={form.startDate}
                    min={WC_START}
                    max={WC_END}
                    onChange={(e) => {
                      const start = e.target.value;
                      setForm((f) => ({
                        ...f,
                        startDate: start,
                        endDate: f.endDate < start ? start : f.endDate,
                      }));
                    }}
                  />
                  <span className="jr-date-arrow">→</span>
                  <input
                    type="date"
                    className="jr-date-input"
                    value={form.endDate}
                    min={form.startDate || WC_START}
                    max={WC_END}
                    onChange={(e) => update("endDate", e.target.value)}
                  />
                </div>
                <em className="jr-stat-desc">
                  {tripDays} day{tripDays !== 1 ? "s" : ""} · {shortDate(form.startDate)} – {shortDate(form.endDate)}
                </em>
              </div>

              <div className="jr-stat jr-stat--select">
                <span className="jr-stat-icon"><IconSparkle /></span>
                <span className="jr-stat-tag">Vibe</span>
                <select
                  className="jr-stat-select"
                  value={form.vibe}
                  onChange={(e) => update("vibe", e.target.value)}
                >
                  {JOURNEY_SELECTS.find((f) => f.key === "vibe").options.map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <em className="jr-stat-desc">{VIBE_DESC[form.vibe]}</em>
              </div>

            </div>
          </div>

          <button className="jr-cta-btn" type="button" onClick={onGoExplore}>
            <span>Explore LA</span>
            <span className="jr-cta-spark">✦</span>
          </button>

        </div>
      </div>

    </section>
  );
});

export default Journey;
