/**
 * admin アプリの内部ルート定義
 *
 * app/ ディレクトリの page.tsx と 1:1 対応する。
 * Link href や router.push には必ずこのファイルの関数を使うこと。
 * 新しいページを追加したらここにもルートを追加し、テストを通すこと。
 */

import type { TranslationLocale } from "@mirai-gikai/shared/i18n/locales";

// ── 静的ルート ──────────────────────────────────────
export const routes = {
  login: () => "/login" as const,
  bills: () => "/bills" as const,
  billNew: () => "/bills/new" as const,
  billMerge: () => "/bills/merge" as const,
  billTranslationsList: () => "/bills/translations" as const,
  admins: () => "/admins" as const,
  tags: () => "/tags" as const,
  councilSessions: () => "/council-sessions" as const,
  committees: () => "/committees" as const,
  factions: () => "/factions" as const,
  aiCollection: () => "/ai-collection" as const,
  experts: () => "/experts" as const,
  aiSettings: () => "/ai-settings" as const,
  interviews: () => "/interviews" as const,

  // ── 議案配下 ──────────────────────────────────────
  billEdit: (billId: string) => `/bills/${billId}/edit` as const,
  billContentsEdit: (billId: string) =>
    `/bills/${billId}/contents/edit` as const,
  billTranslations: (billId: string) =>
    `/bills/${billId}/translations` as const,
  /** 翻訳画面を指定した言語のタブで開く */
  billTranslationsForLocale: (billId: string, locale: TranslationLocale) =>
    `/bills/${billId}/translations?locale=${locale}` as const,

  // インタビュー
  billInterview: (billId: string) => `/bills/${billId}/interview` as const,
  billInterviewNew: (billId: string) =>
    `/bills/${billId}/interview/new` as const,
  billInterviewEdit: (billId: string, configId: string) =>
    `/bills/${billId}/interview/${configId}/edit` as const,

  // レポート（インタビュー設定配下）
  billReports: (billId: string, configId: string) =>
    `/bills/${billId}/interview/${configId}/reports` as const,
  billReportDetail: (billId: string, configId: string, sessionId: string) =>
    `/bills/${billId}/interview/${configId}/reports/${sessionId}` as const,

  // トピック解析（インタビュー設定配下）
  billTopicAnalysis: (billId: string, configId: string) =>
    `/bills/${billId}/interview/${configId}/topic-analysis` as const,
  billTopicAnalysisDetail: (
    billId: string,
    configId: string,
    versionId: string
  ) =>
    `/bills/${billId}/interview/${configId}/topic-analysis/${versionId}` as const,
} as const;
