import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { generateJourney } from "../api.js";
import SyncMap from "../components/SyncMap.jsx";
import { ACTIVITY_MARKS, JOURNEY_SELECTS, TRAVELER_TYPES } from "../constants/journey.js";
import { matchRows } from "../constants/matches.js";

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

export function JourneyResult({ data }) {
  const [highlight, setHighlight] = useState(null);
  const hoverTimer = useRef(null);

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

  const activityPlaces = (data.days || []).flatMap((day) =>
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
              {day.activities.map((act, i) => {
                const hasCoordAct = Number.isFinite(Number(act.lat)) && Number.isFinite(Number(act.lng));
                const isActive = highlight && hasCoordAct
                  && Math.abs(Number(act.lat) - highlight.lat) < 0.0001
                  && Math.abs(Number(act.lng) - highlight.lng) < 0.0001;
                return (
                  <div
                    key={`${act.time}-${i}`}
                    className={`timeline-item${hasCoordAct ? " timeline-item--mappable" : ""}${isActive ? " timeline-item--active" : ""}`}
                    onMouseEnter={() => {
                      if (!hasCoordAct) return;
                      clearTimeout(hoverTimer.current);
                      hoverTimer.current = setTimeout(() => setHighlight({ lat: Number(act.lat), lng: Number(act.lng) }), 200);
                    }}
                    onMouseLeave={() => { clearTimeout(hoverTimer.current); setHighlight(null); }}
                  >
                    <div className="timeline-time">{act.time}</div>
                    <div className="timeline-content">
                      <div className="timeline-mark">{ACTIVITY_MARKS[act.source] || "PLAN"}</div>
                      <div className="title">{act.title}</div>
                      <div className="desc">{act.desc}</div>
                    </div>
                    {hasCoordAct && <span className="timeline-pin">{isActive ? "●" : "○"}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <aside className="journey-map-panel">
        <div className="journey-map-head">
          <span>Live Route Map</span>
          <strong>{mapPlaces.length ? `${mapPlaces.length} locations` : "SoFi Stadium"}</strong>
        </div>
        <div className="journey-map-box"><SyncMap mode="journey" places={mapPlaces} highlight={highlight} /></div>
        <div className="journey-map-note">Selected Explore LA picks appear here with SoFi Stadium highlighted as the match venue.</div>
      </aside>
    </div>
  );
}

// ── Main Journey component ────────────────────────────────────────────────

// World Cup window — date input bounds
const WC_START = "2026-06-11";
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
  { explorePicks = [], selectedMatches = [], onClearMatches, onPrefsChange, setJourney, setLoading, setError },
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

  useEffect(() => {
    if (!selectedMatches.length) return;
    const row = matchRows.find((r) => r.key === selectedMatches[0]);
    if (row?.dateKey) setForm((f) => ({ ...f, match_date: row.dateKey }));
  }, [selectedMatches]);

  useEffect(() => {
    onPrefsChange?.({ type: form.type, budget: form.budget, vibe: form.vibe });
  }, [form.type, form.budget, form.vibe]);

  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  // Compute trip length from dates, capped to 1–7 (backend cap)
  const tripDays = Math.min(7, Math.max(1, daysBetween(form.startDate, form.endDate)));

  const selectedRows = selectedMatches.map((k) => matchRows.find((r) => r.key === k)).filter(Boolean);

  async function submit() {
    setLoading(true); setError(""); setJourney(null);
    const scrollToResult = () => document.getElementById("mount-journey-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    const journeyPicks = explorePicks.slice(0, 12).map(({ id, category, name, detail, officialUrl, lat, lng, markerType }) => ({ id, category, name, detail, officialUrl, lat, lng, markerType }));
    try {
      const result = await generateJourney({ ...form, days: String(tripDays), picks: journeyPicks });
      setJourney(result);
      setTimeout(scrollToResult, 80);
    } catch {
      setError("Unable to connect to the server. Please make sure the Flask API is running.");
      setTimeout(scrollToResult, 80);
    } finally {
      setLoading(false);
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

          <button className="jr-cta-btn" type="button" onClick={() => scrollToId("la-showcase")}>
            <span>Explore LA</span>
            <span className="jr-cta-spark">✦</span>
          </button>

        </div>
      </div>

    </section>
  );
});

export default Journey;
