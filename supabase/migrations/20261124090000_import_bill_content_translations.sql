-- Keep all previous importer overloads callable during deployment.
alter table public.bill_content_translations
  add column imported_snapshot jsonb,
  add constraint bill_content_translations_imported_snapshot_shape check (
    imported_snapshot is null or (
      jsonb_typeof(imported_snapshot) = 'object'
      and jsonb_typeof(imported_snapshot -> 'title') is not distinct from 'string'
      and jsonb_typeof(imported_snapshot -> 'summary') is not distinct from 'string'
      and jsonb_typeof(imported_snapshot -> 'content') is not distinct from 'string'
    )
  );

comment on column public.bill_content_translations.imported_snapshot is
  'Last importer-written translated {title, summary, content}; null protects legacy/Admin rows';

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
  p_bill_sessions jsonb,
  p_bill_content_translations jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  content_id uuid;
  japanese jsonb;
  translated jsonb;
  inserted boolean;
  result_key jsonb;
  created_rows jsonb := '[]'::jsonb;
  updated_rows jsonb := '[]'::jsonb;
begin
  perform public.import_production_inventory(
    p_council_sessions, p_tags, p_bills, p_bill_contents, p_bills_tags,
    p_bill_session_slug, p_factions, p_committees, p_council_members,
    p_council_member_committees, p_council_roster_key,
    p_council_member_questions, p_faction_stances, p_bill_sessions
  );

  if pg_catalog.jsonb_typeof(p_bill_content_translations) is distinct from 'array' then
    raise exception 'bill content translations must be an array';
  end if;
  if exists (
    select 1 from pg_catalog.jsonb_array_elements(p_bill_content_translations) as t(value)
    group by value ->> 'bill_slug', value ->> 'difficulty_level', value ->> 'locale'
    having count(*) > 1
  ) then
    raise exception 'duplicate bill content translation key';
  end if;

  for item in select value from pg_catalog.jsonb_array_elements(p_bill_content_translations)
  loop
    if item ->> 'locale' is distinct from 'en'
       or item ->> 'difficulty_level' is distinct from 'normal' then
      raise exception 'translations require locale en and difficulty normal';
    end if;
    if exists (
      select 1 from (values ('title'), ('summary'), ('content')) as field(name)
      where pg_catalog.jsonb_typeof(item -> field.name) is distinct from 'string'
         or (item ->> field.name) !~ '[^[:space:]]'
    ) then
      raise exception 'translation title, summary and content must not be empty';
    end if;
    if (item ->> 'source_hash') is null
       or (item ->> 'source_hash') !~ '^v[0-9]+:[0-9a-f]{64}$' then
      raise exception 'invalid translation source_hash';
    end if;
    -- Only imported bills are eligible, even if a matching DB slug already exists.
    if not exists (
      select 1 from pg_catalog.jsonb_array_elements(p_bills) as bill(value)
      where bill.value ->> 'slug' = item ->> 'bill_slug'
    ) then
      raise exception 'translation references unknown bill slug';
    end if;
    select c.id, pg_catalog.jsonb_build_object(
      'title', c.title, 'summary', c.summary, 'content', c.content
    ) into content_id, japanese
    from public.bill_contents c
    join public.bills b on b.id = c.bill_id
    where b.slug = item ->> 'bill_slug'
      and c.difficulty_level::text = item ->> 'difficulty_level';
    if not found then
      raise exception 'translation references nonexistent bill content difficulty';
    end if;
    if item -> 'source_snapshot' is distinct from japanese then
      raise exception 'translation source_snapshot does not match imported bill content';
    end if;
    translated := pg_catalog.jsonb_build_object(
      'title', item ->> 'title', 'summary', item ->> 'summary', 'content', item ->> 'content'
    );

    -- ON CONFLICT locks and tests the current row, including concurrent Admin edits.
    insert into public.bill_content_translations as current (
      bill_content_id, locale, title, summary, content, source_hash, source_snapshot,
      model, prompt_version, imported_snapshot, status, translated_at, reviewed_at, reviewed_by
    ) values (
      content_id, 'en', item ->> 'title', item ->> 'summary', item ->> 'content',
      item ->> 'source_hash', item -> 'source_snapshot', item ->> 'model',
      item ->> 'prompt_version', translated, 'generated', now(), null, null
    ) on conflict (bill_content_id, locale) do update set
      title = excluded.title, summary = excluded.summary, content = excluded.content,
      source_hash = excluded.source_hash, source_snapshot = excluded.source_snapshot,
      model = excluded.model, prompt_version = excluded.prompt_version,
      imported_snapshot = excluded.imported_snapshot, status = 'generated',
      translated_at = now(), reviewed_at = null, reviewed_by = null
    where current.status in ('generated', 'stale')
      and current.imported_snapshot = pg_catalog.jsonb_build_object(
        'title', current.title, 'summary', current.summary, 'content', current.content
      )
      and (current.title, current.summary, current.content, current.source_hash,
           current.source_snapshot, current.model, current.prompt_version)
          is distinct from
          (excluded.title, excluded.summary, excluded.content, excluded.source_hash,
           excluded.source_snapshot, excluded.model, excluded.prompt_version)
    returning (xmax = 0) into inserted;

    if found then
      result_key := pg_catalog.jsonb_build_object(
        'bill_slug', item ->> 'bill_slug', 'difficulty_level', 'normal', 'locale', 'en'
      );
      if inserted then
        created_rows := created_rows || pg_catalog.jsonb_build_array(result_key);
      else
        updated_rows := updated_rows || pg_catalog.jsonb_build_array(result_key);
      end if;
    end if;
  end loop;
  return pg_catalog.jsonb_build_object('translations', pg_catalog.jsonb_build_object(
    'created', created_rows, 'updated', updated_rows
  ));
end;
$$;

revoke all on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text,
  jsonb, jsonb, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.import_production_inventory(
  jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, jsonb, jsonb, jsonb, text,
  jsonb, jsonb, jsonb, jsonb
) to service_role;
