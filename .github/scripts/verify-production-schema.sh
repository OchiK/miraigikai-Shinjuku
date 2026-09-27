#!/usr/bin/env bash

set -euo pipefail

: "${PGHOST:?PGHOST is required}"
: "${PGPORT:?PGPORT is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGDATABASE:=postgres}"
: "${PGPASSWORD:?PGPASSWORD is required}"

psql_command=(
  psql
  --no-psqlrc
  --set ON_ERROR_STOP=1
  --host "$PGHOST"
  --port "$PGPORT"
  --username "$PGUSER"
  --dbname "$PGDATABASE"
)

temporary_directory="$(mktemp -d)"
trap 'rm -rf "$temporary_directory"' EXIT

local_migrations="$temporary_directory/local-migrations.txt"
remote_migrations="$temporary_directory/remote-migrations.txt"

find supabase/migrations -maxdepth 1 -type f -name '*.sql' \
  -exec basename {} \; \
  | cut -d_ -f1 \
  | sort > "$local_migrations"

"${psql_command[@]}" --tuples-only --no-align \
  --command "select version from supabase_migrations.schema_migrations order by version;" \
  | sed '/^[[:space:]]*$/d' > "$remote_migrations"

echo "Production DB schema verification"
echo "verified_at_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "repository_sha=${GITHUB_SHA:-local}"
echo
echo "[migration_history]"
echo "query=select version from supabase_migrations.schema_migrations order by version;"
echo "local_count=$(wc -l < "$local_migrations" | tr -d ' ')"
echo "remote_count=$(wc -l < "$remote_migrations" | tr -d ' ')"

if diff -u "$local_migrations" "$remote_migrations"; then
  echo "result=PASS (local and production migration versions match)"
else
  echo "result=FAIL (local and production migration versions differ)"
  exit 1
fi

"${psql_command[@]}" <<'SQL'
\pset pager off
\a
\t

\echo
\echo [required_indexes]
\echo query=select indexname, indexdef from pg_indexes where schemaname = 'public' and tablename = 'bills' and indexname in ('bills_session_bill_number_unique', 'bills_unassigned_bill_number_unique', 'idx_bills_bill_number_order') order by indexname;
select indexname || E'\t' || indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'bills'
  and indexname in (
    'bills_session_bill_number_unique',
    'bills_unassigned_bill_number_unique',
    'idx_bills_bill_number_order'
  )
order by indexname;

\echo
\echo [required_columns]
\echo query=select column_name, data_type, is_nullable, is_generated, generation_expression from information_schema.columns where table_schema = 'public' and table_name = 'bills' and column_name in ('bill_number_order', 'pdf_url', 'overview_pdf_url', 'source_page_url', 'decision_source_url') order by column_name;
select concat_ws(
  E'\t',
  column_name,
  data_type,
  is_nullable,
  is_generated,
  coalesce(generation_expression, '')
)
from information_schema.columns
where table_schema = 'public'
  and table_name = 'bills'
  and column_name in (
    'bill_number_order',
    'pdf_url',
    'overview_pdf_url',
    'source_page_url',
    'decision_source_url'
  )
order by column_name;

\echo
\echo [duplicate_session_bill_numbers]
\echo query=select council_session_id, bill_number, count(*) from public.bills where council_session_id is not null and bill_number != '' group by council_session_id, bill_number having count(*) > 1;
select concat_ws(E'\t', council_session_id, bill_number, count(*))
from public.bills
where council_session_id is not null
  and bill_number != ''
group by council_session_id, bill_number
having count(*) > 1;

\echo
\echo [assertions]
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'bills'
      and indexname = 'bills_session_bill_number_unique'
      and indexdef like 'CREATE UNIQUE INDEX%'
      and indexdef like '%(council_session_id, bill_number)%'
      and indexdef like '%WHERE ((council_session_id IS NOT NULL) AND (bill_number <>%'
  ) then
    raise exception 'required session-scoped bill number unique index is missing or has an unexpected definition';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'bills'
      and column_name = 'bill_number_order'
      and data_type = 'integer'
      and is_generated = 'ALWAYS'
  ) then
    raise exception 'required generated column bills.bill_number_order is missing or has an unexpected definition';
  end if;

  if (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'bills'
      and data_type = 'text'
      and column_name in (
        'pdf_url',
        'overview_pdf_url',
        'source_page_url',
        'decision_source_url'
      )
  ) <> 4 then
    raise exception 'one or more required bills source URL columns are missing or not text';
  end if;

  if exists (
    select 1
    from public.bills
    where council_session_id is not null
      and bill_number != ''
    group by council_session_id, bill_number
    having count(*) > 1
  ) then
    raise exception 'duplicate session-scoped bill numbers exist';
  end if;
end
$$;
\echo result=PASS (required indexes and columns exist; no duplicate session-scoped bill numbers)
SQL
