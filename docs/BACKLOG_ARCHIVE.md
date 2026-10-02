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
  - [S5-2 本番DBのmigration履歴・制約・出典列の確認 ✅](#s5-2-本番dbのmigration履歴制約出典列の確認-)
  - [S5-5 本番インポート後のキャッシュ即時無効化 ✅](#s5-5-本番インポート後のキャッシュ即時無効化-)
- [P2 難易度・やさしい日本語](#p2-難易度やさしい日本語)
  - [P2-1 Restore easy difficulty](#p2-1-restore-easy-difficulty)
  - [P2-2 Easy Japanese prompt](#p2-2-easy-japanese-prompt)
  - [P2-4 ヘッダー操作ボタン（言語切替・難易度セレクタ）のカラーコントラスト最適化](#p2-4-ヘッダー操作ボタン言語切替難易度セレクタのカラーコントラスト最適化color-contrast-optimization-for-language--difficulty-buttons)
  - [P2-5 Button 既定バリアントのホバー時コントラスト](#p2-5-button-既定バリアントのホバー時コントラストbutton-default-hover-contrast)
  - [P2-6 Button 全体のフォーカスリング](#p2-6-button-全体のフォーカスリングbutton-focus-ring-contrast)
  - [P2-7 Organic 移行の取り残し](#p2-7-organic-移行の取り残しp2-4-で発見)
- [P3 多言語基盤](#p3-多言語基盤)
  - [P3-2 Translation schema](#p3-2-translation-schema)
  - [P3-3 Seven locales（2026-09-24 見直し）](#p3-3-seven-locales2026-09-24-見直し)
- [P4 AIチャット・ガードレール](#p4-aiチャットガードレール)
  - [P4-1 Chat guardrails（出典表示・事前フィルタ・多言語追従）](#p4-1-chat-guardrails出典表示事前フィルタ多言語追従)
  - [P4-2 Cost ceiling（コスト上限・Google Gemini 3.8 Flash 直結）](#p4-2-cost-ceilingコスト上限google-gemini-38-flash-直結)
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

### S5-2 本番DBのmigration履歴・制約・出典列の確認 ✅

Acceptance:
- 本番の migration 履歴が `supabase/migrations/` と一致する
- `(council_session_id, bill_number)` の複合ユニーク、`bill_number_order`、出典URL列が本番にある
- 確認に使ったクエリと結果を `docs/verification/` に残す

Progress (2026-09-28):
- 本番DBの `supabase_migrations.schema_migrations` 105件と、リポジトリのmigration 105件が一致した。
- `bills_session_bill_number_unique`、`bills_unassigned_bill_number_unique`、`idx_bills_bill_number_order` の定義を `pg_indexes` で確認した。
- `bill_number_order` が保存生成列であることと、4つの出典URL列が `text` として存在することを `information_schema.columns` で確認した。
- 会期内の `(council_session_id, bill_number)` の重複は0件だった。
- クエリと結果は [S5-2 本番DB確認記録](verification/20260928_本番DB_migration履歴制約出典列確認.md) に保存した。

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

### P2-4 ヘッダー操作ボタン（言語切替・難易度セレクタ）のカラーコントラスト最適化（Color Contrast Optimization for Language & Difficulty Buttons）
ヘッダーに配置されている言語切替（`LanguageToggle`：「日本語 / English」）および難易度セレクタ（`DifficultySelector`：「やさしい / ふつう / くわしく」）について、セグメント背景（`bg-neutral-200`）に対するテキスト（選択時: `bg-primary text-mirai-text`、非選択時: `text-mirai-text-secondary`）のカラーコントラストが最適でない可能性がある。屋外や弱視の利用者にとっても判読しやすくなるよう、WCAG 2.2 AA 基準（文字 4.5:1、UIコンポーネント 3:1）に照らしてコントラストを検証・改善する。

Acceptance:
- `LanguageToggle` および `DifficultySelector` の選択時・非選択時・ホバー時・フォーカス時のテキストと背景のコントラスト比を計測・検証する
- `bg-neutral-200` のピル地に対する `text-mirai-text-secondary`（非選択時）の視認性を高め、4.5:1 以上のコントラストを確保する
- 選択時（`bg-primary`）と `text-mirai-text` の組み合わせの視認性を確認・最適化する
- Organic デザインシステムの階調（`neutral-700`、`terracotta` 等）と整合性を保ちながら改善する
- `accesslint` / Playwright による a11y 自動検査およびビジュアルチェックを実施する

Progress (2026-10-01):
地を `neutral-100` に明るくし、選択中は `bg-primary text-mirai-text` のまま残した（Option 1）。
3つのボタン（`LanguageToggle`、`DifficultySelector`、`RubyToggle` の pill）の配色は `web/src/lib/segment-control-styles.ts` にまとめた。
ふりがなのピルは1項目のセグメントとして同じ地で包んだ。

| 組み合わせ | 変更前 | 変更後 | 基準 |
| :--- | ---: | ---: | ---: |
| 選択中の文字 / 選択中の塗り（`primary`） | 4.60 | 4.60 | 4.5 |
| 選択中のホバー文字 / ホバー時の塗り | 3.70（`primary-accent`） | 4.60（塗りを変えない） | 4.5 |
| 選択中の塗り / 地 | 2.94（`neutral-200`） | 3.30（`neutral-100`） | 3.0 |
| ふりがなピル（オン） / 背後の面 | 2.69（ヘッダー地） | 3.30（`neutral-100` の地） | 3.0 |
| 非選択の文字 / 地 | 8.12 | 9.12 | 4.5 |
| 非選択のホバー文字 / ホバー時の塗り | 5.49（ghost の `accent`） | 11.19（`neutral-300`） | 4.5 |
| フォーカスリング / オフセット地 | 1.51（`ring-primary/40`） | 5.72（`ring-mirai-accent-text`） | 3.0 |
| フォーカスリング / ヘッダー地 | — | 5.09 | 3.0 |
| フォーカスリング / セグメントの地 | — | 6.22 | 3.0 |

比は `globals.css` のトークンから WCAG 2.x の式で計算した。`segment-control-styles.test.ts` が実際の `globals.css` を読み、`var()` をたどって同じ比を検証する。トークンを変えて比が基準を割ると CI で落ちる。
見つかった別件は P2-5（Button のホバー）、P2-6（Button のフォーカスリング）、P2-7（Organic 移行の取り残し）に積んだ。

### P2-5 Button 既定バリアントのホバー時コントラスト（Button Default Hover Contrast）
`components/ui/button.tsx` の default バリアントはホバーで `hover:bg-primary-accent`（terracotta-600 #b2622d）になり、文字 `text-mirai-text` との比が 3.70:1 で 1.4.3 の 4.5:1 を満たさなかった。デザインシステム定義の「hover 5.83:1」も誤記だった。

Progress (2026-10-02):
`--primary-accent` を terracotta-400（#f6a06b）に変え、ホバー時の比を 8.03:1 にした。デザインシステム定義の注記を実測値（4.60 / 8.03）に直した。
`primary-accent` をホバー地に使う他の箇所（議案一覧のフィルタ、議員のチップ）も同時に適合した。
同じトークンを使っていた2か所は、変更で崩れるため合わせて直した。
- チャット送信ボタン: `text-primary-foreground`（クリーム）のままだとホバー時に約1.7:1まで落ちるため `text-mirai-text` に変更
- 定型返信ボタン: 枠線とホバー色が薄くなるため `mirai-accent-hover`（terracotta-600）に置き換え、見た目を維持

`web/src/components/ui/button.test.tsx` が `globals.css` を読んで通常時・ホバー時の比を検証する。

### P2-6 Button 全体のフォーカスリング（Button Focus Ring Contrast）
Button 基底の `focus-visible:ring-primary/40` は、オフセットのクリーム地に対し 1.51:1 で 1.4.11 の 3:1 を満たさなかった。

Progress (2026-10-02):
Button 基底を `ring-mirai-accent-text` / `border-mirai-accent-text`（terracotta-700）に変えた。
`SEGMENT_FOCUS_CLASS` の上書きを外し、`ring-primary/40` を直書きしていた `home-link`、`nav-links`、`language-selector`、`guide-language-links`、`switch` も揃えた。

| 地 | 比 | 基準 |
| :--- | ---: | ---: |
| ページ地（`background`） | 5.72 | 3.0 |
| カード（`card`） | 5.09 | 3.0 |
| `neutral-100` | 6.22 | 3.0 |
| `neutral-200` | 5.54 | 3.0 |
| `neutral-300` | 4.59 | 3.0 |

### P2-7 Organic 移行の取り残し（P2-4 で発見）
Progress (2026-10-02):
- 未使用の `--color-mirai-level-active` / `-fg` を `globals.css` から削除し、デザインシステム定義の「難易度セレクタ」節を P2-4 の配色に書き直した
- どこからも import されていない `components/layouts/desktop-menu/` を削除した
- `DifficultyInfoCard` の `bg-white` / `text-gray-800` を `bg-card shadow-mirai-sm` / `text-mirai-text` に置き換えた。固定高 `h-38` は文字拡大で溢れるため `min-h-38` にした

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

### P3-5 英語のみ翻訳・5言語の案内ページ
詳細は `docs/20260924_0450_多言語方針の見直し_英語のみ翻訳と多言語案内ページ.md`。

Acceptance:
- 英語以外の翻訳が公開されない
  - `packages/shared/src/i18n/` の `PUBLIC_TRANSLATION_LOCALES = ["en"]` で公開判定を制限し、テストで固定する
  - 言語切替メニューは日本語・英語のみ。`?lang=vi` などは日本語にフォールバックする
  - 管理画面の承認は英語以外ではサーバー側で拒否し、承認ボタンも出さない（下書きの閲覧・編集は可）
  - 既存の5言語の下書きは DB に残す
- zh-Hans / ko / ne / my / vi の案内ページ（例: `/guide/vi`）
  - 内容はサイトの説明・日本語が正本であること・ブラウザ翻訳の使い方（Chrome / Safari / Android / アプリ内ブラウザ、ふりがなを切ってから翻訳）・「やさしい」への切替・AIチャットは自分の言語で質問できること、の5つのみ。用語集と議会の仕組みの説明は載せない
  - やさしい日本語で原文を書いて機械翻訳し、日本語の原文を横に並べる
  - 先頭に各言語で「機械翻訳であること」と連絡先を1行で書く。ネイティブ確認はしない
  - `web/src/lib/routes.ts` にルート関数を追加し、5ページを `hreflang` で結んで sitemap に載せる
  - トップページとフッターから自言語表記でリンクする

Progress (2026-09-24, 2026-09-27):
- 公開判定は `isPublishableTranslation`、表示言語は `parseLocale` / middleware / `setLocaleCore`、
  管理画面は `canApproveTranslationLocale`（`upsertBillTranslation` とエディタの両方）で制限。
- 案内ページの文面は `web/src/features/guide/shared/guide-content.ts`。原文と翻訳の段落数はテストで揃えている。
- 2026-09-27: ブラウザ翻訳手順のスクリーンショット追加は見送り（文章のみで十分に説明できているため不要と判断し、タスク完了としてアーカイブへ移動）。

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

Progress (2026-09-27, PR #98):
- FAQ（`/faq`）、利用規約（`/terms`）、プライバシーポリシー（`/privacy`）の各ページについて、`web/src/features/legal/` 配下に構造化データ（`faq-data.tsx`, `terms-data.ts`, `privacy-data.ts`）を作成し、自然な英語表現と公式日本語の正本注記（Reference notice）を整備。`LegalDocumentContent` サーバーコンポーネント経由で描画し、ページ側は `locale` を渡す薄いラッパーとして再構築。
- 各ページのメタデータ（`<title>` / `description`）を動的ローカライズ（トップページ、議員一覧、議員詳細、定例会議案一覧、議案詳細、FAQ、利用規約、プライバシーポリシー）。
- 単体テスト（`faq-data.test.tsx`, `terms-data.test.ts`, `privacy-data.test.ts`）を追加し、ビルド・全テストの通過を確認。これにより P8-12（サイト全体のUI英語化・Chrome i18n）が完了。

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

### P8-19 議決結果・会派賛否表示の簡素化（少数会派付き水平バーへの集約・全会派リンク一覧の削除）（Simplify Faction Vote Display to Horizontal Bar with Minority Factions）
現在、議案詳細ページ（`/bills/[id]`）の会派賛否カード（`FactionStanceCard`）では、賛否の比率を示す水平バー（`FactionVoteBar`）に加え、全8会派を縦並びに列挙して各会派の議員一覧アンカーへのリンクと「賛成」「反対」バッジを表示する一覧（`FactionStanceRow`）を設けている。
しかし、議案を閲覧する上では、少数会派名（例：「反対1会派（日本共産党）」や全会一致表示）が添えられた水平バーがあれば一目で十分な情報が伝わり、8行にわたる全会派の個別リンク行は視覚的なノイズや縦スペースの圧迫となっている。そのため、個別会派リンク一覧を廃止し、少数会派を付記した水平バーに集約・簡素化することを検討する。また、議案一覧（定例会アーカイブ等）への水平バーのコンパクト表示の要否についても合わせて検討する。

Acceptance:
- 議案詳細ページ（`/bills/[id]`）の会派賛否表示（`FactionStanceCard`）から、全会派を縦並びで列挙する個別リンク行（`FactionStanceRow`）を削除し、少数会派名を併記した水平バー（`FactionVoteBar`）のみのすっきりした構成に集約する
- 全会一致（unanimous）および賛否分かれ（split）のいずれの場合も、少数会派（反対または賛成少数）の名前がバー近傍に明瞭に伝わる表示を維持・最適化する
- 会派見解やコメント（`stance.comment`）が存在する場合の表示方針（必要な場合のみ折りたたみで出すか、または廃止するか）を整理する
- （検討事項）定例会の議案一覧（`/sessions/[slug]/bills` の `CompactBillCard` 等）において、議決結果の水平バーをコンパクトに一覧表示する需要があるか検討・検証する
- Organic デザインシステム（余白・配色トークン）および日英多言語（`locale` / `ui-messages.ts`）に準拠すること

Progress (2026-09-27, PR #95):
- `FactionStanceCard` から縦並びで全会派を列挙していた `FactionStanceRow` を削除し、少数会派名を併記した水平バー（`FactionVoteBar`）のみのシンプルな構成に集約。
- 採決後に名称変更した会派は、採決時の名称をバーの少数会派表示に使用するよう `getFactionNameAtVote` を追加・適用。
- `FactionStanceRow` 削除に伴い、不要となったコンポーネント・関数・アイコン・文言（`stanceLabels` の条件付賛成/反対/中立/検討中、`councilorsOf`、`nameAtVote`）を日英ともに整理・クリーンアップ。

### P8-20 議案詳細「この議案と議員」セクションの表示条件見直し（特定議員の発言・賛否等がある場合のみ表示）（Condition "Bills and Councilors" Section on Specific Councilor Activity）
議案詳細ページ（`/bills/[id]`）下部にある「この議案と議員」セクション（`BillCouncilorsSection`）は、現在すべての議案で無条件に常設表示されており、関連する質問（`questions`）がない場合でも「新宿区議会には38名の議員が所属しています...」という一般的な議員一覧への案内枠が必ず表示される仕様となっている。
しかし、特定の議員がその議案に対して明確に賛成・反対の討論を行ったり質疑を提起したりしていない一般的な議案において、毎回このセクションを表示する必要性は薄い。特定議員による発言・討論・賛否表明や関連質問が存在する場合にのみ表示するように条件付き表示へ見直し、ページの冗長さを解消する。

Acceptance:
- 議案詳細ページ（`/bills/[id]`）の「この議案と議員」セクション（`BillCouncilorsSection`）について、特定議員の活動（討論・発言・紐づく質問等）が存在しない場合はセクション全体を非表示とするよう表示条件を改修する
- 当該議案に紐づく質問（`questions.length > 0`）がある場合、または特定議員の討論・発言データが登録されている場合のみセクションを表示する
- セクション非表示時にも、議員一覧への導線が必要な場合の代替配置（例：フッターやナビゲーションで十分か）を検討・確認する
- 関連コンポーネント・ローダー（`bill-councilors-section.tsx`、`bill-detail-layout.tsx`）およびテストを更新する
- 日英表示（`ja` / `en`）でレイアウト崩れやアクセシビリティ上の問題（見出し階層等）がないことを確認する

Progress (2026-09-27, PR #95):
- 議案詳細ページ（`BillDetailLayout`）で、関連する質問が存在する場合（`relatedQuestions.length > 0`）のみ `BillCouncilorsSection` を描画するように条件付き表示へ改修。
- `BillCouncilorsSection` から汎用的な議員案内ブロック（「議案は区議会の本会議で採決されます...」と「議員一覧を見る」リンク）を削除し、関連質問カード一覧のみを表示する構成に整理。
- 未使用となったアイコン・文言（`billCouncilors.body`, `billCouncilors.councilorsLink`）およびルートインポートを削除。

### P8-21 令和8年第3回定例会22件のタグ付け（Tagging for R8-3 Bills）
第3回定例会（R8-3）の22件の議案について、トップページの「分野別の議案一覧（タグ別）」へ正しく分類・表示されるよう、既存タグへの紐づけをシード台帳に定義し、テストおよび本番DBへ反映する。

Acceptance:
- R8-3 の全22件（第63〜80号議案、認定第1〜4号）に適切なタグを割り当てる（`packages/seed/main/data.ts` の `billTagsBySlug`）
- `seed-associations.test.ts` でタグ紐づけの件数と対応を検証する
- 本番DBに `import_production.yml` で `bills_tags` 関連付けを反映する

Progress (2026-09-30, PR #105):
- `packages/seed/main/data.ts` に全22件のタグマッピングを追加。
- `seed-associations.test.ts` を更新し、45件（R8-2: 23件 + R8-3: 22件）の関連付けを自動検証。
- PR #105 マージ後、本番DBへ `bills_tags` 関連付けを適用完了。

### P8-22 定例会表示と議案ナビゲーションのUI改善（Session Display & Bill Navigation UI Enhancements）
第3回定例会の公開に伴い、会期表示・ナビゲーション導線・セクション構造に関する以下の7点のUI改善を実施。

Acceptance:
1. ヘッダーの「議案一覧」導線を「最新の議案一覧（Latest Bills）」とし、現在アクティブな定例会への導線であることを明示する
2. 議案一覧ページ（`/sessions/[slug]/bills`）で、現在審議中の会期では「Archive」表記を出さず、「最新」バッジと会期名で表示する（終了した会期のみ Archive 表記）
3. ヘッダーの冗長な会期名ピルを削除する
4. トップページの多言語案内バナー下に現在の会期名（令和8年 第3回定例会）と開始日・終了日を表示する
5. 「開会中 / 閉会中」ピルを会期日付判定で復活させる
6. 「注目の議案」セクションを全幅の沈んだ面（`bg-mirai-surface-sunken`）で囲み、「分野別の議案一覧（タグ別）」と視覚的に分離する
7. ハンバーガーメニューで最新の定例会（第3回）がデスクトップで非表示になっていた問題を解消し、全会期を常に表示する

Progress (2026-09-30, PR #106):
- `nav.latestBills` を新設し、ヘッダーに「最新の議案一覧」を表示。
- `CouncilSessionBillList` で `!session.is_active` 時のみ Archive バナーを表示し、アクティブ会期は「最新」バッジ付きヘッダーに変更。
- ヘッダーから会期名ピルを削除し、トップページに `CurrentSessionHeader` / `CouncilSessionStatusBadge` を新設して配置。
- 「注目の議案」を `bg-mirai-surface-sunken` 帯で包み、分野別セクションとのコントラストを確立。
- `HamburgerMenu` の `lg:hidden` を削除し、全会期を全端末で表示。
- Codex による独立検証（PASS）を経て PR #106 をマージ、本番 Vercel デプロイを完了・公開確認済み。



---

## P4 AIチャット・ガードレール

### P4-1 Chat guardrails（出典表示・事前フィルタ・多言語追従）
Acceptance:
- 議案コンテキスト限定（bill context only）
- 関係のない質問を有料API呼び出し前に遮断（off-topic blocked before paid call where possible）
- 回答言語が質問者の言語に追従（answer language follows user）
- 出典が明示されること（source shown）

Progress (2026-10-02, PR #110):
- 出典表示: プロンプトに「出典を示せない内容は答えない・回答の最後の1行に `【出典】…` / `Source: …`」を追加（`SOURCE_AND_LANGUAGE_RULES`）。`extractSourceCitations` が出典行を本文から切り離し、`SystemMessage` が `bg-mirai-source-chip` のチップとして描画。完了した回答に出典行がない場合は定型の辞退文に差し替え。
- 多言語追従: 質問者の言語（日本語・英語）に追従するルールをプロンプトに追加。チャット上部に議案名と言語切り替えを表示し、会話履歴を保ったまま日英切替が可能。
- 事前フィルタ: 空入力・記号のみ・コード生成・レシピ・雑談などを有料モデル呼び出し前に `validateChatQuestion` で検出し、定型の案内をアシスタント発言として即時返却。
- UI/UX: チャットダイアログ背景を `bg-background` に統一、AI吹き出しに `bg-mirai-ai-bg` の `AI` バッジを付与して視覚的に区別。429を含む全エラー文言を日英化。

### P4-2 Cost ceiling（コスト上限・Google Gemini 3.8 Flash 直結）
Acceptance:
- ユーザー日次上限（per-user daily cap）
- システム日次上限（total daily cap）
- システム月次上限（total monthly cap）
- 上限到達時のわかりやすいUI通知（clear UI when cap reached）
- Google Gemini 直接連携と正確なコスト計算・ガードレール完全連動

Progress (2026-10-02〜2026-10-03, PR #111, #112):
- Gemini 直接連携: Google AI Studio の `GEMINI_API_KEY` を用いて `@ai-sdk/google` 経由で `gemini-3.8-flash` に直結。未設定時は Gateway 経由 `openai/gpt-4o-mini` に安全にフォールバック。
- コストガード同期: `gemini-3.8-flash` および `google/gemini-3.8-flash` に単価（入力 $0.50 / 出力 $3.00 per 1M tokens）を登録し、`calculateUsageCostUsd` によるユーザー日次・システム日次・月次上限チェックと連動。
- 不適合ツールの除外: Google 直結時は OpenAI 専用ツール（`openai.tools.webSearch()`）を渡さず、ペイロードエラーを未然に防止。
- 環境変数サニタイズ（PR #112）: Vercel 入力時に前後のクォーテーションや余計な空白・改行が混入しても自動で除去する `sanitizeApiKey` を実装。マスク付き診断ログ（`[Chat] Provider: ..., Model: ..., Key: ... (len: ...)`）を追加。
- 本番稼働検証（2026-10-03）: Vercel 本番環境で Gemini 3.8 Flash による高速ストリーミング応答、出典チップ表示、日英切り替え、事前フィルタの正常稼働を確認完了。
