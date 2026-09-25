-- 議員提出議案を、同じ会期の区長提出議案のあとに並べる。
--
-- bill_number_order は bill_number の先頭の番号を取り出すため、
-- 「議員提出議案第7号」は 7 になり、「承認第3号」(3) と「第42号議案」(42) の
-- あいだに割り込んでしまう。公式の一覧（議会の会期ページ・「議案の概要と審議結果」）は
-- 区長提出議案のあとに議員提出議案を載せているので、それに合わせる。
--
-- 議員提出議案には 1000000 を足す。番号は6桁以下に限っているので、
-- 区長提出議案（0〜999999）と重ならず、末尾送りの値（2147483646・2147483647）より前に収まる。
-- 番号の取り出し方と末尾送りの規則は 20260919060000_add_bill_number_order.sql と同じ。
-- generated column の式は変更できないため、列を作り直す（インデックスも一緒に消えるので作り直す）。
DROP INDEX IF EXISTS idx_bills_bill_number_order;
ALTER TABLE bills DROP COLUMN bill_number_order;

ALTER TABLE bills ADD COLUMN bill_number_order INT GENERATED ALWAYS AS (
  CASE
    WHEN substring(translate(bill_number, '０１２３４５６７８９', '0123456789') FROM '[0-9]+') IS NULL
      THEN 2147483647
    WHEN length(substring(translate(bill_number, '０１２３４５６７８９', '0123456789') FROM '[0-9]+')) > 6
      THEN 2147483646
    ELSE
      CASE WHEN bill_number LIKE '議員提出%' THEN 1000000 ELSE 0 END
      + substring(translate(bill_number, '０１２３４５６７８９', '0123456789') FROM '[0-9]+')::INT
  END
) STORED;

COMMENT ON COLUMN bills.bill_number_order IS 'bill_number の先頭の番号。一覧の並び順を議案番号順に固定するために使う。議員提出議案は区長提出議案のあとに並べるため 1000000 を足す（7桁以上と数字を含まない場合は末尾）';

CREATE INDEX idx_bills_bill_number_order ON bills(bill_number_order);
