import { describe, expect, it } from "vitest";
import { buildComingSoonBillHeading } from "./build-coming-soon-bill-heading";

describe("buildComingSoonBillHeading", () => {
  it("解説のタイトルがあれば主見出しにし、正式名称を併記する", () => {
    expect(
      buildComingSoonBillHeading({
        name: "新宿区印鑑条例等の一部を改正する条例",
        bill_number: "第49号議案",
        title: "特定在留カード等をコンビニ交付の必要書類に追加する条例改正",
      })
    ).toEqual({
      identifier: "第49号議案",
      title: "特定在留カード等をコンビニ交付の必要書類に追加する条例改正",
      officialName: "新宿区印鑑条例等の一部を改正する条例",
    });
  });

  it("解説のタイトルが無ければ正式名称を主見出しにし、併記はしない", () => {
    expect(
      buildComingSoonBillHeading({
        name: "専決処分の承認について",
        bill_number: "承認第2号",
        title: null,
      })
    ).toEqual({
      identifier: "承認第2号",
      title: "専決処分の承認について",
      officialName: null,
    });
  });

  it("件名が完全に一致する承認案件を識別名で区別できる", () => {
    const shonin2 = buildComingSoonBillHeading({
      name: "専決処分の承認について",
      bill_number: "承認第2号",
      title: null,
    });
    const shonin3 = buildComingSoonBillHeading({
      name: "専決処分の承認について",
      bill_number: "承認第3号",
      title: null,
    });

    expect(shonin2.title).toBe(shonin3.title);
    expect(shonin2.identifier).not.toBe(shonin3.identifier);
  });

  it("識別名が無い議案は identifier を null にする", () => {
    expect(
      buildComingSoonBillHeading({
        name: "専決処分の承認について",
        bill_number: null,
        title: null,
      }).identifier
    ).toBeNull();
  });

  it("空文字や空白だけの識別名・タイトルは値として扱わない", () => {
    expect(
      buildComingSoonBillHeading({
        name: "正式名称",
        bill_number: "   ",
        title: "",
      })
    ).toEqual({
      identifier: null,
      title: "正式名称",
      officialName: null,
    });
  });

  it("解説のタイトルが正式名称と同じなら併記しない", () => {
    expect(
      buildComingSoonBillHeading({
        name: "同じ名前",
        bill_number: "第1号議案",
        title: "同じ名前",
      }).officialName
    ).toBeNull();
  });
});
