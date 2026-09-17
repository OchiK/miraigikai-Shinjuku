import { ExternalLink } from "lucide-react";
import type { BillWithContent } from "../../../shared/types";
import { buildBillSourceLinks } from "../../../shared/utils/build-bill-source-links";

interface BillSourceLinksProps {
  bill: BillWithContent;
}

/**
 * 議案の一次資料へのリンク。
 *
 * 解説は公式PDFをもとに整理した二次的な文章のため、読者がいつでも原典に当たれるよう
 * 議案詳細ページに出典を並べる。
 */
export function BillSourceLinks({ bill }: BillSourceLinksProps) {
  const links = buildBillSourceLinks(bill);

  if (links.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="bill-source-links-heading"
      className="rounded-xl bg-card p-6 shadow-mirai-sm"
    >
      <h2
        className="mb-4 font-bold font-heading text-lg text-mirai-text"
        id="bill-source-links-heading"
      >
        区議会の公式ページ
      </h2>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.kind}>
            <a
              className="inline-flex min-h-11 items-center gap-1.5 text-mirai-accent-text text-sm underline underline-offset-[3px] hover:opacity-70"
              href={link.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {link.label}
              <ExternalLink
                aria-hidden="true"
                className="size-4 shrink-0"
                strokeWidth={2.75}
              />
              <span className="sr-only">（新しいタブで開きます）</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
