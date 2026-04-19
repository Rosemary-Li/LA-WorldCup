// ═══════════════════════════════════════════════════
//  EXPLORE — map filter, area filter, pin info
// ═══════════════════════════════════════════════════

// ═══════════════ MAP ═══════════════
      function filterMap(type, btn) {
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".map-pin").forEach((pin) => {
          if (type === "all") pin.style.display = "block";
          else if (type === "stadium")
            pin.style.display = pin.querySelector(".pin-dot.stadium")
              ? "block"
              : "none";
          else if (type === "hotel")
            pin.style.display = pin.classList.contains("hotel-pin")
              ? "block"
              : "none";
          else if (type === "restaurant")
            pin.style.display = pin.classList.contains("rest-pin")
              ? "block"
              : "none";
          else if (type === "event")
            pin.style.display = pin.classList.contains("event-pin")
              ? "block"
              : "none";
        });
      }
      function filterArea(area) {}
      function filterPrice(price) {}
      function showMapInfo(type, name, location, details) {
        const panel = document.getElementById("mapInfoPanel");
        const content = document.getElementById("mapInfoContent");
        content.innerHTML = `<div style="font-family:'DM Mono',monospace;font-size:0.58rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--charcoal);margin-bottom:0.3rem;">${
          {
            stadium: "Stadium",
            hotel: "Hotel",
            restaurant: "Restaurant",
            event: "Event",
          }[type]
        }</div><div style="font-family:'Cormorant Garamond',serif;font-size:0.95rem;font-weight:600;margin-bottom:0.2rem;">${name}</div><div style="font-family:'DM Mono',monospace;font-size:0.62rem;color:var(--silver);margin-bottom:0.2rem;">${location}</div><div style="font-family:'DM Mono',monospace;font-size:0.62rem;color:var(--silver);line-height:1.5;">${details}</div>`;
        panel.style.display = "block";
      }
