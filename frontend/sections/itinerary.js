// ═══════════════════════════════════════════════════
//  SECTION: PERSONALIZED TRAVELING SCHEDULE
// ═══════════════════════════════════════════════════

document.getElementById('mount-itinerary').innerHTML = `
    <!-- DIVIDER -->
    <div class="section-divider">
      <div class="d1"></div>
      <div class="d2"></div>
    </div>

    <!-- PERSONALIZED TRAVELING SCHEDULE -->
    <section id="itinerary">
      <div class="section-masthead">
        <div class="section-title">Journey</div>
        <div class="section-folio">Your Cinematic LA Story</div>
      </div>
      <p
        style="
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: var(--silver);
          font-size: 1rem;
          margin-bottom: 3rem;
          max-width: 600px;
          line-height: 1.7;
        "
      >
        Tell us who you are and what you love. We'll craft a cinematic LA World
        Cup experience just for you.
      </p>

      <div style="max-width: 900px">
        <div class="builder-controls">
          <div class="control-group">
            <label>Traveler Type</label>
            <select id="travelerType">
              <option value="football">⚽ Football Fan</option>
              <option value="family">👨‍👩‍👧‍👦 Family</option>
              <option value="backpacker">🎒 Backpacker</option>
              <option value="luxury">✦ Luxury Traveler</option>
            </select>
          </div>
          <div class="control-group">
            <label>Budget per Day</label>
            <select id="budget">
              <option value="budget">$100–200 (Budget)</option>
              <option value="mid">$200–400 (Mid-Range)</option>
              <option value="luxury">$400+ (Luxury)</option>
            </select>
          </div>
          <div class="control-group">
            <label>Days in LA</label>
            <select id="days">
              <option value="3">3 Days</option>
              <option value="5" selected>5 Days</option>
              <option value="7">7 Days</option>
            </select>
          </div>
        </div>
        <div class="builder-controls" style="grid-template-columns: 1fr 1fr">
          <div class="control-group">
            <label>Match Date to See</label>
            <select id="matchPref">
              <option value="jun12">Jun 12 · USA vs Paraguay (M4)</option>
              <option value="jun15">Jun 15 · Iran vs New Zealand (M15)</option>
              <option value="jun18">
                Jun 18 · Switzerland vs UEFA Playoff A (M26)
              </option>
              <option value="jun21">Jun 21 · Belgium vs Iran (M39)</option>
              <option value="jun25">
                Jun 25 · UEFA Playoff C vs USA (M59)
              </option>
              <option value="jun28">Jun 28 · Round of 32 (M73)</option>
              <option value="jul2">Jul 2 · Round of 32 (M84)</option>
              <option value="jul10">Jul 10 · Quarter-Finals (M98)</option>
            </select>
          </div>
          <div class="control-group">
            <label>Vibe Preference</label>
            <select id="vibe">
              <option value="culture">🏛 Culture & History</option>
              <option value="beach">🌊 Beach & Nature</option>
              <option value="nightlife">🌙 Nightlife & Shows</option>
              <option value="film">🎬 Hollywood & Film</option>
            </select>
          </div>
        </div>
        <button class="generate-btn" onclick="generateItinerary()">
          ✦ GENERATE MY PERSONALIZED TRAVELING SCHEDULE ✦
        </button>
        <div class="itinerary-result" id="itineraryResult">
          <div
            class="loading-bar"
            id="itinLoader"
            style="display: none; margin-bottom: 2rem"
          ></div>
          <div id="itinContent"></div>
        </div>
      </div>
    </section>
`;
