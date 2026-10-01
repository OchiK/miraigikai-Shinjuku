/**
 * WCAG 2.x のコントラスト比を計算する純粋関数群。
 * globals.css のトークンを読んで配色の回帰を検出するテストで使う。
 */

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const VAR_PATTERN = /^var\((--[\w-]+)\)$/;

function parseHex(hex: string): [number, number, number] {
  const match = HEX_PATTERN.exec(hex.trim());
  if (!match) {
    throw new Error(`Not a hex color: ${hex}`);
  }
  const digits =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((d) => d + d)
          .join("")
      : match[1];
  return [0, 2, 4].map((i) => Number.parseInt(digits.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function toHex(channels: number[]): string {
  return `#${channels
    .map((c) => Math.round(c).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** WCAG 2.x の相対輝度（0〜1） */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 2色のコントラスト比（1〜21）。引数の順序は問わない */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** 不透明度 alpha の前景色を背景色に重ねた結果（sRGB 上の線形補間） */
export function blendHex(fg: string, bg: string, alpha: number): string {
  if (alpha < 0 || alpha > 1) {
    throw new Error(`alpha must be between 0 and 1: ${alpha}`);
  }
  const f = parseHex(fg);
  const b = parseHex(bg);
  return toHex(f.map((c, i) => c * alpha + b[i] * (1 - alpha)));
}

/**
 * CSS の `@theme inline { }` と `:root { }` にあるカスタムプロパティを集める。
 * 値は解決前の生の文字列（`var(--x)` を含む）。
 * `@media` の中の `:root` も拾い、同名は後に書かれた方が勝つ。
 * メディアクエリで色を変えるようになったら、この前提を見直すこと。
 */
export function parseCssCustomProperties(
  cssText: string
): Record<string, string> {
  const withoutComments = cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  const props: Record<string, string> = {};
  const blockPattern = /(?:@theme\s+inline|:root)\s*\{([^}]*)\}/g;
  for (const block of withoutComments.matchAll(blockPattern)) {
    for (const decl of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      props[decl[1]] = decl[2].trim();
    }
  }
  return props;
}

/**
 * 指定したトークンを `var()` の連鎖をたどって hex に解決する。
 * 未定義・循環・hex 以外（oklch() 等）の値は黙って通さず例外にする。
 */
export function resolveCssColorTokens(
  cssText: string,
  names: readonly string[]
): Record<string, string> {
  const props = parseCssCustomProperties(cssText);

  const resolve = (name: string, seen: string[]): string => {
    if (seen.includes(name)) {
      throw new Error(`Circular var(): ${[...seen, name].join(" -> ")}`);
    }
    const value = props[name];
    if (value === undefined) {
      throw new Error(`Undefined custom property: ${name}`);
    }
    const ref = VAR_PATTERN.exec(value);
    if (ref) {
      return resolve(ref[1], [...seen, name]);
    }
    if (!HEX_PATTERN.test(value)) {
      throw new Error(`${name} is not a hex color: ${value}`);
    }
    return value.toLowerCase();
  };

  return Object.fromEntries(names.map((name) => [name, resolve(name, [])]));
}
