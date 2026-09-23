import type { Database } from "@mirai-gikai/supabase";

// 新宿区議会議員の名簿（第20期、令和5年5月1日～令和9年4月30日）
//
// 出典（いずれも 2026年8月7日 更新時点の公式ページ）:
// - 議員名簿（議席番号順・当選期数・所属会派・ウェブサイト）
//   https://www.city.shinjuku.lg.jp/kusei/gikai01_000112.html
// - 会派構成（会派ごとの所属議員と会派内役職）
//   https://www.city.shinjuku.lg.jp/kusei/file08_00003.html
// - 委員会名簿（委員会ごとの委員長・副委員長・委員）
//   https://www.city.shinjuku.lg.jp/kusei/file08_01_00013.html
//
// 顔写真は使わない。公式名簿にある住所・電話番号・メールアドレスは持たない。
// ウェブサイトは公式名簿の「URL」欄に掲載されたものだけを入れる。

export const COUNCIL_ROSTER_URL =
  "https://www.city.shinjuku.lg.jp/kusei/gikai01_000112.html";

export type CommitteeRole = "委員長" | "副委員長" | "委員";

export type SeedCouncilMember = {
  /** 氏名（公式名簿の表記） */
  name: string;
  nameKana: string;
  /** factions.name（会派キー） */
  faction: string;
  /** 会派内の役職（会派構成ページの表記） */
  factionRole: string | null;
  terms: number;
  websiteUrl: string | null;
  /** committees.name → 委員会内の役職 */
  committees: Record<string, CommitteeRole>;
};

