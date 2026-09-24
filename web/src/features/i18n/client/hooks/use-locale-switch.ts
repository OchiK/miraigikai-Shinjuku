"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { useState } from "react";
import { setLocale } from "../../server/actions/set-locale";
import { removeLocaleParam } from "../../shared/utils/remove-locale-param";

/**
 * 表示言語の切り替え。URL は変えず、Cookie を更新して同じページを読み直す。
 * 議案ページなら同じ議案のまま、難易度の選択も保ったまま言語だけが変わる。
 */
export function useLocaleSwitch(currentLocale: PublicLocale) {
  const [selected, setSelected] = useState<PublicLocale>(currentLocale);
  const [isChanging, setIsChanging] = useState(false);

  const switchLocale = async (next: PublicLocale) => {
    if (next === selected || isChanging) {
      return;
    }

    setIsChanging(true);
    setSelected(next);

    try {
      await setLocale(next);
      // 成功時はページを読み直すので isChanging は戻さない（二重操作を防ぐ）

      const urlWithoutParam = removeLocaleParam(window.location.href);
      if (urlWithoutParam) {
        window.location.replace(urlWithoutParam);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update locale:", error);
      setSelected(currentLocale);
      setIsChanging(false);
    }
  };

  return { selected, isChanging, switchLocale };
}
