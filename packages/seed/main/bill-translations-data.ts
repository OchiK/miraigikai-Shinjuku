import { billContentsWithBillSlug } from "./bill-contents-data";
import { type SeededBillRef, requireBillBySlug } from "./bill-ref";
import { gianKey, shoninKey } from "./shinjuku-r8-2-inventory";

/**
 * 議案コンテンツの翻訳（多言語基盤の動作確認用）。
 *
 * 翻訳元は bill-contents-data.ts の同じ議案・同じ難易度の日本語で、
 * source_hash はその日本語から計算した値を固定している。日本語を直すと
 * bill-translations-data.test.ts が失敗するので、翻訳も直してから
 * ハッシュを更新すること（ハッシュだけ書き換えてはならない）。
 *
 * en 以外（zh-Hans / ko / ne / my / vi）は機械翻訳で、編集側にその言語を読める人が
 * いないため人の確認は受けていない（2026-09-24 時点）。確認済みと書かないこと。
 *
 * 人の確認が終わるまでは status を generated にする。reviewed へ移すときは
 * reviewed_at と reviewed_by も必ず設定する。公開画面は reviewed しか出さない。
 * 確認の手順は docs/20260923_1500_多言語基盤_ロケール方式の決定記録.md を参照。
 *
 * このデータは本番インポーター（packages/seed/production）の対象外。
 */
type BillTranslationSeed = {
  bill_slug: string;
  difficulty_level: "easy" | "normal" | "hard";
  locale: "en" | "zh-Hans" | "ko" | "ne" | "my" | "vi";
  model: string;
  prompt_version: string;
  source_hash: string;
  title: string;
  summary: string;
  content: string;
} & (
  | {
      status: "generated";
      reviewed_at?: never;
      reviewed_by?: never;
    }
  | {
      status: "reviewed";
      reviewed_at: string;
      reviewed_by: string;
    }
);