// 配列の並びは公式名簿の議席番号順（No.1〜No.38）
export const councilMembers: SeedCouncilMember[] = [
  {
    name: "木もと ひろゆき",
    nameKana: "きもと ひろゆき",
    faction: "komei",
    factionRole: "会計",
    terms: 3,
    websiteUrl: "https://www.komei.or.jp/km/kimoto/",
    committees: {
      文教子ども家庭委員会: "委員長",
      防災等安全対策特別委員会: "委員",
    },
  },
  {
    name: "時光 じゅん子",
    nameKana: "ときみつ じゅんこ",
    faction: "komei",
    factionRole: null,
    terms: 2,
    websiteUrl: "https://www.komei.or.jp/km/tokimitsu-junko-shinjuku/",
    committees: {
      環境建設委員会: "委員",
      議会運営委員会: "委員",
      本庁舎対策等特別委員会: "委員",
    },
  },
  {
    name: "高阪 まさし",
    nameKana: "こうさか まさし",
    faction: "jimin-sansei",
    factionRole: null,
    terms: 1,
    websiteUrl: "https://m-kousaka.com",
    committees: {
      総務区民委員会: "委員",
      議会運営委員会: "委員",
      防災等安全対策特別委員会: "委員",
    },
  },
  {
    name: "石川 孝一",
    nameKana: "いしかわ こういち",
    faction: "jimin-sansei",
    factionRole: "会計",
    terms: 1,
    websiteUrl: "https://ishikawakouichi.com",
    committees: {
      総務区民委員会: "委員",
      文化観光産業等特別委員会: "委員",
    },
  },
  {
    name: "かなくぼ なな子",
    nameKana: "かなくぼ ななこ",
    faction: "shinjuku-mirai",
    factionRole: null,
    terms: 1,
    websiteUrl: null,
    committees: {
      環境建設委員会: "委員",
      本庁舎対策等特別委員会: "委員",
    },
  },
  {
    name: "たなえ ひさし",
    nameKana: "たなえ ひさし",
    faction: "shinjuku-mirai",
    factionRole: null,
    terms: 1,
    websiteUrl: "https://tanae-hisashi.net/",
    committees: {
      総務区民委員会: "委員",
      文化観光産業等特別委員会: "委員",
    },
  },
  {
    name: "杉山 直子",
    nameKana: "すぎやま なおこ",
    faction: "kyosan",
    factionRole: "会計",
    terms: 1,
    websiteUrl: "https://jcp-net.info/sugiyamanaoko/",
    committees: {
      福祉健康委員会: "委員",
      本庁舎対策等特別委員会: "委員",
    },
  },
  {
    name: "高月 まな",
    nameKana: "たかつき まな",
    faction: "kyosan",
    factionRole: null,
    terms: 2,
    websiteUrl: null,
    committees: {
      環境建設委員会: "副委員長",
      文化観光産業等特別委員会: "委員",
    },
  },
  {
    name: "三沢 ひで子",
    nameKana: "みさわ ひでこ",
    faction: "komei",
    factionRole: null,
    terms: 3,
    websiteUrl: "https://www.misawahideko.com",
    committees: {
      総務区民委員会: "委員",
      文化観光産業等特別委員会: "委員",
    },
  },
  {
    name: "井下田 栄一",
    nameKana: "いげた えいいち",
    faction: "komei",
    factionRole: "幹事長",
    terms: 4,
    websiteUrl: "https://www.komei.or.jp/km/igeta/",
    committees: {
      文教子ども家庭委員会: "委員",
      議会運営委員会: "委員",
      文化観光産業等特別委員会: "副委員長",
    },
  },
  {
    name: "渡辺 みちたか",
    nameKana: "わたなべ みちたか",
    faction: "jimin-sansei",
    factionRole: "副幹事長",
    terms: 2,
    websiteUrl: null,
    committees: {
      環境建設委員会: "委員長",
      議会運営委員会: "委員",
      本庁舎対策等特別委員会: "委員",
    },
  },
  {
    name: "青木 仁美",
    nameKana: "あおき ひとみ",
    faction: "jimin-sansei",
    factionRole: null,
    terms: 1,
    websiteUrl: "https://aokihitomi.com",
    committees: {
      文教子ども家庭委員会: "委員",
      "自治・議会・行財政改革等特別委員会": "委員",
    },
  },
  {
    name: "大門 さちえ",
    nameKana: "だいもん さちえ",
    faction: "update",
    factionRole: "幹事長・会計",
    terms: 3,
    websiteUrl: "http://sachiedaimon.com/",
    committees: {
      福祉健康委員会: "委員",
      本庁舎対策等特別委員会: "委員",
    },
  },
  {
    name: "山口 かおる",
    nameKana: "やまぐち かおる",
    faction: "rikken",
    factionRole: "会計",
    terms: 1,
    websiteUrl: "http://www.yamaguchikaoru.com",
    committees: {
      文教子ども家庭委員会: "委員",
      文化観光産業等特別委員会: "委員",
    },
  },
  {
    name: "小野 裕次郎",
    nameKana: "おの ゆうじろう",
    faction: "rikken",
    factionRole: "副幹事長",
    terms: 3,
    websiteUrl: "https://www.y-ono.net",
    committees: {
      福祉健康委員会: "委員",
      議会運営委員会: "委員",
      防災等安全対策特別委員会: "委員長",
    },
  },
  {
    name: "志田 雄一郎",
    nameKana: "しだ ゆういちろう",
    faction: "rikken",
    factionRole: "幹事長",
    terms: 7,
    websiteUrl: "https://shida-you.jimdofree.com",
    committees: {
      環境建設委員会: "委員",
      本庁舎対策等特別委員会: "副委員長",
    },
  },
  {
    name: "鈴木 ひろみ",
    nameKana: "すずき ひろみ",
    faction: "shinjuku-mirai",
    factionRole: "幹事長",
    terms: 4,
    websiteUrl: "https://hiromi163.com/",
    committees: {
      環境建設委員会: "委員",
      議会運営委員会: "委員",
      防災等安全対策特別委員会: "副委員長",
    },
  },
  {
    name: "伊藤 陽平",
    nameKana: "いとう ようへい",
    faction: "shinjuku-mirai",
    factionRole: "副幹事長",
    terms: 3,
    websiteUrl: "https://itoyohei.com",
    committees: {
      文教子ども家庭委員会: "委員",
      本庁舎対策等特別委員会: "委員長",
    },
  },
  {
    name: "藤原 たけき",
    nameKana: "ふじわら たけき",
    faction: "kyosan",
    factionRole: null,
    terms: 2,
    websiteUrl: null,
    committees: {
      総務区民委員会: "委員長",
      "自治・議会・行財政改革等特別委員会": "委員",
    },
  },
  {
    name: "佐藤 佳一",
    nameKana: "さとう けいいち",
    faction: "kyosan",
    factionRole: "副幹事長",
    terms: 3,
    websiteUrl: null,
    committees: {
      福祉健康委員会: "副委員長",
      議会運営委員会: "委員",
      防災等安全対策特別委員会: "委員",
    },
  },
  {
    name: "豊島 あつし",
    nameKana: "とよしま あつし",
    faction: "komei",
    factionRole: "副幹事長",
    terms: 4,
    websiteUrl: "https://www.komei.or.jp/km/toyoshima-komei/",
    committees: {
      環境建設委員会: "委員",
      議会運営委員会: "委員",
      "自治・議会・行財政改革等特別委員会": "委員",
    },
  },
  {
    name: "野もと あきとし",
    nameKana: "のもと あきとし",
    faction: "komei",
    factionRole: null,
    terms: 5,
    websiteUrl: null,
    committees: {
      福祉健康委員会: "委員",
      "自治・議会・行財政改革等特別委員会": "委員",
    },
  },
  {
    // 公式の委員会名簿でも特別委員会の所属はない
    name: "渡辺 清人",
    nameKana: "わたなべ きよと",
    faction: "jimin-sansei",
    factionRole: null,
    terms: 3,
    websiteUrl: null,
    committees: {
      環境建設委員会: "委員",
    },
  },
  {
    name: "池田 だいすけ",
    nameKana: "いけだ だいすけ",
    faction: "jimin-sansei",
    factionRole: null,
    terms: 4,
    websiteUrl: "https://capoeira.or.jp/ikedadaisuke/",
    committees: {
      文教子ども家庭委員会: "委員",
      文化観光産業等特別委員会: "委員長",
    },
  },
  {
    name: "渡辺 やすし",
    nameKana: "わたなべ やすし",
    faction: "genekisedai",
    factionRole: "副幹事長・会計",
    terms: 1,
    websiteUrl: "https://watanabe-yasushi.tokyo/",
    committees: {
      文教子ども家庭委員会: "委員",
      "自治・議会・行財政改革等特別委員会": "委員",
    },
  },
  {
    name: "田中 ゆきえ",
    nameKana: "たなか ゆきえ",
    faction: "genekisedai",
    factionRole: "幹事長",
    terms: 2,
    websiteUrl: "http://www.tanakayukie.com",
    committees: {
      総務区民委員会: "委員",
      文化観光産業等特別委員会: "委員",
    },
  },
  {
    name: "おやまだ 静香",
    nameKana: "おやまだ しずか",
    faction: "ishin",
    factionRole: "副幹事長・会計",
    terms: 1,
    websiteUrl: "https://www.shizuka-oyamada.jp/",
    committees: {
      文教子ども家庭委員会: "委員",
      文化観光産業等特別委員会: "委員",
    },
  },
  {
    name: "古畑 まさのり",
    nameKana: "ふるはた まさのり",
    faction: "ishin",
    factionRole: "幹事長",
    terms: 1,
    websiteUrl: "https://go2senkyo.com/seijika/185645",
    committees: {
      総務区民委員会: "委員",
      議会運営委員会: "委員",
      防災等安全対策特別委員会: "委員",
    },
  },
  {
    name: "のづ ケン",
    nameKana: "のづ けん",
    faction: "shinjuku-mirai",
    factionRole: null,
    terms: 7,
    websiteUrl: null,
    committees: {
      福祉健康委員会: "委員",
      議会運営委員会: "副委員長",
      "自治・議会・行財政改革等特別委員会": "委員",
    },
  },
  {
    name: "えのき 秀隆",
    nameKana: "えのき ひでたか",
    faction: "shinjuku-mirai",
    factionRole: "会計",
    terms: 8,
    websiteUrl: "https://profile.ameba.jp/ameba/enokihidetaka1",
    committees: {
      福祉健康委員会: "委員長",
      防災等安全対策特別委員会: "委員",
    },
  },
  {
    name: "川村 のりあき",
    nameKana: "かわむら のりあき",
    faction: "kyosan",
    factionRole: "幹事長",
    terms: 6,
    websiteUrl: "https://kawamura-noriaki.com",
    committees: {
      総務区民委員会: "委員",
      議会運営委員会: "委員",
      "自治・議会・行財政改革等特別委員会": "委員長",
    },
  },
  {
    name: "近藤 なつ子",
    nameKana: "こんどう なつこ",
    faction: "kyosan",
    factionRole: "副団長",
    terms: 8,
    websiteUrl: null,
    committees: {
      文教子ども家庭委員会: "副委員長",
      防災等安全対策特別委員会: "委員",
    },
  },
  {
    name: "中村 しんいち",
    nameKana: "なかむら しんいち",
    faction: "komei",
    factionRole: null,
    terms: 5,
    websiteUrl: "https://www.komei.or.jp/km/s-nakamura/",
    committees: {
      福祉健康委員会: "委員",
      防災等安全対策特別委員会: "委員",
    },
  },
  {
    name: "有馬 としろう",
    nameKana: "ありま としろう",
    faction: "komei",
    factionRole: null,
    terms: 6,
    websiteUrl: null,
    committees: {
      総務区民委員会: "副委員長",
      本庁舎対策等特別委員会: "委員",
    },
  },
  {
    name: "ひやま 真一",
    nameKana: "ひやま しんいち",
    faction: "jimin-sansei",
    factionRole: "幹事長",
    terms: 4,
    websiteUrl: null,
    committees: {
      福祉健康委員会: "委員",
      議会運営委員会: "委員長",
      防災等安全対策特別委員会: "委員",
    },
  },
  {
    name: "下村 治生",
    nameKana: "しもむら はるお",
    faction: "jimin-sansei",
    factionRole: "団長",
    terms: 6,
    websiteUrl: "http://e-shimomura.seesaa.net/",
    committees: {
      総務区民委員会: "委員",
      "自治・議会・行財政改革等特別委員会": "副委員長",
    },
  },
  {
    name: "さわい めぐみ",
    nameKana: "さわい めぐみ",
    faction: "inochi",
    factionRole: "幹事長・会計",
    terms: 1,
    websiteUrl: "https://sawaimegumi.net",
    committees: {
      環境建設委員会: "委員",
      "自治・議会・行財政改革等特別委員会": "委員",
    },
  },
  {
    name: "沢田 あゆみ",
    nameKana: "さわだ あゆみ",
    faction: "kyosan",
    factionRole: "団長",
    terms: 8,
    websiteUrl: "https://sawadaayumi.blog.jp",
    committees: {
      環境建設委員会: "委員",
      本庁舎対策等特別委員会: "委員",
    },
  },
];

