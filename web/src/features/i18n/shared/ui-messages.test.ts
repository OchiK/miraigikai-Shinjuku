import { getBillCardStatusLabel } from "@mirai-gikai/shared/bills/decision-label";
import { describe, expect, it } from "vitest";
import {
  getUiMessages,
  localizeCardStatusLabel,
  UI_MESSAGES,
} from "./ui-messages";

/** 入れ子のキーを "nav.bills" の形で並べる */
function collectKeys(value: unknown, prefix = ""): string[] {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    prefix.endsWith("difficulty.labels")
  ) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key)
  );
}

describe("UI_MESSAGES", () => {
  it("日本語と英語でキーがそろっている", () => {
    expect(collectKeys(UI_MESSAGES.en).sort()).toEqual(
      collectKeys(UI_MESSAGES.ja).sort()
    );
  });

  it("英語の文言に日本語の文字が混ざっていない", () => {
    const japanese = /[぀-ヿ一-鿿]/;
    const walk = (value: unknown): string[] => {
      if (typeof value === "string") return [value];
      // 差し込み文言は ASCII の引数で呼び、出力を確かめる
      if (typeof value === "function") {
        const fn = value as (...args: unknown[]) => unknown;
        return walk(
          fn.length === 1 && fn.name === "sessionPeriod"
            ? fn({ year: 2026, startMonth: 2, endMonth: 3, sessionName: "S" })
            : fn(1, "x")
        );
      }
      if (value && typeof value === "object") {
        return Object.values(value).flatMap(walk);
      }
      return [];
    };
    for (const text of walk(UI_MESSAGES.en)) {
      expect(text).not.toMatch(japanese);
    }
  });
});

describe("getUiMessages", () => {
  it("英語を選ぶと英語の辞書を返す", () => {
    expect(getUiMessages("en").nav.bills).toBe("Bills");
    expect(getUiMessages("en").difficulty.labels).toEqual({
      easy: "Plain",
      normal: "Standard",
      hard: "Detailed",
    });
  });

  it("日本語を選ぶと日本語の辞書を返す", () => {
    expect(getUiMessages("ja").nav.bills).toBe("議案一覧");
    expect(getUiMessages("ja").difficulty.labels.easy).toBe("やさしい");
  });
});

describe("英語の差し込み文言", () => {
  const { home, card } = getUiMessages("en");

  it("件数は1件だけ単数形にする", () => {
    expect(home.billCount(1)).toBe("1 bill");
    expect(home.billCount(23)).toBe("23 bills");
  });

  it("会期の説明に月名を入れる", () => {
    expect(
      home.sessionPeriod({
        year: 2026,
        startMonth: 2,
        endMonth: 3,
        sessionName: "令和8年第1回定例会",
      })
    ).toBe("令和8年第1回定例会, held February–March 2026");
  });

  it("1か月だけの会期は月を1つだけ出す", () => {
    expect(
      home.sessionPeriod({
        year: 2026,
        startMonth: 6,
        endMonth: 6,
        sessionName: "S",
      })
    ).toBe("S, held in June 2026");
  });

  it("掲載日を英語の語順で出す", () => {
    expect(card.published("2026/06/01")).toBe("Published 2026/06/01");
  });

  it("日本語の会期説明は従来の形のまま", () => {
    expect(
      getUiMessages("ja").home.sessionPeriod({
        year: 2026,
        startMonth: 2,
        endMonth: 3,
        sessionName: "令和8年第1回定例会",
      })
    ).toBe("2026.2月〜3月に実施された令和8年第1回定例会");
  });
});

describe("localizeCardStatusLabel", () => {
  const statuses = [
    "preparing",
    "submitted",
    "in_committee",
    "plenary_session",
    "approved",
    "rejected",
    "adopted",
    "partially_adopted",
    "reported",
  ];
  // packages/shared/src/bills/decision-label.ts の OFFICIAL_DECISION_TERMS
  const officialTerms = [
    "原案可決",
    "修正可決",
    "可決",
    "否決",
    "承認",
    "不承認",
    "同意",
    "不同意",
    "認定",
    "不認定",
    "採択",
    "趣旨採択",
    "不採択",
  ];

  it.each(statuses)("status=%s のカード用ラベルに英語がある", (status) => {
    const label = getBillCardStatusLabel({ status });
    expect(localizeCardStatusLabel(label, "en")).not.toBe(label);
  });

  it.each(officialTerms)("公式の議決用語「%s」に英語がある", (term) => {
    const label = getBillCardStatusLabel({
      status: "approved",
      statusNote: `本会議で${term}`,
    });
    expect(localizeCardStatusLabel(label, "en")).not.toBe(label);
  });

  it("承認と可決を英語でも区別する", () => {
    expect(localizeCardStatusLabel("承認", "en")).toBe("Approved");
    expect(localizeCardStatusLabel("可決", "en")).toBe("Passed");
  });

  it("日本語表示ではそのまま返す", () => {
    expect(localizeCardStatusLabel("可決", "ja")).toBe("可決");
  });

  it("英語の無いラベルは日本語のまま返す", () => {
    expect(localizeCardStatusLabel("未知の用語", "en")).toBe("未知の用語");
  });
});
