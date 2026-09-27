import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { siteConfig } from "@/config/site.config";
import type { LegalDocument } from "./legal-document";

const japanesePrivacy: LegalDocument = {
  title: "プライバシーポリシー",
  description: `${siteConfig.siteName}における個人情報の取り扱いについてご説明します。`,
  lastUpdated: "最終更新日：2026年3月24日",
  sections: [
    {
      id: "definition",
      title: "1. 個人情報の定義",
      paragraphs: [
        "個人情報とは、以下のような情報であって、特定の個人を識別することができるものを指します。",
      ],
      items: [
        "氏名、年齢、性別、住所、電話番号、職業、メールアドレス",
        "個人ごとに割り当てられたIDやパスワード、その他識別可能な記号",
        "当組織の提供するサービスであるみらい議会におけるAIインタビュー機能（以下「みらい議会AIインタビュー機能」といいます。）を通じて取得される対話ログ、音声データ、および行動履歴",
        "他の情報と容易に照合することができ、それにより特定の個人を識別できることとなるもの",
      ],
    },
    {
      id: "collection-and-use",
      title: "2. 個人情報の収集方法と使用範囲",
      paragraphs: [
        "個人情報をご提供いただく際には、ユーザーの同意に基づいて行うことを原則とします。また、当組織は、以下に定める目的での利用を除き、個人情報を無断で利用することはありません。",
      ],
      items: [
        "ユーザーが利用する当組織のサービス（以下「当組織サービス」といいます。）の運営およびそれに伴うユーザーとのやりとり・情報提供",
        "当組織サービスの安全な運営に必要な不正対策",
        "当組織サービスの改善・新規開発",
        "新宿区政・区議会に関する情報提供および市民意見の集約・分析",
        "当組織サービスに係る情報提供および改善",
        "上記の各利用目的に必要な各種調査・分析",
        "「3. 第三者への情報提供について」に定める場合における第三者への開示・提供",
      ],
      subsections: [
        {
          paragraphs: [
            "なお、みらい議会AIインタビュー機能を通じて当組織が取得した回答内容については、当組織は、以下の通り取り扱います。",
          ],
          items: [
            "ユーザーが回答した内容は、本人が明示的に拒否した場合を除き、当ウェブサイトや報告書等で公開される可能性があります。",
            "統計的利用：取得したデータは、個人を特定できない統計情報に加工した上で、第三者へ公表する場合があります。",
          ],
        },
      ],
    },
    {
      id: "third-parties",
      title: "3. 第三者への情報提供について",
      paragraphs: [
        "以下のいずれかに該当する場合を除き、個人情報を第三者に開示・提供することはありません。",
      ],
      items: [
        "「2. 個人情報の収集方法と使用範囲」に定めるみらい議会AIインタビュー機能を通じて当組織が取得した回答内容の公開",
        "利用者本人の同意がある場合",
        "統計的なデータなど、個人を特定できない状態で提供する場合",
        "法令に基づく開示請求（裁判所・警察等）があった場合",
        "不正アクセスや規約違反など、緊急の対応が必要と判断された場合",
      ],
    },
    {
      id: "security",
      title: "4. 安全管理措置",
      paragraphs: [
        "個人情報の適切な管理を行うために、責任者を定め、厳正な管理体制を構築しています。AI処理に伴うデータ保管についても、最新のセキュリティ対策を講じます。",
      ],
    },
    {
      id: "cookies",
      title: "5. Cookie（クッキー）について",
      paragraphs: [
        "当ウェブサイトでは、利便性向上とアクセス解析（Googleアナリティクス等）のためにCookieを使用しています。これらは匿名で収集され、個人を特定するものではありません。",
      ],
    },
    {
      id: "retention",
      title: "6. 保管期間と廃棄",
      paragraphs: [
        "取得した個人情報および対話ログは、利用目的に応じて必要な期間保管した後、適切な方法で廃棄・削除します。",
      ],
    },
    {
      id: "revisions",
      title: "7. 改訂と通知",
      paragraphs: [
        "本ポリシーは必要に応じて改訂されます。改訂内容はウェブサイトへの掲載をもって効力を生じるものとし、個別の通知は行いません。",
      ],
    },
    {
      id: "contact",
      title: "8. お問い合わせ窓口",
      paragraphs: [
        "個人情報の確認・修正・削除、またはみらい議会AIインタビュー機能の回答公開に関する取り消し等のご相談は、下記までご連絡ください。",
        "お問い合わせ窓口",
        `${siteConfig.operator.name} 個人情報保護管理責任者`,
        siteConfig.operator.contactUrl,
      ],
    },
  ],
};

