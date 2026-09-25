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

Progress (2026-09-25):
`@accesslint/cli scan` の自動検査で出た3件（トップの多言語案内 nav のラベル重複、`/guide/*` の article 内 aside、`/faq` の main ランドマーク欠落）を直した。
トップ（日・英）、`/guide/*`（5言語）、`/faq`、`/terms`、`/privacy`、`/councilors`、`/sessions/r8-2/bills`、議案詳細で違反0件。
ヘッダーのふりがな・言語切替の `aria-pressed` と44pxのタップ領域はコードで確認した。
キーボード操作・フォーカス順序・スクリーンリーダー・リフローの手動検証（accessibility-inspect）と accessibility-diff の回帰検知は未実施で、残作業。

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

Progress (2026-09-24〜25):
- Phase 7-A（議員一覧・議員詳細・会派/委員会表示・安全な本番インポーター）は完了（#38）。
  肖像権・著作権に配慮し、顔写真を使わずイニシャル/モノグラムアバター（`CouncilorAvatar`）で実装。
  公式一次資料（2026年8月7日現在）と突合した全38名・9会派・所属委員会87件をシード化。
- Phase 7-B（質問・発言要約連携）は完了（#61）。
  `council_member_questions` テーブルを追加。公式会議録検索システム（API照合・全件突合確認済み）より全38名・124件の代表質問・一般質問要約をシード化。議員一覧に質問件数バッジ、議員詳細に関心テーマタグ集計・AI要約カード・公式議事録リンク・過去定例会注記を実装。
- 次期着手（Phase 7-C）: 議案詳細ページと発言・賛否議員との相互連携導線。

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

実装メモ:
- `md` 以上で2カラムのグリッドにした。1件なら全幅の主役カード、2件なら均等2カラム、3件以上なら先頭を全幅の主役カード、残りを2カラムで並べ、残りが奇数なら最後の1件を全幅にする（`getFeaturedBillLayout`）。スマホは1カラム。
- 全幅カードはサムネイルがあると `md` 以上で本文の横に置く。主役カードは見出し `md:text-2xl`・余白 `md:p-8`。
- アクティブ会期に注目議案がない場合は、全会期の公開済み注目議案へフォールバックする。
- キャッシュ無効化に失敗した場合は、保存済みの注目設定を維持したまま管理画面へ警告を表示する。本番 admin の Vercel 環境変数 `NEXT_PUBLIC_WEB_URL`（本番 web の URL）と `REVALIDATE_SECRET`（web と一致）を確認し、実際の注目切替が公開Webへ即時反映されるまで完了扱いにしない。
- 本番確認済み（2026-09-24〜25）: 本番DBに接続したAdminで注目を切り替え、警告トーストなしで公開Webへ即時反映されること、レイアウトがデスクトップ・スマホ幅で崩れないことを確認した。記録は `docs/verification/20260924_本番公開確認記録.md`。

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

Progress (2026-09-24):
- 議案一覧テーブルの議案名の隣に「注目」列を追加し、各行のスイッチで `is_featured` を直接切り替えられるようにした。保存後に web 側の `bills` キャッシュタグと一覧パスを再検証する。
- スイッチは押した瞬間に切り替わり（オプティミスティック更新）、保存中は操作不可。失敗時は元に戻してエラーのトーストを出す。
- 「注目」列の見出しから注目フラグでソートできる。
- 本番確認済み（2026-09-24〜25）: ON・OFFとも公開Webのトップページへすぐ反映された（P8-5の記録を参照）。

### P8-9 サイト運営者表記の「新宿区民A」への更新（Operator Attribution Update to 新宿区民A）
サイト上の運営者表記・帰属表示を `新宿区民` から `新宿区民A` へ変更する（GitHubリポジトリ名等のURLパスは変更不要）。

Acceptance:
- `web/src/config/site.config.ts`（`siteConfig.operator.name`）を `新宿区民A` に変更
- 案内ページ（`guide-content.ts` 等）の文面、フッター表記、利用規約・免責事項の表記を `新宿区民A` へ更新
- 既存テストの更新・通過

