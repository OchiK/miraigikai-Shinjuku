import { afterAll, describe, expect, it } from "vitest";
import { adminClient } from "../utils";

const runId = `itest-production-rpc-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const sessionSlug = `${runId}-session`;
const billSlug = `${runId}-bill`;

describe("import_production_inventory", () => {
  afterAll(async () => {
    await adminClient.from("bills").delete().eq("slug", billSlug);
    await adminClient.from("council_sessions").delete().eq("slug", sessionSlug);
  });

  it("後続データが不正な場合、先に行った upsert もロールバックする", async () => {
    const { error } = await adminClient.rpc("import_production_inventory", {
      p_council_sessions: [
        {
          name: `トランザクションテスト ${runId}`,
          slug: sessionSlug,
          council_url: null,
          start_date: "2026-09-19",
          end_date: null,
          is_active: false,
        },
      ],
      p_tags: [],
      p_bills: [
        {
          name: `トランザクションテスト議案 ${runId}`,
          bill_number: `${runId}-1`,
          slug: billSlug,
          status: "submitted",
          status_note: null,
          publish_status: "draft",
          published_at: null,
          is_featured: false,
          is_review_completed: false,
          thumbnail_url: null,
          pdf_url: null,
          overview_pdf_url: null,
          source_page_url: null,
          decision_source_url: null,
        },
      ],
      p_bill_contents: [
        {
          bill_slug: `${runId}-unknown-bill`,
          difficulty_level: "normal",
          title: "ロールバックテスト",
          summary: "ロールバックテスト",
          content: "ロールバックテスト",
        },
      ],
      p_bills_tags: [],
      p_bill_session_slug: sessionSlug,
    });

    expect(error?.message).toContain(
      "one or more bill contents reference an unknown bill slug"
    );

    const { data: session, error: sessionError } = await adminClient
      .from("council_sessions")
      .select("id")
      .eq("slug", sessionSlug)
      .maybeSingle();
    if (sessionError) throw new Error(sessionError.message);

    const { data: bill, error: billError } = await adminClient
      .from("bills")
      .select("id")
      .eq("slug", billSlug)
      .maybeSingle();
    if (billError) throw new Error(billError.message);

    expect(session).toBeNull();
    expect(bill).toBeNull();
  });
});
