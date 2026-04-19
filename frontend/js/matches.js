// ═══════════════════════════════════════════════════
//  MATCHES — overlay, close, nearby tab toggle
// ═══════════════════════════════════════════════════

function openMatch(id) {
        const m = MATCH_DATA[id];
        document.getElementById("overlayContent").innerHTML = `
    <div style="border-bottom:3px solid var(--ink); margin-bottom:2rem; padding-bottom:0.5rem; display:flex; justify-content:space-between; align-items:baseline;">
      <span style="font-family:'DM Mono',monospace; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--silver);">${
        m.round
      }</span>
      <span style="font-family:'DM Mono',monospace; font-size:0.62rem; color:var(--silver);">${
        m.date
      }</span>
    </div>
    <div class="detail-hero">
      <div class="detail-team"><span class="detail-flag">${
        m.home.flag
      }</span><div class="detail-name">${
          m.home.name
        }</div><div style="font-family:'DM Mono',monospace;font-size:0.6rem;color:var(--silver);">${
          m.home.country
        }</div></div>
      <div class="detail-vs-block"><span class="detail-vs">versus</span><div class="detail-match-info">${
        m.venue
      }</div></div>
      <div class="detail-team"><span class="detail-flag">${
        m.away.flag
      }</span><div class="detail-name">${
          m.away.name
        }</div><div style="font-family:'DM Mono',monospace;font-size:0.6rem;color:var(--silver);">${
          m.away.country
        }</div></div>
    </div>
    <div style="margin-bottom:2.5rem;">
      <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:0.8rem;">Match Storyline</div>
      <p style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.1rem;line-height:1.7;color:var(--charcoal);">${
        m.highlight
      }</p>
    </div>
    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:1rem;">Head-to-Head Record</div>
    <div class="h2h-block">
      <div class="h2h-stat"><div class="h2h-num">${
        m.h2h.total
      }</div><div class="h2h-label">Total Meetings</div></div>
      <div class="h2h-stat"><div class="h2h-num">${
        m.h2h.team1wins
      }</div><div class="h2h-label">${m.home.name} Wins</div></div>
      <div class="h2h-stat"><div class="h2h-num">${
        m.h2h.draws
      }</div><div class="h2h-label">Draws</div></div>
    </div>
    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:1rem;">Star Players to Watch</div>
    <div class="players-row" style="margin-bottom:2.5rem;">
      ${m.players
        .map(
          (p) =>
            `<div class="player-card"><div class="player-number">${p.num}</div><div><div class="player-name">${p.name}</div><div class="player-pos">${p.pos}</div><div style="font-family:'DM Mono',monospace;font-size:0.58rem;color:var(--silver);margin-top:0.15rem;">${p.team}</div></div></div>`
        )
        .join("")}
    </div>
    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:1rem;">Nearby: Hotels & Dining</div>
    <div class="nearby-tabs">
      <button class="nearby-tab active" onclick="toggleNearby('hotels-d')">Hotels</button>
      <button class="nearby-tab" onclick="toggleNearby('restaurants-d')">Restaurants</button>
      <button class="nearby-tab" onclick="toggleNearby('events-d')">Events</button>
    </div>
    <div id="hotels-d" class="nearby-grid">${HOTELS.slice(0, 6)
      .map(
        (h) =>
          `<div class="nearby-card"><div class="nearby-name">${
            h.name
          }</div><div class="nearby-sub">${
            h.region
          }</div><div class="nearby-price">${h.price} · ${"★".repeat(
            h.stars
          )}</div></div>`
      )
      .join("")}</div>
    <div id="restaurants-d" class="nearby-grid" style="display:none">${RESTAURANTS.slice(
      0,
      6
    )
      .map(
        (r) =>
          `<div class="nearby-card"><div class="nearby-name">${r.name}</div><div class="nearby-sub">${r.flavor} · ${r.region}</div><div class="nearby-price">${r.price} · ★ ${r.score}</div></div>`
      )
      .join("")}</div>
    <div id="events-d" class="nearby-grid" style="display:none">${FAN_EVENTS.slice(
      0,
      6
    )
      .map(
        (e) =>
          `<div class="nearby-card"><div class="nearby-name">${e.emoji} ${e.name}</div><div class="nearby-sub">${e.area} · ${e.date}</div><div class="nearby-price">${e.price}</div></div>`
      )
      .join("")}</div>
  `;
        document.getElementById("matchOverlay").style.display = "block";
        document.body.style.overflow = "hidden";
      }
      function closeMatch() {
        document.getElementById("matchOverlay").style.display = "none";
        document.body.style.overflow = "";
      }
      function toggleNearby(id) {
        ["hotels-d", "restaurants-d", "events-d"].forEach((pid) => {
          const el = document.getElementById(pid);
          if (el) el.style.display = "none";
        });
        const t = document.getElementById(id);
        if (t) t.style.display = "grid";
        event.currentTarget
          .closest(".nearby-tabs")
          .querySelectorAll(".nearby-tab")
          .forEach((b) => b.classList.remove("active"));
        event.currentTarget.classList.add("active");
      }

      // ═══════════════ ITINERARY ═══════════════
      const ITIN_TEMPLATES = {
        football: {
          budget: [
            {
              time: "09:00",
              title: "Walk the Hollywood Walk of Fame",
              desc: "Snap iconic star shots before the crowds hit",
            },
            {
              time: "11:30",
              title: "Lunch at Grand Central Market",
              desc: "LA's legendary indoor market — $10-15 meals, huge variety",
            },
            {
              time: "14:00",
              title: "Fan Zone – Farmers Market",
              desc: "Official FIFA Fan Zone · live match replays · free",
            },
            {
              time: "19:00",
              title: "Match Day Pre-Game at Sports Bar",
              desc: "Yard House or O'Brien's — watch pre-match coverage",
            },
            {
              time: "21:00",
              title: "⚽ MATCH AT SOFI STADIUM",
              desc: "Kickoff! Experience the atmosphere of 70,000+ fans",
            },
          ],
          mid: [
            {
              time: "09:30",
              title: "Brunch at Gjusta",
              desc: "Legendary Venice bakery — arrive early to avoid lines",
            },
            {
              time: "11:30",
              title: "FIFA Fan Festival at Exposition Park",
              desc: "Live broadcasts, music, interactive fan experiences",
            },
            {
              time: "14:00",
              title: "Pre-match hotel check-in & rest",
              desc: "Andaz West Hollywood · prime Sunset Strip location",
            },
            {
              time: "17:00",
              title: "Dinner at Night + Market WeHo",
              desc: "Thai street food on Sunset · $30-50pp",
            },
            {
              time: "21:00",
              title: "⚽ MATCH AT SOFI STADIUM",
              desc: "VIP seating · premium World Cup atmosphere",
            },
          ],
          luxury: [
            {
              time: "09:00",
              title: "Breakfast at The West Hollywood EDITION",
              desc: "Rooftop views over Sunset Strip · champagne morning",
            },
            {
              time: "11:00",
              title: "Private Stadium Tour · SoFi Stadium",
              desc: "Behind-the-scenes access · locker rooms · press box",
            },
            {
              time: "14:00",
              title: "Lunch at Nobu Malibu",
              desc: "Oceanfront Japanese dining · celebrity hotspot · $100+",
            },
            {
              time: "18:00",
              title: "Pre-match cocktails at The Roof at The Edition",
              desc: "Sunset views · curated cocktails · see and be seen",
            },
            {
              time: "21:00",
              title: "⚽ MATCH AT SOFI STADIUM · Luxury Box",
              desc: "Premium hospitality suite · catered · unobstructed views",
            },
          ],
        },
        family: {
          budget: [
            {
              time: "09:00",
              title: "Venice Beach Boardwalk",
              desc: "Street performers, skate park, beach — kids love it · Free",
            },
            {
              time: "11:30",
              title: "Lunch at Original Farmers Market",
              desc: "Fan Zone + food court · something for everyone · $15-25",
            },
            {
              time: "14:00",
              title: "Natural History Museum",
              desc: "Exposition Park · T-Rex skeletons · $15 adults, $7 kids",
            },
            {
              time: "17:00",
              title: "Santa Monica Pier",
              desc: "Ferris wheel, games, Pacific Park · Golden hour views",
            },
            {
              time: "19:30",
              title: "Dinner at In-N-Out Burger",
              desc: "California classic · the kids will thank you · $10pp",
            },
          ],
          mid: [
            {
              time: "09:30",
              title: "Universal Studios Hollywood",
              desc: "Theme park · World Cup-themed activations in 2026",
            },
            {
              time: "13:00",
              title: "Lunch at Katsuya West Hollywood",
              desc: "Family-friendly Japanese · kid-friendly sushi options",
            },
            {
              time: "15:00",
              title: "FIFA Fan Festival",
              desc: "Interactive football games · kids' zone · face painting",
            },
            {
              time: "18:00",
              title: "Santa Monica Pier at sunset",
              desc: "Iconic Pacific Park · Ferris wheel · golden hour photos",
            },
            {
              time: "20:00",
              title: "Dinner along the 3rd Street Promenade",
              desc: "Open-air pedestrian mall · plenty of family-friendly options",
            },
          ],
          luxury: [
            {
              time: "09:00",
              title: "Private LA Helicopter Tour",
              desc: "Hollywood Sign · Griffith Observatory · SoFi Stadium from above",
            },
            {
              time: "11:30",
              title: "Lunch at Shutters on the Beach",
              desc: "Oceanfront Santa Monica · perfect for families · $50-80pp",
            },
            {
              time: "14:00",
              title: "Disney Experience",
              desc: "Anaheim · or Warner Bros Studio Tour · behind the magic",
            },
            {
              time: "18:30",
              title: "Sunset Cruise from Marina del Rey",
              desc: "Champagne for adults, mocktails for kids · 90 mins",
            },
            {
              time: "21:00",
              title: "⚽ MATCH AT SOFI STADIUM · Family Suite",
              desc: "Private suite · catered · safe and comfortable for all ages",
            },
          ],
        },
        backpacker: {
          budget: [
            {
              time: "08:00",
              title: "Griffith Observatory sunrise hike",
              desc: "Free access · city views · Hollywood sign backdrop",
            },
            {
              time: "10:30",
              title: "Brunch at Grand Central Market",
              desc: "DTLA · $8-12 · diverse options",
            },
            {
              time: "13:00",
              title: "LACMA + Tar Pits walk",
              desc: "Free entry with student ID · La Brea Tar Pits next door",
            },
            {
              time: "16:00",
              title: "Venice Beach → Muscle Beach",
              desc: "Classic free LA experience · street art · skateboarding",
            },
            {
              time: "20:00",
              title: "FIFA Fan Zone party · Hansen Dam",
              desc: "Free outdoor screening · meet international fans",
            },
          ],
          mid: [
            {
              time: "08:30",
              title: "Runyon Canyon hike",
              desc: "Hollywood Hills · celebrity dog park · Instagram-worthy views",
            },
            {
              time: "11:00",
              title: "Echo Park neighborhood explore",
              desc: "Coffee at Valerie · vintage shops · lake views",
            },
            {
              time: "14:00",
              title: "The Echo live music",
              desc: "Indie venue on Sunset · $15-30 · local scene",
            },
            {
              time: "18:00",
              title: "Dinner at Night + Market WeHo",
              desc: "Thai street food · bold flavors · $30-50pp",
            },
            {
              time: "21:00",
              title: "Hollywood Improv or Comedy Store",
              desc: "Classic LA nightlife · $25-60 · possible celebrity drop-ins",
            },
          ],
          luxury: [
            {
              time: "09:00",
              title: "Brunch at Gjusta",
              desc: "Venice · legendary bakery · $20-30pp",
            },
            {
              time: "11:00",
              title: "Art galleries walk in Culver City",
              desc: "Free · emerging LA artists · gallery hopping",
            },
            {
              time: "14:00",
              title: "The Getty Center visit",
              desc: "Free admission · world-class art · panoramic views",
            },
            {
              time: "18:00",
              title: "Dinner at Bestia",
              desc: "Downtown LA · Italian · $60-80pp · book ahead",
            },
            {
              time: "21:00",
              title: "Cinespia Outdoor Movie",
              desc: "Hollywood Forever Cemetery · $25-35 · picnic vibes",
            },
          ],
        },
        luxury: {
          budget: null,
          mid: null,
          luxury: [
            {
              time: "10:00",
              title: "In-Suite breakfast · The West Hollywood EDITION",
              desc: "Private terrace · city views · personally curated menu",
            },
            {
              time: "12:00",
              title: "Private Shopping on Rodeo Drive",
              desc: "Personal shopper arranged · Gucci, Hermès, Louis Vuitton",
            },
            {
              time: "15:00",
              title: "Spa at Four Seasons Beverly Hills",
              desc: "Signature treatments · 3-hour wellness ritual",
            },
            {
              time: "19:00",
              title: "Dinner at Providence",
              desc: "2-Michelin star · chef's tasting menu with wine pairing · $250+",
            },
            {
              time: "21:30",
              title: "Private Rooftop World Cup Party",
              desc: "The Edition Rooftop · exclusive hire · live entertainment",
            },
          ],
        },
      };

      function generateItinerary() {
        const type = document.getElementById("travelerType").value;
        const budget = document.getElementById("budget").value;
        const days = parseInt(document.getElementById("days").value);
        const matchDate = document.getElementById("matchPref").value;
        const vibe = document.getElementById("vibe").value;
        const result = document.getElementById("itineraryResult");
        const loader = document.getElementById("itinLoader");
        const content = document.getElementById("itinContent");
        result.classList.add("visible");
        loader.style.display = "block";
        content.innerHTML = "";
        const budgetKey =
          budget === "budget" ? "budget" : budget === "mid" ? "mid" : "luxury";
        const typeTemplate = ITIN_TEMPLATES[type] || ITIN_TEMPLATES["football"];
        let template =
          typeTemplate[budgetKey] ||
          typeTemplate["mid"] ||
          ITIN_TEMPLATES["football"]["mid"];
        const matchDates = {
          jun12: { date: "June 12", label: "USA vs Paraguay (M4)" },
          jun15: { date: "June 15", label: "Iran vs New Zealand (M15)" },
          jun18: {
            date: "June 18",
            label: "Switzerland vs UEFA Playoff A (M26)",
          },
          jun21: { date: "June 21", label: "Belgium vs Iran (M39)" },
          jun25: { date: "June 25", label: "UEFA Playoff C vs USA (M59)" },
          jun28: { date: "June 28", label: "Round of 32 (M73)" },
          jul2: { date: "July 2", label: "Round of 32 (M84)" },
          jul10: { date: "July 10", label: "Quarter-Finals (M98)" },
        };
        const md = matchDates[matchDate];
        const vibeActivities = {
          culture: {
            time: "10:00",
            title: "Getty Center visit",
            desc: "World-class art museum · panoramic LA views · free admission",
          },
          beach: {
            time: "10:00",
            title: "Malibu coastal drive",
            desc: "PCH road trip · Point Dume · Zuma Beach · $0 entry",
          },
          nightlife: {
            time: "22:00",
            title: "Sunset Strip nightlife",
            desc: "WeHo club crawl · Skybar · Catch LA · dress to impress",
          },
          film: {
            time: "10:00",
            title: "Warner Bros. Studio Tour",
            desc: "Hollywood sets · props · $70/person · book in advance",
          },
        };
        const dayLabels = [
          "Day 1 · Arrival & First Impressions",
          "Day 2 · The Beautiful Game",
          `Day 3 · Match Day — ${md.label}`,
          "Day 4 · Explore LA",
          "Day 5 · Hollywood & Departure",
          "Day 6 · LA Beaches",
          "Day 7 · Final Day",
        ];
        setTimeout(() => {
          loader.style.display = "none";
          let html = `<div style="margin-bottom:2rem;padding:1.2rem;background:var(--paper);border-left:3px solid var(--ink);">
      <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:0.4rem;">Your Personalized LA World Cup Experience</div>
      <p style="font-family:'Cormorant Garamond',serif;font-size:0.9rem;color:var(--charcoal);">
        Curated for: <strong>${
          type.charAt(0).toUpperCase() + type.slice(1)
        }</strong> · Budget: <strong>${
            budget.charAt(0).toUpperCase() + budget.slice(1)
          }</strong> · ${days} days · Match: <strong>${md.date} · ${
            md.label
          }</strong>
      </p></div>`;
          for (let d = 0; d < days; d++) {
            const isMatchDay = d === 2 && days >= 3;
            const vibeActivity = vibeActivities[vibe];
            html += `<div class="day-block"><div class="day-label">${
              dayLabels[d] || `Day ${d + 1}`
            }</div>
        ${(isMatchDay
          ? template
          : d === 0
          ? [vibeActivity, ...template.slice(1)]
          : template
        )
          .map(
            (item) => `
          <div class="timeline-item"><div class="timeline-time">${item.time}</div><div class="timeline-content"><div class="title">${item.title}</div><div class="desc">${item.desc}</div></div></div>`
          )
          .join("")}
      </div>`;
          }
          html += `<div style="margin-top:2rem;padding:1.2rem;border:1.5px solid var(--border-med);background:var(--paper);">
      <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:0.3rem;">✦ Your LA World Cup Story is Ready</div>
      <p style="font-family:'DM Mono',monospace;font-size:0.65rem;color:var(--silver);">Estimated budget: ${
        budget === "budget"
          ? "$150–250/day"
          : budget === "mid"
          ? "$350–500/day"
          : "$700+/day"
      } · Matches: SoFi Stadium · 39 days of World Cup activities across LA</p></div>`;
          content.innerHTML = html;
        }, 800);
      }