Progress (2026-09-24):
- `siteConfig.operator.name` を「新宿区民A」に変更。フッター・FAQ・プライバシーポリシー・案内ページ・トップの「みらい議会とは」はすべてこの値を参照するため一括で反映。

### P8-10 ルビ（ふりがな）トグルのヘッダー直接配置（Ruby Toggle Prominent Placement）
ハンバーガーメニュー内に隠れているルビ（ふりがな）表示切替スイッチを、ヘッダー上の直接アクセス可能な位置（言語切替・難易度セレクタの並び）へ移動・露出する。

Acceptance:
- ヘッダー右側のコントロール群（またはデスクトップナビ周辺）に直接ふりがな切替トグルを配置
- メニューを開かずにワンタップでふりがなの ON/OFF を切り替えられる
- 多言語案内ページ（`/guide/*`）など非日本語ページでは引き続き非表示・抑止されること
- タップターゲット 44px（`min-h-11`）およびアクセシビリティ（`aria-pressed` / ラベル）の確保

Progress (2026-09-24):
- `RubyToggle` にピル型（`variant="pill"`）を追加し、ヘッダー右側の言語切替の隣に配置。`aria-pressed` と 44px のタップ領域を確保。
- ヘッダーに入りきらない幅ではメニュー内のスイッチに回す。難易度セレクタ等が並ぶページは sm（500px）未満、それ以外は新設の xs（360px）未満。
- 英語表示ではルビが付かないため、ヘッダーにもメニューにも出さない。

### P8-11 デスクトップ表示時のナビゲーション重複解消（Desktop Nav & Hamburger Redundancy Cleanup）
デスクトップ（`lg` 以上）でヘッダー中央に「議案一覧」「議員一覧」が配置されたことに伴い、デスクトップ表示時にハンバーガーメニュー内にも同一のリンクが並び冗長になっている状態を解消する。

Acceptance:
- デスクトップ表示（`lg` 以上）において、ヘッダーに露出済みのナビゲーション（議案一覧・議員一覧等）との重複を整理・解消（ハンバーガーメニューをデスクトップでは非表示にするか、重複しない項目のみに絞り込む）
- モバイル表示（`lg` 未満）では引き続きハンバーガーメニューから全ナビゲーションへアクセスできること

Progress (2026-09-24):
- デスクトップ（`lg` 以上）ではメニュー内の言語選択・議員一覧・ヘッダーに出ている定例会の議案一覧を隠し、ほかの定例会（例: 令和8年第1回）の議案一覧だけを残す。残す項目が無ければメニューボタンごと隠す。
- メニューを一律に隠さなかったのは、ヘッダーの「議案一覧」が1つの定例会しか指さず、ほかの定例会の議案一覧への導線がメニューにしか無いため。

### P8-12 英語モード時のUI全体多言語化（Full English Page Translation & Chrome i18n）
英語（EN）に切り替えた際、議案詳細の本文だけでなく、サイト全体（トップページ、ヘッダー、ナビゲーション、各セクション見出し、フッター等）が英語表示に切り替わるようにUI全体の多言語化（Chrome i18n）を実施する。

Acceptance:
- トップページの各セクション（Hero、本日の定例会、注目の議案、タグ別議案一覧、みらい議会とは、フッター等）の見出し・ラベル・説明文が `locale === "en"` 時に英語で表示される
- ヘッダーのナビゲーション（議案一覧 -> Bills, 議員一覧 -> Councilors 等）や操作ラベルが英語対応される
- 英語翻訳が未登録の議案やコンテンツは、フォールバック（日本語表示＋注記）として安全に処理される
- 型安全な辞書またはメッセージリソース（`messages_en` / `messages_ja`）による保守性の確保

