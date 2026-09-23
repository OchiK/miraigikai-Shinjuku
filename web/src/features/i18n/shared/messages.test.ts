import { SUPPORTED_LOCALES } from "@mirai-gikai/shared/i18n/locales";
import { describe, expect, it } from "vitest";
import {
  jaUnavailableNotice,
  LOCALE_JA_NAMES,
  TRANSLATION_MESSAGES,
} from "./messages";

const translationLocales = SUPPORTED_LOCALES.filter((l) => l !== "ja");

describe("TRANSLATION_MESSAGES / LOCALE_JA_NAMES", () => {
  it.each(
    translationLocales
  )("%s の案内文と日本語名がそろっている", (locale) => {
    expect(TRANSLATION_MESSAGES[locale].translatedNotice).toBeTruthy();
    expect(TRANSLATION_MESSAGES[locale].unavailableNotice).toBeTruthy();
    expect(LOCALE_JA_NAMES[locale]).toBeTruthy();
  });
});

describe("jaUnavailableNotice", () => {
  it("言語名を入れた日本語の案内を返す", () => {
    expect(jaUnavailableNotice("英語")).toBe(
      "この内容はまだ英語に翻訳されていません。日本語で表示しています。"
    );
  });
});
