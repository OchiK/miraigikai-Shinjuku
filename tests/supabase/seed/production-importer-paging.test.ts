import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it } from "vitest";
import type { Database } from "../../../packages/supabase/types/supabase.types";
import {
  type ImportDataset,
  importInventory,
} from "../../../packages/seed/production/importer";
import { adminClient } from "../utils";

const runId = `paging-${randomUUID()}`;
const sessionSlug = `${runId}-session`;
// 100件の塊でも1,200行になる。全体が1,000行を超えるだけでは
// .in() の分割後に2ページ目が不要になり、回帰を見逃してしまう。
const billCount = 112;
const factionCount = 12;
const stanceCount = billCount * factionCount;
const dataset: ImportDataset = {
  councilSessions: [
    {
      name: runId,
      slug: sessionSlug,
      is_active: false,
      start_date: "2026-01-01",
      end_date: "2026-01-31",
    },
  ],
  billSessionSlug: sessionSlug,
  tags: [],
  factions: Array.from({ length: factionCount }, (_, i) => ({
    name: `${runId}-faction-${i}`,
    display_name: `${runId}-faction-${i}`,
    alternative_names: [],
    is_active: true,
    sort_order: i,
  })),
  committees: [],
  councilRosterKey: runId,
  councilRosterUrl: `https://example.com/${runId}`,
  councilMembers: [],
  councilMemberQuestions: [],
  bills: Array.from({ length: billCount }, (_, i) => ({
    name: `${runId}-bill-${i}`,
    slug: `${runId}-bill-${i}`,
    bill_number: String(i + 1),
    status: "approved" as const,
    is_review_completed: false,
    is_featured: false,
    publish_status: "draft" as const,
  })),
  factionStances: Array.from({ length: billCount }, (_, bill) =>
    Array.from({ length: factionCount }, (_, faction) => ({
      bill_slug: `${runId}-bill-${bill}`,
      faction_name: `${runId}-faction-${faction}`,
      faction_name_at_vote: `${runId}-faction-${faction}`,
      type: "for" as const,
    }))
  ).flat(),
  createBillContents: () => [],
  createBillsTags: () => [],
};

describe("本番インポーターのページング（実 Supabase）", () => {
  afterEach(async () => {
    // 途中で失敗しても名前空間で消せる。議案の削除で賛否も cascade される。
    for (const [table, column] of [
      ["bills", "slug"],
      ["council_members", "roster_key"],
      ["council_sessions", "slug"],
      ["factions", "name"],
    ] as const) {
      const { error } = await adminClient
        .from(table)
        .delete()
        .like(column, `${runId}%`);
      if (error)
        throw new Error(`${table} のテストデータ削除に失敗: ${error.message}`);
    }
  });

  it("1,344行を投入し、2回目は全件変更なしになる（100件分割と2ページ目も検証）", async () => {
    const initial = await importInventory(adminClient, {
      dryRun: false,
      dataset,
    });
    const firstStances = initial.tables.find(
      (table) => table.table === "faction_stances"
    );
    expect(firstStances?.created).toHaveLength(stanceCount);
    expect(firstStances?.updated).toEqual([]);

    const { count, error } = await adminClient
      .from("faction_stances")
      .select("id, bills!inner(slug)", { count: "exact", head: true })
      .like("bills.slug", `${runId}%`);
    if (error) throw new Error(error.message);
    expect(count).toBe(stanceCount);

    // 通信を実 DB に通したまま URL を観察する。無順序でも偶然同じ行順に
    // なる DB では結果だけで order の欠落を検出できないため、契約も検査する。
    const requests: URL[] = [];
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY が必要");
    const client = createClient<Database>(
      process.env.SUPABASE_URL ?? "http://127.0.0.1:54421",
      serviceKey,
      {
        global: {
          fetch: async (input, init) => {
            if ((init?.method ?? "GET") === "GET") {
              requests.push(new URL(String(input)));
            }
            return fetch(input, init);
          },
        },
      }
    );
    const second = await importInventory(client, { dryRun: true, dataset });
    const stances = second.tables.find(
      (table) => table.table === "faction_stances"
    );
    expect(stances?.unchanged).toHaveLength(stanceCount);
    expect(stances?.created).toEqual([]);
    expect(stances?.updated).toEqual([]);
    expect(stances?.extraneous).toEqual([]);
    for (const table of second.tables) {
      expect(table.created, table.table).toEqual([]);
      expect(table.updated, table.table).toEqual([]);
      expect(table.extraneous, table.table).toEqual([]);
    }

    expect(requests.length).toBeGreaterThan(0);
    for (const url of requests) {
      const table = url.pathname.split("/").at(-1);
      expect(url.searchParams.get("order"), `${table} の一意順`).toBe(
        table === "bills_tags" ? "bill_id.asc,tag_id.asc" : "id.asc"
      );
      expect(Number(url.searchParams.get("limit"))).toBeLessThanOrEqual(1000);
      for (const value of url.searchParams.values()) {
        if (value.startsWith("in.(")) {
          expect(value.slice(4, -1).split(",").length).toBeLessThanOrEqual(100);
        }
      }
    }
    const stancePages = requests.filter((url) =>
      url.pathname.endsWith("/faction_stances")
    );
    expect(
      stancePages.some((url) => url.searchParams.get("offset") === "1000")
    ).toBe(true);
    const filters = new Set(
      stancePages.map((url) => url.searchParams.get("bill_id"))
    );
    expect(filters.size).toBe(2);
    console.log(
      `faction_stances: DB=${count}, 初回新規=${firstStances?.created.length}, 2回目変更なし=${stances?.unchanged.length}`
    );
  });

  it("出典URLのない質問が同じ議員に複数あっても差分対象から除外する", async () => {
    const memberName = `${runId}-member`;
    const minimal: ImportDataset = {
      ...dataset,
      bills: [],
      factionStances: [],
      factions: dataset.factions.slice(0, 1),
      councilMembers: [
        {
          name: memberName,
          nameKana: memberName,
          faction: dataset.factions[0].name,
          factionRole: null,
          terms: 1,
          websiteUrl: null,
          xUrl: null,
          committees: {},
        },
      ],
    };
    await importInventory(adminClient, { dryRun: false, dataset: minimal });
    const { data: member, error: memberError } = await adminClient
      .from("council_members")
      .select("id")
      .eq("name", memberName)
      .single();
    if (memberError) throw new Error(memberError.message);
    const { error: insertError } = await adminClient
      .from("council_member_questions")
      .insert(
        ["one", "two"].map((title) => ({
          council_member_id: member.id,
          session_name: runId,
          venue_type: "plenary",
          title,
          summary: title,
          speech_date: "2026-01-01",
          source_url: null,
        }))
      );
    if (insertError) throw new Error(insertError.message);
    const report = await importInventory(adminClient, {
      dryRun: true,
      dataset: minimal,
    });
    const questions = report.tables.find(
      (table) => table.table === "council_member_questions"
    );
    expect(questions).toMatchObject({
      created: [],
      updated: [],
      unchanged: [],
      extraneous: [],
    });
    const { count, error } = await adminClient
      .from("council_member_questions")
      .select("id", { count: "exact", head: true })
      .eq("council_member_id", member.id);
    if (error) throw new Error(error.message);
    expect(count).toBe(2);
  });
});
