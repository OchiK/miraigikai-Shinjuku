# Initial Backlog

## P0

### P0-1 Local boot
Acceptance:
- Supabase starts
- web/admin start
- seed reset passes

### P0-2 Branding compliance
Acceptance:
- No Team Mirai logo
- No original primary palette
- Required disclaimer visible
- Own source repository linked

### P0-3 Shinjuku config
Acceptance:
- title `みらい議会＠新宿区`
- `cityName = 新宿区`
- `councilName = 新宿区議会`
- Shinjuku official URLs
- AI chat enabled
- AI interview disabled
- party section disabled

### P0-4 Remove Kawasaki references
Acceptance:
`grep` results are only source comments/history where intentional.

## P1

### P1-1 2026 R2 session fixture
Acceptance:
- every published bill has stable external key
- source URLs saved
- result saved

### P1-2 Source provenance
Acceptance:
each derived content can trace back to source.

## P2

### P2-1 Restore easy difficulty
Acceptance:
- migration succeeds on fresh DB
- selector shows やさしい/ふつう/くわしく
- old normal/hard data still works

### P2-2 Easy Japanese prompt
Acceptance:
- no added policy claims
- numbers/dates preserved
- jargon explained
- sentences simplified

### P2-3 インクルーシブデザイン・アクセシビリティ検証（AccessLint / WCAG 2.2 AA）
AccessLint（@accesslint/cli, @accesslint/mcp, skills）を用いたアクセシビリティおよびインクルーシブデザインの自動スキャン・手動検証・是正。
Acceptance:
- accessibility-scan / accessibility-audit による主要画面（トップ、議案一覧、議案詳細、難易度切替）の WCAG 2.2 AA 検査
- accessibility-inspect によるキーボード操作、フォーカス順序、スクリーンリーダー対応、ズーム・リフロー、タップターゲットサイズの検証
- accessibility-fix による検出された違反箇所の修正・是正
- accessibility-diff による回帰検知（PR差分のアクセシビリティ評価）

## P3

### P3-1 i18n UI
Acceptance:
language switch works without losing current bill.

### P3-2 Translation schema
Acceptance:
- locale unique per source content
- stale detection possible
- generated/reviewed status stored

### P3-3 Seven locales（2026-09-24 見直し）
Acceptance（旧）:
ja/en/zh-Hans/ko/ne/my/vi available.

2026-09-24: 議案の翻訳を公開するのは英語のみに変更した。5言語は案内ページだけ置く（P3-5）。
経緯は `docs/20260924_0450_多言語方針の見直し_英語のみ翻訳と多言語案内ページ.md`。

#### 多言語公開とコミュニティレビュー戦略（B+Cハイブリッド方針）— 廃止（2026-09-24）
#40 で決めた方針。5言語の未確認の翻訳を警告付きで公開し、コミュニティの協力で順に `reviewed` にする予定だったが、
レビュー協力者のあてがないまま未確認の翻訳を議案ページに出すことになるためやめた。上記の文書で置き換える。

Progress (2026-09-24):
承認第2号・第42号議案「ふつう」の英訳の手動確認・公開承認（`reviewed`）が完了し、公開画面での日英切替表示および5言語案内ページが稼働。Phase 3 Exit 条件を達成。

### P3-4 翻訳・ルビ手動確認・編集機能（Translation & Ruby Review Tooling）
AI生成翻訳（generated）の対照確認・手動編集・公開承認（reviewed）および、
ルビ（ふりがな）の誤読確認・手動補正を行える管理画面・レビュー手段を整備する。
詳細は `docs/20260923_1650_翻訳およびルビ手動確認編集機能_要件定義.md` を参照。

Acceptance:
- 原文（日本語）と各言語の翻訳文を横並び（side-by-side）で対照確認・手動編集できるAdmin UI
- `source_hash` 照合による stale（原文変更あり）検知と変更差分（diff）の可視化
- 承認操作（`generated` → `reviewed`）および保存時の公開キャッシュ即時無効化（`CACHE_TAGS.BILLS` revalidate）
- ルビ（ふりがな）のリアルタイムプレビューおよび誤読補正・カスタムルビ辞書の管理機能

Progress (2026-09-23):
- Phase A（対照確認・手動編集・公開承認・キャッシュ無効化）は `admin/src/features/bill-translations/`（`/bills/[id]/translations`）で実装済み。
  承認時はレビュアーが見ていた日本語の `source_hash` を送り、保存時の日本語と違えば受け付けない。stale の翻訳の承認には明示の確認が要る。
