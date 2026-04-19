// ═══════════════════════════════════════════════════
//  SECTION: HERO
// ═══════════════════════════════════════════════════

document.getElementById('mount-hero').innerHTML = `
    <!-- ══════════ HERO ══════════ -->
    <section id="hero">
      <div class="hero-rule-top">
        <div class="rule-thick"></div>
        <div class="rule-thin"></div>
      </div>

      <div class="hero-eyebrow-wrap">
        <div class="eyebrow-rule"></div>
        <div class="hero-eyebrow">✦ FIFA World Cup 2026™ · Los Angeles ✦</div>
        <div class="eyebrow-rule"></div>
      </div>

      <div class="hero-dateline">
        June 11 – July 19, 2026 · SoFi Stadium · Inglewood, California
      </div>

      <h1 class="hero-headline">
        THE <em>BEAUTIFUL</em><br />
        GAME COMES TO<br />
        <span class="outline-txt">HOLLYWOOD</span>
      </h1>

      <p class="hero-deck">
        A cinematic journey through football, glamour &amp; the City of Angels
        —<br />
        where the silver screen meets the beautiful game.
      </p>

      <!-- LA Colorful Filmstrip -->
      <div class="la-filmstrip">
        <!-- Sprocket row -->
        <div class="strip-sprockets">
          <div class="strip-holes">
            <!-- 40 holes for looping -->
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <!-- duplicate for loop -->
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
          </div>
        </div>

        <!-- Photo strip (colorful LA) -->
        <div class="strip-images" id="laStrip">
          <!-- LA Sky - colorful -->
          <div class="la-photo">
            <svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lasky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#FF6B35" />
                  <stop offset="40%" stop-color="#F7C59F" />
                  <stop offset="70%" stop-color="#87CEEB" />
                  <stop offset="100%" stop-color="#4A90D9" />
                </linearGradient>
              </defs>
              <rect width="220" height="150" fill="url(#lasky)" />
              <!-- Sun -->
              <circle cx="170" cy="35" r="20" fill="#FFD700" opacity="0.9" />
              <!-- Palm trees silhouette -->
              <rect x="30" y="80" width="6" height="70" fill="#1a0a00" />
              <ellipse cx="33" cy="75" rx="22" ry="12" fill="#1a2a00" />
              <rect x="180" y="90" width="5" height="60" fill="#1a0a00" />
              <ellipse cx="182" cy="85" rx="18" ry="10" fill="#1a2a00" />
              <!-- Smog layer -->
              <rect
                x="0"
                y="105"
                width="220"
                height="20"
                fill="rgba(255,200,150,0.3)"
              />
              <!-- LA skyline silhouette -->
              <g fill="#0a0a0a">
                <rect x="80" y="100" width="12" height="50" />
                <rect x="95" y="90" width="15" height="60" />
                <rect x="113" y="95" width="10" height="55" />
                <rect x="126" y="85" width="13" height="65" />
              </g>
            </svg>
            <div class="photo-caption">LA Sunset Sky</div>
          </div>

          <!-- Hollywood Sign - colorful -->
          <div class="la-photo">
            <svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="hillsky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#1E3A5F" />
                  <stop offset="60%" stop-color="#87CEEB" />
                  <stop offset="100%" stop-color="#5BA04A" />
                </linearGradient>
              </defs>
              <rect width="220" height="150" fill="url(#hillsky)" />
              <!-- Hills -->
              <path
                d="M0 120 Q60 70 120 90 Q170 60 220 85 L220 150 L0 150Z"
                fill="#4A7A30"
              />
              <path
                d="M0 130 Q80 100 160 110 L220 105 L220 150 L0 150Z"
                fill="#3A6020"
              />
              <!-- White Hollywood sign letters -->
              <g
                fill="white"
                font-family="Arial Black"
                font-weight="900"
                font-size="14"
              >
                <text x="18" y="95">HOLLYWOOD</text>
              </g>
              <!-- Sign poles suggestion -->
              <g stroke="rgba(255,255,255,0.4)" stroke-width="0.5">
                <line x1="25" y1="96" x2="25" y2="110" />
                <line x1="42" y1="96" x2="42" y2="112" />
                <line x1="59" y1="96" x2="59" y2="110" />
              </g>
              <!-- Blue sky clouds -->
              <ellipse
                cx="160"
                cy="30"
                rx="30"
                ry="12"
                fill="rgba(255,255,255,0.6)"
              />
              <ellipse
                cx="190"
                cy="35"
                rx="20"
                ry="8"
                fill="rgba(255,255,255,0.5)"
              />
              <ellipse
                cx="40"
                cy="20"
                rx="25"
                ry="10"
                fill="rgba(255,255,255,0.4)"
              />
            </svg>
            <div class="photo-caption">Hollywood Sign</div>
          </div>

          <!-- Disneyland - colorful -->
          <div class="la-photo">
            <svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="disneysky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#1565C0" />
                  <stop offset="100%" stop-color="#42A5F5" />
                </linearGradient>
              </defs>
              <rect width="220" height="150" fill="url(#disneysky)" />
              <!-- Sleeping Beauty Castle -->
              <g fill="#E8C9E0">
                <!-- Main tower -->
                <rect x="95" y="55" width="30" height="80" />
                <!-- Side towers -->
                <rect x="70" y="75" width="20" height="60" />
                <rect x="130" y="70" width="22" height="65" />
                <!-- Turret spires -->
                <polygon points="110,15 95,55 125,55" fill="#7B1FA2" />
                <polygon points="80,35 70,75 90,75" fill="#9C27B0" />
                <polygon points="141,28 130,70 152,70" fill="#7B1FA2" />
                <!-- Small towers -->
                <rect x="60" y="90" width="12" height="45" />
                <polygon points="66,70 60,90 72,90" fill="#6A1B9A" />
                <rect x="148" y="88" width="12" height="47" />
                <polygon points="154,68 148,88 160,88" fill="#6A1B9A" />
              </g>
              <!-- Windows -->
              <g fill="#FFE082">
                <rect x="103" y="70" width="6" height="8" rx="1" />
                <rect x="113" y="70" width="6" height="8" rx="1" />
                <rect x="103" y="85" width="6" height="8" rx="1" />
                <rect x="113" y="85" width="6" height="8" rx="1" />
              </g>
              <!-- Fireworks -->
              <g fill="#FF6B35">
                <circle cx="40" cy="30" r="3" />
                <circle cx="35" cy="25" r="2" />
                <circle cx="45" cy="25" r="2" />
                <circle cx="40" cy="20" r="1.5" />
              </g>
              <g fill="#FFD700">
                <circle cx="180" cy="25" r="3" />
                <circle cx="175" cy="20" r="2" />
                <circle cx="185" cy="20" r="2" />
                <circle cx="180" cy="15" r="1.5" />
              </g>
              <!-- Crowd -->
              <rect x="0" y="130" width="220" height="20" fill="#3E2723" />
              <g fill="rgba(255,255,255,0.15)" font-size="6">
                <text x="10" y="143">DISNEYLAND CALIFORNIA</text>
              </g>
            </svg>
            <div class="photo-caption">Disneyland, Anaheim</div>
          </div>

          <!-- Universal Studios - colorful -->
          <div class="la-photo">
            <svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="univsky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0D47A1" />
                  <stop offset="100%" stop-color="#64B5F6" />
                </linearGradient>
              </defs>
              <rect width="220" height="150" fill="url(#univsky)" />
              <!-- Globe (Universal logo inspired) -->
              <circle
                cx="110"
                cy="65"
                r="50"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                stroke-width="1"
              />
              <circle cx="110" cy="65" r="50" fill="rgba(30,100,200,0.3)" />
              <!-- Globe grid lines -->
              <ellipse
                cx="110"
                cy="65"
                rx="50"
                ry="20"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                stroke-width="0.8"
              />
              <ellipse
                cx="110"
                cy="65"
                rx="50"
                ry="35"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                stroke-width="0.8"
              />
              <line
                x1="110"
                y1="15"
                x2="110"
                y2="115"
                stroke="rgba(255,255,255,0.15)"
                stroke-width="0.8"
              />
              <line
                x1="60"
                y1="65"
                x2="160"
                y2="65"
                stroke="rgba(255,255,255,0.15)"
                stroke-width="0.8"
              />
              <!-- Continents suggestion -->
              <path
                d="M80 55 Q90 45 105 50 Q115 48 120 55 Q125 65 110 68 Q95 70 80 55Z"
                fill="#2E7D32"
                opacity="0.7"
              />
              <path
                d="M115 50 Q128 44 138 52 Q142 60 135 65 Q125 65 115 50Z"
                fill="#2E7D32"
                opacity="0.6"
              />
              <!-- "UNIVERSAL STUDIOS" text banner -->
              <rect
                x="15"
                y="120"
                width="190"
                height="22"
                fill="rgba(0,0,0,0.5)"
              />
              <text
                x="110"
                y="135"
                font-family="Arial"
                font-weight="900"
                font-size="10"
                fill="#FFD700"
                text-anchor="middle"
                letter-spacing="2"
              >
                UNIVERSAL STUDIOS
              </text>
            </svg>
            <div class="photo-caption">Universal Studios Hollywood</div>
          </div>

          <!-- Santa Monica Beach - colorful -->
          <div class="la-photo">
            <svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="beachsky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0288D1" />
                  <stop offset="60%" stop-color="#4FC3F7" />
                  <stop offset="100%" stop-color="#B3E5FC" />
                </linearGradient>
                <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0277BD" />
                  <stop offset="100%" stop-color="#4FC3F7" />
                </linearGradient>
              </defs>
              <rect width="220" height="150" fill="url(#beachsky)" />
              <!-- Ocean -->
              <rect x="0" y="85" width="220" height="65" fill="url(#ocean)" />
              <!-- Waves -->
              <path
                d="M0 88 Q30 82 60 88 Q90 94 120 88 Q150 82 180 88 Q210 94 220 90 L220 95 Q190 100 160 95 Q130 90 100 95 Q70 100 40 95 Q15 90 0 95Z"
                fill="rgba(255,255,255,0.4)"
              />
              <!-- Sand -->
              <rect x="0" y="108" width="220" height="42" fill="#F5DEB3" />
              <!-- Santa Monica Pier -->
              <rect x="80" y="68" width="4" height="42" fill="#8B4513" />
              <rect x="90" y="68" width="4" height="42" fill="#8B4513" />
              <rect x="100" y="68" width="4" height="42" fill="#8B4513" />
              <rect x="75" y="65" width="35" height="8" fill="#D2691E" />
              <!-- Ferris wheel -->
              <circle
                cx="115"
                cy="50"
                r="18"
                fill="none"
                stroke="#FF4444"
                stroke-width="2.5"
              />
              <line
                x1="115"
                y1="32"
                x2="115"
                y2="68"
                stroke="#FF4444"
                stroke-width="1.5"
              />
              <line
                x1="97"
                y1="50"
                x2="133"
                y2="50"
                stroke="#FF4444"
                stroke-width="1.5"
              />
              <circle cx="115" cy="50" r="4" fill="#FFD700" />
              <!-- Sun -->
              <circle cx="30" cy="25" r="12" fill="#FFD700" />
              <!-- Surfers -->
              <ellipse
                cx="170"
                cy="105"
                rx="10"
                ry="3"
                fill="rgba(255,255,255,0.6)"
              />
            </svg>
            <div class="photo-caption">Santa Monica Pier</div>
          </div>

          <!-- SoFi Stadium - colorful -->
          <div class="la-photo">
            <svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sofisky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#212121" />
                  <stop offset="100%" stop-color="#424242" />
                </linearGradient>
              </defs>
              <rect width="220" height="150" fill="url(#sofisky)" />
              <!-- Stadium roof (translucent) -->
              <ellipse
                cx="110"
                cy="60"
                rx="95"
                ry="30"
                fill="rgba(200,220,255,0.15)"
                stroke="rgba(255,255,255,0.3)"
                stroke-width="1.5"
              />
              <!-- Stadium bowl -->
              <ellipse cx="110" cy="85" rx="85" ry="45" fill="#1B5E20" />
              <!-- Pitch markings (green) -->
              <ellipse cx="110" cy="85" rx="85" ry="45" fill="#2E7D32" />
              <ellipse
                cx="110"
                cy="85"
                rx="60"
                ry="30"
                fill="#388E3C"
                stroke="white"
                stroke-width="1.5"
                stroke-dasharray="none"
              />
              <ellipse
                cx="110"
                cy="85"
                rx="20"
                ry="10"
                fill="none"
                stroke="white"
                stroke-width="1.5"
              />
              <line
                x1="25"
                y1="85"
                x2="195"
                y2="85"
                stroke="white"
                stroke-width="1.5"
              />
              <!-- Seats - ring of color -->
              <ellipse
                cx="110"
                cy="85"
                rx="85"
                ry="45"
                fill="none"
                stroke="#C62828"
                stroke-width="8"
                opacity="0.7"
              />
              <!-- Logo on roof -->
              <text
                x="110"
                y="40"
                font-family="Arial Black"
                font-weight="900"
                font-size="10"
                fill="rgba(255,255,255,0.6)"
                text-anchor="middle"
                letter-spacing="1"
              >
                SoFi STADIUM
              </text>
              <!-- Lights -->
              <g fill="#FFD700" opacity="0.8">
                <circle cx="30" cy="50" r="3" />
                <circle cx="55" cy="40" r="3" />
                <circle cx="165" cy="40" r="3" />
                <circle cx="190" cy="50" r="3" />
              </g>
            </svg>
            <div class="photo-caption">SoFi Stadium, Inglewood</div>
          </div>

          <!-- Venice Beach - colorful -->
          <div class="la-photo">
            <svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="venicesky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#FF8F00" />
                  <stop offset="50%" stop-color="#FFA726" />
                  <stop offset="100%" stop-color="#FFE0B2" />
                </linearGradient>
              </defs>
              <rect width="220" height="150" fill="url(#venicesky)" />
              <!-- Mural wall -->
              <rect x="0" y="40" width="220" height="110" fill="#F5F5F5" />
              <!-- Colorful graffiti/mural shapes -->
              <rect x="0" y="40" width="50" height="110" fill="#E91E63" />
              <rect x="50" y="40" width="40" height="110" fill="#2196F3" />
              <rect x="90" y="40" width="40" height="110" fill="#FF9800" />
              <rect x="130" y="40" width="40" height="110" fill="#4CAF50" />
              <rect x="170" y="40" width="50" height="110" fill="#9C27B0" />
              <!-- Abstract shapes on mural -->
              <circle cx="25" cy="85" r="20" fill="rgba(255,255,255,0.2)" />
              <circle cx="75" cy="80" r="25" fill="rgba(0,0,0,0.15)" />
              <!-- Skater silhouettes -->
              <g fill="#000" opacity="0.6">
                <circle cx="100" cy="115" r="8" />
                <rect x="96" y="122" width="8" height="15" rx="3" />
                <circle cx="150" cy="110" r="8" />
                <rect x="146" y="117" width="8" height="15" rx="3" />
              </g>
              <!-- "VENICE" text on wall -->
              <text
                x="110"
                y="68"
                font-family="Arial Black"
                font-weight="900"
                font-size="18"
                fill="rgba(255,255,255,0.8)"
                text-anchor="middle"
                letter-spacing="2"
              >
                VENICE
              </text>
            </svg>
            <div class="photo-caption">Venice Beach Boardwalk</div>
          </div>

          <!-- Griffith Observatory - colorful -->
          <div class="la-photo">
            <svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="griffsky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0D1B2A" />
                  <stop offset="50%" stop-color="#1B2A4A" />
                  <stop offset="100%" stop-color="#2C3E6A" />
                </linearGradient>
              </defs>
              <rect width="220" height="150" fill="url(#griffsky)" />
              <!-- Stars -->
              <g fill="white" opacity="0.7">
                <circle cx="20" cy="15" r="1" />
                <circle cx="60" cy="10" r="1.5" />
                <circle cx="100" cy="20" r="1" />
                <circle cx="150" cy="8" r="1.5" />
                <circle cx="200" cy="18" r="1" />
                <circle cx="180" cy="30" r="1.5" />
                <circle cx="40" cy="35" r="1" />
              </g>
              <!-- Moon glow -->
              <circle cx="175" cy="28" r="15" fill="#FFF9C4" opacity="0.9" />
              <circle cx="172" cy="25" r="12" fill="#FFF9E4" />
              <!-- Hills in purple/blue -->
              <path
                d="M0 110 Q60 75 110 90 Q160 65 220 85 L220 150 L0 150Z"
                fill="#4A148C"
              />
              <path
                d="M0 120 Q80 100 160 112 L220 108 L220 150 L0 150Z"
                fill="#311B92"
              />
              <!-- Observatory building -->
              <g fill="#F5F5DC">
                <rect x="60" y="75" width="100" height="50" />
                <!-- Main dome -->
                <ellipse cx="110" cy="73" rx="30" ry="18" fill="#ECEFF1" />
                <!-- Side domes -->
                <ellipse cx="68" cy="80" rx="15" ry="10" fill="#ECEFF1" />
                <ellipse cx="152" cy="80" rx="15" ry="10" fill="#ECEFF1" />
                <!-- Columns -->
                <rect x="70" y="90" width="6" height="35" />
                <rect x="144" y="90" width="6" height="35" />
              </g>
              <!-- City lights below -->
              <g fill="#FFD700" opacity="0.6">
                <circle cx="20" cy="140" r="1" />
                <circle cx="40" cy="138" r="1.5" />
                <circle cx="65" cy="143" r="1" />
                <circle cx="160" cy="140" r="1.5" />
                <circle cx="190" cy="137" r="1" />
                <circle cx="210" cy="142" r="1.5" />
              </g>
            </svg>
            <div class="photo-caption">Griffith Observatory</div>
          </div>

          <!-- DUPLICATE for infinite loop -->
          <div class="la-photo">
            <svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lasky2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#FF6B35" />
                  <stop offset="40%" stop-color="#F7C59F" />
                  <stop offset="70%" stop-color="#87CEEB" />
                  <stop offset="100%" stop-color="#4A90D9" />
                </linearGradient>
              </defs>
              <rect width="220" height="150" fill="url(#lasky2)" />
              <circle cx="170" cy="35" r="20" fill="#FFD700" opacity="0.9" />
              <rect x="30" y="80" width="6" height="70" fill="#1a0a00" />
              <ellipse cx="33" cy="75" rx="22" ry="12" fill="#1a2a00" />
              <rect x="180" y="90" width="5" height="60" fill="#1a0a00" />
              <ellipse cx="182" cy="85" rx="18" ry="10" fill="#1a2a00" />
              <rect
                x="0"
                y="105"
                width="220"
                height="20"
                fill="rgba(255,200,150,0.3)"
              />
              <g fill="#0a0a0a">
                <rect x="80" y="100" width="12" height="50" />
                <rect x="95" y="90" width="15" height="60" />
                <rect x="113" y="95" width="10" height="55" />
                <rect x="126" y="85" width="13" height="65" />
              </g>
            </svg>
            <div class="photo-caption">LA Sunset Sky</div>
          </div>
          <div class="la-photo">
            <svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="disneysky2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#1565C0" />
                  <stop offset="100%" stop-color="#42A5F5" />
                </linearGradient>
              </defs>
              <rect width="220" height="150" fill="url(#disneysky2)" />
              <g fill="#E8C9E0">
                <rect x="95" y="55" width="30" height="80" />
                <rect x="70" y="75" width="20" height="60" />
                <rect x="130" y="70" width="22" height="65" />
                <polygon points="110,15 95,55 125,55" fill="#7B1FA2" />
                <polygon points="80,35 70,75 90,75" fill="#9C27B0" />
                <polygon points="141,28 130,70 152,70" fill="#7B1FA2" />
              </g>
              <g fill="#FFE082">
                <rect x="103" y="70" width="6" height="8" rx="1" />
                <rect x="113" y="70" width="6" height="8" rx="1" />
              </g>
              <g fill="#FF6B35">
                <circle cx="40" cy="30" r="3" />
                <circle cx="35" cy="25" r="2" />
                <circle cx="45" cy="25" r="2" />
              </g>
              <rect x="0" y="130" width="220" height="20" fill="#3E2723" />
            </svg>
            <div class="photo-caption">Disneyland, Anaheim</div>
          </div>
          <div class="la-photo">
            <svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="univsky2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0D47A1" />
                  <stop offset="100%" stop-color="#64B5F6" />
                </linearGradient>
              </defs>
              <rect width="220" height="150" fill="url(#univsky2)" />
              <circle cx="110" cy="65" r="50" fill="rgba(30,100,200,0.3)" />
              <ellipse
                cx="110"
                cy="65"
                rx="50"
                ry="20"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                stroke-width="0.8"
              />
              <line
                x1="110"
                y1="15"
                x2="110"
                y2="115"
                stroke="rgba(255,255,255,0.15)"
                stroke-width="0.8"
              />
              <path
                d="M80 55 Q90 45 105 50 Q115 48 120 55 Q125 65 110 68 Q95 70 80 55Z"
                fill="#2E7D32"
                opacity="0.7"
              />
              <rect
                x="15"
                y="120"
                width="190"
                height="22"
                fill="rgba(0,0,0,0.5)"
              />
              <text
                x="110"
                y="135"
                font-family="Arial"
                font-weight="900"
                font-size="10"
                fill="#FFD700"
                text-anchor="middle"
                letter-spacing="2"
              >
                UNIVERSAL STUDIOS
              </text>
            </svg>
            <div class="photo-caption">Universal Studios Hollywood</div>
          </div>
        </div>
        <!-- Bottom sprocket row -->
        <div class="strip-sprockets">
          <div class="strip-holes">
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
            <div class="strip-hole"></div>
          </div>
        </div>
      </div>

      <!-- Identity picker -->
      <div class="identity-section">
        <div class="identity-eyebrow">Who are you traveling as?</div>
        <div class="identity-cards">
          <div class="identity-card" onclick="setIdentity('family', this)">
            <span class="icon">👨‍👩‍👧‍👦</span><span class="label">Family</span>
          </div>
          <div class="identity-card" onclick="setIdentity('backpacker', this)">
            <span class="icon">🎒</span><span class="label">Backpacker</span>
          </div>
          <div class="identity-card" onclick="setIdentity('football', this)">
            <span class="icon">⚽</span><span class="label">Football Fan</span>
          </div>
          <div class="identity-card" onclick="setIdentity('luxury', this)">
            <span class="icon">✦</span
            ><span class="label">Luxury Traveler</span>
          </div>
        </div>
      </div>

      <div class="scroll-hint">
        <span>Scroll</span>
        <div class="scroll-line"></div>
      </div>
    </section>
`;
