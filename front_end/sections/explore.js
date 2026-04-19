// ═══════════════════════════════════════════════════
//  SECTION: EXPLORE
// ═══════════════════════════════════════════════════

document.getElementById('mount-explore').innerHTML = `
    <!-- DIVIDER -->
    <div class="section-divider">
      <div class="d1"></div>
      <div class="d2"></div>
    </div>

    <!-- EXPLORE MAP -->
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
            <button class="filter-btn active" onclick="filterMap('all',this)">
              All Locations <span class="count">47</span>
            </button>
            <button class="filter-btn" onclick="filterMap('stadium',this)">
              ⚽ Stadiums <span class="count">1</span>
            </button>
            <button class="filter-btn" onclick="filterMap('hotel',this)">
              🏨 Hotels <span class="count">26</span>
            </button>
            <button class="filter-btn" onclick="filterMap('restaurant',this)">
              🍽 Restaurants <span class="count">32</span>
            </button>
            <button class="filter-btn" onclick="filterMap('event',this)">
              🎉 Fan Events <span class="count">8</span>
            </button>
          </div>
          <div class="filter-group">
            <div class="filter-group-label">Area</div>
            <button class="filter-btn" onclick="filterArea('weho')">
              West Hollywood
            </button>
            <button class="filter-btn" onclick="filterArea('dtla')">
              Downtown LA
            </button>
            <button class="filter-btn" onclick="filterArea('hollywood')">
              Hollywood
            </button>
            <button class="filter-btn" onclick="filterArea('santamonica')">
              Santa Monica
            </button>
            <button class="filter-btn" onclick="filterArea('inglewood')">
              Inglewood / SoFi
            </button>
          </div>
          <div class="filter-group">
            <div class="filter-group-label">Price Range</div>
            <button class="filter-btn" onclick="filterPrice('budget')">
              $ Budget
            </button>
            <button class="filter-btn" onclick="filterPrice('mid')">
              $$ Mid-range
            </button>
            <button class="filter-btn" onclick="filterPrice('luxury')">
              $$$ Luxury
            </button>
          </div>
          <div id="mapInfoPanel"><div id="mapInfoContent"></div></div>
        </div>

        <div class="map-container" id="mapContainer">
          <div class="map-bg"></div>
          <div class="map-grid"></div>
          <div class="map-roads"></div>
          <div
            class="map-pin"
            style="left: 25%; top: 72%"
            onclick="showMapInfo('stadium','SoFi Stadium','Inglewood','~70,240 capacity · 8 matches hosted')"
          >
            <div class="pin-dot stadium"></div>
            <div class="pin-label">⚽ SoFi Stadium</div>
          </div>
          <div
            class="map-pin hotel-pin"
            style="left: 52%; top: 32%"
            onclick="showMapInfo('hotel','The West Hollywood EDITION','West Hollywood','★★★★★ · $400+/night · 9040 W Sunset Blvd')"
          >
            <div class="pin-dot hotel"></div>
            <div class="pin-label">The EDITION</div>
          </div>
          <div
            class="map-pin hotel-pin"
            style="left: 49%; top: 36%"
            onclick="showMapInfo('hotel','Andaz West Hollywood','West Hollywood','★★★★ · $200+/night · Sunset Blvd')"
          >
            <div class="pin-dot hotel"></div>
            <div class="pin-label">Andaz WeHo</div>
          </div>
          <div
            class="map-pin hotel-pin"
            style="left: 68%; top: 40%"
            onclick="showMapInfo('hotel','The Biltmore Los Angeles','Downtown LA','★★★★★ · $400+/night · Historic landmark')"
          >
            <div class="pin-dot hotel"></div>
            <div class="pin-label">The Biltmore</div>
          </div>
          <div
            class="map-pin hotel-pin"
            style="left: 22%; top: 40%"
            onclick="showMapInfo('hotel','Shutters on the Beach','Santa Monica','★★★★★ · $400+/night · Oceanfront')"
          >
            <div class="pin-dot hotel"></div>
            <div class="pin-label">Shutters</div>
          </div>
          <div
            class="map-pin rest-pin"
            style="left: 54%; top: 29%"
            onclick="showMapInfo('restaurant','Norah','West Hollywood','$50-100 · American · ★ 4.6')"
          >
            <div class="pin-dot restaurant"></div>
            <div class="pin-label">Norah</div>
          </div>
          <div
            class="map-pin rest-pin"
            style="left: 44%; top: 42%"
            onclick="showMapInfo('restaurant','Night + Market WeHo','West Hollywood','$30-50 · Asian · ★ 4.6')"
          >
            <div class="pin-dot restaurant"></div>
            <div class="pin-label">Night+Market</div>
          </div>
          <div
            class="map-pin rest-pin"
            style="left: 70%; top: 45%"
            onclick="showMapInfo('restaurant','Bestia','Downtown LA','$50-100 · Italian · ★ 4.7')"
          >
            <div class="pin-dot restaurant"></div>
            <div class="pin-label">Bestia</div>
          </div>
          <div
            class="map-pin rest-pin"
            style="left: 19%; top: 46%"
            onclick="showMapInfo('restaurant','Cassia','Santa Monica','$30-50 · Asian Fusion · ★ 4.5')"
          >
            <div class="pin-dot restaurant"></div>
            <div class="pin-label">Cassia</div>
          </div>
          <div
            class="map-pin event-pin"
            style="left: 60%; top: 55%"
            onclick="showMapInfo('event','FIFA Fan Festival™ LA','Exposition Park','Jun 11-15 · Free entry · Live broadcasts + concerts')"
          >
            <div class="pin-dot event"></div>
            <div class="pin-label">Fan Festival</div>
          </div>
          <div
            class="map-pin event-pin"
            style="left: 55%; top: 25%"
            onclick="showMapInfo('event','Hollywood Bowl Orchestra Night','Hollywood','Jun 16 · $40-120 · Outdoor summer concert')"
          >
            <div class="pin-dot event"></div>
            <div class="pin-label">Hollywood Bowl</div>
          </div>
          <div
            class="map-pin event-pin"
            style="left: 53%; top: 22%"
            onclick="showMapInfo('event','Cinespia Outdoor Movie','Hollywood','Jun 18 · $25-35 · Outdoor cinema')"
          >
            <div class="pin-dot event"></div>
            <div class="pin-label">Cinespia</div>
          </div>
          <div
            class="map-pin event-pin"
            style="left: 48%; top: 50%"
            onclick="showMapInfo('event','Farmers Market Fan Zone','Fairfax District','Jun 18-21 · Free · Official FIFA Fan Zone')"
          >
            <div class="pin-dot event"></div>
            <div class="pin-label">Fan Zone</div>
          </div>
          <div class="map-legend">
            <div class="legend-item">
              <div class="legend-dot" style="background: #fff"></div>
              Stadium
            </div>
            <div class="legend-item">
              <div class="legend-dot" style="background: #aaa"></div>
              Hotel
            </div>
            <div class="legend-item">
              <div class="legend-dot" style="background: #ccc"></div>
              Restaurant
            </div>
            <div class="legend-item">
              <div class="legend-dot" style="background: #888"></div>
              Event
            </div>
          </div>
          <div
            style="
              position: absolute;
              top: 1rem;
              left: 50%;
              transform: translateX(-50%);
              font-family: 'DM Mono', monospace;
              font-size: 0.55rem;
              letter-spacing: 0.2em;
              text-transform: uppercase;
              color: rgba(255, 255, 255, 0.2);
            "
          >
            Greater Los Angeles · SoFi Stadium Area
          </div>
        </div>
      </div>
    </section>
`;
