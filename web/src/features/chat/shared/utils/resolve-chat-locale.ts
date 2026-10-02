import { parseLocale } from "@mirai-gikai/shared/i18n/locales";
import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";

interface MessageWithLocale {
  metadata?: unknown;
}

/**
 * 回答・エラーの言語を決める。
 * 会話の途中で言語を切り替えても追従するよう、最後のメッセージから順にさかのぼって
 * locale を持つメタデータを探す。不正な値や公開していない言語は ja に倒す。
 */
export function resolveChatLocale(
  messages: readonly MessageWithLocale[]
): PublicLocale {
  for (let i = messages.length - 1; i >= 0; i--) {
    const metadata = messages[i]?.metadata;
    if (metadata && typeof metadata === "object" && "locale" in metadata) {
      const { locale } = metadata as { locale: unknown };
      return parseLocale(typeof locale === "string" ? locale : undefined);
    }
  }
  return parseLocale(undefined);
}
