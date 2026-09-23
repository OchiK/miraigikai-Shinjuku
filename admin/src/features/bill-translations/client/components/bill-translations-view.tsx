"use client";

import type { TranslationLocale } from "@mirai-gikai/shared/i18n/locales";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DIFFICULTY_LEVELS,
  type DifficultyLevel,
} from "@/features/bills-edit/shared/types/bill-contents";
import { utcToJstDatetimeLocal } from "@/lib/utils/datetime-jst";
import {
  type BillTranslationGroup,
  TRANSLATION_LOCALE_LABELS,
  TRANSLATION_LOCALES,
  type TranslationSourceItem,
} from "../../shared/types/bill-translation";
import {
  canApproveTranslationLocale,
  getTranslationReviewStatus,
  shortenSourceHash,
} from "../../shared/utils/translation-review";
import { TextDiffViewer } from "./text-diff-viewer";
import { TranslationEditor } from "./translation-editor";
import { TranslationStatusBadge } from "./translation-status-badge";

interface BillTranslationsViewProps {
  groups: BillTranslationGroup[];
  /** 最初に開く言語タブ（一覧から特定の言語のセルで来たとき） */
  initialLocale?: TranslationLocale;
}

function formatJst(utc: string): string {
  return `${utcToJstDatetimeLocal(utc).replace("T", " ")}（JST）`;
}

export function BillTranslationsView({
  groups,
  initialLocale = "en",
}: BillTranslationsViewProps) {
  const [locale, setLocale] = useState<TranslationLocale>(initialLocale);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("normal");
  const [isEditorDirty, setIsEditorDirty] = useState(false);

  // タブを切り替えるとエディタを作り直すので、未保存の編集があれば確認する
  function confirmDiscard(): boolean {
    if (!isEditorDirty) return true;
    const ok = window.confirm(
      "保存していない編集があります。破棄して切り替えますか？"
    );
    if (ok) setIsEditorDirty(false);
    return ok;
  }

  function handleLocaleChange(value: string) {
    const next = TRANSLATION_LOCALES.find((l) => l === value);
    if (next && next !== locale && confirmDiscard()) setLocale(next);
  }

  function handleDifficultyChange(value: string) {
    const next = DIFFICULTY_LEVELS.find((l) => l.value === value)?.value;
    if (next && next !== difficulty && confirmDiscard()) setDifficulty(next);
  }

  const group = groups.find((g) => g.source.difficultyLevel === difficulty);
  const translation = group?.translations[locale];
  const status = getTranslationReviewStatus(translation);
  const canApprove = canApproveTranslationLocale(locale);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Tabs value={locale} onValueChange={handleLocaleChange}>
          <TabsList className="flex h-auto flex-wrap">
            {TRANSLATION_LOCALES.map((value) => (
              <TabsTrigger key={value} value={value}>
                {TRANSLATION_LOCALE_LABELS[value]}（{value}）
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs value={difficulty} onValueChange={handleDifficultyChange}>
          <TabsList>
            {DIFFICULTY_LEVELS.map((level) => (
              <TabsTrigger key={level.value} value={level.value}>
                {level.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="text-xs text-muted-foreground">
          公開画面では、選ばれた難易度の翻訳がなければ「ふつう」の翻訳を表示します。どちらも確認済みでなければ日本語を表示します。
        </p>
      </div>

      {group ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <SourcePane source={group.source} />

          <Card>
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>
                  {TRANSLATION_LOCALE_LABELS[locale]}（{locale}）
                </CardTitle>
                <TranslationStatusBadge
                  status={status}
                  isPublicLocale={canApprove}
                />
              </div>
              {translation && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <dt>翻訳元ハッシュ</dt>
                  <dd className="font-mono">
                    {shortenSourceHash(translation.sourceHash)}
                  </dd>
                  <dt>翻訳日時</dt>
                  <dd>
                    {formatJst(translation.translatedAt)}
                    {translation.model && `（${translation.model}）`}
                  </dd>
                  {translation.reviewedAt && (
                    <>
                      <dt>確認</dt>
                      <dd>
                        {formatJst(translation.reviewedAt)}
                        {translation.reviewedBy &&
                          `（${translation.reviewedBy}）`}
                      </dd>
                    </>
                  )}
                </dl>
              )}
              {!canApprove && (
                <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  英語以外の翻訳は現在公開対象外のため、下書き保存のみ可能です。
                </p>
              )}
              {status === "stale" && (
                <div className="space-y-3 rounded-md bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">
                    {canApprove
                      ? "この翻訳を作った後に日本語の原文が変わりました。公開画面には表示されていません。原文と照らし合わせて翻訳を直してから承認してください。"
                      : "この翻訳を作った後に日本語の原文が変わりました。原文と照らし合わせて翻訳を直し、下書き保存してください。"}
                  </p>
                  {translation?.sourceSnapshot ? (
                    <TextDiffViewer
                      before={translation.sourceSnapshot}
                      after={group.source}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      この翻訳には翻訳時の原文が記録されていないため、変更箇所は表示できません。
                    </p>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <TranslationEditor
                // 言語・難易度を切り替えたら入力をその翻訳で作り直す
                key={`${group.source.id}-${locale}-${translation?.id ?? "new"}`}
                billContentId={group.source.id}
                sourceHash={group.source.sourceHash}
                locale={locale}
                translation={translation}
                status={status}
                canApprove={canApprove}
                onDirtyChange={setIsEditorDirty}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            この難易度の日本語コンテンツがありません。先に「難易度別コンテンツ」で日本語を作成してください。
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SourcePane({ source }: { source: TranslationSourceItem }) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>日本語（正本）</CardTitle>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <dt>原文ハッシュ</dt>
          <dd className="font-mono">{shortenSourceHash(source.sourceHash)}</dd>
          <dt>文字数</dt>
          <dd>
            タイトル {source.title.length} ／ 要約 {source.summary.length} ／
            本文 {source.content.length}
          </dd>
        </dl>
      </CardHeader>
      <CardContent className="space-y-4" lang="ja">
        <SourceField label="タイトル" text={source.title} />
        <SourceField label="要約" text={source.summary} />
        <SourceField label="本文（Markdown）" text={source.content} mono />
      </CardContent>
    </Card>
  );
}

function SourceField({
  label,
  text,
  mono = false,
}: {
  label: string;
  text: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div
        className={`whitespace-pre-wrap break-words rounded-md bg-muted p-3 ${
          mono ? "max-h-[600px] overflow-y-auto font-mono text-sm" : "text-sm"
        }`}
      >
        {text || <span className="text-muted-foreground">（空）</span>}
      </div>
    </div>
  );
}
