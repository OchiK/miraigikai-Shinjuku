import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { textResponse } from "@/lib/api/response";
import { ChatError, ChatErrorCode } from "../../shared/types/errors";

/**
 * ChatError を適切な HTTP レスポンスに変換する。
 * ChatError でない場合は汎用の500レスポンスを返す。
 * 文言は locale に合わせる（省略時は日本語。インタビューのチャットも共用している）。
 */
export function chatErrorToResponse(
  error: unknown,
  locale: PublicLocale = "ja"
): Response {
  const messages = getUiMessages(locale).billDetail.chat.errors;

  if (error instanceof ChatError) {
    switch (error.code) {
      case ChatErrorCode.DAILY_COST_LIMIT_REACHED:
      case ChatErrorCode.SYSTEM_DAILY_COST_LIMIT_REACHED:
        return textResponse(messages.dailyLimit, 429);
      case ChatErrorCode.BILL_CONTEXT_REQUIRED:
        return textResponse(messages.billContextRequired, 400);
      case ChatErrorCode.SYSTEM_MONTHLY_COST_LIMIT_REACHED:
        return textResponse(messages.monthlyLimit, 429);
      case ChatErrorCode.CHAT_DISABLED:
        return textResponse(messages.maintenance, 503);
      case ChatErrorCode.BILL_NOT_PUBLISHED:
        return textResponse(messages.billNotPublished, 403);
      case ChatErrorCode.BILL_CONTENT_UNAVAILABLE:
        return textResponse(messages.billContentUnavailable, 503);
      case ChatErrorCode.COST_CHECK_FAILED:
        return textResponse(messages.costCheckFailed, 503);
      default:
        return textResponse(messages.general, 500);
    }
  }

  return textResponse(messages.general, 500);
}
