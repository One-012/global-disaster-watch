export type Report = {
  slug: string;
  category: string;
  region: string;
  title: string;
  summary: string;
  coordinates: [number, number];
  source: string;
  sourceName: string;
  paragraphs: string[];
};

// These articles are editorial samples, not current event reports.
// Replace them with verified reporting before publishing.
export const reports: Report[] = [
  {
    slug: "inside-the-storm",
    category: "Severe Storms",
    region: "North America",
    title: "Inside the Storm: A Closer Look at Severe Weather",
    summary:
      "A sample feature exploring the science of severe storms and their impact on communities.",
    coordinates: [35.5, -97.5],
    source: "https://www.weather.gov/",
    sourceName: "National Weather Service",
    paragraphs: [
      "This sample feature previews the reporting format for GLOBAL DISASTER WATCH. It does not describe an active storm or an ongoing emergency.",

      "A complete report would establish when and where the storm occurred, what officials confirmed, and how nearby communities were affected. Observed conditions, forecasts, and preliminary accounts would be clearly distinguished.",

      "The finished story would include a verified timeline, links to original sources, footage credits, and a companion documentary when available.",
    ],
  },
  {
    slug: "water-at-the-door",
    category: "Flooding",
    region: "Europe",
    title: "When Floodwaters Reach Home",
    summary:
      "A sample report on flooding, its effects on daily life, and the work of recovery.",
    coordinates: [45.4, 12.3],
    source: "https://wmo.int/",
    sourceName: "World Meteorological Organization",
    paragraphs: [
      "This sample article demonstrates how a flood report would appear on GLOBAL DISASTER WATCH. It is not a current flood advisory.",

      "A published report would identify the affected area, the date of the event, and the information confirmed by local authorities. Archival footage and illustrative images would be labeled separately from footage of the reported event.",

      "Follow-up coverage would examine recovery efforts, unresolved questions, and the challenges facing residents after the water recedes.",
    ],
  },
  {
    slug: "pacific-storm-track",
    category: "Tropical Cyclones",
    region: "Asia-Pacific",
    title: "Tracking a Storm Across the Pacific",
    summary:
      "A sample documentary report following a tropical cyclone and the communities along its path.",
    coordinates: [30, 135],
    source: "https://www.jma.go.jp/jma/indexe.html",
    sourceName: "Japan Meteorological Agency",
    paragraphs: [
      "This sample page previews a tropical cyclone report. It does not display an active storm track, forecast, or warning.",

      "A complete story would identify the storm, the reporting agency, and the time of each update. Maps would distinguish the storm’s observed location from its forecast path.",

      "The report would pair verified footage with dated source material. Significant changes would be reflected in updates, with corrections clearly identified when necessary.",
    ],
  },
];