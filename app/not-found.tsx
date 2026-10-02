import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="article"
    >
      <p className="eyebrow">
        404 / PAGE NOT FOUND
      </p>

      <h1>We couldn’t find that page.</h1>

      <p>
        The page may have moved, or the link may be incorrect.
        Head back to the homepage to explore our reports and
        documentaries.
      </p>

      <Link
        className="button red"
        href="/"
      >
        Back to Home
      </Link>
    </main>
  );
}