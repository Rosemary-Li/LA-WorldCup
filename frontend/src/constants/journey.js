export const JOURNEY_SELECTS = [
  {
    key: "type",
    icon: "01",
    label: "Traveler Type",
    options: [["football", "Football Fan"], ["family", "Family"], ["backpacker", "Backpacker"], ["luxury", "Luxury Traveler"]],
  },
  {
    key: "budget",
    icon: "02",
    label: "Budget per Day",
    options: [["budget", "$100-200"], ["mid", "$200-400"], ["luxury", "$400+"]],
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
      ["jun18", "Jun 18 · Switzerland vs UEFA Playoff A (M26)"],
      ["jun21", "Jun 21 · Belgium vs Iran (M39)"],
      ["jun25", "Jun 25 · UEFA Playoff C vs USA (M59)"],
      ["jun28", "Jun 28 · Round of 32 (M73)"],
      ["jul2",  "Jul 2 · Round of 32 (M84)"],
      ["jul10", "Jul 10 · Quarter-Finals (M98)"],
    ],
  },
  {
    key: "vibe",
    icon: "05",
    label: "Vibe Preference",
    options: [["culture", "Culture & History"], ["beach", "Beach & Nature"], ["nightlife", "Nightlife & Shows"], ["film", "Hollywood & Film"]],
  },
];

export const ACTIVITY_MARKS = {
  event:        "EVENT",
  restaurant:   "DINE",
  match:        "MATCH",
  explore_pick: "PICK",
};
