// ═══════════════════════════════════════════════════
//  SECTION: MATCHES — FIFA-style match schedule
// ═══════════════════════════════════════════════════

document.getElementById('mount-matches').innerHTML = `
  <section id="matches">

    <div class="ms-header">
      <div class="ms-eyebrow">✦ Eight Matches · One Venue ✦</div>
      <div class="ms-title">Los Angeles Match Schedule</div>
      <div class="ms-sub">SoFi Stadium · 1001 S. Stadium Drive, Inglewood, CA</div>
    </div>

    <div class="ms-table">

      <div class="ms-col-head">
        <div></div>
        <div>Match</div>
        <div>Date</div>
        <div>Venue</div>
        <div></div>
      </div>

      <div class="ms-row" onclick="openMatch('usa-paraguay')">
        <div class="ms-badge" style="background:#1D428A">M4</div>
        <div class="ms-match-info">
          <div class="ms-group">Group D</div>
          <div class="ms-teams">
            <span class="ms-flag">🇺🇸</span><span class="ms-team">USA</span>
            <span class="ms-vs">vs</span>
            <span class="ms-team">Paraguay</span><span class="ms-flag">🇵🇾</span>
          </div>
        </div>
        <div class="ms-date-col">
          <div class="ms-date-main">June 12</div>
          <div class="ms-date-sub">Friday · 6:00 pm PT</div>
        </div>
        <div class="ms-venue-col">
          <div class="ms-venue-main">Inglewood, CA</div>
          <div class="ms-venue-sub">SoFi Stadium</div>
        </div>
        <div class="ms-arrow">›</div>
      </div>

      <div class="ms-row" onclick="openMatch('iran-newzealand')">
        <div class="ms-badge" style="background:#239F40">M15</div>
        <div class="ms-match-info">
          <div class="ms-group">Group G</div>
          <div class="ms-teams">
            <span class="ms-flag">🇮🇷</span><span class="ms-team">IR Iran</span>
            <span class="ms-vs">vs</span>
            <span class="ms-team">New Zealand</span><span class="ms-flag">🇳🇿</span>
          </div>
        </div>
        <div class="ms-date-col">
          <div class="ms-date-main">June 15</div>
          <div class="ms-date-sub">Monday · 6:00 pm PT</div>
        </div>
        <div class="ms-venue-col">
          <div class="ms-venue-main">Inglewood, CA</div>
          <div class="ms-venue-sub">SoFi Stadium</div>
        </div>
        <div class="ms-arrow">›</div>
      </div>

      <div class="ms-row" onclick="openMatch('swiss-playoff')">
        <div class="ms-badge" style="background:#C8102E">M26</div>
        <div class="ms-match-info">
          <div class="ms-group">Group B</div>
          <div class="ms-teams">
            <span class="ms-flag">🇨🇭</span><span class="ms-team">Switzerland</span>
            <span class="ms-vs">vs</span>
            <span class="ms-team">Bosnia &amp; Herz.</span><span class="ms-flag">🇧🇦</span>
          </div>
        </div>
        <div class="ms-date-col">
          <div class="ms-date-main">June 18</div>
          <div class="ms-date-sub">Thursday · 12:00 pm PT</div>
        </div>
        <div class="ms-venue-col">
          <div class="ms-venue-main">Inglewood, CA</div>
          <div class="ms-venue-sub">SoFi Stadium</div>
        </div>
        <div class="ms-arrow">›</div>
      </div>

      <div class="ms-row" onclick="openMatch('belgium-iran')">
        <div class="ms-badge" style="background:#C49A00">M39</div>
        <div class="ms-match-info">
          <div class="ms-group">Group G</div>
          <div class="ms-teams">
            <span class="ms-flag">🇧🇪</span><span class="ms-team">Belgium</span>
            <span class="ms-vs">vs</span>
            <span class="ms-team">IR Iran</span><span class="ms-flag">🇮🇷</span>
          </div>
        </div>
        <div class="ms-date-col">
          <div class="ms-date-main">June 21</div>
          <div class="ms-date-sub">Sunday · 12:00 pm PT</div>
        </div>
        <div class="ms-venue-col">
          <div class="ms-venue-main">Inglewood, CA</div>
          <div class="ms-venue-sub">SoFi Stadium</div>
        </div>
        <div class="ms-arrow">›</div>
      </div>

      <div class="ms-row" onclick="openMatch('playoff-usa')">
        <div class="ms-badge" style="background:#E30A17">M59</div>
        <div class="ms-match-info">
          <div class="ms-group">Group D</div>
          <div class="ms-teams">
            <span class="ms-flag">🇹🇷</span><span class="ms-team">Türkiye</span>
            <span class="ms-vs">vs</span>
            <span class="ms-team">USA</span><span class="ms-flag">🇺🇸</span>
          </div>
        </div>
        <div class="ms-date-col">
          <div class="ms-date-main">June 25</div>
          <div class="ms-date-sub">Thursday · 7:00 pm PT</div>
        </div>
        <div class="ms-venue-col">
          <div class="ms-venue-main">Inglewood, CA</div>
          <div class="ms-venue-sub">SoFi Stadium</div>
        </div>
        <div class="ms-arrow">›</div>
      </div>

      <div class="ms-row" onclick="openMatch('r32-m73')">
        <div class="ms-badge" style="background:#5C4033">M73</div>
        <div class="ms-match-info">
          <div class="ms-group">Round of 32</div>
          <div class="ms-teams">
            <span class="ms-flag-tbd">2A</span><span class="ms-team">TBD</span>
            <span class="ms-vs">vs</span>
            <span class="ms-team">TBD</span><span class="ms-flag-tbd">2B</span>
          </div>
        </div>
        <div class="ms-date-col">
          <div class="ms-date-main">June 28</div>
          <div class="ms-date-sub">Sunday · 12:00 pm PT</div>
        </div>
        <div class="ms-venue-col">
          <div class="ms-venue-main">Inglewood, CA</div>
          <div class="ms-venue-sub">SoFi Stadium</div>
        </div>
        <div class="ms-arrow">›</div>
      </div>

      <div class="ms-row" onclick="openMatch('r32-m84')">
        <div class="ms-badge" style="background:#37474F">M84</div>
        <div class="ms-match-info">
          <div class="ms-group">Round of 32</div>
          <div class="ms-teams">
            <span class="ms-flag-tbd">1C</span><span class="ms-team">TBD</span>
            <span class="ms-vs">vs</span>
            <span class="ms-team">TBD</span><span class="ms-flag-tbd">2D</span>
          </div>
        </div>
        <div class="ms-date-col">
          <div class="ms-date-main">July 2</div>
          <div class="ms-date-sub">Thursday · 12:00 pm PT</div>
        </div>
        <div class="ms-venue-col">
          <div class="ms-venue-main">Inglewood, CA</div>
          <div class="ms-venue-sub">SoFi Stadium</div>
        </div>
        <div class="ms-arrow">›</div>
      </div>

      <div class="ms-row" onclick="openMatch('qf-m98')">
        <div class="ms-badge" style="background:#1A1A2E">M98</div>
        <div class="ms-match-info">
          <div class="ms-group">Quarter-Final</div>
          <div class="ms-teams">
            <span class="ms-flag-tbd">W61</span><span class="ms-team">TBD</span>
            <span class="ms-vs">vs</span>
            <span class="ms-team">TBD</span><span class="ms-flag-tbd">W62</span>
          </div>
        </div>
        <div class="ms-date-col">
          <div class="ms-date-main">July 10</div>
          <div class="ms-date-sub">Friday · 12:00 pm PT</div>
        </div>
        <div class="ms-venue-col">
          <div class="ms-venue-main">Inglewood, CA</div>
          <div class="ms-venue-sub">SoFi Stadium</div>
        </div>
        <div class="ms-arrow">›</div>
      </div>

    </div>

    <button class="ms-nav-btn ms-home-btn" type="button" onclick="document.getElementById('photo-hero').scrollIntoView({behavior:'smooth'})">
      <span class="ms-nav-arrow">←</span>
      <span class="ms-nav-text">Home</span>
    </button>
    <button class="ms-nav-btn ms-explore-btn" type="button" onclick="document.getElementById('la-showcase').scrollIntoView({behavior:'smooth'})">
      <span class="ms-nav-text">Explore LA</span>
      <span class="ms-nav-arrow">→</span>
    </button>
  </section>

  <style>
    #matches {
      position: relative;
      height: 100%;
      background: #f5f3ee;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: var(--nav-h, 82px) 4vw 1.5rem;
      box-sizing: border-box;
    }

    .ms-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .ms-eyebrow {
      font-family: 'DM Mono', monospace;
      font-size: 0.58rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: rgba(0,0,0,0.35);
      margin-bottom: 0.6rem;
    }

    .ms-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.8rem, 4vw, 3rem);
      font-weight: 900;
      color: #111;
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .ms-sub {
      font-family: 'DM Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.15em;
      color: rgba(0,0,0,0.4);
    }

    .ms-table {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
    }

    .ms-col-head {
      display: grid;
      grid-template-columns: 64px 1fr 150px 180px 40px;
      padding: 0 0 0.6rem 0;
      border-bottom: 2px solid #111;
      font-family: 'DM Mono', monospace;
      font-size: 0.55rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(0,0,0,0.45);
    }

    .ms-col-head > div:nth-child(2) { padding-left: 1.2rem; }

    .ms-row {
      display: grid;
      grid-template-columns: 64px 1fr 150px 180px 40px;
      align-items: center;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      cursor: pointer;
      transition: background 0.18s;
      min-height: 66px;
    }

    .ms-row:hover { background: rgba(0,0,0,0.03); }
    .ms-row:hover .ms-arrow { transform: translateX(3px); color: #111; }

    .ms-badge {
      align-self: stretch;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'DM Mono', monospace;
      font-size: 0.72rem;
      letter-spacing: 0.05em;
      color: #fff;
      min-height: 66px;
    }

    .ms-match-info { padding: 0.6rem 1.2rem; }

    .ms-group {
      font-family: 'DM Mono', monospace;
      font-size: 0.55rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: rgba(0,0,0,0.4);
      margin-bottom: 0.35rem;
    }

    .ms-teams {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .ms-flag { font-size: 1.25rem; line-height: 1; }

    .ms-flag-tbd {
      font-family: 'DM Mono', monospace;
      font-size: 0.52rem;
      color: rgba(0,0,0,0.3);
    }

    .ms-team {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: #111;
    }

    .ms-vs {
      font-family: 'DM Mono', monospace;
      font-size: 0.52rem;
      letter-spacing: 0.12em;
      color: rgba(0,0,0,0.3);
      text-transform: uppercase;
    }

    .ms-date-col { padding: 0 1rem; }

    .ms-date-main {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      font-weight: 600;
      color: #111;
      margin-bottom: 0.15rem;
    }

    .ms-date-sub {
      font-family: 'DM Mono', monospace;
      font-size: 0.55rem;
      color: rgba(0,0,0,0.45);
    }

    .ms-venue-col { padding: 0 1rem; }

    .ms-venue-main {
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: #111;
      margin-bottom: 0.15rem;
    }

    .ms-venue-sub {
      font-family: 'DM Mono', monospace;
      font-size: 0.55rem;
      color: rgba(0,0,0,0.4);
    }

    .ms-arrow {
      font-size: 1.4rem;
      color: rgba(0,0,0,0.2);
      transition: transform 0.18s, color 0.18s;
      text-align: center;
      font-family: 'DM Mono', monospace;
    }

    .ms-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.7rem;
      min-width: 132px;
      min-height: 48px;
      padding: 0 1rem;
      border: 2px solid #111;
      background: #111;
      color: #f5f3ee;
      cursor: pointer;
      font-family: 'DM Mono', monospace;
      font-size: 0.62rem;
      letter-spacing: 0.16em;
      line-height: 1;
      text-transform: uppercase;
      text-align: center;
      box-shadow: 6px 6px 0 rgba(0,0,0,0.14);
      transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease;
      z-index: 5;
    }

    .ms-home-btn { left: 3vw; }
    .ms-explore-btn { right: 3vw; }

    .ms-home-btn:hover {
      transform: translateY(-50%) translateX(4px);
      box-shadow: 9px 9px 0 rgba(0,0,0,0.16);
      background: #f5f3ee;
      color: #111;
    }

    .ms-explore-btn:hover {
      transform: translateY(-50%) translateX(-4px);
      box-shadow: 9px 9px 0 rgba(0,0,0,0.16);
      background: #f5f3ee;
      color: #111;
    }

    .ms-nav-text {
      white-space: nowrap;
    }

    .ms-nav-arrow {
      font-size: 0.9rem;
      line-height: 1;
    }

    @media (max-width: 768px) {
      .ms-col-head { display: none; }
      .ms-row {
        grid-template-columns: 50px 1fr 30px;
        min-height: auto;
        padding: 0.5rem 0;
      }
      .ms-badge { min-height: 60px; font-size: 0.62rem; }
      .ms-date-col, .ms-venue-col { display: none; }
      .ms-arrow { grid-column: 3; }
      .ms-nav-btn {
        top: auto;
        bottom: 1rem;
        min-width: 0;
        min-height: 44px;
        padding: 0.7rem 1.1rem;
        box-shadow: 5px 5px 0 rgba(0,0,0,0.16);
      }
      .ms-home-btn {
        left: calc(50% - 5.7rem);
        transform: translateX(-50%);
      }
      .ms-explore-btn {
        right: calc(50% - 5.7rem);
        transform: translateX(50%);
      }
      .ms-home-btn:hover {
        transform: translateX(-50%) translateY(-2px);
        box-shadow: 7px 7px 0 rgba(0,0,0,0.18);
      }
      .ms-explore-btn:hover {
        transform: translateX(50%) translateY(-2px);
        box-shadow: 7px 7px 0 rgba(0,0,0,0.18);
      }
    }
  </style>
`;
