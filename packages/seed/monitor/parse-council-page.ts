import type {
  DecisionEntry,
  IndexEntry,
  PageLink,
  SubmissionEntry,
} from "./types";

/**
 * 新宿区公式サイトのHTMLから案件・リンクを取り出す純粋関数。
 *
 * 区のCMSは本文を `<div id="primaryIn01">` に出力する。ヘッダーのメガメニューや
 * 左ナビのリンクを拾わないよう、必ず本文領域に絞ってから解析する。
 * 本文領域が見つからないときは、サイトの作りが変わったとみなして例外を投げる
 * （「案件が0件になった」と誤って報告しないため）。
 */

const SITE_ORIGIN = "https://www.city.shinjuku.lg.jp";

const PRIMARY_START = 'id="primaryIn01"';
const PRIMARY_END = "<!-- /primaryIn01 -->";

/**
 * 識別名と件名の区切り。公式ページは「第63号議案　件名」のように全角スペースで区切る。
 * 対応する識別名: 第N号議案 / 承認第N号 / 認定第N号 / 同意第N号 / 諮問第N号 / 報告第N号 /
 * 議員提出議案第N号。番号は全角数字でも受け付け、識別名では半角に揃える（件名は原文のまま）。
 */
const LABEL_PATTERN =
  /^(第[0-9０-９]+号議案|(?:承認|認定|同意|諮問|報告|議員提出議案)第[0-9０-９]+号)[\s　]*(.*)$/;

/** 会期名（例: 令和8年第3回定例会 / 令和8年第2回区議会定例会 / 令和7年第3回臨時会） */
const SESSION_PATTERN =
  /令和(\d+|元)年\s*第(\d+)回\s*(?:区議会)?\s*(定例会|臨時会)/;

const toHalfWidthDigits = (text: string) =>
  text.replace(/[０-９]/g, (digit) =>
    String.fromCharCode(digit.charCodeAt(0) - 0xfee0)
  );

export function extractPrimaryContent(html: string): string {
  const start = html.indexOf(PRIMARY_START);
  if (start < 0) {
    throw new Error(
      "本文領域（#primaryIn01）が見つからない。公式サイトの構成が変わった可能性がある"
    );
  }
  const end = html.indexOf(PRIMARY_END, start);
  return html.slice(start, end < 0 ? undefined : end);
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body) => {
    const key = String(body);
    if (key.startsWith("#x") || key.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(key.slice(2), 16));
    }
    if (key.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(key.slice(1), 10));
    }
    return NAMED_ENTITIES[key.toLowerCase()] ?? match;
  });
}

/**
 * リンク・セル内のHTMLを表示文言にする。
 * PDFリンクに付く「 [PDF形式：151KB] 」と「（新規ウィンドウ表示）」は件名ではないので落とす。
 * 容量はファイルを差し替えるだけで変わるため、残すとリンク監視が誤検知する。
 */
export function toPlainText(fragment: string): string {
  return decodeEntities(fragment.replace(/<[^>]+>/g, ""))
    .replace(/\[PDF形式[：:][^\]]*\]/g, "")
    .replace(/（新規ウィンドウ表示）/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveUrl(
  href: string,
  baseUrl: string = SITE_ORIGIN
): string {
  return new URL(decodeEntities(href), baseUrl).toString();
}

/** 会期名から会期IDを作る。定例会は `r8-3`、臨時会は `r8-rinji-3`。 */
export function toSessionId(text: string): string | null {
  const match = SESSION_PATTERN.exec(toHalfWidthDigits(text));
  if (!match) return null;
  const [, rawYear, number, kind] = match;
  const year = rawYear === "元" ? "1" : rawYear;
  return kind === "定例会" ? `r${year}-${number}` : `r${year}-rinji-${number}`;
}

/** 識別名と件名に分ける。案件でない文言なら null。 */
export function splitLabel(
  text: string
): { officialLabel: string; officialTitle: string } | null {
  const match = LABEL_PATTERN.exec(text);
  if (!match) return null;
  return {
    officialLabel: toHalfWidthDigits(match[1]),
    officialTitle: match[2].trim(),
  };
}

/** 本文領域のリンクをすべて取り出す（ページ内リンクと外部SNS共有リンクは除く） */
export function parseLinks(html: string, pageUrl: string): PageLink[] {
  const content = extractPrimaryContent(html);
  const links: PageLink[] = [];
  const seen = new Set<string>();

  for (const match of content.matchAll(
    /<a\s[^>]*?href="([^"]+)"[^>]*>(.*?)<\/a>/gs
  )) {
    const rawHref = match[1];
    if (rawHref.startsWith("#")) continue;
    const href = resolveUrl(rawHref, pageUrl);
    if (!href.startsWith(SITE_ORIGIN)) continue;
    const text = toPlainText(match[2]);
    const key = `${href}\n${text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ text, href });
  }
  return links;
}

/** 提出議案ページから案件を取り出す。同じ識別名が複数あれば最初の1件を採る。 */
export function parseSubmissionPage(
  html: string,
  pageUrl: string
): SubmissionEntry[] {
  const entries: SubmissionEntry[] = [];
  const seen = new Set<string>();

  for (const link of parseLinks(html, pageUrl)) {
    const parsed = splitLabel(link.text);
    if (!parsed || seen.has(parsed.officialLabel)) continue;
    seen.add(parsed.officialLabel);
    entries.push({
      ...parsed,
      pdfUrl: /\.pdf$/i.test(new URL(link.href).pathname) ? link.href : null,
    });
  }
  return entries;
}

/** 議決結果ページの表（識別名 / 件名 / 議決結果）から案件を取り出す */
export function parseDecisionPage(html: string): DecisionEntry[] {
  const content = extractPrimaryContent(html);
  const entries: DecisionEntry[] = [];
  const seen = new Set<string>();

  for (const row of content.matchAll(/<tr[^>]*>(.*?)<\/tr>/gs)) {
    const cells = [...row[1].matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)].map(
      (cell) => toPlainText(cell[1])
    );
    if (cells.length < 3) continue;
    const [label, title, decision] = cells;
    const parsed = splitLabel(label);
    if (
      !parsed ||
      parsed.officialTitle !== "" ||
      seen.has(parsed.officialLabel)
    )
      continue;
    seen.add(parsed.officialLabel);
    entries.push({
      officialLabel: parsed.officialLabel,
      officialTitle: title,
      decision,
    });
  }
  return entries;
}

/** 一覧ページから会期ページへのリンクを新しい順（掲載順）に取り出す */
export function parseIndexPage(html: string, pageUrl: string): IndexEntry[] {
  return parseLinks(html, pageUrl)
    .map((link) => ({
      title: link.text,
      url: link.href,
      sessionId: toSessionId(link.text),
    }))
    .filter((entry) => entry.sessionId !== null);
}
