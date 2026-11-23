import { describe, expect, it } from "vitest";
import type {
  DraftBill,
  DraftFactionStance,
  ExistingBillDetail,
  FactionMatchStatus,
} from "../types";
import {
  buildInitialOverride,
  buildReviewDiffs,
  computeDiffs,
  refreshOverride,
  refreshOverrides,
} from "./review-diffs";

const bill: DraftBill = {
  id: "b",
  billNumber: "1",
  title: "議案",
  summary: "概要",
  status: "approved",
  statusNote: null,
  submitter: null,
  sourceUrls: [],
};
const detail: ExistingBillDetail = {
  id: "existing",
  name: "議案",
  status: "approved",
  contents: { summary: "概要", content: "本文" },
  factionStances: [
    {
      factionId: "rikken",
      factionName: "立憲民主党・無所属クラブ",
      type: "against",
      comment: null,
    },
    {
      factionId: "rikken-forum",
      factionName: "新宿区議会立憲フォーラム",
      type: "neutral",
      comment: null,
    },
  ],
};
const stance: DraftFactionStance = {
  id: "s",
  billTitle: "議案",
  factionName: "立憲",
  stanceType: "for",
  comment: null,
  sourceUrls: [],
};
const matches = (id: string | null) =>
  new Map<string, FactionMatchStatus>([
    [
      "立憲",
      {
        factionName: "立憲",
        matchedFactionId: id,
        matchedDisplayName: id,
        matchedBy: id ? "alternative_name" : null,
      },
    ],
  ]);

describe("review diff refresh", () => {
  it("未一致→一致→曖昧で、同じmatch mapから既存見解を計算し直す", () => {
    const diffs = (id: string | null) =>
      buildReviewDiffs([bill], [detail], [stance], matches(id)).get(bill.id);
    expect(diffs(null)?.[0].from).toBe("（なし）");
    expect(diffs("rikken")?.[0].from).toBe("反対");
    expect(diffs("rikken-forum")?.[0].from).toBe("中立");
    expect(diffs(null)?.[0].from).toBe("（なし）");
  });
  it("再チェックでユーザーが外したチェックを保持し、新規キーだけtrueにする", () => {
    const initialDiffs = buildReviewDiffs(
      [bill],
      [detail],
      [stance],
      matches(null)
    );
    const initial = refreshOverrides(initialDiffs, new Map());
    expect(initial.get(bill.id)?.stances).toEqual({ 立憲: true });
    initial.set(bill.id, {
      updateStatus: false,
      updateContents: true,
      stances: { 立憲: false, 消滅: false },
    });
    const newStance = { ...stance, factionName: "新規" };
    const nextDiffs = buildReviewDiffs(
      [bill],
      [detail],
      [stance, newStance],
      matches("rikken")
    );
    expect(refreshOverrides(nextDiffs, initial).get(bill.id)).toEqual({
      updateStatus: false,
      updateContents: true,
      stances: { 立憲: false, 新規: true },
    });
    expect(refreshOverride([], initial.get(bill.id))).toEqual({
      updateStatus: false,
      updateContents: true,
      stances: {},
    });
  });
  it("ステータスと概要の差分・初期チェックを保持する", () => {
    const diffs = computeDiffs(
      { ...bill, status: "rejected", summary: "新概要" },
      detail,
      [],
      new Map()
    );
    expect(diffs).toEqual([
      { key: "status", label: "ステータス", from: "可決", to: "否決" },
      { key: "contents", label: "概要・本文", from: "概要", to: "新概要" },
    ]);
    expect(buildInitialOverride(diffs)).toEqual({
      updateStatus: true,
      updateContents: true,
      stances: {},
    });
  });
  it("一致する賛否・概要には差分がなく、既存議案がなければ飛ばす", () => {
    expect(
      computeDiffs(
        bill,
        detail,
        [{ ...stance, stanceType: "against" }],
        matches("rikken")
      )
    ).toEqual([]);
    expect(buildReviewDiffs([bill], [], [stance], matches(null)).size).toBe(0);
  });
  it("コメントだけの更新と欠席の表示を保持する", () => {
    expect(
      computeDiffs(
        bill,
        detail,
        [{ ...stance, stanceType: "against", comment: "理由" }],
        matches("rikken")
      )
    ).toHaveLength(1);
    expect(
      computeDiffs(
        bill,
        detail,
        [{ ...stance, stanceType: "absent" }],
        matches("rikken")
      )[0].to
    ).toBe("欠席（適用不可）");
  });
});
