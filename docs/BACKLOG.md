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

## S5 本番稼働検証（ROADMAP「Step 5」の残作業）

ROADMAP の Step 5 で未完了の項目。Phase の Exit 条件とは別に、本番環境そのものを確かめる作業。
経緯は `docs/verification/20260918_1830_step5_production_verification.md`、`docs/verification/20260923_本番公開確認記録.md`、`docs/verification/20260924_本番公開確認記録.md`。

### S5-1 Admin の本番配備経路と認可
いまの本番 Admin は、ローカルで `pnpm dev:admin:prod-db` を立てて本番DBにつなぐ形でしか使っていない（2026-09-24 の確認記録）。

Acceptance:
- Admin を本番にデプロイするか、ローカル起動のみで運用するかを決めて記録する
- デプロイする場合は URL・配備 SHA・Vercel 環境変数を記録し、未ログインと `admin` ロールなしのユーザーが弾かれることを確かめる
- 本番の Admin アカウントの作り方（Supabase Authentication でユーザーを作り、`raw_app_meta_data` に `{"roles": ["admin"]}` を付ける）を手順書に書く

### S5-2 本番DBのmigration履歴・制約・出典列の確認
Acceptance:
- 本番の migration 履歴が `supabase/migrations/` と一致する
- `(council_session_id, bill_number)` の複合ユニーク、`bill_number_order`、出典URL列が本番にある
- 確認に使ったクエリと結果を `docs/verification/` に残す

### S5-3 復旧手順のリハーサル
本番専用インポーターは対象テーブルのバックアップを取るが、そこから戻す手順は試していない。

Acceptance:
- ローカルまたは検証用の Supabase で、バックアップからの復元を最後まで通す
- 手順と所要時間を文書にする

### S5-4 公開画面の総点検（全議案・モバイル・AIチャット）
Acceptance:
- 公開中の全議案（区長提出23件と議員提出議案4件）で、3難易度の本文・一次資料リンク・出典導線を確認する
- スマホ幅での表示を確認し、スクリーンショットを証跡として保存する
- 公開済みの議案で AI チャットが答え、未公開の議案では 403 になることを本番で確認する
- 次の2点はコード上は対応済みなので、本番で確かめてから ROADMAP のチェックを付ける
  - 注目議案は `publish_status = "published"` だけを出す（`findFeaturedBillsWithContents`）。準備中案件の404リンクが出ないこと
  - チャットAPIは `siteConfig.features.aiChat` のサーバー側ゲート、未公開議案の拒否、上限確認失敗時の fail-closed を持つ（`handle-chat-request.ts`）

### S5-5 本番インポート後のキャッシュ即時無効化 ✅
`import_production.yml` は `WEB_PUBLIC_URL` と `REVALIDATE_SECRET` がないとキャッシュ無効化を飛ばす。

Acceptance:
- GitHub の Secrets（または production environment）に `WEB_PUBLIC_URL` と、web の Vercel と同じ `REVALIDATE_SECRET` を入れる
- 次の本番インポートで「スキップした」ではなく `/api/revalidate` の 200 がログに出ることを確認する

Progress (2026-09-25):
- GitHub Actions の `production` environment secrets に `WEB_PUBLIC_URL`（`https://miraigikai-shinjuku-web.vercel.app`）および `REVALIDATE_SECRET`（`.env.production` の検証済みキー）を設定した。
- `import_production.yml`（run 36135018218、apply モード）を実行し、議員提出議案第7〜10号のレビュー完了フラグ4件を本番反映。
- `Invalidate bills cache` ステップにて `/api/revalidate` が呼び出され、`{"success":true,"revalidated":true,"tags":["bills","council-sessions","councilors"]}` の 200 応答を受信してキャッシュ即時無効化が正常に完了することを確認した。

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

Progress (2026-09-25):
ROADMAP の「UI translation」の残りは P8-12 の残作業（定例会の議案一覧・議員一覧・FAQ/規約などの下層ページ、議案詳細の見出し、英語文言のネイティブ確認、`<html lang>`）で扱う。2026-09-26 に FAQ/規約とネイティブ確認以外を済ませた。`<html lang>` は `ja` のままにすると決めた（P8-12 参照）。

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

