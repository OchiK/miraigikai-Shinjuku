import { describe, expect, it } from "vitest";
import { buildBillTimeline } from "./bill-timeline";

describe("buildBillTimeline", () => {
  it("上程前は4件すべてが未到達になる", () => {
    const timeline = buildBillTimeline({ status: "preparing" });

    expect(timeline.map((e) => e.key)).toEqual([
      "submitted",
      "in_committee",
      "plenary_session",
      "decision",
    ]);
    expect(timeline.every((e) => e.state === "upcoming")).toBe(true);
    expect(timeline.every((e) => e.dateLabel === "日付未定")).toBe(true);
  });

  it("委員会審査中は、通過済みを done、現在地を current にする", () => {
    const timeline = buildBillTimeline({ status: "in_committee" });

    expect(timeline.map((e) => e.state)).toEqual([
      "done",
      "current",
      "upcoming",
      "upcoming",
    ]);
    expect(timeline.map((e) => e.dateLabel)).toEqual([
      "日付未登録",
      "日付未登録",
      "日付未定",
      "日付未定",
    ]);
  });

  it("議決前の最終ステップは、肯定形と否定形を併記する", () => {
    const timeline = buildBillTimeline({ status: "submitted" });
    const decision = timeline.at(-1);

    expect(decision?.label).toBe("可決／否決");
    expect(decision?.detail).toBeUndefined();
  });

  it("議決済みの最終ステップは、公式の議決用語を出す", () => {
    const timeline = buildBillTimeline({
      status: "approved",
      statusNote: "本会議で承認",
    });
    const decision = timeline.at(-1);

    expect(decision?.state).toBe("current");
    expect(decision?.label).toBe("承認");
    expect(decision?.detail).toBe("本会議で承認");
    expect(decision?.dateLabel).toBe("日付未登録");
  });

  it("否決の議案を可決と表示しない", () => {
    const timeline = buildBillTimeline({
      status: "rejected",
      statusNote: "本会議で否決",
    });

    expect(timeline.at(-1)?.label).toBe("否決");
  });

  it("議決用語が status_note から取れない場合は列挙のラベルに落とす", () => {
    const timeline = buildBillTimeline({
      status: "approved",
      statusNote: null,
    });

    expect(timeline.at(-1)?.label).toBe("可決");
    expect(timeline.at(-1)?.detail).toBeUndefined();
  });

  it("空白だけの status_note は補足として出さない", () => {
    const timeline = buildBillTimeline({
      status: "approved",
      statusNote: "  ",
    });

    expect(timeline.at(-1)?.detail).toBeUndefined();
  });
});

describe("委員会付託を省略した議案", () => {
  const statusNote = "委員会付託を省略し、本会議で原案可決";

  it("「委員会での審査」を日付未登録ではなく省略として示す", () => {
    const committee = buildBillTimeline({
      status: "approved",
      statusNote,
    }).find((e) => e.key === "in_committee");

    expect(committee?.dateLabel).toBe("省略");
    expect(committee?.detail).toBe("委員会への付託を省略し、本会議で採決");
  });

  it("議決の見出しは status_note の議決用語のまま", () => {
    const decision = buildBillTimeline({ status: "approved", statusNote }).at(
      -1
    );

    expect(decision?.label).toBe("可決");
  });

  it("付託の省略が無い議案は、委員会のステップを従来どおり示す", () => {
    const committee = buildBillTimeline({
      status: "rejected",
      statusNote: "本会議で否決",
    }).find((e) => e.key === "in_committee");

    expect(committee?.dateLabel).toBe("日付未登録");
    expect(committee?.detail).toBeUndefined();
  });
});
