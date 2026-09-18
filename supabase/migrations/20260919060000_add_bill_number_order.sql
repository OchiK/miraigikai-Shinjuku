-- bills の一覧表示を議案番号順に固定するための generated column。
--
-- これまで一覧は (status_order, published_at desc) だけで並べていた。
-- 同一会期の議案は published_at が全件同一（会期末日）になるため、
-- 同順位のときの並びが Postgres の物理行順に委ねられ、
-- 第44号議案の次に第56号議案が出るなど、番号順にならない状態だった。
-- LIMIT 付きのクエリ（findPreviousSessionBills）では取得対象そのものが不定になる。
--
-- bill_number（例:「第42号議案」「承認第2号」）から番号を取り出して並べる。
-- 文字列としての昇順では「第10号議案」＜「第2号議案」となり番号順にならないため、
-- 数値へ変換した列を持たせる。
--
-- 式の中身は3点。
-- 1. translate() で全角数字を半角に寄せる。bill_number は Admin で自由入力でき、
--    行政文書の表記をそのまま「第４２号議案」と入れる余地がある。
--    変換しないと有効な番号が「数字なし」と同じ扱いで末尾へ飛ぶ。
-- 2. 先頭の数字の並びだけを見る（'[0-9]+' の最初の一致）。文字列中の数字を
--    全部つなげると「第42号議案の2」が 422 になり、番号以外の数字が順序に混ざる。
-- 3. 7桁以上は 2147483646、数字なしは 2147483647 に送る。int の範囲を超えると
--    INSERT 自体が落ちるため上限が要る。桁で切り詰めると「第1000000号」が
--    100000 になって「第200000号」より前に出てしまうので、切らずに末尾へ回す。
ALTER TABLE bills ADD COLUMN bill_number_order INT GENERATED ALWAYS AS (
  CASE
    WHEN substring(translate(bill_number, '０１２３４５６７８９', '0123456789') FROM '[0-9]+') IS NULL
      THEN 2147483647
    WHEN length(substring(translate(bill_number, '０１２３４５６７８９', '0123456789') FROM '[0-9]+')) > 6
      THEN 2147483646
    ELSE substring(translate(bill_number, '０１２３４５６７８９', '0123456789') FROM '[0-9]+')::INT
  END
) STORED;

COMMENT ON COLUMN bills.bill_number_order IS 'bill_number の先頭の番号。一覧の並び順を議案番号順に固定するために使う（7桁以上と数字を含まない場合は末尾）';

CREATE INDEX idx_bills_bill_number_order ON bills(bill_number_order);
