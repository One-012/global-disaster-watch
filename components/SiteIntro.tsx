"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const INTRO_KEY = "gdw-intro-seen-v1";

export default function SiteIntro() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);

  const finishIntro = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // The intro still works if browser storage is unavailable.
    }

    setClosing(true);

    closeTimerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, 400);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Avoid an animated entrance for visitors requesting less motion.
    if (reduceMotion) return;

    try {
      if (sessionStorage.getItem(INTRO_KEY) === "1") {
        return;
      }
    } catch {
      // Continue without session storage.
    }

    setVisible(true);

    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(finishIntro, 2200);

    return () => {
      window.clearTimeout(timer);
      dialog?.close();

      document.body.style.overflow = previousOverflow;

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [visible, finishIntro]);

  if (!visible) return null;

  return (
    <>
      <dialog
        ref={dialogRef}
        className={`gdw-intro ${
          closing ? "gdw-intro-closing" : ""
        }`}
        aria-labelledby="gdw-intro-title"
        onCancel={(event) => {
          event.preventDefault();
          finishIntro();
        }}
      >
        <button
          type="button"
          className="gdw-intro-skip"
          onClick={finishIntro}
          autoFocus
        >
          Skip Intro →
        </button>

        <div className="gdw-intro-content">
          <img
            className="gdw-intro-logo"
            src="/images/logoavt.jpg"
            alt=""
            width={112}
            height={112}
          />

          <p className="gdw-intro-kicker">
            WEATHER · SCIENCE · HUMAN IMPACT
          </p>

          <h2
            id="gdw-intro-title"
            className="gdw-intro-title"
          >
            GLOBAL
            <span>DISASTER WATCH</span>
          </h2>

          <p className="gdw-intro-tagline">
            Extreme weather. Real-world impact.
          </p>

          <div
            className="gdw-intro-track"
            aria-hidden="true"
          >
            <span />
          </div>
        </div>

        <p className="gdw-intro-credit">
          DEVELOPED BY <strong>B5 NETWORK</strong>
        </p>
      </dialog>

      <style jsx>{`
        .gdw-intro {
          position: fixed;
          inset: 0;

          width: 100%;
          max-width: none;
          height: 100%;
          height: 100dvh;
          max-height: none;

          margin: 0;
          padding: 30px;

          color: #f4f3f0;
          background: #080c10;
          border: 0;
          overflow-y: auto;

          opacity: 1;
          transition: opacity 400ms ease;
        }

        .gdw-intro[open] {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .gdw-intro::backdrop {
          background: transparent;
        }

        .gdw-intro-closing {
          opacity: 0;
          pointer-events: none;
        }

        .gdw-intro-skip {
          align-self: flex-end;
          flex-shrink: 0;

          padding: 10px 16px;
          color: #d8dce0;
          background: transparent;
          border: 1px solid #41464c;
          border-radius: 4px;

          font: inherit;
          font-size: 14px;
          cursor: pointer;
        }

        .gdw-intro-skip:hover {
          color: #fff;
          border-color: #ed493e;
        }

        .gdw-intro-skip:focus-visible {
          outline: 2px solid #ffd18d;
          outline-offset: 4px;
        }

        .gdw-intro-content {
          width: 100%;
          max-width: 780px;
          margin: auto 0;
          padding: 36px 0;
          text-align: center;

          animation: gdw-intro-reveal 700ms ease-out both;
        }

        .gdw-intro-logo {
          display: block;
          width: 112px;
          height: 112px;
          margin: 0 auto 28px;

          object-fit: contain;
          border: 1px solid #353a40;
          border-radius: 12px;
        }

        .gdw-intro-kicker {
          margin: 0 0 18px;
          color: #b4bbc2;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.6;
          letter-spacing: 0.14em;
        }

        .gdw-intro-title {
          margin: 0;
          color: #f4f3f0;
          font-family: var(
            --display,
            "Arial Narrow",
            sans-serif
          );
          font-size: clamp(36px, 8vw, 84px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: 0.02em;
        }

        .gdw-intro-title span {
          display: block;
          margin-top: 6px;
          color: #ed493e;
        }

        .gdw-intro-tagline {
          margin: 22px 0 0;
          color: #b4bbc2;
          font-size: 16px;
          line-height: 1.6;
        }

        .gdw-intro-track {
          width: min(220px, 70%);
          height: 3px;
          margin: 32px auto 0;
          overflow: hidden;
          background: #252a30;
        }

        .gdw-intro-track span {
          display: block;
          width: 100%;
          height: 100%;
          background: #ed493e;
          transform-origin: left;
          animation: gdw-intro-progress 2200ms linear both;
        }

        .gdw-intro-credit {
          flex-shrink: 0;
          margin: 0;
          padding-top: 16px;
          color: #a8adb3;
          font-size: 12px;
          line-height: 1.6;
          letter-spacing: 0.08em;
          text-align: center;
        }

        .gdw-intro-credit strong {
          color: #ed493e;
          font-weight: 800;
        }

        @keyframes gdw-intro-reveal {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gdw-intro-progress {
          from {
            transform: scaleX(0);
          }

          to {
            transform: scaleX(1);
          }
        }

        @media (max-width: 600px) {
          .gdw-intro {
            padding: 20px;
          }

          .gdw-intro-logo {
            width: 88px;
            height: 88px;
            margin-bottom: 24px;
          }

          .gdw-intro-kicker {
            letter-spacing: 0.06em;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gdw-intro,
          .gdw-intro-content,
          .gdw-intro-track span {
            animation: none;
            transition: none;
          }
        }
      `}</style>
    </>
  );
}