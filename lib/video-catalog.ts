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

// Videos now come directly from the configured YouTube channel.
// Keep this array only as an optional emergency fallback for hand-picked videos.
export const manualVideos: Video[] = [];

function inferCategories(title: string): DisasterCategory[] {
  const value = title.toLowerCase();
  const inferred: DisasterCategory[] = [];

  if (
    /\b(storm|storms|hurricane|hurricanes|typhoon|typhoons|cyclone|cyclones|blizzard|hail|windstorm)\b/.test(
      value
    )
  ) {
    inferred.push("Storms");
  }

  if (/\b(flood|floods|flooding|flooded|flash flood)\b/.test(value)) {
    inferred.push("Floods");
  }

  if (/\b(tornado|tornadoes|twister|twisters)\b/.test(value)) {
    if (!inferred.includes("Storms")) inferred.push("Storms");
    inferred.push("Tornadoes");
  }

  if (/\b(wildfire|wildfires|brush fire|forest fire)\b/.test(value)) {
    inferred.push("Wildfires");
  }

  if (/\b(volcano|volcanoes|volcanic|eruption|erupts|erupted)\b/.test(value)) {
    inferred.push("Volcanoes");
  }

  return inferred;
}

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
        categories: details?.categories ?? inferCategories(video.title),
        location: validLocation ? location : undefined,
      };
    })
    .sort((a, b) => {
      const dateA = Date.parse(a.publishedAt) || 0;
      const dateB = Date.parse(b.publishedAt) || 0;

      return dateB - dateA;
    });
}