"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import Link from "next/link";
import { reports } from "@/lib/reports";

export default function Coverage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let instance: LeafletMap | null = null;

    import("leaflet")
      .then((L) => {
        if (disposed || !containerRef.current) {
          return;
        }

        instance = L.map(containerRef.current, {
          scrollWheelZoom: false,
        }).setView([25, 20], 2);

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
            if (!disposed) {
              setMapFailed(true);
            }
          });

        reports.forEach((report, index) => {
          const marker = L.circleMarker(report.coordinates, {
            radius: 10,
            color: "#ef493f",
            weight: 2,
            fillColor: "#ef493f",
            fillOpacity: 0.55,
          }).addTo(instance!);

          marker.bindTooltip(report.region);

          marker.on("click", () => {
            setActiveIndex(index);
          });
        });
      })
      .catch(() => {
        if (!disposed) {
          setMapFailed(true);
        }
      });

    return () => {
      disposed = true;
      instance?.remove();
      mapRef.current = null;
    };
  }, []);

  function selectRegion(index: number) {
    setActiveIndex(index);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      mapRef.current?.setView(reports[index].coordinates, 5, {
        animate: false,
      });
    } else {
      mapRef.current?.flyTo(reports[index].coordinates, 5, {
        duration: 1,
      });
    }
  }

  const activeReport = reports[activeIndex];

  return (
    <div className="coverage-grid">
      <div className="map-wrap">
        <div
          ref={containerRef}
          className="map"
          role="region"
          aria-label="Map showing sample coverage locations"
        />

        {mapFailed && (
          <div className="map-message" role="status">
            The map could not fully load. You can still select a
            region from the list to read its report.
          </div>
        )}

        <span className="map-label">
          COVERAGE MAP · SAMPLE LOCATIONS
        </span>
      </div>

      <div className="region-list">
        {reports.map((report, index) => (
          <button
            key={report.slug}
            type="button"
            onClick={() => selectRegion(index)}
            aria-pressed={activeIndex === index}
            className={
              activeIndex === index
                ? "region active"
                : "region"
            }
          >
            <span className="region-number">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span>
              <strong>{report.region}</strong>
              <small>{report.category}</small>
            </span>

            <span aria-hidden="true">↗</span>
          </button>
        ))}

        {activeReport && (
          <div
            className="selected-report"
            aria-live="polite"
          >
            <p className="eyebrow">SAMPLE REPORT</p>

            <h3>{activeReport.title}</h3>

            <Link href={`/reports/${activeReport.slug}`}>
              Read the Report →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}