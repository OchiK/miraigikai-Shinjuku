import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { AuthGate } from "@/components/layouts/auth-gate";
import { Footer } from "@/components/layouts/footer/footer";
import { MainLayout } from "@/components/layouts/main-layout";
import { getLocale } from "@/features/i18n/server/loaders/get-locale";
import { env } from "@/lib/env";
import { RubyfulInitializer } from "@/lib/rubyful";

export default async function MainGroupLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <>
      <SpeedInsights />
      <Analytics />
      <GoogleAnalytics gaId={env.analytics.gaTrackingId ?? ""} />
      <RubyfulInitializer />
      <AuthGate />

      <MainLayout>
        <Header />
        <main className="min-h-dvh md:min-h-[calc(100dvh-96px)] bg-mirai-surface">
          {children}
        </main>
        <Footer locale={locale} />
      </MainLayout>
    </>
  );
}
