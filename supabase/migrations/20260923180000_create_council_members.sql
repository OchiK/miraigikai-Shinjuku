-- 区議会議員の名簿（Phase 7-A）。
-- 設計: docs/20260923_1630_議員ページ要件定義_世田谷モデル.md
--
-- 氏名・会派・委員会は新宿区議会の公式名簿・会派構成・委員会名簿を出典とする。
-- 顔写真は扱わない（肖像権への配慮）。住所・電話番号・メールアドレスも持たない。
create table public.council_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_kana text not null,
  faction_id uuid references public.factions(id) on delete set null,
  faction_role text,
  official_url text,
  website_url text,
  terms integer check (terms >= 1),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_council_members_faction_id on public.council_members(faction_id);

create trigger set_council_members_updated_at
  before update on public.council_members
  for each row execute function update_updated_at_column();

alter table public.council_members enable row level security;

comment on table public.council_members is '区議会議員の名簿。出典は区議会公式の議員名簿・会派構成';
comment on column public.council_members.name is '氏名（公式名簿の表記。ひらがな混じりの場合もそのまま）';
comment on column public.council_members.name_kana is '氏名のふりがな';
comment on column public.council_members.faction_role is '会派内の役職（幹事長・団長・会計など）';
comment on column public.council_members.official_url is '区議会公式の議員名簿ページURL';
comment on column public.council_members.website_url is '公式名簿に掲載された議員本人のウェブサイトURL';
comment on column public.council_members.terms is '当選回数（期数）';
comment on column public.council_members.sort_order is '表示順（公式名簿の議席番号順）';

create table public.council_member_committees (
  id uuid primary key default gen_random_uuid(),
  council_member_id uuid not null references public.council_members(id) on delete cascade,
  committee_id uuid not null references public.committees(id) on delete cascade,
  role text not null default '委員' check (role in ('委員長', '副委員長', '委員')),
  created_at timestamptz not null default now(),
  constraint council_member_committees_member_committee_key unique (council_member_id, committee_id)
);

create index idx_council_member_committees_committee_id on public.council_member_committees(committee_id);

alter table public.council_member_committees enable row level security;

comment on table public.council_member_committees is '議員の委員会所属。出典は区議会公式の委員会名簿';
comment on column public.council_member_committees.role is '委員会内の役職（委員長・副委員長・委員）';
