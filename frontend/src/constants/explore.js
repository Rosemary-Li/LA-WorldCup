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
  // Beaches & outdoor — added to avoid coord collision in coordsFor() fallback.
  Malibu:           [34.0259, -118.7798],
  "Zuma Beach":     [34.0181, -118.8252],
  "Point Dume":     [34.0061, -118.8060],
  "El Matador":     [34.0383, -118.8750],
  Topanga:          [34.0936, -118.6042],
  "Laguna Beach":   [33.5427, -117.7854],
  "Huntington Beach": [33.6603, -117.9992],
  // Landmarks & big attractions
  Griffith:         [34.1365, -118.2944],
  "Griffith Park":  [34.1365, -118.2944],
  "Hollywood Sign": [34.1341, -118.3215],
  "Walk of Fame":   [34.1014, -118.3413],
  "Beverly Hills":  [34.0736, -118.4004],
  "Rodeo Drive":    [34.0697, -118.4008],
  "Universal City": [34.1381, -118.3534],
  "Runyon Canyon":  [34.1108, -118.3514],
  "Echo Park":      [34.0782, -118.2606],
  Melrose:          [34.0837, -118.3614],
  "Abbot Kinney":   [33.9920, -118.4658],
  "The Grove":      [34.0722, -118.3576],
  // Stadiums & venues that show up as venue_name in the events table
  "Memorial Coliseum": [34.0141, -118.2879],
  Coliseum:         [34.0141, -118.2879],
  "BMO Stadium":    [34.0124, -118.2858],
  "Hollywood Bowl": [34.1122, -118.3392],
  "Hollywood Forever": [34.0901, -118.3198],
  "The Comedy Store": [34.0966, -118.3837],
  "Laugh Factory":  [34.0989, -118.3530],
  "Hollywood Improv": [34.0837, -118.3614],
  "The Echo":       [34.0782, -118.2606],
  "The Roxy":       [34.0905, -118.3854],
  Troubadour:       [34.0817, -118.3893],
  Cinespia:         [34.0901, -118.3198],
};

export const EXPLORE_PICKS_KEY = "laWorldCupExplorePicks";

export const EXPLORE_CATEGORIES = [
  ["hotels",      "Hotels"],
  ["restaurants", "Restaurants"],
  ["events",      "Fan Events"],
  ["shows",       "Shows"],
  ["attractions", "Attractions"],
];
