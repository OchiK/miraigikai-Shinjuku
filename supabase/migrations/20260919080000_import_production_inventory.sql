-- Apply the repository-owned production inventory in one transaction.
-- The function accepts natural keys for child rows, resolves UUIDs inside the
-- database, and never deletes rows that are absent from the inventory.
create or replace function public.import_production_inventory(
  p_council_sessions jsonb,
  p_tags jsonb,
  p_bills jsonb,
  p_bill_contents jsonb,
  p_bills_tags jsonb,
  p_bill_session_slug text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_session_id uuid;
begin
  if p_bill_session_slug is null or p_bill_session_slug = '' then
    raise exception 'bill session slug must not be empty';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_council_sessions) as item(slug text)
    where item.slug is null or item.slug = ''
  ) then
    raise exception 'council session slug must not be empty';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_bills) as item(slug text)
    where item.slug is null or item.slug = ''
  ) then
    raise exception 'bill slug must not be empty';
  end if;

  insert into public.council_sessions as current (
    name,
    slug,
    council_url,
    start_date,
    end_date,
    is_active
  )
  select
    item.name,
    item.slug,
    item.council_url,
    item.start_date,
    item.end_date,
    item.is_active
  from pg_catalog.jsonb_to_recordset(p_council_sessions) as item(
    name text,
    slug text,
    council_url text,
    start_date date,
    end_date date,
    is_active boolean
  )
  on conflict (slug) do update
  set
    name = excluded.name,
    council_url = excluded.council_url,
    start_date = excluded.start_date,
    end_date = excluded.end_date,
    is_active = excluded.is_active
  where (current.name, current.council_url, current.start_date, current.end_date, current.is_active)
    is distinct from
    (excluded.name, excluded.council_url, excluded.start_date, excluded.end_date, excluded.is_active);

  select id
  into target_session_id
  from public.council_sessions
  where slug = p_bill_session_slug;

  if target_session_id is null then
    raise exception 'council session not found: %', p_bill_session_slug;
  end if;

  insert into public.tags as current (label, description, featured_priority)
  select item.label, item.description, item.featured_priority
  from pg_catalog.jsonb_to_recordset(p_tags) as item(
    label text,
    description text,
    featured_priority integer
  )
  on conflict (label) do update
  set
    description = excluded.description,
    featured_priority = excluded.featured_priority
  where (current.description, current.featured_priority)
    is distinct from
    (excluded.description, excluded.featured_priority);

  insert into public.bills as current (
    name,
    bill_number,
    slug,
    status,
    status_note,
    publish_status,
    published_at,
    is_featured,
    is_review_completed,
    thumbnail_url,
    pdf_url,
    overview_pdf_url,
    source_page_url,
    decision_source_url,
    council_session_id
  )
  select
    item.name,
    item.bill_number,
    item.slug,
    item.status,
    item.status_note,
    item.publish_status,
    item.published_at,
    item.is_featured,
    item.is_review_completed,
    item.thumbnail_url,
    item.pdf_url,
    item.overview_pdf_url,
    item.source_page_url,
    item.decision_source_url,
    target_session_id
  from pg_catalog.jsonb_to_recordset(p_bills) as item(
    name text,
    bill_number text,
    slug text,
    status public.bill_status_enum,
    status_note text,
    publish_status public.bill_publish_status,
    published_at timestamptz,
    is_featured boolean,
    is_review_completed boolean,
    thumbnail_url text,
    pdf_url text,
    overview_pdf_url text,
    source_page_url text,
    decision_source_url text
  )
  on conflict (slug) do update
  set
    name = excluded.name,
    bill_number = excluded.bill_number,
    status = excluded.status,
    status_note = excluded.status_note,
    publish_status = excluded.publish_status,
    published_at = excluded.published_at,
    is_featured = excluded.is_featured,
    is_review_completed = excluded.is_review_completed,
    thumbnail_url = excluded.thumbnail_url,
    pdf_url = excluded.pdf_url,
    overview_pdf_url = excluded.overview_pdf_url,
    source_page_url = excluded.source_page_url,
    decision_source_url = excluded.decision_source_url,
    council_session_id = excluded.council_session_id
  where (
    current.name,
    current.bill_number,
    current.status,
    current.status_note,
    current.publish_status,
    current.published_at,
    current.is_featured,
    current.is_review_completed,
    current.thumbnail_url,
    current.pdf_url,
    current.overview_pdf_url,
    current.source_page_url,
    current.decision_source_url,
    current.council_session_id
  ) is distinct from (
    excluded.name,
    excluded.bill_number,
    excluded.status,
    excluded.status_note,
    excluded.publish_status,
    excluded.published_at,
    excluded.is_featured,
    excluded.is_review_completed,
    excluded.thumbnail_url,
    excluded.pdf_url,
    excluded.overview_pdf_url,
    excluded.source_page_url,
    excluded.decision_source_url,
    excluded.council_session_id
  );

  insert into public.bill_contents as current (
    bill_id,
    difficulty_level,
    title,
    summary,
    content
  )
  select bill.id, item.difficulty_level, item.title, item.summary, item.content
  from pg_catalog.jsonb_to_recordset(p_bill_contents) as item(
    bill_slug text,
    difficulty_level public.difficulty_level_enum,
    title text,
    summary text,
    content text
  )
  join public.bills as bill on bill.slug = item.bill_slug
  on conflict (bill_id, difficulty_level) do update
  set
    title = excluded.title,
    summary = excluded.summary,
    content = excluded.content
  where (current.title, current.summary, current.content)
    is distinct from
    (excluded.title, excluded.summary, excluded.content);

  if (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_bill_contents) as item(bill_slug text)
  ) <> (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_bill_contents) as item(bill_slug text)
    join public.bills as bill on bill.slug = item.bill_slug
  ) then
    raise exception 'one or more bill contents reference an unknown bill slug';
  end if;

  insert into public.bills_tags (bill_id, tag_id)
  select bill.id, tag.id
  from pg_catalog.jsonb_to_recordset(p_bills_tags) as item(
    bill_slug text,
    tag_label text
  )
  join public.bills as bill on bill.slug = item.bill_slug
  join public.tags as tag on tag.label = item.tag_label
  on conflict (bill_id, tag_id) do nothing;

  if (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_bills_tags) as item(bill_slug text, tag_label text)
  ) <> (
    select count(*)
    from pg_catalog.jsonb_to_recordset(p_bills_tags) as item(bill_slug text, tag_label text)
    join public.bills as bill on bill.slug = item.bill_slug
    join public.tags as tag on tag.label = item.tag_label
  ) then
    raise exception 'one or more bill-tag links reference an unknown natural key';
  end if;
end;
$$;

revoke all on function public.import_production_inventory(jsonb, jsonb, jsonb, jsonb, jsonb, text) from public;
revoke all on function public.import_production_inventory(jsonb, jsonb, jsonb, jsonb, jsonb, text) from anon;
revoke all on function public.import_production_inventory(jsonb, jsonb, jsonb, jsonb, jsonb, text) from authenticated;
grant execute on function public.import_production_inventory(jsonb, jsonb, jsonb, jsonb, jsonb, text) to service_role;

comment on function public.import_production_inventory(jsonb, jsonb, jsonb, jsonb, jsonb, text)
is 'Atomically upserts repository-owned production inventory without deleting extraneous or user data.';
