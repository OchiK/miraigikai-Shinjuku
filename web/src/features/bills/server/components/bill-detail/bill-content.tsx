import { parseMarkdown } from "@/lib/markdown";
import type { BillWithContent } from "../../../shared/types";

interface BillContentProps {
  bill: BillWithContent;
}

export async function BillContent({ bill }: BillContentProps) {
  const markdownContent = bill.bill_content?.content;

  if (!markdownContent) {
    return null;
  }

  const content = await parseMarkdown(markdownContent);

  return (
    <div
      className="
            markdown-content max-w-none text-base text-mirai-text
            [&_h1]:text-2xl [&_h1]:font-heading [&_h1]:font-bold [&_h1]:mb-4
            [&_h2]:text-xl [&_h2]:font-heading [&_h2]:font-bold [&_h2]:mb-4
            [&_h3]:text-lg [&_h3]:font-heading [&_h3]:font-bold [&_h3]:mb-2
            [&_p]:mb-4 [&_p]:leading-[1.9]
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
            [&_li]:mb-4 [&_li]:leading-[1.9]
            [&_a]:!underline [&_a]:!underline-offset-[3px]
            [&_a]:text-mirai-accent-text
            [&_a:hover]:opacity-70
            [&_blockquote]:border-l-4 [&_blockquote]:border-terracotta-300
            [&_blockquote]:pl-4
            [&_pre]:bg-neutral-200 [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto
            [&_code]:bg-neutral-200 [&_code]:px-1 [&_code]:rounded-sm
            [&_section]:bg-card [&_section]:px-6 [&_section]:py-8 [&_section]:rounded-xl [&_section]:mb-6
            [&_section]:shadow-mirai-sm
            [&_section]:break-all
            [&_section>*:last-child]:mb-0
            [&_section:has(>iframe)]:p-0
            [&_iframe.youtube-embed]:w-full [&_iframe.youtube-embed]:aspect-video [&_iframe.youtube-embed]:mb-4
            [&_iframe.youtube-embed]:rounded-md [&_iframe.youtube-embed]:shadow-mirai-md
            [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4 [&_table]:text-sm
            [&_th]:border [&_th]:border-mirai-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-neutral-200 [&_th]:font-bold [&_th]:text-left
            [&_td]:border [&_td]:border-mirai-border [&_td]:px-3 [&_td]:py-2
            [&_tr:nth-child(even)]:bg-neutral-100
          "
    >
      {content}
    </div>
  );
}
