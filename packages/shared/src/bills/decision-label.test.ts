import { describe, expect, it } from "vitest";
import {
  COMMITTEE_REFERRAL_OMITTED_NOTE,
  getBillCardStatusLabel,
  getBillStatusLabel,
  getDecisionStepLabel,
  getBillStatusVariant,
  isCommitteeReferralOmitted,
  resolveOfficialDecisionTerm,
} from "./decision-label";

describe("resolveOfficialDecisionTerm", () => {
  it("議決済みなら status_note の公式用語を拾う", () => {
    expect(
      resolveOfficialDecisionTerm({
        status: "approved",
        statusNote: "本会議で承認",
      })?.label
    ).toBe("承認");
  });

  it("「原案可決」を「可決」より先に判定する", () => {
    expect(
      resolveOfficialDecisionTerm({
        status: "approved",
        statusNote: "本会議で原案可決",
      })?.term
    ).toBe("原案可決");
  });

  it.each([
    ["本会議で不採択", "不採択"],
    ["本会議で不承認", "不承認"],
    ["本会議で不同意", "不同意"],
    ["本会議で不認定", "不認定"],
  ])(
    "否定形を肯定形として拾わない: %s",
    (statusNote, expected) => {
      expect(
        resolveOfficialDecisionTerm({ status: "rejected", statusNote })?.term
      ).toBe(expected);
    }
  );

  it.each([
    ["本会議で不承認", "dark"],
    ["本会議で不同意", "dark"],
    ["本会議で不認定", "dark"],
    ["本会議で不採択", "dark"],
  ])("否定形の variant は否決側にする: %s", (statusNote, expected) => {
    expect(
      resolveOfficialDecisionTerm({ status: "rejected", statusNote })?.variant
    ).toBe(expected);
  });

  it("肯定形と否定形が同じラベルにならない", () => {
    const pairs: [string, string][] = [
      ["本会議で承認", "本会議で不承認"],
      ["本会議で同意", "本会議で不同意"],
      ["本会議で認定", "本会議で不認定"],
      ["本会議で採択", "本会議で不採択"],
    ];

    for (const [positive, negative] of pairs) {
      const positiveTerm = resolveOfficialDecisionTerm({
        status: "approved",
        statusNote: positive,
      });
      const negativeTerm = resolveOfficialDecisionTerm({
        status: "rejected",
        statusNote: negative,
      });

      expect(positiveTerm?.label).not.toBe(negativeTerm?.label);
    }
  });

  it("審議中のステータスでは status_note を参照しない", () => {
    expect(
      resolveOfficialDecisionTerm({
        status: "in_committee",
        statusNote: "本会議で可決予定",
      })
    ).toBeNull();
  });

  it("status_note が無い・空白のみなら null を返す", () => {
    expect(
      resolveOfficialDecisionTerm({ status: "approved", statusNote: null })
    ).toBeNull();
    expect(
      resolveOfficialDecisionTerm({ status: "approved", statusNote: "   " })
    ).toBeNull();
  });

  it("既知の用語を含まない status_note は拾わない", () => {
    expect(
      resolveOfficialDecisionTerm({
        status: "approved",
        statusNote: "委員会に付託",
      })
    ).toBeNull();
  });
});

describe("getBillStatusLabel", () => {
  it("不承認を「承認」と表示しない", () => {
    expect(
      getBillStatusLabel({ status: "rejected", statusNote: "本会議で不承認" })
    ).toBe("不承認");
  });

  it("専決処分の承認を「可決」ではなく「承認」と表示する", () => {
    expect(
      getBillStatusLabel({ status: "approved", statusNote: "本会議で承認" })
    ).toBe("承認");
  });

  it("原案可決は従来どおり「可決」と表示する", () => {
    expect(
      getBillStatusLabel({ status: "approved", statusNote: "本会議で原案可決" })
    ).toBe("可決");
  });

  it.each([
    ["preparing", "準備中"],
    ["submitted", "上程済み"],
    ["in_committee", "委員会審査中"],
    ["plenary_session", "本会議採決中"],
    ["approved", "可決"],
    ["rejected", "否決"],
    ["adopted", "採択"],
    ["partially_adopted", "趣旨採択"],
    ["reported", "専決処分報告"],
  ])("status_note が無ければ列挙から引く: %s", (status, expected) => {
    expect(getBillStatusLabel({ status })).toBe(expected);
  });

  it("未知のステータスはそのまま返す", () => {
    expect(getBillStatusLabel({ status: "unknown_status" })).toBe(
      "unknown_status"
    );
  });
});

describe("getBillCardStatusLabel", () => {
  it("専決処分の承認を「承認」と表示する", () => {
    expect(
      getBillCardStatusLabel({ status: "approved", statusNote: "本会議で承認" })
    ).toBe("承認");
  });

  it.each([
    ["submitted", "議会審議中"],
    ["in_committee", "議会審議中"],
    ["plenary_session", "議会審議中"],
    ["approved", "可決"],
    ["rejected", "否決"],
    ["preparing", "議案上程前"],
  ])("status_note が無ければ簡略ラベルを返す: %s", (status, expected) => {
    expect(getBillCardStatusLabel({ status })).toBe(expected);
  });
});

