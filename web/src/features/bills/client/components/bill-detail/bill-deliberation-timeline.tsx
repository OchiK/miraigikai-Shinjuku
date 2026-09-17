import type { BillStatusEnum } from "../../../shared/types";
import type { BillTimelineEvent } from "../../../shared/utils/bill-timeline";
import { buildBillTimeline } from "../../../shared/utils/bill-timeline";

interface BillDeliberationTimelineProps {
  status: BillStatusEnum;
  statusNote?: string | null;
}

/** 到達済みの節だけテラコッタで塗り、未到達は面の色に落とす */
function nodeClassName(state: BillTimelineEvent["state"]): string {
  if (state === "current") {
    return "bg-terracotta-500 ring-4 ring-terracotta-200";
  }
  if (state === "done") {
    return "bg-terracotta-500";
  }
  return "bg-neutral-300";
}

function labelClassName(state: BillTimelineEvent["state"]): string {
  // 未到達も本文サイズなので、地に対し4.5:1を満たす neutral-700 までに留める
  return state === "upcoming" ? "text-mirai-text-muted" : "text-mirai-text";
}

/**
 * 審議の経過（デザインシステム定義 §9-7）。
 *
 * 出来事を縦並びで示す。bills テーブルは出来事ごとの日付を持たないため、
 * 推測した日付は置かず、到達状況と公式の議決用語だけを出す。
 */
export function BillDeliberationTimeline({
  status,
  statusNote,
}: BillDeliberationTimelineProps) {
  const events = buildBillTimeline({ status, statusNote });

  return (
    <section aria-labelledby="bill-timeline-heading">
      <h2
        className="mb-4 font-bold font-heading text-mirai-text text-xl"
        id="bill-timeline-heading"
      >
        審議の経過
      </h2>

      <ol className="rounded-xl bg-card p-6 shadow-mirai-sm">
        {events.map((event, index) => {
          const isLast = index === events.length - 1;

          return (
            <li className="flex gap-4" key={event.key}>
              {/* 丸印と接続線 */}
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={`mt-1.5 size-3 shrink-0 rounded-full ${nodeClassName(event.state)}`}
                />
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="w-0.5 flex-1 bg-neutral-300"
                  />
                )}
              </div>

              <div className={isLast ? "pb-0" : "pb-6"}>
                <p
                  className={`font-bold text-base leading-[1.9] ${labelClassName(event.state)}`}
                >
                  {event.label}
                </p>
                {event.detail && (
                  <p className="text-mirai-text-muted text-sm leading-[1.9]">
                    {event.detail}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