type CouncilMemberInsert =
  Database["public"]["Tables"]["council_members"]["Insert"];
type CouncilMemberCommitteeInsert =
  Database["public"]["Tables"]["council_member_committees"]["Insert"];

type NamedRow = { id: string; name: string };

function requireIdByName(rows: NamedRow[], name: string, kind: string) {
  const row = rows.find((r) => r.name === name);
  if (!row) {
    throw new Error(`${kind} not found for name: ${name}`);
  }
  return row.id;
}

/**
 * 議員の insert 行を作る。会派は factions.name（会派キー）で突合する。
 * sort_order は議席番号（配列の並び）。
 */
export function createCouncilMemberInserts(
  members: SeedCouncilMember[],
  insertedFactions: NamedRow[]
): CouncilMemberInsert[] {
  return members.map((member, index) => ({
    name: member.name,
    name_kana: member.nameKana,
    faction_id: requireIdByName(insertedFactions, member.faction, "Faction"),
    faction_role: member.factionRole,
    official_url: COUNCIL_ROSTER_URL,
    website_url: member.websiteUrl,
    terms: member.terms,
    sort_order: index + 1,
    is_active: true,
  }));
}

/**
 * 委員会所属の insert 行を作る。議員は氏名、委員会は委員会名で突合する。
 */
export function createCouncilMemberCommitteeInserts(
  members: SeedCouncilMember[],
  insertedMembers: NamedRow[],
  insertedCommittees: NamedRow[]
): CouncilMemberCommitteeInsert[] {
  return members.flatMap((member) => {
    const councilMemberId = requireIdByName(
      insertedMembers,
      member.name,
      "Council member"
    );
    return Object.entries(member.committees).map(([committeeName, role]) => ({
      council_member_id: councilMemberId,
      committee_id: requireIdByName(
        insertedCommittees,
        committeeName,
        "Committee"
      ),
      role,
    }));
  });
}
