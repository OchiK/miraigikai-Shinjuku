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
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-mirai-text">この議案の出典</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.kind}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs leading-relaxed text-mirai-text-note underline underline-offset-[3px] hover:opacity-70"
            >
              {link.label}
              <ExternalLink aria-hidden="true" className="h-3 w-3 shrink-0" />
              <span className="sr-only">（新しいタブで開きます）</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
