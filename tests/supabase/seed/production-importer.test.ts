import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  billContentsWithBillSlug,
  createBillContents,
} from "../../../packages/seed/main/bill-contents-data";
import type { SeededBillRef } from "../../../packages/seed/main/bill-ref";
import {
  committees,
  createBillsTags,
  factions,
  tags,
} from "../../../packages/seed/main/data";
import { councilMembers } from "../../../packages/seed/main/shinjuku-council-members";
import {
  R8_2_SESSION,
  r8SecondSessionItems,
  toBillInserts,
} from "../../../packages/seed/main/shinjuku-r8-2-inventory";
import type { ImportDataset } from "../../../packages/seed/production/importer";
import { importInventory } from "../../../packages/seed/production/importer";
import { adminClient, cleanupTestUser, createTestUser } from "../utils";

/**
 * 本番用インポーターを、実際のローカル Supabase に対して検証する。
 *
 * 押さえる点:
 *   1. 初回インポートで全23案件・69変種が投入されること
 *   2. 2回目以降も bills.id が変わらないこと（詳細ページURLと
 *      interview_configs の CASCADE を守るため、ここが最重要）
 *   3. 利用者データ（interview_sessions / interview_report）が消えないこと
 *   4. 解説の更新が同一の (bill_id, difficulty_level) に当たること
 *   5. インベントリ外の議案を削除せず、報告だけ行うこと
 *
 * seed 済みのデータや他テストと衝突しないよう、実行ごとに一意な接頭辞を
 * 付けた複製インベントリ（ImportDataset）を流し込む。変換ロジックそのものは
 * 本番と同じ関数を通す。
 */

const runId = `itest-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const sessionSlug = `${runId}-${R8_2_SESSION.slug}`;

/**
 * 接頭辞を付けた複製インベントリを組み立てる。
 * 変換ロジックは本番と同じ関数を通し、識別子だけを名前空間で隔離する。
 */
function buildDataset(idPrefix: string): ImportDataset {
  const prefixed = (value: string) => `${idPrefix}-${value}`;
  const stripped = (value: string) => value.replace(`${idPrefix}-`, "");

  /** 接頭辞付きの slug を元に戻し、本番の生成関数へそのまま渡せるようにする */
  const toInventoryRefs = (bills: SeededBillRef[]): SeededBillRef[] =>
    bills.map((bill) => ({
      ...bill,
      slug: bill.slug ? stripped(bill.slug) : null,
    }));

  const prefixedCommittees = committees.map((committee) => ({
    ...committee,
    name: prefixed(committee.name),
  }));
  const prefixedFactions = factions.map((faction) => ({
    ...faction,
    name: prefixed(faction.name),
    display_name: prefixed(faction.display_name),
  }));
  const prefixedCouncilMembers = councilMembers.map((member) => ({
    ...member,
    name: prefixed(member.name),
    faction: prefixed(member.faction),
    committees: Object.fromEntries(
      Object.entries(member.committees).map(([name, role]) => [
        prefixed(name),
        role,
      ])
    ),
  }));

  return {
    councilSessions: [
      {
        ...R8_2_SESSION,
        name: `テスト ${R8_2_SESSION.name} ${idPrefix}`,
        slug: prefixed(R8_2_SESSION.slug as string),
        // seed 済みの会期と「現在の会期」を取り合わないようにする
        is_active: false,
      },
    ],
    billSessionSlug: prefixed(R8_2_SESSION.slug as string),
    tags: tags.map((tag) => ({ ...tag, label: prefixed(tag.label) })),
    factions: prefixedFactions,
    committees: prefixedCommittees,
    councilRosterKey: idPrefix,
    councilRosterUrl: `https://example.com/council-roster/${idPrefix}`,
    councilMembers: prefixedCouncilMembers,
    // bill_number は会期単位で一意なため、テスト会期の中では接頭辞が要らない
    bills: toBillInserts().map((bill) => ({
      ...bill,
      slug: prefixed(bill.slug as string),
    })),
    createBillContents: (bills) => createBillContents(toInventoryRefs(bills)),
    createBillsTags: (bills, tagRefs) =>
      createBillsTags(
        toInventoryRefs(bills),
        tagRefs.map((tag) => ({ ...tag, label: stripped(tag.label) }))
      ),
  };
}

const dataset = buildDataset(runId);

const runImport = (dryRun = false) =>
  importInventory(adminClient, { dryRun, dataset });

