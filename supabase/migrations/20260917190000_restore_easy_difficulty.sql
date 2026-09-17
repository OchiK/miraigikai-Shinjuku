-- 難易度 'easy'（やさしい日本語）を difficulty_level_enum に戻す。
-- 20250928180000_remove_easy_difficulty.sql で削除したものを、
-- デザインシステム定義 §3・§6 の3段階（easy / normal / hard）に合わせて復活させる。
--
-- ADD VALUE は既存の型に値を足すだけなのでテーブルの書き換えは発生しない。
-- 並び順が easy → normal → hard になるよう BEFORE で位置を指定する。
ALTER TYPE difficulty_level_enum ADD VALUE IF NOT EXISTS 'easy' BEFORE 'normal';

COMMENT ON COLUMN bill_contents.difficulty_level IS '難易度レベル（easy:やさしい, normal:ふつう, hard:くわしく）';
