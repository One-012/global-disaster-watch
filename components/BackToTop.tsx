"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frameId: number | null = null;

    function updateProgress() {
      const scrollTop = Math.max(0, window.scrollY);
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const nextProgress =
        scrollableHeight > 0
          ? Math.min(1, Math.max(0, scrollTop / scrollableHeight))
          : 0;

      setProgress(nextProgress);
      setVisible(scrollTop > 400);
    }

    function scheduleUpdate() {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateProgress();
      });
    }

    updateProgress();

    window.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    });

    window.addEventListener("resize", scheduleUpdate);

    // Recalculate when images or other content change page height.
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);

      observer.disconnect();

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Move keyboard focus back to the page's main content.
    const main = document.getElementById("main");

    if (main) {
      const originalTabIndex = main.getAttribute("tabindex");

      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });

      if (originalTabIndex === null) {
        main.removeAttribute("tabindex");
      } else {
        main.setAttribute("tabindex", originalTabIndex);
      }
    }

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "instant" : "smooth",
    });
  }

  const radius = 23;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - progress);

  return (
    <>
      <button
        type="button"
        className={`gdw-back-top ${
          visible ? "gdw-back-top-visible" : ""
        }`}
        onClick={scrollToTop}
        aria-label="Back to top"
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        title="Back to top"
      >
        <svg
          className="gdw-progress-ring"
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="#353a40"
            strokeWidth="2"
          />

          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="var(--red, #ed493e)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            transform="rotate(-90 28 28)"
          />
        </svg>

        <svg
          className="gdw-back-top-arrow"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 19V5M5 12L12 5L19 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span
          className="gdw-back-top-label"
          aria-hidden="true"
        >
          BACK TO TOP
        </span>
      </button>

      <style jsx>{`
        .gdw-back-top {
          position: fixed;
          right: max(24px, env(safe-area-inset-right));
          bottom: max(24px, env(safe-area-inset-bottom));
          z-index: 1100;

          display: grid;
          place-items: center;

          width: 56px;
          height: 56px;
          padding: 0;

          color: #f4f3f0;
          background: #101214;
          border: 1px solid #353a40;
          border-radius: 50%;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

          cursor: pointer;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateY(12px);

          transition:
            opacity 180ms ease,
            transform 180ms ease,
            background-color 180ms ease,
            visibility 180ms ease;
        }

        .gdw-back-top-visible {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transform: translateY(0);
        }

        .gdw-back-top:hover {
          background: #252a30;
        }

        .gdw-back-top:focus-visible {
          outline: 3px solid #ffd18d;
          outline-offset: 5px;
        }

        .gdw-progress-ring {
          position: absolute;
          inset: -1px;
          pointer-events: none;
        }

        .gdw-back-top-arrow {
          pointer-events: none;
        }

        .gdw-back-top-label {
          position: absolute;
          right: calc(100% + 12px);
          top: 50%;

          padding: 7px 10px;
          color: #f4f3f0;
          background: #101214;
          border: 1px solid #353a40;
          border-radius: 4px;

          font-size: 12px;
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: 0.06em;
          white-space: nowrap;

          opacity: 0;
          pointer-events: none;
          transform: translate(4px, -50%);

          transition:
            opacity 180ms ease,
            transform 180ms ease;
        }

        .gdw-back-top:hover .gdw-back-top-label,
        .gdw-back-top:focus-visible .gdw-back-top-label {
          opacity: 1;
          transform: translate(0, -50%);
        }

        @media (max-width: 600px) {
          .gdw-back-top {
            right: max(16px, env(safe-area-inset-right));
            bottom: max(16px, env(safe-area-inset-bottom));
          }

          .gdw-back-top-label {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gdw-back-top,
          .gdw-back-top-label {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}