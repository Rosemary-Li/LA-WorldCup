// ═══════════════════════════════════════════════════
//  SECTION: DISCOVER
// ═══════════════════════════════════════════════════

document.getElementById('mount-discover').innerHTML = `
    <!-- DIVIDER -->
    <div class="section-divider">
      <div class="d1"></div>
      <div class="d2"></div>
    </div>

    <!-- DISCOVER -->
    <section id="discover">
      <div class="section-masthead">
        <div class="section-title">Hotels & Dining</div>
        <div class="section-folio">The Perfect Stay & Table</div>
      </div>
      <div class="tab-bar">
        <button class="tab-btn active" onclick="switchTab('hotels',this)">
          Hotels (26)
        </button>
        <button class="tab-btn" onclick="switchTab('restaurants',this)">
          Restaurants (32)
        </button>
        <button class="tab-btn" onclick="switchTab('events',this)">
          Fan Events
        </button>
        <button class="tab-btn" onclick="switchTab('shows',this)">
          Shows & Entertainment
        </button>
      </div>
      <div class="cards-grid" id="cardsGrid"></div>
    </section>

    <!-- DIVIDER -->
`;
