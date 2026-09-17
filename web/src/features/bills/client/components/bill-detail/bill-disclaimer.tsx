import { CircleHelp } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";

/**
 * 免責（デザインシステム定義 §9-11）。
 *
 * 非公式であることとAI回答の限界を、各議案の末尾に必ず置く。
 */
export function BillDisclaimer() {
  return (
    <section className="rounded-xl bg-mirai-surface-sunken p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-bold text-mirai-text text-sm">
            掲載コンテンツについて
          </h2>
          <p className="text-mirai-text-muted text-xs leading-[1.9]">
            掲載されている議案情報は、{siteConfig.councilName}
            に上程された議案などの公開情報を基に、AIを活用しながら背景情報を整理したものです。
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold text-mirai-text text-sm">免責事項</h2>
          <p className="text-mirai-text-muted text-xs leading-[1.9]">
            本サイトで公開する情報は、可能な限り正確かつ最新の情報を反映するよう努めていますが、その正確性・完全性・即時性について保証するものではありません。また、AIチャットは不正確または誤解を招く回答を生成する可能性があります。正確な情報は、公式文書や一次資料をご確認ください。
          </p>
        </div>

        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-5 font-bold text-mirai-text text-sm shadow-mirai-sm transition-colors hover:bg-neutral-300"
          href={routes.faq() as Route}
        >
          <CircleHelp
            aria-hidden="true"
            className="size-4"
            strokeWidth={2.75}
          />
          よくある質問
        </Link>
      </div>
    </section>
  );
}
