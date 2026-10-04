import type { Database } from "@mirai-gikai/supabase";
import {
  r8_1GianKey,
  r8_1GiinKey,
  r8_1ShoninKey,
} from "./shinjuku-r8-1-inventory";
import { giinKey, gianKey, shoninKey } from "./shinjuku-r8-2-inventory";

export { FACTION_STANCE_SOURCES } from "@mirai-gikai/shared/bills/faction-stance-sources";

// 新宿区議会 会派ごとの賛否（令和8年第2回定例会）
//
// 出典: 新宿区議会「議案の概要と審議結果（賛成…○、反対…×）」（令和8年第2回定例会）
//   https://www.city.shinjuku.lg.jp/content/000459252.pdf
//   （掲載ページ: https://www.city.shinjuku.lg.jp/kusei/file08_05_0003820210204_00014.html）
//   同じ表は新宿区議会だより No.322（令和8年7月25日発行）2面にも載っており、
//   27行すべての議案名・○×が一致することを確認した（2026-09-25）。
//
// 会議録は起立採決を「起立多数」とだけ記録し、誰が起立したかを残さない。
// そのため賛否の出典はこの表とし、会議録の討論は照合にだけ使う
// （docs/20260925_1330_会派賛否データ投入計画.md §7）。
//
// 表の列は採決時点の8会派。DB の会派（令和8年8月7日時点の9会派）とは
// 次の2点が異なる（同計画 §3）。
// - 「れいわ新選組 新宿」は令和8年8月7日付けで「いのちの党 新宿」に名称変更した。
// - 「アップデート新宿」は定例会の後（7月1日）に結成されたため、賛否の行を作らない。
//
// 賛否は会派の態度。所属議員の個別の投票はこの資料からはわからない。

type StanceType = Database["public"]["Enums"]["stance_type_enum"];

/**
 * 表の賛否の列。左から表の並び順。
 * nameAtVote は表の欄外にある「会派略称」の正式名称で、採決時の会派名として保存する。
 * DB の会派とは、nameAtVote が display_name か alternative_names に一致するもので対応させる。
 */
export const R8_2_VOTE_COLUMNS = [
  { heading: "自参ク", nameAtVote: "自民・参政クラブ" },
  { heading: "公明", nameAtVote: "新宿区議会公明党" },
  { heading: "共産", nameAtVote: "日本共産党新宿区議会議員団" },
  { heading: "新宿会", nameAtVote: "新宿未来の会" },
  { heading: "民無ク", nameAtVote: "立憲民主党・無所属クラブ" },
  { heading: "維新", nameAtVote: "日本維新の会・新宿区議団" },
  { heading: "現役", nameAtVote: "現役世代に優しい新宿・減税の会" },
  { heading: "れいわ", nameAtVote: "れいわ新選組 新宿" },
] as const;

export type SeedBillVotes = {
  /** 議案の安定識別子（bills.slug） */
  billKey: string;
  /** 表の議案名（照合用） */
  titleInSource: string;
  /** R8_2_VOTE_COLUMNS の順に ○（賛成）/ ×（反対）を並べたもの */
  marks: string;
};

// 表の全27件。並びは表のとおり（区長提出議案23件のあとに議員提出議案4件で、
// インベントリの並びと同じ）。

// 新宿区議会 会派ごとの賛否（令和8年第1回定例会）
//
// 出典: 新宿区議会「議案の概要と審議結果（賛成…○、反対…×）」（令和8年第1回定例会）
//   https://www.city.shinjuku.lg.jp/content/000452334.pdf
//   （会期: 令和8年2月17日〜3月24日、全48件）
//
// 表の列は採決時点の8会派で、第2回定例会（R8_2_VOTE_COLUMNS）と完全に同一。
// 第41号議案「新宿区国民健康保険条例の一部を改正する条例」の立憲民主党・無所属クラブ欄に
// 「1人反対」の注記があるが、会派としての態度は賛成（○）。個別の投票は解説本文（わからないこと）に記載。
export const R8_1_VOTE_COLUMNS = R8_2_VOTE_COLUMNS;

