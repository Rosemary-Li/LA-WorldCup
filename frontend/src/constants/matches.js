export const matchRows = [
  { key: "M4",  badge: "#1D428A", group: "Group D",       teams: ["🇺🇸", "USA",         "Paraguay",    "🇵🇾"], date: "June 12", sub: "Friday · 6:00 pm PT" },
  { key: "M15", badge: "#239F40", group: "Group G",       teams: ["🇮🇷", "IR Iran",     "New Zealand", "🇳🇿"], date: "June 15", sub: "Monday · 6:00 pm PT" },
  { key: "M26", badge: "#C8102E", group: "Group B",       teams: ["🇨🇭", "Switzerland", "TBD",         ""],   date: "June 18", sub: "Thursday · 12:00 pm PT", awayTbd: true },
  { key: "M39", badge: "#C49A00", group: "Group G",       teams: ["🇧🇪", "Belgium",     "IR Iran",     "🇮🇷"], date: "June 21", sub: "Sunday · 12:00 pm PT" },
  { key: "M59", badge: "#E30A17", group: "Group D",       teams: ["",   "TBD",          "USA",         "🇺🇸"], date: "June 25", sub: "Thursday · 7:00 pm PT",  homeTbd: true },
  { key: "M73", badge: "#5C4033", group: "Round of 32",   teams: ["",   "TBD",          "TBD",         ""],   date: "June 28", sub: "Sunday · 12:00 pm PT",    homeTbd: true, awayTbd: true },
  { key: "M84", badge: "#37474F", group: "Round of 32",   teams: ["",   "TBD",          "TBD",         ""],   date: "July 2",  sub: "Thursday · 12:00 pm PT",  homeTbd: true, awayTbd: true },
  { key: "M98", badge: "#1A1A2E", group: "Quarter-Final", teams: ["",   "TBD",          "TBD",         ""],   date: "July 10", sub: "Friday · 12:00 pm PT",    homeTbd: true, awayTbd: true },
];

export const matchMeta = {
  M4:  { home: { flag: "🇺🇸", name: "USA", country: "United States" },        away: { flag: "🇵🇾", name: "PAR", country: "Paraguay" },            highlight: "USMNT opens the World Cup on home soil against Paraguay in a pivotal Group D clash.",                         h2h: { total: 5, team1wins: 3, draws: 1 } },
  M15: { home: { flag: "🇮🇷", name: "IRI", country: "Iran" },                 away: { flag: "🇳🇿", name: "NZL", country: "New Zealand" },          highlight: "Iran face New Zealand in a decisive Group G encounter at SoFi Stadium.",                                     h2h: { total: 2, team1wins: 1, draws: 0 } },
  M26: { home: { flag: "🇨🇭", name: "SUI", country: "Switzerland" },          away: { flag: "❓",  name: "TBD", country: "UEFA Playoff A Winner" }, highlight: "Switzerland take on the UEFA Playoff A qualifier in a must-watch Group B battle.",                           h2h: { total: 0, team1wins: 0, draws: 0 } },
  M39: { home: { flag: "🇧🇪", name: "BEL", country: "Belgium" },              away: { flag: "🇮🇷", name: "IRI", country: "Iran" },                 highlight: "Belgium face Iran in a critical Group G match that could determine which teams advance.",                     h2h: { total: 1, team1wins: 1, draws: 0 } },
  M59: { home: { flag: "❓",  name: "TBD", country: "UEFA Playoff C Winner" }, away: { flag: "🇺🇸", name: "USA", country: "United States" },        highlight: "USA's final group stage match brings the home crowd back to SoFi Stadium.",                                  h2h: { total: 0, team1wins: 0, draws: 0 } },
  M73: { home: { flag: "❓",  name: "TBD", country: "To Be Determined" },      away: { flag: "❓",  name: "TBD", country: "To Be Determined" },      highlight: "Round of 32 match — teams to be determined after group stage.",                                              h2h: { total: 0, team1wins: 0, draws: 0 } },
  M84: { home: { flag: "❓",  name: "TBD", country: "To Be Determined" },      away: { flag: "❓",  name: "TBD", country: "To Be Determined" },      highlight: "Round of 32 match — teams to be determined after group stage.",                                              h2h: { total: 0, team1wins: 0, draws: 0 } },
  M98: { home: { flag: "❓",  name: "TBD", country: "To Be Determined" },      away: { flag: "❓",  name: "TBD", country: "To Be Determined" },      highlight: "Quarter-Final — the road to the World Cup Final runs through SoFi Stadium.",                                 h2h: { total: 0, team1wins: 0, draws: 0 } },
};
