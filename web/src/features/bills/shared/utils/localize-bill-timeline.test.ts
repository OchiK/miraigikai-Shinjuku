import { describe, expect, it } from "vitest";
import { type BillTimelineInput, buildBillTimeline } from "./bill-timeline";
import { localizeBillTimelineEvent } from "./localize-bill-timeline";

function localize(input: BillTimelineInput, locale: "ja" | "en") {
  return buildBillTimeline(input).map((event) =>
    localizeBillTimelineEvent(event, input, locale)
  );
}

describe("localizeBillTimelineEvent", () => {
  it("日本語表示では組み立てた文言をそのまま返す", () => {
    const input: BillTimelineInput = { status: "in_committee" };
    const events = buildBillTimeline(input);

    expect(localize(input, "ja")).toEqual(
      events.map((e) => ({
        label: e.label,
        dateLabel: e.dateLabel,
        detail: e.detail,
        detailLang: undefined,
      }))
    );
  });

  it("英語表示ではステップ名と日付ラベルを英語にする", () => {
    const events = localize({ status: "in_committee" }, "en");

    expect(events.map((e) => e.label)).toEqual([
      "Bill submitted",
      "Committee review",
      "Plenary vote",
      "Passed / Rejected",
    ]);
    expect(events.map((e) => e.dateLabel)).toEqual([
      "Date not recorded",
      "Date not recorded",
      "Date not set",
      "Date not set",
    ]);
  });

  it("議決前の肯定形と否定形は日本語と同じ組を英語にする", () => {
    const input: BillTimelineInput = { status: "plenary_session" };
    const [, , , ja] = localize(input, "ja");
    const [, , , en] = localize(input, "en");

    expect(ja.label).toBe("可決／否決");
    expect(en.label).toBe("Passed / Rejected");
  });

  it("議決済みは公式の議決用語を英語にし、status_note は日本語のまま lang を付ける", () => {
    const [, , , decision] = localize(
      { status: "approved", statusNote: "本会議で承認" },
      "en"
    );

    expect(decision.label).toBe("Approved");
    expect(decision.detail).toBe("本会議で承認");
    expect(decision.detailLang).toBe("ja");
  });

  it("委員会付託の省略は英語の説明に置き換える", () => {
    const [, committee] = localize(
      {
        status: "approved",
        statusNote: "委員会付託を省略し、本会議で原案可決",
      },
      "en"
    );

    expect(committee.dateLabel).toBe("Skipped");
    expect(committee.detail).toBe(
      "Referral to committee was skipped, and the bill was voted on at the plenary session."
    );
    expect(committee.detailLang).toBeUndefined();
  });
});
