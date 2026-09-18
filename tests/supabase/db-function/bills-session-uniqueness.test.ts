import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  adminClient,
  cleanupTestCouncilSession,
  createTestCouncilSession,
} from "../utils";

describe("bills の会期別 bill_number 一意性", () => {
  let sessionAId: string;
  let sessionBId: string;
  const billIds: string[] = [];
  let billNumber: string;

  beforeEach(async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const sessionA = await createTestCouncilSession({
      name: `一意性テスト会期A ${suffix}`,
      slug: `uniqueness-session-a-${suffix}`,
    });
    const sessionB = await createTestCouncilSession({
      name: `一意性テスト会期B ${suffix}`,
      slug: `uniqueness-session-b-${suffix}`,
    });
    sessionAId = sessionA.id;
    sessionBId = sessionB.id;
    billNumber = `一意性テスト第1号-${suffix}`;
  });

  afterEach(async () => {
    if (billIds.length > 0) {
      await adminClient.from("bills").delete().in("id", billIds);
      billIds.length = 0;
    }
    await cleanupTestCouncilSession(sessionAId);
    await cleanupTestCouncilSession(sessionBId);
  });

  async function insertBill(councilSessionId: string | null, number: string) {
    const result = await adminClient
      .from("bills")
      .insert({
        name: `一意性テスト議案 ${number || "番号未設定"}`,
        bill_number: number,
        council_session_id: councilSessionId,
        status: "submitted",
        publish_status: "draft",
      })
      .select("id")
      .single();

    if (result.data) billIds.push(result.data.id);
    return result;
  }

  it("異なる会期では同じ議案番号を登録できる", async () => {
    const first = await insertBill(sessionAId, billNumber);
    const second = await insertBill(sessionBId, billNumber);

    expect(first.error).toBeNull();
    expect(second.error).toBeNull();
  });

  it("同じ会期では同じ議案番号を登録できない", async () => {
    const first = await insertBill(sessionAId, billNumber);
    const duplicate = await insertBill(sessionAId, billNumber);

    expect(first.error).toBeNull();
    expect(duplicate.error?.code).toBe("23505");
  });

  it("空文字の議案番号は同じ会期でも複数登録できる", async () => {
    const first = await insertBill(sessionAId, "");
    const second = await insertBill(sessionAId, "");

    expect(first.error).toBeNull();
    expect(second.error).toBeNull();
  });

  it("会期未割り当てでは同じ議案番号を登録できない", async () => {
    const first = await insertBill(null, billNumber);
    const duplicate = await insertBill(null, billNumber);

    expect(first.error).toBeNull();
    expect(duplicate.error?.code).toBe("23505");
  });

  it("移動先の会期に同じ議案番号がある場合は会期を変更できない", async () => {
    const first = await insertBill(sessionAId, billNumber);
    const second = await insertBill(sessionBId, billNumber);
    expect(first.error).toBeNull();
    expect(second.error).toBeNull();

    const { error } = await adminClient
      .from("bills")
      .update({ council_session_id: sessionAId })
      .eq("id", second.data?.id ?? "");

    expect(error?.code).toBe("23505");
  });
});
