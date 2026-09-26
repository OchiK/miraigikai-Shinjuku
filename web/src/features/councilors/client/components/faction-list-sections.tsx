import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import type { CouncilorFactionGroup } from "../../shared/types";
import { getFactionAnchorId } from "../../shared/utils/faction-anchor";
import { CouncilorCard } from "./councilor-card";

type Props = {
  groups: CouncilorFactionGroup[];
  locale?: PublicLocale;
};

/** 議員一覧の会派別表示。会派ごとに面を分け、会派内は議席番号順 */
export function FactionListSections({ groups, locale = "ja" }: Props) {
  const { councilors: messages } = getUiMessages(locale);

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ faction, councilors: members }) => (
        <section
          key={faction?.id ?? "unaffiliated"}
          // 議案詳細の会派賛否から #faction-{slug} で着地する。固定ヘッダーに潜らないよう余白を取る
          id={getFactionAnchorId(faction?.slug ?? null)}
          className="flex scroll-mt-28 flex-col gap-4 rounded-xl bg-mirai-surface-sunken p-5 shadow-mirai-sm md:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading font-bold text-mirai-text text-xl leading-[1.3] md:text-2xl">
              {faction ? (
                <span lang="ja">{faction.displayName}</span>
              ) : (
                messages.unaffiliated
              )}
            </h2>
            <span className="rounded-full bg-card px-3 py-1 font-bold text-mirai-text text-xs shadow-mirai-sm">
              {messages.memberCount(members.length)}
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {members.map((councilor) => (
              <li key={councilor.id} className="h-full">
                <CouncilorCard councilor={councilor} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
