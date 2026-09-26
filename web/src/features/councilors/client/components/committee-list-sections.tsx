import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import type { CouncilorCommitteeGroup } from "../../shared/types";
import { getCommitteeAnchorId } from "../../shared/utils/committee-anchor";
import { CouncilorCard } from "./councilor-card";

type Props = {
  groups: CouncilorCommitteeGroup[];
  locale?: PublicLocale;
};

/**
 * 議員一覧の委員会別表示。委員会ごとに面を分け、見出しに種別と人数を添える。
 * 委員会内は委員長 → 副委員長 → 委員の順（並べ替えは groupCouncilorsByCommittee）。
 */
export function CommitteeListSections({ groups, locale = "ja" }: Props) {
  const { councilors: messages, councilorDetail } = getUiMessages(locale);

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ committee, members }) => (
        <section
          key={committee.id}
          // ページ内の移動用。固定ヘッダーに潜らないよう余白を取る
          id={getCommitteeAnchorId(committee.id)}
          className="flex scroll-mt-28 flex-col gap-4 rounded-xl bg-mirai-surface-sunken p-5 shadow-mirai-sm md:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              lang="ja"
              className="font-heading font-bold text-mirai-text text-xl leading-[1.3] md:text-2xl"
            >
              {committee.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-mirai-tag px-3 py-1 font-bold text-mirai-tag-text text-xs">
                {councilorDetail.committeeKinds[committee.kind]}
              </span>
              <span className="rounded-full bg-card px-3 py-1 font-bold text-mirai-text text-xs shadow-mirai-sm">
                {messages.memberCount(members.length)}
              </span>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {members.map(({ councilor, role }) => (
              <li key={councilor.id} className="h-full">
                <CouncilorCard
                  councilor={councilor}
                  locale={locale}
                  committeeRole={role}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
