import "server-only";
import type { GuideLocale } from "@mirai-gikai/shared/i18n/locales";
import { ExternalLink, House, Languages } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layouts/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";
import { NO_RUBYFUL_CLASS } from "@/lib/rubyful/should-enable-rubyful";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { GuideLanguageLinks } from "../../client/components/guide-language-links";
import { GUIDE_TEXT_JA, GUIDE_TEXTS } from "../../shared/guide-content";
import {
  type GuideTextPair,
  pairGuideSections,
} from "../../shared/utils/pair-guide-text";

interface GuideViewProps {
  locale: GuideLocale;
}

/**
 * 多言語案内ページ。翻訳文（機械翻訳）の下に、もとになったやさしい日本語の原文を並べる。
 * ページ全体の <html lang> は ja のままにし、本文の要素ごとに lang を付ける。
 */
export function GuideView({ locale }: GuideViewProps) {
  const text = GUIDE_TEXTS[locale];
  const sections = pairGuideSections(
    text,
    GUIDE_TEXT_JA,
    siteConfig.operator.name
  );

  return (
    <Container className="pt-24 pb-12 md:pt-8">
      {/* 翻訳文の漢字に日本語のルビが付かないよう、ページ全体を Rubyful の対象外にする。
          除外を効かせているのは class（RUBYFUL_SELECTOR が参照）で、
          data-no-rubyful は DevTools や検証で除外領域を見分けるための目印 */}
      <article
        lang={locale}
        data-no-rubyful="true"
        className={cn(NO_RUBYFUL_CLASS, "flex flex-col gap-6")}
      >
        {/* article の中に aside（complementary ランドマーク）を置くとランドマーク構造が
            崩れるため、注記は role="note" で示す */}
        <div
          role="note"
          className="flex gap-3 rounded-xl bg-mirai-featured p-5 text-mirai-featured-text shadow-mirai-sm"
        >
          <Languages
            aria-hidden="true"
            className="mt-1 size-5 shrink-0"
            strokeWidth={2.75}
          />
          <div className="flex flex-col gap-2">
            <p className="font-semibold">{text.machineTranslationNotice}</p>
            <p lang="ja">{GUIDE_TEXT_JA.machineTranslationNotice}</p>
            <a
              href={siteConfig.externalLinks.report}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1 font-semibold underline underline-offset-4"
            >
              {text.contactLabel}
              <ExternalLink
                aria-hidden="true"
                className="size-4"
                strokeWidth={2.75}
              />
            </a>
          </div>
        </div>

        <header className="flex flex-col gap-1">
          <h1 className="text-2xl">{text.title}</h1>
          <p lang="ja" className="text-mirai-text-muted">
            {GUIDE_TEXT_JA.title}
          </p>
        </header>

        {sections.map((section) => {
          const ListTag = section.isSteps ? "ol" : "div";
          return (
            <section
              key={section.heading.ja}
              className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-mirai-sm"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl">{section.heading.translated}</h2>
                <p lang="ja" className="text-sm text-mirai-text-muted">
                  {section.heading.ja}
                </p>
              </div>
              <ListTag
                className={
                  // ol を flex にすると番号が出ないブラウザがあるため space-y で並べる
                  section.isSteps
                    ? "list-decimal space-y-4 pl-6"
                    : "flex flex-col gap-4"
                }
              >
                {section.paragraphs.map((paragraph) =>
                  section.isSteps ? (
                    <li key={paragraph.ja}>
                      <GuideParagraph paragraph={paragraph} />
                    </li>
                  ) : (
                    <GuideParagraph key={paragraph.ja} paragraph={paragraph} />
                  )
                )}
              </ListTag>
            </section>
          );
        })}

        <nav
          aria-label={text.otherLanguagesLabel}
          className="flex flex-col gap-3"
        >
          <Button asChild className="self-start">
            <Link href={routes.home()} hrefLang="ja">
              <House aria-hidden="true" strokeWidth={2.75} />
              <span>{text.openTopPageLabel}</span>
            </Link>
          </Button>
          <p className="font-semibold">{text.otherLanguagesLabel}</p>
          <GuideLanguageLinks currentLocale={locale} />
        </nav>
      </article>
    </Container>
  );
}

function GuideParagraph({ paragraph }: { paragraph: GuideTextPair }) {
  return (
    <div className="flex flex-col gap-1">
      <p>{paragraph.translated}</p>
      <p lang="ja" className="text-mirai-text-muted">
        {paragraph.ja}
      </p>
    </div>
  );
}
