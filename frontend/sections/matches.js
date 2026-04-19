// ═══════════════════════════════════════════════════
//  SECTION: MATCHES
// ═══════════════════════════════════════════════════

document.getElementById('mount-matches').innerHTML = `
    <!-- DIVIDER -->
    <div class="section-divider">
      <div class="d1"></div>
      <div class="d2"></div>
    </div>

    <!-- MATCHES -->
    <section id="matches">
      <div class="section-masthead">
        <div class="section-title">LA Match Schedule</div>
        <div class="section-folio">SoFi Stadium · Inglewood</div>
      </div>

      <div class="matches-grid">
        <!-- M4 -->
        <div class="match-card" onclick="openMatch('usa-paraguay')">
          <div class="match-meta">
            <span class="match-round">Group Stage · Group D · M4</span>
            <span class="match-date">Jun 12, 2026 · Fri · 18:00</span>
          </div>
          <div class="match-teams">
            <div class="team-block">
              <span class="team-flag">🇺🇸</span>
              <div class="team-name">USA</div>
              <div class="team-country">United States</div>
            </div>
            <div class="match-vs">vs.</div>
            <div class="team-block">
              <span class="team-flag">🇵🇾</span>
              <div class="team-name">PAR</div>
              <div class="team-country">Paraguay</div>
            </div>
          </div>
          <div class="match-venue">
            SoFi Stadium, Inglewood · 1001 S. Stadium Dr.
          </div>
          <button class="match-cta">View Match Details + Nearby Picks →</button>
        </div>

        <!-- M15 -->
        <div class="match-card" onclick="openMatch('iran-newzealand')">
          <div class="match-meta">
            <span class="match-round">Group Stage · Group G · M15</span>
            <span class="match-date">Jun 15, 2026 · Mon · 18:00</span>
          </div>
          <div class="match-teams">
            <div class="team-block">
              <span class="team-flag">🇮🇷</span>
              <div class="team-name">IRI</div>
              <div class="team-country">Iran</div>
            </div>
            <div class="match-vs">vs.</div>
            <div class="team-block">
              <span class="team-flag">🇳🇿</span>
              <div class="team-name">NZL</div>
              <div class="team-country">New Zealand</div>
            </div>
          </div>
          <div class="match-venue">
            SoFi Stadium, Inglewood · 1001 S. Stadium Dr.
          </div>
          <button class="match-cta">View Match Details + Nearby Picks →</button>
        </div>

        <!-- M26 -->
        <div class="match-card" onclick="openMatch('swiss-playoff')">
          <div class="match-meta">
            <span class="match-round">Group Stage · Group B · M26</span>
            <span class="match-date">Jun 18, 2026 · Thu · 12:00</span>
          </div>
          <div class="match-teams">
            <div class="team-block">
              <span class="team-flag">🇨🇭</span>
              <div class="team-name">SUI</div>
              <div class="team-country">Switzerland</div>
            </div>
            <div class="match-vs">vs.</div>
            <div class="team-block">
              <span class="team-flag">❓</span>
              <div class="team-name">TBD</div>
              <div class="team-country">UEFA Playoff A</div>
            </div>
          </div>
          <div class="match-venue">
            SoFi Stadium, Inglewood · 1001 S. Stadium Dr.
          </div>
          <button class="match-cta">View Match Details + Nearby Picks →</button>
        </div>

        <!-- M39 -->
        <div class="match-card" onclick="openMatch('belgium-iran')">
          <div class="match-meta">
            <span class="match-round">Group Stage · Group G · M39</span>
            <span class="match-date">Jun 21, 2026 · Sun · 12:00</span>
          </div>
          <div class="match-teams">
            <div class="team-block">
              <span class="team-flag">🇧🇪</span>
              <div class="team-name">BEL</div>
              <div class="team-country">Belgium</div>
            </div>
            <div class="match-vs">vs.</div>
            <div class="team-block">
              <span class="team-flag">🇮🇷</span>
              <div class="team-name">IRI</div>
              <div class="team-country">Iran</div>
            </div>
          </div>
          <div class="match-venue">
            SoFi Stadium, Inglewood · 1001 S. Stadium Dr.
          </div>
          <button class="match-cta">View Match Details + Nearby Picks →</button>
        </div>

        <!-- M59 -->
        <div class="match-card" onclick="openMatch('playoff-usa')">
          <div class="match-meta">
            <span class="match-round">Group Stage · Group D · M59</span>
            <span class="match-date">Jun 25, 2026 · Thu · 19:00</span>
          </div>
          <div class="match-teams">
            <div class="team-block">
              <span class="team-flag">❓</span>
              <div class="team-name">TBD</div>
              <div class="team-country">UEFA Playoff C</div>
            </div>
            <div class="match-vs">vs.</div>
            <div class="team-block">
              <span class="team-flag">🇺🇸</span>
              <div class="team-name">USA</div>
              <div class="team-country">United States</div>
            </div>
          </div>
          <div class="match-venue">
            SoFi Stadium, Inglewood · 1001 S. Stadium Dr.
          </div>
          <button class="match-cta">View Match Details + Nearby Picks →</button>
        </div>

        <!-- M73 -->
        <div class="match-card" onclick="openMatch('r32-m73')">
          <div class="match-meta">
            <span class="match-round">Round of 32 · M73</span>
            <span class="match-date">Jun 28, 2026 · Sun · 12:00</span>
          </div>
          <div class="match-teams">
            <div class="team-block">
              <span class="team-flag">❓</span>
              <div class="team-name">TBD</div>
              <div class="team-country">To Be Determined</div>
            </div>
            <div class="match-vs">vs.</div>
            <div class="team-block">
              <span class="team-flag">❓</span>
              <div class="team-name">TBD</div>
              <div class="team-country">To Be Determined</div>
            </div>
          </div>
          <div class="match-venue">
            SoFi Stadium, Inglewood · 1001 S. Stadium Dr.
          </div>
          <button class="match-cta">View Match Details + Nearby Picks →</button>
        </div>

        <!-- M84 -->
        <div class="match-card" onclick="openMatch('r32-m84')">
          <div class="match-meta">
            <span class="match-round">Round of 32 · M84</span>
            <span class="match-date">Jul 2, 2026 · Thu · 12:00</span>
          </div>
          <div class="match-teams">
            <div class="team-block">
              <span class="team-flag">❓</span>
              <div class="team-name">TBD</div>
              <div class="team-country">To Be Determined</div>
            </div>
            <div class="match-vs">vs.</div>
            <div class="team-block">
              <span class="team-flag">❓</span>
              <div class="team-name">TBD</div>
              <div class="team-country">To Be Determined</div>
            </div>
          </div>
          <div class="match-venue">
            SoFi Stadium, Inglewood · 1001 S. Stadium Dr.
          </div>
          <button class="match-cta">View Match Details + Nearby Picks →</button>
        </div>

        <!-- M98 -->
        <div class="match-card" onclick="openMatch('qf-m98')">
          <div class="match-meta">
            <span class="match-round">Quarter-Finals · M98</span>
            <span class="match-date">Jul 10, 2026 · Fri · 12:00</span>
          </div>
          <div class="match-teams">
            <div class="team-block">
              <span class="team-flag">❓</span>
              <div class="team-name">TBD</div>
              <div class="team-country">To Be Determined</div>
            </div>
            <div class="match-vs">vs.</div>
            <div class="team-block">
              <span class="team-flag">❓</span>
              <div class="team-name">TBD</div>
              <div class="team-country">To Be Determined</div>
            </div>
          </div>
          <div class="match-venue">
            SoFi Stadium, Inglewood · 1001 S. Stadium Dr.
          </div>
          <button class="match-cta">View Match Details + Nearby Picks →</button>
        </div>
      </div>
    </section>
`;
