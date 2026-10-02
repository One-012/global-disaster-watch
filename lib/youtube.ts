import "server-only";

import { site } from "@/lib/site";

export type Video = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
};

export type Feed = {
  videos: Video[];
  status: "ready" | "unconfigured" | "error";
  checkedAt?: string;
};

type PlaylistItem = {
  snippet?: {
    title?: string;
    publishedAt?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
    };
  };
  contentDetails?: {
    videoId?: string;
    videoPublishedAt?: string;
  };
};

const DEFAULT_CHANNEL_ID = site.youtubeChannelId;
const CACHE_SECONDS = 900;

function channelId() {
  return process.env.YOUTUBE_CHANNEL_ID?.trim() || DEFAULT_CHANNEL_ID;
}

function decodeXml(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
  };

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10))
    )
    .replace(/&(amp|quot|apos|lt|gt);/g, (_, name: string) =>
      namedEntities[name] ?? _
    )
    .trim();
}

function readXmlTag(block: string, tag: string) {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(
    new RegExp(
      `<${escapedTag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${escapedTag}>`,
      "i"
    )
  );

  return match?.[1] ? decodeXml(match[1]) : "";
}

async function api(path: string, params: Record<string, string>) {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing YouTube API key");
  }

  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  url.search = new URLSearchParams({ ...params, key: apiKey }).toString();

  const response = await fetch(url, {
    next: { revalidate: CACHE_SECONDS },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`YouTube API returned ${response.status}`);
  }

  return response.json();
}

async function getVideosFromApi(
  currentChannelId: string,
  featured: boolean
): Promise<Video[]> {
  let playlistId = featured
    ? process.env.YOUTUBE_FEATURED_PLAYLIST_ID?.trim()
    : undefined;

  // If there is no custom featured playlist, use the channel's uploads.
  if (!playlistId) {
    const channel = await api("channels", {
      part: "contentDetails",
      id: currentChannelId,
    });

    playlistId =
      channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  }

  if (!playlistId) {
    throw new Error("Missing uploads playlist");
  }

  const data = await api("playlistItems", {
    part: "snippet,contentDetails",
    playlistId,
    maxResults: featured ? "3" : "12",
  });

  return (data.items || []).flatMap((item: PlaylistItem) => {
    const id = item.contentDetails?.videoId;
    const title = item.snippet?.title;

    if (
      !id ||
      !/^[a-zA-Z0-9_-]{11}$/.test(id) ||
      !title ||
      title === "Private video" ||
      title === "Deleted video"
    ) {
      return [];
    }

    return [
      {
        id,
        title,
        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        publishedAt:
          item.contentDetails?.videoPublishedAt ||
          item.snippet?.publishedAt ||
          "",
      },
    ];
  });
}

async function getVideosFromRss(
  currentChannelId: string,
  limit: number
): Promise<Video[]> {
  const url =
    "https://www.youtube.com/feeds/videos.xml?channel_id=" +
    encodeURIComponent(currentChannelId);

  const response = await fetch(url, {
    next: { revalidate: CACHE_SECONDS },
    signal: AbortSignal.timeout(8000),
    headers: {
      Accept: "application/atom+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) {
    throw new Error(`YouTube RSS returned ${response.status}`);
  }

  const xml = await response.text();
  const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi));

  return entries
    .flatMap((entry) => {
      const block = entry[1];
      const id = readXmlTag(block, "yt:videoId");
      const title = readXmlTag(block, "title");
      const publishedAt = readXmlTag(block, "published");

      if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id) || !title) {
        return [];
      }

      return [
        {
          id,
          title,
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          publishedAt,
        },
      ];
    })
    .slice(0, limit);
}

export async function getVideos(featured = false): Promise<Feed> {
  const currentChannelId = channelId();

  if (!currentChannelId) {
    return { videos: [], status: "unconfigured" };
  }

  const limit = featured ? 3 : 12;

  try {
    // Prefer the Data API when a key is configured because it supports
    // an optional curated featured playlist. If it fails, fall back to
    // the public RSS feed so the website can still show channel uploads.
    if (process.env.YOUTUBE_API_KEY?.trim()) {
      try {
        const videos = await getVideosFromApi(currentChannelId, featured);

        return {
          videos: videos.slice(0, limit),
          status: "ready",
          checkedAt: new Date().toISOString(),
        };
      } catch {
        // Continue to the keyless RSS fallback below.
      }
    }

    const videos = await getVideosFromRss(currentChannelId, limit);

    return {
      videos,
      status: "ready",
      checkedAt: new Date().toISOString(),
    };
  } catch {
    return { videos: [], status: "error" };
  }
}
