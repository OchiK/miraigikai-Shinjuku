# みらい議会＠新宿区 (Mirai Gikai Shinjuku)

新宿区議会の議案・審議情報を、住民が理解しやすい形で閲覧・質問できる非公式の市民向け情報サイト。

- **運営形態**: 個人・趣味運営（非公式）
  - 新宿区、新宿区議会、政党チームみらいの公式サービスではありません。
- **Architecture Pathway**: **Pathway B: Managed / Serverless**
- **Tech Stack**: Next.js (App Router, TypeScript) + Supabase (PostgreSQL) + Vercel + Vercel AI SDK
- **Base Repo**: [kozosophia-lgtm/mirai-gikai-kawasaki](https://github.com/kozosophia-lgtm/mirai-gikai-kawasaki) (`kawasaki/develop`)
- **Upstream**: [team-mirai/mirai-gikai](https://github.com/team-mirai/mirai-gikai)
- **Source Repository**: [OchiK/miraigikai-Shinjuku](https://github.com/OchiK/miraigikai-Shinjuku)

---

## 📁 ディレクトリ・ドキュメント構成

- [START_HERE.md](START_HERE.md): リポジトリのクローン手順と環境構築
- [AGENT_BRIEF.md](AGENT_BRIEF.md): AI実装エージェント向けの設計原則・禁止事項・開発規範
- [project-decisions.json](project-decisions.json): 主要な決定事項と設定（ターゲット言語、難易度、コスト上限など）
- [docs/](docs): 詳細仕様書
  - `ROADMAP.md`: 実装ロードマップ（Phase 0 〜 Phase 7）
  - `ARCHITECTURE.md`: アーキテクチャとデータフロー
  - `AI_CHAT_POLICY.md`: AIチャットのポリシーとガードレール
  - `I18N_AND_EASY_JAPANESE.md`: やさしい日本語と多言語展開の仕様
  - `LICENSE_AND_BRANDING.md`: ライセンス・免責事項・ブランディング
  - `DATA_PIPELINE.md`: データ収集・正規化パイプライン
- [prompts/](prompts): AIプロンプト定義（やさしい日本語変換、翻訳、議案チャット）
- [snippets/](snippets): 設定例・初期SQL・環境変数テンプレート

---

## 🚀 ローカル開発セットアップ

```bash
# 1. Supabase の起動
npx supabase start

# 2. 環境変数の設定
cp .env.example .env

# 3. パッケージインストール
pnpm install

# 4. Supabase DB初期化 & シードデータ投入
pnpm db:reset

# 5. 開発サーバー起動（Web: 3002 / Admin: 3001）
pnpm dev
```

### マイグレーション

```bash
# マイグレーションファイル新規作成
npx supabase migration new マイグレーション名

# マイグレーション実行 & TypeScript型定義更新
pnpm db:migrate
```

---

## 🔒 AI Safety & Operational Rules

1. **公式一次資料の厳守**: 一次情報は新宿区公式の日本語資料のみとし、AI翻訳・AI要約は派生データとして扱い明確に区別する。
2. **政治的中立・推測排除**: 政治家の動機推測、支持・不支持の推薦、選挙予測、ランキングは行わない。
3. **厳格なコストガード**:
   - ユーザー別日次上限: `$0.25`
   - 全体日次上限: `$1.00`
   - 全体月次上限: `$10.00`
4. **コミット監査**: エージェントが生成したコードや変更は、コミット前に差分レビューを行う。

---

## 🛠️ Skills Mapping

- `vercel-react-best-practices`: Next.js / React のパフォーマンス最適化
- `api-security-best-practices`: Supabase RLS、AIエンドポイントの保護
- `natural-japanese`: やさしい日本語生成・UIテキストの自然な日本語品質
- `mobile-first-testing`: 市民向けスマートフォンスムーズ閲覧のためのレスポンシブ検証
- `wcag-accessibility`: 多様な住民（高齢者・外国人含む）のためのアクセシビリティ確保

## 改変履歴

- 2026-09-16: 新宿区向けに名称、配色、画像、免責表示、ソースコードへのリンク、CIの対象ブランチを変更しました。上流のAGPL-3.0ライセンスを継承しています。