- 2026-09-24: 原文の変更差分（diff）表示（TR-4）と一括確認の一覧画面（TR-7、`/bills/translations`）を実装した（#41）。
- 未着手: ルビ関連（RB-1〜5）。
- ルビのプレビューは保留。公開画面の議案本文は raw HTML を通さず（`<ruby>` は落ちる）、`【正式名称】［ふりがな］（＝言いかえ）` もそのまま文字として出る。
  利用者に見えるふりがなは外部スクリプト Rubyful V2 が付けるものだけなので、管理画面で独自にルビを描くと公開画面と食い違う。
  先に公開側の描画方針を決めること。

### P3-5 英語のみ翻訳・5言語の案内ページ（2026-09-24 実装。スクリーンショットのみ残り）
詳細は `docs/20260924_0450_多言語方針の見直し_英語のみ翻訳と多言語案内ページ.md`。

Acceptance:
- 英語以外の翻訳が公開されない
  - `packages/shared/src/i18n/` の `PUBLIC_TRANSLATION_LOCALES = ["en"]` で公開判定を制限し、テストで固定する
  - 言語切替メニューは日本語・英語のみ。`?lang=vi` などは日本語にフォールバックする
  - 管理画面の承認は英語以外ではサーバー側で拒否し、承認ボタンも出さない（下書きの閲覧・編集は可）
  - 既存の5言語の下書きは DB に残す
- zh-Hans / ko / ne / my / vi の案内ページ（例: `/guide/vi`）
  - 内容はサイトの説明・日本語が正本であること・ブラウザ翻訳の使い方（Chrome / Safari / Android / アプリ内ブラウザ、ふりがなを切ってから翻訳）・「やさしい」への切替・AIチャットは自分の言語で質問できること、の5つのみ。用語集と議会の仕組みの説明は載せない
  - やさしい日本語で原文を書いて機械翻訳し、日本語の原文を横に並べる。手順はスクリーンショットで示す
  - 先頭に各言語で「機械翻訳であること」と連絡先を1行で書く。ネイティブ確認はしない
  - `web/src/lib/routes.ts` にルート関数を追加し、5ページを `hreflang` で結んで sitemap に載せる
  - トップページとフッターから自言語表記でリンクする

Progress (2026-09-24):
- スクリーンショット以外は実装済み。公開判定は `isPublishableTranslation`、表示言語は `parseLocale` / middleware / `setLocaleCore`、
  管理画面は `canApproveTranslationLocale`（`upsertBillTranslation` とエディタの両方）で制限している。
- 案内ページの文面は `web/src/features/guide/shared/guide-content.ts`。原文と翻訳の段落数はテストで揃えている。
- 残り: ブラウザ翻訳の手順（Chrome / Safari / Android / アプリ内ブラウザ）のスクリーンショット。実機での撮影が要るため未作成で、いまは文章だけで説明している。

## P4

### P4-1 Chat guardrails
Acceptance:
- bill context only
- off-topic blocked before paid call where possible
- answer language follows user
- source shown

### P4-2 Cost ceiling
Acceptance:
- per-user daily cap
- total daily cap
- total monthly cap
- clear UI when cap reached

## P5

### P5-0 bill_number のユニーク制約を会期スコープにする ✅
2026-09-18完了。`bill_number` は会期ごとに一意とし、会期未割り当ての議案には
別の部分ユニークインデックスを適用する。重複候補の表示とAI収集結果の反映も
会期を考慮する。

Acceptance:
- `(council_session_id, bill_number)` の複合ユニークへ移行する新規migration
- 異なる会期で同一 `bill_number` を投入できる
- 同一会期内の重複は引き続き拒否される

### P5-1 Automation
Acceptance:
new Shinjuku page/PDF change creates draft, never silently overwrites reviewed content.

## P7

### P7-1 議員ページ（Council Person Page - 世田谷モデル）
「みらい議会＠世田谷区」の議員ページ（`/councilors`, `/councilors/[id]`）をモデルに、
新宿区議会議員（定数38名）の一覧・詳細ページおよび質問要約・所属会派・委員会導線を整備する。
詳細は `docs/20260923_1630_議員ページ要件定義_世田谷モデル.md` を参照。

Acceptance:
- 議員一覧ページ（`/councilors`）で会派別・委員会別に新宿区議会議員（38名）の基本情報・アバター・質問集計を表示
- 議員詳細ページ（`/councilors/[id]`）で基本プロフィール、所属会派、所属委員会、公式名簿への外部リンク（基準日明記）を表示
- （Phase 7-B）議員詳細ページで本会議・委員会での発言・質問の要約カード、関心テーマタグ、AIサマリーを表示
- （Phase 7-C）議案詳細ページと発言・賛否議員との相互連携導線
- Organic デザインシステム（`globals.css` トークン、ボタン・アイコン規則、44pxタップ領域）および WCAG 2.2 AA に準拠

