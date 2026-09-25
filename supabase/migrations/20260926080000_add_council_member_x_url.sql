-- 議員本人の公式X（旧Twitter）アカウント（docs/20260926_0750_P7-3_議員公式HP_Xアカウント拡充_設計.md）。
alter table public.council_members
  add column x_url text;

comment on column public.council_members.x_url is
  '議員本人の公式X（旧Twitter）プロフィールURL。本人サイトからのリンクまたはプロフィールの「新宿区議会議員」明記で本人と確認できたものだけを入れる';

-- council_members の upsert を持つのは11引数版だけ（12・13引数版は
-- p_council_members を素通しする）。シグネチャを変えずに x_url を足す。
create or replace function public.import_production_inventory(
  p_council_sessions jsonb,
  p_tags jsonb,
  p_bills jsonb,
  p_bill_contents jsonb,
  p_bills_tags jsonb,
  p_bill_session_slug text,
  p_factions jsonb,
  p_committees jsonb,
  p_council_members jsonb,
  p_council_member_committees jsonb,
  p_council_roster_key text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Keep the existing five-table importer as the first stage. A failure below
  -- rolls this call back because nested functions share the caller transaction.
  perform public.import_production_inventory(
    p_council_sessions,
    p_tags,
    p_bills,
    p_bill_contents,
    p_bills_tags,
    p_bill_session_slug
  );

  if p_council_roster_key is null or p_council_roster_key = '' then
    raise exception 'council roster key must not be empty';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_factions) as item(name text)
    where item.name is null or item.name = ''
  ) then
    raise exception 'faction name must not be empty';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_committees) as item(name text)
    where item.name is null or item.name = ''
  ) then
    raise exception 'committee name must not be empty';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_council_members) as item(
      name text,
      faction_name text,
      roster_key text
    )
    where item.name is null or item.name = ''
      or item.faction_name is null or item.faction_name = ''
      or item.roster_key is distinct from p_council_roster_key
  ) then
    raise exception 'council member name, faction name, and roster key must be valid';
  end if;

  insert into public.factions as current (
    name,
    display_name,
    alternative_names,
    logo_url,
    sort_order,
    is_active
  )
  select
    item.name,
    item.display_name,
    item.alternative_names,
    item.logo_url,
    item.sort_order,
    item.is_active
  from pg_catalog.jsonb_to_recordset(p_factions) as item(
    name text,
    display_name text,
    alternative_names text[],
    logo_url text,
    sort_order integer,
    is_active boolean
  )
  on conflict (name) do update
  set
    display_name = excluded.display_name,
    alternative_names = excluded.alternative_names,
    logo_url = excluded.logo_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active
  where (
    current.display_name,
    current.alternative_names,
    current.logo_url,
    current.sort_order,
    current.is_active
  ) is distinct from (
    excluded.display_name,
    excluded.alternative_names,
    excluded.logo_url,
    excluded.sort_order,
    excluded.is_active
  );

  insert into public.committees as current (
    name,
    description,
    sort_order,
    is_active
  )
  select item.name, item.description, item.sort_order, item.is_active
  from pg_catalog.jsonb_to_recordset(p_committees) as item(
    name text,
    description text,
    sort_order integer,
    is_active boolean
  )
  on conflict (name) do update
  set
    description = excluded.description,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active
  where (current.description, current.sort_order, current.is_active)
    is distinct from
    (excluded.description, excluded.sort_order, excluded.is_active);

  insert into public.council_members as current (
    name,
    name_kana,
    faction_id,
    faction_role,
    roster_key,
    official_url,
    website_url,
    x_url,
    terms,
    sort_order,
    is_active
  )
  select
    item.name,
    item.name_kana,
    faction.id,
    item.faction_role,
    item.roster_key,
    item.official_url,
    item.website_url,
    item.x_url,
    item.terms,
    item.sort_order,
    item.is_active
  from pg_catalog.jsonb_to_recordset(p_council_members) as item(
    name text,
    name_kana text,
    faction_name text,
    faction_role text,
    roster_key text,
    official_url text,
    website_url text,
    x_url text,
    terms integer,
    sort_order integer,
    is_active boolean
  )
  join public.factions as faction on faction.name = item.faction_name
  on conflict (name) do update
  set
    name_kana = excluded.name_kana,
    faction_id = excluded.faction_id,
    faction_role = excluded.faction_role,
    roster_key = excluded.roster_key,
    official_url = excluded.official_url,
    website_url = excluded.website_url,
    x_url = excluded.x_url,
    terms = excluded.terms,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active
  where (
    current.name_kana,
    current.faction_id,
    current.faction_role,
    current.roster_key,
    current.official_url,
    current.website_url,
    current.x_url,
    current.terms,
    current.sort_order,
    current.is_active
  ) is distinct from (
    excluded.name_kana,
    excluded.faction_id,
    excluded.faction_role,
    excluded.roster_key,
    excluded.official_url,
    excluded.website_url,
    excluded.x_url,
    excluded.terms,
    excluded.sort_order,
    excluded.is_active
  );

  if (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_council_members) as item(name text)
  ) <> (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_council_members) as item(faction_name text)
    join public.factions as faction on faction.name = item.faction_name
  ) then
    raise exception 'one or more council members reference an unknown faction name';
  end if;

  -- Rows from this official roster remain addressable by UUID, but people no
  -- longer present in the current inventory must disappear from public lists.
  update public.council_members as current
  set is_active = false
  where current.roster_key = p_council_roster_key
    and current.is_active
    and not exists (
      select 1
      from pg_catalog.jsonb_to_recordset(p_council_members) as item(name text)
      where item.name = current.name
    );

  if (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_council_member_committees) as item(member_name text)
  ) <> (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_council_member_committees) as item(
      member_name text,
      committee_name text
    )
    join public.council_members as member on member.name = item.member_name
    join public.committees as committee on committee.name = item.committee_name
  ) then
    raise exception 'one or more council-member committee links reference an unknown natural key';
  end if;

  -- Committee assignments describe current membership, so replace obsolete
  -- repository-owned links while preserving councilor and committee rows.
  delete from public.council_member_committees as current
  using public.council_members as member, public.committees as committee
  where current.council_member_id = member.id
    and current.committee_id = committee.id
    and member.roster_key = p_council_roster_key
    and not exists (
      select 1
      from pg_catalog.jsonb_to_recordset(p_council_member_committees) as item(
        member_name text,
        committee_name text
      )
      where item.member_name = member.name
        and item.committee_name = committee.name
    );

  insert into public.council_member_committees as current (
    council_member_id,
    committee_id,
    role
  )
  select member.id, committee.id, item.role
  from pg_catalog.jsonb_to_recordset(p_council_member_committees) as item(
    member_name text,
    committee_name text,
    role text
  )
  join public.council_members as member on member.name = item.member_name
  join public.committees as committee on committee.name = item.committee_name
  on conflict (council_member_id, committee_id) do update
  set role = excluded.role
  where current.role is distinct from excluded.role;

end;
$$;

revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text
) from public;
revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text
) from anon;
revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text
) from authenticated;
grant execute on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text
) to service_role;

comment on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text
) is 'Atomically syncs repository-owned legislative and councilor inventory without deleting primary entities or user data.';
