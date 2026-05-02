// Navi Mumbai CIDCO nodes. User-verified list to be hardened.
// Coordinates are approximate node centroids — used for filter chips and
// map flyTo, not for pin positions.

export type Node = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
};

export const NODES: Node[] = [
  { slug: "airoli", name: "Airoli", lat: 19.1577, lng: 72.9986 },
  { slug: "ghansoli", name: "Ghansoli", lat: 19.1244, lng: 73.0085 },
  { slug: "kopar-khairane", name: "Kopar Khairane", lat: 19.1037, lng: 73.0064 },
  { slug: "turbhe", name: "Turbhe", lat: 19.0903, lng: 73.0198 },
  { slug: "vashi", name: "Vashi", lat: 19.077, lng: 72.9989 },
  { slug: "sanpada", name: "Sanpada", lat: 19.0633, lng: 73.0008 },
  { slug: "nerul", name: "Nerul", lat: 19.0337, lng: 73.0197 },
  { slug: "seawoods", name: "Seawoods", lat: 19.018, lng: 73.0204 },
  { slug: "belapur", name: "CBD Belapur", lat: 19.0235, lng: 73.0395 },
  { slug: "kharghar", name: "Kharghar", lat: 19.0478, lng: 73.0699 },
  { slug: "kamothe", name: "Kamothe", lat: 19.022, lng: 73.0987 },
  { slug: "kalamboli", name: "Kalamboli", lat: 19.0356, lng: 73.1018 },
  { slug: "new-panvel", name: "New Panvel", lat: 19.0048, lng: 73.1198 },
  { slug: "panvel", name: "Panvel", lat: 18.9894, lng: 73.1175 },
  { slug: "taloja", name: "Taloja", lat: 19.0837, lng: 73.0978 },
  { slug: "ulwe", name: "Ulwe", lat: 18.9818, lng: 73.0224 },
  { slug: "dronagiri", name: "Dronagiri", lat: 18.9389, lng: 72.9572 },
];

export const NAVI_MUMBAI_CENTER = { lat: 19.05, lng: 73.05, zoom: 11 };

export const BHK_OPTIONS = ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK+"] as const;
export type BHK = (typeof BHK_OPTIONS)[number];

export const FURNISHING_OPTIONS = [
  "unfurnished",
  "semi-furnished",
  "furnished",
] as const;
export type Furnishing = (typeof FURNISHING_OPTIONS)[number];
