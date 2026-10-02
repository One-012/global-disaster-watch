"use client";

import { useState } from "react";

import type { Feed } from "@/lib/youtube";
import {
  buildCatalog,
  categories,
  manualVideos,
  type CatalogVideo,
  type Category,
} from "@/lib/video-catalog";

import VideoPlayer from "@/components/VideoPlayer";

type VideoGridProps = {
  feed: Feed;
  featured?: boolean;
};

export default function VideoGrid({
  feed,
  featured = false,
}: VideoGridProps) {
  const [category, setCategory] = useState<Category>("All");
  const [selected, setSelected] = useState<CatalogVideo | null>(
    null
  );

  // Manually added videos appear in the main video library.
  const videos = buildCatalog(
  featured
    ? feed.videos.length > 0
      ? feed.videos
      : manualVideos.slice(0, 3)
    : [...feed.videos, ...manualVideos]
);

  const filteredVideos =
    category === "All"
      ? videos
      : videos.filter((video) =>
          video.categories.includes(category)
        );

  if (videos.length === 0) {
    return (
      <div className="empty">
        <span className="empty-icon" aria-hidden="true">
          ▷
        </span>

        <div>
          <h3>
            {feed.status === "error"
              ? "Videos are temporarily unavailable"
              : featured
                ? "Featured documentaries are coming soon"
                : "New documentaries are coming soon"}
          </h3>

          <p>
            Check back soon for more from Global Disaster Watch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!featured && (
        <div
          className="gdw-filters"
          role="group"
          aria-label="Filter videos by disaster type"
        >
          {categories.map((item) => {
            const count =
              item === "All"
                ? videos.length
                : videos.filter((video) =>
                    video.categories.includes(item)
                  ).length;

            return (
              <button
                key={item}
                type="button"
                className={
                  category === item
                    ? "gdw-filter gdw-filter-active"
                    : "gdw-filter"
                }
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
              >
                {item}
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {!featured && (
        <p
          className="gdw-results"
          role="status"
          aria-live="polite"
        >
          {filteredVideos.length}{" "}
          {filteredVideos.length === 1 ? "video" : "videos"}
          {category !== "All" ? ` · ${category}` : ""}
        </p>
      )}

      {filteredVideos.length > 0 ? (
        <div className="video-grid">
          {filteredVideos.map((video) => (
            <button
              key={video.id}
              type="button"
              className="video-card gdw-video-button"
              onClick={() => setSelected(video)}
              aria-label={`Watch ${video.title}`}
            >
              <div className="thumbnail">
                <img
                  src={video.thumbnail}
                  alt=""
                  loading="lazy"
                />

                <span className="play" aria-hidden="true">
                  ▶
                </span>
              </div>

              <div className="eyebrow">
                {video.categories.length > 0
                  ? video.categories.join(" · ")
                  : "DOCUMENTARY"}
              </div>

              <h3>{video.title}</h3>

              {video.location && (
                <p className="gdw-video-location">
                  {video.location.name}
                </p>
              )}

              {video.publishedAt && (
                <time dateTime={video.publishedAt}>
                  {new Date(
                    video.publishedAt
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="empty">
          <div>
            <h3>No videos in this category yet.</h3>
            <p>Select another category or browse all videos.</p>

            <button
              type="button"
              className="button"
              onClick={() => setCategory("All")}
              style={{ marginTop: 16 }}
            >
              View All Videos
            </button>
          </div>
        </div>
      )}

      {selected && (
        <VideoPlayer
          video={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}