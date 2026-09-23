import { textResponse } from "@/lib/api/response";
import { ChatError, ChatErrorCode } from "../../shared/types/errors";

/**
 * ChatError を適切な HTTP レスポンスに変換する。
 * ChatError でない場合は汎用の500レスポンスを返す。
 */
export function chatErrorToResponse(error: unknown): Response {
  if (error instanceof ChatError) {
    switch (error.code) {
      case ChatErrorCode.DAILY_COST_LIMIT_REACHED:
      case ChatErrorCode.SYSTEM_DAILY_COST_LIMIT_REACHED:
        return textResponse(
          "本日の利用上限に達しました。明日0時以降に再度お試しください。",
          429
        );
      case ChatErrorCode.BILL_CONTEXT_REQUIRED:
        return textResponse(
          "議案が指定されていません。議案のページから質問してください。",
          400
        );
      case ChatErrorCode.SYSTEM_MONTHLY_COST_LIMIT_REACHED:
        return textResponse(
          "今月の利用上限に達しました。来月1日以降に再度お試しください。",
          429
        );
      case ChatErrorCode.CHAT_DISABLED:
        return textResponse(
          "現在AIチャット機能はメンテナンス中です。しばらく経ってから再度お試しください。",
          503
        );
      case ChatErrorCode.BILL_NOT_PUBLISHED:
        return textResponse("指定された議案は現在公開されていません。", 403);
      case ChatErrorCode.COST_CHECK_FAILED:
        return textResponse(
          "サービスが一時的に利用できません。時間をおいて再度お試しください。",
          503
        );
      default:
        return textResponse(
          "エラーが発生しました。しばらく待ってから再度お試しください。",
          500
        );
    }
  }

  return textResponse(
    "エラーが発生しました。しばらく待ってから再度お試しください。",
    500
  );
}
