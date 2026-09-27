import "server-only";

import {
  LegalList,
  LegalParagraph,
  LegalSectionTitle,
  LegalSubSectionTitle,
} from "@/components/layouts/legal-page-layout";
import type {
  LegalDocument,
  LegalDocumentListItem,
} from "../../shared/legal-document";

type LegalDocumentContentProps = {
  document: LegalDocument;
};

function renderListItems(items: LegalDocumentListItem[]) {
  return items.map((item) => {
    if (typeof item === "string") {
      return item;
    }

    return {
      id: item.id,
      content: (
        <>
          <span className="font-semibold">{item.label}</span>
          {item.content}
        </>
      ),
    };
  });
}

function renderParagraph(paragraph: string, index: number) {
  if (paragraph.startsWith("https://")) {
    return (
      <LegalParagraph key={`${paragraph}-${index}`}>
        <a
          href={paragraph}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {paragraph}
        </a>
      </LegalParagraph>
    );
  }

  return (
    <LegalParagraph key={`${paragraph}-${index}`}>{paragraph}</LegalParagraph>
  );
}

export function LegalDocumentContent({ document }: LegalDocumentContentProps) {
  return (
    <>
      <LegalParagraph className="text-right">
        {document.lastUpdated}
      </LegalParagraph>

      {document.referenceNotice ? (
        <LegalParagraph className="rounded-xl bg-neutral-200 p-4">
          {document.referenceNotice}
        </LegalParagraph>
      ) : null}

      {document.introduction ? (
        <LegalParagraph>{document.introduction}</LegalParagraph>
      ) : null}

      {document.sections.map((section) => (
        <section key={section.id} className="space-y-4">
          <LegalSectionTitle>{section.title}</LegalSectionTitle>
          {section.paragraphs?.map(renderParagraph)}
          {section.items ? (
            <LegalList items={renderListItems(section.items)} />
          ) : null}
          {section.subsections?.map((subsection) => (
            <div
              key={subsection.title ?? subsection.paragraphs?.[0]}
              className="space-y-3"
            >
              {subsection.title ? (
                <LegalSubSectionTitle>{subsection.title}</LegalSubSectionTitle>
              ) : null}
              {subsection.paragraphs?.map(renderParagraph)}
              {subsection.items ? (
                <LegalList items={renderListItems(subsection.items)} />
              ) : null}
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
