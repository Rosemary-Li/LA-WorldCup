// ═══════════════════════════════════════════════════
//  ITINERARY — identity selector, itinerary builder
// ═══════════════════════════════════════════════════

// API_BASE is declared in api.js (loaded before this file)

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

// Maps hotel region string → area filter key
const REGION_TO_AREA = {
  'West Hollywood': 'weho', 'WeHo': 'weho', 'Beverly Hills': 'weho', 'Bel Air': 'weho',
  'Downtown LA': 'dtla', 'Downtown': 'dtla', 'Arts District': 'dtla', 'Koreatown': 'dtla', 'Exposition Park': 'dtla',
  'Hollywood': 'hollywood', 'Los Feliz': 'hollywood', 'Silver Lake': 'hollywood', 'Fairfax': 'hollywood',
  'Santa Monica': 'santamonica', 'Venice': 'santamonica', 'Marina del Rey': 'santamonica', 'Malibu': 'santamonica',
  'Inglewood': 'inglewood', 'El Segundo': 'inglewood', 'Culver City': 'inglewood',
};

// ═══════════════ RENDER ═══════════════
function renderItinerary(data) {
  const budgetLabel =
    data.budget_label === "budget" ? "$150–250/day" :
    data.budget_label === "mid"    ? "$350–500/day" : "$700+/day";
  const typeLabel = data.traveler
    ? data.traveler.charAt(0).toUpperCase() + data.traveler.slice(1)
    : "";

  // Determine area key from hotel region
  const region = data.hotel?.region || "";
  const areaKey = REGION_TO_AREA[region]
    || Object.entries(REGION_TO_AREA).find(([k]) => region.toLowerCase().includes(k.toLowerCase()))?.[1]
    || null;

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
    <p style="font-family:'DM Mono',monospace;font-size:0.65rem;color:var(--silver);margin-bottom:1rem;">Estimated budget: ${budgetLabel} · ${data.days.length}-day itinerary · Match: ${data.match.date} at SoFi Stadium</p>
    ${areaKey ? `
    <button onclick="viewOnMap('${areaKey}')" style="
      font-family:'DM Mono',monospace;font-size:0.62rem;letter-spacing:0.15em;text-transform:uppercase;
      border:1.5px solid var(--ink);background:transparent;color:var(--ink);
      padding:0.55rem 1.4rem;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:0.5rem;"
      onmouseover="this.style.background='var(--ink)';this.style.color='var(--white)'"
      onmouseout="this.style.background='transparent';this.style.color='var(--ink)'">
      📍 View on Map
    </button>` : ""}
  </div>`;

  return html;
}