Progress (2026-09-24):
- Phase 7-A（議員一覧・議員詳細・会派/委員会表示・安全な本番インポーター）は完了（#38）。
  肖像権・著作権に配慮し、顔写真を使わずイニシャル/モノグラムアバター（`CouncilorAvatar`）で実装。
  公式一次資料（2026年8月7日現在）と突合した全38名・9会派・所属委員会87件をシード化。
- 次期着手（Phase 7-B/C）: 本会議・委員会での発言・質問要約（`council_member_questions`）連携、および議案賛否連携。

## P8 UI/UX・アクセシビリティ・ブランディング改善

### P8-1 トップページへの明確な復帰導線（Return to Top Navigation）
下層ページ（議案一覧、議案詳細、議員一覧、多言語案内等）からトップページへ戻る際、ヘッダーロゴ（「みらい議会＠新宿区」）がリンクであることに気づきにくいため、直感的な導線を整備する。

Acceptance:
- ロゴクリックによるホーム復帰の認知向上（ホバー/フォーカス表現・アクセシビリティ改善）
- パンくずリスト（Breadcrumb）または明示的な「ホーム / TOP」ボタン・アイコン導線の検討と導入
- スマホ・PC双方で迷わずトップページへ戻れること

Progress (2026-09-24):
- 下層ページではヘッダーのサイト名の前に家アイコンと「トップへ」（スマホではアイコンのみ・読み上げは「トップへ」）を付け、`title="トップページへ戻る"` とホバー/フォーカス表現を追加（`web/src/components/header/home-link.tsx`）。パンくずは導入していない。

### P8-2 デスクトップヘッダーの余白活用（Header Space Utilization）
デスクトップ表示時、ヘッダー左側のロゴと右側のトグル群（ふりがな・メニュー等）の間の余白を有効活用する。

Acceptance:
- 主要ナビゲーションリンク（議案、議員など）のインライン配置
- 現在の会期バッジ（例: `令和8年第2回定例会`）等の重要メタ情報の表示
- クイック検索や重要導線の配置検討

Progress (2026-09-24):
- `lg` 以上でヘッダー中央に「議案一覧」「議員一覧」と会期バッジを表示（`web/src/components/header/nav-links.tsx`）。会期はアクティブな定例会を優先し、無ければ最新のものを使う。クイック検索は未着手。

### P8-3 ハンバーガーメニュー内の多言語案内リンク削除（Menu Cleanup）
ハンバーガーメニュー内に多言語案内（`/guide/[locale]`）のリンクが並んでいるが、トップページにも同様の導線が存在し煩雑なため、メニュー内から削除して整理する。

Acceptance:
- ハンバーガーメニューから多言語案内リンク群を削除し、メニューの視認性を高める
- 多言語案内はトップページ（およびフッター）の導線に一本化する

Progress (2026-09-24):
- メニュー内の言語セレクタから5言語の案内リンクを削除。案内リンクはトップページの多言語バナーと各案内ページに残る。フッターへの追加は未対応。

### P8-4 日英言語切替（JA/EN）のトップページ/ヘッダー直接露出（Prominent Language Switcher）
日本語と英語の切り替えがハンバーガーメニュー内に隠れており気づきにくいため、トップページ上で一目で分かるように配置する。

Acceptance:
- トップページ（ヘッダー上、またはファーストビューの目立つ位置）に直接アクセス可能な日英切替スイッチ（`[日本語 / English]`）を配置
- メニューを開かずにワンタップで言語を切り替えられること

Progress (2026-09-24):
- ヘッダーに `[日本語 | English]` のセグメント（`LanguageToggle`）を配置。難易度セレクタやインタビュー操作と並ぶ画面ではスマホ幅で隠し、トップページの多言語バナーにも同じ切替を置いた。

### P8-5 「注目の議案」レイアウト刷新（Featured Bills Layout & Aesthetics）
トップページの「注目の議案」セクションが直線的な1列（縦並び）になっており視覚的な魅力に欠けるため、レイアウトを見直す。

Acceptance:
- Organic デザインシステムに調和した、メリハリのあるグリッドレイアウトまたはハイライトカード構成への再設計
- 視覚的ヒエラルキーと閲覧しやすさの向上

### P8-6 ルビ（Rubyful）適用スコープの日本語限定化（Ruby Scope Guard for Japanese Only）
ふりがな（ルビ）トグルをONにした状態で中国語案内ページ（`/guide/zh-Hans`）等を開くと、中国語の漢字に対しても日本語のふりがなが付与されてしまう不具合を防止する。

Acceptance:
- ルビ付与（Rubyful V2）の実行スコープを日本語ページ（`locale === "ja"`）のみに限定
- 多言語案内ページ（`/guide/*`）や英語翻訳ページ等ではルビ初期化・付与を自動抑止する