export const billTranslationsWithBillSlug: BillTranslationSeed[] = [
  // =========================================================================
  // 承認第2号 専決処分の承認について（新宿区特別区税条例の一部を改正する条例）
  // =========================================================================
  {
    bill_slug: shoninKey(2),
    difficulty_level: "normal",
    locale: "en",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-23",
    source_hash:
      "v1:cf454d4071aa261fa81a71908467471118e3cf79957552f673d830a80d4b197a",
    title:
      "Approval of the Mayor's emergency amendment to the Ward Tax Ordinance (light vehicle tax, housing loan deduction, etc.)",
    summary:
      "Because an amendment to the Local Tax Act was promulgated on March 31, 2026 (Reiwa 8) and took effect the next day, the Mayor amended the Ward Tax Ordinance without convening the Ward Assembly (専決処分). This item reports that action to the Ward Assembly and asks for its approval. The changes include abolishing the environmental performance levy on light vehicles and renaming the tax, and extending the housing loan deduction by five years. It was approved at the 2nd Regular Session of 2026 (Reiwa 8).",
    content: `# Approval of the Mayor's emergency amendment to the Ward Tax Ordinance (light vehicle tax, housing loan deduction, etc.)

## What "approval of a 専決処分" means

Amending a ward ordinance normally requires a vote of the Ward Assembly. However, Article 179, Paragraph 1 of the Local Autonomy Act (地方自治法, 昭和22年法律第67号) allows the Mayor to take action in place of the Assembly when the Mayor finds that the matter is especially urgent and it is clear that there is no time to convene the Assembly. This is called a 専決処分 (senketsu shobun).

When the Mayor has taken such an action, Paragraph 3 of the same Article requires the Mayor to report it to the next Assembly meeting and ask for approval. This item is that report and request for approval. That is why it is numbered "Approval No. 2" (承認第2号) rather than as a bill, and why its result is recorded as "approved" (承認) rather than "passed" (可決).

## When and why the Mayor acted

| Item | Details |
|------|------|
| Matter to be decided | Partial amendment of the Shinjuku Special Ward Tax Ordinance (新宿区特別区税条例, 昭和39年新宿区条例第57号) |
| Date of action | March 31, 2026 (Reiwa 8) |
| Public notice | Shinjuku Ward Public Notice No. 202 (新宿区告示第202号) |
| Reason | The Act Partially Amending the Local Tax Act, etc. (地方税法等の一部を改正する法律, 令和8年法律第2号) was promulgated on March 31, 2026 and takes effect on April 1 of the same year. The ward tax ordinance had to be amended and put into effect urgently in response, and it was clear that there was no time to convene the Ward Assembly. |

The explanation is that the national law was promulgated on March 31 and took effect the next day, April 1, so the ward ordinance also had to be in place by April 1, and there was no time to hold an Assembly meeting in between.

## What was amended

The ward's summary of submitted items lists four main changes.

### 1. Abolishing the environmental performance levy on light vehicles and renaming the tax

The environmental performance levy (環境性能割) of the light vehicle tax is abolished, and the current "annual levy by vehicle type" (種別割) is renamed "light vehicle tax" (軽自動車税). Until now, the light vehicle tax had two parts: the environmental performance levy and the annual levy by vehicle type. With the environmental performance levy gone, the name goes back to "light vehicle tax."

### 2. Review of the green special provision (reduced rates) for the light vehicle tax

The green special provision reduces the light vehicle tax rate for the fiscal year after the year in which the vehicle was acquired. Within it, the special provision for a 75% reduction is extended by two years, through fiscal 2028 (Reiwa 10).

### 3. Extending the housing loan deduction in the ward resident tax

The period covered by the ward resident tax housing loan deduction (住宅借入金等特別税額控除) is extended by five years, to include people who start living in the home by December 31, 2030 (Reiwa 12).

### 4. Review of the special tax provision for transferring land to develop quality residential land, etc.

- The deadline for applying the special provision is extended by three years, through fiscal 2029 (Reiwa 11).
- If, at the time of transfer, the transferred land is located in a landslide prevention area (地すべり防止区域), a steep slope collapse hazard area (急傾斜地崩壊危険区域), a special sediment disaster warning area (土砂災害特別警戒区域), or a flood damage prevention area (浸水被害防止区域), the special provision cannot be applied.

## When the changes apply

In principle, the changes apply from April 1, 2026, but some parts start later.

| Item | Effective date |
|------|------|
| General rule | April 1, 2026 (Reiwa 8) |
| Item 3 above (housing loan deduction extension) | January 1, 2027 (Reiwa 9) |
| The part of item 4 that excludes land in disaster hazard areas from the special provision | January 1, 2028 (Reiwa 10) |

For the light vehicle tax, the amended rules apply to fiscal 2026 and later. The annual levy by vehicle type for fiscal 2025 and earlier follows the previous rules. The environmental performance levy on light vehicles with three or more wheels acquired before the ordinance took effect also follows the previous rules.

## What happened to this item

It was approved at the 2nd Regular Session of 2026 (Reiwa 8) (session period: June 10 to June 19).`,
  },

  {
    bill_slug: shoninKey(2),
    difficulty_level: "normal",
    locale: "zh-Hans",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-24",
    source_hash:
      "v1:cf454d4071aa261fa81a71908467471118e3cf79957552f673d830a80d4b197a",
    title: "关于区长专决处分修改区税条例的承认（轻型汽车税、住房贷款扣除等）",
    summary: "由于《地方税法》修正案于令和8年（2026年）3月31日公布并于次日施行，区长在未召集区议会的情况下修改了区税条例（专决处分）。本案向区议会报告该处分并请求承认。主要内容包括废除轻型汽车税的环境性能部分并更改名称、将住房贷款扣除延长5年等。本案已在令和8年（2026年）第2次定例会上获得承认。",
    content: `# 关于区长专决处分修改区税条例的承认（轻型汽车税、住房贷款扣除等）

## 什么是“专决处分的承认”

修改区的条例，原本需要经过区议会表决。但是，《地方自治法》（地方自治法，昭和22年法律第67号）第179条第1款规定，当区长认为事项特别紧急、明显没有时间召集议会时，区长可以代替议会作出处分。这称为“专决处分”（専決処分）。

作出专决处分后，根据同条第3款，区长必须向下一次议会报告并请求承认。本案就是这一报告和承认请求。因此，本案的编号不是议案编号，而是“承认第2号”（承認第2号），表决结果也记为“承认”（承認），而不是“通过”（可決）。

## 何时、为何作出专决处分

| 项目 | 内容 |
|------|------|
| 应表决的事项 | 部分修改《新宿区特别区税条例》（新宿区特別区税条例，昭和39年新宿区条例第57号） |
| 处分日期 | 令和8年（2026年）3月31日 |
| 公告 | 新宿区公告第202号（新宿区告示第202号） |
| 理由 | 《部分修改地方税法等的法律》（地方税法等の一部を改正する法律，令和8年法律第2号）于令和8年3月31日公布，并自同年4月1日起施行。为此需要紧急修改并施行区税条例，而明显没有时间召集区议会。 |

说明的意思是：国家法律于3月31日公布、次日4月1日施行，区的条例也必须赶在4月1日前完成，其间没有时间召开议会。

## 修改的内容

区的提交案件概要列出了4项主要内容。

### 1. 废除轻型汽车税的环境性能部分并更改名称

废除轻型汽车税的“环境性能部分”（環境性能割），同时将现行的“车种部分”（種別割）更名为“轻型汽车税”（軽自動車税）。此前，轻型汽车税由环境性能部分和车种部分两部分组成。环境性能部分废除后，名称恢复为“轻型汽车税”。

### 2. 调整轻型汽车税的绿色化特例（减税）

绿色化特例是对取得车辆年度的下一年度的轻型汽车税减轻税率的制度。其中，适用75%减税的特例延长2年，至令和10年度（2028年度）。

### 3. 延长区民税住房贷款扣除的期限

区民税住房贷款扣除（住宅借入金等特別税額控除）的适用期限延长5年，适用于令和12年（2030年）12月31日前开始居住的人。

### 4. 调整为开发优良住宅用地等而转让土地时的课税特例

- 特例的适用期限延长3年，至令和11年度（2029年度）。
- 如果转让的土地在转让时位于滑坡防止区域（地すべり防止区域）、陡坡崩塌危险区域（急傾斜地崩壊危険区域）、泥石流灾害特别警戒区域（土砂災害特別警戒区域）或浸水灾害防止区域（浸水被害防止区域）内，则不能适用该特例。

## 何时开始适用

原则上自令和8年4月1日起适用，但部分内容的开始时间较晚。

| 对象 | 施行日期 |
|------|------|
| 原则 | 令和8年（2026年）4月1日 |
| 上述第3项（住房贷款扣除的延长） | 令和9年（2027年）1月1日 |
| 上述第4项中，将灾害危险区域内的土地排除在特例之外的部分 | 令和10年（2028年）1月1日 |

关于轻型汽车税，修改后的规定适用于令和8年度及以后年度。令和7年度及以前的车种部分按原规定处理。条例施行日前取得的三轮以上轻型汽车的环境性能部分，也按原规定处理。

## 本案的结果

本案在令和8年（2026年）第2次定例会（会期：6月10日至6月19日）上获得承认。`,
  },
  {
    bill_slug: shoninKey(2),
    difficulty_level: "normal",
    locale: "ko",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-24",
    source_hash:
      "v1:cf454d4071aa261fa81a71908467471118e3cf79957552f673d830a80d4b197a",
    title: "구세 조례 전결처분의 승인 (경자동차세·주택대출 공제 등)",
    summary: "지방세법 개정안이 2026년(레이와 8년) 3월 31일에 공포되어 다음 날 시행되었기 때문에, 구청장이 구의회를 소집하지 않고 구세 조례를 개정했습니다(전결처분). 이 안건은 그 처분을 구의회에 보고하고 승인을 요청하는 것입니다. 경자동차세 환경성능분 폐지와 명칭 변경, 주택대출 공제 5년 연장 등이 주요 내용이며, 2026년(레이와 8년) 제2회 정례회에서 승인되었습니다.",
    content: `# 구세 조례 전결처분의 승인 (경자동차세·주택대출 공제 등)

## '전결처분의 승인'이란

구의 조례를 개정하려면 원래 구의회의 의결이 필요합니다. 다만 지방자치법(地方自治法, 쇼와 22년 법률 제67호) 제179조 제1항은 특히 긴급을 요하여 의회를 소집할 시간적 여유가 없음이 명백하다고 구청장이 인정할 때, 구청장이 의회를 대신하여 처분할 수 있도록 하고 있습니다. 이를 전결처분(専決処分)이라고 합니다.

전결처분을 한 경우, 같은 조 제3항에 따라 구청장은 다음 의회에 보고하고 승인을 요청해야 합니다. 이 안건이 바로 그 보고와 승인 요청입니다. 그래서 의안 번호가 아니라 '승인 제2호'(承認第2号)라는 번호가 붙고, 의결 결과도 '가결'(可決)이 아니라 '승인'(承認)으로 표기됩니다.

## 언제, 왜 전결처분을 했나

| 항목 | 내용 |
|------|------|
| 의결해야 할 사건 | 신주쿠구 특별구세 조례(新宿区特別区税条例, 쇼와 39년 신주쿠구 조례 제57호)의 일부 개정 |
| 처분일 | 2026년(레이와 8년) 3월 31일 |
| 고시 | 신주쿠구 고시 제202호(新宿区告示第202号) |
| 이유 | 지방세법 등의 일부를 개정하는 법률(地方税法等の一部を改正する法律, 레이와 8년 법률 제2호)이 2026년 3월 31일에 공포되어 같은 해 4월 1일부터 시행됨에 따라, 긴급히 구세 조례를 개정·시행해야 했으나 구의회를 소집할 시간적 여유가 없음이 명백했기 때문 |

국가의 법률이 3월 31일에 공포되어 다음 날인 4월 1일부터 시행되므로 구의 조례도 4월 1일에 맞춰야 했고, 그 사이에 의회를 열 여유가 없었다는 설명입니다.

## 개정한 내용

구의 제출 안건 개요는 주요 내용으로 4가지를 들고 있습니다.

### 1. 경자동차세 환경성능분 폐지와 명칭 변경

경자동차세의 환경성능분(環境性能割)을 폐지하고, 현행 '종별분'(種別割)의 명칭을 '경자동차세'(軽自動車税)로 변경합니다. 지금까지 경자동차세는 환경성능분과 종별분의 두 가지로 구성되어 있었지만, 환경성능분이 없어지면서 명칭을 '경자동차세'로 되돌리는 것입니다.

### 2. 경자동차세 그린화 특례(경감)의 재검토

그린화 특례는 차량을 취득한 연도의 다음 연도분 경자동차세 세율을 경감하는 제도입니다. 이 중 75% 경감 대상 특례를 2년 연장하여 2028년도(레이와 10년도)까지 적용합니다.

### 3. 구민세 주택대출 공제 기간 연장

구민세의 주택대출 공제(住宅借入金等特別税額控除) 적용 기간을 5년 연장하여, 2030년(레이와 12년) 12월 31일까지 거주를 시작한 사람까지 대상으로 합니다.

### 4. 우량 주택지 조성 등을 위해 토지 등을 양도한 경우의 과세 특례 재검토

- 특례의 적용 기한을 3년 연장하여 2029년도(레이와 11년도)까지로 합니다.
- 양도한 토지 등이 양도 당시 산사태 방지 구역(地すべり防止区域), 급경사지 붕괴 위험 구역(急傾斜地崩壊危険区域), 토사 재해 특별 경계 구역(土砂災害特別警戒区域) 또는 침수 피해 방지 구역(浸水被害防止区域) 안에 있는 경우에는 특례를 적용할 수 없도록 합니다.

## 언제부터 적용되나

원칙적으로 2026년 4월 1일부터 적용되지만, 일부는 늦게 시작됩니다.

| 대상 | 시행일 |
|------|------|
| 원칙 | 2026년(레이와 8년) 4월 1일 |
| 위 3(주택대출 공제 연장) | 2027년(레이와 9년) 1월 1일 |
| 위 4 중 재해 위험 구역 내 토지 등을 특례 대상에서 제외하는 부분 | 2028년(레이와 10년) 1월 1일 |

경자동차세의 경우, 개정 후 규정은 2026년도 이후 연도분에 적용하며, 2025년도(레이와 7년도)분까지의 종별분은 종전의 예에 따릅니다. 또한 조례 시행일 전에 취득한 삼륜 이상 경자동차에 부과하는 환경성능분도 종전의 예에 따릅니다.

## 이 안건의 결과

2026년(레이와 8년) 제2회 정례회(회기: 6월 10일~6월 19일)에서 승인되었습니다.`,
  },
  {
    bill_slug: shoninKey(2),
    difficulty_level: "normal",
    locale: "ne",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-24",
    source_hash:
      "v1:cf454d4071aa261fa81a71908467471118e3cf79957552f673d830a80d4b197a",
    title: "वडा कर नियमावली संशोधनमा वडा प्रमुखको आपतकालीन निर्णयको स्वीकृति (हल्का सवारी कर, आवास ऋण कट्टी आदि)",
    summary: "स्थानीय कर ऐनको संशोधन सन् 2026 (रेइवा 8) मार्च 31 मा जारी भई भोलिपल्टदेखि लागू भएकाले, वडा प्रमुखले वडा सभा नबोलाई वडा कर नियमावली संशोधन गर्नुभयो (専決処分)। यो प्रस्ताव त्यस निर्णयको जानकारी वडा सभालाई दिई स्वीकृति माग्ने हो। मुख्य विषयहरूमा हल्का सवारी करको वातावरणीय कार्यक्षमता भाग खारेज र नाम परिवर्तन, तथा आवास ऋण कट्टी 5 वर्ष थप गर्ने कुरा पर्छन्। यो सन् 2026 (रेइवा 8) को दोस्रो नियमित अधिवेशनमा स्वीकृत भयो।",
    content: `# वडा कर नियमावली संशोधनमा वडा प्रमुखको आपतकालीन निर्णयको स्वीकृति (हल्का सवारी कर, आवास ऋण कट्टी आदि)

## "आपतकालीन निर्णय (専決処分) को स्वीकृति" भनेको के हो

वडाको नियमावली संशोधन गर्न सामान्यतया वडा सभाको मतदान आवश्यक पर्छ। तर स्थानीय स्वशासन ऐन (地方自治法, शोवा 22 को ऐन नं. 67) को धारा 179 उपधारा 1 ले, विषय विशेष गरी जरुरी भएको र सभा बोलाउने समय नभएको स्पष्ट छ भनी वडा प्रमुखले ठहर गरेमा, वडा प्रमुखलाई सभाको सट्टा निर्णय गर्न अनुमति दिन्छ। यसलाई 専決処分 (सेन्केचु शोबुन) भनिन्छ।

यस्तो निर्णय गरेपछि, सोही धाराको उपधारा 3 अनुसार वडा प्रमुखले अर्को सभा बैठकमा जानकारी दिई स्वीकृति माग्नुपर्छ। यो प्रस्ताव त्यही जानकारी र स्वीकृतिको माग हो। त्यसैले यसलाई विधेयक नम्बर होइन, "स्वीकृति नं. 2" (承認第2号) नम्बर दिइएको छ, र नतिजा पनि "पारित" (可決) होइन, "स्वीकृत" (承認) भनेर लेखिन्छ।

## कहिले र किन निर्णय गरियो

| विषय | विवरण |
|------|------|
| निर्णय गर्नुपर्ने विषय | सिन्जुकु विशेष वडा कर नियमावली (新宿区特別区税条例, शोवा 39 को सिन्जुकु वडा नियमावली नं. 57) को आंशिक संशोधन |
| निर्णय गरिएको मिति | सन् 2026 (रेइवा 8) मार्च 31 |
| सार्वजनिक सूचना | सिन्जुकु वडा सूचना नं. 202 (新宿区告示第202号) |
| कारण | स्थानीय कर ऐन आदिको आंशिक संशोधन गर्ने ऐन (地方税法等の一部を改正する法律, रेइवा 8 को ऐन नं. 2) सन् 2026 मार्च 31 मा जारी भई सोही वर्षको अप्रिल 1 देखि लागू हुने भएकाले, वडा कर नियमावली तुरुन्तै संशोधन गरी लागू गर्नुपर्ने थियो, र वडा सभा बोलाउने समय नभएको स्पष्ट थियो। |

व्याख्या यस्तो छ: राष्ट्रिय ऐन मार्च 31 मा जारी भई भोलिपल्ट अप्रिल 1 देखि लागू भएकाले, वडाको नियमावली पनि अप्रिल 1 सम्ममा तयार गर्नुपर्ने थियो, र बीचमा सभा बस्ने समय थिएन।

## के संशोधन गरियो

वडाले पेस गरेको प्रस्तावहरूको सारांशमा 4 मुख्य परिवर्तनहरू उल्लेख छन्।

### 1. हल्का सवारी करको वातावरणीय कार्यक्षमता भाग खारेज र नाम परिवर्तन

हल्का सवारी करको "वातावरणीय कार्यक्षमता भाग" (環境性能割) खारेज गरिन्छ, र हालको "सवारी प्रकार भाग" (種別割) को नाम "हल्का सवारी कर" (軽自動車税) मा परिवर्तन गरिन्छ। अहिलेसम्म हल्का सवारी करमा वातावरणीय कार्यक्षमता भाग र सवारी प्रकार भाग गरी दुई भाग थिए। वातावरणीय कार्यक्षमता भाग हटेपछि नाम फेरि "हल्का सवारी कर" हुन्छ।

### 2. हल्का सवारी करको हरित विशेष व्यवस्था (कर छुट) को पुनरावलोकन

हरित विशेष व्यवस्थाले सवारी खरिद गरेको वर्षको अर्को आर्थिक वर्षको हल्का सवारी करको दर घटाउँछ। यसमध्ये 75% छुटको विशेष व्यवस्था 2 वर्ष थप गरी आर्थिक वर्ष 2028 (रेइवा 10) सम्म लागू हुन्छ।

### 3. वडा बासिन्दा करमा आवास ऋण कट्टीको अवधि थप

वडा बासिन्दा करको आवास ऋण कट्टी (住宅借入金等特別税額控除) को अवधि 5 वर्ष थप गरिन्छ, र सन् 2030 (रेइवा 12) डिसेम्बर 31 सम्म बसोबास सुरु गर्ने व्यक्तिहरू यसमा समेटिन्छन्।

### 4. राम्रो आवासीय जग्गा विकास आदिका लागि जग्गा हस्तान्तरण गर्दाको कर विशेष व्यवस्थाको पुनरावलोकन

- विशेष व्यवस्था लागू हुने म्याद 3 वर्ष थप गरी आर्थिक वर्ष 2029 (रेइवा 11) सम्म पुर्‍याइन्छ।
- हस्तान्तरण गर्दाको समयमा जग्गा पहिरो रोकथाम क्षेत्र (地すべり防止区域), भिरालो जमिन भत्किने जोखिम क्षेत्र (急傾斜地崩壊危険区域), माटो-ढुंगा प्रकोप विशेष सतर्कता क्षेत्र (土砂災害特別警戒区域) वा डुबान क्षति रोकथाम क्षेत्र (浸水被害防止区域) भित्र पर्छ भने, विशेष व्यवस्था लागू हुँदैन।

## कहिलेदेखि लागू हुन्छ

सिद्धान्ततः परिवर्तनहरू सन् 2026 अप्रिल 1 देखि लागू हुन्छन्, तर केही भाग पछि सुरु हुन्छन्।

| विषय | लागू हुने मिति |
|------|------|
| सामान्य नियम | सन् 2026 (रेइवा 8) अप्रिल 1 |
| माथिको बुँदा 3 (आवास ऋण कट्टी थप) | सन् 2027 (रेइवा 9) जनवरी 1 |
| बुँदा 4 मध्ये प्रकोप जोखिम क्षेत्रभित्रको जग्गालाई विशेष व्यवस्थाबाट बाहिर राख्ने भाग | सन् 2028 (रेइवा 10) जनवरी 1 |

हल्का सवारी करको हकमा, संशोधित नियम आर्थिक वर्ष 2026 र त्यसपछिका वर्षहरूमा लागू हुन्छ। आर्थिक वर्ष 2025 (रेइवा 7) सम्मको सवारी प्रकार भाग पुरानै नियमअनुसार हुन्छ। नियमावली लागू हुनुअघि खरिद गरिएका तीन वा बढी पाङ्ग्रे हल्का सवारीको वातावरणीय कार्यक्षमता भाग पनि पुरानै नियमअनुसार हुन्छ।

## यो प्रस्तावको नतिजा

सन् 2026 (रेइवा 8) को दोस्रो नियमित अधिवेशन (अधिवेशन अवधि: जुन 10 देखि जुन 19 सम्म) मा स्वीकृत भयो।`,
  },
  {
    bill_slug: shoninKey(2),
    difficulty_level: "normal",
    locale: "my",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-24",
    source_hash:
      "v1:cf454d4071aa261fa81a71908467471118e3cf79957552f673d830a80d4b197a",
    title: "ရပ်ကွက်အခွန်စည်းမျဉ်းကို ရပ်ကွက်မှူးက အရေးပေါ်ပြင်ဆင်ခြင်းအား အတည်ပြုခြင်း (အသေးစားကားအခွန်၊ အိမ်ရာချေးငွေ နုတ်ယူခွင့် စသည်)",
    summary: "ဒေသဆိုင်ရာအခွန်ဥပဒေ ပြင်ဆင်ချက်ကို 2026 ခုနှစ် (ရေးဝ 8) မတ်လ 31 ရက်တွင် ထုတ်ပြန်ပြီး နောက်တစ်နေ့မှစ၍ အသက်ဝင်သောကြောင့် ရပ်ကွက်မှူးသည် ရပ်ကွက်လွှတ်တော်ကို မခေါ်ယူဘဲ ရပ်ကွက်အခွန်စည်းမျဉ်းကို ပြင်ဆင်ခဲ့သည် (専決処分)။ ဤကိစ္စသည် ထိုဆောင်ရွက်ချက်ကို ရပ်ကွက်လွှတ်တော်သို့ အစီရင်ခံပြီး အတည်ပြုချက် တောင်းခံခြင်း ဖြစ်သည်။ အသေးစားကားအခွန်၏ ပတ်ဝန်းကျင်စွမ်းဆောင်ရည်အပိုင်းကို ဖျက်သိမ်းပြီး အမည်ပြောင်းခြင်း၊ အိမ်ရာချေးငွေ နုတ်ယူခွင့်ကို 5 နှစ် တိုးမြှင့်ခြင်း စသည်တို့ ပါဝင်သည်။ 2026 ခုနှစ် (ရေးဝ 8) ဒုတိယအကြိမ် ပုံမှန်အစည်းအဝေးတွင် အတည်ပြုခဲ့သည်။",
    content: `# ရပ်ကွက်အခွန်စည်းမျဉ်းကို ရပ်ကွက်မှူးက အရေးပေါ်ပြင်ဆင်ခြင်းအား အတည်ပြုခြင်း (အသေးစားကားအခွန်၊ အိမ်ရာချေးငွေ နုတ်ယူခွင့် စသည်)

## "အရေးပေါ်ဆုံးဖြတ်ချက် (専決処分) ကို အတည်ပြုခြင်း" ဆိုသည်မှာ

ရပ်ကွက်၏ စည်းမျဉ်းကို ပြင်ဆင်ရန် ပုံမှန်အားဖြင့် ရပ်ကွက်လွှတ်တော်၏ မဲခွဲဆုံးဖြတ်ချက် လိုအပ်သည်။ သို့သော် ဒေသဆိုင်ရာကိုယ်ပိုင်အုပ်ချုပ်ခွင့်ဥပဒေ (地方自治法၊ ရှောဝ 22 ခုနှစ် ဥပဒေအမှတ် 67) ပုဒ်မ 179 ပုဒ်မခွဲ 1 အရ ကိစ္စသည် အထူးအရေးပေါ်ဖြစ်ပြီး လွှတ်တော်ကို ခေါ်ယူရန် အချိန်မရှိကြောင်း ထင်ရှားသည်ဟု ရပ်ကွက်မှူးက ယူဆသည့်အခါ ရပ်ကွက်မှူးသည် လွှတ်တော်ကိုယ်စား ဆုံးဖြတ်ဆောင်ရွက်နိုင်သည်။ ၎င်းကို 専決処分 (ဆန်ကဲ့ဆု ရှိုဘုန်း) ဟုခေါ်သည်။

ထိုသို့ ဆောင်ရွက်ပြီးပါက ထိုပုဒ်မ၏ ပုဒ်မခွဲ 3 အရ ရပ်ကွက်မှူးသည် နောက်လာမည့် လွှတ်တော်အစည်းအဝေးသို့ အစီရင်ခံပြီး အတည်ပြုချက် တောင်းခံရမည်။ ဤကိစ္စသည် ထိုအစီရင်ခံချက်နှင့် အတည်ပြုချက်တောင်းခံမှု ဖြစ်သည်။ ထို့ကြောင့် ဥပဒေကြမ်းနံပါတ် မဟုတ်ဘဲ "အတည်ပြုချက်အမှတ် 2" (承認第2号) ဟု နံပါတ်တပ်ထားပြီး ရလဒ်ကိုလည်း "မဲအောင်" (可決) မဟုတ်ဘဲ "အတည်ပြု" (承認) ဟု ဖော်ပြသည်။

## မည်သည့်အချိန်၊ အဘယ်ကြောင့် ဆုံးဖြတ်ခဲ့သနည်း

| အကြောင်းအရာ | အသေးစိတ် |
|------|------|
| ဆုံးဖြတ်ရမည့်ကိစ္စ | ရှင်ဂျုကု အထူးရပ်ကွက်အခွန်စည်းမျဉ်း (新宿区特別区税条例၊ ရှောဝ 39 ခုနှစ် ရှင်ဂျုကုရပ်ကွက် စည်းမျဉ်းအမှတ် 57) ကို တစ်စိတ်တစ်ပိုင်း ပြင်ဆင်ခြင်း |
| ဆုံးဖြတ်သည့်ရက် | 2026 ခုနှစ် (ရေးဝ 8) မတ်လ 31 ရက် |
| အများပြည်သူကြေညာချက် | ရှင်ဂျုကုရပ်ကွက် ကြေညာချက်အမှတ် 202 (新宿区告示第202号) |
| အကြောင်းရင်း | ဒေသဆိုင်ရာအခွန်ဥပဒေ စသည်တို့ကို တစ်စိတ်တစ်ပိုင်း ပြင်ဆင်သည့်ဥပဒေ (地方税法等の一部を改正する法律၊ ရေးဝ 8 ခုနှစ် ဥပဒေအမှတ် 2) ကို 2026 ခုနှစ် မတ်လ 31 ရက်တွင် ထုတ်ပြန်ပြီး ထိုနှစ် ဧပြီလ 1 ရက်မှစ၍ အသက်ဝင်မည်ဖြစ်သဖြင့် ရပ်ကွက်အခွန်စည်းမျဉ်းကို အရေးတကြီး ပြင်ဆင်ကျင့်သုံးရန် လိုအပ်ပြီး ရပ်ကွက်လွှတ်တော်ကို ခေါ်ယူရန် အချိန်မရှိကြောင်း ထင်ရှားသောကြောင့် |

ရှင်းလင်းချက်မှာ နိုင်ငံတော်ဥပဒေကို မတ်လ 31 ရက်တွင် ထုတ်ပြန်ပြီး နောက်တစ်နေ့ ဧပြီလ 1 ရက်မှ အသက်ဝင်သဖြင့် ရပ်ကွက်စည်းမျဉ်းကိုလည်း ဧပြီလ 1 ရက်အမီ အသက်ဝင်စေရန် လိုအပ်ပြီး ကြားကာလတွင် လွှတ်တော်အစည်းအဝေး ကျင်းပရန် အချိန်မရှိခဲ့ခြင်း ဖြစ်သည်။

## ပြင်ဆင်ခဲ့သည့်အချက်များ

ရပ်ကွက်၏ တင်သွင်းကိစ္စ အကျဉ်းချုပ်တွင် အဓိကပြောင်းလဲချက် 4 ချက်ကို ဖော်ပြထားသည်။

### 1. အသေးစားကားအခွန်၏ ပတ်ဝန်းကျင်စွမ်းဆောင်ရည်အပိုင်းကို ဖျက်သိမ်းခြင်းနှင့် အမည်ပြောင်းခြင်း

အသေးစားကားအခွန်၏ "ပတ်ဝန်းကျင်စွမ်းဆောင်ရည်အပိုင်း" (環境性能割) ကို ဖျက်သိမ်းပြီး လက်ရှိ "ယာဉ်အမျိုးအစားအပိုင်း" (種別割) ကို "အသေးစားကားအခွန်" (軽自動車税) ဟု အမည်ပြောင်းသည်။ ယခင်က အသေးစားကားအခွန်တွင် ပတ်ဝန်းကျင်စွမ်းဆောင်ရည်အပိုင်းနှင့် ယာဉ်အမျိုးအစားအပိုင်း ဟူ၍ နှစ်ပိုင်းရှိခဲ့သည်။ ပတ်ဝန်းကျင်စွမ်းဆောင်ရည်အပိုင်း မရှိတော့သဖြင့် အမည်ကို "အသေးစားကားအခွန်" သို့ ပြန်ပြောင်းခြင်း ဖြစ်သည်။

### 2. အသေးစားကားအခွန်၏ စိမ်းလန်းရေးအထူးအစီအစဉ် (အခွန်လျှော့ချမှု) ကို ပြန်လည်သုံးသပ်ခြင်း

စိမ်းလန်းရေးအထူးအစီအစဉ်သည် ယာဉ်ဝယ်ယူသည့်နှစ်၏ နောက်ဘဏ္ဍာနှစ်အတွက် အသေးစားကားအခွန်နှုန်းကို လျှော့ချပေးသည်။ ၎င်းအနက် 75% လျှော့ချသည့် အထူးအစီအစဉ်ကို 2 နှစ် တိုးမြှင့်၍ 2028 ဘဏ္ဍာနှစ် (ရေးဝ 10) အထိ ကျင့်သုံးမည်။

### 3. ရပ်ကွက်နေထိုင်သူအခွန်တွင် အိမ်ရာချေးငွေ နုတ်ယူခွင့်ကာလ တိုးမြှင့်ခြင်း

ရပ်ကွက်နေထိုင်သူအခွန်၏ အိမ်ရာချေးငွေ နုတ်ယူခွင့် (住宅借入金等特別税額控除) ကာလကို 5 နှစ် တိုးမြှင့်ပြီး 2030 ခုနှစ် (ရေးဝ 12) ဒီဇင်ဘာလ 31 ရက်အထိ နေထိုင်မှု စတင်သူများ ပါဝင်မည်။

### 4. အရည်အသွေးကောင်းသော လူနေမြေ ဖော်ထုတ်ရန် စသည်အတွက် မြေလွှဲပြောင်းသည့်အခါ အခွန်အထူးအစီအစဉ်ကို ပြန်လည်သုံးသပ်ခြင်း

- အထူးအစီအစဉ် ကျင့်သုံးနိုင်သည့် နောက်ဆုံးကာလကို 3 နှစ် တိုးမြှင့်၍ 2029 ဘဏ္ဍာနှစ် (ရေးဝ 11) အထိ ထားမည်။
- လွှဲပြောင်းချိန်တွင် လွှဲပြောင်းသည့်မြေသည် မြေပြိုကာကွယ်ရေးဇုန် (地すべり防止区域)၊ မတ်စောက်သောမြေ ပြိုကျနိုင်ခြေရှိဇုန် (急傾斜地崩壊危険区域)၊ မြေနှင့်ကျောက် ဘေးအန္တရာယ် အထူးသတိပေးဇုန် (土砂災害特別警戒区域) သို့မဟုတ် ရေလွှမ်းမိုးမှုဒဏ် ကာကွယ်ရေးဇုန် (浸水被害防止区域) အတွင်း ရှိပါက အထူးအစီအစဉ်ကို ကျင့်သုံး၍ မရပါ။

## မည်သည့်အချိန်မှစ၍ ကျင့်သုံးမည်နည်း

မူအားဖြင့် 2026 ခုနှစ် ဧပြီလ 1 ရက်မှစ၍ ကျင့်သုံးမည်ဖြစ်သော်လည်း အချို့အပိုင်းများမှာ နောက်ကျမှ စတင်မည်။

| အကြောင်းအရာ | အသက်ဝင်သည့်ရက် |
|------|------|
| အထွေထွေမူ | 2026 ခုနှစ် (ရေးဝ 8) ဧပြီလ 1 ရက် |
| အထက်ပါ အချက် 3 (အိမ်ရာချေးငွေ နုတ်ယူခွင့် တိုးမြှင့်ခြင်း) | 2027 ခုနှစ် (ရေးဝ 9) ဇန်နဝါရီလ 1 ရက် |
| အချက် 4 အနက် ဘေးအန္တရာယ်ဇုန်အတွင်းရှိ မြေကို အထူးအစီအစဉ်မှ ဖယ်ထုတ်သည့်အပိုင်း | 2028 ခုနှစ် (ရေးဝ 10) ဇန်နဝါရီလ 1 ရက် |

အသေးစားကားအခွန်အတွက် ပြင်ဆင်ပြီးသော စည်းမျဉ်းကို 2026 ဘဏ္ဍာနှစ်နှင့် နောက်ပိုင်းနှစ်များတွင် ကျင့်သုံးမည်။ 2025 ဘဏ္ဍာနှစ် (ရေးဝ 7) အထိ ယာဉ်အမျိုးအစားအပိုင်းမှာ ယခင်စည်းမျဉ်းအတိုင်း ဖြစ်သည်။ စည်းမျဉ်း အသက်မဝင်မီ ဝယ်ယူခဲ့သော ဘီး 3 လုံးနှင့်အထက် အသေးစားကားများ၏ ပတ်ဝန်းကျင်စွမ်းဆောင်ရည်အပိုင်းလည်း ယခင်စည်းမျဉ်းအတိုင်း ဖြစ်သည်။

## ဤကိစ္စ၏ ရလဒ်

2026 ခုနှစ် (ရေးဝ 8) ဒုတိယအကြိမ် ပုံမှန်အစည်းအဝေး (အစည်းအဝေးကာလ: ဇွန်လ 10 ရက်မှ ဇွန်လ 19 ရက်အထိ) တွင် အတည်ပြုခဲ့သည်။`,
  },
  {
    bill_slug: shoninKey(2),
    difficulty_level: "normal",
    locale: "vi",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-24",
    source_hash:
      "v1:cf454d4071aa261fa81a71908467471118e3cf79957552f673d830a80d4b197a",
    title: "Phê chuẩn việc Quận trưởng tự quyết sửa đổi Điều lệ thuế quận (thuế xe hạng nhẹ, khấu trừ khoản vay mua nhà, v.v.)",
    summary: "Do bản sửa đổi Luật Thuế địa phương được công bố ngày 31 tháng 3 năm 2026 (Reiwa 8) và có hiệu lực từ ngày hôm sau, Quận trưởng đã sửa đổi Điều lệ thuế quận mà không triệu tập Hội đồng quận (専決処分, xử lý tự quyết). Nội dung này báo cáo việc đó với Hội đồng quận và đề nghị phê chuẩn. Các thay đổi gồm bãi bỏ phần thuế theo hiệu suất môi trường của thuế xe hạng nhẹ và đổi tên thuế, gia hạn khấu trừ khoản vay mua nhà thêm 5 năm, v.v. Nội dung đã được phê chuẩn tại Kỳ họp định kỳ lần thứ 2 năm 2026 (Reiwa 8).",
    content: `# Phê chuẩn việc Quận trưởng tự quyết sửa đổi Điều lệ thuế quận (thuế xe hạng nhẹ, khấu trừ khoản vay mua nhà, v.v.)

## "Phê chuẩn xử lý tự quyết" nghĩa là gì

Thông thường, muốn sửa đổi điều lệ của quận thì cần có biểu quyết của Hội đồng quận. Tuy nhiên, Khoản 1 Điều 179 Luật Tự trị địa phương (地方自治法, Luật số 67 năm Showa 22) cho phép Quận trưởng thay mặt Hội đồng đưa ra quyết định khi Quận trưởng nhận thấy vấn đề đặc biệt khẩn cấp và rõ ràng không có thời gian để triệu tập Hội đồng. Việc này gọi là xử lý tự quyết (専決処分, senketsu shobun).

Khi đã xử lý tự quyết, theo Khoản 3 của cùng Điều, Quận trưởng phải báo cáo với phiên họp Hội đồng tiếp theo và đề nghị phê chuẩn. Nội dung này chính là báo cáo và đề nghị phê chuẩn đó. Vì vậy nó được đánh số "Phê chuẩn số 2" (承認第2号) chứ không phải số dự án, và kết quả được ghi là "phê chuẩn" (承認) chứ không phải "thông qua" (可決).

## Quận trưởng đã quyết định khi nào và vì sao

| Mục | Nội dung |
|------|------|
| Vấn đề cần biểu quyết | Sửa đổi một phần Điều lệ thuế đặc khu Shinjuku (新宿区特別区税条例, Điều lệ số 57 năm Showa 39 của quận Shinjuku) |
| Ngày quyết định | Ngày 31 tháng 3 năm 2026 (Reiwa 8) |
| Công báo | Thông báo quận Shinjuku số 202 (新宿区告示第202号) |
| Lý do | Luật sửa đổi một phần Luật Thuế địa phương, v.v. (地方税法等の一部を改正する法律, Luật số 2 năm Reiwa 8) được công bố ngày 31 tháng 3 năm 2026 và có hiệu lực từ ngày 1 tháng 4 cùng năm. Cần khẩn cấp sửa đổi và thi hành điều lệ thuế quận cho phù hợp, và rõ ràng không có thời gian để triệu tập Hội đồng quận. |

Giải thích là: luật quốc gia được công bố ngày 31 tháng 3 và có hiệu lực ngay ngày hôm sau, 1 tháng 4, nên điều lệ của quận cũng phải kịp có hiệu lực vào ngày 1 tháng 4, và không có thời gian để họp Hội đồng trong khoảng đó.

## Những gì đã được sửa đổi

Bản tóm tắt các nội dung trình của quận nêu 4 thay đổi chính.

### 1. Bãi bỏ phần thuế theo hiệu suất môi trường của thuế xe hạng nhẹ và đổi tên thuế

Phần thuế theo hiệu suất môi trường (環境性能割) của thuế xe hạng nhẹ bị bãi bỏ, và "phần thuế theo loại xe" (種別割) hiện hành được đổi tên thành "thuế xe hạng nhẹ" (軽自動車税). Trước đây, thuế xe hạng nhẹ gồm hai phần: phần theo hiệu suất môi trường và phần theo loại xe. Khi phần theo hiệu suất môi trường không còn, tên gọi trở lại là "thuế xe hạng nhẹ".

### 2. Điều chỉnh ưu đãi xanh (giảm thuế) của thuế xe hạng nhẹ

Ưu đãi xanh giảm thuế suất thuế xe hạng nhẹ cho năm tài chính tiếp theo sau năm mua xe. Trong đó, ưu đãi giảm 75% được gia hạn thêm 2 năm, đến hết năm tài chính 2028 (Reiwa 10).

### 3. Gia hạn khấu trừ khoản vay mua nhà trong thuế cư dân quận

Thời hạn áp dụng khấu trừ khoản vay mua nhà trong thuế cư dân quận (住宅借入金等特別税額控除) được gia hạn thêm 5 năm, áp dụng cho người bắt đầu vào ở trước ngày 31 tháng 12 năm 2030 (Reiwa 12).

### 4. Điều chỉnh ưu đãi thuế khi chuyển nhượng đất để phát triển đất ở chất lượng tốt, v.v.

- Thời hạn áp dụng ưu đãi được gia hạn thêm 3 năm, đến hết năm tài chính 2029 (Reiwa 11).
- Nếu tại thời điểm chuyển nhượng, đất được chuyển nhượng nằm trong khu vực phòng chống sạt lở đất (地すべり防止区域), khu vực nguy hiểm sụp đổ sườn dốc (急傾斜地崩壊危険区域), khu vực cảnh báo đặc biệt thảm họa đất đá (土砂災害特別警戒区域) hoặc khu vực phòng chống thiệt hại do ngập lụt (浸水被害防止区域), thì không được áp dụng ưu đãi.

## Khi nào các thay đổi được áp dụng

Về nguyên tắc, các thay đổi áp dụng từ ngày 1 tháng 4 năm 2026, nhưng một số phần bắt đầu muộn hơn.

| Nội dung | Ngày có hiệu lực |
|------|------|
| Nguyên tắc chung | Ngày 1 tháng 4 năm 2026 (Reiwa 8) |
| Mục 3 ở trên (gia hạn khấu trừ khoản vay mua nhà) | Ngày 1 tháng 1 năm 2027 (Reiwa 9) |
| Phần của mục 4 loại đất trong khu vực nguy hiểm thiên tai khỏi ưu đãi | Ngày 1 tháng 1 năm 2028 (Reiwa 10) |

Đối với thuế xe hạng nhẹ, quy định sau sửa đổi áp dụng cho năm tài chính 2026 trở đi. Phần thuế theo loại xe đến năm tài chính 2025 (Reiwa 7) vẫn theo quy định cũ. Phần thuế theo hiệu suất môi trường đối với xe hạng nhẹ ba bánh trở lên mua trước ngày điều lệ có hiệu lực cũng theo quy định cũ.

## Kết quả của nội dung này

Nội dung đã được phê chuẩn tại Kỳ họp định kỳ lần thứ 2 năm 2026 (Reiwa 8) (thời gian họp: từ 10 tháng 6 đến 19 tháng 6).`,
  },

  // =========================================================================
  // 第42号議案 令和8年度新宿区一般会計補正予算（第2号）
  // =========================================================================
  {
    bill_slug: gianKey(42),
    difficulty_level: "normal",
    locale: "en",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-23",
    source_hash:
      "v1:50bae16937cb286f0067304c2100f22f5612bcde839282c49c929e96eafb891b",
    title:
      "More money for shopping-street vouchers and road work (General Account Supplementary Budget No. 2)",
    summary:
      "This supplementary budget adds ¥292,564,000 to the General Account. It covers a subsidy that raises the premium rate of the Shopping Street Happy Vouchers from 20% to 30%, equipment work at the Tsunohazu Community Center, and increased funding for road improvement and public sewer work on Phase I of Edogawabashi-dori.",
    content: `# More money for shopping-street vouchers and road work (General Account Supplementary Budget No. 2)

This is a supplementary budget for the fiscal 2026 (Reiwa 8) General Account, submitted by the Mayor on June 10, 2026. It adds 292,564 thousand yen (about ¥292.56 million) to both revenue and expenditure, bringing the General Account total to 189,293,341 thousand yen (about ¥189.29 billion).

## What the money is for

### Expanding the Shopping Street Happy Vouchers (160,224 thousand yen)

This is a subsidy to the Shinjuku Federation of Shopping Street Associations (新宿区商店会連合会). The ward's summary document gives the reason for the expansion as follows (our translation): "to revitalize shopping streets and support residents' daily lives, in light of the prolonged rise in prices and the effects of the situation in the Middle East."

| Item | Details |
|------|------|
| Premium rate | 20% → 30% (¥13,000 worth of paper vouchers for ¥10,000) |
| Common vouchers (usable at all stores) | ¥4,500 worth → ¥5,000 worth |
| Support vouchers (usable at stores run by small and medium-sized enterprises with a floor area under 1,000 square meters) | ¥7,500 worth → ¥8,000 worth |
| Participating stores | Stores that belong to a shopping street association and to the Shinjuku Federation of Shopping Street Associations |
| Number of books issued | 150,000 |
| Where to buy | All post offices in the ward |
| Application period | July 1 to July 27 |
| Sales period | September 16 to October 16 |
| Period of use | October 1 to January 8 |

### Equipment work at the Tsunohazu Community Center (角筈地域センター) (9,284 thousand yen)

This increases the construction cost because of revisions to labor unit prices and other factors.

### Road and sewer work on Phase I of Edogawabashi-dori (江戸川橋通り第Ⅰ期) (123,056 thousand yen)

Both are increases in construction costs due to changes in the development plan.

- Road improvement (construction costs): 108,816 thousand yen
- Public sewer development (construction costs): 14,240 thousand yen

## Where the money comes from

| Revenue category | Amount added | Breakdown |
|------|--------|------|
| Transfers from funds (繰入金) | 61,985 thousand yen | Fiscal Adjustment Fund 47,885 thousand yen / Social Capital Development Fund 14,100 thousand yen |
| Miscellaneous revenue (諸収入) | 126,579 thousand yen | Revenue from commissioned work (public sewer development costs) 14,240 thousand yen / Penalties and late-payment interest 32,235 thousand yen / Other income (雑入; equivalent to the refund of road improvement costs for Phase I of Edogawabashi-dori) 80,104 thousand yen |
| Special ward bonds (特別区債) | 104,000 thousand yen | Regional development bonds 7,000 thousand yen / Civil engineering bonds 97,000 thousand yen |

This budget draws 47,885 thousand yen from the Fiscal Adjustment Fund (財政調整基金). The fund's projected balance at the end of fiscal 2026 is 26,179,670 thousand yen (about ¥26.18 billion).

The overall limit on special ward bonds changes from 2,443,000 thousand yen to 2,547,000 thousand yen.

## What happened to this bill

It was passed as originally proposed (原案可決) at the 2nd Regular Session of 2026 (Reiwa 8) (session period: June 10 to June 19).`,
  },
  {
    bill_slug: gianKey(42),
    difficulty_level: "normal",
    locale: "zh-Hans",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-24",
    source_hash:
      "v1:50bae16937cb286f0067304c2100f22f5612bcde839282c49c929e96eafb891b",
    title: "增加商店街商品券和道路工程经费（一般会计补正预算第2号）",
    summary: "本补正预算为一般会计追加2亿9,256万4千日元。内容包括：将“商店街Happy商品券”的溢价率从20%提高到30%的补助、角筈地区中心的设备工程，以及增加江户川桥通第Ⅰ期道路改良和公共下水道工程的经费。",
    content: `# 增加商店街商品券和道路工程经费（一般会计补正预算第2号）

这是区长于令和8年（2026年）6月10日提交的令和8年度一般会计补正预算。收入和支出各追加292,564千日元（约2亿9,256万日元），一般会计总额变为189,293,341千日元（约1,892亿9,334万日元）。

## 钱用在哪里

### 扩充商店街Happy商品券（商店街ハッピー商品券）（160,224千日元）

这是对新宿区商店会联合会（新宿区商店会連合会）的事业补助。区的概要资料对扩充理由的说明如下（本站翻译）：“鉴于物价长期上涨以及中东局势的影响，为振兴商店街并支持区民生活。”

| 项目 | 内容 |
|------|------|
| 溢价率 | 20% → 30%（用10,000日元购买价值13,000日元的纸质商品券） |
| 通用券（所有店铺可用） | 4,500日元 → 5,000日元 |
| 支援券（限中小企业且店铺面积不足1,000平方米的店铺使用） | 7,500日元 → 8,000日元 |
| 适用店铺 | 同时加入商店会和新宿区商店会联合会的店铺 |
| 发行册数 | 150,000册 |
| 销售地点 | 区内所有邮局 |
| 申请期间 | 7月1日至7月27日 |
| 销售期间 | 9月16日至10月16日 |
| 使用期间 | 10月1日至1月8日 |

### 角筈地区中心（角筈地域センター）的设备工程（9,284千日元）

因劳务单价等调整而增加工程费。

### 江户川桥通第Ⅰ期（江戸川橋通り第Ⅰ期）的道路和下水道工程（123,056千日元）

两项均为因整备计划变更而增加的工程费。

- 道路改良（工程费）：108,816千日元
- 公共下水道整备（工程费）：14,240千日元

## 钱从哪里来

| 收入科目 | 补正金额 | 明细 |
|------|--------|------|
| 基金转入（繰入金） | 61,985千日元 | 财政调整基金 47,885千日元／社会资本等整备基金 14,100千日元 |
| 其他收入（諸収入） | 126,579千日元 | 受托事业收入（公共下水道整备费）14,240千日元／违约金及延期付款利息 32,235千日元／杂项收入（雑入，相当于江户川桥通第Ⅰ期道路改良工程费返还款）80,104千日元 |
| 特别区债（特別区債） | 104,000千日元 | 地区振兴债 7,000千日元／土木债 97,000千日元 |

本次从财政调整基金（財政調整基金）中动用47,885千日元，预计令和8年度末余额为26,179,670千日元（约261亿8千万日元）。

特别区债的限额总计从2,443,000千日元变为2,547,000千日元。

## 本议案的结果

本议案在令和8年（2026年）第2次定例会（会期：6月10日至6月19日）上按原案通过（原案可決）。`,
  },
  {
    bill_slug: gianKey(42),
    difficulty_level: "normal",
    locale: "ko",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-24",
    source_hash:
      "v1:50bae16937cb286f0067304c2100f22f5612bcde839282c49c929e96eafb891b",
    title: "상점가 상품권 확대와 도로 공사비 증액 (일반회계 보정예산 제2호)",
    summary: "일반회계에 2억 9,256만 4천 엔을 추가하는 보정예산입니다. 상점가 해피 상품권의 프리미엄률을 20%에서 30%로 올리는 보조금, 쓰노하즈 지역센터의 설비 공사, 에도가와바시도리 제I기 도로 개량 및 공공 하수도 공사비 증액이 내용입니다.",
    content: `# 상점가 상품권 확대와 도로 공사비 증액 (일반회계 보정예산 제2호)

2026년(레이와 8년) 6월 10일에 구청장이 제출한 2026년도 일반회계 보정예산입니다. 세입과 세출에 각각 292,564천 엔(약 2억 9,256만 엔)을 추가하여 일반회계 총액을 189,293,341천 엔(약 1,892억 9,334만 엔)으로 합니다.

## 어디에 돈을 쓰나

### 상점가 해피 상품권(商店街ハッピー商品券) 확대 (160,224천 엔)

신주쿠구 상점회 연합회(新宿区商店会連合会)에 대한 사업 보조금입니다. 구의 개요 자료는 확대 이유를 다음과 같이 설명합니다(본 사이트 번역). "장기화되는 물가 상승과 중동 정세의 영향을 고려하여, 상점가 활성화를 도모하고 구민 생활을 지원하기 위해."

| 항목 | 내용 |
|------|------|
| 프리미엄률 | 20% → 30% (10,000엔으로 13,000엔어치 종이 상품권) |
| 공통권 (모든 점포에서 사용 가능) | 4,500엔어치 → 5,000엔어치 |
| 응원권 (중소기업이면서 매장 면적 1,000제곱미터 미만인 점포에서 사용 가능) | 7,500엔어치 → 8,000엔어치 |
| 대상 점포 | 상점회 가맹점이면서 신주쿠구 상점회 연합회 가맹점 |
| 발행 권수 | 150,000권 |
| 판매 장소 | 구내 모든 우체국 |
| 신청 기간 | 7월 1일~7월 27일 |
| 판매 기간 | 9월 16일~10월 16일 |
| 이용 기간 | 10월 1일~1월 8일 |

### 쓰노하즈 지역센터(角筈地域センター) 설비 공사 (9,284천 엔)

노무 단가 등의 조정에 따른 공사비 증액입니다.

### 에도가와바시도리 제I기(江戸川橋通り第Ⅰ期) 도로·하수도 (123,056천 엔)

모두 정비 계획 변경에 따른 공사비 증액입니다.

- 도로 개량 (공사비): 108,816천 엔
- 공공 하수도 정비 (공사비): 14,240천 엔

## 어디서 돈을 마련하나

| 세입 항목 | 보정액 | 내역 |
|------|--------|------|
| 기금 전입금(繰入金) | 61,985천 엔 | 재정조정기금 47,885천 엔 / 사회자본 등 정비기금 14,100천 엔 |
| 제수입(諸収入) | 126,579천 엔 | 수탁사업 수입(공공 하수도 정비비) 14,240천 엔 / 위약금 및 연납 이자 32,235천 엔 / 잡수입(雑入, 에도가와바시도리 제I기 도로 개량 공사비 반환금 상당분) 80,104천 엔 |
| 특별구채(特別区債) | 104,000천 엔 | 지역진흥채 7,000천 엔 / 토목채 97,000천 엔 |

이번에 재정조정기금(財政調整基金)에서 47,885천 엔을 인출하며, 2026년도 말 잔액 전망은 26,179,670천 엔(약 261억 8천만 엔)입니다.

특별구채의 한도액은 전체적으로 2,443,000천 엔에서 2,547,000천 엔으로 바뀝니다.

## 이 의안의 결과

2026년(레이와 8년) 제2회 정례회(회기: 6월 10일~6월 19일)에서 원안 가결(原案可決)되었습니다.`,
  },
  {
    bill_slug: gianKey(42),
    difficulty_level: "normal",
    locale: "ne",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-24",
    source_hash:
      "v1:50bae16937cb286f0067304c2100f22f5612bcde839282c49c929e96eafb891b",
    title: "किनमेल सडकका खरिद कुपन विस्तार र सडक निर्माण खर्च वृद्धि (साधारण खाता पूरक बजेट नं. 2)",
    summary: "यो पूरक बजेटले साधारण खातामा 292,564,000 येन थप्छ। यसमा किनमेल सडक ह्याप्पी खरिद कुपनको प्रिमियम दर 20% बाट 30% मा बढाउने अनुदान, चुनोहाजु क्षेत्रीय केन्द्रको उपकरण निर्माण, र एदोगावाबाशी-दोरी पहिलो चरणको सडक सुधार तथा सार्वजनिक ढल निर्माण खर्च वृद्धि पर्छन्।",
    content: `# किनमेल सडकका खरिद कुपन विस्तार र सडक निर्माण खर्च वृद्धि (साधारण खाता पूरक बजेट नं. 2)

यो सन् 2026 (रेइवा 8) जुन 10 मा वडा प्रमुखले पेस गर्नुभएको आर्थिक वर्ष 2026 को साधारण खाताको पूरक बजेट हो। यसले आम्दानी र खर्च दुवैमा 292,564 हजार येन (करिब 29 करोड 26 लाख येन) थप्छ, र साधारण खाताको कुल रकम 189,293,341 हजार येन (करिब 189 अर्ब 29 करोड येन) पुग्छ।

## पैसा केमा खर्च गरिन्छ

### किनमेल सडक ह्याप्पी खरिद कुपन (商店街ハッピー商品券) विस्तार (160,224 हजार येन)

यो सिन्जुकु वडा किनमेल संघ महासंघ (新宿区商店会連合会) लाई दिइने कार्यक्रम अनुदान हो। वडाको सारांश दस्तावेजले विस्तारको कारण यसरी बताएको छ (हाम्रो अनुवाद): "लामो समयदेखिको मूल्यवृद्धि र मध्यपूर्वको स्थितिको प्रभावलाई ध्यानमा राख्दै, किनमेल सडकहरूलाई जीवन्त बनाउन र वडाबासीको दैनिक जीवनलाई सहयोग गर्न।"

| विषय | विवरण |
|------|------|
| प्रिमियम दर | 20% → 30% (10,000 येनमा 13,000 येन बराबरको कागजी कुपन) |
| साझा कुपन (सबै पसलमा प्रयोग गर्न मिल्ने) | 4,500 येन बराबर → 5,000 येन बराबर |
| सहयोग कुपन (साना तथा मझौला उद्यम सञ्चालन गरेका र 1,000 वर्ग मिटरभन्दा कम क्षेत्रफल भएका पसलमा प्रयोग गर्न मिल्ने) | 7,500 येन बराबर → 8,000 येन बराबर |
| सहभागी पसल | किनमेल संघ र सिन्जुकु वडा किनमेल संघ महासंघ दुवैमा आबद्ध पसल |
| जारी गरिने पुस्तिका संख्या | 150,000 पुस्तिका |
| बिक्री स्थान | वडाभित्रका सबै हुलाक कार्यालय |
| आवेदन अवधि | जुलाई 1 देखि जुलाई 27 सम्म |
| बिक्री अवधि | सेप्टेम्बर 16 देखि अक्टोबर 16 सम्म |
| प्रयोग अवधि | अक्टोबर 1 देखि जनवरी 8 सम्म |

### चुनोहाजु क्षेत्रीय केन्द्र (角筈地域センター) को उपकरण निर्माण (9,284 हजार येन)

श्रमको एकाइ मूल्य आदिको पुनरावलोकनका कारण निर्माण खर्च बढाइएको हो।

### एदोगावाबाशी-दोरी पहिलो चरण (江戸川橋通り第Ⅰ期) को सडक र ढल (123,056 हजार येन)

दुवै विकास योजनामा परिवर्तन भएकाले निर्माण खर्च बढाइएको हो।

- सडक सुधार (निर्माण खर्च): 108,816 हजार येन
- सार्वजनिक ढल निर्माण (निर्माण खर्च): 14,240 हजार येन

## पैसा कहाँबाट आउँछ

| आम्दानी शीर्षक | थप रकम | विवरण |
|------|--------|------|
| कोषबाट स्थानान्तरण (繰入金) | 61,985 हजार येन | वित्तीय समायोजन कोष 47,885 हजार येन / सामाजिक पूँजी विकास कोष 14,100 हजार येन |
| विविध आम्दानी (諸収入) | 126,579 हजार येन | जिम्मा लिइएको कामबाट आम्दानी (सार्वजनिक ढल निर्माण खर्च) 14,240 हजार येन / सम्झौता उल्लंघन जरिवाना र ढिलो भुक्तानी ब्याज 32,235 हजार येन / अन्य आम्दानी (雑入; एदोगावाबाशी-दोरी पहिलो चरणको सडक सुधार खर्च फिर्ता बराबर) 80,104 हजार येन |
| विशेष वडा ऋणपत्र (特別区債) | 104,000 हजार येन | क्षेत्रीय प्रवर्द्धन ऋणपत्र 7,000 हजार येन / निर्माण ऋणपत्र 97,000 हजार येन |

यस पटक वित्तीय समायोजन कोष (財政調整基金) बाट 47,885 हजार येन निकालिन्छ। आर्थिक वर्ष 2026 को अन्त्यमा कोषको अनुमानित मौज्दात 26,179,670 हजार येन (करिब 26 अर्ब 18 करोड येन) हुन्छ।

विशेष वडा ऋणपत्रको कुल सीमा 2,443,000 हजार येनबाट 2,547,000 हजार येनमा परिवर्तन हुन्छ।

## यो विधेयकको नतिजा

सन् 2026 (रेइवा 8) को दोस्रो नियमित अधिवेशन (अधिवेशन अवधि: जुन 10 देखि जुन 19 सम्म) मा मूल प्रस्तावअनुसार पारित (原案可決) भयो।`,
  },
  {
    bill_slug: gianKey(42),
    difficulty_level: "normal",
    locale: "my",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-24",
    source_hash:
      "v1:50bae16937cb286f0067304c2100f22f5612bcde839282c49c929e96eafb891b",
    title: "ဈေးဆိုင်တန်း ဈေးဝယ်ကူပွန် တိုးချဲ့ခြင်းနှင့် လမ်းလုပ်ငန်းစရိတ် တိုးမြှင့်ခြင်း (အထွေထွေစာရင်း ဖြည့်စွက်ဘတ်ဂျက် အမှတ် 2)",
    summary: "ဤဖြည့်စွက်ဘတ်ဂျက်သည် အထွေထွေစာရင်းသို့ ယန်း 292,564,000 ထပ်ပေါင်းထည့်သည်။ ဈေးဆိုင်တန်း ဟက်ပီ ဈေးဝယ်ကူပွန်၏ ပရီမီယံနှုန်းကို 20% မှ 30% သို့ မြှင့်တင်ရန် ထောက်ပံ့ငွေ၊ ဆုနိုဟာဇု ဒေသစင်တာ၏ စက်ပစ္စည်းလုပ်ငန်း၊ အဲဒိုဂါဝါဘာရှိ-ဒိုရီ ပထမအဆင့် လမ်းပြုပြင်ခြင်းနှင့် အများသုံး မိလ္လာပိုက်လုပ်ငန်း စရိတ် တိုးမြှင့်ခြင်းတို့ ပါဝင်သည်။",
    content: `# ဈေးဆိုင်တန်း ဈေးဝယ်ကူပွန် တိုးချဲ့ခြင်းနှင့် လမ်းလုပ်ငန်းစရိတ် တိုးမြှင့်ခြင်း (အထွေထွေစာရင်း ဖြည့်စွက်ဘတ်ဂျက် အမှတ် 2)

ဤသည်မှာ 2026 ခုနှစ် (ရေးဝ 8) ဇွန်လ 10 ရက်တွင် ရပ်ကွက်မှူးက တင်သွင်းခဲ့သော 2026 ဘဏ္ဍာနှစ် အထွေထွေစာရင်း ဖြည့်စွက်ဘတ်ဂျက် ဖြစ်သည်။ ဝင်ငွေနှင့် အသုံးစရိတ် နှစ်ခုစလုံးသို့ ယန်း 292,564 ထောင် (ယန်း သန်း 292.56 ခန့်) ထပ်ပေါင်းပြီး အထွေထွေစာရင်း စုစုပေါင်းကို ယန်း 189,293,341 ထောင် (ယန်း ဘီလီယံ 189.29 ခန့်) ဖြစ်စေသည်။

## ငွေကို မည်သည့်အတွက် သုံးမည်နည်း

### ဈေးဆိုင်တန်း ဟက်ပီ ဈေးဝယ်ကူပွန် (商店街ハッピー商品券) တိုးချဲ့ခြင်း (ယန်း 160,224 ထောင်)

ဤသည်မှာ ရှင်ဂျုကုရပ်ကွက် ဈေးဆိုင်အသင်းများ ချိတ်ဆက်အဖွဲ့ (新宿区商店会連合会) သို့ ပေးသော လုပ်ငန်းထောက်ပံ့ငွေ ဖြစ်သည်။ ရပ်ကွက်၏ အကျဉ်းချုပ်စာတမ်းက တိုးချဲ့ရသည့် အကြောင်းရင်းကို အောက်ပါအတိုင်း ရှင်းပြထားသည် (ကျွန်ုပ်တို့၏ ဘာသာပြန်): "ကြာရှည်စွာ ဈေးနှုန်းမြင့်တက်နေမှုနှင့် အရှေ့အလယ်ပိုင်း အခြေအနေ၏ သက်ရောက်မှုကို ထည့်သွင်းစဉ်းစား၍ ဈေးဆိုင်တန်းများကို အသက်ဝင်စေရန်နှင့် ရပ်ကွက်နေထိုင်သူများ၏ နေ့စဉ်ဘဝကို ထောက်ပံ့ရန်။"

| အကြောင်းအရာ | အသေးစိတ် |
|------|------|
| ပရီမီယံနှုန်း | 20% → 30% (ယန်း 10,000 ဖြင့် ယန်း 13,000 တန် စက္ကူကူပွန်) |
| ဘုံကူပွန် (ဆိုင်အားလုံးတွင် သုံးနိုင်) | ယန်း 4,500 တန် → ယန်း 5,000 တန် |
| ထောက်ခံကူပွန် (အသေးစားနှင့် အလတ်စား လုပ်ငန်းဖြစ်ပြီး ဆိုင်ဧရိယာ စတုရန်းမီတာ 1,000 အောက်ရှိသော ဆိုင်များတွင် သုံးနိုင်) | ယန်း 7,500 တန် → ယန်း 8,000 တန် |
| ပါဝင်သောဆိုင်များ | ဈေးဆိုင်အသင်းနှင့် ရှင်ဂျုကုရပ်ကွက် ဈေးဆိုင်အသင်းများ ချိတ်ဆက်အဖွဲ့ နှစ်ခုစလုံး၏ အဖွဲ့ဝင်ဆိုင်များ |
| ထုတ်ဝေမည့် စာအုပ်အရေအတွက် | 150,000 အုပ် |
| ရောင်းချသည့်နေရာ | ရပ်ကွက်အတွင်းရှိ စာတိုက်အားလုံး |
| လျှောက်ထားရမည့်ကာလ | ဇူလိုင်လ 1 ရက်မှ ဇူလိုင်လ 27 ရက်အထိ |
| ရောင်းချမည့်ကာလ | စက်တင်ဘာလ 16 ရက်မှ အောက်တိုဘာလ 16 ရက်အထိ |
| အသုံးပြုနိုင်သည့်ကာလ | အောက်တိုဘာလ 1 ရက်မှ ဇန်နဝါရီလ 8 ရက်အထိ |

### ဆုနိုဟာဇု ဒေသစင်တာ (角筈地域センター) ၏ စက်ပစ္စည်းလုပ်ငန်း (ယန်း 9,284 ထောင်)

လုပ်အားယူနစ်ဈေးနှုန်း စသည်တို့ကို ပြန်လည်ပြင်ဆင်မှုကြောင့် ဆောက်လုပ်ရေးစရိတ် တိုးမြှင့်ခြင်း ဖြစ်သည်။

### အဲဒိုဂါဝါဘာရှိ-ဒိုရီ ပထမအဆင့် (江戸川橋通り第Ⅰ期) လမ်းနှင့် မိလ္လာပိုက် (ယန်း 123,056 ထောင်)

နှစ်ခုစလုံးသည် ဖွံ့ဖြိုးရေးအစီအစဉ် ပြောင်းလဲမှုကြောင့် ဆောက်လုပ်ရေးစရိတ် တိုးမြှင့်ခြင်း ဖြစ်သည်။

- လမ်းပြုပြင်ခြင်း (ဆောက်လုပ်ရေးစရိတ်): ယန်း 108,816 ထောင်
- အများသုံး မိလ္လာပိုက် တည်ဆောက်ခြင်း (ဆောက်လုပ်ရေးစရိတ်): ယန်း 14,240 ထောင်

## ငွေကို မည်သည့်နေရာမှ ရမည်နည်း

| ဝင်ငွေ အမျိုးအစား | ထပ်ပေါင်းငွေ | အသေးစိတ် |
|------|--------|------|
| ရန်ပုံငွေမှ လွှဲပြောင်းငွေ (繰入金) | ယန်း 61,985 ထောင် | ဘဏ္ဍာရေးချိန်ညှိရန်ပုံငွေ ယန်း 47,885 ထောင် / လူမှုအရင်းအနှီး ဖွံ့ဖြိုးရေးရန်ပုံငွေ ယန်း 14,100 ထောင် |
| အထွေထွေဝင်ငွေ (諸収入) | ယန်း 126,579 ထောင် | လွှဲအပ်လုပ်ငန်းမှ ဝင်ငွေ (အများသုံး မိလ္လာပိုက် တည်ဆောက်ရေးစရိတ်) ယန်း 14,240 ထောင် / စာချုပ်ချိုးဖောက်မှု ဒဏ်ငွေနှင့် နောက်ကျပေးချေမှု အတိုး ယန်း 32,235 ထောင် / အခြားဝင်ငွေ (雑入၊ အဲဒိုဂါဝါဘာရှိ-ဒိုရီ ပထမအဆင့် လမ်းပြုပြင်စရိတ် ပြန်အမ်းငွေနှင့် ညီမျှ) ယန်း 80,104 ထောင် |
| အထူးရပ်ကွက် ချေးငွေစာချုပ် (特別区債) | ယန်း 104,000 ထောင် | ဒေသဖွံ့ဖြိုးရေး ချေးငွေစာချုပ် ယန်း 7,000 ထောင် / မြို့ပြအင်ဂျင်နီယာ ချေးငွေစာချုပ် ယန်း 97,000 ထောင် |

ယခုအကြိမ်တွင် ဘဏ္ဍာရေးချိန်ညှိရန်ပုံငွေ (財政調整基金) မှ ယန်း 47,885 ထောင် ထုတ်ယူမည်။ 2026 ဘဏ္ဍာနှစ်ကုန်တွင် ရန်ပုံငွေ၏ ခန့်မှန်းလက်ကျန်မှာ ယန်း 26,179,670 ထောင် (ယန်း ဘီလီယံ 26.18 ခန့်) ဖြစ်သည်။

အထူးရပ်ကွက် ချေးငွေစာချုပ်၏ စုစုပေါင်းကန့်သတ်ချက်သည် ယန်း 2,443,000 ထောင်မှ ယန်း 2,547,000 ထောင်သို့ ပြောင်းလဲသည်။

## ဤဥပဒေကြမ်း၏ ရလဒ်

2026 ခုနှစ် (ရေးဝ 8) ဒုတိယအကြိမ် ပုံမှန်အစည်းအဝေး (အစည်းအဝေးကာလ: ဇွန်လ 10 ရက်မှ ဇွန်လ 19 ရက်အထိ) တွင် မူလအဆိုအတိုင်း မဲအောင် (原案可決) ခဲ့သည်။`,
  },
  {
    bill_slug: gianKey(42),
    difficulty_level: "normal",
    locale: "vi",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-24",
    source_hash:
      "v1:50bae16937cb286f0067304c2100f22f5612bcde839282c49c929e96eafb891b",
    title: "Tăng kinh phí phiếu mua hàng khu phố mua sắm và công trình đường (Ngân sách bổ sung tài khoản chung số 2)",
    summary: "Ngân sách bổ sung này thêm 292.564.000 yên vào Tài khoản chung. Nội dung gồm trợ cấp nâng tỷ lệ ưu đãi của Phiếu mua hàng Happy khu phố mua sắm từ 20% lên 30%, công trình thiết bị tại Trung tâm khu vực Tsunohazu, và tăng kinh phí cải tạo đường và cống thoát nước công cộng Giai đoạn I đường Edogawabashi-dori.",
    content: `# Tăng kinh phí phiếu mua hàng khu phố mua sắm và công trình đường (Ngân sách bổ sung tài khoản chung số 2)

Đây là ngân sách bổ sung cho Tài khoản chung năm tài chính 2026 (Reiwa 8), do Quận trưởng trình ngày 10 tháng 6 năm 2026. Ngân sách thêm 292.564 nghìn yên (khoảng 292,56 triệu yên) vào cả thu và chi, nâng tổng Tài khoản chung lên 189.293.341 nghìn yên (khoảng 189,29 tỷ yên).

## Tiền được dùng vào việc gì

### Mở rộng Phiếu mua hàng Happy khu phố mua sắm (商店街ハッピー商品券) (160.224 nghìn yên)

Đây là khoản trợ cấp cho Liên hiệp các hội khu phố mua sắm quận Shinjuku (新宿区商店会連合会). Tài liệu tóm tắt của quận giải thích lý do mở rộng như sau (bản dịch của chúng tôi): "nhằm vực dậy các khu phố mua sắm và hỗ trợ đời sống cư dân, trước tình trạng giá cả tăng kéo dài và ảnh hưởng của tình hình Trung Đông."

| Mục | Nội dung |
|------|------|
| Tỷ lệ ưu đãi | 20% → 30% (mua phiếu giấy trị giá 13.000 yên với giá 10.000 yên) |
| Phiếu chung (dùng được ở mọi cửa hàng) | Trị giá 4.500 yên → 5.000 yên |
| Phiếu hỗ trợ (dùng được ở cửa hàng của doanh nghiệp vừa và nhỏ có diện tích dưới 1.000 mét vuông) | Trị giá 7.500 yên → 8.000 yên |
| Cửa hàng áp dụng | Cửa hàng thuộc hội khu phố mua sắm và thuộc Liên hiệp các hội khu phố mua sắm quận Shinjuku |
| Số tập phát hành | 150.000 tập |
| Nơi bán | Tất cả bưu điện trong quận |
| Thời gian đăng ký | Từ 1 tháng 7 đến 27 tháng 7 |
| Thời gian bán | Từ 16 tháng 9 đến 16 tháng 10 |
| Thời gian sử dụng | Từ 1 tháng 10 đến 8 tháng 1 |

### Công trình thiết bị tại Trung tâm khu vực Tsunohazu (角筈地域センター) (9.284 nghìn yên)

Tăng chi phí xây dựng do điều chỉnh đơn giá nhân công và các yếu tố khác.

### Đường và cống thoát nước Giai đoạn I đường Edogawabashi-dori (江戸川橋通り第Ⅰ期) (123.056 nghìn yên)

Cả hai đều là tăng chi phí xây dựng do thay đổi kế hoạch cải tạo.

- Cải tạo đường (chi phí xây dựng): 108.816 nghìn yên
- Xây dựng cống thoát nước công cộng (chi phí xây dựng): 14.240 nghìn yên

## Tiền lấy từ đâu

| Khoản thu | Số tiền bổ sung | Chi tiết |
|------|--------|------|
| Chuyển từ quỹ (繰入金) | 61.985 nghìn yên | Quỹ điều tiết tài chính 47.885 nghìn yên / Quỹ phát triển vốn xã hội, v.v. 14.100 nghìn yên |
| Thu khác (諸収入) | 126.579 nghìn yên | Thu từ công việc được ủy thác (chi phí xây dựng cống thoát nước công cộng) 14.240 nghìn yên / Tiền phạt vi phạm hợp đồng và lãi chậm trả 32.235 nghìn yên / Thu lặt vặt (雑入; tương đương khoản hoàn trả chi phí cải tạo đường Giai đoạn I Edogawabashi-dori) 80.104 nghìn yên |
| Trái phiếu đặc khu (特別区債) | 104.000 nghìn yên | Trái phiếu phát triển khu vực 7.000 nghìn yên / Trái phiếu công trình dân dụng 97.000 nghìn yên |

Lần này quận rút 47.885 nghìn yên từ Quỹ điều tiết tài chính (財政調整基金). Số dư dự kiến của quỹ vào cuối năm tài chính 2026 là 26.179.670 nghìn yên (khoảng 26,18 tỷ yên).

Tổng hạn mức trái phiếu đặc khu thay đổi từ 2.443.000 nghìn yên thành 2.547.000 nghìn yên.

## Kết quả của dự án này

Dự án đã được thông qua nguyên văn (原案可決) tại Kỳ họp định kỳ lần thứ 2 năm 2026 (Reiwa 8) (thời gian họp: từ 10 tháng 6 đến 19 tháng 6).`,
  },
];

