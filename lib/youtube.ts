import "server-only";
export type Video = { id: string; title: string; thumbnail: string; publishedAt: string };
export type Feed = { videos: Video[]; status: "ready" | "unconfigured" | "error"; checkedAt?: string };
type PlaylistItem = { snippet?: {title?: string; publishedAt?: string; thumbnails?: {high?: {url?: string}; medium?: {url?: string}}}; contentDetails?: {videoId?: string; videoPublishedAt?: string} };
async function api(path: string, params: Record<string,string>) {
 const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
 url.search = new URLSearchParams({...params, key: process.env.YOUTUBE_API_KEY!}).toString();
 const response = await fetch(url, {next: {revalidate: 900}, signal: AbortSignal.timeout(8000)});
 if (!response.ok) throw new Error("YouTube is unavailable");
 return response.json();
}
export async function getVideos(featured = false): Promise<Feed> {
 if (!process.env.YOUTUBE_API_KEY || !process.env.YOUTUBE_CHANNEL_ID) return {videos: [], status:"unconfigured"};
 try {
  let playlistId = featured ? process.env.YOUTUBE_FEATURED_PLAYLIST_ID : undefined;
  if (!playlistId) {
   if (featured) return {videos:[],status:"unconfigured"};
   const channel = await api("channels",{part:"contentDetails",id:process.env.YOUTUBE_CHANNEL_ID});
   playlistId = channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  }
  if (!playlistId) throw new Error("Missing uploads playlist");
  const data = await api("playlistItems",{part:"snippet,contentDetails",playlistId,maxResults:featured?"3":"6"});
  const videos: Video[] = (data.items || []).flatMap((item: PlaylistItem) => {
   const id=item.contentDetails?.videoId, title=item.snippet?.title;
   if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id) || !title || title === "Private video" || title === "Deleted video") return [];
   return [{id,title,thumbnail:item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,publishedAt:item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || ""}];
  });
  return {videos,status:"ready",checkedAt:new Date().toISOString()};
 } catch { return {videos:[],status:"error"}; }
}
