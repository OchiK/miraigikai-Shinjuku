# Backlog Archive (Completed Tasks)

完了済みのバックログ項目およびその受入条件・進捗履歴のアーカイブです。
未完了のタスクや現在進行中のバックログは [BACKLOG.md](./BACKLOG.md) を参照してください。

---

## 目次

- [P0 初期立ち上げ・ブランディング・新宿区設定](#p0-初期立ち上げブランディング新宿区設定)
  - [P0-1 Local boot](#p0-1-local-boot)
  - [P0-2 Branding compliance](#p0-2-branding-compliance)
  - [P0-3 Shinjuku config](#p0-3-shinjuku-config)
  - [P0-4 Remove Kawasaki references](#p0-4-remove-kawasaki-references)
- [P1 会期フィクスチャ・出典トレーサビリティ](#p1-会期フィクスチャ出典トレーサビリティ)
  - [P1-1 2026 R2 session fixture](#p1-1-2026-r2-session-fixture)
  - [P1-2 Source provenance](#p1-2-source-provenance)
- [S5 本番稼働検証](#s5-本番稼働検証)
  - [S5-5 本番インポート後のキャッシュ即時無効化 ✅](#s5-5-本番インポート後のキャッシュ即時無効化-)
- [P2 難易度・やさしい日本語](#p2-難易度やさしい日本語)
  - [P2-1 Restore easy difficulty](#p2-1-restore-easy-difficulty)
  - [P2-2 Easy Japanese prompt](#p2-2-easy-japanese-prompt)
- [P3 多言語基盤](#p3-多言語基盤)
  - [P3-2 Translation schema](#p3-2-translation-schema)
  - [P3-3 Seven locales（2026-09-24 見直し）](#p3-3-seven-locales2026-09-24-見直し)
- [P5 自動化・制約](#p5-自動化制約)
  - [P5-0 bill_number のユニーク制約を会期スコープにする ✅](#p5-0-bill_number-のユニーク制約を会期スコープにする-)
  - [P5-1 Automation（新宿区議会更新検知とドラフト生成）](#p5-1-automation)
- [P7 議員関連機能](#p7-議員関連機能)
  - [P7-1 議員ページ（世田谷モデル） — Done](#p7-1-議員ページcouncil-person-page---世田谷モデル--done)
  - [P7-3 議員本人のX（旧Twitter）アカウント表示](#p7-3-議員本人のx旧twitterアカウント表示councilor-xtwitter-account-links)
- [P8 UI/UX・アクセシビリティ・ブランディング改善](#p8-uiuxアクセシビリティブランディング改善)
  - [P8-1 トップページへの明確な復帰導線](#p8-1-トップページへの明確な復帰導線return-to-top-navigation)
  - [P8-2 デスクトップヘッダーの余白活用](#p8-2-デスクトップヘッダーの余白活用header-space-utilization)
  - [P8-3 ハンバーガーメニュー内の多言語案内リンク削除](#p8-3-ハンバーガーメニュー内の多言語案内リンク削除menu-cleanup)
  - [P8-4 日英言語切替のトップページ/ヘッダー直接露出](#p8-4-日英言語切替jaenのトップページヘッダー直接露出prominent-language-switcher)
  - [P8-5 「注目の議案」レイアウト刷新](#p8-5-注目の議案レイアウト刷新featured-bills-layout--aesthetics)
  - [P8-6 ルビ適用スコープの日本語限定化](#p8-6-ルビrubyful適用スコープの日本語限定化ruby-scope-guard-for-japanese-only)
  - [P8-7 サイト運営者表記の「新宿区民」への変更・匿名化](#p8-7-サイト運営者表記の新宿区民への変更匿名化operator-anonymity--attribution)
  - [P8-8 議案管理一覧での「注目議案」直接切替](#p8-8-議案管理一覧での注目議案直接切替inline-featured-toggle-in-admin-bills-list)
  - [P8-9 サイト運営者表記の「新宿区民A」への更新](#p8-9-サイト運営者表記の新宿区民aへの更新operator-attribution-update-to-新宿区民a)
  - [P8-10 ルビトグルのヘッダー直接配置](#p8-10-ルビふりがなトグルのヘッダー直接配置ruby-toggle-prominent-placement)
  - [P8-11 デスクトップ表示時のナビゲーション重複解消](#p8-11-デスクトップ表示時のナビゲーション重複解消desktop-nav--hamburger-redundancy-cleanup)
  - [P8-13 注目の議案とタグ別一覧の重複解消](#p8-13-注目の議案とタグ別一覧の重複解消featured--by-tag-duplicate-cards)
  - [P8-14 議員一覧・議員カードの視覚表現・レイアウト刷新](#p8-14-議員一覧議員カードの視覚表現レイアウト刷新councilor-list-layout--visual-hierarchy-refresh)
  - [P8-15 トップページ中段の重複した英語切替の削除](#p8-15-トップページ中段の重複した英語切替read-the-bills-in-englishの削除remove-redundant-english-toggle-from-top-banner)
  - [P8-16 定例会議案一覧での難易度切替トグルの表示](#p8-16-定例会アーカイブ議案一覧ページでの難易度日本語レベル切替トグルの表示difficulty-selector-in-bills-archive)
  - [P8-17 トップページ「本日の定例会」セクションの整理](#p8-17-トップページの本日の定例会セクションの目的必要性の再検討と整理re-evaluate-current-council-session-banner-on-top-page)
  - [P8-18 議員提出議案4件の公開レビュー・完了フラグ更新](#p8-18-議員提出議案4件第710号の公開レビューファクトチェックと完了フラグ更新publication-review--fact-check-for-councilor-bills-7-10)

---

## P0 初期立ち上げ・ブランディング・新宿区設定

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

---

## P1 会期フィクスチャ・出典トレーサビリティ

### P1-1 2026 R2 session fixture
Acceptance:
- every published bill has stable external key
- source URLs saved
- result saved

### P1-2 Source provenance
Acceptance:
each derived content can trace back to source.

---

## S5 本番稼働検証

### S5-5 本番インポート後のキャッシュ即時無効化 ✅
`import_production.yml` は `WEB_PUBLIC_URL` と `REVALIDATE_SECRET` がないとキャッシュ無効化を飛ばす。

Acceptance:
- GitHub の Secrets（または production environment）に `WEB_PUBLIC_URL` と、web の Vercel と同じ `REVALIDATE_SECRET` を入れる
- 次の本番インポートで「スキップした」ではなく `/api/revalidate` の 200 がログに出ることを確認する

Progress (2026-09-25):
- GitHub Actions の `production` environment secrets に `WEB_PUBLIC_URL`（`https://miraigikai-shinjuku-web.vercel.app`）および `REVALIDATE_SECRET`（`.env.production` の検証済みキー）を設定した。
- `import_production.yml`（run 36135018218、apply モード）を実行し、議員提出議案第7〜10号のレビュー完了フラグ4件を本番反映。
- `Invalidate bills cache` ステップにて `/api/revalidate` が呼び出され、`{"success":true,"revalidated":true,"tags":["bills","council-sessions","councilors"]}` の 200 応答を受信してキャッシュ即時無効化が正常に完了することを確認した。

---

## P2 難易度・やさしい日本語

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

---

## P3 多言語基盤

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

---

## P5 自動化・制約

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

---

## P7 議員関連機能

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

---

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
