import { forwardRef } from "react";

// Mark prefix shown on the match row inside each day's activity list.
// Other sources stay unprefixed — saves horizontal space and the day label
// already provides enough context.
const MATCH_PREFIX = "★";

const ShareCard = forwardRef(function ShareCard({ data }, ref) {
  if (!data) return null;

  const traveler = (data.traveler || "solo").replace(/_/g, " ");
  const days = data.days?.length || 0;
  const budget = (data.budget_label || "").toUpperCase();
  const matchLabel = data.match?.label || "";
  const matchDate  = data.match?.date  || "";

  return (
    <div ref={ref} className="sc-root" aria-hidden="true">
      <div className="sc-frame">

        {/* ── Top bar ── */}
        <div className="sc-top">
          <span className="sc-eyebrow">EST. JUNE 2026</span>
          <span className="sc-logo">LA <span className="sc-logo-x">×</span> WC26</span>
          <span className="sc-eyebrow">SOFI · INGLEWOOD</span>
        </div>

        <div className="sc-divider" />

        {/* ── Headline ── */}
        <div className="sc-headline-block">
          <span className="sc-kicker">My personalized plan</span>
          <h1 className="sc-headline">
            <em>The</em> Beautiful<br />
            Game <em>Comes To</em><br />
            <span className="sc-headline-accent">Hollywood</span>
          </h1>
          <span className="sc-tags">
            {traveler && <span>{traveler}</span>}
            {days  ? <span>{days} days</span> : null}
            {budget && <span>{budget}</span>}
          </span>
        </div>

        <div className="sc-divider sc-divider--short" />

        {/* ── Match (one-line summary, full detail lives in the day list below) ── */}
        {matchLabel && (
          <div className="sc-match-line">
            <span className="sc-match-line-tag">★ MATCHDAY</span>
            <span className="sc-match-line-text">{matchLabel} · {matchDate} · SoFi Stadium</span>
          </div>
        )}

        {/* ── Hotel (one-line) ── */}
        {data.hotel && (
          <div className="sc-hotel-line">
            <span className="sc-hotel-line-tag">⌂ STAY</span>
            <span className="sc-hotel-line-text">
              {data.hotel.hotel_name}
              {[data.hotel.region, data.hotel.star_rating ? `${data.hotel.star_rating}★` : "", data.hotel.price_band].filter(Boolean).length > 0 && " · "}
              {[data.hotel.region, data.hotel.star_rating ? `${data.hotel.star_rating}★` : "", data.hotel.price_band].filter(Boolean).join(" · ")}
            </span>
          </div>
        )}

        {/* ── Per-day full itinerary ── */}
        {data.days?.length > 0 && (
          <div className="sc-days">
            <div className="sc-row-label">✦ {data.days.length}-DAY ITINERARY</div>
            {data.days.map((day) => (
              <div className="sc-day" key={day.label}>
                <div className="sc-day-label">{day.label}</div>
                <ul className="sc-day-list">
                  {(day.activities || []).map((act, i) => (
                    <li className="sc-day-item" key={`${act.time}-${i}`}>
                      <span className="sc-day-time">{act.time}</span>
                      <span className="sc-day-title">
                        {act.source === "match" && <span className="sc-day-mark">{MATCH_PREFIX}</span>}
                        {act.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="sc-spacer" />

        {/* ── Footer / QR ── */}
        <div className="sc-footer">
          <div className="sc-qr">
            <img
              src="/images/la-world-cup-qr.png"
              alt=""
            />
          </div>
          <div className="sc-cta">
            <div className="sc-cta-line">PLAN YOUR OWN</div>
            <div className="sc-cta-url">la-world-cup-journey.vercel.app</div>
            <div className="sc-cta-foot">Scan to build your World Cup itinerary</div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default ShareCard;
