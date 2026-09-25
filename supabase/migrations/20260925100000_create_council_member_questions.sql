-- 議員の質問・発言の要約（Phase 7-B）。
-- 設計: docs/20260923_1630_議員ページ要件定義_世田谷モデル.md
--
-- 1行は「議員1人の、ある日の質問のうち1つの論点」。出典は区議会の会議録検索システム。
-- サイトに会期ページがない過去の定例会の質問も載せるため、会期名は session_name に持つ。
-- title は議員が質問で示した論点の見出し、summary はAIが会議録の質問部分から作成した要約。
create table public.council_member_questions (
  id uuid primary key default gen_random_uuid(),
  council_member_id uuid not null references public.council_members(id) on delete cascade,
  -- サイトの会期ページがある会期だけ紐づける（過去の定例会は null）
  council_session_id uuid references public.council_sessions(id) on delete set null,
  session_name text not null,
  -- 関連議案。議案詳細から質問した議員へ相互リンクする Phase 7-C で使う（現状の seed では null）
  bill_id uuid references public.bills(id) on delete set null,
  committee_id uuid references public.committees(id) on delete set null,
  venue_type text not null check (venue_type in ('plenary', 'budget', 'committee')),
  question_kind text check (question_kind in ('representative', 'general')),
  title text not null,
  summary text not null,
  topic_tags text[] not null default '{}',
  speech_date date not null,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 議員詳細は「議員で絞って発言日の新しい順」に読むため複合インデックスにする
create index idx_council_member_questions_member_speech_date on public.council_member_questions (council_member_id, speech_date desc);
create index idx_council_member_questions_session_id on public.council_member_questions (council_session_id);

create trigger set_council_member_questions_updated_at
  before update on public.council_member_questions
  for each row execute function update_updated_at_column();

alter table public.council_member_questions enable row level security;

comment on table public.council_member_questions is '議員の質問・発言の要約。出典は区議会の会議録';
comment on column public.council_member_questions.session_name is '会議録上の会期名（例: 令和8年 第2回定例会）';
comment on column public.council_member_questions.venue_type is '発言の場（plenary=本会議 / budget=予算・決算特別委員会 / committee=委員会）';
comment on column public.council_member_questions.question_kind is '本会議での質問の種別（representative=代表質問 / general=一般質問）。委員会では null';
comment on column public.council_member_questions.title is '論点の見出し（議員が質問で示した項目名に沿う）';
comment on column public.council_member_questions.summary is 'AIが会議録の質問部分から作成した要約';
comment on column public.council_member_questions.topic_tags is 'テーマタグ（関心テーマの集計に使う）';
comment on column public.council_member_questions.speech_date is '発言日';
comment on column public.council_member_questions.source_url is '会議録検索システムの該当発言へのURL';
