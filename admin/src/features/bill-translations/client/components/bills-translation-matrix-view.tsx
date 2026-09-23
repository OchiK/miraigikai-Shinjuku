import type { Route } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { routes } from "@/lib/routes";
import {
  TRANSLATION_LOCALE_LABELS,
  TRANSLATION_LOCALES,
} from "../../shared/types/bill-translation";
import type { TranslationMatrix } from "../../shared/types/translation-matrix";
import { TranslationStatusBadge } from "./translation-status-badge";

interface BillsTranslationMatrixViewProps {
  matrix: TranslationMatrix;
}

/** 全議案 × 翻訳先ロケールの翻訳状態。セルからその言語の翻訳画面へ移る */
export function BillsTranslationMatrixView({
  matrix,
}: BillsTranslationMatrixViewProps) {
  const { rows, summary } = matrix;
  // 件数は日本語の「ふつう」がある議案だけを母数にする（summary と揃える）
  const total = rows.filter((row) => row.hasSource).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRANSLATION_LOCALES.map((locale) => {
          const counts = summary[locale];
          return (
            <Card key={locale}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {TRANSLATION_LOCALE_LABELS[locale]}（{locale}）
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>
                  <span className="text-2xl font-bold">{counts.reviewed}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    / {total}件 公開中
                  </span>
                </p>
                <p className="text-muted-foreground">
                  要確認 {counts.generated} ／ 原文変更 {counts.stale} ／ 未翻訳{" "}
                  {counts.missing}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        「ふつう」の日本語に対する翻訳の状態です。公開画面は、選ばれた難易度の翻訳がなければ「ふつう」の翻訳を表示し、それも公開中でなければ日本語を表示します。
      </p>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[240px]">議案</TableHead>
                {TRANSLATION_LOCALES.map((locale) => (
                  <TableHead key={locale} className="text-center">
                    <abbr
                      title={TRANSLATION_LOCALE_LABELS[locale]}
                      className="no-underline"
                    >
                      {locale}
                    </abbr>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={TRANSLATION_LOCALES.length + 1}
                    className="py-8 text-center text-muted-foreground"
                  >
                    議案がありません
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.billId}>
                  <TableCell className="whitespace-normal">
                    <Link
                      href={routes.billTranslations(row.billId) as Route}
                      className="font-medium hover:underline"
                    >
                      {row.billNumber}
                    </Link>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {row.billName}
                    </p>
                    {row.sessionName && (
                      <p className="text-xs text-muted-foreground">
                        {row.sessionName}
                      </p>
                    )}
                  </TableCell>
                  {TRANSLATION_LOCALES.map((locale) => (
                    <TableCell key={locale} className="text-center">
                      {row.hasSource ? (
                        <Link
                          href={
                            routes.billTranslationsForLocale(
                              row.billId,
                              locale
                            ) as Route
                          }
                          aria-label={`${row.billNumber} の${TRANSLATION_LOCALE_LABELS[locale]}翻訳を開く`}
                          className="inline-flex min-h-11 items-center"
                        >
                          <TranslationStatusBadge
                            status={row.statuses[locale]}
                            compact
                          />
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          原文なし
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
