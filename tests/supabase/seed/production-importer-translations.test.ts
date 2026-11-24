import { afterAll, describe, expect, it } from "vitest";
import type { BillTranslationSeed } from "../../../packages/seed/main/bill-translations-data";
import { hasChanges } from "../../../packages/seed/production/diff";
import type { ImportDataset } from "../../../packages/seed/production/importer";
import { importInventory } from "../../../packages/seed/production/importer";
import { calculateSourceHash } from "../../../packages/shared/src/i18n/source-hash";
import type { Database } from "../../../packages/supabase/types/supabase.types";
import { adminClient } from "../utils";

const prefix = `translation-sync-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const japanese = { title: "原文", summary: "概要", content: "本文" };
const translated = { title: "Title", summary: "Summary", content: "Content" };
const source_hash = calculateSourceHash({
  difficulty_level: "normal",
  ...japanese,
});
const cases = [
  "create",
  "reviewed-equal",
  "reviewed-source",
  "reviewed-text",
  ...["generated", "stale"].flatMap((status) => [
    `${status}-legacy-equal`,
    `${status}-legacy-different`,
    `${status}-edited-equal`,
    `${status}-edited-different`,
    `${status}-unchanged`,
    `${status}-update`,
  ]),
];
const slug = (name: string) => `${prefix}-${name}`;
const key = (name: string) => `${slug(name)}::normal::en`;
const translation = (name: string): BillTranslationSeed => ({
  bill_slug: slug(name),
  difficulty_level: "normal",
  locale: "en",
  status: "generated",
  ...translated,
  source_hash,
  model: "test-model",
  prompt_version: "test-prompt",
});
function dataset(
  names: string[],
  source: typeof japanese = japanese
): ImportDataset {
  return {
    councilSessions: [
      {
        slug: prefix,
        name: prefix,
        start_date: "2026-11-24",
        is_active: false,
      },
    ],
    billSessionSlug: prefix,
    tags: [],
    factions: [],
    committees: [],
    councilRosterKey: prefix,
    councilRosterUrl: "https://example.com/roster",
    councilMembers: [],
    councilMemberQuestions: [],
    factionStances: [],
    bills: names.map((name) => ({
      slug: slug(name),
      name: slug(name),
      bill_number: slug(name),
      status: "submitted",
      publish_status: "draft",
      is_featured: false,
      is_review_completed: false,
    })),
    createBillContents: (bills) =>
      bills.map((bill) => ({
        bill_id: bill.id,
        difficulty_level: "normal",
        ...source,
      })),
    createBillsTags: () => [],
    billContentTranslations: names.map(translation),
  };
}
async function fetchRows() {
  const { data, error } = await adminClient
    .from("bill_content_translations")
    .select("*, bill_contents!inner(bills!inner(slug))")
    .like("bill_contents.bills.slug", `${prefix}-%`)
    .order("id");
  if (error) throw error;
  return data;
}
async function patch(
  name: string,
  fields: Database["public"]["Tables"]["bill_content_translations"]["Update"]
) {
  const row = (await fetchRows()).find(
    (item) => item.bill_contents.bills.slug === slug(name)
  );
  if (!row) throw new Error(`Missing ${name}`);
  const { error } = await adminClient
    .from("bill_content_translations")
    .update(fields)
    .eq("id", row.id);
  if (error) throw error;
}
const diff = (report: Awaited<ReturnType<typeof importInventory>>) => {
  const table = report.tables.find(
    (table) => table.table === "bill_content_translations"
  );
  if (!table) throw new Error("Missing translation diff");
  return table;
};

describe("translation importer with real local DB", () => {
  afterAll(async () => {
    const { data } = await adminClient
      .from("council_sessions")
      .select("id")
      .eq("slug", prefix)
      .maybeSingle();
    if (data)
      await adminClient
        .from("bills")
        .delete()
        .eq("council_session_id", data.id);
    await adminClient.from("council_sessions").delete().eq("slug", prefix);
  });

  it("matches every state-table classification to actual committed changes, retaining all protected columns", async () => {
    const all = dataset([...cases, "extraneous"]);
    await importInventory(adminClient, {
      dryRun: false,
      dataset: {
        ...all,
        billContentTranslations: all.billContentTranslations.filter(
          (row) => row.bill_slug !== slug("create")
        ),
      },
    });
    for (const name of cases.filter((name) => name.startsWith("reviewed"))) {
      await patch(name, {
        status: "reviewed",
        reviewed_at: "2026-11-24T00:00:00Z",
        reviewed_by: "reviewer",
        ...(name.endsWith("source")
          ? { source_hash: `v1:${"b".repeat(64)}` }
          : {}),
        ...(name.endsWith("text") ? { title: "Approved edit" } : {}),
      });
    }
    for (const status of ["generated", "stale"]) {
      for (const suffix of [
        "legacy-equal",
        "legacy-different",
        "edited-equal",
        "edited-different",
        "unchanged",
        "update",
      ]) {
        const name = `${status}-${suffix}`;
        await patch(name, {
          status,
          ...(suffix.startsWith("legacy") ? { imported_snapshot: null } : {}),
          ...(suffix.startsWith("edited")
            ? { imported_snapshot: { ...translated, title: "Earlier" } }
            : {}),
          ...(suffix.endsWith("different") ? { title: "Admin edit" } : {}),
          ...(suffix === "update" ? { model: "previous-model" } : {}),
        });
      }
    }
    // A non-English row is never read, reported, or changed.
    const contentId = (await fetchRows())[0].bill_content_id;
    const { data: korean, error } = await adminClient
      .from("bill_content_translations")
      .insert({
        bill_content_id: contentId,
        locale: "ko",
        ...translated,
        source_hash,
      })
      .select()
      .single();
    if (error) throw error;
    const inventory = dataset([...cases, "extraneous"]);
    inventory.billContentTranslations = cases.map(translation);
    const before = await fetchRows();
    const dry = diff(
      await importInventory(adminClient, { dryRun: true, dataset: inventory })
    );
    expect(await fetchRows()).toEqual(before);
    expect(dry.created).toEqual([key("create")]);
    expect(dry.updated.map((row) => row.key).sort()).toEqual(
      [key("generated-update"), key("stale-update")].sort()
    );
    const unchangedKeys = [
      "reviewed-equal",
      ...["generated", "stale"].flatMap((status) =>
        ["legacy-equal", "edited-equal", "unchanged"].map(
          (suffix) => `${status}-${suffix}`
        )
      ),
    ]
      .map(key)
      .sort();
    expect(dry.unchanged.slice().sort()).toEqual(unchangedKeys);
    expect(dry.extraneous).toEqual([key("extraneous")]);
    const protectedKeys = [
      "reviewed-source",
      "reviewed-text",
      "generated-legacy-different",
      "generated-edited-different",
      "stale-legacy-different",
      "stale-edited-different",
    ]
      .map(key)
      .sort();
    expect(dry.protected.map((row) => row.key).sort()).toEqual(protectedKeys);
    const applied = diff(
      await importInventory(adminClient, { dryRun: false, dataset: inventory })
    );
    expect(applied).toEqual(dry);
    const after = await fetchRows();
    expect(after).toHaveLength(before.length + 1);
    const created = after.find(
      (row) => row.bill_contents.bills.slug === slug("create")
    );
    expect(created).toMatchObject({
      locale: "en",
      ...translated,
      source_hash,
      source_snapshot: japanese,
      imported_snapshot: translated,
      model: "test-model",
      prompt_version: "test-prompt",
      status: "generated",
      reviewed_at: null,
      reviewed_by: null,
    });
    expect(created?.id).toEqual(expect.any(String));
    expect(created?.translated_at).toEqual(expect.any(String));
    for (const prior of before) {
      const name = (prior.bill_contents.bills.slug ?? "").replace(
        `${prefix}-`,
        ""
      );
      const next = after.find((item) => item.id === prior.id);
      if (
        prior.locale === "en" &&
        ["generated-update", "stale-update"].includes(name)
      ) {
        expect(next).toEqual({
          ...prior,
          model: "test-model",
          status: "generated",
          translated_at: expect.any(String),
          updated_at: expect.any(String),
          reviewed_at: null,
          reviewed_by: null,
        });
      } else expect(next).toEqual(prior);
    }
    expect(after.find((row) => row.id === korean.id)).toEqual(
      before.find((row) => row.id === korean.id)
    );
    const repeated = diff(
      await importInventory(adminClient, { dryRun: false, dataset: inventory })
    );
    expect(repeated.created).toEqual([]);
    expect(repeated.updated).toEqual([]);
    expect(repeated.unchanged.slice().sort()).toEqual(
      [
        ...unchangedKeys,
        key("create"),
        key("generated-update"),
        key("stale-update"),
      ].sort()
    );
    expect(repeated.protected.map((row) => row.key).sort()).toEqual(
      protectedKeys
    );
    expect(repeated.extraneous).toEqual([key("extraneous")]);
    expect(await fetchRows()).toEqual(after);
    expect(hasChanges({ dryRun: false, tables: [repeated] })).toBe(false);
  });

  it.each([
    "text",
    "japanese",
  ] as const)("updates every RPC column for %s changes and can update the same row again", async (change) => {
    const name = `retranslate-${change}`;
    await importInventory(adminClient, {
      dryRun: false,
      dataset: dataset([name]),
    });
    // Across both cases every SET target starts with a different value,
    // including metadata cleared on an unapproved row. Each assignment matters.
    const oldTimestamp = "2000-01-01T00:00:00+00:00";
    await patch(name, {
      status: "stale",
      translated_at: oldTimestamp,
      reviewed_at: oldTimestamp,
      reviewed_by: "previous-reviewer",
    });
    const source =
      change === "japanese"
        ? {
            title: "改訂した原文",
            summary: "改訂した概要",
            content: "改訂した本文",
          }
        : japanese;
    const desiredHash = calculateSourceHash({
      difficulty_level: "normal",
      ...source,
    });
    let previous = (await fetchRows()).find(
      (row) => row.bill_contents.bills.slug === slug(name)
    );
    if (!previous) throw new Error(`Missing ${name}`);
    const rowId = previous.id;
    if (change === "japanese") {
      expect(desiredHash).not.toBe(previous.source_hash);
      expect(source).not.toEqual(previous.source_snapshot);
    }
    for (const revision of [1, 2]) {
      const text = {
        title: `Updated title ${revision}`,
        summary: `Updated summary ${revision}`,
        content: `Updated content ${revision}`,
      };
      const desired = {
        ...translation(name),
        ...text,
        source_hash: desiredHash,
        model: `updated-model-${revision}`,
        prompt_version: `updated-prompt-${revision}`,
      };
      const inventory = dataset([name], source);
      inventory.billContentTranslations = [desired];
      const dry = diff(
        await importInventory(adminClient, { dryRun: true, dataset: inventory })
      );
      expect(dry.created).toEqual([]);
      expect(dry.updated.map((row) => row.key)).toEqual([key(name)]);
      expect(dry.protected).toEqual([]);
      expect(
        diff(
          await importInventory(adminClient, {
            dryRun: false,
            dataset: inventory,
          })
        )
      ).toEqual(dry);
      const next = (await fetchRows()).find((row) => row.id === rowId);
      expect(next).toEqual({
        ...previous,
        ...text,
        source_hash: desiredHash,
        source_snapshot: source,
        model: desired.model,
        prompt_version: desired.prompt_version,
        imported_snapshot: text,
        status: "generated",
        translated_at: expect.any(String),
        reviewed_at: null,
        reviewed_by: null,
        updated_at: expect.any(String),
      });
      if (!next) throw new Error(`Missing updated ${name}`);
      expect(next.translated_at).not.toBe(previous.translated_at);
      expect(next.updated_at).not.toBe(previous.updated_at);
      // T(D), rather than the old translation, must own the next import too.
      expect(next.imported_snapshot).toEqual({
        title: next.title,
        summary: next.summary,
        content: next.content,
      });
      const { data: actualSource, error } = await adminClient
        .from("bill_contents")
        .select("title, summary, content")
        .eq("id", next.bill_content_id)
        .single();
      expect(error).toBeNull();
      expect(actualSource).toEqual(source);
      previous = next;
    }
  });

  it.each([
    "approve",
    "edit",
  ])("protects and reports Admin %s immediately before RPC", async (action) => {
    const name = `race-${action}`;
    const initial = dataset([name]);
    await importInventory(adminClient, { dryRun: false, dataset: initial });
    const changed = {
      ...initial,
      billContentTranslations: [{ ...translation(name), model: "new-model" }],
    };
    let raced = false;
    let preserved: Awaited<ReturnType<typeof fetchRows>> = [];
    const client = new Proxy(adminClient, {
      get(target, property) {
        if (property === "rpc")
          return async (...args: Parameters<typeof adminClient.rpc>) => {
            if (!raced) {
              raced = true;
              await patch(
                name,
                action === "approve"
                  ? {
                      status: "reviewed",
                      reviewed_at: "2026-11-24T00:00:00Z",
                      reviewed_by: "racing-admin",
                    }
                  : { title: "Racing Admin edit" }
              );
              preserved = await fetchRows();
            }
            return target.rpc(...args);
          };
        const value = Reflect.get(target, property);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
    const result = diff(
      await importInventory(client, { dryRun: false, dataset: changed })
    );
    expect(raced).toBe(true);
    expect(result.updated).toEqual([]);
    expect(result.created).toEqual([]);
    expect(result.protected.map((row) => row.key)).toContain(key(name));
    expect(
      result.protected.find((row) => row.key === key(name))?.reason
    ).toContain("反映の直前");
    expect(await fetchRows()).toEqual(preserved);
  });

  it("does not call the RPC when only protected differences remain", async () => {
    const name = "protected-only";
    const inventory = dataset([name]);
    await importInventory(adminClient, { dryRun: false, dataset: inventory });
    await patch(name, { title: "Admin-owned" });
    const before = await fetchRows();
    const client = new Proxy(adminClient, {
      get(target, property) {
        if (property === "rpc")
          return () => {
            throw new Error(
              "RPC must not be called for protected-only differences"
            );
          };
        const value = Reflect.get(target, property);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
    const report = await importInventory(client, {
      dryRun: false,
      dataset: inventory,
    });
    expect(hasChanges(report)).toBe(false);
    expect(diff(report).protected.map((row) => row.key)).toEqual([key(name)]);
    expect(await fetchRows()).toEqual(before);
  });

  it.each([
    "dry-run",
    "apply",
  ])("rejects invalid translation inventory before writes in %s", async (mode) => {
    const name = `invalid-${mode}`;
    const inventory = dataset([name]);
    const valid = diff(
      await importInventory(adminClient, { dryRun: true, dataset: inventory })
    );
    expect(valid.created).toEqual([key(name)]);
    expect(valid.protected).toEqual([]);
    inventory.billContentTranslations[0].source_hash = `v1:${"f".repeat(64)}`;
    const before = await fetchRows();
    const sessionBefore = await adminClient
      .from("council_sessions")
      .select("*")
      .eq("slug", prefix);
    expect(sessionBefore.error).toBeNull();
    await expect(
      importInventory(adminClient, {
        dryRun: mode === "dry-run",
        dataset: inventory,
      })
    ).rejects.toThrow(`翻訳 source_hash 不一致: ${key(name)}`);
    expect(await fetchRows()).toEqual(before);
    const { data, error } = await adminClient
      .from("bills")
      .select("id")
      .eq("slug", slug(name));
    expect(error).toBeNull();
    expect(data).toEqual([]);
    const sessionAfter = await adminClient
      .from("council_sessions")
      .select("*")
      .eq("slug", prefix);
    expect(sessionAfter.error).toBeNull();
    expect(sessionAfter.data).toEqual(sessionBefore.data);
  });
});
