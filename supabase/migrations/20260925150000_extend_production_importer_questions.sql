-- Extend the atomic production importer with councilor question summaries (Phase 7-B).
-- A question is identified by (councilor, minutes URL): the URL points at one speech
-- in the official minutes. Each topic row in the seed comes from its own speech, so a
-- future seed must not store two topics from the same speech for one councilor; this
-- constraint would reject it.
alter table public.council_member_questions
  add constraint council_member_questions_member_source_url_key
  unique (council_member_id, source_url);

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
  p_council_member_questions jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Councilors must exist before their questions. A failure below rolls this
  -- call back because nested functions share the caller transaction.
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
    p_council_roster_key
  );

  if exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_council_member_questions) as item(
      member_name text,
      source_url text,
      session_name text,
      title text,
      summary text
    )
    where item.member_name is null or item.member_name = ''
      or item.source_url is null or item.source_url = ''
      or item.session_name is null or item.session_name = ''
      or item.title is null or item.title = ''
      or item.summary is null or item.summary = ''
  ) then
    raise exception 'council member question member name, source url, session name, title, and summary must not be empty';
  end if;

  if (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_council_member_questions) as item(member_name text)
  ) <> (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_council_member_questions) as item(member_name text)
    join public.council_members as member on member.name = item.member_name
  ) then
    raise exception 'one or more council member questions reference an unknown council member name';
  end if;

  -- Earlier sessions have no session page, so session_slug may be null. A
  -- non-null slug must resolve, otherwise the question would silently lose its link.
  if exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_council_member_questions) as item(session_slug text)
    where item.session_slug is not null
      and not exists (
        select 1 from public.council_sessions as session
        where session.slug = item.session_slug
      )
  ) then
    raise exception 'one or more council member questions reference an unknown council session slug';
  end if;

  -- Questions are upserted only. Rows removed from the inventory are reported
  -- by the CLI and left in place, like other repository-owned primary content.
  insert into public.council_member_questions as current (
    council_member_id,
    council_session_id,
    session_name,
    venue_type,
    question_kind,
    title,
    summary,
    topic_tags,
    speech_date,
    source_url
  )
  select
    member.id,
    session.id,
    item.session_name,
    item.venue_type,
    item.question_kind,
    item.title,
    item.summary,
    item.topic_tags,
    item.speech_date,
    item.source_url
  from pg_catalog.jsonb_to_recordset(p_council_member_questions) as item(
    member_name text,
    session_slug text,
    session_name text,
    venue_type text,
    question_kind text,
    title text,
    summary text,
    topic_tags text[],
    speech_date date,
    source_url text
  )
  join public.council_members as member on member.name = item.member_name
  left join public.council_sessions as session on session.slug = item.session_slug
  on conflict (council_member_id, source_url) do update
  set
    council_session_id = excluded.council_session_id,
    session_name = excluded.session_name,
    venue_type = excluded.venue_type,
    question_kind = excluded.question_kind,
    title = excluded.title,
    summary = excluded.summary,
    topic_tags = excluded.topic_tags,
    speech_date = excluded.speech_date
  where (
    current.council_session_id,
    current.session_name,
    current.venue_type,
    current.question_kind,
    current.title,
    current.summary,
    current.topic_tags,
    current.speech_date
  ) is distinct from (
    excluded.council_session_id,
    excluded.session_name,
    excluded.venue_type,
    excluded.question_kind,
    excluded.title,
    excluded.summary,
    excluded.topic_tags,
    excluded.speech_date
  );
end;
$$;

revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb
) from public;
revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb
) from anon;
revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb
) from authenticated;
grant execute on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb
) to service_role;

comment on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text, jsonb
) is 'Atomically syncs repository-owned legislative, councilor, and councilor-question inventory without deleting primary entities or user data.';
