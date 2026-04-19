// ═══════════════════════════════════════════════════
//  SECTION: SHOWCASE
// ═══════════════════════════════════════════════════

document.getElementById('mount-showcase').innerHTML = `
    <!-- DIVIDER -->
    <div class="section-divider">
      <div class="d1"></div>
      <div class="d2"></div>
    </div>

    <!-- LA COLORFUL SHOWCASE STRIP (full dark section) -->
    <div id="la-showcase">
      <div class="showcase-header">
        <div class="showcase-rule">Now Playing In Glorious Technicolor</div>
        <div class="showcase-title">THE CITY OF LOS ANGELES</div>
      </div>
      <div class="showcase-strip" id="showcaseStrip">
        <!-- Malibu -->
        <div class="showcase-photo">
          <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="malibu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0277BD" />
                <stop offset="55%" stop-color="#29B6F6" />
                <stop offset="100%" stop-color="#F5DEB3" />
              </linearGradient>
            </defs>
            <rect width="320" height="220" fill="url(#malibu)" />
            <rect
              x="0"
              y="155"
              width="320"
              height="65"
              fill="#0277BD"
              opacity="0.7"
            />
            <path
              d="M0 158 Q40 148 80 155 Q120 162 160 155 Q200 148 240 155 Q280 162 320 155 L320 170 Q280 175 240 170 Q200 165 160 170 Q120 175 80 170 Q40 165 0 170Z"
              fill="rgba(255,255,255,0.35)"
            />
            <rect x="0" y="168" width="320" height="52" fill="#F5DEB3" />
            <g fill="#1a0a00">
              <rect x="20" y="80" width="8" height="90" />
              <ellipse cx="24" cy="74" rx="30" ry="16" fill="#1a2a00" />
            </g>
            <g fill="#1a0a00">
              <rect x="270" y="95" width="7" height="75" />
              <ellipse cx="273" cy="89" rx="25" ry="14" fill="#1a2a00" />
            </g>
            <circle cx="260" cy="45" r="22" fill="#FFD700" />
            <g fill="rgba(255,255,255,0.5)">
              <ellipse cx="80" cy="35" rx="30" ry="10" />
              <ellipse cx="130" cy="25" rx="25" ry="8" />
              <ellipse cx="50" cy="50" rx="20" ry="7" />
            </g>
          </svg>
          <div class="photo-label">Malibu Coastline</div>
        </div>
        <!-- Getty Center -->
        <div class="showcase-photo">
          <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gettysky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#E3F2FD" />
                <stop offset="100%" stop-color="#90CAF9" />
              </linearGradient>
            </defs>
            <rect width="320" height="220" fill="url(#gettysky)" />
            <path
              d="M0 160 Q80 130 160 145 Q240 110 320 135 L320 220 L0 220Z"
              fill="#78909C"
            />
            <g fill="#F5F5DC">
              <rect x="80" y="90" width="160" height="80" />
              <rect x="70" y="100" width="20" height="70" />
              <rect x="230" y="100" width="20" height="70" />
              <rect x="60" y="130" width="200" height="40" />
            </g>
            <g fill="#BDBDBD">
              <rect x="90" y="100" width="140" height="5" />
              <rect x="90" y="150" width="140" height="5" />
            </g>
            <g fill="#E0E0E0">
              <rect x="100" y="110" width="15" height="25" rx="1" />
              <rect x="125" y="110" width="15" height="25" rx="1" />
              <rect x="150" y="110" width="15" height="25" rx="1" />
              <rect x="200" y="110" width="15" height="25" rx="1" />
            </g>
            <g fill="rgba(255,255,255,0.6)">
              <ellipse cx="240" cy="30" rx="25" ry="10" />
              <ellipse cx="80" cy="25" rx="30" ry="12" />
            </g>
          </svg>
          <div class="photo-label">Getty Center, Bel Air</div>
        </div>
        <!-- Hollywood Bowl -->
        <div class="showcase-photo">
          <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bowlsky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0D1B2A" />
                <stop offset="60%" stop-color="#1565C0" />
                <stop offset="100%" stop-color="#1976D2" />
              </linearGradient>
            </defs>
            <rect width="320" height="220" fill="url(#bowlsky)" />
            <g fill="white" opacity="0.6">
              <circle cx="30" cy="20" r="1.5" />
              <circle cx="80" cy="12" r="1" />
              <circle cx="150" cy="18" r="1.5" />
              <circle cx="220" cy="10" r="1" />
              <circle cx="290" cy="15" r="1.5" />
            </g>
            <!-- Bowl seats -->
            <ellipse cx="160" cy="160" rx="140" ry="50" fill="#1A237E" />
            <ellipse cx="160" cy="155" rx="120" ry="42" fill="#283593" />
            <ellipse cx="160" cy="150" rx="100" ry="34" fill="#303F9F" />
            <!-- Stage shell -->
            <ellipse cx="160" cy="130" rx="70" ry="30" fill="#F5F5DC" />
            <ellipse cx="160" cy="128" rx="55" ry="22" fill="#FFFDE7" />
            <!-- Stage lights -->
            <g fill="#FFD700" opacity="0.7">
              <circle cx="110" cy="95" r="5" />
              <circle cx="140" cy="88" r="5" />
              <circle cx="160" cy="85" r="6" />
              <circle cx="180" cy="88" r="5" />
              <circle cx="210" cy="95" r="5" />
            </g>
            <!-- Crowd silhouettes -->
            <g fill="rgba(255,255,255,0.15)" font-size="4">
              <ellipse cx="50" cy="180" rx="15" ry="20" />
              <ellipse cx="80" cy="175" rx="12" ry="18" />
              <ellipse cx="240" cy="178" rx="15" ry="20" />
              <ellipse cx="270" cy="173" rx="12" ry="18" />
            </g>
          </svg>
          <div class="photo-label">Hollywood Bowl</div>
        </div>
        <!-- LACMA -->
        <div class="showcase-photo">
          <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lacmasky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FFF9C4" />
                <stop offset="100%" stop-color="#F57F17" />
              </linearGradient>
            </defs>
            <rect width="320" height="220" fill="url(#lacmasky)" />
            <!-- Urban Lights installation - colorful lamp posts -->
            <g>
              <rect x="25" y="80" width="5" height="120" fill="#888" />
              <ellipse
                cx="27"
                cy="78"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="45" y="70" width="5" height="130" fill="#888" />
              <ellipse
                cx="47"
                cy="68"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="65" y="85" width="5" height="115" fill="#888" />
              <ellipse
                cx="67"
                cy="83"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="85" y="75" width="5" height="125" fill="#888" />
              <ellipse
                cx="87"
                cy="73"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="105" y="90" width="5" height="110" fill="#888" />
              <ellipse
                cx="107"
                cy="88"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="125" y="78" width="5" height="122" fill="#888" />
              <ellipse
                cx="127"
                cy="76"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="145" y="85" width="5" height="115" fill="#888" />
              <ellipse
                cx="147"
                cy="83"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="165" y="72" width="5" height="128" fill="#888" />
              <ellipse
                cx="167"
                cy="70"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="185" y="80" width="5" height="120" fill="#888" />
              <ellipse
                cx="187"
                cy="78"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="205" y="88" width="5" height="112" fill="#888" />
              <ellipse
                cx="207"
                cy="86"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="225" y="76" width="5" height="124" fill="#888" />
              <ellipse
                cx="227"
                cy="74"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="245" y="82" width="5" height="118" fill="#888" />
              <ellipse
                cx="247"
                cy="80"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="265" y="74" width="5" height="126" fill="#888" />
              <ellipse
                cx="267"
                cy="72"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
              <rect x="285" y="86" width="5" height="114" fill="#888" />
              <ellipse
                cx="287"
                cy="84"
                rx="8"
                ry="5"
                fill="#FFF9C4"
                stroke="#FFD54F"
                stroke-width="1"
              />
            </g>
            <!-- Path -->
            <rect x="0" y="195" width="320" height="25" fill="#555" />
            <g fill="rgba(255,255,255,0.2)" font-family="Arial" font-size="8">
              <text x="10" y="210">
                LACMA · LOS ANGELES COUNTY MUSEUM OF ART
              </text>
            </g>
          </svg>
          <div class="photo-label">LACMA Urban Lights</div>
        </div>
        <!-- duplicate first two for loop -->
        <div class="showcase-photo">
          <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="malibu2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0277BD" />
                <stop offset="55%" stop-color="#29B6F6" />
                <stop offset="100%" stop-color="#F5DEB3" />
              </linearGradient>
            </defs>
            <rect width="320" height="220" fill="url(#malibu2)" />
            <rect
              x="0"
              y="155"
              width="320"
              height="65"
              fill="#0277BD"
              opacity="0.7"
            />
            <path
              d="M0 158 Q40 148 80 155 Q120 162 160 155 Q200 148 240 155 Q280 162 320 155 L320 170 Q280 175 240 170 Q200 165 160 170 Q120 175 80 170 Q40 165 0 170Z"
              fill="rgba(255,255,255,0.35)"
            />
            <rect x="0" y="168" width="320" height="52" fill="#F5DEB3" />
            <g fill="#1a0a00">
              <rect x="20" y="80" width="8" height="90" />
              <ellipse cx="24" cy="74" rx="30" ry="16" fill="#1a2a00" />
            </g>
            <circle cx="260" cy="45" r="22" fill="#FFD700" />
          </svg>
          <div class="photo-label">Malibu Coastline</div>
        </div>
        <div class="showcase-photo">
          <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gettysky2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#E3F2FD" />
                <stop offset="100%" stop-color="#90CAF9" />
              </linearGradient>
            </defs>
            <rect width="320" height="220" fill="url(#gettysky2)" />
            <path
              d="M0 160 Q80 130 160 145 Q240 110 320 135 L320 220 L0 220Z"
              fill="#78909C"
            />
            <g fill="#F5F5DC">
              <rect x="80" y="90" width="160" height="80" />
              <rect x="70" y="100" width="20" height="70" />
              <rect x="230" y="100" width="20" height="70" />
              <rect x="60" y="130" width="200" height="40" />
            </g>
            <g fill="#BDBDBD">
              <rect x="90" y="100" width="140" height="5" />
              <rect x="90" y="150" width="140" height="5" />
            </g>
            <g fill="rgba(255,255,255,0.6)">
              <ellipse cx="240" cy="30" rx="25" ry="10" />
              <ellipse cx="80" cy="25" rx="30" ry="12" />
            </g>
          </svg>
          <div class="photo-label">Getty Center, Bel Air</div>
        </div>
      </div>
    </div>
`;