// 表の全48件。並びは「議案の概要と審議結果」PDFの表のとおり。
export const r8_1BillVotes: SeedBillVotes[] = [
  {
    billKey: r8_1ShoninKey(1),
    titleInSource: "専決処分の承認について",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(1),
    titleInSource: "令和8年度新宿区一般会計予算",
    marks: "○○×○○○○×",
  },
  {
    billKey: r8_1GianKey(37),
    titleInSource: "令和8年度新宿区一般会計補正予算（第1号）",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(2),
    titleInSource: "令和8年度新宿区国民健康保険特別会計予算",
    marks: "○○×○○○○×",
  },
  {
    billKey: r8_1GianKey(38),
    titleInSource: "令和8年度新宿区国民健康保険特別会計補正予算（第1号）",
    marks: "○○×○○○○×",
  },
  {
    billKey: r8_1GianKey(3),
    titleInSource: "令和8年度新宿区介護保険特別会計予算",
    marks: "○○×○○○○×",
  },
  {
    billKey: r8_1GianKey(39),
    titleInSource: "令和8年度新宿区介護保険特別会計補正予算（第1号）",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(4),
    titleInSource: "令和8年度新宿区後期高齢者医療特別会計予算",
    marks: "○○×○○○○×",
  },
  {
    billKey: r8_1GianKey(5),
    titleInSource: "令和7年度新宿区一般会計補正予算（第12号）",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(6),
    titleInSource: "令和7年度新宿区一般会計補正予算（第13号）",
    marks: "○○×○○○○○",
  },
  {
    billKey: r8_1GianKey(40),
    titleInSource: "令和7年度新宿区一般会計補正予算（第14号）",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(7),
    titleInSource: "令和7年度新宿区国民健康保険特別会計補正予算（第3号）",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(8),
    titleInSource: "令和7年度新宿区介護保険特別会計補正予算（第3号）",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(9),
    titleInSource: "令和7年度新宿区後期高齢者医療特別会計補正予算（第3号）",
    marks: "○○×○○○○○",
  },
  {
    billKey: r8_1GianKey(10),
    titleInSource: "新宿区行政手続条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(11),
    titleInSource: "新宿区職員定数条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(12),
    titleInSource: "新宿区職員の特殊勤務手当に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(13),
    titleInSource: "公益的法人等への新宿区職員の派遣等に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(14),
    titleInSource: "新宿区職員の給与に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(15),
    titleInSource: "新宿区住民基本台帳制度の適正な運用に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(16),
    titleInSource: "新宿区立産業振興施設条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(17),
    titleInSource: "新宿区介護保険条例の一部を改正する条例",
    marks: "○○×○○○○○",
  },
  {
    billKey: r8_1GianKey(18),
    titleInSource: "新宿区子ども・子育て支援法に基づく過料に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(19),
    titleInSource: "新宿区特定教育・保育施設及び特定地域型保育事業の運営に関する基準を定める条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(20),
    titleInSource: "新宿区特定乳児等通園支援事業の運営に関する基準を定める条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(21),
    titleInSource: "新宿区乳児等通園支援事業の実施に関する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(22),
    titleInSource: "新宿区後期高齢者医療に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(23),
    titleInSource: "新宿区保健事業の利用に係る使用料等を定める条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(24),
    titleInSource: "新宿区保健衛生事務手数料条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(25),
    titleInSource: "新宿区自転車等の適正利用の推進及び自転車等駐輪場の整備に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(26),
    titleInSource: "新宿区リサイクル及び一般廃棄物の処理に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(27),
    titleInSource: "新宿区環境土木・都市計画事務手数料条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(28),
    titleInSource: "新宿区中高層階住環境保全地区の区域内における建築物の制限に関する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(29),
    titleInSource: "新宿区ワンルームマンション等の建築及び管理に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(30),
    titleInSource: "新宿区中高層建築物の建築に係る紛争の予防と調整に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(31),
    titleInSource: "新宿区大規模マンション及び開発事業に係る市街地環境の整備に関する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(32),
    titleInSource: "新宿区公共料金支払基金条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(33),
    titleInSource: "新宿区幼稚園教育職員の給与に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(34),
    titleInSource: "新宿区立の小学校、中学校及び特別支援学校の非常勤の学校医、学校歯科医及び学校薬剤師の公務災害補償に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(35),
    titleInSource: "新宿区選挙長等の報酬及び費用弁償等に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GianKey(41),
    titleInSource: "新宿区国民健康保険条例の一部を改正する条例",
    marks: "○○×○○○○×",
  },
  {
    billKey: r8_1GianKey(36),
    titleInSource: "東京都後期高齢者医療広域連合規約の一部を変更する規約について",
    marks: "○○○○○○○○",
  },
  {
    billKey: r8_1GiinKey(1),
    titleInSource: "新宿区介護・福祉人材緊急確保・定着奨励金の支給に関する条例",
    marks: "××○××××○",
  },
  {
    billKey: r8_1GiinKey(2),
    titleInSource: "新宿区保健事業の利用に係る使用料等を定める条例を廃止する条例",
    marks: "××○××××○",
  },
  {
    billKey: r8_1GiinKey(3),
    titleInSource: "新宿区安心居住支援家賃の助成に関する条例",
    marks: "××○××××○",
  },
  {
    billKey: r8_1GiinKey(4),
    titleInSource: "新宿区立学校における学用品の給付に関する条例",
    marks: "××○××××○",
  },
  {
    billKey: r8_1GiinKey(5),
    titleInSource: "新宿区立学校における修学旅行費の無償化に関する条例",
    marks: "××○××××○",
  },
  {
    billKey: r8_1GiinKey(6),
    titleInSource: "住民の居住環境保護と適正な民泊運営の実現に向けた制度見直しに関する意見書",
    marks: "○○○○○○○○",
  },
];

