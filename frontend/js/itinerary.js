// ═══════════════════════════════════════════════════
//  ITINERARY — identity selector, itinerary builder
// ═══════════════════════════════════════════════════

const API_BASE = "http://127.0.0.1:5000";

// ═══════════════ IDENTITY ═══════════════
function setIdentity(type, el) {
  document.querySelectorAll(".identity-card").forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("travelerType").value = type;
  setTimeout(
    () => document.getElementById("itinerary").scrollIntoView({ behavior: "smooth" }),
    600
  );
}

// ═══════════════ MAIN ENTRY ═══════════════
function generateItinerary() {
  const type      = document.getElementById("travelerType").value;
  const budget    = document.getElementById("budget").value;
  const days      = parseInt(document.getElementById("days").value);
  const matchDate = document.getElementById("matchPref").value;
  const vibe      = document.getElementById("vibe").value;
  const result    = document.getElementById("itineraryResult");
  const loader    = document.getElementById("itinLoader");
  const content   = document.getElementById("itinContent");

  result.classList.add("visible");
  loader.style.display = "block";
  content.innerHTML = "";

  const url = `${API_BASE}/api/itinerary?type=${type}&budget=${budget}&days=${days}&match_date=${matchDate}&vibe=${vibe}`;

  fetch(url)
    .then((r) => { if (!r.ok) throw new Error("API error"); return r.json(); })
    .then((data) => {
      loader.style.display = "none";
      content.innerHTML = renderItinerary(data);
    })
    .catch(() => {
      loader.style.display = "none";
      content.innerHTML = `<p style="font-family:'DM Mono',monospace;font-size:0.75rem;color:var(--silver);padding:2rem;">
        Unable to connect to the server. Please make sure the Flask API is running.
      </p>`;
    });
}

// ═══════════════ RENDER ═══════════════
function renderItinerary(data) {
  const budgetLabel =
    data.budget_label === "budget" ? "$150–250/day" :
    data.budget_label === "mid"    ? "$350–500/day" : "$700+/day";
  const typeLabel = data.traveler
    ? data.traveler.charAt(0).toUpperCase() + data.traveler.slice(1)
    : "";

  let html = `<div style="margin-bottom:2rem;padding:1.2rem;background:var(--paper);border-left:3px solid var(--ink);">
    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:0.4rem;">Your Personalized LA World Cup Experience</div>
    <p style="font-family:'Cormorant Garamond',serif;font-size:0.9rem;color:var(--charcoal);">
      Curated for: <strong>${typeLabel}</strong> · Budget: <strong>${data.budget_label?.charAt(0).toUpperCase() + data.budget_label?.slice(1)}</strong> · ${data.days.length} days · Match: <strong>${data.match.date} · ${data.match.label}</strong>
    </p>`;

  if (data.hotel) {
    html += `<p style="font-family:'DM Mono',monospace;font-size:0.65rem;color:var(--silver);margin-top:0.4rem;">
      🏨 Recommended stay: <strong>${data.hotel.hotel_name}</strong> · ${data.hotel.region} · ${data.hotel.star_rating}★ · $${data.hotel.price_band}/night
    </p>`;
  }
  html += `</div>`;

  for (const day of data.days) {
    html += `<div class="day-block"><div class="day-label">${day.label}</div>`;
    for (const act of day.activities) {
      html += `
        <div class="timeline-item">
          <div class="timeline-time">${act.time}</div>
          <div class="timeline-content">
            <div class="title">${act.title}</div>
            <div class="desc">${act.desc}</div>
          </div>
        </div>`;
    }
    html += `</div>`;
  }

  html += `<div style="margin-top:2rem;padding:1.2rem;border:1.5px solid var(--border-med);background:var(--paper);">
    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:0.3rem;">✦ Your LA World Cup Story is Ready</div>
    <p style="font-family:'DM Mono',monospace;font-size:0.65rem;color:var(--silver);">Estimated budget: ${budgetLabel} · ${data.days.length}-day itinerary · Match: ${data.match.date} at SoFi Stadium</p>
  </div>`;

  return html;
}
