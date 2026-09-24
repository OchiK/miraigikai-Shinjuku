import { siteConfig } from "@/config/site.config";
import type { UiMessages } from "@/features/i18n/shared/ui-messages";
import { routes } from "@/lib/routes";

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterPolicyLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterMessages = UiMessages["footer"];

export function getPrimaryLinks(messages: FooterMessages): FooterLink[] {
  return [
    {
      label: messages.top,
      href: routes.home(),
    },
    ...(siteConfig.externalLinks.aboutNote
      ? [
          {
            label: messages.aboutSite,
            href: siteConfig.externalLinks.aboutNote,
            external: true,
          },
        ]
      : []),
    // チームみらいの案内は党の公式サービスとして出すときだけ。日本語のみ
    ...(siteConfig.features.showTeamMiraiSection
      ? ([
          {
            label: "チームみらいについて",
            href: siteConfig.externalLinks.teamAbout,
            external: true,
          },
          {
            label: "寄附で応援する",
            href: siteConfig.externalLinks.donation,
            external: true,
          },
        ] as FooterLink[])
      : []),
  ];
}

export function getPolicyLinks(messages: FooterMessages): FooterPolicyLink[] {
  return [
    {
      label: messages.faq,
      href: routes.faq(),
    },
    {
      label: messages.terms,
      href: routes.terms(),
    },
    {
      label: messages.privacy,
      href: routes.privacy(),
    },
    {
      label: messages.sourceCode,
      href: siteConfig.operator.contactUrl,
      external: true,
    },
  ];
}
