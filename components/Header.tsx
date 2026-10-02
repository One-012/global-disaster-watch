import Link from "next/link";
import { site } from "@/lib/site";

export default function Header() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to main content
      </a>

      <div className="masthead-note">
        <span>EXTREME WEATHER DOCUMENTARIES</span>
        <span>WEATHER · SCIENCE · HUMAN IMPACT</span>
      </div>

      <header className="header">
        <Link
          className="brand"
          href="/"
          aria-label="Global Disaster Watch home"
        >
          <img
            src="/images/logoavt.jpg"
            alt=""
            className="brand-logo"
            width={56}
            height={56}
          />

          <span className="brand-name">
            GLOBAL
            <br />
            DISASTER WATCH
          </span>
        </Link>

        <nav aria-label="Main navigation">
          <Link href="/#reports">Reports</Link>
          <Link href="/#films">Watch</Link>
          <Link href="/#coverage">Coverage</Link>
          <Link href="/#about">About</Link>
        </nav>

        {site.youtubeUrl && (
          <a
            className="button red subscribe"
            href={site.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch on YouTube ↗
          </a>
        )}
      </header>
    </>
  );
}