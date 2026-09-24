import type { TranslationLocale } from "@mirai-gikai/shared/i18n/locales";

/**
 * 翻訳まわりの UI 文言（docs/I18N_AND_EASY_JAPANESE.md「UI翻訳と議案翻訳を分ける」）。
 * UI 文言はコードで管理し、議案本文の翻訳は DB で管理する。
 *
 * 各言語の文は日本語の文と必ず並べて出す。日本語以外の文言はどれも
 * ネイティブ話者の確認前のため、日本語側を正とする。
 */
type TranslationMessages = {
  /** 翻訳ページに必ず出す注意書き */
  translatedNotice: string;
  /** 翻訳が無く日本語を表示しているときの案内 */
  unavailableNotice: string;
};

export const TRANSLATION_MESSAGES: Record<
  TranslationLocale,
  TranslationMessages
> = {
  en: {
    translatedNotice:
      "This translation was made from the official Japanese materials and is for reference only. To confirm the details, please use the official Japanese materials.",
    unavailableNotice:
      "This content is not yet available in English. It is shown in Japanese.",
  },
  "zh-Hans": {
    translatedNotice:
      "本译文根据日语官方资料制作，仅供参考。如需确认内容，请查阅日语官方资料。",
    unavailableNotice: "此内容尚无简体中文版本，现以日语显示。",
  },
  ko: {
    translatedNotice:
      "이 번역은 일본어 공식 자료를 바탕으로 작성한 참고 정보입니다. 내용 확인은 일본어 공식 자료를 이용해 주십시오.",
    unavailableNotice:
      "이 내용은 아직 한국어로 제공되지 않습니다. 일본어로 표시합니다.",
  },
  ne: {
    translatedNotice:
      "यो अनुवाद जापानी आधिकारिक सामग्रीको आधारमा तयार गरिएको सन्दर्भ जानकारी हो। विवरण पुष्टि गर्न कृपया जापानी आधिकारिक सामग्री हेर्नुहोस्।",
    unavailableNotice:
      "यो विषयवस्तु अहिलेसम्म नेपालीमा उपलब्ध छैन। जापानी भाषामा देखाइएको छ।",
  },
  my: {
    translatedNotice:
      "ဤဘာသာပြန်ချက်သည် ဂျပန်ဘာသာ တရားဝင်စာရွက်စာတမ်းများကို အခြေခံ၍ ပြုစုထားသော ကိုးကားရန် အချက်အလက်ဖြစ်ပါသည်။ အကြောင်းအရာကို အတည်ပြုရန် ဂျပန်ဘာသာ တရားဝင်စာရွက်စာတမ်းများကို ကြည့်ရှုပါ။",
    unavailableNotice:
      "ဤအကြောင်းအရာကို မြန်မာဘာသာဖြင့် မရရှိနိုင်သေးပါ။ ဂျပန်ဘာသာဖြင့် ပြသထားပါသည်။",
  },
  vi: {
    translatedNotice:
      "Bản dịch này được soạn dựa trên tài liệu chính thức bằng tiếng Nhật và chỉ mang tính tham khảo. Vui lòng xem tài liệu chính thức bằng tiếng Nhật để xác nhận nội dung.",
    unavailableNotice:
      "Nội dung này chưa có bản tiếng Việt. Nội dung được hiển thị bằng tiếng Nhật.",
  },
};

/** 日本語の案内文の中で使う言語名 */
export const LOCALE_JA_NAMES: Record<TranslationLocale, string> = {
  en: "英語",
  "zh-Hans": "中国語（簡体字）",
  ko: "韓国語",
  ne: "ネパール語",
  my: "ミャンマー語",
  vi: "ベトナム語",
};

/** 日本語の注意書き（docs/I18N_AND_EASY_JAPANESE.md「翻訳原則」の文言そのまま） */
export const JA_TRANSLATED_NOTICE =
  "この翻訳は日本語の公式資料をもとに作成した参考情報です。内容の確認には日本語の公式資料をご利用ください。";

export function jaUnavailableNotice(languageName: string): string {
  return `この内容はまだ${languageName}に翻訳されていません。日本語で表示しています。`;
}

/** トップページの多言語案内で、議案の英訳へ切り替える行の見出し */
export const ENGLISH_BILLS_LABEL = "Read the bills in English";

/** 言語切替の見出し。どの言語の話者にも見つけられるよう日英併記 */
export const LANGUAGE_SELECTOR_LABEL = "言語 / Language";
