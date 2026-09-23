-- 翻訳元の日本語のスナップショット（TR-4: 原文差分表示）。
-- 設計: docs/20260923_1500_多言語基盤_ロケール方式の決定記録.md
--
-- source_hash は翻訳元の日本語のハッシュしか持たないため、日本語が改定されても
-- 「どこが変わったか」は分からない。source_hash を記録するときに、その元になった
-- 日本語（title / summary / content）も一緒に残し、管理画面で改定前後の差分を出す。
--
-- 既存行は null のまま（記録前の翻訳）。管理画面では、スナップショットから
-- 計算したハッシュが source_hash と一致するときだけ差分を表示する。
alter table public.bill_content_translations
  add column source_snapshot jsonb,
  add constraint bill_content_translations_source_snapshot_shape check (
    -- キーが欠けると jsonb_typeof は null を返し、CHECK は null を「通過」扱いにする。
    -- is not distinct from で null を false として扱う
    source_snapshot is null or (
      jsonb_typeof(source_snapshot) = 'object'
      and jsonb_typeof(source_snapshot -> 'title') is not distinct from 'string'
      and jsonb_typeof(source_snapshot -> 'summary') is not distinct from 'string'
      and jsonb_typeof(source_snapshot -> 'content') is not distinct from 'string'
    )
  );

comment on column public.bill_content_translations.source_snapshot is 'source_hash を計算した時点の日本語 {title, summary, content}。原文差分の表示用。null は記録前の翻訳';
