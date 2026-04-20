// ═══════════════════════════════════════════════════
//  DATA — Match info, Hotels, Restaurants, Events,
//          Fan Events, Shows, Itinerary Templates
// ═══════════════════════════════════════════════════

// Global arrays populated by api.js
const RANKINGS = [];
const ROUTES   = [];
const TEAMS    = [];

// ═══════════════ MATCH DATA ═══════════════
      const MATCH_DATA = {
        "usa-paraguay": {
          home: { flag: "🇺🇸", name: "USA", country: "United States" },
          away: { flag: "🇵🇾", name: "PAR", country: "Paraguay" },
          round: "Group Stage · Group D · M4",
          date: "June 12, 2026 · Fri · 18:00",
          venue: "SoFi Stadium, Inglewood",
          highlight:
            "USMNT opens the World Cup on home soil against Paraguay in a pivotal Group D clash.",
          h2h: { total: 5, team1wins: 3, draws: 1 },
          players: [
            {
              num: "10",
              name: "Christian Pulisic",
              pos: "Forward · AC Milan",
              team: "USA",
            },
            {
              num: "25",
              name: "Ricardo Pepi",
              pos: "Forward · PSV",
              team: "USA",
            },
            {
              num: "9",
              name: "Miguel Almirón",
              pos: "Midfielder · Newcastle",
              team: "PAR",
            },
            {
              num: "7",
              name: "Julio Enciso",
              pos: "Forward · Brighton",
              team: "PAR",
            },
          ],
        },
        "iran-newzealand": {
          home: { flag: "🇮🇷", name: "IRI", country: "Iran" },
          away: { flag: "🇳🇿", name: "NZL", country: "New Zealand" },
          round: "Group Stage · Group G · M15",
          date: "June 15, 2026 · Mon · 18:00",
          venue: "SoFi Stadium, Inglewood",
          highlight:
            "Iran face New Zealand in a decisive Group G encounter at SoFi Stadium.",
          h2h: { total: 2, team1wins: 1, draws: 0 },
          players: [
            {
              num: "9",
              name: "Mehdi Taremi",
              pos: "Forward · Inter Milan",
              team: "IRI",
            },
            {
              num: "10",
              name: "Sardar Azmoun",
              pos: "Forward · Bayer Leverkusen",
              team: "IRI",
            },
            {
              num: "10",
              name: "Marco Rojas",
              pos: "Winger · All Whites",
              team: "NZL",
            },
            {
              num: "9",
              name: "Chris Wood",
              pos: "Forward · Nottm Forest",
              team: "NZL",
            },
          ],
        },
        "swiss-playoff": {
          home: { flag: "🇨🇭", name: "SUI", country: "Switzerland" },
          away: { flag: "❓", name: "TBD", country: "UEFA Playoff A Winner" },
          round: "Group Stage · Group B · M26",
          date: "June 18, 2026 · Thu · 12:00",
          venue: "SoFi Stadium, Inglewood",
          highlight:
            "Switzerland take on the UEFA Playoff A qualifier in a must-watch Group B battle.",
          h2h: { total: 0, team1wins: 0, draws: 0 },
          players: [
            {
              num: "10",
              name: "Granit Xhaka",
              pos: "Midfielder · Bayer Leverkusen",
              team: "SUI",
            },
            {
              num: "9",
              name: "Breel Embolo",
              pos: "Forward · Monaco",
              team: "SUI",
            },
          ],
        },
        "belgium-iran": {
          home: { flag: "🇧🇪", name: "BEL", country: "Belgium" },
          away: { flag: "🇮🇷", name: "IRI", country: "Iran" },
          round: "Group Stage · Group G · M39",
          date: "June 21, 2026 · Sun · 12:00",
          venue: "SoFi Stadium, Inglewood",
          highlight:
            "Belgium face Iran in a critical Group G match that could determine which teams advance.",
          h2h: { total: 1, team1wins: 1, draws: 0 },
          players: [
            {
              num: "10",
              name: "Kevin De Bruyne",
              pos: "Midfielder · Man City",
              team: "BEL",
            },
            {
              num: "9",
              name: "Romelu Lukaku",
              pos: "Forward · Roma",
              team: "BEL",
            },
            {
              num: "9",
              name: "Mehdi Taremi",
              pos: "Forward · Inter Milan",
              team: "IRI",
            },
            {
              num: "10",
              name: "Sardar Azmoun",
              pos: "Forward · Bayer Leverkusen",
              team: "IRI",
            },
          ],
        },
        "playoff-usa": {
          home: { flag: "❓", name: "TBD", country: "UEFA Playoff C Winner" },
          away: { flag: "🇺🇸", name: "USA", country: "United States" },
          round: "Group Stage · Group D · M59",
          date: "June 25, 2026 · Thu · 19:00",
          venue: "SoFi Stadium, Inglewood",
          highlight:
            "USA's final group stage match — the USMNT push for the knockout rounds in front of their home crowd.",
          h2h: { total: 0, team1wins: 0, draws: 0 },
          players: [
            {
              num: "10",
              name: "Christian Pulisic",
              pos: "Forward · AC Milan",
              team: "USA",
            },
            {
              num: "25",
              name: "Ricardo Pepi",
              pos: "Forward · PSV",
              team: "USA",
            },
          ],
        },
        "r32-m73": {
          home: { flag: "❓", name: "TBD", country: "To Be Determined" },
          away: { flag: "❓", name: "TBD", country: "To Be Determined" },
          round: "Round of 32 · M73",
          date: "June 28, 2026 · Sun · 12:00",
          venue: "SoFi Stadium, Inglewood",
          highlight:
            "Round of 32 match — teams to be determined after group stage.",
          h2h: { total: 0, team1wins: 0, draws: 0 },
          players: [],
        },
        "r32-m84": {
          home: { flag: "❓", name: "TBD", country: "To Be Determined" },
          away: { flag: "❓", name: "TBD", country: "To Be Determined" },
          round: "Round of 32 · M84",
          date: "July 2, 2026 · Thu · 12:00",
          venue: "SoFi Stadium, Inglewood",
          highlight:
            "Round of 32 match — teams to be determined after group stage.",
          h2h: { total: 0, team1wins: 0, draws: 0 },
          players: [],
        },
        "qf-m98": {
          home: { flag: "❓", name: "TBD", country: "To Be Determined" },
          away: { flag: "❓", name: "TBD", country: "To Be Determined" },
          round: "Quarter-Finals · M98",
          date: "July 10, 2026 · Fri · 12:00",
          venue: "SoFi Stadium, Inglewood",
          highlight:
            "Quarter-Final — the road to the World Cup Final runs through SoFi Stadium.",
          h2h: { total: 0, team1wins: 0, draws: 0 },
          players: [],
        },
      };

      const HOTELS = [
        {
          name: "The West Hollywood EDITION",
          region: "West Hollywood",
          address: "9040 W Sunset Blvd",
          stars: 5,
          price: "$400+/night",
          reviews: 758,
          emoji: "🌃",
        },
        {
          name: "Petit Ermitage",
          region: "West Hollywood",
          address: "8822 Cynthia St",
          stars: 4,
          price: "$400+/night",
          reviews: 720,
          emoji: "🏡",
        },
        {
          name: "Andaz West Hollywood",
          region: "West Hollywood",
          address: "8401 W Sunset Blvd",
          stars: 4,
          price: "$200+/night",
          reviews: 1775,
          emoji: "🌆",
        },
        {
          name: "Best Western Plus Sunset Plaza",
          region: "West Hollywood",
          address: "8400 W Sunset Blvd",
          stars: 3,
          price: "$200+/night",
          reviews: 1246,
          emoji: "🏨",
        },
        {
          name: "Royal Palace Westwood",
          region: "Westwood",
          address: "1052 Tiverton Ave",
          stars: 3,
          price: "$100+/night",
          reviews: 523,
          emoji: "🏰",
        },
        {
          name: "W Los Angeles - West Beverly Hills",
          region: "Westwood",
          address: "930 Hilgard Ave",
          stars: 5,
          price: "$400+/night",
          reviews: 2341,
          emoji: "✦",
        },
        {
          name: "Hotel Angeleno",
          region: "Westwood",
          address: "170 N Church Ln",
          stars: 4,
          price: "$200+/night",
          reviews: 1892,
          emoji: "🌉",
        },
        {
          name: "Shutters on the Beach",
          region: "Santa Monica",
          address: "1 Pico Blvd",
          stars: 5,
          price: "$400+/night",
          reviews: 3120,
          emoji: "🌊",
        },
        {
          name: "Loews Santa Monica Beach Hotel",
          region: "Santa Monica",
          address: "1700 Ocean Ave",
          stars: 5,
          price: "$400+/night",
          reviews: 4230,
          emoji: "🏖",
        },
        {
          name: "Shore Hotel",
          region: "Santa Monica",
          address: "1515 Ocean Ave",
          stars: 4,
          price: "$200+/night",
          reviews: 1856,
          emoji: "🌅",
        },
        {
          name: "The Biltmore Los Angeles",
          region: "Downtown LA",
          address: "506 S Grand Ave",
          stars: 5,
          price: "$400+/night",
          reviews: 2890,
          emoji: "🏛",
        },
        {
          name: "Hotel Indigo Los Angeles DTLA",
          region: "Downtown LA",
          address: "899 Francisco St",
          stars: 4,
          price: "$200+/night",
          reviews: 1432,
          emoji: "🌃",
        },
      ];

      const RESTAURANTS = [
        {
          name: "Norah",
          region: "West Hollywood",
          address: "8279 Santa Monica Blvd",
          price: "$50–100",
          flavor: "American",
          score: 4.6,
          emoji: "🥩",
        },
        {
          name: "Night + Market WeHo",
          region: "West Hollywood",
          address: "9041 Sunset Blvd",
          price: "$30–50",
          flavor: "Asian",
          score: 4.6,
          emoji: "🍜",
        },
        {
          name: "Katsuya West Hollywood",
          region: "West Hollywood",
          address: "8929 Sunset Blvd",
          price: "$50–100",
          flavor: "Asian",
          score: 4.4,
          emoji: "🍣",
        },
        {
          name: "Dialog Cafe",
          region: "West Hollywood",
          address: "8766 Holloway Dr",
          price: "$20–30",
          flavor: "American",
          score: 4.5,
          emoji: "☕",
        },
        {
          name: "Bestia",
          region: "Downtown LA",
          address: "2121 E 7th Pl",
          price: "$50–100",
          flavor: "Italian",
          score: 4.7,
          emoji: "🍝",
        },
        {
          name: "Cassia",
          region: "Santa Monica",
          address: "1314 7th St",
          price: "$30–50",
          flavor: "Asian Fusion",
          score: 4.5,
          emoji: "🥗",
        },
        {
          name: "Nobu Malibu",
          region: "Malibu",
          address: "22706 Pacific Coast Hwy",
          price: "$100+",
          flavor: "Japanese",
          score: 4.6,
          emoji: "🍱",
        },
        {
          name: "Guelaguetza",
          region: "Downtown LA",
          address: "3014 W Olympic Blvd",
          price: "$20–30",
          flavor: "South American",
          score: 4.5,
          emoji: "🌮",
        },
        {
          name: "Bavel",
          region: "Downtown LA",
          address: "500 Mateo St",
          price: "$50–100",
          flavor: "Middle Eastern",
          score: 4.6,
          emoji: "🧆",
        },
        {
          name: "Gjusta",
          region: "Venice",
          address: "320 Sunset Ave",
          price: "$20–30",
          flavor: "American",
          score: 4.6,
          emoji: "🥐",
        },
        {
          name: "Tar & Roses",
          region: "Santa Monica",
          address: "602 Santa Monica Blvd",
          price: "$30–50",
          flavor: "American",
          score: 4.6,
          emoji: "🌹",
        },
        {
          name: "Perle",
          region: "Downtown LA",
          address: "123 S Figueroa St",
          price: "$20–30",
          flavor: "South American",
          score: 4.4,
          emoji: "🥘",
        },
      ];

      const FAN_EVENTS = [
        {
          name: "FIFA Fan Festival™ LA",
          area: "Exposition Park",
          date: "Jun 11–15",
          price: "Free",
          desc: "Live match broadcasts, concerts, cultural programming",
          emoji: "🎊",
        },
        {
          name: "Fan Zone – Farmers Market",
          area: "Fairfax District",
          date: "Jun 18–21",
          price: "Free",
          desc: "Official FIFA Fan Zone at The Original Farmers Market",
          emoji: "⚽",
        },
        {
          name: "Fan Zone – Union Station",
          area: "Downtown LA",
          date: "Jun 25–28",
          price: "Free",
          desc: "Live match viewing at historic transit hub",
          emoji: "🚂",
        },
        {
          name: "Fan Zone – Hansen Dam",
          area: "San Fernando Valley",
          date: "Jul 2–5",
          price: "Free",
          desc: "Outdoor lakeside match viewing",
          emoji: "🏞",
        },
        {
          name: "Fan Zone – City of Downey",
          area: "Downey",
          date: "Jun 20",
          price: "Free",
          desc: "Community fan experience at Stonewood Center",
          emoji: "🏟",
        },
        {
          name: "2026 Suite & Lounge Events",
          area: "Various",
          date: "Jun 11 – Jul 19",
          price: "$$$",
          desc: "Premium hospitality events and viewing parties",
          emoji: "🥂",
        },
      ];

      const SHOWS = [
        {
          name: "Hollywood Bowl Orchestra Night",
          venue: "Hollywood Bowl",
          date: "Jun 16",
          price: "$40–$120",
          desc: "Classic LA summer concert experience",
          emoji: "🎻",
        },
        {
          name: "Cinespia Outdoor Movie",
          venue: "Hollywood Forever Cemetery",
          date: "Jun 18",
          price: "$25–$35",
          desc: "Open-air film night with picnic seating",
          emoji: "🎬",
        },
        {
          name: "Hollywood Improv Stand-up",
          venue: "Hollywood Improv",
          date: "Jun 17",
          price: "$25–$60",
          desc: "Club-style stand-up with recognizable comedians",
          emoji: "😂",
        },
        {
          name: "The Comedy Store Stand-up",
          venue: "The Comedy Store",
          date: "Jun 20",
          price: "$20–$50",
          desc: "Legendary Sunset Strip comedy",
          emoji: "🎤",
        },
        {
          name: "Troubadour Live Concert",
          venue: "The Troubadour",
          date: "Jun 22",
          price: "$20–$50",
          desc: "Intimate West Hollywood rock concert",
          emoji: "🎸",
        },
        {
          name: "Hollywood Bowl Jazz Night",
          venue: "Hollywood Bowl",
          date: "Jun 26",
          price: "$30–$80",
          desc: "Summer jazz under the stars",
          emoji: "🎷",
        },
      ];

      function openMatch(id) {
        const m = MATCH_DATA[id];
        document.getElementById("overlayContent").innerHTML = `
    <div style="border-bottom:3px solid var(--ink); margin-bottom:2rem; padding-bottom:0.5rem; display:flex; justify-content:space-between; align-items:baseline;">
      <span style="font-family:'DM Mono',monospace; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--silver);">${
        m.round
      }</span>
      <span style="font-family:'DM Mono',monospace; font-size:0.62rem; color:var(--silver);">${
        m.date
      }</span>
    </div>
    <div class="detail-hero">
      <div class="detail-team"><span class="detail-flag">${
        m.home.flag
      }</span><div class="detail-name">${
          m.home.name
        }</div><div style="font-family:'DM Mono',monospace;font-size:0.6rem;color:var(--silver);">${
          m.home.country
        }</div></div>
      <div class="detail-vs-block"><span class="detail-vs">versus</span><div class="detail-match-info">${
        m.venue
      }</div></div>
      <div class="detail-team"><span class="detail-flag">${
        m.away.flag
      }</span><div class="detail-name">${
          m.away.name
        }</div><div style="font-family:'DM Mono',monospace;font-size:0.6rem;color:var(--silver);">${
          m.away.country
        }</div></div>
    </div>
    <div style="margin-bottom:2.5rem;">
      <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:0.8rem;">Match Storyline</div>
      <p style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.1rem;line-height:1.7;color:var(--charcoal);">${
        m.highlight
      }</p>
    </div>
    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:1rem;">Head-to-Head Record</div>
    <div class="h2h-block">
      <div class="h2h-stat"><div class="h2h-num">${
        m.h2h.total
      }</div><div class="h2h-label">Total Meetings</div></div>
      <div class="h2h-stat"><div class="h2h-num">${
        m.h2h.team1wins
      }</div><div class="h2h-label">${m.home.name} Wins</div></div>
      <div class="h2h-stat"><div class="h2h-num">${
        m.h2h.draws
      }</div><div class="h2h-label">Draws</div></div>
    </div>
    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:1rem;">Star Players to Watch</div>
    <div class="players-row" style="margin-bottom:2.5rem;">
      ${m.players
        .map(
          (p) =>
            `<div class="player-card"><div class="player-number">${p.num}</div><div><div class="player-name">${p.name}</div><div class="player-pos">${p.pos}</div><div style="font-family:'DM Mono',monospace;font-size:0.58rem;color:var(--silver);margin-top:0.15rem;">${p.team}</div></div></div>`
        )
        .join("")}
    </div>
    <div style="font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--silver);margin-bottom:1rem;">Nearby: Hotels & Dining</div>
    <div class="nearby-tabs">
      <button class="nearby-tab active" onclick="toggleNearby('hotels-d')">Hotels</button>
      <button class="nearby-tab" onclick="toggleNearby('restaurants-d')">Restaurants</button>
      <button class="nearby-tab" onclick="toggleNearby('events-d')">Events</button>
    </div>
    <div id="hotels-d" class="nearby-grid">${HOTELS.slice(0, 6)
      .map(
        (h) =>
          `<div class="nearby-card"><div class="nearby-name">${
            h.name
          }</div><div class="nearby-sub">${
            h.region
          }</div><div class="nearby-price">${h.price} · ${"★".repeat(
            h.stars
          )}</div></div>`
      )
      .join("")}</div>
    <div id="restaurants-d" class="nearby-grid" style="display:none">${RESTAURANTS.slice(
      0,
      6
    )
      .map(
        (r) =>
          `<div class="nearby-card"><div class="nearby-name">${r.name}</div><div class="nearby-sub">${r.flavor} · ${r.region}</div><div class="nearby-price">${r.price} · ★ ${r.score}</div></div>`
      )
      .join("")}</div>
    <div id="events-d" class="nearby-grid" style="display:none">${FAN_EVENTS.slice(
      0,
      6
    )
      .map(
        (e) =>
          `<div class="nearby-card"><div class="nearby-name">${e.emoji} ${e.name}</div><div class="nearby-sub">${e.area} · ${e.date}</div><div class="nearby-price">${e.price}</div></div>`
      )
      .join("")}</div>
  `;
        document.getElementById("matchOverlay").style.display = "block";
        document.body.style.overflow = "hidden";
      }
      function closeMatch() {
        document.getElementById("matchOverlay").style.display = "none";
        document.body.style.overflow = "";
      }
      function toggleNearby(id) {
        ["hotels-d", "restaurants-d", "events-d"].forEach((pid) => {
          const el = document.getElementById(pid);
          if (el) el.style.display = "none";
        });
        const t = document.getElementById(id);
        if (t) t.style.display = "grid";
        event.currentTarget
          .closest(".nearby-tabs")
          .querySelectorAll(".nearby-tab")
          .forEach((b) => b.classList.remove("active"));
        event.currentTarget.classList.add("active");
      }

