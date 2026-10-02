"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

import type { CatalogVideo } from "@/lib/video-catalog";
import VideoPlayer from "@/components/VideoPlayer";

type VideoMapProps = {
  videos: CatalogVideo[];
};

export default function VideoMap({ videos }: VideoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<CatalogVideo | null>(
    null
  );
  const [mapFailed, setMapFailed] = useState(false);

  const places = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        name: string;
        lat: number;
        lng: number;
        videos: CatalogVideo[];
      }
    >();

    videos.forEach((video) => {
      const location = video.location;
      if (!location) return;

      const key = `${location.lat},${location.lng}`;
      const existing = groups.get(key);

      if (existing) {
        existing.videos.push(video);
      } else {
        groups.set(key, {
          key,
          name: location.name,
          lat: location.lat,
          lng: location.lng,
          videos: [video],
        });
      }
    });

    return Array.from(groups.values());
  }, [videos]);

  const activePlace =
    places.find((place) => place.key === activeKey) ?? places[0];

  useEffect(() => {
    if (places.length === 0) return;

    let disposed = false;
    let instance: LeafletMap | null = null;
    let observer: ResizeObserver | null = null;

    setMapFailed(false);

    import("leaflet")
      .then((L) => {
        if (disposed || !containerRef.current) return;

        instance = L.map(containerRef.current, {
          scrollWheelZoom: false,
        });

        mapRef.current = instance;

        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 18,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        )
          .addTo(instance)
          .on("tileerror", () => {
            if (!disposed) setMapFailed(true);
          });

        places.forEach((place) => {
          const marker = L.circleMarker(
            [place.lat, place.lng],
            {
              radius: 11,
              color: "#ffffff",
              weight: 2,
              fillColor: "#ed493e",
              fillOpacity: 0.9,
            }
          ).addTo(instance!);

          // Use textContent instead of interpreting labels as HTML.
          const label = document.createElement("span");
          label.textContent =
            `${place.name} · ${place.videos.length} ` +
            (place.videos.length === 1 ? "video" : "videos");

          marker.bindTooltip(label);

          marker.on("click", () => {
            setActiveKey(place.key);
          });
        });

        if (places.length === 1) {
          instance.setView([places[0].lat, places[0].lng], 5);
        } else {
          instance.fitBounds(
            L.latLngBounds(
              places.map(
                (place) =>
                  [place.lat, place.lng] as [number, number]
              )
            ),
            {
              padding: [45, 45],
              maxZoom: 6,
            }
          );
        }

        observer = new ResizeObserver(() => {
          instance?.invalidateSize();
        });

        observer.observe(containerRef.current);
      })
      .catch(() => {
        if (!disposed) setMapFailed(true);
      });

    return () => {
      disposed = true;
      observer?.disconnect();
      instance?.remove();
      mapRef.current = null;
    };
  }, [places]);

  function selectPlace(key: string) {
    const place = places.find((item) => item.key === key);
    if (!place) return;

    setActiveKey(key);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      mapRef.current?.setView([place.lat, place.lng], 5, {
        animate: false,
      });
    } else {
      mapRef.current?.flyTo([place.lat, place.lng], 5, {
        duration: 1,
      });
    }
  }

  if (places.length === 0) {
    return (
      <div className="empty">
        <div>
          <h3>Video locations are coming soon.</h3>
          <p>
            Explore the documentary library while we prepare the
            coverage map.
          </p>
          <a
            href="#films"
            className="button"
            style={{ marginTop: 16 }}
          >
            Browse Documentaries
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="coverage-grid">
        <div className="map-wrap">
          <div
            ref={containerRef}
            className="map"
            role="region"
            aria-label="Map of documentary locations"
          />

          {mapFailed && (
            <div className="map-message" role="status">
              The map could not fully load. You can still select
              a location from the list.
            </div>
          )}

          <span className="map-label">
            DOCUMENTARY LOCATIONS · NOT LIVE ALERTS
          </span>
        </div>

        <div className="gdw-map-sidebar">
          <div
            className="gdw-map-places"
            role="group"
            aria-label="Choose a documentary location"
          >
            {places.map((place, index) => (
              <button
                key={place.key}
                type="button"
                className={
                  activePlace?.key === place.key
                    ? "region active"
                    : "region"
                }
                aria-pressed={activePlace?.key === place.key}
                onClick={() => selectPlace(place.key)}
              >
                <span className="region-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span>
                  <strong>{place.name}</strong>
                  <small>
                    {place.videos.length}{" "}
                    {place.videos.length === 1
                      ? "documentary"
                      : "documentaries"}
                  </small>
                </span>

                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>

          {activePlace && (
            <div className="selected-report">
              <p className="eyebrow">
                WATCH FROM THIS LOCATION
              </p>

              <h3>{activePlace.name}</h3>

              <div className="gdw-map-video-list">
                {activePlace.videos.map((video) => (
                  <button
                    type="button"
                    key={video.id}
                    className="gdw-map-video"
                    onClick={() => setSelected(video)}
                    aria-label={`Watch ${video.title}`}
                  >
                    <img
                      src={video.thumbnail}
                      alt=""
                      loading="lazy"
                    />

                    <span>
                      <strong>{video.title}</strong>
                      <small>Play Documentary ▷</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <VideoPlayer
          video={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}