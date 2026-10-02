import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locateVideos } from "@/lib/world-location";

import { reports } from "@/lib/reports";

type ReportPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return reports.map((report) => ({
    slug: report.slug,
  }));
}

export async function generateMetadata({
  params,
}: ReportPageProps): Promise<Metadata> {
  const { slug } = await params;

  const report = reports.find(
    (item) => item.slug === slug
  );

  return {
    title: report?.title || "Report Not Found",
    description: report?.summary,

    // Keep sample articles out of search results.
    // Change this when verified articles are ready to publish.
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function ReportPage({
  params,
}: ReportPageProps) {
  const { slug } = await params;

  const report = reports.find(
    (item) => item.slug === slug
  );

  if (!report) {
    notFound();
  }

  return (
    <main
      id="main"
      className="article"
    >
      <Link
        className="text-link"
        href="/#reports"
      >
        ← Back to Reports
      </Link>

      <p className="eyebrow">
        {report.category} / {report.region}
      </p>

      <h1>{report.title}</h1>

      <p className="article-lead">
        {report.summary}
      </p>

      <div className="article-label">
        EDITORIAL PREVIEW · SAMPLE ARTICLE · NOT A CURRENT EVENT
      </div>

      <div className="article-body">
        {report.paragraphs.map((paragraph, index) => (
          <p key={`${report.slug}-${index}`}>
            {paragraph}
          </p>
        ))}
      </div>

      <aside className="source-box">
        <h2>Official Resources</h2>

        <p>
          Visit the organization below for official information.
          This link is provided as a general reference and does
          not verify a current event on this sample page.
        </p>

        <a
          href={report.source}
          target="_blank"
          rel="noopener noreferrer"
        >
          {report.sourceName} ↗
        </a>
      </aside>

      <Link
        href="/#coverage"
        className="button"
      >
        Explore the Coverage Map →
      </Link>
    </main>
  );
}