describe("getBillStatusVariant", () => {
  it("承認は可決と同じ variant を使う", () => {
    expect(
      getBillStatusVariant({ status: "approved", statusNote: "本会議で承認" })
    ).toBe("default");
  });

  it("不採択は否決と同じ variant を使う", () => {
    expect(
      getBillStatusVariant({ status: "rejected", statusNote: "本会議で不採択" })
    ).toBe("dark");
  });

  it.each([
    ["submitted", "light"],
    ["in_committee", "light"],
    ["plenary_session", "light"],
    ["approved", "default"],
    ["reported", "default"],
    ["rejected", "dark"],
    ["preparing", "muted"],
  ])("status_note が無ければ列挙から引く: %s", (status, expected) => {
    expect(getBillStatusVariant({ status })).toBe(expected);
  });
});

describe("getDecisionStepLabel", () => {
  it("専決処分の承認は「承認／不承認」を返す", () => {
    expect(
      getDecisionStepLabel({ status: "approved", statusNote: "本会議で承認" })
    ).toEqual({ positive: "承認", negative: "不承認" });
  });

  it("不承認でも「承認／不承認」の組を返す（否定形を肯定形として拾わない）", () => {
    expect(
      getDecisionStepLabel({ status: "rejected", statusNote: "本会議で不承認" })
    ).toEqual({ positive: "承認", negative: "不承認" });
  });

  it("原案可決の議案は従来どおり「可決／否決」を返す", () => {
    expect(
      getDecisionStepLabel({
        status: "approved",
        statusNote: "本会議で原案可決",
      })
    ).toEqual({ positive: "可決", negative: "否決" });
  });

  it("status_note が無ければ「可決／否決」にフォールバックする", () => {
    expect(getDecisionStepLabel({ status: "approved" })).toEqual({
      positive: "可決",
      negative: "否決",
    });
    expect(
      getDecisionStepLabel({ status: "approved", statusNote: "   " })
    ).toEqual({ positive: "可決", negative: "否決" });
  });

  it("専決処分報告は「可決／否決」にフォールバックする（現状の挙動を固定）", () => {
    // reported は現在のデータには存在しない。専決処分の「報告」は議決を伴わないため
    // 本来は可決／否決のいずれでもないが、専用の文言は決まっていない。
    // 意図せず変わらないよう、現状のフォールバックをここで固定しておく。
    expect(
      getDecisionStepLabel({ status: "reported", statusNote: "専決処分報告" })
    ).toEqual({ positive: "可決", negative: "否決" });
  });

  it("審議中は status_note に用語があってもフォールバックする", () => {
    expect(
      getDecisionStepLabel({ status: "in_committee", statusNote: "承認予定" })
    ).toEqual({ positive: "可決", negative: "否決" });
  });

  it("趣旨採択は「採択／不採択」を返す（修正可決は「可決／否決」）", () => {
    // 用語ごとに組を持たせているので、ラベルが「趣旨採択」「修正可決」のように
    // 肯定形そのものでない用語でも、正しい対に落ちる。
    expect(
      getDecisionStepLabel({
        status: "partially_adopted",
        statusNote: "本会議で趣旨採択",
      })
    ).toEqual({ positive: "採択", negative: "不採択" });
    expect(
      getDecisionStepLabel({ status: "approved", statusNote: "本会議で修正可決" })
    ).toEqual({ positive: "可決", negative: "否決" });
  });

  it("採択・同意・認定もそれぞれの組を返す", () => {
    expect(
      getDecisionStepLabel({ status: "adopted", statusNote: "本会議で採択" })
    ).toEqual({ positive: "採択", negative: "不採択" });
    expect(
      getDecisionStepLabel({ status: "approved", statusNote: "本会議で同意" })
    ).toEqual({ positive: "同意", negative: "不同意" });
    expect(
      getDecisionStepLabel({ status: "approved", statusNote: "本会議で認定" })
    ).toEqual({ positive: "認定", negative: "不認定" });
  });
});

describe("isCommitteeReferralOmitted", () => {
  it("status_note に委員会付託の省略があれば true", () => {
    expect(
      isCommitteeReferralOmitted(
        `${COMMITTEE_REFERRAL_OMITTED_NOTE}本会議で原案可決`
      )
    ).toBe(true);
  });

  it("省略の記載が無い・空のときは false", () => {
    expect(isCommitteeReferralOmitted("本会議で原案可決")).toBe(false);
    expect(isCommitteeReferralOmitted(null)).toBe(false);
    expect(isCommitteeReferralOmitted(undefined)).toBe(false);
  });

  it("省略して可決しても、議決用語は原案可決として読める", () => {
    expect(
      getBillStatusLabel({
        status: "approved",
        statusNote: `${COMMITTEE_REFERRAL_OMITTED_NOTE}本会議で原案可決`,
      })
    ).toBe("可決");
  });
});
