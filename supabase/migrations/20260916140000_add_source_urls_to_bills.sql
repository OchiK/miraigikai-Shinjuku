-- 議案ごとに公式出典を辿れるようにするためのカラム追加。
--
-- 既存の pdf_url（全文PDF）だけでは、
--   * どの「提出案件概要」PDFに載っている案件か
--   * どの一覧ページから取得した案件か
--   * 議決結果をどのページで確認したか
-- を保持できず、Phase 1 の受入条件「each derived content can trace back to source」
-- を満たせないため、出典URLを議案単位で保持する。

alter table bills
  add column overview_pdf_url text,
  add column source_page_url text,
  add column decision_source_url text;

comment on column bills.overview_pdf_url is
  '当該議案を収録した公式「提出案件概要」PDFのURL';
comment on column bills.source_page_url is
  '当該議案を掲載している公式の提出議案一覧ページのURL';
comment on column bills.decision_source_url is
  '当該議案の議決結果を掲載している公式ページのURL';
