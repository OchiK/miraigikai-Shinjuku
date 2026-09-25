import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import {
  Caprasimo,
  Figtree,
  Zen_Kaku_Gothic_New,
  Zen_Maru_Gothic,
} from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";
import { env } from "@/lib/env";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku-gothic-new",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const zenMaru = Zen_Maru_Gothic({
  variable: "--font-zen-maru-gothic",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  subsets: ["latin"],
  weight: ["400"],
});

const isDev = process.env.NODE_ENV === "development";
const isStaging = process.env.VERCEL_TARGET_ENV === "staging";
const ogImage = {
  url: "/ogp.jpg",
  width: 1200,
  height: 630,
  alt: `${siteConfig.siteName}のOGPイメージ`,
};

export const metadata: Metadata = {
  metadataBase: new URL(env.webUrl),
  title: siteConfig.siteName,
  description: siteConfig.siteDescription,
  keywords: [...siteConfig.keywords],
  verification: {
    google: "ZWBAdiv-s3vO9lgW4elAD490nEeuwrwbYZvV9MrDOwY",
  },
  icons: {
    icon: isDev
      ? "/icons/pwa/icon_dev_192_v3.png"
      : isStaging
        ? "/icons/pwa/icon_staging_192.png"
        : "/icons/pwa/icon_android_192.png",
    apple: isStaging
      ? "/icons/pwa/icon_staging_ios.png"
      : "/icons/pwa/icon_ios.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: siteConfig.siteName,
    description: siteConfig.siteDescription,
    images: [ogImage],
    siteName: siteConfig.siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.siteName,
    description: siteConfig.siteDescription,
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c67139",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${figtree.variable} ${zenKaku.variable} ${zenMaru.variable} ${caprasimo.variable} font-sans antialiased`}
      >
        <NextTopLoader showSpinner={false} color="var(--primary)" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
