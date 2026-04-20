// ═══════════════════════════════════════════════════
//  SECTION: DISCOVER
// ═══════════════════════════════════════════════════

document.getElementById('mount-discover').innerHTML = `
    <div class="section-divider">
      <div class="d1"></div>
      <div class="d2"></div>
    </div>

    <section id="discover">
      <div class="section-masthead">
        <div class="section-title">Discover Los Angeles</div>
        <div class="section-folio">Hotels · Dining · Events · Teams · Rankings · Transport</div>
      </div>
      <div class="tab-bar">
        <button class="tab-btn active" onclick="switchTab('hotels',this)">Hotels</button>
        <button class="tab-btn" onclick="switchTab('restaurants',this)">Restaurants</button>
        <button class="tab-btn" onclick="switchTab('events',this)">Fan Events</button>
        <button class="tab-btn" onclick="switchTab('shows',this)">Shows</button>
        <button class="tab-btn" onclick="switchTab('teams',this)">Teams</button>
        <button class="tab-btn" onclick="switchTab('rankings',this)">FIFA Rankings</button>
        <button class="tab-btn" onclick="switchTab('routes',this)">Getting There</button>
      </div>
      <div id="filterBar" style="display:flex;gap:0.5rem;flex-wrap:wrap;padding:0.8rem 0 0.2rem;"></div>
      <div class="cards-grid" id="cardsGrid"></div>
    </section>

    <div class="section-divider"><div class="d1"></div><div class="d2"></div></div>
`;
