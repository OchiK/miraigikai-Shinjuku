"use client";

import { LOCALE_COOKIE_NAME } from "@mirai-gikai/shared/i18n/locales";
import { DEFAULT_RUBY_CUSTOM_READINGS } from "@mirai-gikai/shared/ruby/custom-readings";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { rubyfulClient } from "./index";
import { shouldEnableRubyful } from "./should-enable-rubyful";
import "./styles.css";

declare global {
  interface Window {
    RubyfulV2?: {
      init: (config: {
        selector: string;
        defaultDisplay: boolean;
        observeChanges?: boolean;
        styles?: object;
        customReadings?: Record<string, string>;
      }) => void;
      destroy?: () => void;
    };
  }
}

function getClientLocale(): string {
  if (typeof document === "undefined") return "ja";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : "ja";
}

export function RubyfulInitializer() {
  const pathname = usePathname();
  const isInitializedRef = useRef(false);

  const initOrDestroyRubyful = useCallback(() => {
    if (typeof window === "undefined" || !window.RubyfulV2) return;

    const isEnabledInStorage = rubyfulClient.getIsEnabledFromStorage();
    const locale = getClientLocale();

    const shouldEnable = shouldEnableRubyful({
      isEnabledInStorage,
      pathname,
      locale,
    });

    if (!shouldEnable) {
      if (isInitializedRef.current) {
        window.RubyfulV2.destroy?.();
        isInitializedRef.current = false;
      }
      return;
    }

    if (isInitializedRef.current) return;

    // Rubyful V2を初期化
    window.RubyfulV2.init({
      selector:
        "main p, main h1, main h2, main h3, main h4, main h5, main h6, main li, main td, main th, main span, main a",
      defaultDisplay: true,
      observeChanges: true,
      styles: {
        toggleButtonClass: "ruby-button",
      },
      // Rubyful が誤読する語の読みを上書きする。外部スクリプトに凍結済みの
      // 既定辞書をそのまま渡さないよう、コピーして渡す
      customReadings: { ...DEFAULT_RUBY_CUSTOM_READINGS },
    });
    isInitializedRef.current = true;
  }, [pathname]);

  useEffect(() => {
    initOrDestroyRubyful();
  }, [initOrDestroyRubyful]);

  return (
    <Script
      src="https://rubyful-v2.s3.ap-northeast-1.amazonaws.com/v2/rubyful.js?t=20250507022654"
      strategy="afterInteractive"
      onLoad={initOrDestroyRubyful}
    />
  );
}
