// ═══════════════════════════════════════════════════
//  SECTION: PROJECTOR
// ═══════════════════════════════════════════════════

document.getElementById('mount-projector').innerHTML = `
<!-- ══════════════════════════
     PROJECTOR INTRO SCREEN
══════════════════════════ -->
    <div id="projector-screen" style="display: none">
      <!-- Sprocket holes -->
      <div class="sprocket-strip left">
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
      </div>
      <div class="sprocket-strip right">
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
        <div class="sprocket-hole"></div>
      </div>

      <!-- Projector beam from top -->
      <div class="proj-beam"></div>

      <!-- Film gate -->
      <div class="film-gate">
        <div class="film-grain"></div>
        <div class="film-scratch"></div>
        <div class="film-scratch"></div>
        <div class="film-scratch"></div>

        <!-- Film frames -->
        <div class="film-frames" id="filmFrames">
          <!-- Frame 0: Production card -->
          <div class="film-frame active" id="frame0">
            <div
              class="frame-visual"
              style="flex-direction: column; text-align: center; gap: 1rem"
            >
              <div
                style="
                  width: 120px;
                  height: 120px;
                  border: 4px solid rgba(255, 255, 255, 0.3);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto;
                "
              >
                <!-- Projector icon SVG -->
                <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
                  <circle
                    cx="40"
                    cy="40"
                    r="18"
                    stroke="rgba(255,255,255,0.5)"
                    stroke-width="2"
                  />
                  <circle cx="40" cy="40" r="8" fill="rgba(255,255,255,0.3)" />
                  <line
                    x1="40"
                    y1="0"
                    x2="40"
                    y2="15"
                    stroke="rgba(255,255,255,0.3)"
                    stroke-width="2"
                  />
                  <line
                    x1="40"
                    y1="65"
                    x2="40"
                    y2="80"
                    stroke="rgba(255,255,255,0.3)"
                    stroke-width="2"
                  />
                  <line
                    x1="0"
                    y1="40"
                    x2="15"
                    y2="40"
                    stroke="rgba(255,255,255,0.3)"
                    stroke-width="2"
                  />
                  <line
                    x1="65"
                    y1="40"
                    x2="80"
                    y2="40"
                    stroke="rgba(255,255,255,0.3)"
                    stroke-width="2"
                  />
                  <line
                    x1="11"
                    y1="11"
                    x2="22"
                    y2="22"
                    stroke="rgba(255,255,255,0.2)"
                    stroke-width="2"
                  />
                  <line
                    x1="58"
                    y1="58"
                    x2="69"
                    y2="69"
                    stroke="rgba(255,255,255,0.2)"
                    stroke-width="2"
                  />
                </svg>
              </div>
              <div
                style="
                  font-family: 'DM Mono', monospace;
                  font-size: 0.7rem;
                  color: rgba(255, 255, 255, 0.4);
                  letter-spacing: 0.3em;
                "
              >
                A COLUMBIA PICTURES PRESENTATION
              </div>
              <div
                style="
                  font-family: 'Playfair Display', serif;
                  font-size: 2.5rem;
                  font-weight: 900;
                  color: #fff;
                  letter-spacing: 0.04em;
                "
              >
                FIFA WORLD CUP
              </div>
              <div
                style="
                  font-family: 'Playfair Display', serif;
                  font-style: italic;
                  font-size: 1rem;
                  color: rgba(255, 255, 255, 0.5);
                "
              >
                2026 · Los Angeles · An Old Hollywood Production
              </div>
            </div>
          </div>

          <!-- Frame 1: 1966 England (Wembley goal) -->
          <div class="film-frame" id="frame1">
            <div class="frame-visual">
              <svg
                viewBox="0 0 640 360"
                xmlns="http://www.w3.org/2000/svg"
                style="max-width: 640px; width: 100%"
              >
                <!-- Crowd stands -->
                <rect width="640" height="360" fill="#0a0a0a" />
                <!-- Stadium terraces -->
                <rect x="0" y="200" width="640" height="160" fill="#111" />
                <rect x="0" y="200" width="640" height="5" fill="#1a1a1a" />
                <!-- Pitch -->
                <ellipse
                  cx="320"
                  cy="320"
                  rx="300"
                  ry="80"
                  fill="#1a1a1a"
                  stroke="#222"
                  stroke-width="1"
                />
                <!-- Goal posts -->
                <line
                  x1="250"
                  y1="120"
                  x2="250"
                  y2="220"
                  stroke="rgba(255,255,255,0.7)"
                  stroke-width="3"
                />
                <line
                  x1="390"
                  y1="120"
                  x2="390"
                  y2="220"
                  stroke="rgba(255,255,255,0.7)"
                  stroke-width="3"
                />
                <line
                  x1="250"
                  y1="120"
                  x2="390"
                  y2="120"
                  stroke="rgba(255,255,255,0.7)"
                  stroke-width="3"
                />
                <!-- Crossbar net -->
                <line
                  x1="250"
                  y1="130"
                  x2="390"
                  y2="130"
                  stroke="rgba(255,255,255,0.15)"
                  stroke-width="1"
                />
                <line
                  x1="260"
                  y1="120"
                  x2="260"
                  y2="220"
                  stroke="rgba(255,255,255,0.08)"
                  stroke-width="1"
                />
                <line
                  x1="280"
                  y1="120"
                  x2="280"
                  y2="220"
                  stroke="rgba(255,255,255,0.08)"
                  stroke-width="1"
                />
                <line
                  x1="300"
                  y1="120"
                  x2="300"
                  y2="220"
                  stroke="rgba(255,255,255,0.08)"
                  stroke-width="1"
                />
                <line
                  x1="320"
                  y1="120"
                  x2="320"
                  y2="220"
                  stroke="rgba(255,255,255,0.08)"
                  stroke-width="1"
                />
                <line
                  x1="340"
                  y1="120"
                  x2="340"
                  y2="220"
                  stroke="rgba(255,255,255,0.08)"
                  stroke-width="1"
                />
                <line
                  x1="360"
                  y1="120"
                  x2="360"
                  y2="220"
                  stroke="rgba(255,255,255,0.08)"
                  stroke-width="1"
                />
                <line
                  x1="380"
                  y1="120"
                  x2="380"
                  y2="220"
                  stroke="rgba(255,255,255,0.08)"
                  stroke-width="1"
                />
                <!-- Ball -->
                <circle
                  cx="320"
                  cy="125"
                  r="12"
                  fill="rgba(255,255,255,0.9)"
                  stroke="#888"
                  stroke-width="1"
                />
                <!-- Motion lines -->
                <line
                  x1="260"
                  y1="200"
                  x2="305"
                  y2="130"
                  stroke="rgba(255,255,255,0.15)"
                  stroke-width="1"
                  stroke-dasharray="4,4"
                />
                <!-- Crowd silhouettes -->
                <g fill="rgba(255,255,255,0.06)">
                  <ellipse cx="50" cy="190" rx="20" ry="30" />
                  <ellipse cx="100" cy="185" rx="18" ry="28" />
                  <ellipse cx="150" cy="192" rx="22" ry="32" />
                  <ellipse cx="500" cy="188" rx="20" ry="30" />
                  <ellipse cx="550" cy="183" rx="18" ry="28" />
                  <ellipse cx="590" cy="190" rx="20" ry="30" />
                </g>
                <!-- Vignette -->
                <radialGradient id="vig1" cx="50%" cy="50%">
                  <stop offset="60%" stop-color="transparent" />
                  <stop offset="100%" stop-color="rgba(0,0,0,0.8)" />
                </radialGradient>
                <rect width="640" height="360" fill="url(#vig1)" />
              </svg>
            </div>
            <div class="frame-caption">
              <div class="caption-year">World Cup 1966 · Wembley, England</div>
              <div class="caption-title">England's Finest Hour</div>
              <div class="caption-sub">
                The disputed goal heard around the world
              </div>
            </div>
          </div>

          <!-- Frame 2: 1970 Brazil Pelé -->
          <div class="film-frame" id="frame2">
            <div class="frame-visual">
              <svg
                viewBox="0 0 640 360"
                xmlns="http://www.w3.org/2000/svg"
                style="max-width: 640px; width: 100%"
              >
                <rect width="640" height="360" fill="#080808" />
                <!-- Sky / stadium lights -->
                <ellipse
                  cx="100"
                  cy="30"
                  rx="40"
                  ry="15"
                  fill="rgba(255,255,255,0.08)"
                />
                <ellipse
                  cx="540"
                  cy="30"
                  rx="40"
                  ry="15"
                  fill="rgba(255,255,255,0.08)"
                />
                <!-- Player silhouette - Pelé bicycle kick style -->
                <g transform="translate(280,140)" fill="rgba(255,255,255,0.8)">
                  <!-- Body -->
                  <ellipse cx="30" cy="0" rx="12" ry="18" />
                  <!-- Head -->
                  <circle cx="30" cy="-25" r="12" />
                  <!-- Arms -->
                  <line
                    x1="18"
                    y1="-5"
                    x2="-10"
                    y2="-25"
                    stroke="rgba(255,255,255,0.8)"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                  <line
                    x1="42"
                    y1="-5"
                    x2="68"
                    y2="-25"
                    stroke="rgba(255,255,255,0.8)"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                  <!-- Legs - kick position -->
                  <line
                    x1="22"
                    y1="15"
                    x2="5"
                    y2="40"
                    stroke="rgba(255,255,255,0.8)"
                    stroke-width="5"
                    stroke-linecap="round"
                  />
                  <line
                    x1="38"
                    y1="15"
                    x2="60"
                    y2="-10"
                    stroke="rgba(255,255,255,0.8)"
                    stroke-width="5"
                    stroke-linecap="round"
                  />
                </g>
                <!-- Ball -->
                <circle cx="360" cy="100" r="18" fill="rgba(255,255,255,0.9)" />
                <!-- Motion arc -->
                <path
                  d="M345 118 Q380 60 420 90"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  stroke-width="1.5"
                  stroke-dasharray="5,5"
                />
                <!-- Pitch markings -->
                <ellipse
                  cx="320"
                  cy="330"
                  rx="280"
                  ry="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  stroke-width="1"
                />
                <!-- Vignette -->
                <radialGradient id="vig2" cx="50%" cy="50%">
                  <stop offset="55%" stop-color="transparent" />
                  <stop offset="100%" stop-color="rgba(0,0,0,0.85)" />
                </radialGradient>
                <rect width="640" height="360" fill="url(#vig2)" />
                <!-- Grain lines -->
                <g stroke="rgba(255,255,255,0.015)" stroke-width="1">
                  <line x1="0" y1="40" x2="640" y2="40" />
                  <line x1="0" y1="80" x2="640" y2="80" />
                  <line x1="0" y1="120" x2="640" y2="120" />
                  <line x1="0" y1="200" x2="640" y2="200" />
                </g>
              </svg>
            </div>
            <div class="frame-caption">
              <div class="caption-year">World Cup 1970 · Mexico City</div>
              <div class="caption-title">O Rei — The King of the Game</div>
              <div class="caption-sub">
                Brazil's golden era, forever immortalized on film
              </div>
            </div>
          </div>

          <!-- Frame 3: 1986 Maradona Hand of God -->
          <div class="film-frame" id="frame3">
            <div class="frame-visual">
              <svg
                viewBox="0 0 640 360"
                xmlns="http://www.w3.org/2000/svg"
                style="max-width: 640px; width: 100%"
              >
                <rect width="640" height="360" fill="#090909" />
                <!-- Scoreboard suggestion -->
                <rect
                  x="10"
                  y="10"
                  width="160"
                  height="40"
                  fill="rgba(255,255,255,0.04)"
                  rx="2"
                />
                <text
                  x="20"
                  y="28"
                  font-family="monospace"
                  font-size="11"
                  fill="rgba(255,255,255,0.3)"
                >
                  ARG 1 : 0 ENG
                </text>
                <text
                  x="20"
                  y="42"
                  font-family="monospace"
                  font-size="9"
                  fill="rgba(255,255,255,0.15)"
                >
                  52' MEXICO CITY
                </text>
                <!-- Goalkeeper jumping -->
                <g transform="translate(450,80)">
                  <circle cx="0" cy="-20" r="11" />
                  <rect x="-10" y="-10" width="20" height="28" rx="5" />
                  <line
                    x1="-10"
                    y1="-5"
                    x2="-35"
                    y2="-28"
                    stroke="#888"
                    stroke-width="5"
                    stroke-linecap="round"
                  />
                  <line
                    x1="10"
                    y1="-5"
                    x2="30"
                    y2="-25"
                    stroke="#888"
                    stroke-width="5"
                    stroke-linecap="round"
                  />
                  <line
                    x1="-5"
                    y1="18"
                    x2="-12"
                    y2="45"
                    stroke="#888"
                    stroke-width="5"
                    stroke-linecap="round"
                  />
                  <line
                    x1="5"
                    y1="18"
                    x2="15"
                    y2="45"
                    stroke="#888"
                    stroke-width="5"
                    stroke-linecap="round"
                  />
                </g>
                <!-- Maradona smaller, hand up -->
                <g transform="translate(300,120)" fill="rgba(255,255,255,0.85)">
                  <circle cx="0" cy="-20" r="10" />
                  <rect x="-9" y="-11" width="18" height="25" rx="4" />
                  <line
                    x1="-9"
                    y1="-5"
                    x2="-30"
                    y2="-35"
                    stroke="rgba(255,255,255,0.85)"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                  <line
                    x1="9"
                    y1="-5"
                    x2="22"
                    y2="-15"
                    stroke="rgba(255,255,255,0.85)"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                </g>
                <!-- Ball near hand -->
                <circle cx="310" cy="85" r="13" fill="rgba(255,255,255,0.85)" />
                <!-- "?" overlay for controversy -->
                <text
                  x="316"
                  y="93"
                  font-family="Georgia"
                  font-size="14"
                  fill="rgba(0,0,0,0.5)"
                  font-weight="bold"
                >
                  ?
                </text>
                <!-- Goalposts -->
                <line
                  x1="400"
                  y1="60"
                  x2="400"
                  y2="230"
                  stroke="rgba(255,255,255,0.5)"
                  stroke-width="3"
                />
                <line
                  x1="560"
                  y1="60"
                  x2="560"
                  y2="230"
                  stroke="rgba(255,255,255,0.5)"
                  stroke-width="3"
                />
                <line
                  x1="400"
                  y1="60"
                  x2="560"
                  y2="60"
                  stroke="rgba(255,255,255,0.5)"
                  stroke-width="3"
                />
                <!-- Vignette -->
                <radialGradient id="vig3" cx="50%" cy="50%">
                  <stop offset="50%" stop-color="transparent" />
                  <stop offset="100%" stop-color="rgba(0,0,0,0.9)" />
                </radialGradient>
                <rect width="640" height="360" fill="url(#vig3)" />
              </svg>
            </div>
            <div class="frame-caption">
              <div class="caption-year">
                World Cup 1986 · Azteca Stadium, Mexico
              </div>
              <div class="caption-title">
                "A Little with the Head of Maradona..."
              </div>
              <div class="caption-sub">
                The goal that divided the world — and thrilled it
              </div>
            </div>
          </div>

          <!-- Frame 4: 2022 Qatar Final -->
          <div class="film-frame" id="frame4">
            <div class="frame-visual">
              <svg
                viewBox="0 0 640 360"
                xmlns="http://www.w3.org/2000/svg"
                style="max-width: 640px; width: 100%"
              >
                <rect width="640" height="360" fill="#070707" />
                <!-- Stadium with massive lights -->
                <g fill="rgba(255,255,255,0.06)">
                  <rect x="0" y="0" width="640" height="150" />
                </g>
                <!-- Pitch center -->
                <ellipse
                  cx="320"
                  cy="300"
                  rx="260"
                  ry="60"
                  fill="#0f0f0f"
                  stroke="rgba(255,255,255,0.07)"
                  stroke-width="1"
                />
                <line
                  x1="320"
                  y1="240"
                  x2="320"
                  y2="360"
                  stroke="rgba(255,255,255,0.07)"
                  stroke-width="1"
                />
                <!-- Trophy silhouette -->
                <g transform="translate(260,60)" fill="rgba(255,255,255,0.9)">
                  <path
                    d="M60 0 L80 0 L75 80 L85 90 L85 110 L35 110 L35 90 L45 80 Z"
                  />
                  <path d="M75 20 Q100 30 95 60 Q85 70 75 65 Z" />
                  <path d="M45 20 Q20 30 25 60 Q35 70 45 65 Z" />
                  <rect x="20" y="105" width="80" height="12" rx="2" />
                </g>
                <!-- Player lifting trophy - celebration -->
                <g transform="translate(140,120)" fill="rgba(255,255,255,0.7)">
                  <circle cx="30" cy="-30" r="13" />
                  <rect x="20" y="-17" width="20" height="30" rx="4" />
                  <line
                    x1="20"
                    y1="-10"
                    x2="-5"
                    y2="-35"
                    stroke="rgba(255,255,255,0.7)"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                  <line
                    x1="40"
                    y1="-10"
                    x2="55"
                    y2="-35"
                    stroke="rgba(255,255,255,0.7)"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                  <line
                    x1="25"
                    y1="13"
                    x2="18"
                    y2="45"
                    stroke="rgba(255,255,255,0.7)"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                  <line
                    x1="35"
                    y1="13"
                    x2="42"
                    y2="45"
                    stroke="rgba(255,255,255,0.7)"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                </g>
                <!-- Confetti dots -->
                <g fill="rgba(255,255,255,0.4)">
                  <circle cx="50" cy="80" r="2" />
                  <circle cx="120" cy="40" r="2" />
                  <circle cx="80" cy="120" r="1.5" />
                  <circle cx="200" cy="60" r="2" />
                  <circle cx="450" cy="90" r="2" />
                  <circle cx="520" cy="50" r="1.5" />
                  <circle cx="580" cy="100" r="2" />
                  <circle cx="480" cy="130" r="2" />
                  <circle cx="160" cy="100" r="1.5" />
                  <circle cx="350" cy="50" r="2" />
                  <circle cx="420" cy="70" r="1.5" />
                  <circle cx="250" cy="90" r="2" />
                </g>
                <!-- Score display -->
                <rect
                  x="230"
                  y="20"
                  width="180"
                  height="35"
                  fill="rgba(255,255,255,0.05)"
                  rx="2"
                />
                <text
                  x="320"
                  y="43"
                  font-family="Georgia"
                  font-size="18"
                  fill="rgba(255,255,255,0.5)"
                  text-anchor="middle"
                  font-weight="bold"
                >
                  ARG 3 : 3 FRA
                </text>
                <!-- Vignette -->
                <radialGradient id="vig4" cx="50%" cy="50%">
                  <stop offset="50%" stop-color="transparent" />
                  <stop offset="100%" stop-color="rgba(0,0,0,0.85)" />
                </radialGradient>
                <rect width="640" height="360" fill="url(#vig4)" />
              </svg>
            </div>
            <div class="frame-caption">
              <div class="caption-year">
                World Cup Final 2022 · Lusail Stadium, Qatar
              </div>
              <div class="caption-title">The Greatest Final Ever Played</div>
              <div class="caption-sub">
                Argentina. France. 3-3. Penalty glory. Tears & triumph.
              </div>
            </div>
          </div>

          <!-- Frame 5: Coming to LA -->
          <div class="film-frame" id="frame5">
            <div
              class="frame-visual"
              style="flex-direction: column; text-align: center; gap: 1.5rem"
            >
              <!-- Hollywood sign + stadium silhouette -->
              <svg
                viewBox="0 0 600 280"
                xmlns="http://www.w3.org/2000/svg"
                style="max-width: 600px; width: 100%"
              >
                <rect width="600" height="280" fill="#080808" />
                <!-- Hills -->
                <path
                  d="M0 200 Q100 120 200 150 Q280 110 350 140 Q430 100 500 130 Q560 115 600 140 L600 280 L0 280Z"
                  fill="#111"
                />
                <!-- Hollywood sign (stylized letters) -->
                <g
                  fill="rgba(255,255,255,0.55)"
                  font-family="Playfair Display, serif"
                  font-weight="900"
                  font-size="28"
                >
                  <text x="55" y="125">HOLLYWOOD</text>
                </g>
                <!-- Stadium silhouette (modern) -->
                <g fill="rgba(255,255,255,0.08)">
                  <ellipse cx="300" cy="230" rx="160" ry="40" />
                  <rect x="150" y="185" width="300" height="50" rx="4" />
                  <path
                    d="M150 190 Q170 160 200 165 L400 165 Q430 160 450 190Z"
                  />
                </g>
                <!-- "2026" large -->
                <text
                  x="300"
                  y="175"
                  font-family="Playfair Display, serif"
                  font-weight="900"
                  font-size="60"
                  fill="rgba(255,255,255,0.9)"
                  text-anchor="middle"
                >
                  2026
                </text>
                <!-- Stars in sky -->
                <g fill="rgba(255,255,255,0.3)">
                  <circle cx="50" cy="40" r="1.5" />
                  <circle cx="150" cy="25" r="1" />
                  <circle cx="250" cy="50" r="1.5" />
                  <circle cx="400" cy="30" r="1" />
                  <circle cx="500" cy="45" r="1.5" />
                  <circle cx="550" cy="20" r="1" />
                  <circle cx="100" cy="60" r="1" />
                  <circle cx="470" cy="60" r="1.5" />
                </g>
                <!-- Moon -->
                <circle cx="520" cy="50" r="20" fill="rgba(255,255,255,0.07)" />
                <circle cx="525" cy="45" r="16" fill="#080808" />
                <!-- Vignette -->
                <radialGradient id="vig5" cx="50%" cy="60%">
                  <stop offset="50%" stop-color="transparent" />
                  <stop offset="100%" stop-color="rgba(0,0,0,0.8)" />
                </radialGradient>
                <rect width="600" height="280" fill="url(#vig5)" />
              </svg>
              <div
                style="
                  font-family: 'DM Mono', monospace;
                  font-size: 0.7rem;
                  color: rgba(255, 255, 255, 0.3);
                  letter-spacing: 0.3em;
                "
              >
                NOW PLAYING
              </div>
              <div
                style="
                  font-family: 'Playfair Display', serif;
                  font-size: 2rem;
                  font-weight: 900;
                  color: #fff;
                  letter-spacing: 0.04em;
                "
              >
                LOS ANGELES · JUNE–JULY 2026
              </div>
            </div>
          </div>
        </div>
        <!-- /film-frames -->
      </div>
      <!-- /film-gate -->

      <!-- Film counter -->
      <div class="film-counter" id="filmCounter">01 / 06</div>

      <!-- Progress -->
      <div class="proj-progress">
        <div
          class="proj-progress-bar"
          id="projProgress"
          style="width: 0%"
        ></div>
      </div>

      <!-- Skip -->
      <button class="proj-skip" onclick="skipProjector()">Skip ›</button>
    </div>
`;