// Each type+budget has three distinct day plans:
//   day1  — Arrival day (lighter, iconic first impressions)
//   day2  — Full exploration day (different area from day1)
//   extra — For Day 4, 5, 6, 7 (yet another area/vibe)
// Match day reuses day2 activities (minus last) + the match itself.
const ITIN_TEMPLATES = {
  football: {
    budget: {
      day1: [
        { time: "09:00", title: "Walk the Hollywood Walk of Fame", desc: "Snap iconic star shots before the crowds hit · Free" },
        { time: "11:30", title: "Lunch at Grand Central Market", desc: "DTLA · legendary indoor market · $10-15 meals, huge variety" },
        { time: "14:00", title: "Fan Zone – Original Farmers Market", desc: "Official FIFA Fan Zone · live match replays · free entry" },
        { time: "18:00", title: "FIFA Fan Festival · Exposition Park", desc: "Live broadcasts · music stage · international fan atmosphere" },
        { time: "20:30", title: "Pre-game drinks at a sports bar", desc: "Yard House or O'Brien's — watch other matches, meet fans" },
      ],
      day2: [
        { time: "08:00", title: "Griffith Observatory sunrise hike", desc: "Free access · city views · Hollywood sign backdrop" },
        { time: "10:30", title: "LACMA + La Brea Tar Pits", desc: "Free entry with student ID · prehistoric fossils next door" },
        { time: "13:30", title: "Lunch at Guelaguetza", desc: "DTLA · Oaxacan food · $15-20pp · a true LA classic" },
        { time: "16:00", title: "Venice Beach → Muscle Beach", desc: "Classic free LA experience · street art · skateboarding" },
        { time: "20:00", title: "FIFA Fan Zone party · Hansen Dam", desc: "Free outdoor screening · meet international fans" },
      ],
      extra: [
        { time: "09:00", title: "Santa Monica Beach morning walk", desc: "Pacific coastline · bike rental available · Free" },
        { time: "11:00", title: "3rd Street Promenade", desc: "Open-air pedestrian mall · street performers · free" },
        { time: "14:00", title: "The Getty Center", desc: "World-class art · panoramic LA views · free admission" },
        { time: "17:30", title: "Runyon Canyon sunset hike", desc: "Hollywood Hills · celebrity dog park · city views" },
        { time: "20:30", title: "Comedy Store on Sunset Strip", desc: "Legendary comedy club · $20-40 · possible celebrity drop-ins" },
      ],
    },
    mid: {
      day1: [
        { time: "09:30", title: "Brunch at Gjusta", desc: "Venice · legendary bakery — arrive early to beat the line · $20-30pp" },
        { time: "11:30", title: "FIFA Fan Festival · Exposition Park", desc: "Live broadcasts · music · interactive fan experiences · Free" },
        { time: "14:30", title: "SoFi Stadium area explore", desc: "Inglewood · walk the stadium exterior · fan merchandise" },
        { time: "17:30", title: "Dinner at Night + Market WeHo", desc: "Thai street food on Sunset · bold flavors · $30-50pp" },
        { time: "21:00", title: "Skybar at Mondrian", desc: "Iconic WeHo rooftop · cocktails · city views · $15 drinks" },
      ],
      day2: [
        { time: "08:30", title: "Runyon Canyon hike", desc: "Hollywood Hills · celebrity dog park · Instagram-worthy views · Free" },
        { time: "11:00", title: "Echo Park neighborhood explore", desc: "Coffee at Valerie · vintage shops · lake views" },
        { time: "13:30", title: "Lunch at Bestia", desc: "Downtown LA · Italian · $50-70pp · book well ahead" },
        { time: "16:00", title: "Venice Beach → Abbot Kinney Blvd", desc: "LA's coolest street · boutiques · coffee · street art" },
        { time: "20:30", title: "Hollywood Improv or Comedy Store", desc: "Sunset Strip nightlife · $25-60 · possible celebrity drop-ins" },
      ],
      extra: [
        { time: "09:00", title: "Malibu coastal drive (PCH)", desc: "Rent a car · Point Dume · El Matador Beach · stunning cliffs" },
        { time: "12:30", title: "Lunch at Nobu Malibu", desc: "Oceanfront Japanese dining · celebrity hotspot · $80-120pp" },
        { time: "15:00", title: "Getty Villa", desc: "Ancient Greek & Roman antiquities · Malibu · $20 parking only" },
        { time: "18:00", title: "Santa Monica Pier at sunset", desc: "Iconic Pacific Park · Ferris wheel · golden hour photos" },
        { time: "20:30", title: "Dinner at Tar & Roses", desc: "Santa Monica · wood-fired Mediterranean · $40-60pp" },
      ],
    },
    luxury: {
      day1: [
        { time: "09:00", title: "Breakfast at The West Hollywood EDITION", desc: "Rooftop terrace · Sunset Strip views · champagne morning" },
        { time: "11:00", title: "Private SoFi Stadium tour", desc: "Behind-the-scenes · locker rooms · press box · field access" },
        { time: "14:00", title: "Lunch at Nobu Malibu", desc: "Oceanfront Japanese · celebrity hotspot · $100-150pp" },
        { time: "18:00", title: "Pre-match cocktails at The Roof at The Edition", desc: "Sunset views · curated cocktails · see and be seen" },
        { time: "21:00", title: "Late dinner at Matsuhisa Beverly Hills", desc: "Nobu Matsuhisa's original LA restaurant · omakase experience" },
      ],
      day2: [
        { time: "09:00", title: "Private helicopter tour of LA", desc: "Hollywood Sign · Griffith · SoFi from above · 60 mins · $400pp" },
        { time: "11:30", title: "The Getty Center private tour", desc: "Curator-led tour · world-class art collection · panoramic views" },
        { time: "14:00", title: "Lunch on Rodeo Drive", desc: "Il Cielo or Spago Beverly Hills · see and be seen · $100+pp" },
        { time: "17:00", title: "Spa at Four Seasons Beverly Hills", desc: "Signature treatments · 2-hour wellness ritual" },
        { time: "20:30", title: "Dinner at Providence", desc: "2-Michelin star · chef's tasting menu with wine pairing · $250+pp" },
      ],
      extra: [
        { time: "10:00", title: "Malibu private beach club morning", desc: "Soho House Malibu · ocean-view pool · members & guests" },
        { time: "13:00", title: "Warner Bros Studio VIP tour", desc: "Private guide · working sets · props vault · $300pp" },
        { time: "16:00", title: "Beverly Hills Hotel afternoon tea", desc: "The Polo Lounge · iconic pink hotel · $60pp" },
        { time: "19:00", title: "Mastro's Steakhouse", desc: "Beverly Hills · prime steaks · live piano · $150pp" },
        { time: "22:00", title: "Skybar at Mondrian", desc: "Exclusive WeHo rooftop · VIP access · stunning city views" },
      ],
    },
  },

  family: {
    budget: {
      day1: [
        { time: "09:00", title: "Venice Beach Boardwalk", desc: "Street performers · skate park · beach — kids love it · Free" },
        { time: "11:30", title: "Lunch at Original Farmers Market", desc: "Fan Zone + food court · something for everyone · $15-25pp" },
        { time: "14:00", title: "Natural History Museum", desc: "Exposition Park · T-Rex skeletons · $15 adults, $7 kids" },
        { time: "17:00", title: "Santa Monica Pier", desc: "Ferris wheel · games · Pacific Park · golden hour views" },
        { time: "19:30", title: "Dinner at In-N-Out Burger", desc: "California classic · the kids will thank you · $10pp" },
      ],
      day2: [
        { time: "09:00", title: "Griffith Observatory", desc: "Free admission · city panorama · telescopes · Hollywood sign backdrop" },
        { time: "11:00", title: "Lunch at Grand Central Market", desc: "DTLA · $10-15pp · huge variety · something for every kid" },
        { time: "13:00", title: "La Brea Tar Pits & Museum", desc: "Bubbling asphalt · real mammoth fossils · $15 adults, $7 kids" },
        { time: "16:00", title: "The Grove outdoor mall", desc: "Trolley · fountain show · Disney Store · free to browse" },
        { time: "18:30", title: "Dinner at The Cheesecake Factory", desc: "The Grove · massive menu · reliable family favourite · $20-30pp" },
      ],
      extra: [
        { time: "09:30", title: "Exposition Park Rose Garden", desc: "Free · 16,000 roses in bloom · great family photos" },
        { time: "11:00", title: "California Science Center", desc: "Space Shuttle Endeavour · free admission · kids go wild" },
        { time: "14:00", title: "Aquarium of the Pacific · Long Beach", desc: "Sharks · sea otters · jellyfish · $35 adults, $20 kids" },
        { time: "17:30", title: "Shoreline Village · Long Beach", desc: "Waterfront boardwalk · ice cream · harbour views" },
        { time: "19:00", title: "Dinner at Bubba Gump Shrimp", desc: "Long Beach waterfront · kids love the Forrest Gump theme · $25pp" },
      ],
    },
    mid: {
      day1: [
        { time: "09:00", title: "Universal Studios Hollywood — full day", desc: "Theme park · World Cup-themed activations · book tickets in advance · $130pp" },
        { time: "12:30", title: "Lunch at Universal CityWalk", desc: "Dozens of restaurants in the entertainment complex · $20-30pp" },
        { time: "17:00", title: "CityWalk shopping & shows", desc: "Street performers · movie memorabilia · last rides of the day" },
        { time: "19:30", title: "Dinner at Vivo Cucina Italiana · CityWalk", desc: "Italian at CityWalk · relaxed · $30-40pp · no need to drive" },
      ],
      day2: [
        { time: "09:00", title: "Santa Monica Beach morning", desc: "Pacific coastline · bike rental · kids love the sand · Free" },
        { time: "11:30", title: "Lunch at Gladstone's · Pacific Palisades", desc: "Oceanfront seafood · casual · $30-40pp · legendary LA spot" },
        { time: "14:00", title: "FIFA Fan Festival · Exposition Park", desc: "Interactive football games · kids' zone · face painting · Free" },
        { time: "17:30", title: "Venice Beach sunset walk", desc: "Boardwalk · street art · rollerbladers · Free" },
        { time: "20:00", title: "Dinner on 3rd Street Promenade", desc: "Santa Monica · open-air mall · family-friendly options · $25-35pp" },
      ],
      extra: [
        { time: "09:30", title: "Natural History Museum", desc: "Exposition Park · T-Rex skeletons · gem vault · $15 adults, $7 kids" },
        { time: "11:30", title: "La Brea Tar Pits", desc: "Bubbling asphalt pits · real Ice Age fossils · next door to NHM" },
        { time: "13:30", title: "Lunch at Katsuya West Hollywood", desc: "Family-friendly Japanese · kid-friendly sushi options · $30-40pp" },
        { time: "15:30", title: "Griffith Observatory", desc: "City panorama · telescopes · free admission · scenic drive up" },
        { time: "19:00", title: "Dinner at Din Tai Fung · The Americana at Brand", desc: "Legendary Taiwanese dumplings · kids love it · $25-35pp" },
      ],
    },
    luxury: {
      day1: [
        { time: "09:00", title: "Private LA Helicopter Tour", desc: "Hollywood Sign · Griffith · SoFi Stadium from above · 60 mins · $400pp" },
        { time: "11:30", title: "Lunch at Shutters on the Beach", desc: "Oceanfront Santa Monica · perfect for families · $60-80pp" },
        { time: "14:30", title: "The Getty Center family visit", desc: "World-class art · free admission · panoramic garden for kids to run" },
        { time: "18:00", title: "Sunset Cruise from Marina del Rey", desc: "Private boat · champagne for adults, mocktails for kids · 90 mins" },
        { time: "20:30", title: "Dinner at Mastro's Ocean Club", desc: "Malibu · fresh seafood · live music · $100pp" },
      ],
      day2: [
        { time: "09:00", title: "Disneyland — full day", desc: "Anaheim · 45 min drive · book VIP Guide for zero wait times · $200pp+" },
        { time: "13:00", title: "Lunch at Carthay Circle Restaurant", desc: "Inside Disneyland · elegant Art Deco · signature cocktails · $60pp" },
        { time: "19:00", title: "Fantasy Faire & evening parade", desc: "End the day with fireworks and the Main Street Electrical Parade" },
        { time: "21:00", title: "Return to hotel", desc: "Exhausted and happy — early night for the kids" },
      ],
      extra: [
        { time: "09:30", title: "Warner Bros Studio VIP Tour", desc: "Private guide · working sets · props vault · Friends Central Perk · $300pp" },
        { time: "13:00", title: "Lunch at Beverly Hills Hotel · Polo Lounge", desc: "Iconic pink hotel · celebrity-spotting · $80pp" },
        { time: "15:00", title: "Rodeo Drive window shopping & gelato", desc: "Walk the most famous shopping street in the world · Bottega Veneta to Ladurée" },
        { time: "18:00", title: "Petersen Automotive Museum", desc: "Ferrari · Batmobile · $18 adults, $10 kids — spectacular car collection" },
        { time: "20:00", title: "Dinner at Providence", desc: "2-Michelin star · exceptional tasting menu · $250pp — a truly special night" },
      ],
    },
  },

  backpacker: {
    budget: {
      day1: [
        { time: "08:00", title: "Griffith Observatory sunrise hike", desc: "Free access · city views · Hollywood sign backdrop" },
        { time: "10:30", title: "Brunch at Grand Central Market", desc: "DTLA · $8-12pp · diverse options · iconic indoor market" },
        { time: "13:00", title: "LACMA + La Brea Tar Pits walk", desc: "Free entry with student ID · fossils and art on the same block" },
        { time: "16:00", title: "Venice Beach → Muscle Beach", desc: "Classic free LA experience · street art · skateboarding" },
        { time: "20:00", title: "FIFA Fan Zone party · Hansen Dam", desc: "Free outdoor screening · meet international fans" },
      ],
      day2: [
        { time: "08:30", title: "Runyon Canyon morning hike", desc: "Hollywood Hills · free · city views · celebrity dog park" },
        { time: "11:00", title: "Echo Park neighbourhood", desc: "Coffee at Stereoscope · lake walk · vintage shops · local vibe" },
        { time: "13:30", title: "Lunch at Langer's Deli", desc: "DTLA institution · pastrami on rye since 1947 · $15pp" },
        { time: "16:00", title: "Silverlake Reservoir walk", desc: "Neighbourhood stroll · street murals · indie coffee shops · Free" },
        { time: "20:00", title: "Outdoor movie or live music at The Echo", desc: "$10-15 · Sunset Strip indie scene · local crowd · authentic LA" },
      ],
      extra: [
        { time: "08:00", title: "El Matador Beach · Malibu", desc: "PCH drive · free state beach · dramatic sea caves · stunning" },
        { time: "11:30", title: "Zuma Beach", desc: "Wide sandy stretch · free parking early · surfers · bodysurfing" },
        { time: "14:00", title: "Malibu Pier & Surfrider Beach", desc: "Free · watch surfers · grab fish tacos from a truck · $8" },
        { time: "17:00", title: "Getty Villa · Pacific Palisades", desc: "Greek & Roman antiquities · free Tue–Fri · must book ahead" },
        { time: "20:00", title: "Sunset at Santa Monica Pier", desc: "Free · Ferris wheel lights on · perfect end to a Malibu day" },
      ],
    },
    mid: {
      day1: [
        { time: "08:30", title: "Runyon Canyon morning hike", desc: "Hollywood Hills · Instagram views · celebrity dog park · Free" },
        { time: "11:00", title: "Echo Park neighbourhood explore", desc: "Coffee at Valerie · vintage shops · lake views · local feel" },
        { time: "14:00", title: "The Echo or Echoplex live music", desc: "Indie venue on Sunset · $15-30 · discover local LA acts" },
        { time: "18:00", title: "Dinner at Night + Market WeHo", desc: "Thai street food on Sunset · bold flavors · $30-50pp" },
        { time: "21:00", title: "Hollywood Improv or Comedy Store", desc: "Classic LA nightlife · $25-60 · possible celebrity drop-ins" },
      ],
      day2: [
        { time: "09:00", title: "Malibu coastal drive (PCH)", desc: "Rent a car · Pacific Coast Highway · wind-down cliffs and coves" },
        { time: "11:00", title: "El Matador Beach hike", desc: "Sea caves · turquoise water · dramatic rock formations · Free" },
        { time: "13:30", title: "Lunch at Malibu Seafood", desc: "Unpretentious fish shack · lobster bisque · $20pp · locals' pick" },
        { time: "15:30", title: "Getty Villa", desc: "Ancient Greek & Roman art · ocean views · $20 parking only" },
        { time: "19:30", title: "Dinner at Tar & Roses · Santa Monica", desc: "Wood-fired Mediterranean · $40-60pp · great cocktail list" },
      ],
      extra: [
        { time: "09:00", title: "Abbot Kinney Blvd · Venice", desc: "LA's hippest street · independent shops · street art · Free to stroll" },
        { time: "11:00", title: "Brunch at Gjusta", desc: "Venice · legendary bakery · $20-30pp · arrive early" },
        { time: "14:00", title: "Culver City art gallery walk", desc: "Blum & Poe · Hauser & Wirth · world-class galleries · Free" },
        { time: "17:30", title: "LACMA sunset visit", desc: "Urban Lights installation · free after 3pm Fri · iconic photo op" },
        { time: "20:00", title: "Dinner at Bestia · DTLA", desc: "Italian · wood-fired · $60-80pp · book 2 weeks ahead" },
      ],
    },
    luxury: {
      day1: [
        { time: "09:30", title: "Brunch at Gjusta · Venice", desc: "Legendary bakery · sourdough · smoked fish · $25-35pp" },
        { time: "11:30", title: "Culver City art gallery walk", desc: "Blum & Poe · Hauser & Wirth · Sprüth Magers · world-class · Free" },
        { time: "14:30", title: "The Getty Center", desc: "Impressionist masterpieces · free admission · panoramic sculpture garden" },
        { time: "18:30", title: "Dinner at Bestia · DTLA", desc: "Italian · wood-fired · $70-90pp · book far ahead" },
        { time: "21:30", title: "Cinespia outdoor movie · Hollywood Forever", desc: "Iconic cemetery screening · $30pp · bring a blanket and wine" },
      ],
      day2: [
        { time: "09:00", title: "Malibu coastal drive (PCH)", desc: "Convertible rental recommended · El Matador → Zuma → Point Dume" },
        { time: "11:30", title: "El Matador Beach", desc: "Sea caves · dramatic cliffs · turquoise water · Free state beach" },
        { time: "13:30", title: "Lunch at Nobu Malibu", desc: "Oceanfront · world-famous Japanese · $80-120pp · book ahead" },
        { time: "16:00", title: "Getty Villa · Pacific Palisades", desc: "Greek & Roman antiquities · ocean view gardens · $20 parking" },
        { time: "20:00", title: "Cocktails at Chateau Marmont", desc: "Legendary Sunset Strip hotel bar · $25 cocktails · old Hollywood glamour" },
      ],
      extra: [
        { time: "09:30", title: "Abbot Kinney Blvd morning stroll", desc: "Venice · independent boutiques · street art · espresso at G&B Coffee" },
        { time: "12:00", title: "LACMA + Broad Museum art walk", desc: "Basquiat · Koons · Cindy Sherman · free at The Broad" },
        { time: "15:30", title: "MOCA Grand Avenue", desc: "Mark Rothko · Jackson Pollock · $18 · stunning Arata Isozaki building" },
        { time: "18:30", title: "Pre-dinner drinks at Perch · DTLA", desc: "15th-floor French rooftop bar · sweeping city views · $18 cocktails" },
        { time: "20:30", title: "Dinner at Vespertine · Culver City", desc: "Avant-garde tasting menu · $300pp · one of LA's most unique experiences" },
      ],
    },
  },

  luxury: {
    budget: null,
    mid: null,
    luxury: {
      day1: [
        { time: "10:00", title: "In-suite breakfast · The West Hollywood EDITION", desc: "Private terrace · city views · personally curated menu" },
        { time: "12:00", title: "Private shopping on Rodeo Drive", desc: "Personal shopper arranged · Gucci · Hermès · Louis Vuitton" },
        { time: "15:00", title: "Spa at Four Seasons Beverly Hills", desc: "Signature treatments · 3-hour wellness ritual" },
        { time: "19:00", title: "Dinner at Providence", desc: "2-Michelin star · chef's tasting menu with wine pairing · $250+pp" },
        { time: "22:00", title: "Private Rooftop World Cup Party", desc: "The Edition Rooftop · exclusive hire · live entertainment" },
      ],
      day2: [
        { time: "09:00", title: "Private helicopter tour of LA", desc: "Hollywood Sign · Griffith · Beverly Hills · SoFi from above · 60 mins" },
        { time: "11:30", title: "Lunch at Nobu Malibu", desc: "Oceanfront Japanese · celebrity hotspot · $100-150pp · book ahead" },
        { time: "15:00", title: "Private sailing · Marina del Rey", desc: "Chartered catamaran · champagne · sunset on the Pacific · 3 hrs" },
        { time: "19:30", title: "Mastro's Steakhouse · Beverly Hills", desc: "Prime steaks · live piano · $150pp · legendary LA power-dining" },
        { time: "22:00", title: "Skybar at Mondrian Hotel", desc: "Iconic WeHo rooftop pool bar · VIP access · city views" },
      ],
      extra: [
        { time: "10:00", title: "Warner Bros Studio VIP tour", desc: "Private guide · working sets · Hogwarts · Friends set · $300pp" },
        { time: "13:00", title: "Lunch at The Polo Lounge · Beverly Hills Hotel", desc: "Hollywood legend · poolside · celebrity-spotting · $80pp" },
        { time: "15:30", title: "LACMA private curator tour", desc: "After-hours access · expert guide through the collection" },
        { time: "18:30", title: "Pre-dinner cocktails at Hotel Bel-Air", desc: "Swans on the lake · garden bar · $30 cocktails · pure old Hollywood" },
        { time: "20:30", title: "Dinner at Chateau Marmont", desc: "Legendary Sunset Strip · film industry table · $200pp" },
      ],
    },
  },
};
