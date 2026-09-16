# みらい議会＠新宿区 (Mirai Gikai Shinjuku)

新宿区議会の議案・審議情報を、住民が理解しやすい形で閲覧・質問できる非公式の市民向け情報サイト。

- **運営形態**: 個人・趣味運営（非公式）
- **Architecture Pathway**: **Pathway B: Managed / Serverless**
- **Tech Stack**: Next.js (App Router, TypeScript) + Supabase (PostgreSQL) + Vercel + Vercel AI SDK
- **Base Repo**: [kozosophia-lgtm/mirai-gikai-kawasaki](https://github.com/kozosophia-lgtm/mirai-gikai-kawasaki) (`kawasaki/develop`)
- **Upstream**: [team-mirai/mirai-gikai](https://github.com/team-mirai/mirai-gikai)

---

## 📁 ディレクトリ・ドキュメント構成

- [START_HERE.md](file:///Users/ken/antigravity/Mirai_kaigi/START_HERE.md): リポジトリのクローン手順と環境構築
- [AGENT_BRIEF.md](file:///Users/ken/antigravity/Mirai_kaigi/AGENT_BRIEF.md): AI実装エージェント向けの設計原則・禁止事項・開発規範
- [project-decisions.json](file:///Users/ken/antigravity/Mirai_kaigi/project-decisions.json): 主要な決定事項と設定（ターゲット言語、難易度、コスト上限など）
- [docs/](file:///Users/ken/antigravity/Mirai_kaigi/docs): 詳細仕様書
  - `ROADMAP.md`: 実装ロードマップ（Phase 0 〜 Phase 7）
  - `ARCHITECTURE.md`: アーキテクチャとデータフロー
  - `AI_CHAT_POLICY.md`: AIチャットのポリシーとガードレール
  - `I18N_AND_EASY_JAPANESE.md`: やさしい日本語と多言語展開の仕様
  - `LICENSE_AND_BRANDING.md`: ライセンス・免責事項・ブランディング
  - `DATA_PIPELINE.md`: データ収集・正規化パイプライン
- [prompts/](file:///Users/ken/antigravity/Mirai_kaigi/prompts): AIプロンプト定義（やさしい日本語変換、翻訳、議案チャット）
- [snippets/](file:///Users/ken/antigravity/Mirai_kaigi/snippets): 設定例・初期SQL・環境変数テンプレート

---

## ✅ Day 1 Mandatory Checklist

- [x] **Pathway Selected**: Pathway B (Managed / Serverless: Vercel + Next.js + Supabase)
- [x] **Git Initialized**: `git init` 実行完了、デフォルトブランチ `main`
- [x] **Secrets & Environment**: `.env.example` 作成、`.gitignore` 検証（`.env`, `.env*.local` 除外確認）
- [ ] **Remote Repository**: 自身の公開 GitHub リポジトリを作成して `origin` を設定
- [ ] **Base Codebase Setup**: `mirai-gikai-kawasaki` をクローンしてローカル起動
- [ ] **AI Safety Compliance**: 自動実行制限とAI生成コミットの監査体制確認
- [ ] **Skills Mapping**: 開発支援スキルの適用

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

本プロジェクトで推奨・連携するスキル:
- `vercel-react-best-practices`: Next.js / React のパフォーマンス最適化
- `api-security-best-practices`: Supabase RLS、AIエンドポイントのレートリミット・入力バリデーション
- `natural-japanese`: やさしい日本語生成・UIテキストの自然な日本語品質
- `mobile-first-testing`: 市民向けスマートフォンスムーズ閲覧のためのレスポンシブ検証
- `wcag-accessibility`: 多様な住民（高齢者・外国人含む）のためのアクセシビリティ確保
