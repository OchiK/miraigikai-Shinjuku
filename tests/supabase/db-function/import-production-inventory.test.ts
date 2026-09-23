import { afterAll, describe, expect, it } from "vitest";
import { adminClient } from "../utils";

const runId = `itest-production-rpc-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const sessionSlug = `${runId}-session`;
const billSlug = `${runId}-bill`;
const factionName = `${runId}-faction`;
const committeeName = `${runId}-committee`;
const memberName = `${runId}-member`;
const rosterKey = `${runId}-roster`;
const rosterUrl = `https://example.com/council-roster/${runId}`;

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
          bill_slug: billSlug,
          difficulty_level: "normal",
          title: "ロールバックテスト",
          summary: "ロールバックテスト",
          content: "ロールバックテスト",
        },
      ],
      p_bills_tags: [],
      p_bill_session_slug: sessionSlug,
      p_factions: [
        {
          name: factionName,
          display_name: `テスト会派 ${runId}`,
          alternative_names: [],
          logo_url: null,
          sort_order: 1,
          is_active: true,
        },
      ],
      p_committees: [
        {
          name: committeeName,
          description: null,
          sort_order: 1,
          is_active: true,
        },
      ],
      p_council_members: [
        {
          name: memberName,
          name_kana: `${runId}-member-kana`,
          faction_name: factionName,
          faction_role: null,
          roster_key: rosterKey,
          official_url: rosterUrl,
          website_url: null,
          terms: 1,
          sort_order: 1,
          is_active: true,
        },
      ],
      p_council_member_committees: [
        {
          member_name: memberName,
          committee_name: `${runId}-unknown-committee`,
          role: "委員",
        },
      ],
      p_council_roster_key: rosterKey,
    });

    expect(error?.message).toContain(
      "one or more council-member committee links reference an unknown natural key"
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

    const { data: faction, error: factionError } = await adminClient
      .from("factions")
      .select("id")
      .eq("name", factionName)
      .maybeSingle();
    if (factionError) throw new Error(factionError.message);

    const { data: member, error: memberError } = await adminClient
      .from("council_members")
      .select("id")
      .eq("name", memberName)
      .maybeSingle();
    if (memberError) throw new Error(memberError.message);

    expect(session).toBeNull();
    expect(bill).toBeNull();
    expect(faction).toBeNull();
    expect(member).toBeNull();
  });
});
