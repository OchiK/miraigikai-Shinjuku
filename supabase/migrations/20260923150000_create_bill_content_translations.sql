-- 議案コンテンツの翻訳（Phase 3 / Step 7B）。
-- 設計: docs/I18N_AND_EASY_JAPANESE.md, docs/20260923_1500_多言語基盤_ロケール方式の決定記録.md
--
-- 日本語の bill_contents が正本で、翻訳は派生物。1つの bill_contents 行に
-- ロケールごと1件だけ持つ。source_hash は翻訳元の日本語から
-- packages/shared/src/i18n/source-hash.ts で計算した値で、読み出し時にも
-- 現在の日本語と照合する（status の更新漏れがあっても古い翻訳を出さない）。
create table public.bill_content_translations (
  id uuid primary key default gen_random_uuid(),
  bill_content_id uuid not null references public.bill_contents(id) on delete cascade,
  locale text not null check (locale in ('en', 'zh-Hans', 'ko', 'ne', 'my', 'vi')),
  title text not null,
  summary text not null,
  content text not null,
  source_hash text not null check (source_hash ~ '^v[0-9]+:[0-9a-f]{64}$'),
  status text not null default 'generated' check (status in ('generated', 'reviewed', 'stale')),
  model text,
  prompt_version text,
  translated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bill_content_translations_content_locale_key unique (bill_content_id, locale),
  constraint bill_content_translations_reviewed_has_timestamp check (
    status <> 'reviewed' or reviewed_at is not null
  )
);

create trigger update_bill_content_translations_updated_at
  before update on public.bill_content_translations
  for each row execute function update_updated_at_column();

alter table public.bill_content_translations enable row level security;

comment on table public.bill_content_translations is '議案コンテンツ（bill_contents）の翻訳。日本語が正本で、翻訳は参考情報';
comment on column public.bill_content_translations.locale is '翻訳先ロケール。ja は正本なので持たない';
comment on column public.bill_content_translations.source_hash is '翻訳元の日本語の正規化ハッシュ（v1:<sha256>）。現在の日本語と一致しなければ公開しない';
comment on column public.bill_content_translations.status is 'generated: 生成直後 / reviewed: 人が確認済み（公開対象） / stale: 日本語が変わり再翻訳待ち';
comment on column public.bill_content_translations.reviewed_by is '確認した人（admin のメールアドレスなど）';
