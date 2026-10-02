/**
 * ヘッダーのセグメント型ボタン（LanguageToggle / DifficultySelector /
 * RubyToggle の pill）で共有する配色。WCAG 2.2 AA を満たす組み合わせは
 * segment-control-styles.test.ts が globals.css を読んで検証する（docs/BACKLOG.md P2-4）。
 */

/** セグメントの地。選択中の塗り（primary）と 3:1 以上を保つため neutral-100 */
export const SEGMENT_TRACK_CLASS = "rounded-full bg-neutral-100 p-0.5 md:p-1";

/**
 * 選択中。選択済みの項目を押しても何も起きないので、ホバーでも塗りを変えない。
 * hover:text-mirai-text は ghost の hover:text-accent-foreground を打ち消すため必要
 */
export const SEGMENT_SELECTED_CLASS =
  "bg-primary text-mirai-text shadow-mirai-sm hover:bg-primary hover:text-mirai-text";

export const SEGMENT_UNSELECTED_CLASS =
  "text-mirai-text-secondary hover:bg-neutral-300 hover:text-mirai-text";

export function segmentItemClass(isSelected: boolean): string {
  return isSelected ? SEGMENT_SELECTED_CLASS : SEGMENT_UNSELECTED_CLASS;
}