export const r8_2BillVotes: SeedBillVotes[] = [
  {
    billKey: shoninKey(2),
    titleInSource: "専決処分の承認について（第2号）",
    marks: "○○○○○○○○",
  },
  {
    billKey: shoninKey(3),
    titleInSource: "専決処分の承認について（第３号）",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(42),
    titleInSource: "令和8年度新宿区一般会計補正予算（第2号）",
    marks: "○○○○○○×○",
  },
  {
    billKey: gianKey(43),
    titleInSource: "令和8年度新宿区一般会計補正予算（第3号）",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(44),
    titleInSource: "新宿区総合計画の議決に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(45),
    titleInSource:
      "新宿区における個人番号の利用及び特定個人情報の提供に関する条例の一部を改正する条例",
    marks: "○○○○○○○×",
  },
  {
    billKey: gianKey(46),
    titleInSource:
      "新宿区職員の勤務時間、休日、休暇等に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(47),
    titleInSource: "新宿区特別区税条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(48),
    titleInSource:
      "災害に際し応急措置の業務等に従事した者の損害補償に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(49),
    titleInSource: "新宿区印鑑条例等の一部を改正する条例",
    marks: "○○○○○○○×",
  },
  {
    billKey: gianKey(50),
    titleInSource:
      "新宿区家庭的保育事業等の設備及び運営に関する基準を定める条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(51),
    titleInSource:
      "新宿区特定教育・保育施設及び特定地域型保育事業の運営に関する基準を定める条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(52),
    titleInSource:
      "新宿区保健事業の利用に係る使用料等を定める条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(53),
    titleInSource:
      "新宿区空き缶等の散乱及び路上喫煙による被害の防止に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(54),
    titleInSource:
      "新宿区地区計画の区域内における建築物の制限に関する条例の一部を改正する条例",
    marks: "○○×○○○○○",
  },
  {
    billKey: gianKey(55),
    titleInSource:
      "新宿区幼稚園教育職員の勤務時間、休日、休暇等に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(56),
    titleInSource:
      "新宿区立の小学校、中学校及び特別支援学校の非常勤の学校医、学校歯科医及び学校薬剤師の公務災害補償に関する条例の一部を改正する条例",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(57),
    titleInSource: "落合中央公園野球場人工芝等改修工事請負契約",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(58),
    titleInSource: "新宿コズミックセンタープラネタリウム設備改修工事等委託契約",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(59),
    titleInSource: "災害用備蓄物資の買入れについて",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(60),
    titleInSource: "区設掲示板用マグネット画板等の買入れについて",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(61),
    // 表はローマ数字「第Ⅰ期」。DB は提出議案一覧ページの「第1期」
    titleInSource: "道路改良工事（江戸川橋通り第Ⅰ期）（その2）請負契約",
    marks: "○○○○○○○○",
  },
  {
    billKey: gianKey(62),
    titleInSource:
      "新宿区立角筈区民ホール天井改修その他工事請負契約の変更について",
    marks: "○○○○○○○○",
  },
  {
    billKey: giinKey(7),
    titleInSource: "新宿区立学校における学用品の給付に関する条例",
    marks: "××○××××○",
  },
  {
    billKey: giinKey(8),
    titleInSource: "新宿区立学校における修学旅行費の無償化に関する条例",
    marks: "××○××××○",
  },
  {
    billKey: giinKey(9),
    titleInSource: "ドナーミルクの利用拡大を求める意見書",
    marks: "○○○○○○○○",
  },
  {
    billKey: giinKey(10),
    titleInSource: "「不合理な税制改正」に反対する意見書",
    marks: "○○○○○○○○",
  },
];

