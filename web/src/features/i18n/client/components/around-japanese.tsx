import type { ReactNode } from "react";
import type { AroundJa } from "../../shared/ui-messages";

type Props = {
  around: AroundJa;
  /** DB のまま出す日本語（会期名・会派名など） */
  children: ReactNode;
};

/**
 * UI 文言の間に DB の日本語を差し込む。英語表示でも日本語部分を lang="ja" で示す。
 */
export function AroundJapanese({ around, children }: Props) {
  return (
    <>
      {around.before}
      <span lang="ja">{children}</span>
      {around.after}
    </>
  );
}