Progress (2026-09-24):
- UI 文言を `web/src/features/i18n/shared/ui-messages.ts`（`Record<PublicLocale, UiMessages>`）に集め、ヘッダー（ナビ・ホーム導線・難易度・メニュー）、トップページの各セクション、議案カードとステータスバッジ、免責、フッターを `locale === "en"` で英語にした。英語の名前（サイト名・区・区議会・運営者）は `siteConfig.english` に置く。ヘッダーのサイト名は英語表示でも日本語のまま。
- 議決ステータスは公式の議決用語ごとに英語を分けた（可決 Passed / 承認 Approved / 採択 Adopted 等）。可決と承認を英語でも区別する。
- 議案名・要約・タグ名・会期名は DB のまま日本語で出し、英語表示のトップページには「日本語のまま表示している」旨の注記を出す。議案詳細の翻訳フォールバックは既存の TranslationNotice のまま。議案詳細でもステータスバッジと免責は英語になる。
- 残り: 定例会の議案一覧（`/sessions/[slug]/bills`）・議員一覧・FAQ/規約等の下層ページ、議案詳細の見出し等はまだ日本語。英語の文言はネイティブ確認前。`<html lang="ja">` のままで、`lang="en"` は今回英語にした部分にだけ付けている。

### P8-13 注目の議案とタグ別一覧の重複解消（Featured / By-Tag Duplicate Cards）
トップページで、注目の議案に出ている議案がタグ別一覧にも出ることがある。`selectBillsForDisplay`（`web/src/features/bills/shared/utils/select-bills-for-display.ts`）は、タグの議案が4件以上のときだけ注目の議案を除外し、3件以下のタグでは全件をそのまま返すため。2026-09-24の本番確認で見つけた。

Acceptance:
- タグの議案数にかかわらず、注目の議案に出ている議案をタグ別一覧から除外する
- 除外した結果そのタグに表示する議案が0件になる場合の扱いを決める（セクションごと隠すか、「その他議案」リンクだけ残すか）
- 3件以下のタグで注目の議案を含むケースを `select-bills-for-display.test.ts` に追加する

Progress (2026-09-25, PR #59):
- `selectBillsForDisplay` の「3件以下なら全件そのまま返す」早期リターンをやめ、タグの議案数にかかわらず先に注目の議案を除外するようにした。
- 除外して0件になったタグはセクションごと隠す（`BillsByTagSection` の既存の `displayBills.length === 0` ガード）。「その他議案」リンクだけ残す案は取らず、0件のときは `showMoreLink` も false を返す。
- 元のタグの議案が4件以上で、除外後に1〜3件残る場合は「その他議案」リンクを残す。4件以上残る場合の画像優先＋ランダム選択は変えていない。
- 3件以下のタグで注目の議案を一部／全部含むケース、4件以上のタグで除外後1件・3件・0件になるケースをテストに追加した。

### P8-14 議員一覧・議員カードの視覚表現・レイアウト刷新（Councilor List Layout & Visual Hierarchy Refresh）
議員一覧ページ（`/councilors`）において、会派の区切りが不明瞭で個々の議員カードが背景と同化して見づらい点、および氏名の頭文字サークル（アバター）の必要性・代替表現を見直す。

Acceptance:
- **アバター（頭文字サークル）の見直し**:
  - 氏名横の頭文字サークル（`CouncilorAvatar`）を廃止、またはタイポグラフィ重視の洗練されたレイアウトやミニマルな役職/会派バッジ等へ置き換える
- **会派ごとの明確な視覚的分離**:
  - 全体の背景が一様で会派の区切り（開始・終了）が判断しにくいため、親コンテナ面（`bg-mirai-surface-sunken` や明確なセクションブロック化）・見出しのメリハリを導入し、会派ごとのまとまりを一目で把握できるようにする
- **個別議員カードの視認性・メリハリ向上**:
  - カード単体（`CouncilorCard`）の境界・立体感・余白（`bg-card`、面コントラスト、`shadow-mirai-sm/md` 等）を調整し、1人ずつのカードが独立して見やすくタップしやすい構成にする
- **詳細ページ（`/councilors/[id]`）とのデザイン統一**:
  - 議員詳細ページのヘッダーアバター等も含め、変更後のビジュアル方針と一貫性を保つ
- Organic デザインシステム（`globals.css` トークン、角丸、44pxタップ領域）および WCAG 2.2 AA に準拠

