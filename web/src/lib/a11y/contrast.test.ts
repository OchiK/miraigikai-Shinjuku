import { describe, expect, it } from "vitest";

import {
  blendHex,
  contrastRatio,
  parseCssCustomProperties,
  relativeLuminance,
  resolveCssColorTokens,
} from "./contrast";

describe("relativeLuminance", () => {
  it("returns 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBe(1);
  });

  it("accepts 3-digit hex", () => {
    expect(relativeLuminance("#fff")).toBe(1);
  });

  it("throws on a non-hex value", () => {
    expect(() => relativeLuminance("oklch(0.5 0.1 40)")).toThrow();
  });
});

describe("contrastRatio", () => {
  it("returns 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("returns 1 for identical colors", () => {
    expect(contrastRatio("#c67139", "#c67139")).toBe(1);
  });

  it("does not depend on argument order", () => {
    expect(contrastRatio("#201e1d", "#c67139")).toBe(
      contrastRatio("#c67139", "#201e1d")
    );
  });

  it("matches the WebAIM reference for #777777 on white (4.48)", () => {
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });
});

describe("blendHex", () => {
  it("returns the foreground at alpha 1 and the background at alpha 0", () => {
    expect(blendHex("#c67139", "#f5ead8", 1)).toBe("#c67139");
    expect(blendHex("#c67139", "#f5ead8", 0)).toBe("#f5ead8");
  });

  it("interpolates each channel", () => {
    expect(blendHex("#000000", "#ffffff", 0.5)).toBe("#808080");
  });

  it("throws when alpha is out of range", () => {
    expect(() => blendHex("#000000", "#ffffff", 1.5)).toThrow();
  });
});

describe("parseCssCustomProperties", () => {
  it("reads @theme inline and :root blocks and ignores comments", () => {
    const css = `
      @theme inline {
        --color-primary: var(--primary); /* 主色 */
      }
      :root {
        --primary: #C67139;
      }
      .other { --ignored: #000000; }
    `;
    expect(parseCssCustomProperties(css)).toEqual({
      "--color-primary": "var(--primary)",
      "--primary": "#C67139",
    });
  });
});

describe("resolveCssColorTokens", () => {
  const css = `
    @theme inline {
      --color-neutral-800: #474238;
      --color-mirai-text-secondary: var(--color-neutral-800);
      --color-primary: var(--primary);
      --color-loop-a: var(--color-loop-b);
      --color-loop-b: var(--color-loop-a);
      --color-missing: var(--nowhere);
      --color-modern: oklch(0.6 0.1 40);
    }
    :root {
      --primary: #C67139;
    }
  `;

  it("follows var() chains within and across blocks", () => {
    expect(
      resolveCssColorTokens(css, [
        "--color-primary",
        "--color-mirai-text-secondary",
      ])
    ).toEqual({
      "--color-primary": "#c67139",
      "--color-mirai-text-secondary": "#474238",
    });
  });

  it("throws on a cycle", () => {
    expect(() => resolveCssColorTokens(css, ["--color-loop-a"])).toThrow(
      /Circular/
    );
  });

  it("throws on a missing variable", () => {
    expect(() => resolveCssColorTokens(css, ["--color-missing"])).toThrow(
      /--nowhere/
    );
    expect(() => resolveCssColorTokens(css, ["--color-absent"])).toThrow(
      /--color-absent/
    );
  });

  it("throws on a non-hex value instead of passing silently", () => {
    expect(() => resolveCssColorTokens(css, ["--color-modern"])).toThrow(
      /not a hex color/
    );
  });
});