Progress (2026-09-25):
コードで確認した現状（`web/src/features/chat/server/services/handle-chat-request.ts` ほか）。
- 済み: 議案に紐づけ（クライアントの議案IDだけを信じ、本文はDBの公開データで置き換える。未公開は 403）
- 済み: ユーザー日次・システム日次・システム月次の上限（`env.chat.*CostLimitUsd`）と、上限を確認できないときの fail-closed
- 済み: 利用記録（`chat_usage_events` への記録）と、入力欄の「AIの回答は間違えることがあります」の注意書き
- 済み（プロンプトのみ）: 関係のない話題を断るルール（`COMMON_RULES_GENERIC`）
- 残り: 出典表示。回答に一次資料のどこを根拠にしたかを示す仕組みがない。デザインシステムの「出典が出せない答えは返さない」「AI生成文は一次資料と同じ見た目にしない」を満たすこと
- 残り: 回答言語を質問の言語に合わせる指示がプロンプトにない。英語表示でのチャットUI文言もまだ日本語
- 残り: 関係のない質問を有料APIの前に止める仕組みはない（`packages/shared/src/moderation/` は使っていない）
- 残り: 上限到達時の 429 文言が画面にどう出るか（`PromptInputError`）を確認する。英語表示での文言も要る

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

Progress (2026-09-25):
- 更新検知 `pnpm --filter @mirai-gikai/seed monitor:shinjuku`（`packages/seed/monitor/`）と `.github/workflows/monitor_shinjuku_council.yml` を追加した。定例会の期間中（と下書きPRが開いている間）は平日毎日、会期外は月曜だけ実行する（判定は `monitor/schedule.ts`）。
- 区長提出議案は一覧ページ（`index_gian01` / `index_giketsu01`）から会期ページをたどり、インベントリ未登録の会期・案件を下書き（`monitor/drafts/shinjuku-draft.json`、常に `reviewCompleted: false` / `hasPublishableContent: false`）にする。登録済み案件と公式サイトの食い違い（件名・全文PDF・議決結果・消失）はレポートに載せるだけで、インベントリ・DBは書き換えない。
- 議員提出議案は議会側ページのURLに規則性がないため、定例会・臨時会一覧と決議・意見書ページのリンク増減、審議結果PDFの sha256 だけを見る。
- 下書きPRは固定ブランチ `automation/shinjuku-council-update` に作る。下書きは (公式サイト, インベントリ) だけで決まるので、同じ状態では何度回してもPRは増えない。
- リポジトリ設定「Allow GitHub Actions to create and approve pull requests」は有効化済み。初回実行で令和8年第3回定例会（第63〜80号議案・認定第1〜4号の22件）の下書きPR（#80）ができた。取り込みは P5-2。新しい会期のインベントリを作ったら `monitor/targets.ts` の `KNOWN_SESSIONS` に足すこと。
- 設計: `docs/20260925_1740_P5-1_自動化_新宿区議会更新検知とドラフト生成_設計.md`（§9 に実装時の変更点）。

### P5-2 令和8年第3回定例会の投入（ROADMAP Phase 5）
更新検知の下書きPR（#80、ブランチ `automation/shinjuku-council-update`）に第63〜80号議案・認定第1〜4号の22件が出ている。

Acceptance:
- 下書きを確認してインベントリ（`shinjuku-r8-3-inventory.ts` 相当）を作り、`monitor/targets.ts` の `KNOWN_SESSIONS` に `r8-3` を足す
- 議決前の案件は結果なし（未確定）として表示し、可決・否決と取り違えない
- 議決結果が公式に出たら、レビュー済みの本文を上書きせずに結果だけを更新する
- 解説（やさしい／ふつう／くわしく）は第2回定例会と同じ基準（claim ledger・公開レビュー）で整備する
- Exit: 会期の更新を1人で運用できる

