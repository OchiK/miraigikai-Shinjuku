export type LegalDocumentListItem =
  | string
  | {
      id: string;
      label: string;
      content: string;
    };

export type LegalDocumentSubsection = {
  title?: string;
  paragraphs?: string[];
  items?: LegalDocumentListItem[];
};

export type LegalDocumentSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: LegalDocumentListItem[];
  subsections?: LegalDocumentSubsection[];
};

export type LegalDocument = {
  title: string;
  description: string;
  lastUpdated: string;
  referenceNotice?: string;
  introduction?: string;
  sections: LegalDocumentSection[];
};
