import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  adminClient,
  cleanupTestBill,
  cleanupTestCouncilSession,
  createTestBill,
  createTestCouncilSession,
} from "../utils";

/** 数字を含まない bill_number を末尾へ送るための番兵値 */
const NO_NUMBER = 2147483647;
/** 7桁以上の bill_number を末尾へ送るための番兵値 */
const TOO_LARGE = 2147483646;

/**
 * bills.bill_number_order（generated column）の検証。
 *
 * 一覧の並び順は (status_order, published_at, bill_number_order) で決まる。
 * 同一会期の議案は published_at が全件同一になるため、
 * 実質この列だけが並びを決めている。アプリ層のユニットテストでは
 * 生成式の誤りを検出できないため、DBに実際に入れて確かめる。
 */
describe("bills.bill_number_order", () => {
  let sessionId: string;
  const billIds: string[] = [];

  beforeEach(async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const session = await createTestCouncilSession({
      name: `番号順テスト会期 ${suffix}`,
      slug: `bill-number-order-${suffix}`,
    });
    sessionId = session.id;
  });

  afterEach(async () => {
    for (const billId of billIds) {
      await cleanupTestBill(billId);
    }
    billIds.length = 0;
    await cleanupTestCouncilSession(sessionId);
  });

  async function insertBill(billNumber: string) {
    const bill = await createTestBill({
      name: `番号順テスト議案 ${billNumber || "番号なし"}`,
      bill_number: billNumber,
      council_session_id: sessionId,
      status: "approved",
      publish_status: "published",
    });
    billIds.push(bill.id);
    return bill;
  }

  it("議案番号の数値部分を取り出す", async () => {
    const bill = await insertBill("第42号議案");

    expect(bill.bill_number_order).toBe(42);
  });

  it("承認番号も同じ規則で数値化する", async () => {
    const bill = await insertBill("承認第2号");

    expect(bill.bill_number_order).toBe(2);
  });

  it("桁数の異なる番号を数値として比較できる", async () => {
    // 文字列の昇順では「第10号議案」＜「第2号議案」となり番号順にならない。
    const ten = await insertBill("第10号議案");
    const two = await insertBill("第2号議案");

    expect(two.bill_number_order).toBeLessThan(ten.bill_number_order ?? 0);
  });

  it("全角数字の議案番号も半角と同じ値になる", async () => {
    // bill_number は Admin で自由入力でき、行政文書の表記がそのまま入りうる。
    const zenkaku = await insertBill("第４２号議案");

    expect(zenkaku.bill_number_order).toBe(42);
  });

  it("番号以外の数字は順序に混ぜない", async () => {
    // 文字列中の数字を全部つなげると 422 になり、第43号議案より後ろへ回る。
    const bill = await insertBill("第42号議案の2");

    expect(bill.bill_number_order).toBe(42);
  });

  it("数字を含まない番号は末尾に送る", async () => {
    const noDigits = await insertBill("議案番号未定");
    const numbered = await insertBill("第1号議案");

    expect(noDigits.bill_number_order).toBe(NO_NUMBER);
    expect(numbered.bill_number_order).toBeLessThan(
      noDigits.bill_number_order ?? 0
    );
  });

  it("bill_number が空文字でも INSERT できて末尾に送られる", async () => {
    const bill = await insertBill("");

    expect(bill.bill_number_order).toBe(NO_NUMBER);
  });

  it("7桁以上の番号は桁を切り詰めず末尾に送る", async () => {
    // int の範囲を超えると INSERT 自体が落ちるので上限が要る。
    // ただし桁で切り詰めると「第1000000号」が 100000 になり、
    // 6桁の「第200000号」より前へ出てしまう。
    const huge = await insertBill("第1000000号議案");
    const sixDigits = await insertBill("第200000号議案");

    expect(huge.bill_number_order).toBe(TOO_LARGE);
    expect(sixDigits.bill_number_order).toBe(200000);
    expect(sixDigits.bill_number_order).toBeLessThan(
      huge.bill_number_order ?? 0
    );
  });

  it("bill_number_order の昇順で議案番号順に並ぶ", async () => {
    await insertBill("第10号議案");
    await insertBill("承認第1号");
    await insertBill("第2号議案");
    await insertBill("第100号議案");

    const { data, error } = await adminClient
      .from("bills")
      .select("bill_number")
      .eq("council_session_id", sessionId)
      .order("bill_number_order", { ascending: true });

    expect(error).toBeNull();
    expect(data?.map((b) => b.bill_number)).toEqual([
      "承認第1号",
      "第2号議案",
      "第10号議案",
      "第100号議案",
    ]);
  });
});
