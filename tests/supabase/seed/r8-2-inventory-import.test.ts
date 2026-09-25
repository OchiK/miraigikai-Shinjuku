import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createBillContents } from "../../../packages/seed/main/bill-contents-data";
import {
  buildItemKey,
  r8SecondSessionItems,
  toBillInsert,
} from "../../../packages/seed/main/shinjuku-r8-2-inventory";
import { adminClient, cleanupTestCouncilSession } from "../utils";

/**
 * 令和8年第2回定例会インベントリの取り込み挙動を、実際のローカル Supabase に対して検証する。
 *
 * 検証の主眼:
 *   1. 件名が重複する承認第2号・第3号が取り違えなく別レコードとして入ること
 *   2. 同じ取り込みを繰り返しても件数が増えず、関連付けもずれないこと
 *   3. 安定識別子（slug）の一意制約が重複投入を実際に拒否すること
 *   4. 公式出典URLがDBへ保存され、再取り込み後も維持されること
 *
 * seed 済みのデータには一切触れず、テスト専用の定例会と議案のみを作成・削除する。
 */

/**
 * テスト実行ごとに一意な接頭辞を付け、seed データや並行実行と衝突させない。
 *
 * bill_number にも接頭辞が必要なのは、`bills_bill_number_unique` が
 * 会期をまたいだグローバルな部分一意インデックスであり、
 * seed 済みの「第42号議案」等とそのままでは衝突するため。
 */
const runId = `itest-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const testSlug = (item: (typeof r8SecondSessionItems)[number]) =>
  `${runId}-${buildItemKey(item)}`;
const testBillNumber = (item: (typeof r8SecondSessionItems)[number]) =>
  `${runId}-${item.officialLabel}`;

describe("令和8年第2回定例会インベントリの取り込み", () => {
  let sessionId: string;

  const importInventory = async () => {
    // 本番の変換ロジック（toBillInsert）をそのまま通し、
    // テスト隔離に必要な識別子だけを上書きする。
    const rows = r8SecondSessionItems.map((item) => ({
      ...toBillInsert(item),
      bill_number: testBillNumber(item),
      slug: testSlug(item),
      council_session_id: sessionId,
    }));

    const { data, error } = await adminClient
      .from("bills")
      .upsert(rows, { onConflict: "slug" })
      .select("id, name, slug");

    if (error) throw new Error(`取り込み失敗: ${error.message}`);
    return data ?? [];
  };

  const fetchImported = async () => {
    const { data, error } = await adminClient
      .from("bills")
      .select(
        "id, name, bill_number, slug, status_note, publish_status, overview_pdf_url, source_page_url, decision_source_url"
      )
      .eq("council_session_id", sessionId);
    if (error) throw new Error(error.message);
    return data ?? [];
  };

  beforeEach(async () => {
    const { data, error } = await adminClient
      .from("council_sessions")
      .insert({
        name: `テスト令和8年第2回定例会 ${runId}`,
        slug: `${runId}-session`,
        start_date: "2026-06-10",
        end_date: "2026-06-19",
        is_active: false,
      })
      .select("id")
      .single();
    if (error) throw new Error(`定例会作成失敗: ${error.message}`);
    sessionId = data.id;
  });

  afterEach(async () => {
    // bills は council_session への FK 経由では消えないため明示的に削除する
    await adminClient
      .from("bills")
      .delete()
      .eq("council_session_id", sessionId);
    await cleanupTestCouncilSession(sessionId);
  });

  it("27件（区長提出23件＋議員提出4件）すべてが欠落・重複なく取り込まれる", async () => {
    await importInventory();
    const imported = await fetchImported();

    expect(imported).toHaveLength(27);

    const labels = imported.map((b) => b.bill_number).sort();
    const expected = r8SecondSessionItems.map(testBillNumber).sort();
    expect(labels).toEqual(expected);
    expect(new Set(imported.map((b) => b.slug)).size).toBe(27);
  });

  it("件名が同一の承認第2号・第3号が別レコードとして区別される", async () => {
    await importInventory();
    const imported = await fetchImported();

    const shonin = imported.filter((b) => b.name === "専決処分の承認について");
    expect(shonin).toHaveLength(2);
    expect(shonin.map((b) => b.bill_number).sort()).toEqual([
      `${runId}-承認第2号`,
      `${runId}-承認第3号`,
    ]);
    expect(new Set(shonin.map((b) => b.id)).size).toBe(2);

    const bySlug = (n: number) =>
      shonin.find((b) => b.slug === `${runId}-shinjuku-2026-r2-shonin-${n}`);
    expect(bySlug(2)?.bill_number).toBe(`${runId}-承認第2号`);
    expect(bySlug(3)?.bill_number).toBe(`${runId}-承認第3号`);
  });

  it("承認案件と議案で議決用語が区別される", async () => {
    await importInventory();
    const imported = await fetchImported();

    const noteFor = (label: string) =>
      imported.find((b) => b.bill_number === `${runId}-${label}`)?.status_note;

    expect(noteFor("承認第2号")).toBe("本会議で承認");
    expect(noteFor("承認第3号")).toBe("本会議で承認");
    expect(noteFor("第42号議案")).toBe("本会議で原案可決");
    expect(noteFor("第62号議案")).toBe("本会議で原案可決");
  });

  it("同じ取り込みを繰り返しても件数が増えず id も維持される", async () => {
    await importInventory();
    const first = await fetchImported();

    await importInventory();
    const second = await fetchImported();

    expect(second).toHaveLength(27);

    const idBySlug = (rows: typeof first) =>
      Object.fromEntries(rows.map((b) => [b.slug, b.id]));
    expect(idBySlug(second)).toEqual(idBySlug(first));
  });

  it("公式出典URLが保存され、再取り込み後も正確に維持される", async () => {
    await importInventory();
    await importInventory();
    const imported = await fetchImported();

    for (const item of r8SecondSessionItems) {
      const stored = imported.find((bill) => bill.slug === testSlug(item));
      const expected = toBillInsert(item);

      expect(stored).toMatchObject({
        overview_pdf_url: expected.overview_pdf_url,
        source_page_url: expected.source_page_url,
        decision_source_url: expected.decision_source_url,
      });
    }
  });

  it("再取り込み後も解説が正しい議案に結び付く", async () => {
    await importInventory();
    const first = await fetchImported();
    await importInventory();
    const second = await fetchImported();

    // createBillContents は接頭辞なしの slug を期待するため、比較用に付け替える
    const stripPrefix = (rows: typeof first) =>
      rows.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug?.replace(`${runId}-`, "") ?? null,
      }));

    const before = createBillContents(stripPrefix(first));
    const after = createBillContents(stripPrefix(second));

    expect(after.map((c) => c.bill_id)).toEqual(before.map((c) => c.bill_id));

    // 第53号議案の解説が第53号議案に紐づいていること
    const gian53 = second.find(
      (b) => b.slug === `${runId}-shinjuku-2026-r2-gian-53`
    );
    expect(
      after.filter((c) => c.bill_id === gian53?.id).length
    ).toBeGreaterThan(0);
  });

  it("同一 slug の二重登録は一意制約で拒否される", async () => {
    await importInventory();

    const { error } = await adminClient.from("bills").insert({
      name: "専決処分の承認について",
      bill_number: `${runId}-duplicate-slug-probe`,
      slug: `${runId}-shinjuku-2026-r2-shonin-2`,
      status: "approved",
      publish_status: "coming_soon",
      council_session_id: sessionId,
    });

    expect(error).not.toBeNull();
    expect(error?.code).toBe("23505");
    expect(await fetchImported()).toHaveLength(27);
  });
});
