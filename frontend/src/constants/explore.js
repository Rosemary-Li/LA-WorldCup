export const CATEGORY_FILTERS = {
  hotels:      [{ key: "region", label: "Region" }, { key: "price", label: "Price" }, { key: "stars", label: "Stars" }],
  restaurants: [{ key: "region", label: "Region" }, { key: "flavor", label: "Cuisine" }, { key: "price", label: "Price" }],
  events:      [{ key: "type", label: "Type" }],
  shows:       [{ key: "area", label: "Area" }, { key: "type", label: "Type" }],
  attractions: [{ key: "type", label: "Type" }],
};

export const CATEGORY_DESCS = {
  hotels:      "Where to stay · World Cup edition",
  restaurants: "Curated dining around the city",
  events:      "Official FIFA activations & local fan culture",
  shows:       "Live music, comedy & entertainment across LA",
  attractions: "Beaches, landmarks & only-in-LA experiences",
};

export const CATEGORY_PAGE_TITLES = {
  hotels:      "Hotels near WC26 venues",
  restaurants: "Restaurants near WC26 venues",
  events:      "Fan events around Los Angeles",
  shows:       "Shows near your World Cup trip",
  attractions: "Attractions around Los Angeles",
};

export const CATEGORY_PAGE_SUBTITLES = {
  hotels:      "Find upscale accommodations close to the World Cup action in Los Angeles.",
  restaurants: "Pick memorable dining stops for match days and city days.",
  events:      "Choose fan zones, watch parties, and official football activations.",
  shows:       "Add music, comedy, cinema, and nightlife to the trip.",
  attractions: "Save landmarks, beaches, museums, studios, and only-in-LA experiences.",
};

export const CATEGORY_EMOJIS  = { hotels: "🏨", restaurants: "🍽️", events: "🎉", shows: "🎭", attractions: "🗺️" };
export const CATEGORY_COLORS  = { hotels: "#1a1a2e", restaurants: "#1e120a", events: "#0d1f14", shows: "#1a0d2b", attractions: "#0d1a1a" };

export const TYPE_LABELS = {
  "Fan Community / Live game party": "Watch Party",
  "Fan Community":   "Community",
  "Community Program": "Community",
  "Other Sports Events": "Sports",
  "Official Activity": "Official",
  "Club Event": "Club",
  "Special Event": "Special",
  "Fan Meetup": "Meetup",
  "Bar/Party": "Bar / Party",
  "MLS Match": "MLS",
  "Live Music": "Music",
  "Outdoor Cinema": "Cinema",
  "Urban Icon": "Landmark",
  "Coastal": "Beach & Coast",
  "Commercial": "Shopping",
  "Unknown": "Other",
};

export const AREA_COORDS = {
  "West Hollywood": [34.0901, -118.376],
  WeHo:             [34.0901, -118.376],
  Westwood:         [34.061,  -118.443],
  "Downtown LA":    [34.043,  -118.267],
  Downtown:         [34.043,  -118.267],
  "Arts District":  [34.0401, -118.2311],
  Hollywood:        [34.1017, -118.329],
  Fairfax:          [34.074,  -118.3614],
  "Santa Monica":   [34.0143, -118.4912],
  Venice:           [33.985,  -118.4695],
  Inglewood:        [33.9534, -118.3391],
  Anaheim:          [33.8121, -117.919],
  "Orange County":  [33.8121, -117.919],
  Burbank:          [34.1808, -118.309],
  Carson:           [33.8317, -118.2817],
  "Long Beach":     [33.7701, -118.1937],
  "South El Monte": [34.0519, -118.0467],
  Pomona:           [34.0551, -117.7499],
  Downey:           [33.94,   -118.1332],
  "East Los Angeles": [34.0333, -118.1667],
  "Los Feliz":      [34.1083, -118.2872],
  "Studio City":    [34.1396, -118.3871],
};

export const EXPLORE_PICKS_KEY = "laWorldCupExplorePicks";

export const EXPLORE_CARDS = [
  { category: "hotels",      label: "Hotels",      kicker: "Stay",       action: "Choose stays",      img: "LA1.jpg" },
  { category: "restaurants", label: "Restaurants", kicker: "Taste",      action: "Choose dining",     img: "LA2.jpg" },
  { category: "events",      label: "Fan Events",  kicker: "Gather",     action: "Choose events",     img: "LA3.jpg" },
  { category: "shows",       label: "Shows",       kicker: "After Dark", action: "Choose shows",      img: "LA4.jpg" },
  { category: "attractions", label: "Attractions", kicker: "Theme Park", action: "Choose activities", img: "LA7.jpg" },
];

export const EXPLORE_CATEGORIES = [
  ["hotels",      "Hotels"],
  ["restaurants", "Restaurants"],
  ["events",      "Fan Events"],
  ["shows",       "Shows"],
  ["attractions", "Attractions"],
];
