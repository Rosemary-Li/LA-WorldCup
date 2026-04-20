// ═══════════════════════════════════════════════════
//  SECTION: EXPLORE LA — photo gateways to Discover tabs
// ═══════════════════════════════════════════════════

document.getElementById('mount-showcase').innerHTML = `
  <section id="la-showcase">

    <div class="lg-header">
      <div class="lg-eyebrow">Choose Your Los Angeles Scene</div>
      <h2 class="lg-title">Explore LA</h2>
      <p class="lg-sub">Hover a photo, pick a chapter, then jump straight into the live database view.</p>
    </div>

    <div class="lg-grid">
      <button class="lg-card lg-large" type="button" onclick="openDiscoverTab('hotels')" aria-label="Open Hotels" style="--lg-img:url('images/LA1.jpg')">
        <span class="lg-card-inner">
          <span class="lg-face lg-front"></span>
          <span class="lg-face lg-back">
            <span class="lg-kicker">Stay</span>
            <span class="lg-name">Hotels</span>
            <span class="lg-action">View picks ↓</span>
          </span>
        </span>
      </button>

      <button class="lg-card" type="button" onclick="openDiscoverTab('restaurants')" aria-label="Open Restaurants" style="--lg-img:url('images/LA2.jpg')">
        <span class="lg-card-inner">
          <span class="lg-face lg-front"></span>
          <span class="lg-face lg-back">
            <span class="lg-kicker">Taste</span>
            <span class="lg-name">Restaurants</span>
            <span class="lg-action">View dining ↓</span>
          </span>
        </span>
      </button>

      <button class="lg-card" type="button" onclick="openDiscoverTab('events')" aria-label="Open Fan Events" style="--lg-img:url('images/LA3.jpg')">
        <span class="lg-card-inner">
          <span class="lg-face lg-front"></span>
          <span class="lg-face lg-back">
            <span class="lg-kicker">Gather</span>
            <span class="lg-name">Fan Events</span>
            <span class="lg-action">View events ↓</span>
          </span>
        </span>
      </button>

      <button class="lg-card" type="button" onclick="openDiscoverTab('shows')" aria-label="Open Shows" style="--lg-img:url('images/LA4.jpg')">
        <span class="lg-card-inner">
          <span class="lg-face lg-front"></span>
          <span class="lg-face lg-back">
            <span class="lg-kicker">After Dark</span>
            <span class="lg-name">Shows</span>
            <span class="lg-action">View shows ↓</span>
          </span>
        </span>
      </button>

      <button class="lg-card" type="button" onclick="openDiscoverTab('teams')" aria-label="Open Teams" style="--lg-img:url('images/LA5.jpg')">
        <span class="lg-card-inner">
          <span class="lg-face lg-front"></span>
          <span class="lg-face lg-back">
            <span class="lg-kicker">Tournament</span>
            <span class="lg-name">Teams</span>
            <span class="lg-action">View teams ↓</span>
          </span>
        </span>
      </button>

      <button class="lg-card" type="button" onclick="openDiscoverTab('rankings')" aria-label="Open FIFA Rankings" style="--lg-img:url('images/LA6.jpg')">
        <span class="lg-card-inner">
          <span class="lg-face lg-front"></span>
          <span class="lg-face lg-back">
            <span class="lg-kicker">Form Guide</span>
            <span class="lg-name">FIFA Rankings</span>
            <span class="lg-action">View table ↓</span>
          </span>
        </span>
      </button>

      <button class="lg-card lg-wide" type="button" onclick="openDiscoverTab('routes')" aria-label="Open Getting There" style="--lg-img:url('images/LA8.jpg')">
        <span class="lg-card-inner">
          <span class="lg-face lg-front"></span>
          <span class="lg-face lg-back">
            <span class="lg-kicker">Arrive</span>
            <span class="lg-name">Getting There</span>
            <span class="lg-action">View routes ↓</span>
          </span>
        </span>
      </button>

      <button class="lg-card" type="button" onclick="document.getElementById('about').scrollIntoView({behavior:'smooth'})" aria-label="Open About Us" style="--lg-img:url('images/LA9.jpg')">
        <span class="lg-card-inner">
          <span class="lg-face lg-front"></span>
          <span class="lg-face lg-back">
            <span class="lg-kicker">Credits</span>
            <span class="lg-name">About Us</span>
            <span class="lg-action">Meet the team ↓</span>
          </span>
        </span>
      </button>
    </div>

  </section>

  <style>
    #la-showcase {
      height: 100%;
      background: #fff;
      display: flex;
      flex-direction: column;
      padding: var(--nav-h, 82px) 2.5vw 1.5rem;
      box-sizing: border-box;
    }

    .lg-header {
      text-align: center;
      margin-bottom: 1rem;
      flex-shrink: 0;
    }

    .lg-eyebrow {
      font-family: 'DM Mono', monospace;
      font-size: 0.55rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: rgba(0,0,0,0.35);
      margin-bottom: 0.4rem;
    }

    .lg-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.8rem, 4vw, 3.2rem);
      font-weight: 900;
      color: #111;
      line-height: 1;
      margin: 0 0 0.3rem;
    }

    .lg-sub {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 0.95rem;
      color: rgba(0,0,0,0.45);
      margin: 0;
    }

    .lg-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      grid-template-rows: repeat(3, minmax(0, 1fr));
      gap: 8px;
      flex: 1;
      min-height: 0;
    }

    .lg-card {
      appearance: none;
      border: 0;
      padding: 0;
      background: transparent;
      position: relative;
      min-width: 0;
      min-height: 0;
      cursor: pointer;
      perspective: 1000px;
    }

    .lg-large { grid-column: span 2; grid-row: span 2; }
    .lg-wide { grid-column: span 2; }

    .lg-card-inner {
      position: absolute;
      inset: 0;
      display: block;
      transform-style: preserve-3d;
      transition: transform 0.72s cubic-bezier(.2,.7,.2,1);
      transition-delay: 0s;
    }

    .lg-card:hover .lg-card-inner,
    .lg-card:focus-visible .lg-card-inner {
      transform: rotateY(180deg);
      transition-delay: 0.2s;
    }

    .lg-face {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      backface-visibility: hidden;
    }

    .lg-front {
      background-image: var(--lg-img);
      background-size: cover;
      background-position: center;
    }

    .lg-front::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.36), rgba(0,0,0,0.04));
    }

    .lg-back {
      transform: rotateY(180deg);
      background: #111;
      color: #fff;
      padding: 1.15rem;
      box-sizing: border-box;
      border: 1px solid #111;
      text-align: center;
    }

    .lg-back::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image: var(--lg-img);
      background-size: cover;
      background-position: center;
      opacity: 0.34;
      transform: scaleX(-1) scale(1.06);
    }

    .lg-back::after {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.46);
    }

    .lg-kicker,
    .lg-name,
    .lg-action {
      position: relative;
      z-index: 1;
    }

    .lg-kicker {
      font-family: 'DM Mono', monospace;
      font-size: 0.62rem;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.72);
      margin-bottom: 0.65rem;
    }

    .lg-name {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.65rem, 3vw, 3.1rem);
      font-weight: 900;
      line-height: 0.96;
      text-align: center;
      text-shadow: 0 2px 18px rgba(0,0,0,0.42);
    }

    .lg-action {
      font-family: 'DM Mono', monospace;
      font-size: 0.64rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.78);
      margin-top: 0.95rem;
    }

    @media (max-width: 768px) {
      #la-showcase {
        padding: var(--nav-h, 82px) 1rem 1rem;
      }
      .lg-header {
        margin-bottom: 0.8rem;
      }
      .lg-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-rows: repeat(5, minmax(88px, 1fr));
      }
      .lg-large {
        grid-column: span 2;
        grid-row: span 1;
      }
      .lg-wide {
        grid-column: span 2;
      }
      .lg-back {
        padding: 0.9rem;
      }
    }
  </style>
`;