const MARK_TO_STANCE: Record<string, StanceType> = {
  "○": "for",
  "×": "against",
};

/** 本番インポーターに渡す1行。議案は slug、会派は name の自然キーで表す */
export type FactionStanceImportRow = {
  bill_slug: string;
  faction_name: string;
  type: StanceType;
  faction_name_at_vote: string;
};

type FactionRef = {
  name: string;
  display_name: string;
  alternative_names?: string[] | null;
};

/**
 * 採決時の会派名から DB の会派を1つに決める。
 * 一致しない・複数に一致する場合は推測せず例外にする（計画 §3 ルール1）。
 */
export function resolveFactionAtVote(
  nameAtVote: string,
  factions: FactionRef[]
): FactionRef {
  const matched = factions.filter(
    (f) =>
      f.display_name === nameAtVote ||
      (f.alternative_names ?? []).includes(nameAtVote)
  );
  if (matched.length !== 1) {
    throw new Error(
      `採決時の会派名「${nameAtVote}」に対応する会派が${matched.length}件あります（1件でなければなりません）`
    );
  }
  return matched[0];
}

/**
 * ○/× の並びを賛否に変換する。列数が合わない・○×以外の記号がある場合は
 * 推測で埋めず例外にする（計画 §3 ルール2）。
 */
export function parseVoteMarks(
  marks: string,
  columnCount: number
): StanceType[] {
  const chars = [...marks];
  if (chars.length !== columnCount) {
    throw new Error(
      `賛否の記号が${chars.length}個あります（${columnCount}個でなければなりません）: ${marks}`
    );
  }
  return chars.map((char) => {
    const stance = MARK_TO_STANCE[char];
    if (!stance) {
      throw new Error(`賛否の記号「${char}」は変換できません: ${marks}`);
    }
    return stance;
  });
}

export function toFactionStanceImportRows(
  billVotes: SeedBillVotes[],
  factions: FactionRef[],
  columns: readonly { nameAtVote: string }[] = R8_2_VOTE_COLUMNS
): FactionStanceImportRow[] {
  const columnFactions = columns.map((column) =>
    resolveFactionAtVote(column.nameAtVote, factions)
  );
  // 2列が同じ会派に当たると（議案・会派）が重複し、dry-run は通っても
  // RPC の upsert が失敗する。会派の合流などで起こりうるので先に止める
  const names = columnFactions.map((faction) => faction.name);
  if (new Set(names).size !== names.length) {
    throw new Error(
      `複数の列が同じ会派に対応しています: ${names.join(", ")}`
    );
  }
  return billVotes.flatMap((bill) =>
    parseVoteMarks(bill.marks, columns.length).map((type, i) => ({
      bill_slug: bill.billKey,
      faction_name: columnFactions[i].name,
      type,
      faction_name_at_vote: columns[i].nameAtVote,
    }))
  );
}

/** extract-faction-stances.py が出す「議案の概要と審議結果」の表 */
export type ExtractedStanceTable = {
  headings: string[];
  rows: { title: string; marks: string; result: string }[];
};

/**
 * PDFから読んだ表と seed を1行ずつ比べ、食い違いを文章で返す（無ければ空配列）。
 * 区長提出議案は表の先頭から seed と同じ並びで載っている前提で、行の位置で突き合わせる。
 */
export function compareStanceTable(
  table: ExtractedStanceTable,
  billVotes: SeedBillVotes[],
  columns: readonly { heading: string }[] = R8_2_VOTE_COLUMNS
): string[] {
  const problems: string[] = [];
  const headings = columns.map((column) => column.heading);
  if (table.headings.join(",") !== headings.join(",")) {
    problems.push(
      `列見出しが違う: PDF=${table.headings.join(",")} seed=${headings.join(",")}`
    );
  }
  billVotes.forEach((bill, i) => {
    const row = table.rows[i];
    if (!row) {
      problems.push(`${bill.billKey}: PDFに${i + 1}行目がない`);
      return;
    }
    if (row.title !== bill.titleInSource) {
      problems.push(
        `${bill.billKey}: 議案名が違う\n  PDF : ${row.title}\n  seed: ${bill.titleInSource}`
      );
    }
    if (row.marks !== bill.marks) {
      problems.push(
        `${bill.billKey}: 賛否が違う PDF=${row.marks} seed=${bill.marks}（${row.title}）`
      );
    }
  });
  return problems;
}
