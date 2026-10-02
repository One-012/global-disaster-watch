"use client";

import { useEffect, useRef, useState } from "react";

export default function CinematicHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const preference = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    function applyMotionPreference() {
      if (!video) return;

      if (preference.matches) {
        video.pause();
      } else {
        video.play().catch(() => {
          // The browser may require a click before playback.
        });
      }
    }

    applyMotionPreference();

    preference.addEventListener(
      "change",
      applyMotionPreference
    );

    return () => {
      preference.removeEventListener(
        "change",
        applyMotionPreference
      );

      video.pause();
    };
  }, []);

  async function toggleVideo() {
    const video = videoRef.current;
    if (!video || failed) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setPlaying(false);
      }
    } else {
      video.pause();
    }
  }

  return (
    <section
      className="hero gdw-storm-hero"
      aria-labelledby="hero-title"
    >
      <img
        className="hero-image"
        src="/images/storm.jpg"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
      />

      {!failed && (
        <video
          ref={videoRef}
          className="gdw-storm-video"
          poster="/images/storm.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
        >
          <source
            src="/videos/storm.mp4"
            type="video/mp4"
            onError={() => {
              setFailed(true);
              setPlaying(false);
            }}
          />
        </video>
      )}

      <div
        className="hero-shade"
        aria-hidden="true"
      />

      {!failed && (
        <button
          type="button"
          className="gdw-storm-toggle"
          onClick={toggleVideo}
          aria-label={
            playing
              ? "Pause background video"
              : "Play background video"
          }
        >
          {playing ? "Ⅱ Pause Video" : "▶ Play Video"}
        </button>
      )}

      <div className="hero-content">
        <p className="eyebrow">
          EXTREME WEATHER. REAL-WORLD IMPACT.
        </p>

        <h1 id="hero-title">
          WHEN NATURE
          <br />
          CHANGES
          <br />
          <em>EVERYTHING.</em>
        </h1>

        <p className="hero-description">
          Explore the science behind extreme weather and the
          stories of people facing its impact.
        </p>

        <div className="hero-actions">
          <a className="button red" href="#films">
            Watch Documentaries
            <span aria-hidden="true">▷</span>
          </a>

          <a className="text-link" href="#coverage">
            Explore the Video Map ↗
          </a>
        </div>
      </div>

      <div className="hero-caption">
        <span>GLOBAL DISASTER WATCH</span>
        <span>
          Illustrative background imagery · Not a live feed
        </span>
      </div>
    </section>
  );
}