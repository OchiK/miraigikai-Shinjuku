"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CompactBillCard } from "@/features/bills/client/components/bill-list/compact-bill-card";
import type {
  BillTag,
  BillWithContent,
  ComingSoonBill,
} from "@/features/bills/shared/types";
import { buildComingSoonBillHeading } from "@/features/bills/shared/utils/build-coming-soon-bill-heading";

type StatusFilterType = "all" | "approved" | "rejected" | "other";

type Props = {
  bills: BillWithContent[];
  comingSoonBills?: ComingSoonBill[];
};

function filterBillsByStatus(
  bills: BillWithContent[],
  filter: StatusFilterType
): BillWithContent[] {
  switch (filter) {
    case "approved":
      return bills.filter((b) => b.status === "approved");
    case "rejected":
      return bills.filter((b) => b.status === "rejected");
    case "other":
      return bills.filter(
        (b) => b.status !== "approved" && b.status !== "rejected"
      );
    default:
      return bills;
  }
}

function filterComingSoonByStatus(
  bills: ComingSoonBill[],
  filter: StatusFilterType
): ComingSoonBill[] {
  switch (filter) {
    case "approved":
      return bills.filter((b) => b.status === "approved");
    case "rejected":
      return bills.filter((b) => b.status === "rejected");
    case "other":
      return bills.filter(
        (b) => b.status !== "approved" && b.status !== "rejected"
      );
    default:
      return bills;
  }
}

function filterByTag<T extends { tags: BillTag[] }>(
  items: T[],
  tagId: string | null
): T[] {
  if (!tagId) return items;
  return items.filter((item) => item.tags.some((t) => t.id === tagId));
}

function getUniqueTags(
  bills: BillWithContent[],
  comingSoonBills: ComingSoonBill[]
): BillTag[] {
  const tagMap = new Map<string, BillTag>();
  for (const bill of bills) {
    for (const tag of bill.tags) {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, tag);
      }
    }
  }
  for (const bill of comingSoonBills) {
    for (const tag of bill.tags) {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, tag);
      }
    }
  }
  return Array.from(tagMap.values());
}

export function BillListWithStatusFilter({
  bills,
  comingSoonBills = [],
}: Props) {
  const searchParams = useSearchParams();
  const initialTagId = searchParams.get("tag");

  const [activeStatusFilter, setActiveStatusFilter] =
    useState<StatusFilterType>("all");
  const [activeTagId, setActiveTagId] = useState<string | null>(initialTagId);

  const uniqueTags = useMemo(
    () => getUniqueTags(bills, comingSoonBills),
    [bills, comingSoonBills]
  );

  const filteredBills = useMemo(() => {
    const byStatus = filterBillsByStatus(bills, activeStatusFilter);
    return filterByTag(byStatus, activeTagId);
  }, [bills, activeStatusFilter, activeTagId]);

  const filteredComingSoon = useMemo(() => {
    const byStatus = filterComingSoonByStatus(
      comingSoonBills,
      activeStatusFilter
    );
    return filterByTag(byStatus, activeTagId);
  }, [comingSoonBills, activeStatusFilter, activeTagId]);

  const statusFilters: {
    key: StatusFilterType;
    label: string;
  }[] = [
    { key: "all", label: "ALL" },
    // status 列挙での絞り込みであり、approved には原案可決の議案と
    // 専決処分の承認（承認第2号・第3号）が混在する。「可決」だけを掲げると
    // 承認案件を可決と呼ぶことになるため、両方の用語を label に出す。
    { key: "approved", label: "可決・承認" },
    { key: "rejected", label: "否決・不承認" },
    { key: "other", label: "その他" },
  ];

  const noResults =
    filteredBills.length === 0 && filteredComingSoon.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* ステータスフィルターボタン */}
      <div className="flex flex-wrap gap-3">
        {statusFilters.map((filter) => (
          <Button
            key={filter.key}
            variant="ghost"
            onClick={() => setActiveStatusFilter(filter.key)}
            className={`h-11 px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              activeStatusFilter === filter.key
                ? "bg-primary text-mirai-text hover:bg-primary-accent hover:text-mirai-text"
                : "bg-neutral-200 text-mirai-text-muted hover:bg-neutral-300 hover:text-mirai-text-muted"
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* タグフィルターボタン */}
      {uniqueTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={() => setActiveTagId(null)}
            className={`h-11 px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              activeTagId === null
                ? "bg-primary text-mirai-text hover:bg-primary-accent hover:text-mirai-text"
                : "bg-neutral-200 text-mirai-text-muted hover:bg-neutral-300 hover:text-mirai-text-muted"
            }`}
          >
            すべてのタグ
          </Button>
          {uniqueTags.map((tag) => (
            <Button
              key={tag.id}
              variant="ghost"
              onClick={() => setActiveTagId(tag.id)}
              className={`h-11 px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeTagId === tag.id
                  ? "bg-primary text-mirai-text hover:bg-primary-accent hover:text-mirai-text"
                  : "bg-neutral-200 text-mirai-text-muted hover:bg-neutral-300 hover:text-mirai-text-muted"
              }`}
            >
              {tag.label}
            </Button>
          ))}
        </div>
      )}

      {/* 議案リスト */}
      {noResults ? (
        <p className="text-center py-12 text-muted-foreground">
          該当する議案がありません
        </p>
      ) : (
        <>
          {filteredBills.length > 0 && (
            <div className="flex flex-col gap-3">
              {filteredBills.map((bill) => (
                <Link key={bill.id} href={`/bills/${bill.id}`}>
                  <CompactBillCard bill={bill} />
                </Link>
              ))}
            </div>
          )}

          {/* これから掲載される議案 */}
          {filteredComingSoon.length > 0 && (
            <div className="flex flex-col gap-6 mt-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-[22px] font-bold text-black leading-[1.48]">
                  これから掲載される議案
                </h3>
                <p className="text-xs text-mirai-text-secondary">
                  順次掲載されていきます
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {filteredComingSoon.map((bill) => {
                  const { identifier, title, officialName } =
                    buildComingSoonBillHeading(bill);

                  return (
                    <Card key={bill.id} className="border border-black">
                      <CardContent className="flex items-center justify-between py-4 px-5">
                        <div className="flex flex-col gap-1 min-w-0">
                          {identifier && (
                            <p className="text-xs font-bold text-mirai-text-muted">
                              {identifier}
                            </p>
                          )}
                          <h4 className="font-bold text-base text-black leading-tight">
                            {title}
                          </h4>
                          {officialName && (
                            <p className="text-xs text-mirai-text-muted">
                              {officialName}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
