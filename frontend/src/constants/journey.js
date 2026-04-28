export const TRAVELER_TYPES = [
  { key: "solo",    icon: "✦",  label: "Solo",    tagline: "Your pace, your city",           story: "Just you and LA — we'll build the perfect solo adventure." },
  { key: "family",  icon: "◈",  label: "Family",  tagline: "Making memories together",       story: "LA's best family moments, all in one trip." },
  { key: "couple",  icon: "◇",  label: "Couple",  tagline: "Romance meets the beautiful game", story: "Romance, football, and the City of Angels." },
  { key: "friends", icon: "◉",  label: "Friends", tagline: "Better together",                story: "Your crew + World Cup + LA = unforgettable." },
  { key: "group",   icon: "⬡",  label: "Group",   tagline: "The more, the louder",           story: "Big squad energy — let's plan a trip to remember." },
];

export const TRAVELER_THEMES = {
  solo:    { accent: "#1D428A", tint: "rgba(29,66,138,0.07)",   hover: "#163472", image: "/images/Solo_1.jpg" },
  family:  { accent: "#C25B00", tint: "rgba(194,91,0,0.07)",    hover: "#9f4a00", image: "/images/Family_1.jpg" },
  couple:  { accent: "#7B1C4E", tint: "rgba(123,28,78,0.07)",   hover: "#621540", image: "/images/Couples_1.jpg" },
  friends: { accent: "#2E7D32", tint: "rgba(46,125,50,0.07)",   hover: "#1b5e20", image: "/images/Friends_1.jpg" },
  group:   { accent: "#B71C1C", tint: "rgba(183,28,28,0.07)",   hover: "#7f0000", image: "/images/LA_sunset.jpg" },
};

// ─────────────────────────────────────────
// Form field definitions
// Principle: three orthogonal dimensions
//   01  WHO  — group composition (traveler type cards)
//   02  HOW  — spending level + trip length + vibe theme
//   03  WHAT — explore LA picks
// "luxury" removed from budget labels to eliminate overlap with old traveler type.
// "football" vibe added — essential for a World Cup travel app.
// ─────────────────────────────────────────

export const JOURNEY_SELECTS = [
  {
    key: "type",
    icon: "01",
    label: "Who's Coming",
    options: [["solo", "Solo"], ["family", "Family"], ["couple", "Couple"], ["friends", "Friends"], ["group", "Group"]],
  },
  {
    key: "budget",
    icon: "02",
    label: "Daily Budget",
    options: [
      ["budget",  "Essentials ($100–200)"],
      ["mid",     "Comfort ($200–400)"],
      ["luxury",  "Premium ($400+)"],
    ],
  },
  {
    key: "days",
    icon: "03",
    label: "Days in LA",
    options: [["3", "3 Days"], ["5", "5 Days"], ["7", "7 Days"]],
  },
  {
    key: "match_date",
    icon: "04",
    label: "Match Date",
    wide: true,
    options: [
      ["jun12", "Jun 12 · USA vs Paraguay (M4)"],
      ["jun15", "Jun 15 · Iran vs New Zealand (M15)"],
      ["jun18", "Jun 18 · Switzerland vs Bosnia and Herzegovina (M26)"],
      ["jun21", "Jun 21 · Belgium vs Iran (M39)"],
      ["jun25", "Jun 25 · Türkiye vs USA (M59)"],
      ["jun28", "Jun 28 · Round of 32 (M73)"],
      ["jul2",  "Jul 2 · Round of 32 (M84)"],
      ["jul10", "Jul 10 · Quarter-Finals (M98)"],
    ],
  },
  {
    key: "vibe",
    icon: "05",
    label: "Vibe",
    options: [
      ["football",  "Football & Fans"],
      ["culture",   "Culture & History"],
      ["beach",     "Outdoors & Beach"],
      ["nightlife", "Nightlife & Shows"],
      ["film",      "Hollywood & Entertainment"],
    ],
  },
];

export const ACTIVITY_MARKS = {
  event:        "EVENT",
  restaurant:   "DINE",
  match:        "MATCH",
  explore_pick: "PICK",
};
