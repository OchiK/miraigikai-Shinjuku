-- Import bills from multiple council sessions in one atomic call.
--
-- The existing 13-argument importer accepts one p_bill_session_slug and assigns
-- every bill to it. Keep that function for compatibility and add a wrapper that
-- partitions bills and their dependent rows by a per-bill natural-key mapping.
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
  p_faction_stances jsonb,
  p_bill_sessions jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_session_slug text;
  session_bills jsonb;
  session_bill_contents jsonb;
  session_bills_tags jsonb;
  session_faction_stances jsonb;
begin
  if (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_bills) as bill(slug text)
  ) <> (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_bills) as bill(slug text)
    join pg_catalog.jsonb_to_recordset(p_bill_sessions) as link(
      bill_slug text,
      council_session_slug text
    ) on link.bill_slug = bill.slug
    join pg_catalog.jsonb_to_recordset(p_council_sessions) as session(slug text)
      on session.slug = link.council_session_slug
  ) then
    raise exception 'every bill must reference one imported council session slug';
  end if;

  if exists (
    select link.bill_slug
    from pg_catalog.jsonb_to_recordset(p_bill_sessions) as link(
      bill_slug text,
      council_session_slug text
    )
    group by link.bill_slug
    having count(*) <> 1
  ) then
    raise exception 'bill session mapping must contain each bill slug exactly once';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_bill_sessions) as link(
      bill_slug text,
      council_session_slug text
    )
    left join pg_catalog.jsonb_to_recordset(p_bills) as bill(slug text)
      on bill.slug = link.bill_slug
    where bill.slug is null
  ) then
    raise exception 'bill session mapping references an unknown bill slug';
  end if;

  if pg_catalog.jsonb_array_length(p_bills) = 0 then
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
      p_council_member_questions,
      p_faction_stances
    );
    return;
  end if;

  for target_session_slug in
    select distinct link.council_session_slug
    from pg_catalog.jsonb_to_recordset(p_bill_sessions) as link(
      bill_slug text,
      council_session_slug text
    )
    order by link.council_session_slug
  loop
    select coalesce(pg_catalog.jsonb_agg(bill.value), '[]'::jsonb)
    into session_bills
    from pg_catalog.jsonb_array_elements(p_bills) as bill(value)
    join pg_catalog.jsonb_to_recordset(p_bill_sessions) as link(
      bill_slug text,
      council_session_slug text
    ) on link.bill_slug = bill.value ->> 'slug'
    where link.council_session_slug = target_session_slug;

    select coalesce(pg_catalog.jsonb_agg(content.value), '[]'::jsonb)
    into session_bill_contents
    from pg_catalog.jsonb_array_elements(p_bill_contents) as content(value)
    join pg_catalog.jsonb_to_recordset(p_bill_sessions) as link(
      bill_slug text,
      council_session_slug text
    ) on link.bill_slug = content.value ->> 'bill_slug'
    where link.council_session_slug = target_session_slug;

    select coalesce(pg_catalog.jsonb_agg(bill_tag.value), '[]'::jsonb)
    into session_bills_tags
    from pg_catalog.jsonb_array_elements(p_bills_tags) as bill_tag(value)
    join pg_catalog.jsonb_to_recordset(p_bill_sessions) as link(
      bill_slug text,
      council_session_slug text
    ) on link.bill_slug = bill_tag.value ->> 'bill_slug'
    where link.council_session_slug = target_session_slug;

    select coalesce(pg_catalog.jsonb_agg(stance.value), '[]'::jsonb)
    into session_faction_stances
    from pg_catalog.jsonb_array_elements(p_faction_stances) as stance(value)
    join pg_catalog.jsonb_to_recordset(p_bill_sessions) as link(
      bill_slug text,
      council_session_slug text
    ) on link.bill_slug = stance.value ->> 'bill_slug'
    where link.council_session_slug = target_session_slug;

    perform public.import_production_inventory(
      p_council_sessions,
      p_tags,
      session_bills,
      session_bill_contents,
      session_bills_tags,
      target_session_slug,
      p_factions,
      p_committees,
      p_council_members,
      p_council_member_committees,
      p_council_roster_key,
      p_council_member_questions,
      session_faction_stances
    );
  end loop;
end;
$$;

revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb
) from public;
revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb
) from anon;
revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb
) from authenticated;
grant execute on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb
) to service_role;

comment on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb
) is 'Atomically syncs repository-owned inventory and assigns each bill to its mapped council session without deleting primary entities or user data.';
