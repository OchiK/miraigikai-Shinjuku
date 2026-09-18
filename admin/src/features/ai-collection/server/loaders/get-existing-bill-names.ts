import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import { getCouncilSessionForPeriod } from "./get-council-session-for-period";

export async function getExistingBillNumbers(
  startDate: string,
  endDate: string
): Promise<string[]> {
  const { sessionId } = await getCouncilSessionForPeriod(startDate, endDate);
  if (!sessionId) return [];

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bills")
    .select("bill_number")
    .eq("council_session_id", sessionId)
    .neq("bill_number", "");
  return (data ?? []).map((b) => b.bill_number);
}
