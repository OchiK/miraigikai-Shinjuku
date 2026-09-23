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

### P3-3 Seven locales
Acceptance:
ja/en/zh-Hans/ko/ne/my/vi available.

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
