"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { TranslationLocale } from "@mirai-gikai/shared/i18n/locales";
import { CheckCircle2, Loader2, Save, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { revokeBillTranslation } from "../../server/actions/revoke-bill-translation";
import { upsertBillTranslation } from "../../server/actions/upsert-bill-translation";
import {
  type BillTranslationFormData,
  billTranslationFormSchema,
  type TranslationReviewItem,
  type TranslationReviewStatus,
} from "../../shared/types/bill-translation";
import type { TranslationWriteIntent } from "../../shared/utils/translation-review";

interface TranslationEditorProps {
  billContentId: string;
  /** 左ペインに表示している日本語の source_hash */
  sourceHash: string;
  locale: TranslationLocale;
  translation: TranslationReviewItem | undefined;
  status: TranslationReviewStatus;
  /** 未保存の編集があるかを親に伝える（タブ切り替え時の確認用） */
  onDirtyChange: (isDirty: boolean) => void;
}

type PendingAction = TranslationWriteIntent | "revoke" | null;

export function TranslationEditor({
  billContentId,
  sourceHash,
  locale,
  translation,
  status,
  onDirtyChange,
}: TranslationEditorProps) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAction>(null);
  const [isStaleDialogOpen, setIsStaleDialogOpen] = useState(false);

  const form = useForm<BillTranslationFormData>({
    resolver: zodResolver(billTranslationFormSchema),
    defaultValues: {
      title: translation?.title ?? "",
      summary: translation?.summary ?? "",
      content: translation?.content ?? "",
    },
  });

  const { isDirty } = form.formState;
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  async function save(
    intent: TranslationWriteIntent,
    values: BillTranslationFormData,
    confirmStale = false
  ) {
    setPending(intent);
    try {
      const result = await upsertBillTranslation({
        billContentId,
        locale,
        intent,
        confirmStale,
        reviewedSourceHash: sourceHash,
        ...values,
      });

      if (!result.success) {
        if (result.sourceChanged) {
          // 入力中の翻訳は残したまま、左ペインの原文を最新にする
          toast.error(result.error, { duration: Infinity });
          router.refresh();
          return;
        }
        if (result.needsStaleConfirmation) {
          setIsStaleDialogOpen(true);
          return;
        }
        toast.error(result.error, { duration: Infinity });
        return;
      }

      toast.success(
        intent === "approve"
          ? "確認済みにしました。公開画面に表示されます"
          : "下書きを保存しました（非公開）"
      );
      form.reset(values);
      router.refresh();
    } catch {
      toast.error("保存に失敗しました", { duration: Infinity });
    } finally {
      setPending(null);
    }
  }

  async function handleApproveClick() {
    const isValid = await form.trigger();
    if (!isValid) return;

    if (status === "stale") {
      setIsStaleDialogOpen(true);
      return;
    }
    await save("approve", billTranslationFormSchema.parse(form.getValues()));
  }

  async function handleRevoke() {
    setPending("revoke");
    try {
      const result = await revokeBillTranslation({ billContentId, locale });
      if (!result.success) {
        toast.error(result.error, { duration: Infinity });
        return;
      }
      toast.success("承認を取り消しました。公開画面には表示されません");
      router.refresh();
    } catch {
      toast.error("承認の取り消しに失敗しました", { duration: Infinity });
    } finally {
      setPending(null);
    }
  }

  const isBusy = pending !== null;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => save("draft", values))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input {...field} lang={locale} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>要約</FormLabel>
              <FormControl>
                <Textarea {...field} lang={locale} className="min-h-[100px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>本文（Markdown）</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  lang={locale}
                  className="min-h-[400px] font-mono text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="outline" disabled={isBusy}>
            {pending === "draft" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            下書き保存（非公開）
          </Button>
          <Button type="button" onClick={handleApproveClick} disabled={isBusy}>
            {pending === "approve" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            確認済みにする（公開承認）
          </Button>
          {status === "reviewed" && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleRevoke}
              disabled={isBusy}
            >
              {pending === "revoke" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Undo2 className="h-4 w-4" />
              )}
              承認を取り消す
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          下書き保存すると、確認済みの翻訳も非公開に戻ります。公開するには「確認済みにする」を押してください。
        </p>
      </form>

      <AlertDialog open={isStaleDialogOpen} onOpenChange={setIsStaleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>日本語の原文が変わっています</AlertDialogTitle>
            <AlertDialogDescription>
              この翻訳を作った後に、日本語の原文が更新されました。左の原文と照らし合わせ、変更を翻訳に反映したことを確認してから承認してください。承認すると、この翻訳は現在の原文に対応するものとして公開されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>戻って確認する</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                save(
                  "approve",
                  billTranslationFormSchema.parse(form.getValues()),
                  true
                )
              }
            >
              反映済みなので承認する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
