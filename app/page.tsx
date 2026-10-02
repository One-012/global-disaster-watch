import Link from "next/link";

import CinematicHero from "@/components/CinematicHero";
import VideoGrid from "@/components/VideoGrid";
import VideoMap from "@/components/VideoMap";
import { locateVideos } from "@/lib/world-location";

import { getVideos } from "@/lib/youtube";
import { reports } from "@/lib/reports";
import {
  buildCatalog,
  manualVideos,
} from "@/lib/video-catalog";

export const revalidate = 900;

export default async function Home() {
  const [latest, featured] = await Promise.all([
    getVideos(),
    getVideos(true),
  ]);

  const mapVideos = locateVideos(
  buildCatalog([
    ...latest.videos,
    ...featured.videos,
    ...manualVideos,
  ])
);

  return (
    <main id="main">
      <div className="edition-bar">
        <strong>THE WEATHER DESK</strong>

        <span>Documentaries &amp; In-Depth Reports</span>

        <span className="edition">
          PREVIEW EDITION · SAMPLE STORIES
        </span>
      </div>

      <CinematicHero />

      <div className="topic-strip">
        <span>OUR COVERAGE</span>

        <a href="#films">STORMS</a>
        <a href="#films">FLOODS</a>
        <a href="#films">TORNADOES</a>
        <a href="#films">WILDFIRES</a>
        <a href="#films">VOLCANOES</a>
      </div>

      <section id="reports" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              01 / THE WEATHER DESK
            </p>

            <h2>Extreme Weather Reports</h2>
          </div>

          <span className="muted">
            Sample stories
          </span>
        </div>

        <div className="report-grid">
          {reports.map((report, index) => (
            <Link
              key={report.slug}
              className="report-card"
              href={`/reports/${report.slug}`}
            >
              <div className="report-top">
                <span className="eyebrow">
                  {report.category}
                </span>

                <span className="index">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <span className="region-tag">
                {report.region} / SAMPLE
              </span>

              <h3>{report.title}</h3>

              <p>{report.summary}</p>

              <span className="read-link">
                Read the Report
                <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="films" className="section films">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              02 / GLOBAL DISASTER WATCH FILMS
            </p>

            <h2>Watch Our Documentaries</h2>
          </div>

          <span className="muted">
            Featured Films
          </span>
        </div>

        <VideoGrid feed={featured} featured />

        <div className="subheading">
          <h3>Explore Our Videos</h3>

          <span>
            Browse by Disaster Type
          </span>
        </div>

        <VideoGrid feed={latest} />
      </section>

      <section id="coverage" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              03 / A GLOBAL PERSPECTIVE
            </p>

            <h2>Explore the Video Map</h2>
          </div>

          <span className="muted">
            Select a location to explore its documentaries
          </span>
        </div>

        <VideoMap videos={mapVideos} />

        <p className="map-note">
          Explore documentaries by location. Map markers
          identify places covered in our videos, not active
          emergencies or official weather alerts.
        </p>
      </section>
    </main>
  );
}