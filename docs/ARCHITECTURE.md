# Architecture

## 全体

```text
新宿区公式サイト
  ├─ 定例会提出議案ページ
  ├─ 議案PDF / 概要PDF
  └─ 議決結果ページ
          |
          v
   ingest / normalize
          |
          v
   canonical Japanese data
          |
   +------+----------------+
   |                       |
   v                       v
やさしい/通常/詳細       translations
日本語コンテンツ          en/zh-Hans/ko/ne/my/vi
   |                       |
   +-----------+-----------+
               v
            Supabase
               |
        +------+------+
        |             |
        v             v
      Next.js       Admin
        |
        v
   Bill detail page
        |
        v
      AI chat
        |
        v
日本語公式資料を根拠に
ユーザー言語で回答
```

## 技術スタック

ベースリポジトリの構成を維持する。

- Next.js / TypeScript
- Supabase / PostgreSQL
- pnpm
- Admin app
- Vercel AI SDK / AI Gateway系の既存チャット実装
- Langfuseは任意。個人運営では後回しでもよい

## canonical / derived の分離

### Canonical

一次情報。

- 新宿区公式URL
- 議案番号
- 公式議案名
- 会期
- 提出日
- 議決結果
- 公式PDF本文または抽出テキスト
- source_updated_at
- source_hash

### Derived

AIまたは編集者が作成したもの。

- 要約
- やさしい日本語
- 詳細説明
- タグ
- 翻訳
- AIチャット回答

Derivedには可能な限り生成メタデータを持たせる。

## locale と difficulty

別概念として設計する。

例:

```text
Bill 45
  ja/easy
  ja/normal
  ja/hard

  en/easy?       MVPでは不要
  en/normal
  en/hard?       将来
```

MVPでは翻訳言語は基本的に `normal` の翻訳だけでもよい。UIは将来 `difficulty x locale` を表現できる構造にする。

## 推奨DB設計

既存 `bill_contents` は日本語canonical/derivedのdifficulty別コンテンツとして維持。

翻訳は別テーブル:

```sql
bill_content_translations
  id
  bill_content_id
  locale
  title
  summary
  content
  status
  translation_model
  translated_at
  source_hash
```

これにより「日本語元文が変わったので翻訳がstale」という判定ができる。

## ルーティング

第一候補:

```text
/ja/bills/<id>
/en/bills/<id>
/zh-Hans/bills/<id>
/ko/bills/<id>
/ne/bills/<id>
/my/bills/<id>
/vi/bills/<id>
```

ただし既存routingへの影響が大きければ、MVPではcookie/query parameterから始め、後からlocale prefixへ移行してもよい。

## 検索

MVP:
- DB内の議案名・要約検索
- localeごとの翻訳テキスト検索は後回しでもよい

将来:
- full text search
- multilingual embeddings
- 議事録RAG

## デプロイ

個人運営の初期構成:
- Web: Vercel
- DB/Auth: Supabase
- AI: 既存AI Gateway経由の仕組みを優先
- バッチ: 最初はローカル/手動
- 自動更新が必要になったらGitHub ActionsまたはCloud Runを検討

固定費を増やさず、必要になってからバッチ基盤を追加する。
