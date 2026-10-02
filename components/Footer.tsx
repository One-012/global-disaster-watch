import { site } from "@/lib/site";

const contactEmail = "vithequynh00@gmail.com";

const gmailUrl =
  "https://mail.google.com/mail/?view=cm&fs=1" +
  `&to=${encodeURIComponent(contactEmail)}` +
  `&su=${encodeURIComponent("Global Disaster Watch — Inquiry")}`;

export default function Footer() {
  return (
    <footer id="about">
      <div className="footer-grid">
        <div>
          <div className="eyebrow">{site.name}</div>

          <h2>
            Extreme weather.
            <br />
            Real-world impact.
          </h2>
        </div>

        <div>
          <h3>About Global Disaster Watch</h3>

          <p>
            We explore extreme weather through documentary storytelling,
            with a focus on the science behind each event and the people
            affected.
          </p>

          <p className="muted">
            Content may include archival footage and illustrative images.
            Not all material depicts current events. This website is not
            an official emergency alert service.
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: "36px",
          paddingTop: "28px",
          borderTop: "1px solid var(--line)",
        }}
      >
        <h3>Contact Us</h3>

        <p>
          Have a story tip, a question, or a partnership inquiry?
          Get in touch with Global Disaster Watch.
        </p>

        <p
          style={{
            color: "var(--ink)",
            overflowWrap: "anywhere",
          }}
        >
          {contactEmail}
        </p>

        <a
          className="button red"
          href={gmailUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact Global Disaster Watch via Gmail in a new tab"
        >
          Contact via Gmail ↗
        </a>
      </div>

      <div className="footer-bottom">

        <div
  style={{
    marginTop: "36px",
    padding: "28px 24px",
    border: "1px solid var(--red, #ed493e)",
    borderLeft: "4px solid var(--red, #ed493e)",
    background: "rgba(237, 73, 62, 0.06)",
    textAlign: "center",
  }}
>
  <p
    style={{
      margin: "0 0 12px",
      color: "var(--muted, #a8adb3)",
      fontSize: "13px",
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    }}
  >
    Website &amp; YouTube Channel Development
  </p>

  <p
 style={{
  margin: "0",
  display: "inline-block",
  fontFamily: "var(--display, sans-serif)",
  fontSize: "clamp(32px, 5vw, 52px)",
  fontWeight: 800,
  lineHeight: 1.15,
  letterSpacing: "0.06em",
  textTransform: "uppercase",

  backgroundImage: "linear-gradient(90deg, #1e56d9 0%, #2d7bff 28%, #ffffff 48%, #ff5a52 68%, #d81f1f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",

  textShadow: `
    0 0 2px rgba(255,255,255,0.95),
    0 0 6px rgba(255,255,255,0.7),
    0 0 10px rgba(70,140,255,0.55),
    0 0 14px rgba(237,73,62,0.35),
    0 10px 18px rgba(255,255,255,0.22),
    0 16px 28px rgba(255,255,255,0.12)
  `,

  filter: `
    drop-shadow(0 0 6px rgba(255,255,255,0.45))
    drop-shadow(0 0 10px rgba(40,110,255,0.28))
    drop-shadow(0 6px 16px rgba(255,255,255,0.18))
  `,
}}
>
  B5 NETWORK
  </p>
</div>
        <span>
          © {new Date().getUTCFullYear()} {site.name}
        </span>

        <span>
          Cover photo: NOAA / Unsplash · Archival image
        </span>
      </div>
    </footer>
  );
}