Progress（2026-09-26）:
- インベントリ `packages/seed/main/shinjuku-r8-3-inventory.ts` を作り、`KNOWN_SESSIONS` に `r8-3` を足した。22件の識別名・件名・全文PDF・概要PDFは公式ページと実物のPDFで確認済み（全件 `decision: null`・非公開・未レビュー）。更新検知の実行結果は「未反映の変更なし」。
- 第76号議案の件名は一覧ページの表記「第2)期」をそのまま採用した（PDF本文は「第Ⅱ期」）。表示用に直すときは出典を併記する。
- 更新検知は、議決結果が未掲載のまま登録した会期（`decisionsUrl: null`）について、議決結果の一覧からその会期のページを毎回探す。掲載されると、各案件の議決結果が「未議決との食い違い」としてレポートに出る。そのとき結果だけをインベントリへ転記する。
- 残り: DB（ローカルシード・本番インポーター）への投入。本番インポーター（`import_production_inventory`）は全議案を1つの会期に紐づける作りなので、会期ごとに紐づけられるよう migration が要る。公開サイトの「現在の会期」（`is_active`）を r8-2 から r8-3 へ切り替える時期も決める（`findActiveCouncilSession` は `is_active = true` が2件あると取得に失敗する）。あわせて、未議決の議案の status（`bill_status_enum`）への対応付けを決める。解説の整備も未着手。

### P5-3 半自動化の残り（ROADMAP Phase 6）
会期ページの解析・変化の検知・定期実行・下書きPRは P5-1 で実装済み。

Acceptance:
- 全文PDFからのテキスト抽出
- 抽出したテキストから解説の下書き（`generated`）を作る
- Admin に、下書きを確認して公開に回すレビュー待ち一覧を置く
- Exit: 「更新を見つける」「下書きを作る」まで自動

## P7

### P7-1 議員ページ（Council Person Page - 世田谷モデル） — Done
「みらい議会＠世田谷区」の議員ページ（`/councilors`, `/councilors/[id]`）をモデルに、
新宿区議会議員（定数38名）の一覧・詳細ページおよび質問要約・所属会派・委員会導線を整備する。
詳細は `docs/20260923_1630_議員ページ要件定義_世田谷モデル.md` を参照。

Acceptance:
- 議員一覧ページ（`/councilors`）で会派別・委員会別に新宿区議会議員（38名）の基本情報・アバター・質問集計を表示（アバターは P8-14 でタイポグラフィ中心のデザインに置き換え済み）
- 議員詳細ページ（`/councilors/[id]`）で基本プロフィール、所属会派、所属委員会、公式名簿への外部リンク（基準日明記）を表示
- （Phase 7-B）議員詳細ページで本会議・委員会での発言・質問の要約カード、関心テーマタグ、AIサマリーを表示
- （Phase 7-C）議案詳細ページと発言・賛否議員との相互連携導線
- Organic デザインシステム（`globals.css` トークン、ボタン・アイコン規則、44pxタップ領域）および WCAG 2.2 AA に準拠

Progress (2026-09-24〜25):
- Phase 7-A（議員一覧・議員詳細・会派/委員会表示・安全な本番インポーター）は完了（#38）。
  肖像権・著作権に配慮し、顔写真を使わずイニシャル/モノグラムアバター（`CouncilorAvatar`）で実装（P8-14 でタイポグラフィ中心のデザインに置き換え済み）。
  公式一次資料（2026年8月7日現在）と突合した全38名・9会派・所属委員会87件をシード化。
- Phase 7-B（質問・発言要約連携）は完了（#61）。
  `council_member_questions` テーブルを追加。公式会議録検索システム（API照合・全件突合確認済み）より全38名・124件の代表質問・一般質問要約をシード化。議員一覧に質問件数バッジ、議員詳細に関心テーマタグ集計・AI要約カード・公式議事録リンク・過去定例会注記を実装。
