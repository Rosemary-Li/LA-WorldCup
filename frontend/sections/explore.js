// ═══════════════════════════════════════════════════
//  SECTION: EXPLORE — Leaflet map
// ═══════════════════════════════════════════════════

document.getElementById('mount-explore').innerHTML = `
  <section id="explore">
    <div class="section-masthead">
      <div class="section-title">Explore LA Map</div>
      <div class="section-folio">Greater Los Angeles</div>
    </div>

    <div class="explore-layout">

      <div class="filter-panel">
        <div class="filter-title">Filter By</div>

        <div class="filter-group">
          <div class="filter-group-label">Category</div>
          <button class="filter-btn active" onclick="filterMap('all',this)">All Locations</button>
          <button class="filter-btn" onclick="filterMap('stadium',this)">⚽ SoFi Stadium</button>
          <button class="filter-btn" onclick="filterMap('hotel',this)">🏨 Hotels</button>
          <button class="filter-btn" onclick="filterMap('restaurant',this)">🍽 Restaurants</button>
          <button class="filter-btn" onclick="filterMap('event',this)">🎉 Fan Events</button>
        </div>

        <div class="filter-group">
          <div class="filter-group-label">Area</div>
          <button class="filter-btn" data-area="weho"        onclick="filterArea('weho',this)">West Hollywood</button>
          <button class="filter-btn" data-area="dtla"        onclick="filterArea('dtla',this)">Downtown LA</button>
          <button class="filter-btn" data-area="hollywood"   onclick="filterArea('hollywood',this)">Hollywood</button>
          <button class="filter-btn" data-area="santamonica" onclick="filterArea('santamonica',this)">Santa Monica</button>
          <button class="filter-btn" data-area="inglewood"   onclick="filterArea('inglewood',this)">Inglewood / SoFi</button>
        </div>

        <div id="map-legend-panel" style="margin-top:auto;padding-top:1rem;border-top:1px solid var(--border-ink);">
          <div class="filter-group-label" style="margin-bottom:0.6rem;">Legend</div>
          <div class="lf-legend-item"><span class="lf-legend-dot" style="background:#fff;box-shadow:0 0 6px rgba(255,255,255,0.7)"></span>SoFi Stadium</div>
          <div class="lf-legend-item"><span class="lf-legend-dot" style="background:#b0b0b0"></span>Hotels</div>
          <div class="lf-legend-item"><span class="lf-legend-dot" style="background:#d0d0d0"></span>Restaurants</div>
          <div class="lf-legend-item"><span class="lf-legend-dot" style="background:#888"></span>Fan Events</div>
        </div>
      </div>

      <div id="leaflet-map"></div>

    </div>
  </section>
`;
