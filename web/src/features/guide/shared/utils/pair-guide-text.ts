import type { GuideSection, GuideText } from "../guide-content";

/** 翻訳文と、そのもとになった日本語の原文の組 */
export type GuideTextPair = {
  translated: string;
  ja: string;
};

export type PairedGuideSection = {
  heading: GuideTextPair;
  paragraphs: GuideTextPair[];
  isSteps: boolean;
};

const OPERATOR_PLACEHOLDER = "{operator}";

function fillOperator(text: string, operator: string): string {
  return text.replaceAll(OPERATOR_PLACEHOLDER, operator);
}

/**
 * 翻訳と原文が同じ形か（見出しと段落の数が揃っているか）。
 * 揃っていないと、原文と違う文を並べて出してしまう。
 */
export function hasSameGuideShape(a: GuideText, b: GuideText): boolean {
  return (
    a.sections.length === b.sections.length &&
    a.sections.every(
      (section, i) =>
        section.paragraphs.length === b.sections[i].paragraphs.length &&
        Boolean(section.isSteps) === Boolean(b.sections[i].isSteps)
    )
  );
}

/**
 * 案内ページの各文を、日本語の原文と並べられるよう組にする。
 * 翻訳と原文の形が違うときは、誤った組み合わせを出さないよう例外にする。
 */
export function pairGuideSections(
  translated: GuideText,
  ja: GuideText,
  operator: string
): PairedGuideSection[] {
  if (!hasSameGuideShape(translated, ja)) {
    throw new Error("案内ページの翻訳と原文の段落の数が一致しません");
  }

  const pair = (t: string, j: string): GuideTextPair => ({
    translated: fillOperator(t, operator),
    ja: fillOperator(j, operator),
  });

  return translated.sections.map((section: GuideSection, i) => {
    const jaSection = ja.sections[i];
    return {
      heading: pair(section.heading, jaSection.heading),
      paragraphs: section.paragraphs.map((p, j) =>
        pair(p, jaSection.paragraphs[j])
      ),
      isSteps: Boolean(section.isSteps),
    };
  });
}