export function createBillContentTranslations(
  insertedBills: SeededBillRef[],
  insertedContents: Array<{
    id: string;
    bill_id: string;
    difficulty_level: string;
  }>
) {
  return billTranslationsWithBillSlug.map(
    ({ bill_slug, difficulty_level, ...translation }) => {
      const bill = requireBillBySlug(insertedBills, bill_slug);
      const content = insertedContents.find(
        (c) => c.bill_id === bill.id && c.difficulty_level === difficulty_level
      );
      if (!content) {
        throw new Error(
          `bill_contents not found for translation: ${bill_slug} / ${difficulty_level}`
        );
      }
      return {
        bill_content_id: content.id,
        ...translation,
        source_snapshot: findTranslationSourceSnapshot(
          bill_slug,
          difficulty_level
        ),
      };
    }
  );
}

/**
 * 翻訳元の日本語（source_snapshot）。管理画面で原文が改定されたときの差分表示に使う。
 * source_hash と同じ日本語を指すことは bill-translations-data.test.ts で確かめている。
 */
export function findTranslationSourceSnapshot(
  billSlug: string,
  difficultyLevel: string
) {
  const source = billContentsWithBillSlug.find(
    (c) => c.bill_slug === billSlug && c.difficulty_level === difficultyLevel
  );
  if (!source) {
    throw new Error(
      `bill_contents seed not found for translation: ${billSlug} / ${difficultyLevel}`
    );
  }
  return {
    title: source.title,
    summary: source.summary,
    content: source.content,
  };
}
