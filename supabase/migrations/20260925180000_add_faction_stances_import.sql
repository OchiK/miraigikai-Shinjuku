-- Faction stances from 新宿区議会だより (docs/20260925_1330_会派賛否データ投入計画.md).
--
-- faction_name_at_vote keeps the faction's name as printed in the source on the
-- vote date. Factions get renamed (れいわ新選組 新宿 became いのちの党 新宿 on
-- 2026-08-07), and the page shows the vote-time name next to the current one.
alter table public.faction_stances
  add column faction_name_at_vote text;

comment on column public.faction_stances.faction_name_at_vote is
  'Faction name as printed in the source on the vote date. Null for stances entered without a source (e.g. admin AI collection).';

-- Extend the atomic production importer with faction stances. A stance is
-- identified by (bill slug, faction name), matching unique (bill_id, faction_id).
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
  p_council_roster_key text,
  p_council_member_questions jsonb,
  p_faction_stances jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Bills and factions must exist before their stances. A failure below rolls
  -- this call back because nested functions share the caller transaction.
  perform public.import_production_inventory(
    p_council_sessions,
    p_tags,
    p_bills,
    p_bill_contents,
    p_bills_tags,
    p_bill_session_slug,
    p_factions,
    p_committees,
    p_council_members,
    p_council_member_committees,
    p_council_roster_key,
    p_council_member_questions
  );

  if exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_faction_stances) as item(
      bill_slug text,
      faction_name text,
      type text,
      faction_name_at_vote text
    )
    where item.bill_slug is null or item.bill_slug = ''
      or item.faction_name is null or item.faction_name = ''
      or item.type is null or item.type = ''
      or item.faction_name_at_vote is null or item.faction_name_at_vote = ''
  ) then
    raise exception 'faction stance bill slug, faction name, type, and faction name at vote must not be empty';
  end if;

  if (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_faction_stances) as item(bill_slug text)
  ) <> (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_faction_stances) as item(
      bill_slug text,
      faction_name text
    )
    join public.bills as bill on bill.slug = item.bill_slug
    join public.factions as faction on faction.name = item.faction_name
  ) then
    raise exception 'one or more faction stances reference an unknown bill slug or faction name';
  end if;

  -- Stances are upserted only; comment is left alone because admin's AI
  -- collection owns it. Rows missing from the inventory are reported by the CLI.
  insert into public.faction_stances as current (
    bill_id,
    faction_id,
    type,
    faction_name_at_vote
  )
  select
    bill.id,
    faction.id,
    item.type::public.stance_type_enum,
    item.faction_name_at_vote
  from pg_catalog.jsonb_to_recordset(p_faction_stances) as item(
    bill_slug text,
    faction_name text,
    type text,
    faction_name_at_vote text
  )
  join public.bills as bill on bill.slug = item.bill_slug
  join public.factions as faction on faction.name = item.faction_name
  on conflict (bill_id, faction_id) do update
  set
    type = excluded.type,
    faction_name_at_vote = excluded.faction_name_at_vote
  where (current.type, current.faction_name_at_vote)
    is distinct from (excluded.type, excluded.faction_name_at_vote);
end;
$$;

revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb
) from public;
revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb
) from anon;
revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb
) from authenticated;
grant execute on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb
) to service_role;

comment on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb
) is 'Atomically syncs repository-owned legislative, councilor, councilor-question, and faction-stance inventory without deleting primary entities or user data.';
