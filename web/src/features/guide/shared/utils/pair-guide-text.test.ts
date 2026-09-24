import { GUIDE_LOCALES } from "@mirai-gikai/shared/i18n/locales";
import { describe, expect, it } from "vitest";
import { GUIDE_TEXT_JA, GUIDE_TEXTS, type GuideText } from "../guide-content";
import { hasSameGuideShape, pairGuideSections } from "./pair-guide-text";

function makeText(paragraphCounts: number[]): GuideText {
  return {
    title: "t",
    description: "d",
    machineTranslationNotice: "n",
    contactLabel: "c",
    openTopPageLabel: "o",
    otherLanguagesLabel: "l",
    sections: paragraphCounts.map((count, i) => ({
      heading: `見出し${i}`,
      paragraphs: Array.from({ length: count }, (_, j) => `段落${i}-${j}`),
    })),
  };
}

describe("案内ページの文面", () => {
  it.each(
    GUIDE_LOCALES
  )("%s の翻訳は原文と同じ数の見出しと段落を持つ", (locale) => {
    expect(hasSameGuideShape(GUIDE_TEXTS[locale], GUIDE_TEXT_JA)).toBe(true);
  });

  it.each(GUIDE_LOCALES)("%s の翻訳に空の文がない", (locale) => {
    const text = GUIDE_TEXTS[locale];
    const all = [
      text.title,
      text.description,
      text.machineTranslationNotice,
      text.contactLabel,
      text.openTopPageLabel,
      text.otherLanguagesLabel,
      ...text.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ];
    for (const value of all) {
      expect(value.trim()).not.toBe("");
    }
  });

  it("方針書 §3 の5項目（サイト説明・日本語が正本・ブラウザ翻訳・やさしい・AIチャット）だけを載せる", () => {
    expect(GUIDE_TEXT_JA.sections.map((s) => s.heading)).toEqual([
      "このサイトについて",
      "日本語が正しい内容です",
      "ブラウザの翻訳を使う",
      "やさしい日本語で読む",
      "AIに質問する",
    ]);
  });
});

describe("hasSameGuideShape", () => {
  it("段落の数が違えば false", () => {
    expect(hasSameGuideShape(makeText([2, 3]), makeText([2, 2]))).toBe(false);
  });

  it("見出しの数が違えば false", () => {
    expect(hasSameGuideShape(makeText([2]), makeText([2, 2]))).toBe(false);
  });
});

describe("pairGuideSections", () => {
  it("翻訳と原文を同じ位置どうしで組にする", () => {
    const translated = makeText([1, 2]);
    translated.sections[1].paragraphs[1] = "translated 1-1";

    const paired = pairGuideSections(translated, makeText([1, 2]), "運営者");

    expect(paired[1].heading).toEqual({ translated: "見出し1", ja: "見出し1" });
    expect(paired[1].paragraphs[1]).toEqual({
      translated: "translated 1-1",
      ja: "段落1-1",
    });
  });

  it("{operator} を運営者名に置き換える", () => {
    const text = makeText([1]);
    text.sections[0].paragraphs[0] = "個人（{operator}）が運営";

    const paired = pairGuideSections(text, text, "新宿区民");

    expect(paired[0].paragraphs[0]).toEqual({
      translated: "個人（新宿区民）が運営",
      ja: "個人（新宿区民）が運営",
    });
  });

  it("isSteps を引き継ぐ", () => {
    const text = makeText([1, 1]);
    text.sections[1].isSteps = true;

    const paired = pairGuideSections(text, text, "x");

    expect(paired.map((s) => s.isSteps)).toEqual([false, true]);
  });

  it("形が違えば例外にする", () => {
    expect(() =>
      pairGuideSections(makeText([2]), makeText([1]), "x")
    ).toThrow();
  });

  it.each(
    GUIDE_LOCALES
  )("%s の実際の文面で {operator} が残らない", (locale) => {
    const paired = pairGuideSections(
      GUIDE_TEXTS[locale],
      GUIDE_TEXT_JA,
      "新宿区民"
    );
    const all = paired.flatMap((s) => [s.heading, ...s.paragraphs]);
    for (const { translated, ja } of all) {
      expect(translated).not.toContain("{operator}");
      expect(ja).not.toContain("{operator}");
    }
  });
});
