// ═══════════════════════════════════════════════════
//  ITINERARY — identity selector, itinerary builder
// ═══════════════════════════════════════════════════

// ═══════════════ IDENTITY ═══════════════
      function setIdentity(type, el) {
        document
          .querySelectorAll(".identity-card")
          .forEach((c) => c.classList.remove("active"));
        el.classList.add("active");
        document.getElementById("travelerType").value = type;
        setTimeout(
          () =>
            document
              .getElementById("itinerary")
              .scrollIntoView({ behavior: "smooth" }),
          600
        );
      }

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
