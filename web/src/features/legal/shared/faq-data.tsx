import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import type { ReactNode } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";

export type FaqItem = {
  question: string;
  answer: ReactNode;
};

const japaneseFaqItems: FaqItem[] = [
  {
    question: `${siteConfig.siteName}とは何ですか？`,
    answer: (
      <>
        {siteConfig.siteDescription}
        。議案の情報収集や解説にAIを活用し、市民の皆さまが議会の動向を把握しやすくすることを目的としています。
      </>
    ),
  },
  {
    question: "チームみらいの公式サービスですか？",
    answer: (
      <>
        いいえ、{siteConfig.siteName}
        はチームみらいの公式サービスではありません。「チームみらい」が開発・公開した「みらい議会」をベースに、有志が独自に運営している非公式サービスです。
        <br />
        ご意見・不具合等は、チームみらい公式ではなく、開発者（
        <a
          href={siteConfig.operator.contactUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {siteConfig.operator.name}
        </a>
        ）にご連絡ください。
      </>
    ),
  },
  {
    question: "議案の情報はどこから取得していますか？",
    answer: (
      <>
        <a
          href={siteConfig.councilBillsDetailUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {siteConfig.councilName}公式サイト
        </a>
        に公開されている情報をもとに掲載しています。最新情報や正確な内容については公式サイトをご確認ください。
      </>
    ),
  },
  {
    question: "AIによる解説・回答は正確ですか？",
    answer:
      "AIが生成する解説・回答は参考情報であり、正確性・完全性・最新性を保証するものではありません。重要な判断の際は必ず公式情報をご確認ください。",
  },
  {
    question: "個人情報はどのように扱われますか？",
    answer: (
      <>
        詳細は
        <Link href={routes.privacy()} className="underline underline-offset-2">
          プライバシーポリシー
        </Link>
        をご確認ください。AIチャット・インタビュー機能への入力内容には個人情報を含めないようお願いします。
      </>
    ),
  },
  {
    question: "不具合や意見はどこに連絡すればいいですか？",
    answer: (
      <>
        開発者（
        <a
          href={siteConfig.operator.contactUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {siteConfig.operator.name}
        </a>
        ）までご連絡ください。なお、チームみらいの公式窓口への連絡はご遠慮ください。
      </>
    ),
  },
  {
    question: "AIアシスタントとの対話履歴はサーバー上に残りますか？",
    answer: (
      <div className="space-y-3">
        <p>
          AIアシスタントとの対話内容（質問や回答など）をサーバー上に保管しています。これは、以下の目的のために行っています。
        </p>
        <ul>
          <li>・サービス品質の向上（回答内容の改善・バグ修正など）</li>
          <li>・不正利用やシステム障害の検知・防止</li>
        </ul>
        <p>
          また、将来的には、対話履歴をもとに以下のような機能を提供する可能性があります。
        </p>
        <ul>
          <li>
            ・利用者ごとの対話継続性の確保（過去の質問内容を踏まえた応答）
          </li>
          <li>・パーソナライズされた体験（おすすめ議案の提示など）</li>
        </ul>
        <p>
          保存されたデータは、厳重なセキュリティのもと管理され、第三者に提供されることはありません。
        </p>
      </div>
    ),
  },
  {
    question: "「注目の議案」はどのような基準で選ばれているのでしょうか？",
    answer:
      "議案の内容や報道の状況などを見ながら、注目度の高い議案を開発者で選定しています。",
  },
  {
    question: "ふりがな（ルビ）はどのようにふっているのですか？",
    answer:
      "ふりがな（ルビ）は、一般財団法人ルビ財団の「ルビフルボタン」というサービスを使用して、自動で表示しています。固有名詞などふりがなが不正確な箇所については、今後手動で正しいふりがなに変更していく予定です。",
  },
];

const englishFaqItems: FaqItem[] = [
  {
    question: `What is ${siteConfig.english.siteName}?`,
    answer: `${siteConfig.english.siteName} is ${siteConfig.english.siteDescription}. It uses AI to gather and explain bill information so residents can follow council activity more easily.`,
  },
  {
    question: "Is this an official service of Team Mirai?",
    answer: (
      <>
        No. {siteConfig.english.siteName} is an independent, unofficial service
        based on Mirai Gikai, which Team Mirai developed and released. For
        feedback or bug reports, contact the developer,{" "}
        <a
          href={siteConfig.operator.contactUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {siteConfig.english.operatorName}
        </a>
        , rather than Team Mirai.
      </>
    ),
  },
  {
    question: "Where does the bill information come from?",
    answer: (
      <>
        The information comes from the{" "}
        <a
          href={siteConfig.councilBillsDetailUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          official {siteConfig.english.councilName} website
        </a>
        . Check the official website for the latest and authoritative
        information.
      </>
    ),
  },
  {
    question: "Are the AI-generated explanations and answers accurate?",
    answer:
      "AI-generated explanations and answers are for reference only. Their accuracy, completeness, and timeliness are not guaranteed. Check official sources before making an important decision.",
  },
  {
    question: "How is personal information handled?",
    answer: (
      <>
        See the{" "}
        <Link href={routes.privacy()} className="underline underline-offset-2">
          Privacy Policy
        </Link>
        . Do not include personal information in questions or responses
        submitted through the AI chat or interview features.
      </>
    ),
  },
  {
    question: "Where can I report a bug or send feedback?",
    answer: (
      <>
        Contact the developer,{" "}
        <a
          href={siteConfig.operator.contactUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {siteConfig.english.operatorName}
        </a>
        . Please do not contact Team Mirai about this service.
      </>
    ),
  },
  {
    question: "Is my AI assistant conversation history stored on a server?",
    answer: (
      <div className="space-y-3">
        <p>
          Yes. Questions, answers, and other conversation content are stored to
          improve response quality, fix bugs, and detect or prevent misuse and
          system failures.
        </p>
        <p>
          Conversation history may also support future features such as
          continuing earlier conversations or recommending bills. Stored data is
          protected with security controls and is not provided to third parties.
        </p>
      </div>
    ),
  },
  {
    question: 'How are "Featured Bills" selected?',
    answer:
      "The developer selects bills based on their content, level of public interest, and news coverage.",
  },
  {
    question: "How are furigana generated?",
    answer:
      "Furigana are displayed automatically using the Rubyful Button service provided by the Ruby Foundation. Readings for proper names may be inaccurate and will be corrected manually over time.",
  },
];

export function getFaqItems(locale: PublicLocale): FaqItem[] {
  return locale === "en" ? englishFaqItems : japaneseFaqItems;
}
