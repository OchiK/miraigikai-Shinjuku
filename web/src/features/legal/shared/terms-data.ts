import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { siteConfig } from "@/config/site.config";
import type { LegalDocument } from "./legal-document";

const japaneseTerms: LegalDocument = {
  title: "利用規約",
  description: `${siteConfig.siteName}をご利用いただくにあたっての基本的なルールを定めています。`,
  lastUpdated: "最終更新日：2026年3月24日",
  introduction: `${siteConfig.siteName}（以下「本サービス」といいます。）をご利用いただく場合、以下の規約に同意いただいたものとみなします。`,
  sections: [
    {
      id: "prohibited-conduct",
      title: "第1条（禁止事項）",
      paragraphs: [
        "ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。",
      ],
      subsections: [
        {
          title: "不適切な投稿・入力行為",
          paragraphs: [
            "以下の内容を含む投稿、AIへの入力、または対話を行うことを禁止します。",
          ],
          items: [
            "個人情報の掲載：氏名、住所、電話番号、メールアドレス、SNS ID、口座番号、所属組織等、本人・他人を問わず特定の個人を識別できる情報の入力（当組織が別途入力を依頼した場合を除きます。）。",
            "法令違反：犯罪予告、薬物・武器の製造情報の流布、公職選挙法違反、その他法令に抵触する、または助長する行為。",
            "権利侵害：第三者の著作権、肖像権、プライバシー権、名誉、信用を毀損・侵害する行為。",
            "危害の予告：自殺・自傷行為の示唆、他人への攻撃的な脅迫、犯罪の予告。",
            "公序良俗違反：わいせつ、暴力的、猟奇的な表現、差別的発言、動物虐待に関連する不快な内容、ヘイトスピーチ、および一般人が不快と感じる内容。",
            "誹謗中傷・過度な批判：特定の個人や団体に対する人格否定、侮辱、嫌がらせ。",
            "不謹慎・配慮欠如：事件事故の被害者や遺族の感情を逆なでするような投稿。",
            "関連性のない内容：本サービスの趣旨や内容と全く無関係な投稿、私的な交流。",
            "虚偽情報の拡散：明らかな偽情報、誤情報により社会的な混乱や健康被害を招くおそれのある行為。",
            "宣伝・営業活動：商業目的の広告、布教活動、特定のサイトへの誘導、またはこれらに準ずる行為。",
            "その他：当組織が社会通念上不適切と判断する一切の投稿。",
          ],
        },
        {
          title: "システムの不正利用および運営妨害",
          items: [
            "本サービスの運営を妨げる行為、または同一内容を執拗に繰り返すなどの荒らし行為。",
            "本サービスの情報を改ざん・加工し、誤解を招く形で利用する行為。",
            "サーバへの過剰な負荷、システムへの妨害・侵入・解析（リバースエンジニアリング等）行為。",
            "自動化ツール、ボット等による不正操作。",
            "AIモデルの悪用：システムプロンプト等の内部設定の推測、プロンプトインジェクション等による意図的な誤動作の誘発。",
            `目的外利用：「${siteConfig.siteName}」の趣旨（議案等の関連テーマ）を著しく逸脱した応答を生成させる行為。`,
            "なりすまし：他の人物や組織になりすまして本サービスを利用する行為。",
          ],
        },
      ],
    },
    {
      id: "violations",
      title: "第2条（違反行為への対応）",
      paragraphs: [
        "当組織は、ユーザーが前条の禁止事項に該当すると判断した場合、事前に通知することなく以下の措置を講じることができるものとします。",
      ],
      items: [
        "当該対話ログ、投稿、または回答内容の削除",
        "本サービスの利用停止、制限、またはアカウントの凍結",
        "その他、当組織が必要と判断する適切な措置",
      ],
    },
    {
      id: "ai-interviews",
      title: "第3条（AIインタビューの回答およびログの取り扱い）",
      items: [
        {
          id: "publish-consent",
          label: "公開と同意：",
          content:
            "AIインタビューを通じて取得した回答ログおよびサマリーは、ユーザー本人が公開に同意した場合、当組織の運営するサービス上で公開されることがあります。",
        },
        {
          id: "internal-analysis",
          label: "内部分析利用：",
          content:
            "本人が公開に同意しなかったデータについても、当組織内においてサービス向上や地域課題の集約・分析の目的で共有・活用されるものとし、ユーザーはこれに同意するものとします。",
        },
        {
          id: "rights-attribution",
          label: "権利の帰属：",
          content:
            "本サービスを通じて生成された応答や対話ログに関する権利（著作権法第27条および第28条の権利を含みます。）は、当組織に帰属するか、または無償で利用（複製、加工、公表等）することを許諾したものとみなします。なお、公表については、当組織は、第1項のとおりユーザー本人が公表に同意した場合のみ実施するものとします。",
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "第4条（知的財産権）",
      paragraphs: [
        "本サービスの提供に用いられるプログラム、コンテンツ、テキスト、画像等に関する一切の権利は、当組織または正当な権利者に帰属します。ユーザーは私的利用の範囲を超えてこれらを使用してはなりません。",
      ],
    },
    {
      id: "warranties",
      title: "第5条（情報に係る不保証）",
      paragraphs: [
        "当組織は、本サービス（AIによる回答を含む）が提供する情報の正確性、完全性、最新性、有用性、真実性等について、いかなる保証も行いません。",
        "AIによる応答は、その性質上、誤った情報を生成する可能性があることを理解した上で利用するものとします。",
      ],
    },
    {
      id: "service-changes",
      title: "第6条（サービスの変更・停止）",
      paragraphs: [
        "当組織は、ユーザーへの事前通知なく本サービスの内容を変更・停止できるものとし、それにより生じた損害について一切の責任を負いません。",
      ],
    },
    {
      id: "terms-changes",
      title: "第7条（規約の変更）",
      paragraphs: [
        "当組織は必要に応じて本規約を変更することができ、変更後にユーザーが本サービスを利用した場合、当該変更に同意したものとみなします。",
      ],
    },
    {
      id: "governing-law",
      title: "第8条（準拠法・管轄）",
      paragraphs: [
        `本規約は日本法に準拠し、本サービスに関連して生じる一切の紛争については、${siteConfig.operator.jurisdiction}を第一審の専属的合意管轄裁判所とします。`,
      ],
    },
  ],
};

const englishTerms: LegalDocument = {
  title: "Terms of Service",
  description: `These terms set out the basic rules for using ${siteConfig.english.siteName}.`,
  lastUpdated: "Last updated: March 24, 2026",
  referenceNotice:
    "This English translation is provided for reference purposes only. The Japanese version is the original and governing agreement.",
  introduction: `By using ${siteConfig.english.siteName} (the “Service”), you agree to these Terms of Service.`,
  sections: [
    {
      id: "prohibited-conduct",
      title: "Article 1 (Prohibited Conduct)",
      paragraphs: [
        "Users must not engage in any of the following conduct when using the Service.",
      ],
      subsections: [
        {
          title: "Inappropriate posts and input",
          paragraphs: [
            "Users must not submit posts, AI input, or conversations containing any of the following:",
          ],
          items: [
            "Personal information: Information that can identify a person, including a name, address, telephone number, email address, social media ID, bank account number, or organizational affiliation, whether it concerns the user or someone else, unless the operator specifically requests it.",
            "Illegal conduct: Threats of crime, distribution of information about producing drugs or weapons, violations of election law, or other conduct that violates or promotes violations of law.",
            "Infringement of rights: Conduct that infringes or damages a third party’s copyright, portrait rights, privacy, honor, or reputation.",
            "Threats of harm: References to suicide or self-harm, aggressive threats against others, or threats to commit a crime.",
            "Conduct contrary to public order or morals: Obscene, violent, or grotesque expression; discriminatory remarks; disturbing content involving animal abuse; hate speech; or other content generally considered offensive.",
            "Defamation or excessive criticism: Personal attacks, insults, or harassment directed at a person or organization.",
            "Insensitive conduct: Posts that show disregard for the feelings of victims of an incident or accident, or their families.",
            "Unrelated content: Posts or private exchanges wholly unrelated to the purpose or content of the Service.",
            "Spread of false information: Conduct that may cause social disruption or harm to health by spreading clearly false or misleading information.",
            "Advertising or solicitation: Commercial advertising, religious solicitation, directing users to a particular website, or similar conduct.",
            "Other inappropriate conduct: Any other post that the operator reasonably considers socially inappropriate.",
          ],
        },
        {
          title: "System misuse and interference with operations",
          items: [
            "Interfering with operation of the Service or repeatedly submitting the same content in a disruptive manner.",
            "Altering or processing information from the Service and using it in a misleading manner.",
            "Placing an excessive load on servers or attempting to disrupt, access, or analyze the system, including through reverse engineering.",
            "Using automated tools, bots, or similar means for unauthorized operations.",
            "Misusing AI models by attempting to infer internal settings such as system prompts or deliberately causing incorrect behavior through prompt injection or similar methods.",
            `Generating responses that substantially depart from the purpose of ${siteConfig.english.siteName}, including its focus on bills and related topics.`,
            "Impersonating another person or organization when using the Service.",
          ],
        },
      ],
    },
    {
      id: "violations",
      title: "Article 2 (Measures Against Violations)",
      paragraphs: [
        "If the operator determines that a user has engaged in conduct prohibited by the preceding article, the operator may take any of the following measures without prior notice:",
      ],
      items: [
        "Delete the relevant conversation log, post, or response.",
        "Suspend or restrict use of the Service, or freeze the user’s account.",
        "Take any other measure the operator considers appropriate and necessary.",
      ],
    },
    {
      id: "ai-interviews",
      title: "Article 3 (AI Interview Responses and Logs)",
      items: [
        {
          id: "publish-consent",
          label: "Publication and consent: ",
          content:
            "Response logs and summaries collected through AI interviews may be published on a service operated by the operator when the user has consented to publication.",
        },
        {
          id: "internal-analysis",
          label: "Internal analysis: ",
          content:
            "Even when a user does not consent to publication, the operator may share and use the data internally to improve the Service and to aggregate and analyze local issues. The user agrees to this internal use.",
        },
        {
          id: "rights-attribution",
          label: "Rights: ",
          content:
            "Rights in responses and conversation logs generated through the Service, including the rights under Articles 27 and 28 of the Copyright Act of Japan, belong to the operator, or the user is deemed to grant the operator a royalty-free license to reproduce, modify, publish, and otherwise use them. The operator will publish them only when the user has consented as described in the first item above.",
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Article 4 (Intellectual Property Rights)",
      paragraphs: [
        "All rights in the programs, content, text, images, and other materials used to provide the Service belong to the operator or their lawful owners. Users must not use these materials beyond the scope of private use.",
      ],
    },
    {
      id: "warranties",
      title: "Article 5 (Disclaimer of Warranties)",
      paragraphs: [
        "The operator makes no warranty regarding the accuracy, completeness, timeliness, usefulness, or truthfulness of information provided through the Service, including AI-generated responses.",
        "Users acknowledge that AI-generated responses may contain incorrect information.",
      ],
    },
    {
      id: "service-changes",
      title: "Article 6 (Modification and Discontinuation of the Service)",
      paragraphs: [
        "The operator may modify or discontinue the Service without prior notice and is not liable for damages resulting from such modification or discontinuation.",
      ],
    },
    {
      id: "terms-changes",
      title: "Article 7 (Modification of These Terms)",
      paragraphs: [
        "The operator may modify these Terms when necessary. A user who uses the Service after a modification is deemed to have agreed to the modified Terms.",
      ],
    },
    {
      id: "governing-law",
      title: "Article 8 (Governing Law and Jurisdiction)",
      paragraphs: [
        "These Terms are governed by the laws of Japan. The Tokyo District Court has exclusive jurisdiction as the court of first instance over all disputes arising in connection with the Service.",
      ],
    },
  ],
};

export function getTermsContent(locale: PublicLocale): LegalDocument {
  return locale === "en" ? englishTerms : japaneseTerms;
}
