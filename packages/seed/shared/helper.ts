import { createClient } from "@supabase/supabase-js";
import type { Database } from "@mirai-gikai/supabase";
import { assertDestructiveSeedAllowed } from "./destructive-seed-guard";

export type AdminClient = ReturnType<typeof createAdminClient>;

export function createAdminClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const TABLES_TO_CLEAR = [
  "interview_report",
  "interview_messages",
  "interview_sessions",
  "interview_questions",
  "interview_configs",
  "faction_stances",
  "chats",
  "bill_content_translations",
  "bill_contents",
  "bills_tags",
  "bills",
  "tags",
  "council_member_committees",
  "council_members",
  "factions",
  "committees",
  "council_sessions",
] as const;

/**
 * 利用者データを含む全行を削除する。
 *
 * ガードは呼び出し元ではなくここに置く。run.ts と csv/import-csv.ts の
 * 両方が呼んでおり、今後呼び出し元が増えても漏れないようにするため。
 */
export async function clearAllData(supabase: AdminClient) {
  assertDestructiveSeedAllowed();

  console.log("🧹 Clearing existing data...");

  for (const table of TABLES_TO_CLEAR) {
    await supabase
      .from(table)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
  }

  console.log("✅ Cleared existing data");
}
