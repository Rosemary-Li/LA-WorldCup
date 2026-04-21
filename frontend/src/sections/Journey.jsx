import React, { useRef, useState } from "react";
import { generateJourney } from "../api.js";
import Select from "../components/Select.jsx";
import SyncMap from "../components/SyncMap.jsx";
import { ACTIVITY_MARKS, JOURNEY_SELECTS } from "../constants/journey.js";

function JourneyResult({ data }) {
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

export default function Journey({ explorePicks = [] }) {
  const [form, setForm]       = useState({ type: "football", budget: "mid", days: "5", match_date: "jun12", vibe: "culture" });
  const [loading, setLoading] = useState(false);
  const [journey, setJourney] = useState(null);
  const [error, setError]     = useState("");
  const resultRef = useRef(null);

  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  async function submit() {
    setLoading(true); setError(""); setJourney(null);
    document.getElementById("mount-itinerary")?.scrollIntoView({ behavior: "smooth", block: "start" });
    const journeyPicks = explorePicks.slice(0, 12).map(({ id, category, name, detail, officialUrl, lat, lng, markerType }) => ({ id, category, name, detail, officialUrl, lat, lng, markerType }));
    try {
      const result = await generateJourney({ ...form, picks: journeyPicks });
      setJourney(result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch {
      setError("Unable to connect to the server. Please make sure the Flask API is running.");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } finally {
      setLoading(false);
    }
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
                <Select key={field.key} icon={field.icon} label={field.label} value={form[field.key]} onChange={(v) => update(field.key, v)} options={field.options} wide={field.wide} />
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
          {error   && <p className="journey-error">{error}</p>}
          {journey && <JourneyResult data={journey} />}
        </div>
      </div>
    </section>
  );
}
