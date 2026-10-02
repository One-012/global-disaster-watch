import type { Video } from "@/lib/youtube";

export const categories = [
  "All",
  "Storms",
  "Floods",
  "Tornadoes",
  "Wildfires",
  "Volcanoes",
] as const;

export type Category = (typeof categories)[number];

export type DisasterCategory = Exclude<Category, "All">;

export type VideoLocation = {
  name: string;
  lat: number;
  lng: number;
};

export type VideoDetails = {
  categories: DisasterCategory[];
  location?: VideoLocation;
};

export type CatalogVideo = Video & {
  categories: DisasterCategory[];
  location?: VideoLocation;
};

// Representative coverage locations, not exact incident coordinates.
export const videoDetails: Record<string, VideoDetails> = {
  w_cA9b1ds58: {
    categories: ["Storms", "Tornadoes"],
    location: {
      name: "Northern Utah, United States",
      lat: 41.03,
      lng: -111.9,
    },
  },

  aBSvKpeG4Bo: {
    categories: ["Storms", "Floods"],
    location: {
      name: "Indiana–Ohio Border Region, United States",
      lat: 40.75,
      lng: -84.8,
    },
  },

  "C6mCGpgQ-WA": {
    categories: ["Storms", "Floods"],
    location: {
      name: "Utah–Idaho Region, United States",
      lat: 42.0,
      lng: -112.0,
    },
  },

  "Zzre-WUPZpM": {
    categories: ["Volcanoes"],
    location: {
      name: "Sakurajima, Japan",
      lat: 31.585,
      lng: 130.657,
    },
  },
};

// Public videos retrieved from the channel on September 25, 2026.
// These entries work without a YouTube Data API key.
export const manualVideos: Video[] = [
  {
    id: "w_cA9b1ds58",
    title:
      "Utah HIT by TORNADO — Rare Mountain Twister Strikes as Large Hail Falls (Latest Updates)",
    thumbnail:
      "https://i.ytimg.com/vi/w_cA9b1ds58/hqdefault.jpg",
    publishedAt: "2026-09-23T23:00:32+00:00",
  },
  {
    id: "aBSvKpeG4Bo",
    title:
      "MAJOR FLOOD EMERGENCY – Indiana & Ohio HIT as Floodwaters Block Roads (Latest Updates)",
    thumbnail:
      "https://i.ytimg.com/vi/aBSvKpeG4Bo/hqdefault.jpg",
    publishedAt: "2026-09-23T03:24:12+00:00",
  },
  {
    id: "C6mCGpgQ-WA",
    title:
      "UTAH & IDAHO HIT by Golf Ball Size Hail - Cars Damaged, Roads Flooded (Latest Updates)",
    thumbnail:
      "https://i.ytimg.com/vi/C6mCGpgQ-WA/hqdefault.jpg",
    publishedAt: "2026-09-23T00:59:39+00:00",
  },
  {
    id: "Zzre-WUPZpM",
    title:
      "SAKURAJIMA ERUPTS IN JAPAN – Massive Ash Cloud Towers Into the Sky (Latest Updates)",
    thumbnail:
      "https://i.ytimg.com/vi/Zzre-WUPZpM/hqdefault.jpg",
    publishedAt: "2026-09-22T23:04:02+00:00",
  },
];

export function buildCatalog(videos: Video[]): CatalogVideo[] {
  const unique = new Map<string, Video>();

  for (const video of videos) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(video.id)) {
      continue;
    }

    // Keep the first entry so fresh API data takes priority
    // over the manually saved copy.
    if (!unique.has(video.id)) {
      unique.set(video.id, video);
    }
  }

  return Array.from(unique.values())
    .map((video) => {
      const details = videoDetails[video.id];
      const location = details?.location;

      const validLocation =
        location &&
        Number.isFinite(location.lat) &&
        Number.isFinite(location.lng) &&
        Math.abs(location.lat) <= 90 &&
        Math.abs(location.lng) <= 180;

      return {
        ...video,
        thumbnail:
          video.thumbnail ||
          `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
        categories: details?.categories ?? [],
        location: validLocation ? location : undefined,
      };
    })
    .sort((a, b) => {
      const dateA = Date.parse(a.publishedAt) || 0;
      const dateB = Date.parse(b.publishedAt) || 0;

      return dateB - dateA;
    });
}