Progress (2026-09-24):
- 案内ページ（`/guide/*`）でのルビ付与抑止をセレクタレベル（`:not(.no-rubyful, .no-rubyful *)`）およびルビトグル非表示・無条件destroyで徹底強化（#50）。

### P8-7 サイト運営者表記の「新宿区民」への変更・匿名化（Operator Anonymity & Attribution）
サイト上の運営者表記・帰属表示から `OchiK` を極力非表示にし、`新宿区民` または `新宿区民有志` へ変更する。

Acceptance:
- `web/src/config/site.config.ts`（`siteConfig.author.name`）を `新宿区民` に変更
- 案内ページ（`guide-content.ts` 等）の文面、フッター表記、利用規約・免責事項の表記を `新宿区民` へ更新

Progress (2026-09-24):
- `siteConfig.operator.name` を「新宿区民」に統一し、多言語案内ページおよびサイト全体に反映（#49, #50）。

### P8-8 議案管理一覧での「注目議案」直接切替（Inline Featured Toggle in Admin Bills List）
管理画面の議案一覧（`/bills`）テーブル上で、各議案の「注目（`is_featured`）」ステータスを、個別編集画面（`/bills/[id]/edit`）に入ることなく直接ワンクリック（スイッチ/トグル）で切り替え可能にする。

Acceptance:
- 議案管理一覧（`/bills`）の各行に「注目」トグルスイッチまたはチェックボックスを配置
- 一覧から1クリックで `is_featured` の ON/OFF を切り替え・即時保存できる
- 切り替え時に公開キャッシュ（`CACHE_TAGS.BILLS` / `revalidatePath`）が自動更新され、Web公開側の「注目の議案」へ即時反映される
- 失敗時のトースト通知・オプティミスティック更新またはローディング表示を備える

### P8-9 サイト運営者表記の「新宿区民A」への更新（Operator Attribution Update to 新宿区民A）
サイト上の運営者表記・帰属表示を `新宿区民` から `新宿区民A` へ変更する（GitHubリポジトリ名等のURLパスは変更不要）。

Acceptance:
- `web/src/config/site.config.ts`（`siteConfig.operator.name`）を `新宿区民A` に変更
- 案内ページ（`guide-content.ts` 等）の文面、フッター表記、利用規約・免責事項の表記を `新宿区民A` へ更新
- 既存テストの更新・通過

### P8-10 ルビ（ふりがな）トグルのヘッダー直接配置（Ruby Toggle Prominent Placement）
ハンバーガーメニュー内に隠れているルビ（ふりがな）表示切替スイッチを、ヘッダー上の直接アクセス可能な位置（言語切替・難易度セレクタの並び）へ移動・露出する。

Acceptance:
- ヘッダー右側のコントロール群（またはデスクトップナビ周辺）に直接ふりがな切替トグルを配置
- メニューを開かずにワンタップでふりがなの ON/OFF を切り替えられる
- 多言語案内ページ（`/guide/*`）など非日本語ページでは引き続き非表示・抑止されること
- タップターゲット 44px（`min-h-11`）およびアクセシビリティ（`aria-pressed` / ラベル）の確保

### P8-11 デスクトップ表示時のナビゲーション重複解消（Desktop Nav & Hamburger Redundancy Cleanup）
デスクトップ（`lg` 以上）でヘッダー中央に「議案一覧」「議員一覧」が配置されたことに伴い、デスクトップ表示時にハンバーガーメニュー内にも同一のリンクが並び冗長になっている状態を解消する。

Acceptance:
- デスクトップ表示（`lg` 以上）において、ヘッダーに露出済みのナビゲーション（議案一覧・議員一覧等）との重複を整理・解消（ハンバーガーメニューをデスクトップでは非表示にするか、重複しない項目のみに絞り込む）
- モバイル表示（`lg` 未満）では引き続きハンバーガーメニューから全ナビゲーションへアクセスできること

### P8-12 英語モード時のUI全体多言語化（Full English Page Translation & Chrome i18n）
英語（EN）に切り替えた際、議案詳細の本文だけでなく、サイト全体（トップページ、ヘッダー、ナビゲーション、各セクション見出し、フッター等）が英語表示に切り替わるようにUI全体の多言語化（Chrome i18n）を実施する。

Acceptance:
- トップページの各セクション（Hero、本日の定例会、注目の議案、タグ別議案一覧、みらい議会とは、フッター等）の見出し・ラベル・説明文が `locale === "en"` 時に英語で表示される
- ヘッダーのナビゲーション（議案一覧 -> Bills, 議員一覧 -> Councilors 等）や操作ラベルが英語対応される
- 英語翻訳が未登録の議案やコンテンツは、フォールバック（日本語表示＋注記）として安全に処理される
- 型安全な辞書またはメッセージリソース（`messages_en` / `messages_ja`）による保守性の確保
