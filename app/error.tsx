"use client";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({
  reset,
}: ErrorPageProps) {
  return (
    <main
      id="main"
      className="article"
    >
      <p className="eyebrow">
        SOMETHING WENT WRONG
      </p>

      <h1>We couldn’t load this page.</h1>

      <p>
        Please try again. If the problem continues, check back
        in a few minutes.
      </p>

      <button
        type="button"
        className="button red"
        onClick={reset}
      >
        Try Again
      </button>
    </main>
  );
}