const fetchBills = async () => {
  const { data, error } = await adminClient
    .from("bills")
    .select("id, slug, name, bill_number, publish_status, published_at")
    .eq("council_session_id", sessionId);
  if (error) throw new Error(error.message);
  return data ?? [];
};

const fetchContents = async (billIds: string[]) => {
  const { data, error } = await adminClient
    .from("bill_contents")
    .select("id, bill_id, difficulty_level, title, content")
    .in("bill_id", billIds);
  if (error) throw new Error(error.message);
  return data ?? [];
};

let sessionId: string;
/** 利用者データ層が消えないことを確かめるための、テスト専用の実データ */
let userData: {
  userId: string;
  billId: string;
  configId: string;
  interviewSessionId: string;
  reportId: string;
};

describe("本番用インポーター", () => {
  beforeAll(async () => {
    await runImport();

    const { data, error } = await adminClient
      .from("council_sessions")
      .select("id")
      .eq("slug", sessionSlug)
      .single();
    if (error) throw new Error(`会期の取得に失敗: ${error.message}`);
    sessionId = data.id;

    // 議案にぶら下がる利用者データを作る。
    // bills を削除して作り直す実装だと、ここが CASCADE で消える。
    const bills = await fetchBills();
    const billId = bills[0]?.id;
    if (!billId) throw new Error("議案が投入されていない");

    const { data: config, error: configError } = await adminClient
      .from("interview_configs")
      .insert({
        bill_id: billId,
        status: "public",
        name: `テスト設定 ${runId}`,
      })
      .select("id")
      .single();
    if (configError) throw new Error(configError.message);

    const testUser = await createTestUser(`test-import-${runId}@example.com`);

    const { data: interviewSession, error: sessionError } = await adminClient
      .from("interview_sessions")
      .insert({
        interview_config_id: config.id,
        user_id: testUser.id,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (sessionError) throw new Error(sessionError.message);

    const { data: report, error: reportError } = await adminClient
      .from("interview_report")
      .insert({
        interview_session_id: interviewSession.id,
        summary: `テストレポート ${runId}`,
      })
      .select("id")
      .single();
    if (reportError) throw new Error(reportError.message);

    userData = {
      userId: testUser.id,
      billId,
      configId: config.id,
      interviewSessionId: interviewSession.id,
      reportId: report.id,
    };
  });

  afterAll(async () => {
    // beforeAll が途中で失敗した場合、sessionId は未設定のままになる。
    // undefined で削除条件を組むとテストデータがローカルDBに残るため、
    // slug（runId 付き）を起点に掃除する。
    if (sessionId) {
      // bills の削除で interview_configs 以下は CASCADE で落ちる
      await adminClient
        .from("bills")
        .delete()
        .eq("council_session_id", sessionId);
    }
    await adminClient.from("council_sessions").delete().eq("slug", sessionSlug);
    await adminClient
      .from("tags")
      .delete()
      .in(
        "label",
        dataset.tags.map((tag) => tag.label)
      );
    await adminClient
      .from("council_members")
      .delete()
      .in(
        "name",
        dataset.councilMembers.map((member) => member.name)
      );
    await adminClient
      .from("committees")
      .delete()
      .in(
        "name",
        dataset.committees.map((committee) => committee.name)
      );
    await adminClient
      .from("factions")
      .delete()
      .in(
        "name",
        dataset.factions.map((faction) => faction.name)
      );
    if (userData?.userId) await cleanupTestUser(userData.userId);
  });

  it("初回インポートで全23案件・69変種が投入される", async () => {
    const bills = await fetchBills();
    expect(bills).toHaveLength(r8SecondSessionItems.length);
    expect(bills).toHaveLength(23);

    const contents = await fetchContents(bills.map((b) => b.id));
    expect(contents).toHaveLength(billContentsWithBillSlug.length);
    expect(contents).toHaveLength(69);
  });

  it("初回インポートで議員38名と委員会所属87件を投入する", async () => {
    const memberNames = dataset.councilMembers.map((member) => member.name);
    const { data: members, error: membersError } = await adminClient
      .from("council_members")
      .select("id, name")
      .in("name", memberNames);
    if (membersError) throw new Error(membersError.message);
    expect(members).toHaveLength(38);

    const { count, error: linksError } = await adminClient
      .from("council_member_committees")
      .select("id, council_members!inner(name)", {
        count: "exact",
        head: true,
      })
      .in("council_members.name", memberNames);
    if (linksError) throw new Error(linksError.message);
    expect(count).toBe(87);
  });

  it("再インポートしても council_members.id が変わらない", async () => {
    const memberNames = dataset.councilMembers.map((member) => member.name);
    const fetchMembers = async () => {
      const { data, error } = await adminClient
        .from("council_members")
        .select("id, name")
        .in("name", memberNames)
        .order("name");
      if (error) throw new Error(error.message);
      return data ?? [];
    };

    const before = await fetchMembers();
    await runImport();
    expect(await fetchMembers()).toEqual(before);
  });

  it("名簿から外れた議員を削除せず非現職にする", async () => {
    const removed = dataset.councilMembers[0];
    if (!removed) throw new Error("議員データがない");

    const { data: before, error: beforeError } = await adminClient
      .from("council_members")
      .select("id")
      .eq("name", removed.name)
      .single();
    if (beforeError) throw new Error(beforeError.message);

    const report = await importInventory(adminClient, {
      dryRun: false,
      dataset: {
        ...dataset,
        councilRosterUrl: `${dataset.councilRosterUrl}/moved`,
        councilMembers: dataset.councilMembers.slice(1),
      },
    });

    const memberDiff = report.tables.find(
      (table) => table.table === "council_members"
    );
    expect(memberDiff?.updated).toContainEqual(
      expect.objectContaining({
        key: removed.name,
        changes: expect.arrayContaining([
          { field: "is_active", before: true, after: false },
        ]),
      })
    );

    const { data: after, error: afterError } = await adminClient
      .from("council_members")
      .select("id, is_active")
      .eq("name", removed.name)
      .single();
    if (afterError) throw new Error(afterError.message);
    expect(after).toEqual({ id: before.id, is_active: false });

    await runImport();
  });

  it("名簿から外れた委員会所属をトランザクション内で取り除く", async () => {
    const target = dataset.councilMembers.find(
      (member) => Object.keys(member.committees).length >= 2
    );
    if (!target) throw new Error("複数の委員会に所属する議員がいない");
    const [removedCommittee] = Object.keys(target.committees);
    if (!removedCommittee) throw new Error("委員会データがない");
    const remainingCommittees = Object.fromEntries(
      Object.entries(target.committees).filter(
        ([committee]) => committee !== removedCommittee
      )
    );

    const report = await importInventory(adminClient, {
      dryRun: false,
      dataset: {
        ...dataset,
        councilMembers: dataset.councilMembers.map((member) =>
          member.name === target.name
            ? { ...member, committees: remainingCommittees }
            : member
        ),
      },
    });

    const linksDiff = report.tables.find(
      (table) => table.table === "council_member_committees"
    );
    expect(linksDiff?.extraneous).toContain(
      `${target.name}::${removedCommittee}`
    );

    const { data: links, error } = await adminClient
      .from("council_member_committees")
      .select("committees!inner(name), council_members!inner(name)")
      .eq("council_members.name", target.name);
    if (error) throw new Error(error.message);
    expect((links ?? []).map((link) => link.committees.name).sort()).toEqual(
      Object.keys(remainingCommittees).sort()
    );

    await runImport();
  });

  it("再インポートしても bills.id が 1 件も変わらない", async () => {
    const before = await fetchBills();
    await runImport();
    const after = await fetchBills();

    expect(after).toHaveLength(23);

    const idBySlug = (rows: typeof before) =>
      Object.fromEntries(rows.map((b) => [b.slug, b.id]));
    expect(idBySlug(after)).toEqual(idBySlug(before));
  });

  it("再インポートしても利用者データが削除・変更されない", async () => {
    await runImport();

    const { data: config } = await adminClient
      .from("interview_configs")
      .select("id, bill_id")
      .eq("id", userData.configId)
      .maybeSingle();
    expect(config).toMatchObject({
      id: userData.configId,
      bill_id: userData.billId,
    });

    const { data: interviewSession } = await adminClient
      .from("interview_sessions")
      .select("id, interview_config_id")
      .eq("id", userData.interviewSessionId)
      .maybeSingle();
    expect(interviewSession).toMatchObject({
      id: userData.interviewSessionId,
      interview_config_id: userData.configId,
    });

    const { data: report } = await adminClient
      .from("interview_report")
      .select("id, summary")
      .eq("id", userData.reportId)
      .maybeSingle();
    expect(report).toMatchObject({
      id: userData.reportId,
      summary: `テストレポート ${runId}`,
    });
  });

  it("解説の更新は同一の (bill_id, difficulty_level) に当たる", async () => {
    const bills = await fetchBills();
    const before = await fetchContents(bills.map((b) => b.id));
    const target = before[0];
    if (!target) throw new Error("解説が投入されていない");

    await adminClient
      .from("bill_contents")
      .update({ title: `書き換え ${runId}` })
      .eq("id", target.id);

    await runImport();

    const { data: restored, error } = await adminClient
      .from("bill_contents")
      .select("id, title, content")
      .eq("bill_id", target.bill_id)
      .eq("difficulty_level", target.difficulty_level)
      .single();
    if (error) throw new Error(error.message);

    // 新しい行が増えるのではなく、同じ行が書き戻される
    expect(restored.id).toBe(target.id);
    expect(restored.title).toBe(target.title);

    const after = await fetchContents(bills.map((b) => b.id));
    expect(after).toHaveLength(before.length);
  });

  it("インベントリ外の議案を削除せず、インベントリ外として報告する", async () => {
    const { data: dummy, error } = await adminClient
      .from("bills")
      .insert({
        name: `インベントリ外のダミー議案 ${runId}`,
        bill_number: `${runId}-dummy`,
        slug: `${runId}-dummy-bill`,
        status: "submitted",
        publish_status: "draft",
        council_session_id: sessionId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const report = await runImport();
    const billsDiff = report.tables.find((t) => t.table === "bills");

    expect(billsDiff?.extraneous).toContain(`${runId}-dummy-bill`);

    const { data: survived } = await adminClient
      .from("bills")
      .select("id")
      .eq("id", dummy.id)
      .maybeSingle();
    expect(survived?.id).toBe(dummy.id);

    await adminClient.from("bills").delete().eq("id", dummy.id);
  });

  it("タグ紐付が過不足なく投入され、再インポートでも増減しない", async () => {
    const bills = await fetchBills();
    const billIds = bills.map((b) => b.id);

    const fetchBillsTags = async () => {
      const { data, error } = await adminClient
        .from("bills_tags")
        .select("bill_id, tag_id")
        .in("bill_id", billIds);
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => `${row.bill_id}::${row.tag_id}`).sort();
    };

    const before = await fetchBillsTags();
    // インベントリは 23 議案すべてに分類を付けている
    expect(before).toHaveLength(23);

    await runImport();
    expect(await fetchBillsTags()).toEqual(before);
  });

  it("運用側で足したタグ紐付を削除せず、インベントリ外として報告する", async () => {
    const bills = await fetchBills();
    const target = bills[0];
    if (!target) throw new Error("議案が投入されていない");

    const { data: extraTag, error: tagError } = await adminClient
      .from("tags")
      .insert({ label: `${runId}-運用で足したタグ` })
      .select("id, label")
      .single();
    if (tagError) throw new Error(tagError.message);

    await adminClient
      .from("bills_tags")
      .insert({ bill_id: target.id, tag_id: extraTag.id });

    const report = await runImport();
    const diff = report.tables.find((t) => t.table === "bills_tags");
    expect(diff?.extraneous).toContain(`${target.slug}::${extraTag.label}`);

    const { data: survived } = await adminClient
      .from("bills_tags")
      .select("tag_id")
      .eq("bill_id", target.id)
      .eq("tag_id", extraTag.id)
      .maybeSingle();
    expect(survived?.tag_id).toBe(extraTag.id);

    // タグ本体はインベントリの管理対象外なので報告に出さない
    const tagDiff = report.tables.find((t) => t.table === "tags");
    expect(tagDiff?.extraneous).toEqual([]);

    await adminClient
      .from("bills_tags")
      .delete()
      .eq("bill_id", target.id)
      .eq("tag_id", extraTag.id);
    await adminClient.from("tags").delete().eq("id", extraTag.id);
  });

  it("インベントリから外れた解説変種を削除せず、インベントリ外として報告する", async () => {
    // インベントリは全議案に easy/normal/hard の3変種を持つ。
    // 1変種を取り下げたインベントリを dry-run で流し、
    // DBに残った変種が「インベントリ外」として報告されることを確かめる。
    const bills = await fetchBills();
    const target = bills[0];
    if (!target?.slug) throw new Error("議案が投入されていない");

    const report = await importInventory(adminClient, {
      dryRun: true,
      dataset: {
        ...dataset,
        createBillContents: (billRefs) =>
          dataset.createBillContents(billRefs).filter((content) => {
            // 差分計算では bill_id に slug が入り、書き込み時は id が入る
            const isTarget =
              content.bill_id === target.slug || content.bill_id === target.id;
            return !(isTarget && content.difficulty_level === "hard");
          }),
      },
    });

    const diff = report.tables.find((t) => t.table === "bill_contents");
    expect(diff?.extraneous).toContain(`${target.slug}::hard`);

    // 報告だけで、DBの変種は消えていない
    const { data: survived } = await adminClient
      .from("bill_contents")
      .select("id")
      .eq("bill_id", target.id)
      .eq("difficulty_level", "hard")
      .maybeSingle();
    expect(survived?.id).toBeDefined();
  });

  it("会期が未作成でも dry-run は例外なく全件を新規として報告する", async () => {
    // billSessionId が null になる経路（会期が未作成）を通す
    const unseen = buildDataset(`${runId}-alt`);

    const report = await importInventory(adminClient, {
      dryRun: true,
      dataset: unseen,
    });

    const byTable = (table: string) =>
      report.tables.find((t) => t.table === table);
    expect(byTable("council_sessions")?.created).toEqual([
      unseen.billSessionSlug,
    ]);
    expect(byTable("factions")?.created).toHaveLength(9);
    expect(byTable("committees")?.created).toHaveLength(9);
    expect(byTable("council_members")?.created).toHaveLength(38);
    expect(byTable("council_member_committees")?.created).toHaveLength(87);
    expect(byTable("bills")?.created).toHaveLength(23);
    expect(byTable("bill_contents")?.created).toHaveLength(69);
    expect(byTable("bills_tags")?.created).toHaveLength(23);

    // dry-run なので会期も議案も作られていない
    const { data: created } = await adminClient
      .from("council_sessions")
      .select("id")
      .eq("slug", unseen.billSessionSlug)
      .maybeSingle();
    expect(created).toBeNull();
  });

  it("会期が未作成で既存議案が別会期にある場合、紐付け変更を dry-run で報告する", async () => {
    const unseenSession = buildDataset(`${runId}-move-session`);
    const reassignmentDataset: ImportDataset = {
      ...dataset,
      councilSessions: unseenSession.councilSessions,
      billSessionSlug: unseenSession.billSessionSlug,
    };

    const report = await importInventory(adminClient, {
      dryRun: true,
      dataset: reassignmentDataset,
    });

    const billsDiff = report.tables.find((table) => table.table === "bills");
    expect(billsDiff?.updated).toHaveLength(23);
    for (const row of billsDiff?.updated ?? []) {
      expect(row.changes).toContainEqual({
        field: "council_session_id",
        before: sessionId,
        after: `slug:${unseenSession.billSessionSlug}`,
      });
    }

    const bills = await fetchBills();
    expect(bills).toHaveLength(23);
  });

  it("dry-run は DB へ書き込まず、差分だけを返す", async () => {
    const bills = await fetchBills();
    const target = bills[0];
    if (!target) throw new Error("議案が投入されていない");

    await adminClient
      .from("bills")
      .update({ publish_status: "draft" })
      .eq("id", target.id);

    const report = await runImport(true);
    expect(report.dryRun).toBe(true);

    const billsDiff = report.tables.find((t) => t.table === "bills");
    const change = billsDiff?.updated.find((row) => row.key === target.slug);
    expect(change?.changes).toContainEqual({
      field: "publish_status",
      before: "draft",
      after: target.publish_status,
    });

    // dry-run 後もDBは書き換わっていない
    const { data: untouched } = await adminClient
      .from("bills")
      .select("publish_status")
      .eq("id", target.id)
      .single();
    expect(untouched?.publish_status).toBe("draft");

    // 後続テストのために本来の状態へ戻す
    await runImport();
  });

  it("差分が無い状態で流すと新規も更新も 0 になる（冪等）", async () => {
    await runImport();
    const billsBefore = await fetchBills();
    const billIds = billsBefore.map((bill) => bill.id);
    const { data: timestampsBefore, error: beforeError } = await adminClient
      .from("bill_contents")
      .select("id, updated_at")
      .in("bill_id", billIds)
      .order("id");
    if (beforeError) throw new Error(beforeError.message);

    await runImport();

    const { data: timestampsAfter, error: afterError } = await adminClient
      .from("bill_contents")
      .select("id, updated_at")
      .in("bill_id", billIds)
      .order("id");
    if (afterError) throw new Error(afterError.message);
    expect(timestampsAfter).toEqual(timestampsBefore);

    const report = await runImport(true);

    for (const table of report.tables) {
      expect({
        table: table.table,
        created: table.created,
        updated: table.updated,
      }).toEqual({ table: table.table, created: [], updated: [] });
    }
  });
});
