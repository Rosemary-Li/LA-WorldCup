// ═══════════════════════════════════════════════════
//  MATCHES — overlay, close, nearby tab toggle,
//            event detail, full squad
// ═══════════════════════════════════════════════════

function openMatch(id) {
  const m = MATCH_DATA[id];
  const team1 = m.home.country;
  const team2 = m.away.country;

  document.getElementById("overlayContent").innerHTML = `
    <div style="border-bottom:3px solid var(--ink); margin-bottom:2rem; padding-bottom:0.5rem; display:flex; justify-content:space-between; align-items:baseline;">
      <span style="font-family:'DM Mono',monospace; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--silver);">${m.round}</span>
      <span style="font-family:'DM Mono',monospace; font-size:0.62rem; color:var(--silver);">${m.date}</span>
    </div>
    <div class="detail-hero">
      <div class="detail-team"><span class="detail-flag">${m.home.flag}</span><div class="detail-name">${m.home.name}</div><div style="font-family:'DM Mono',monospace;font-size:0.6rem;color:var(--silver);">${m.home.country}</div></div>
      <div class="detail-vs-block"><span class="detail-vs">versus</span><div class="detail-match-info">${m.venue}</div></div>
      <div class="detail-team"><span class="detail-flag">${m.away.flag}</span><div class="detail-name">${m.away.name}</div><div style="font-family:'DM Mono',monospace;font-size:0.6rem;color:var(--silver);">${m.away.country}</div></div>
    </div>
    <div style="margin-bottom:2.5rem;">
      <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:0.8rem;">Match Storyline</div>
      <p style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.1rem;line-height:1.7;color:var(--charcoal);">${m.highlight}</p>
    </div>
    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:1rem;">Head-to-Head Record</div>
    <div class="h2h-block">
      <div class="h2h-stat"><div class="h2h-num">${m.h2h.total}</div><div class="h2h-label">Total Meetings</div></div>
      <div class="h2h-stat"><div class="h2h-num">${m.h2h.team1wins}</div><div class="h2h-label">${m.home.name} Wins</div></div>
      <div class="h2h-stat"><div class="h2h-num">${m.h2h.draws}</div><div class="h2h-label">Draws</div></div>
    </div>
    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:1rem;">Star Players to Watch</div>
    <div class="players-row" style="margin-bottom:2.5rem;">
      ${m.players.map((p) =>
        `<div class="player-card"><div class="player-number">${p.num}</div><div><div class="player-name">${p.name}</div><div class="player-pos">${p.pos}</div><div style="font-family:'DM Mono',monospace;font-size:0.58rem;color:var(--silver);margin-top:0.15rem;">${p.team}</div></div></div>`
      ).join("")}
    </div>
    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:1rem;">More Information</div>
    <div class="nearby-tabs">
      <button class="nearby-tab active" onclick="toggleNearby('hotels-d',this)">Hotels</button>
      <button class="nearby-tab" onclick="toggleNearby('restaurants-d',this)">Restaurants</button>
      <button class="nearby-tab" onclick="toggleNearby('events-d',this)">Events</button>
      <button class="nearby-tab" onclick="loadTicketsPanel('${m.match_number || ""}',this)">Tickets</button>
      <button class="nearby-tab" onclick="loadSquadPanel('${team1}','${team2}',this)">Full Squad</button>
    </div>
    <div id="hotels-d" class="nearby-grid">
      ${HOTELS.slice(0, 6).map((h) =>
        `<div class="nearby-card"><div class="nearby-name">${h.name}</div><div class="nearby-sub">${h.region}</div><div class="nearby-price">${h.price} · ${"★".repeat(h.stars)}</div></div>`
      ).join("")}
    </div>
    <div id="restaurants-d" class="nearby-grid" style="display:none">
      ${RESTAURANTS.slice(0, 6).map((r) =>
        `<div class="nearby-card"><div class="nearby-name">${r.name}</div><div class="nearby-sub">${r.flavor} · ${r.region}</div><div class="nearby-price">${r.price} · ★ ${r.score}</div></div>`
      ).join("")}
    </div>
    <div id="events-d" class="nearby-grid" style="display:none">
      ${FAN_EVENTS.slice(0, 6).map((e) =>
        `<div class="nearby-card"><div class="nearby-name">${e.emoji} ${e.name}</div><div class="nearby-sub">${e.area} · ${e.date}</div><div class="nearby-price">${e.price}</div></div>`
      ).join("")}
    </div>
    <div id="tickets-d" class="nearby-grid" style="display:none">
      <div style="padding:1rem;color:var(--silver);font-family:'DM Mono',monospace;font-size:0.65rem;grid-column:1/-1;">Loading ticket data...</div>
    </div>
    <div id="squad-d" class="nearby-grid" style="display:none">
      <div style="padding:1rem;color:var(--silver);font-family:'DM Mono',monospace;font-size:0.65rem;grid-column:1/-1;">Loading squad data...</div>
    </div>
  `;

  document.getElementById("matchOverlay").style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeMatch() {
  document.getElementById("matchOverlay").style.display = "none";
  document.body.style.overflow = "";
}

function toggleNearby(id, btn) {
  ["hotels-d", "restaurants-d", "events-d", "tickets-d", "squad-d"].forEach((pid) => {
    const el = document.getElementById(pid);
    if (el) el.style.display = "none";
  });
  const t = document.getElementById(id);
  if (t) t.style.display = "grid";
  if (btn) {
    btn.closest(".nearby-tabs").querySelectorAll(".nearby-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  }
}

// ═══════════════ TICKETS ═══════════════
function loadTicketsPanel(matchNumber, btn) {
  toggleNearby("tickets-d", btn);
  const panel = document.getElementById("tickets-d");
  if (panel.dataset.loaded) return;
  if (!matchNumber) {
    panel.innerHTML = `<div style="grid-column:1/-1;font-family:'DM Mono',monospace;font-size:0.65rem;color:var(--silver);padding:1rem;">Ticket data not available for this match.</div>`;
    return;
  }

  fetch(`${API_BASE}/api/tickets/${matchNumber}`)
    .then(r => r.json())
    .then(tickets => {
      if (!tickets.length) {
        panel.innerHTML = `<div style="grid-column:1/-1;font-family:'DM Mono',monospace;font-size:0.65rem;color:var(--silver);padding:1rem;">No ticket data found.</div>`;
        return;
      }

      const statusColor = { "Available": "#2d8a3e", "Low Stock": "#d4720a", "Sold Out": "#c0392b", "Waitlist": "#888" };
      const statusEmoji = { "Available": "✓", "Low Stock": "!", "Sold Out": "✕", "Waitlist": "⏳" };

      // Group by category
      const grouped = {};
      tickets.forEach(t => {
        const cat = t.ticket_category;
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(t);
      });

      let html = "";
      Object.entries(grouped).forEach(([cat, rows]) => {
        const price = rows[0].price_usd;
        const status = rows[0].ticket_status;
        const color  = statusColor[status] || "#888";
        const emoji  = statusEmoji[status] || "–";
        const sections = rows.map(r => r.seating_section).join(" / ");

        html += `<div class="nearby-card" style="grid-column:1/-1;display:grid;grid-template-columns:1fr auto;align-items:start;gap:0.5rem;">
          <div>
            <div class="nearby-name" style="font-size:0.78rem;">${cat}</div>
            <div class="nearby-sub" style="font-size:0.65rem;margin-top:0.2rem;">${sections}</div>
          </div>
          <div style="text-align:right;white-space:nowrap;">
            <div style="font-family:'DM Mono',monospace;font-size:0.85rem;font-weight:600;color:var(--ink);">$${parseFloat(price).toFixed(0)}</div>
            <div style="font-family:'DM Mono',monospace;font-size:0.6rem;color:${color};margin-top:0.15rem;">${emoji} ${status}</div>
          </div>
        </div>`;
      });

      panel.innerHTML = html;
      panel.dataset.loaded = "1";
    })
    .catch(() => {
      panel.innerHTML = `<div style="grid-column:1/-1;font-family:'DM Mono',monospace;font-size:0.65rem;color:var(--silver);padding:1rem;">Could not load ticket data.</div>`;
    });
}


// ═══════════════ FULL SQUAD ═══════════════
function loadSquadPanel(team1, team2, btn) {
  toggleNearby("squad-d", btn);
  const panel = document.getElementById("squad-d");
  if (panel.dataset.loaded) return;

  Promise.all([
    fetch(`${API_BASE}/api/players/${encodeURIComponent(team1)}`).then((r) => r.json()).catch(() => []),
    fetch(`${API_BASE}/api/players/${encodeURIComponent(team2)}`).then((r) => r.json()).catch(() => []),
  ]).then(([p1, p2]) => {
    const renderPlayers = (team, players) => {
      if (!players.length) return `<div style="grid-column:1/-1;font-family:'DM Mono',monospace;font-size:0.65rem;color:var(--silver);padding:0.5rem 0;">No squad data for ${team}</div>`;
      return `<div style="grid-column:1/-1;font-family:'DM Mono',monospace;font-size:0.58rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--silver);margin:1rem 0 0.5rem;">${team}</div>` +
        players.map((p) =>
          `<div class="nearby-card"><div class="nearby-name">${p.player_name}${p.is_star ? " ★" : ""}</div><div class="nearby-sub">${p.position} · ${p.club}</div><div class="nearby-price">Age ${p.age} · ${p.caps} caps · ${p.goals} goals</div></div>`
        ).join("");
    };
    panel.innerHTML = renderPlayers(team1, p1) + renderPlayers(team2, p2);
    panel.dataset.loaded = "1";
  });
}

// ═══════════════ EVENT DETAIL ═══════════════
function openEventDetail(id) {
  const overlay = document.getElementById("eventOverlay");
  const content = document.getElementById("eventOverlayContent");
  content.innerHTML = `<div style="font-family:'DM Mono',monospace;font-size:0.7rem;color:var(--silver);padding:2rem;">Loading...</div>`;
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";

  fetch(`${API_BASE}/api/events/${id}`)
    .then((r) => r.json())
    .then((e) => {
      const exp = e.experience_detail || {};
      const spt = e.sports_detail || {};
      const dateRange = e.end_date && e.end_date !== e.start_date
        ? `${e.start_date} – ${e.end_date}`
        : (e.start_date || "");
      const ticket = exp.ticket_price || spt.ticket_price || exp.admission_info || "See venue";

      content.innerHTML = `
        <div style="border-bottom:2px solid var(--ink);margin-bottom:1.5rem;padding-bottom:0.5rem;">
          <div style="font-family:'DM Mono',monospace;font-size:0.58rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:0.4rem;">${e.category_label || e.category || "Event"}</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:1.6rem;font-weight:700;color:var(--ink);line-height:1.2;">${e.event_name}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
          <div><div style="font-family:'DM Mono',monospace;font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--silver);margin-bottom:0.2rem;">Venue</div><div style="font-family:'Cormorant Garamond',serif;font-size:0.95rem;">${e.venue_name || "—"}</div></div>
          <div><div style="font-family:'DM Mono',monospace;font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--silver);margin-bottom:0.2rem;">Location</div><div style="font-family:'Cormorant Garamond',serif;font-size:0.95rem;">${e.area || e.city || "—"}</div></div>
          <div><div style="font-family:'DM Mono',monospace;font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--silver);margin-bottom:0.2rem;">Dates</div><div style="font-family:'Cormorant Garamond',serif;font-size:0.95rem;">${dateRange || "—"}</div></div>
          <div><div style="font-family:'DM Mono',monospace;font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--silver);margin-bottom:0.2rem;">Admission</div><div style="font-family:'Cormorant Garamond',serif;font-size:0.95rem;">${ticket}</div></div>
          ${exp.recommended_duration ? `<div><div style="font-family:'DM Mono',monospace;font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--silver);margin-bottom:0.2rem;">Duration</div><div style="font-family:'Cormorant Garamond',serif;font-size:0.95rem;">${exp.recommended_duration}</div></div>` : ""}
          ${exp.suitable_for ? `<div><div style="font-family:'DM Mono',monospace;font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--silver);margin-bottom:0.2rem;">Suitable For</div><div style="font-family:'Cormorant Garamond',serif;font-size:0.95rem;">${exp.suitable_for}</div></div>` : ""}
        </div>
        ${exp.key_experience ? `<div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1rem;line-height:1.7;color:var(--charcoal);border-left:2px solid var(--ink);padding-left:1rem;">${exp.key_experience}</div>` : ""}
        ${exp.transportation ? `<div style="margin-top:1.2rem;font-family:'DM Mono',monospace;font-size:0.65rem;color:var(--silver);">🚇 Getting there: ${exp.transportation}</div>` : ""}
      `;
    })
    .catch(() => {
      content.innerHTML = `<div style="font-family:'DM Mono',monospace;font-size:0.7rem;color:var(--silver);padding:2rem;">Could not load event details.</div>`;
    });
}

function closeEventDetail() {
  document.getElementById("eventOverlay").style.display = "none";
  document.body.style.overflow = "";
}
