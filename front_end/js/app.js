// ═══════════════════════════════════════════════════
//  APP — projector, cards/tabs, scroll animations,
//        page initialisation
// ═══════════════════════════════════════════════════

// ═══════════════ PROJECTOR ═══════════════
      const TOTAL_FRAMES = 6;
      let currentFrame = 0;
      let projTimer;
      const FRAME_DURATION = 3200;

      function runProjector() {
        const frames = document.querySelectorAll(".film-frame");
        const counter = document.getElementById("filmCounter");
        const progress = document.getElementById("projProgress");

        // Animate through frames
        projTimer = setInterval(() => {
          frames[currentFrame].classList.remove("active");
          currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
          frames[currentFrame].classList.add("active");
          counter.textContent =
            String(currentFrame + 1).padStart(2, "0") +
            " / " +
            String(TOTAL_FRAMES).padStart(2, "0");
          progress.style.width =
            ((currentFrame + 1) / TOTAL_FRAMES) * 100 + "%";

          if (currentFrame === TOTAL_FRAMES - 1) {
            setTimeout(() => skipProjector(), FRAME_DURATION);
          }
        }, FRAME_DURATION);

        // Initial progress
        progress.style.width = (1 / TOTAL_FRAMES) * 100 + "%";
      }

      function skipProjector() {
        clearInterval(projTimer);
        const screen = document.getElementById("projector-screen");
        screen.classList.add("fade-out");
        setTimeout(() => {
          screen.style.display = "none";
          document.body.style.overflow = "";
        }, 1000);
      }

      // Projector intro disabled — skip directly to main page
      // window.addEventListener('load', () => {
      //   document.body.style.overflow = 'hidden';
      //   setTimeout(runProjector, 500);
      // });

// ═══════════════ CARDS ═══════════════
      function switchTab(tab, btn) {
        document
          .querySelectorAll(".tab-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderCards(tab);
      }
      function renderCards(tab) {
        const grid = document.getElementById("cardsGrid");
        let data = [],
          template;
        if (tab === "hotels") {
          data = HOTELS;
          template = (h) =>
            `<div class="rec-card"><div class="rec-card-img">${
              h.emoji
            }</div><div class="rec-card-body"><div class="rec-card-tag">Hotel · ${
              h.region
            }</div><div class="rec-card-name">${
              h.name
            }</div><div class="rec-card-sub">${
              h.address
            }</div><div class="rec-card-price">${
              h.price
            } · <span class="stars">${"★".repeat(
              h.stars
            )}</span></div></div></div>`;
        } else if (tab === "restaurants") {
          data = RESTAURANTS;
          template = (r) =>
            `<div class="rec-card"><div class="rec-card-img">${r.emoji}</div><div class="rec-card-body"><div class="rec-card-tag">${r.flavor} · ${r.region}</div><div class="rec-card-name">${r.name}</div><div class="rec-card-sub">${r.address}</div><div class="rec-card-price">${r.price} · <span class="stars">★</span> ${r.score}</div></div></div>`;
        } else if (tab === "events") {
          data = FAN_EVENTS;
          template = (e) =>
            `<div class="rec-card"><div class="rec-card-img">${e.emoji}</div><div class="rec-card-body"><div class="rec-card-tag">Fan Event · ${e.area}</div><div class="rec-card-name">${e.name}</div><div class="rec-card-sub">${e.desc}</div><div class="rec-card-price">${e.date} · ${e.price}</div></div></div>`;
        } else if (tab === "shows") {
          data = SHOWS;
          template = (s) =>
            `<div class="rec-card"><div class="rec-card-img">${s.emoji}</div><div class="rec-card-body"><div class="rec-card-tag">Entertainment · ${s.venue}</div><div class="rec-card-name">${s.name}</div><div class="rec-card-sub">${s.desc}</div><div class="rec-card-price">${s.date} · ${s.price}</div></div></div>`;
        }
        grid.innerHTML = data.map(template).join("");
      }
      renderCards("hotels");

      // Scroll animations
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.style.opacity = "1";
              e.target.style.transform = "translateY(0)";
            }
          });
        },
        { threshold: 0.08 }
      );
      document.querySelectorAll(".match-card,.rec-card").forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(16px)";
        el.style.transition = "opacity 0.4s,transform 0.4s";
        observer.observe(el);
      });
