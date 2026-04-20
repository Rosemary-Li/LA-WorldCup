// ═══════════════════════════════════════════════════
//  SECTION: LA PHOTO GALLERY — full-page bento grid
// ═══════════════════════════════════════════════════

document.getElementById('mount-showcase').innerHTML = `
  <section id="la-showcase">

    <div class="lg-header">
      <div class="lg-eyebrow">FIFA World Cup 2026™ · Host City</div>
      <h2 class="lg-title">Los Angeles</h2>
      <p class="lg-sub">The city of sun, style, and the beautiful game</p>
    </div>

    <div class="lg-grid">

      <!-- LA1: large, spans 2 cols × 2 rows — anchor image -->
      <div class="lg-item lg-hero-item" style="background-image:url('images/LA1.jpg')">
        <div class="lg-overlay"><span class="lg-label">Los Angeles</span></div>
      </div>

      <div class="lg-item" style="background-image:url('images/LA2.jpg')">
        <div class="lg-overlay"><span class="lg-label">Los Angeles</span></div>
      </div>

      <div class="lg-item" style="background-image:url('images/LA3.jpg')">
        <div class="lg-overlay"><span class="lg-label">Los Angeles</span></div>
      </div>

      <div class="lg-item" style="background-image:url('images/LA4.jpg')">
        <div class="lg-overlay"><span class="lg-label">Los Angeles</span></div>
      </div>

      <div class="lg-item" style="background-image:url('images/LA5.jpg')">
        <div class="lg-overlay"><span class="lg-label">Los Angeles</span></div>
      </div>

      <div class="lg-item" style="background-image:url('images/LA6.jpg')">
        <div class="lg-overlay"><span class="lg-label">Los Angeles</span></div>
      </div>

      <div class="lg-item" style="background-image:url('images/LA7.jpg')">
        <div class="lg-overlay"><span class="lg-label">Los Angeles</span></div>
      </div>

      <!-- LA8: wide, spans 2 cols at bottom -->
      <div class="lg-item lg-wide-item" style="background-image:url('images/LA8.jpg')">
        <div class="lg-overlay"><span class="lg-label">Los Angeles</span></div>
      </div>

      <div class="lg-item" style="background-image:url('images/LA9.jpg')">
        <div class="lg-overlay"><span class="lg-label">Los Angeles</span></div>
      </div>

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
      color: rgba(0,0,0,0.4);
      margin: 0;
    }

    /* 4-column grid that fills remaining height */
    .lg-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 5px;
      flex: 1;
      min-height: 0; /* critical for flex child to shrink */
    }

    /* LA1: top-left, 2 cols × 2 rows */
    .lg-item:nth-child(1) { grid-column: 1 / 3; grid-row: 1 / 3; }
    /* LA2: col 3, row 1 */
    .lg-item:nth-child(2) { grid-column: 3; grid-row: 1; }
    /* LA3: col 4, row 1 */
    .lg-item:nth-child(3) { grid-column: 4; grid-row: 1; }
    /* LA4: col 3, row 2 */
    .lg-item:nth-child(4) { grid-column: 3; grid-row: 2; }
    /* LA5: col 4, row 2 */
    .lg-item:nth-child(5) { grid-column: 4; grid-row: 2; }
    /* LA6: col 1, row 3 */
    .lg-item:nth-child(6) { grid-column: 1; grid-row: 3; }
    /* LA7: col 2, row 3 */
    .lg-item:nth-child(7) { grid-column: 2; grid-row: 3; }
    /* LA8: cols 3-4, row 3 (wide) */
    .lg-item:nth-child(8) { grid-column: 3 / 5; grid-row: 3; }
    /* LA9: hide (8 photos fill the grid perfectly) */
    .lg-item:nth-child(9) { display: none; }

    .lg-item {
      position: relative;
      background-size: cover;
      background-position: center;
      overflow: hidden;
      cursor: pointer;
    }

    .lg-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0);
      display: flex;
      align-items: flex-end;
      padding: 0.8rem 1rem;
      transition: background 0.3s ease;
    }

    .lg-item:hover .lg-overlay {
      background: rgba(0,0,0,0.32);
    }

    .lg-label {
      font-family: 'DM Mono', monospace;
      font-size: 0.55rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #fff;
      opacity: 0;
      transform: translateY(5px);
      transition: opacity 0.28s ease, transform 0.28s ease;
    }

    .lg-item:hover .lg-label {
      opacity: 1;
      transform: translateY(0);
    }

    @media (max-width: 768px) {
      .lg-grid {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(4, 1fr);
      }
      .lg-item:nth-child(1) { grid-column: 1 / 3; grid-row: 1; }
      .lg-item:nth-child(2) { grid-column: 1; grid-row: 2; }
      .lg-item:nth-child(3) { grid-column: 2; grid-row: 2; }
      .lg-item:nth-child(4) { grid-column: 1; grid-row: 3; }
      .lg-item:nth-child(5) { grid-column: 2; grid-row: 3; }
      .lg-item:nth-child(6) { grid-column: 1; grid-row: 4; }
      .lg-item:nth-child(7) { grid-column: 2; grid-row: 4; }
      .lg-item:nth-child(8) { display: none; }
      .lg-item:nth-child(9) { display: none; }
    }
  </style>
`;