- Phase 7-C（議案・議員の相互連携導線）は完了（#66）。議員一覧に会派アンカー（`#faction-{slug}`）、議案詳細の会派賛否から該当会派へのリンク、議案詳細に常設の「この議案と議員」節（議員一覧への導線・議案に紐づく質問）、議員の質問カードに関連議案リンク、議員詳細に開催中定例会の議案一覧リンクを追加。
  `council_member_questions.bill_id` は全件未設定のため、質問↔議案リンクはデータが入るまで表示されない（会派名リンクは下記の賛否投入で表示される）。質問と議案の紐づけは、委員会質疑の取り込み時に一次情報（会議録の議題）から行うこと。
- 会派の賛否（令和8年第2回定例会・23議案×8会派）を新宿区議会の「議案の概要と審議結果」（区議会だより No.322 と同じ表）から投入（#68）。出典は議会公式ページのPDFに切り替えた。採決時の会派名（`faction_stances.faction_name_at_vote`）と出典を議決結果カードに表示し、本番インポーターで賛否を扱えるようにした。本番への投入は dry-run の確認後。計画は `docs/20260925_1330_会派賛否データ投入計画.md`（#67）。
- 議員一覧の委員会別表示を追加（2026-09-26）。「会派別」「委員会別」を切り替えられ、委員会別では常任 → 議会運営 → 特別の順に委員会ごとのセクションを出し、委員長 → 副委員長 → 委員（議席順）で並べる。委員会チップで1委員会に絞り込め、件数は重複を除いた人数と委員会数で出す。検索語は両方の表示で共有し、会派の絞り込みは委員会別に持ち越さない。設計は `docs/20260926_1150_P7-1_議員ページ委員会別表示_設計.md`。これで Acceptance をすべて満たし、P7-1 を Done とする。

### P7-2 任意機能の候補（ROADMAP Phase 7 の未着手分）
着手するときに要件を書き起こす。いまは候補の記録だけ。

- 会議録（minutes）と発言（speeches）の取り込み。7-B の会議録検索API（tenant 211）が使える。質問と議案の紐づけ（`council_member_questions.bill_id`）もここで入れる
- 委員会（committees）のページ
- 予算エクスプローラー（budget explorer）
- AI インタビュー。いまは設定で無効
- 更新通知（notifications）
- zh-Hant は 2026-09-24 の方針（議案の翻訳は英語のみ）で見送り。やるなら案内ページの追加として扱う

### P7-3 議員本人のX（旧Twitter）アカウント表示（Councilor X/Twitter Account Links）
議員詳細ページ（`/councilors/[id]`）において、各区議会議員の公式X（旧Twitter）アカウントへのリンク情報を表示し、有権者・住民が議員の最新の発信や政策活動へ直接アクセスできるようにする。設計は `docs/20260926_0750_P7-3_議員公式HP_Xアカウント拡充_設計.md` を参照。

現状と方針:
- **Xアカウント表示**:
  - `council_members` テーブルに `x_url` 列を追加。
  - 本人確認が取れたアカウントのみ登録（本人サイトからのリンク、またはプロフィールに「新宿区議会議員」と明記されていること。全38名中28名を登録、アカウント未保有と確認された残り10名は `null`）。
- **公式ウェブサイト（`website_url`）の方針**:
  - 公式名簿に掲載されているURLのみを入れる方針を維持（議員詳細の「公式名簿に掲載されているURLです」という表示の信憑性を保つため、名簿外の独自補完は行わない）。
- **UI表示**:
  - 議員詳細ページ（`/councilors/[id]`）の「公式の情報」欄に、`ExternalSourceLink`（44px以上のタップ領域、lucide アイコン、新しいタブで開く旨の sr-only 注記）を用いて配置。
  - 出典欄に掲載基準と確認日を明記。

Acceptance:
- `council_members` テーブルに `x_url` 列を追加し、`import_production_inventory` で安全に反映できる
- 38名分の `xUrl` をシード・インポーターに反映する（確認済みアカウントのみ登録、未確認は null）
- 議員詳細ページで公式Xリンクがアクセシブルに表示される
- 関連するテスト（単体・インポーター統合テスト）が通過する

