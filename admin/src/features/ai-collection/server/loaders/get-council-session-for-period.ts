import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import type { CouncilSessionResolution } from "../../shared/utils/council-session-resolution";

export async function getCouncilSessionForPeriod(
  startDate: string,
  endDate: string
): Promise<CouncilSessionResolution> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("council_sessions")
    .select("id")
    .lte("start_date", endDate)
    .or(`end_date.is.null,end_date.gte.${startDate}`);

  if (error) {
    return {
      sessionId: null,
      matchCount: 0,
      errorMessage: error.message,
    };
  }

  return {
    sessionId: data?.length === 1 ? data[0].id : null,
    matchCount: data?.length ?? 0,
    errorMessage: null,
  };
}
