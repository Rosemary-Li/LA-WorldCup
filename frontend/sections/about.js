// ═══════════════════════════════════════════════════
//  SECTION: ABOUT
// ═══════════════════════════════════════════════════

document.getElementById('mount-about').innerHTML = `
    <div class="section-divider"><div class="d1"></div><div class="d2"></div></div>

    <!-- ══════════ ABOUT US ══════════ -->
    <section id="about">
      <div class="section-masthead">
        <div class="section-title">About Us</div>
        <div class="section-folio">Data · Design · Technology</div>
      </div>

      <p class="about-lead" style="max-width:700px; margin:0 auto 0.8rem; text-align:center;">
        Bringing the World Cup to life in Los Angeles through data, design, and technology.
      </p>
      <p class="about-body" style="max-width:700px; margin:0 auto 2.5rem; text-align:center;">
        The FIFA World Cup is more than a sporting event — it's a global experience. Meet the team behind the platform.
      </p>

      <!-- Team grid — alphabetical by first name -->
      <div class="team-grid">
        <div class="team-card">
          <div class="team-name">Angeline Yu</div>
          <div class="team-role">Data &amp; Product Strategy</div>
          <div class="team-rule"></div>
          <div class="team-bio">Helping data organization and product planning, transforming World Cup match information into a clear, interactive, and user-centered experience.</div>
        </div>
        <div class="team-card">
          <div class="team-name">Bruce Yu</div>
          <div class="team-role">Team Energy &amp; Operations</div>
          <div class="team-rule"></div>
          <div class="team-bio">Good boy yeah！</div>
        </div>
        <div class="team-card">
          <div class="team-name">Richard Zhang</div>
          <div class="team-role">Analytics &amp; Growth</div>
          <div class="team-rule"></div>
          <div class="team-bio">Passionate about analytics leveraging data-driven insights to scale high-impact brand growth.</div>
        </div>
        <div class="team-card">
          <div class="team-name">Richelle Liu</div>
          <div class="team-role">Product &amp; User Experience</div>
          <div class="team-rule"></div>
          <div class="team-bio">Not a big fan of FIFA but big fan of AI, data, product and Day yi.</div>
        </div>
        <div class="team-card">
          <div class="team-name">Rosemary Li</div>
          <div class="team-role">Machine Learning &amp; NLP</div>
          <div class="team-rule"></div>
          <div class="team-bio">Machine learning and NLP practitioner building scalable, end-to-end solutions that translate data into real-world impact.</div>
        </div>
        <div class="team-card">
          <div class="team-name">Shenghan Gao</div>
          <div class="team-role">Backend &amp; Data Engineering</div>
          <div class="team-rule"></div>
          <div class="team-bio">Turning messy, real-world data into clean, structured datasets — making it ready for seamless ETL and reliable database integration.</div>
        </div>
      </div>
    </section>
`;
