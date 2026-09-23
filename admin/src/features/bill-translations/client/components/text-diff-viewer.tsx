"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SourceSnapshot } from "../../shared/utils/source-snapshot";
import {
  collapseUnchangedLines,
  type DiffLine,
  diffLines,
  hasDiff,
} from "../../shared/utils/text-diff";

const LINE_MARKS: Record<DiffLine["type"], { mark: string; label: string }> = {
  added: { mark: "+", label: "追加：" },
  removed: { mark: "−", label: "削除：" },
  same: { mark: "", label: "" },
};

const FIELDS: { key: keyof SourceSnapshot; label: string }[] = [
  { key: "title", label: "タイトル" },
  { key: "summary", label: "要約" },
  { key: "content", label: "本文（Markdown）" },
];

interface TextDiffViewerProps {
  /** 翻訳した時点の日本語 */
  before: SourceSnapshot;
  /** 現在の日本語 */
  after: SourceSnapshot;
}

/**
 * 翻訳した後に日本語の原文がどう変わったかを行単位で示す。
 * 追加・削除は色だけで区別しないよう、行頭に＋／−を付ける。
 */
export function TextDiffViewer({ before, after }: TextDiffViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        原文の変更箇所を{isOpen ? "閉じる" : "表示"}
      </Button>

      {isOpen && <ChangedFields before={before} after={after} />}
    </div>
  );
}

/** 開いたときだけ差分を計算する（LCS は本文の行数の2乗かかるため） */
function ChangedFields({ before, after }: TextDiffViewerProps) {
  const changedFields = FIELDS.map((field) => ({
    ...field,
    lines: diffLines(before[field.key], after[field.key]),
  })).filter((field) => hasDiff(field.lines));

  return (
    <div className="space-y-4" lang="ja">
      {changedFields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          原文の文字に違いはありません。
        </p>
      ) : (
        changedFields.map((field) => (
          <div key={field.key} className="space-y-1">
            <p className="text-sm font-medium">{field.label}</p>
            <DiffLines lines={field.lines} />
          </div>
        ))
      )}
    </div>
  );
}

function DiffLines({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="max-h-[400px] overflow-y-auto rounded-md bg-muted font-mono text-xs">
      {collapseUnchangedLines(lines).map((item) =>
        item.kind === "skipped" ? (
          <div
            // 同じ文の行が何度も出るので、差分内の位置で区別する
            key={`skipped-${item.position}`}
            className="px-3 py-0.5 text-muted-foreground"
          >
            ⋯ 変更のない {item.count} 行を省略
          </div>
        ) : (
          <div
            key={`line-${item.position}`}
            className={cn(
              "flex gap-2 whitespace-pre-wrap break-words px-3 py-0.5",
              item.type === "added" && "bg-primary/10",
              item.type === "removed" && "bg-destructive/10 text-destructive"
            )}
          >
            <span aria-hidden="true" className="w-3 shrink-0 select-none">
              {LINE_MARKS[item.type].mark}
            </span>
            <span className="sr-only">{LINE_MARKS[item.type].label}</span>
            <span>{item.text || " "}</span>
          </div>
        )
      )}
    </div>
  );
}