Progress (2026-09-26, PR #86):
- `council_members.x_url` を追加するマイグレーション（`20260926080000_add_council_member_x_url.sql`）を作成。`import_production_inventory` の11引数版（`council_members` の upsert を持つ版）を再定義し、`x_url` の展開・INSERT・UPDATE・`is distinct from` 判定を追加。
- 本人サイトからのリンクまたはプロフィール明記で確認できた23名のXアカウントを `packages/seed/main/shinjuku-council-members.ts` に設定。未確認の15名は `null` とした。
- `web`: `Councilor.xUrl`、repository の select、議員詳細の「公式の情報」にXリンク（`ExternalSourceLink`）、出典欄に掲載基準（本人サイトからのリンクまたはプロフィール明記、2026年9月26日現在）を追加。
- テスト: `to-councilor.test.ts`、`shinjuku-council-members.test.ts`、`import-production-inventory.test.ts` を追加・更新し全件通過。

Progress (2026-09-26):
- 議員リスト精査により、追加で5名（木もと ひろゆき、渡辺 みちたか、大門 さちえ、のづ ケン、有馬 としろう）の本人公式Xアカウントを確認・登録。
- 残り10名（高阪 まさし、高月 まな、小野 裕次郎、志田 雄一郎、渡辺 清人、池田 だいすけ、田中 ゆきえ、えのき 秀隆、ひやま 真一、下村 治生）について公式Xアカウント未保有を確認し、全38名の調査・登録を完了（登録28名、未保有10名）。
- `packages/seed/main/shinjuku-council-members.test.ts` を更新し、28件登録・10件nullを検証。

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
- トップページの各セクション（Hero、本日の定例会（P8-17で削除）、注目の議案、タグ別議案一覧、みらい議会とは、フッター等）の見出し・ラベル・説明文が `locale === "en"` 時に英語で表示される
- ヘッダーのナビゲーション（議案一覧 -> Bills, 議員一覧 -> Councilors 等）や操作ラベルが英語対応される
- 英語翻訳が未登録の議案やコンテンツは、フォールバック（日本語表示＋注記）として安全に処理される
- 型安全な辞書またはメッセージリソース（`messages_en` / `messages_ja`）による保守性の確保

Progress (2026-09-24):
- UI 文言を `web/src/features/i18n/shared/ui-messages.ts`（`Record<PublicLocale, UiMessages>`）に集め、ヘッダー（ナビ・ホーム導線・難易度・メニュー）、トップページの各セクション、議案カードとステータスバッジ、免責、フッターを `locale === "en"` で英語にした。英語の名前（サイト名・区・区議会・運営者）は `siteConfig.english` に置く。ヘッダーのサイト名は英語表示でも日本語のまま。
- 議決ステータスは公式の議決用語ごとに英語を分けた（可決 Passed / 承認 Approved / 採択 Adopted 等）。可決と承認を英語でも区別する。
- 議案名・要約・タグ名・会期名は DB のまま日本語で出し、英語表示のトップページには「日本語のまま表示している」旨の注記を出す。議案詳細の翻訳フォールバックは既存の TranslationNotice のまま。議案詳細でもステータスバッジと免責は英語になる。
- 残り: 定例会の議案一覧（`/sessions/[slug]/bills`）・議員一覧・FAQ/規約等の下層ページ、議案詳細の見出し等はまだ日本語。英語の文言はネイティブ確認前。`<html lang="ja">` のままで、`lang="en"` は今回英語にした部分にだけ付けている。

Progress (2026-09-26):
- 定例会の議案一覧（見出し・会期の説明・絞り込み・0件表示・これから掲載される議案・区議会へのリンク）、議員一覧（見出し・統計・検索・会派の絞り込み・議員カード・出典）、議員詳細（戻るリンク・各項目・委員会の種別と役職・公式の情報・質問の案内・出典）、議案詳細の見出しと操作（上部ナビ・かんたん要約・審議の経過・原文・区議会の公式ページ・質問するバナー・共有と報告・共有モーダル）を英語にした。文言は `ui-messages.ts` の `sessionBills` / `councilors` / `councilorDetail` / `councilorSources` / `billDetail`。
- 審議の経過は、ステップ名・日付ラベル・議決用語を英語にする（`localizeBillTimelineEvent`）。議決用語は一覧カードと同じ対応表を使い、可決と承認を英語でも区別する。status_note は日本語のまま `lang="ja"`。
- 議員名・ふりがな・会派名・会派内の役職・委員会名・会期名・タグ名は DB のまま日本語で出し、英語の文中では `lang="ja"` で挟む。文言は `{ before, after }` の組で持ち、`AroundJapanese` で差し込む。
- 議員の質問カード（見出し・要約・会議録リンク）は議案詳細と同じく日本語のまま `lang="ja"` で出し、英語表示では「日本語のまま表示している」旨を添える。議員詳細の傾向の1文はタグ名を文中に埋め込むため英語表示では出さず、タグと件数の一覧だけ出す。
- 出典の基準日・掲載範囲の英語は `councilors/shared/constants.ts` の `en` に置き、日本語の日付と食い違ったらテストで落ちる。
- **`<html lang>` は `ja` のままにする（決定）。** 一覧カードの議案名、タグ、FAQ・規約・インタビュー・チャットなど、日本語のまま出す文字列の多くは `lang="ja"` を付けずにルートの `ja` に頼っている。ルートを `en` に切り替えると、それらがすべて英語として読み上げられる（WCAG 3.1.1 / 3.1.2）。英語にした部分に `lang={locale}` を付ける PR #54 の方式なら、どのページでも言語の指定が実際の文字と合う。ルートを切り替えるなら、サイト全体の日本語に `lang="ja"` を付けてからにする。
- 残り: FAQ・規約・プライバシーポリシー、各ページの `<title>` / description、インタビュー・チャット画面は日本語のまま。英語の文言はネイティブ確認前。

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

Progress (2026-09-25, PR #64):
- 頭文字アバター（`CouncilorAvatar` / `avatar-initial.ts`）を廃止・削除し、氏名・ふりがなを主役にした端正なレイアウトに刷新。
- 会派ごとに `bg-mirai-surface-sunken` のパネル（`rounded-xl p-5 md:p-6 shadow-mirai-sm`）で包括し、会派見出しと所属人数バッジでグループの境界を明確化。枠線を使わず面の明度差で区切る Organic 原則に準拠。
- 会派内の議員カード（`CouncilorCard`）をスマホ1カラム／`sm`以上2カラムのグリッドで配置。カードから重複する会派名を外し、会派役職（幹事長等）を `bg-mirai-featured` でハイライト。カードの高さを `h-full` で揃え、44pxタップ領域を確保。
- 議員詳細画面（`/councilors/[id]`）のヘッダーからもアバターを撤去し、自治体名・氏名・ふりがな・会派タグ・質問数バッジをスマートに整列。

### P8-15 トップページ中段の重複した英語切替（Read the bills in English）の削除（Remove Redundant English Toggle from Top Banner）
ヘッダー上に直接アクセス可能な言語切替（`[日本語 | English]`）が既に配置されているため、トップページ中段の多言語案内バナー内にある「Read the bills in English」および言語切替トグルが冗長となっている。これを削除してバナーを整理する。

Acceptance:
- トップページ中段の多言語案内バナー（`MultilingualGuideBanner`）から、「Read the bills in English」のラベル行および重複した言語切替トグル（`LanguageToggle`）を削除する
- 言語切替はヘッダー（`HeaderClient`）のトグルに一本化する
- 多言語案内バナーは、他言語案内ページ（`/guide/*`）への導線（`GuideLanguageLinks`）を中心としたシンプルな構成に整理する
- 不要となった文言定数（`ENGLISH_BILLS_LABEL`）等のクリーンアップ
- 関連するテスト（バナー表示や文言テスト）が正常に通過すること

Progress (2026-09-25, PR #65):
- `MultilingualGuideBanner` から「Read the bills in English」の行と `LanguageToggle` を削除し、他言語案内ページ（`/guide/*`）へのリンク群のみのシンプルな構成に整理。
- `MultilingualGuideBanner` を同期コンポーネント化し、未使用の `ENGLISH_BILLS_LABEL` 定数を削除。
- `header-client.tsx` と `language-toggle.tsx` のコメントを「ヘッダーに一本化」へ更新。

### P8-16 定例会アーカイブ・議案一覧ページでの難易度（日本語レベル）切替トグルの表示（Difficulty Selector in Bills Archive）
定例会の議案一覧・アーカイブページ（`/sessions/[slug]/bills`）において、ヘッダーに日本語レベル（やさしい／ふつう／くわしく）のトグル（`DifficultySelector`）が表示されていないため、議案一覧画面でも難易度を切り替えられるようにする。

Acceptance:
- `isMainPage`（`web/src/lib/page-layout-utils.ts`）等を見直し、定例会議案一覧（`/sessions/[slug]/bills`）でもヘッダーに `DifficultySelector` が表示されること
- 議案一覧ページ内の議案カード表示（要約等）が、選択された難易度レベルに応じた内容で正しく連動・更新されること
- 関連するテスト（`page-layout-utils.test.ts` 等）の更新・通過
- タップ領域 44px（`min-h-11`）およびレスポンシブ表示（画面幅に応じた収納・メニュー連携）の確保

Progress (2026-09-26):
- `isMainPage` に `/sessions/[slug]/bills`（末尾一致、サブパス・末尾スラッシュは除外）を追加し、ヘッダーに `DifficultySelector` を出すようにした。チャットサイドバー（`hasChatSidebar`）は議案詳細のみのまま。
- 議案カードの連動は既存の仕組みで満たしていた。`getBillsByCouncilSession` は Cookie の難易度で `bill_contents` を引き、キャッシュキーにも難易度を含む。セレクタの切り替えはページを読み直すため、カードの題名が選んだ難易度のものに替わる。
- 44px とレスポンシブ表示はトップ・議案詳細と同じ扱いになる。難易度セレクタが並ぶページは `isCrowded` になり、狭い画面では言語切替とふりがなボタンをメニューに回す。
- あわせて、議案一覧の `CompactBillCard` に表示言語（`locale`）を渡していなかったのを直した。英語表示でもステータスバッジや掲載日の文言が日本語のままだった。
- テスト: `page-layout-utils.test.ts`（議案一覧で true、`/sessions`・`/sessions/[slug]`・末尾スラッシュで false、`hasChatSidebar` は false）、`header-client.test.tsx`（議案一覧でセレクタを出し、議員一覧では出さない）。

### P8-17 トップページの「本日の定例会」セクションの目的・必要性の再検討と整理（Re-evaluate "Current Council Session" Banner on Top Page）
トップページ上部に表示されている「本日の定例会（会期中 / 令和8年第2回定例会）」バナー（`CurrentCouncilSession`）について、単に開会中かどうかを示すのみで導線としての役割が薄く、ファーストビューのスペースを圧迫している。特別な存在意義や機能がない限り、削除またはヘッダーの会期バッジ等へ集約・整理することを検討する。

Acceptance:
- 「本日の定例会」セクションの存在意義（ユーザーにとっての価値、公式ページや会期詳細へのリンク有無等）の精査
- 不要と判断された場合、トップページからの削除、またはヘッダー中央の会期バッジ（`NavLinks`）やHero周辺への情報統合
- 関連するコンポーネント・テスト（`CurrentCouncilSession`、`loadHomeData` の呼び出し等）のクリーンアップ

Progress (2026-09-25, PR #75):
- 精査の結果、バナーは開会中かどうかと会期名・開始日を出すだけで、会期詳細や公式ページへのリンクを持たない。会期名はヘッダーの会期バッジと議案見出しに既に出ているため、トップページから削除した。「開会中／閉会中」の表示はどこにも残らないが、ヘッダーのバッジは `is_active` の会期（なければ最新の会期）を出すので、利用者が今の会期を見失うことはない。
- `web/src/app/(main)/page.tsx` から `CurrentCouncilSession` の描画と `getCurrentCouncilSession(getJapanTime())` の呼び出しを削除。
- トップページ専用だった `current-council-session.tsx` と、そこでしか使っていない UI 文言（`home.today` / `inSession` / `notInSession` / `sessionFrom`）を削除。
- ローダー `getCurrentCouncilSession` とその統合テストは会期判定の部品として残した。



### P8-18 議員提出議案4件（第7〜10号）の公開レビュー・ファクトチェックと完了フラグ更新（Publication Review & Fact-Check for Councilor Bills 7-10）
議員提出議案第7〜10号の4件（学用品給付条例、修学旅行費無償化条例、ドナーミルク意見書、不合理な税制改正反対意見書）の解説文について、現状は起案者の通読のみで公開レビューおよび第三者・独立ファクトチェックが未実施となっている。精査・ファクトチェックを完了させた上で、レビュー中フラグを解除して再インポートを行う。

Acceptance:
- 議員提出議案4件（第7・8・9・10号）の解説文（やさしい／ふつう／くわしく）について、一次情報（議会公式PDF・会議録・区議会だより）との突合・独立ファクトチェック・公開レビューを実施する
- レビュー完了後、`packages/seed/main/shinjuku-r8-2-inventory.ts` の該当4件から `reviewCompleted: false` を削除（または `true` に更新）する
- インポートスクリプト（`pnpm seed` / seed import）を再実行し、DB（`is_review_completed` フラグ）および公開画面に反映させ、「レビュー中」バナーが解除されることを確認する

Progress (2026-09-25):
- 議員提出議案4件（第7〜10号）の解説文について、起案者による手動確認・一次情報突合レビューを完了した。
- `packages/seed/main/shinjuku-r8-2-inventory.ts` から `reviewCompleted: false` を削除し、`is_review_completed: true` に更新。
- 単体テスト `shinjuku-r8-2-inventory.test.ts` をレビュー完了を期待するアサーションに更新。

### P8-19 議案一覧の会派投票バーを横棒のみに簡略化（Simplify Faction Vote Bar in Bill List）
議案一覧（`/sessions/[slug]/bills`）の各議案カードに表示されている会派スタンス表示について、賛成/反対の会派名リンクは不要。少数会派が視覚的にわかる横棒（`FactionVoteBar`）だけで十分である。

Acceptance:
- 議案一覧の `CompactBillCard`（または議案一覧に使用されている bill card コンポーネント）から、会派ごとの賛成・反対リンク/バッジを削除する
- 少数会派を示す横棒のみを残し、スリムで読みやすいカードレイアウトを実現する
- 議案詳細ページ（`/bills/[id]`）の `FactionStanceCard` は変更しない（詳細側は引き続き全情報を表示する）
- UI変更後、スクリーンショットで確認する

### P8-20 議案詳細の「この議案と議員」セクションの表示条件を絞る（Conditional Display of "Bill and Councilors" Section）
議案詳細ページ（`/bills/[id]`）の下部にある「この議案と議員」（`BillCouncilorsSection`）セクションは、特定の議員が賛否の立場で発言・質問している場合にのみ有意義な情報となる。発言・質問が存在しない議案には不要なセクションとして表示スペースを圧迫している。

Acceptance:
- `BillCouncilorsSection` を、関連する議員の質問・発言（`questions` や関連スタンス）が1件以上存在する場合のみ表示する
- 条件判定ロジックを `bill-detail` ページ（Server Component 側）または `BillCouncilorsSection` コンポーネント内に実装する
- 質問・発言がない場合はセクション自体を非表示にする（空状態UIは設けない）
- 英語表示（`locale === "en"`）でも同じ条件が適用されること
