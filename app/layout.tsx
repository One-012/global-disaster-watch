import type { Metadata } from "next";
import type { ReactNode } from "react";

import "leaflet/dist/leaflet.css";
import "./globals.css";
import BackToTop from "@/components/BackToTop";
import SiteIntro from "@/components/SiteIntro";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.SITE_URL || "http://localhost:3000"
  ),

  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },

  description: site.description,

  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    title: site.name,
    description: site.description,
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en-US">
      <body>
         <SiteIntro />
        <Header />

        {children}

        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}