const englishPrivacy: LegalDocument = {
  title: "Privacy Policy",
  description: `This policy explains how ${siteConfig.english.siteName} handles personal information.`,
  lastUpdated: "Last updated: March 24, 2026",
  referenceNotice:
    "This English translation is provided for reference purposes only. The Japanese version is the original and governing policy.",
  sections: [
    {
      id: "definition",
      title: "1. Definition of Personal Information",
      paragraphs: [
        "Personal information means information such as the following that can identify a specific individual:",
      ],
      items: [
        "Name, age, gender, address, telephone number, occupation, and email address.",
        "An ID, password, or other identifying code assigned to an individual.",
        "Conversation logs, audio data, and activity history collected through the AI interview feature of Mirai Gikai operated by the operator (the “Mirai Gikai AI Interview Feature”).",
        "Information that can be readily cross-referenced with other information to identify a specific individual.",
      ],
    },
    {
      id: "collection-and-use",
      title: "2. Collection Methods and Scope of Use",
      paragraphs: [
        "As a rule, the operator collects personal information with the user’s consent. The operator will not use personal information without permission except for the following purposes:",
      ],
      items: [
        "Operating services used by the user (the “Operator Services”) and communicating with or providing information to the user in connection with those services.",
        "Preventing fraud and misuse as necessary for the safe operation of the Operator Services.",
        "Improving the Operator Services and developing new services.",
        "Providing information about Shinjuku City government and the Shinjuku City Council, and aggregating and analyzing residents’ views.",
        "Providing information about and improving the Operator Services.",
        "Conducting research and analysis necessary for the purposes listed above.",
        "Disclosing or providing information to third parties in the circumstances described in Section 3.",
      ],
      subsections: [
        {
          paragraphs: [
            "The operator handles responses collected through the Mirai Gikai AI Interview Feature as follows:",
          ],
          items: [
            "A user’s responses may be published on this website, in reports, or elsewhere unless the user expressly declines publication.",
            "Statistical use: Collected data may be processed into statistical information that cannot identify an individual and then disclosed to third parties.",
          ],
        },
      ],
    },
    {
      id: "third-parties",
      title: "3. Provision to Third Parties",
      paragraphs: [
        "The operator will not disclose or provide personal information to a third party except in the following circumstances:",
      ],
      items: [
        "Publishing responses collected through the Mirai Gikai AI Interview Feature as described in Section 2.",
        "The user has consented.",
        "The information is provided in a form, such as statistical data, that cannot identify an individual.",
        "Disclosure is requested under law by a court, the police, or another authorized body.",
        "The operator determines that urgent action is necessary in response to unauthorized access, a violation of the Terms of Service, or similar conduct.",
      ],
    },
    {
      id: "security",
      title: "4. Security Control Measures",
      paragraphs: [
        "The operator appoints a person responsible for personal information and maintains a strict management system. The operator also applies current security measures to data stored for AI processing.",
      ],
    },
    {
      id: "cookies",
      title: "5. Cookies and Web Analytics",
      paragraphs: [
        "This website uses cookies to improve convenience and analyze traffic through services such as Google Analytics. The data is collected anonymously and does not identify individuals.",
      ],
    },
    {
      id: "retention",
      title: "6. Retention Period and Disposal",
      paragraphs: [
        "The operator retains collected personal information and conversation logs for the period necessary for their purpose of use, then disposes of or deletes them using an appropriate method.",
      ],
    },
    {
      id: "revisions",
      title: "7. Revisions and Notifications",
      paragraphs: [
        "The operator may revise this Policy when necessary. A revision takes effect when posted on the website, and users will not receive individual notice.",
      ],
    },
    {
      id: "contact",
      title: "8. Contact Desk",
      paragraphs: [
        "Contact the following desk to request confirmation, correction, or deletion of personal information, to withdraw permission to publish responses from the Mirai Gikai AI Interview Feature, or to discuss another privacy matter.",
        "Contact desk",
        `${siteConfig.english.operatorName}, Personal Information Protection Officer`,
        siteConfig.operator.contactUrl,
      ],
    },
  ],
};

export function getPrivacyContent(locale: PublicLocale): LegalDocument {
  return locale === "en" ? englishPrivacy : japanesePrivacy;
}
