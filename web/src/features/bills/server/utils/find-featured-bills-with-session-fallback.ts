import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";

type FindFeaturedBills<T> = (
  difficultyLevel: DifficultyLevelEnum,
  councilSessionId: string | null
) => Promise<T[]>;

export async function findFeaturedBillsWithSessionFallback<T>({
  difficultyLevel,
  councilSessionId,
  findFeaturedBills,
}: {
  difficultyLevel: DifficultyLevelEnum;
  councilSessionId: string | null;
  findFeaturedBills: FindFeaturedBills<T>;
}): Promise<T[]> {
  const sessionBills = await findFeaturedBills(
    difficultyLevel,
    councilSessionId
  );

  if (sessionBills.length > 0 || councilSessionId === null) {
    return sessionBills;
  }

  return findFeaturedBills(difficultyLevel, null);
}
