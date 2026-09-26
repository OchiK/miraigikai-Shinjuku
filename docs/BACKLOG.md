# Backlog

現在対応中、または対応予定のバックログ一覧です。
完了済みのタスク（受入基準・進捗履歴）は [BACKLOG_ARCHIVE.md](./BACKLOG_ARCHIVE.md) に退避・記録されています。

---

## 完了済みタスク（アーカイブ参照）

完了したタスクの詳細は [BACKLOG_ARCHIVE.md](./BACKLOG_ARCHIVE.md) を参照してください。

| 分類 | 完了済みタスク ID |
| :--- | :--- |
| **初期基盤・会期** | P0-1, P0-2, P0-3, P0-4, P1-1, P1-2 |
| **本番稼働検証** | S5-5（本番キャッシュ即時無効化） |
| **難易度・多言語** | P2-1, P2-2, P3-2, P3-3（英語のみ翻訳・案内ページ方針へ見直し） |
| **自動化・制約** | P5-0（会期スコープユニーク制約）, P5-1（更新検知・ドラフト生成） |
| **議員機能** | P7-1（世田谷モデル議員ページ）, P7-3（公式Xアカウント表示・全38名調査） |
| **UI/UX・改善** | P8-1, P8-2, P8-3, P8-4, P8-5, P8-6, P8-7, P8-8, P8-9, P8-10, P8-11, P8-13, P8-14, P8-15, P8-16, P8-17, P8-18 |

---

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

---

## P2 インクルーシブデザイン・アクセシビリティ

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

---

## P3 多言語対応・ルビ確認

### P3-1 i18n UI
Acceptance:
language switch works without losing current bill.

Progress (2026-09-25):
ROADMAP の「UI translation」の残りは P8-12 の残作業（定例会の議案一覧・議員一覧・FAQ/規約などの下層ページ、議案詳細の見出し、英語文言のネイティブ確認、`<html lang>`）で扱う。2026-09-26 に FAQ/規約とネイティブ確認以外を済ませた。`<html lang>` は `ja` のままにすると決めた（P8-12 参照）。

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

### P3-5 英語のみ翻訳・5言語の案内ページ（スクリーンショットのみ残り）
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

---

## P4 AIチャット・ガードレール

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

---

## P5 自動化・会期更新

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

---

## P7 議員・議会機能の拡張候補

### P7-2 任意機能の候補（ROADMAP Phase 7 の未着手分）
着手するときに要件を書き起こす。いまは候補の記録だけ。

- 会議録（minutes）と発言（speeches）の取り込み。7-B の会議録検索API（tenant 211）が使える。質問と議案の紐づけ（`council_member_questions.bill_id`）もここで入れる
- 委員会（committees）のページ
- 予算エクスプローラー（budget explorer）
- AI インタビュー。いまは設定で無効
- 更新通知（notifications）
- zh-Hant は 2026-09-24 の方針（議案の翻訳は英語のみ）で見送り。やるなら案内ページの追加として扱う

---

## P8 UI/UX・アクセシビリティ改善

### P8-12 英語モード時のUI全体多言語化（Full English Page Translation & Chrome i18n）
英語（EN）に切り替えた際、議案詳細の本文だけでなく、サイト全体（トップページ、ヘッダー、ナビゲーション、各セクション見出し、フッター等）が英語表示に切り替わるようにUI全体の多言語化（Chrome i18n）を実施する。

Acceptance:
- トップページの各セクション（Hero、注目の議案、タグ別議案一覧、みらい議会とは、フッター等）の見出し・ラベル・説明文が `locale === "en"` 時に英語で表示される
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

### P8-19 議決結果・会派賛否表示の簡素化（少数会派付き水平バーへの集約・全会派リンク一覧の削除）（Simplify Faction Vote Display to Horizontal Bar with Minority Factions）
現在、議案詳細ページ（`/bills/[id]`）の会派賛否カード（`FactionStanceCard`）では、賛否の比率を示す水平バー（`FactionVoteBar`）に加え、全8会派を縦並びに列挙して各会派の議員一覧アンカーへのリンクと「賛成」「反対」バッジを表示する一覧（`FactionStanceRow`）を設けている。
しかし、議案を閲覧する上では、少数会派名（例：「反対1会派（日本共産党）」や全会一致表示）が添えられた水平バーがあれば一目で十分な情報が伝わり、8行にわたる全会派の個別リンク行は視覚的なノイズや縦スペースの圧迫となっている。そのため、個別会派リンク一覧を廃止し、少数会派を付記した水平バーに集約・簡素化することを検討する。また、議案一覧（定例会アーカイブ等）への水平バーのコンパクト表示の要否についても合わせて検討する。

Acceptance:
- 議案詳細ページ（`/bills/[id]`）の会派賛否表示（`FactionStanceCard`）から、全会派を縦並びで列挙する個別リンク行（`FactionStanceRow`）を削除し、少数会派名を併記した水平バー（`FactionVoteBar`）のみのすっきりした構成に集約する
- 全会一致（unanimous）および賛否分かれ（split）のいずれの場合も、少数会派（反対または賛成少数）の名前がバー近傍に明瞭に伝わる表示を維持・最適化する
- 会派見解やコメント（`stance.comment`）が存在する場合の表示方針（必要な場合のみ折りたたみで出すか、または廃止するか）を整理する
- （検討事項）定例会の議案一覧（`/sessions/[slug]/bills` の `CompactBillCard` 等）において、議決結果の水平バーをコンパクトに一覧表示する需要があるか検討・検証する
- Organic デザインシステム（余白・配色トークン）および日英多言語（`locale` / `ui-messages.ts`）に準拠すること

### P8-20 議案詳細「この議案と議員」セクションの表示条件見直し（特定議員の発言・賛否等がある場合のみ表示）（Condition "Bills and Councilors" Section on Specific Councilor Activity）
議案詳細ページ（`/bills/[id]`）下部にある「この議案と議員」セクション（`BillCouncilorsSection`）は、現在すべての議案で無条件に常設表示されており、関連する質問（`questions`）がない場合でも「新宿区議会には38名の議員が所属しています...」という一般的な議員一覧への案内枠が必ず表示される仕様となっている。
しかし、特定の議員がその議案に対して明確に賛成・反対の討論を行ったり質疑を提起したりしていない一般的な議案において、毎回このセクションを表示する必要性は薄い。特定議員による発言・討論・賛否表明や関連質問が存在する場合にのみ表示するように条件付き表示へ見直し、ページの冗長さを解消する。

Acceptance:
- 議案詳細ページ（`/bills/[id]`）の「この議案と議員」セクション（`BillCouncilorsSection`）について、特定議員の活動（討論・発言・紐づく質問等）が存在しない場合はセクション全体を非表示とするよう表示条件を改修する
- 当該議案に紐づく質問（`questions.length > 0`）がある場合、または特定議員の討論・発言データが登録されている場合のみセクションを表示する
- セクション非表示時にも、議員一覧への導線が必要な場合の代替配置（例：フッターやナビゲーションで十分か）を検討・確認する
- 関連コンポーネント・ローダー（`bill-councilors-section.tsx`、`bill-detail-layout.tsx`）およびテストを更新する
- 日英表示（`ja` / `en`）でレイアウト崩れやアクセシビリティ上の問題（見出し階層等）がないことを確認する
