import { describe, expect, it } from "vitest";
import { extractSourceCitations, isHttpUrl } from "./extract-source-citations";

describe("extractSourceCitations", () => {
  it("末尾の【出典】行を本文から切り離す", () => {
    const result = extractSourceCitations(
      "対象は区内の事業者です。\n\n【出典】議案第58号 本文"
    );
    expect(result.body).toBe("対象は区内の事業者です。");
    expect(result.sources).toEqual(["議案第58号 本文"]);
  });

  it("英語の Source: 行を扱う", () => {
    const result = extractSourceCitations(
      "It applies to local businesses.\nSource: Bill No. 58 full text"
    );
    expect(result.body).toBe("It applies to local businesses.");
    expect(result.sources).toEqual(["Bill No. 58 full text"]);
  });

  it("複数の出典を区切り文字で分ける", () => {
    const result = extractSourceCitations(
      "本文\n【出典】議案第58号 本文、https://www.city.shinjuku.lg.jp/a.html"
    );
    expect(result.sources).toEqual([
      "議案第58号 本文",
      "https://www.city.shinjuku.lg.jp/a.html",
    ]);
  });

  it("出典行が無ければ本文をそのまま返す", () => {
    const result = extractSourceCitations(
      "提供された資料からは確認できません。"
    );
    expect(result.body).toBe("提供された資料からは確認できません。");
    expect(result.sources).toEqual([]);
  });

  it("本文中の「出典」という語は出典行として扱わない", () => {
    const result = extractSourceCitations("この出典は公式です。");
    expect(result.body).toBe("この出典は公式です。");
    expect(result.sources).toEqual([]);
  });
});

describe("isHttpUrl", () => {
  it("http(s) のURLだけ true", () => {
    expect(isHttpUrl("https://example.com/a")).toBe(true);
    expect(isHttpUrl("議案第58号 本文")).toBe(false);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
  });
});
