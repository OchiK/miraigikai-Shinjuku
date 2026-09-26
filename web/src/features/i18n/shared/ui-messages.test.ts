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
  const { home, card, factionStances } = getUiMessages("en");

  it("件数は1件だけ単数形にする", () => {
    expect(home.billCount(1)).toBe("1 bill");
    expect(home.billCount(23)).toBe("23 bills");
  });

  it("会派の数は1会派だけ単数形にする", () => {
    expect(factionStances.factionCount(1)).toBe("1 group");
    expect(factionStances.factionCount(7)).toBe("7 groups");
  });

  it("全会一致の一文に会派数を入れる", () => {
    expect(factionStances.unanimousFor(8)).toBe(
      "All 8 parliamentary groups voted in favor"
    );
    expect(factionStances.unanimousAgainst(8)).toBe(
      "All 8 parliamentary groups voted against"
    );
    expect(factionStances.unanimousFor(1)).toBe(
      "The only parliamentary group voted in favor"
    );
  });

  it("少ない側の会派名を括弧と区切りで挟める", () => {
    const { before, after, separator } = factionStances.minorityNames;
    expect(`1 group${before}${["A", "B"].join(separator)}${after}`).toBe(
      "1 group (A, B)"
    );
  });

  it("採決時の会派名を前後の文言で挟める", () => {
    const { before, after } = factionStances.nameAtVote;
    expect(`${before}X${after}`).toBe("(called X at the time of the vote)");
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

describe("P8-12 残作業の英語文言", () => {
  const { sessionBills, councilors, councilorDetail, billDetail } =
    getUiMessages("en");
  const around = ({ before, after }: { before: string; after: string }) =>
    `${before}[S]${after}`;

  it("議員数・質問数・当選回数は1だけ単数形にする", () => {
    expect(councilors.showing(1)).toBe("Showing 1 councilor");
    expect(councilors.showing(38)).toBe("Showing 38 councilors");
    expect(councilors.memberCount(1)).toBe("1 member");
    expect(councilors.memberCount(7)).toBe("7 members");
    expect(councilors.questions(1)).toBe("1 question");
    expect(councilors.questions(4)).toBe("4 questions");
    expect(councilors.terms(1)).toBe("1 term");
    expect(councilors.terms(3)).toBe("3 terms");
  });

  it("会期名は文言の間に差し込み、日本語部分を分けて持つ", () => {
    expect(around(sessionBills.heading(2026))).toBe(
      "Bills submitted to [S] (2026)"
    );
    expect(around(sessionBills.period(2026, 2, 3))).toBe(
      "[S], held February–March 2026"
    );
    expect(around(sessionBills.period(2026, 6, 6))).toBe(
      "[S], held in June 2026"
    );
    expect(around(billDetail.backToSession)).toBe("Bills: [S]");
    expect(around(councilorDetail.viewSessionBills)).toBe("See bills from [S]");
  });

  it("傾向の注記は以前の会期名を括弧で挟める", () => {
    const note = councilorDetail.topicsNote(1);
    expect(`${note.before}${around(note.session)}`).toBe(
      "Based on the topic tags attached to the 1 question on this site (from [S])"
    );
  });

  it("日本語の文言は従来の表記のまま", () => {
    const ja = getUiMessages("ja");
    expect(around(ja.sessionBills.heading(2026))).toBe("2026年 [S]の提出議案");
    expect(around(ja.sessionBills.period(2026, 2, 3))).toBe(
      "2026.2月〜3月に実施された[S]"
    );
    expect(ja.councilors.terms(3)).toBe("3期");
    expect(ja.councilors.questions(4)).toBe("質問 4件");
    expect(around(ja.billDetail.backToSession)).toBe("[S]");
  });

  it("委員会の役職は日本語の3種すべてに英語がある", () => {
    expect(councilors.committeeRoles).toEqual({
      委員長: "Chair",
      副委員長: "Vice Chair",
      委員: "Member",
    });
  });
});

describe("P7-1 委員会別表示の件数", () => {
  it("英語は人数と委員会数をそれぞれ1だけ単数形にする", () => {
    const { councilors } = getUiMessages("en");
    expect(councilors.showingByCommittee(1, 1)).toBe(
      "Showing 1 councilor in 1 committee"
    );
    expect(councilors.showingByCommittee(3, 1)).toBe(
      "Showing 1 councilor in 3 committees"
    );
    expect(councilors.showingByCommittee(9, 38)).toBe(
      "Showing 38 councilors in 9 committees"
    );
  });

  it("日本語は委員会数と重複を除いた人数を並べる", () => {
    expect(getUiMessages("ja").councilors.showingByCommittee(3, 1)).toBe(
      "3委員会・1人を表示しています"
    );
  });
});
