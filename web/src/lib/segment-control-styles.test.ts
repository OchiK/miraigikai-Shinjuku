import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { buttonVariants } from "@/components/ui/button";
import { contrastRatio, resolveCssColorTokens } from "./a11y/contrast";
import {
  SEGMENT_SELECTED_CLASS,
  SEGMENT_TRACK_CLASS,
  SEGMENT_UNSELECTED_CLASS,
  segmentItemClass,
} from "./segment-control-styles";

// 実際の globals.css を読む。トークンを変えて比が割れたらここで落ちる
const css = readFileSync(
  new URL("../app/globals.css", import.meta.url),
  "utf8"
);

/** クラス文字列を空白・引用符で区切り、部分一致ではなく完全一致で含むか調べる */
function hasClass(classString: string, utility: string): boolean {
  return classString.split(/[\s"'`]+/).includes(utility);
}

const TEXT_MIN = 4.5; // 1.4.3
const NON_TEXT_MIN = 3; // 1.4.11

// ヘッダーの地はソースから読む。3つのボタンが載る角丸の面（rounded-2xl）の className に絞る
const HEADER_SURFACE_CLASS =
  /className="([^"]*\brounded-2xl\b[^"]*)"/.exec(
    readFileSync(
      new URL("../components/header/header-client.tsx", import.meta.url),
      "utf8"
    )
  )?.[1] ?? "";
const BUTTON_BASE_CLASS = buttonVariants({ variant: "ghost" });

interface Side {
  /** globals.css のトークン名（--color-*） */
  token: string;
  /** そのトークンを使うユーティリティ */
  utility: string;
  /** utility を含むべきクラス文字列 */
  classString: string;
  source: string;
}

interface Pair {
  name: string;
  fg: Side;
  bg: Side;
  min: number;
}

const track: Side = {
  token: "--color-neutral-100",
  utility: "bg-neutral-100",
  classString: SEGMENT_TRACK_CLASS,
  source: "SEGMENT_TRACK_CLASS",
};
const selectedFill: Side = {
  token: "--color-primary",
  utility: "bg-primary",
  classString: SEGMENT_SELECTED_CLASS,
  source: "SEGMENT_SELECTED_CLASS",
};
const focusRing = (classString: string, source: string): Side => ({
  token: "--color-mirai-accent-text",
  utility: "focus-visible:ring-mirai-accent-text",
  classString,
  source,
});

const PAIRS: Pair[] = [
  {
    name: "選択中の文字 / 選択中の塗り",
    fg: {
      token: "--color-mirai-text",
      utility: "text-mirai-text",
      classString: SEGMENT_SELECTED_CLASS,
      source: "SEGMENT_SELECTED_CLASS",
    },
    bg: selectedFill,
    min: TEXT_MIN,
  },
  {
    name: "選択中のホバー文字 / ホバー時の塗り",
    fg: {
      token: "--color-mirai-text",
      utility: "hover:text-mirai-text",
      classString: SEGMENT_SELECTED_CLASS,
      source: "SEGMENT_SELECTED_CLASS",
    },
    bg: {
      token: "--color-primary",
      utility: "hover:bg-primary",
      classString: SEGMENT_SELECTED_CLASS,
      source: "SEGMENT_SELECTED_CLASS",
    },
    min: TEXT_MIN,
  },
  {
    name: "選択中の塗り / 地（選択状態の手がかり）",
    fg: selectedFill,
    bg: track,
    min: NON_TEXT_MIN,
  },
  {
    name: "非選択の文字 / 地",
    fg: {
      token: "--color-mirai-text-secondary",
      utility: "text-mirai-text-secondary",
      classString: SEGMENT_UNSELECTED_CLASS,
      source: "SEGMENT_UNSELECTED_CLASS",
    },
    bg: track,
    min: TEXT_MIN,
  },
  {
    name: "非選択のホバー文字 / ホバー時の塗り",
    fg: {
      token: "--color-mirai-text",
      utility: "hover:text-mirai-text",
      classString: SEGMENT_UNSELECTED_CLASS,
      source: "SEGMENT_UNSELECTED_CLASS",
    },
    bg: {
      token: "--color-neutral-300",
      utility: "hover:bg-neutral-300",
      classString: SEGMENT_UNSELECTED_CLASS,
      source: "SEGMENT_UNSELECTED_CLASS",
    },
    min: TEXT_MIN,
  },
  ...[
    { classString: SEGMENT_SELECTED_CLASS, source: "SEGMENT_SELECTED_CLASS" },
    {
      classString: SEGMENT_UNSELECTED_CLASS,
      source: "SEGMENT_UNSELECTED_CLASS",
    },
  ].flatMap(({ classString, source }): Pair[] => [
    {
      name: `フォーカスリング（${source}） / リングのオフセット`,
      fg: focusRing(classString, source),
      bg: {
        token: "--color-background",
        utility: "focus-visible:ring-offset-background",
        classString: BUTTON_BASE_CLASS,
        source: "buttonVariants",
      },
      min: NON_TEXT_MIN,
    },
    {
      name: `フォーカスリング（${source}） / ヘッダーの地`,
      fg: focusRing(classString, source),
      bg: {
        token: "--color-mirai-surface",
        utility: "bg-mirai-surface",
        classString: HEADER_SURFACE_CLASS,
        source: "header-client.tsx",
      },
      min: NON_TEXT_MIN,
    },
    {
      name: `フォーカスリング（${source}） / 地`,
      fg: focusRing(classString, source),
      bg: track,
      min: NON_TEXT_MIN,
    },
  ]),
];

const colors = resolveCssColorTokens(
  css,
  PAIRS.flatMap((p) => [p.fg.token, p.bg.token])
);

describe("セグメント型ボタンの配色（WCAG 2.2 AA）", () => {
  describe.each(PAIRS)("$name", ({ fg, bg, min }) => {
    it(`コントラスト比が ${min}:1 以上`, () => {
      expect(
        contrastRatio(colors[fg.token], colors[bg.token])
      ).toBeGreaterThanOrEqual(min);
    });

    it("検証したトークンを実際のクラスが使っている", () => {
      for (const side of [fg, bg]) {
        expect(
          hasClass(side.classString, side.utility),
          `${side.source} に ${side.utility} がない`
        ).toBe(true);
      }
    });
  });
});

describe("segmentItemClass", () => {
  it("選択状態に応じたクラスを返す", () => {
    expect(segmentItemClass(true)).toBe(SEGMENT_SELECTED_CLASS);
    expect(segmentItemClass(false)).toBe(SEGMENT_UNSELECTED_CLASS);
  });
});
