"use client";

import { useEffect, useId, useRef } from "react";
import type { Video } from "@/lib/youtube";

type VideoPlayerProps = {
  video: Video;
  onClose: () => void;
};

export default function VideoPlayer({
  video,
  onClose,
}: VideoPlayerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    document.body.style.overflow = "hidden";

    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

   const embedUrl =
  `https://www.youtube-nocookie.com/embed/${video.id}` +
  "?autoplay=0&playsinline=1&rel=0";

  return (
    <dialog
      ref={dialogRef}
      className="gdw-player-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="gdw-player-panel">
        <div className="gdw-player-heading">
          <div>
            <p className="eyebrow">GLOBAL DISASTER WATCH</p>
            <h2 id={titleId}>{video.title}</h2>
          </div>

          <button
            type="button"
            className="gdw-player-close"
            onClick={onClose}
            aria-label="Close video"
            autoFocus
          >
            ×
          </button>
        </div>

        <div className="gdw-player-frame">
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        <div className="gdw-player-footer">
          <span>Having trouble playing this video?</span>

          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch on YouTube ↗
          </a>
        </div>
      </div>
    </dialog>
  );
}