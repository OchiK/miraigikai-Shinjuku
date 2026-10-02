import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { contrastRatio, resolveCssColorTokens } from "@/lib/a11y/contrast";
import { buttonVariants } from "./button";

// 実際の globals.css を読む。トークンを変えて比が割れたらここで落ちる
const css = readFileSync(
  new URL("../../app/globals.css", import.meta.url),
  "utf8"
);

function hasClass(classString: string, utility: string): boolean {
  return classString.split(/\s+/).includes(utility);
}

const TEXT_MIN = 4.5; // 1.4.3
const NON_TEXT_MIN = 3; // 1.4.11

const colors = resolveCssColorTokens(css, [
  "--color-primary",
  "--color-primary-accent",
  "--color-mirai-text",
  "--color-mirai-accent-text",
  "--color-background",
  "--color-card",
  "--color-mirai-surface",
  "--color-neutral-100",
  "--color-neutral-200",
  "--color-neutral-300",
]);

describe("Button default バリアントの配色", () => {
  const classes = buttonVariants({ variant: "default" });

  it("使っているトークンが検証対象と一致する", () => {
    expect(hasClass(classes, "bg-primary")).toBe(true);
    expect(hasClass(classes, "text-mirai-text")).toBe(true);
    expect(hasClass(classes, "hover:bg-primary-accent")).toBe(true);
  });

  it("通常時の文字 / 地が 4.5:1 以上", () => {
    expect(
      contrastRatio(colors["--color-mirai-text"], colors["--color-primary"])
    ).toBeGreaterThanOrEqual(TEXT_MIN);
  });

  it("ホバー時の文字 / 地が 4.5:1 以上", () => {
    expect(
      contrastRatio(
        colors["--color-mirai-text"],
        colors["--color-primary-accent"]
      )
    ).toBeGreaterThanOrEqual(TEXT_MIN);
  });
});

describe("Button 基底のフォーカスリング", () => {
  const classes = buttonVariants();

  it("terracotta-700 のリングを使い、薄い primary/40 は使わない", () => {
    expect(hasClass(classes, "focus-visible:ring-mirai-accent-text")).toBe(
      true
    );
    expect(hasClass(classes, "focus-visible:ring-primary/40")).toBe(false);
  });

  it.each([
    "--color-background",
    "--color-card",
    "--color-mirai-surface",
    "--color-neutral-100",
    "--color-neutral-200",
    "--color-neutral-300",
  ])("リング / %s が 3:1 以上", (token) => {
    expect(
      contrastRatio(colors["--color-mirai-accent-text"], colors[token])
    ).toBeGreaterThanOrEqual(NON_TEXT_MIN);
  });
});
