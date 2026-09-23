import { GUIDE_LOCALES } from "@mirai-gikai/shared/i18n/locales";
import { describe, expect, it } from "vitest";
import {
  buildRevokeStatusFields,
  buildTranslationStatusFields,
  canApproveTranslationLocale,
  getTranslationReviewStatus,
  isStoredTranslationStale,
  requiresStaleConfirmation,
  shortenSourceHash,
} from "./translation-review";

const OLD_HASH = `v1:${"a".repeat(64)}`;
const NEW_HASH = `v1:${"b".repeat(64)}`;
const NOW = new Date("2026-09-23T10:00:00.000Z");
const OLD_SOURCE = { title: "旧題", summary: "旧要約", content: "旧本文" };
const NEW_SOURCE = { title: "新題", summary: "新要約", content: "新本文" };

describe("getTranslationReviewStatus", () => {
  it("翻訳がなければ missing", () => {
    expect(getTranslationReviewStatus(undefined)).toBe("missing");
  });

  it("reviewed でも日本語が変わっていれば stale", () => {
    expect(
      getTranslationReviewStatus({ status: "reviewed", isStale: true })
    ).toBe("stale");
  });

  it("DB の status が stale なら、ハッシュが一致していても stale", () => {
    expect(
      getTranslationReviewStatus({ status: "stale", isStale: false })
    ).toBe("stale");
  });

  it("reviewed でハッシュが一致していれば reviewed", () => {
    expect(
      getTranslationReviewStatus({ status: "reviewed", isStale: false })
    ).toBe("reviewed");
  });

  it("generated は generated", () => {
    expect(
      getTranslationReviewStatus({ status: "generated", isStale: false })
    ).toBe("generated");
  });
});

describe("isStoredTranslationStale", () => {
  it("翻訳がまだなければ stale ではない", () => {
    expect(isStoredTranslationStale(null, NEW_HASH)).toBe(false);
  });

  it("ハッシュが一致していれば stale ではない", () => {
    expect(
      isStoredTranslationStale(
        { status: "reviewed", source_hash: NEW_HASH },
        NEW_HASH
      )
    ).toBe(false);
  });

  it("ハッシュが違えば stale", () => {
    expect(
      isStoredTranslationStale(
        { status: "reviewed", source_hash: OLD_HASH },
        NEW_HASH
      )
    ).toBe(true);
  });

  it("DB の status が stale なら、ハッシュが一致していても stale", () => {
    expect(
      isStoredTranslationStale(
        { status: "stale", source_hash: NEW_HASH },
        NEW_HASH
      )
    ).toBe(true);
  });
});

describe("requiresStaleConfirmation", () => {
  it("stale の翻訳を確認なしで承認しようとしたら止める", () => {
    expect(
      requiresStaleConfirmation({
        intent: "approve",
        isStale: true,
        confirmStale: false,
      })
    ).toBe(true);
  });

  it("stale でも確認済みなら承認できる", () => {
    expect(
      requiresStaleConfirmation({
        intent: "approve",
        isStale: true,
        confirmStale: true,
      })
    ).toBe(false);
  });

  it("stale でなければ確認は要らない", () => {
    expect(
      requiresStaleConfirmation({
        intent: "approve",
        isStale: false,
        confirmStale: false,
      })
    ).toBe(false);
  });

  it("下書き保存は stale でも止めない（公開されないため）", () => {
    expect(
      requiresStaleConfirmation({
        intent: "draft",
        isStale: true,
        confirmStale: false,
      })
    ).toBe(false);
  });
});

describe("buildTranslationStatusFields", () => {
  it("承認すると reviewed になり、source_hash を現在の日本語に更新して承認者を記録する", () => {
    expect(
      buildTranslationStatusFields({
        intent: "approve",
        existing: {
          status: "generated",
          source_hash: OLD_HASH,
          source_snapshot: OLD_SOURCE,
        },
        currentSourceHash: NEW_HASH,
        currentSource: NEW_SOURCE,
        reviewer: "admin@example.com",
        now: NOW,
      })
    ).toEqual({
      status: "reviewed",
      source_hash: NEW_HASH,
      source_snapshot: NEW_SOURCE,
      reviewed_at: "2026-09-23T10:00:00.000Z",
      reviewed_by: "admin@example.com",
    });
  });

  it("下書き保存は既存の source_hash を残す（stale を隠さない）", () => {
    expect(
      buildTranslationStatusFields({
        intent: "draft",
        existing: {
          status: "generated",
          source_hash: OLD_HASH,
          source_snapshot: OLD_SOURCE,
        },
        currentSourceHash: NEW_HASH,
        currentSource: NEW_SOURCE,
        reviewer: "admin@example.com",
        now: NOW,
      })
    ).toEqual({
      status: "generated",
      source_hash: OLD_HASH,
      source_snapshot: OLD_SOURCE,
      reviewed_at: null,
      reviewed_by: null,
    });
  });

  it("reviewed の翻訳を下書き保存すると非公開（generated）に戻り、承認情報を消す", () => {
    const fields = buildTranslationStatusFields({
      intent: "draft",
      existing: {
        status: "reviewed",
        source_hash: NEW_HASH,
        source_snapshot: NEW_SOURCE,
      },
      currentSourceHash: NEW_HASH,
      currentSource: NEW_SOURCE,
      reviewer: "admin@example.com",
      now: NOW,
    });
    expect(fields.status).toBe("generated");
    expect(fields.reviewed_at).toBeNull();
    expect(fields.reviewed_by).toBeNull();
  });

  it("DB で stale の翻訳は下書き保存しても stale のまま", () => {
    expect(
      buildTranslationStatusFields({
        intent: "draft",
        existing: {
          status: "stale",
          source_hash: OLD_HASH,
          source_snapshot: OLD_SOURCE,
        },
        currentSourceHash: NEW_HASH,
        currentSource: NEW_SOURCE,
        reviewer: "admin@example.com",
        now: NOW,
      }).status
    ).toBe("stale");
  });

  it("新規の下書きは現在の日本語のハッシュとスナップショットで保存する", () => {
    const fields = buildTranslationStatusFields({
      intent: "draft",
      existing: null,
      currentSourceHash: NEW_HASH,
      currentSource: NEW_SOURCE,
      reviewer: "admin@example.com",
      now: NOW,
    });
    expect(fields.source_hash).toBe(NEW_HASH);
    expect(fields.source_snapshot).toEqual(NEW_SOURCE);
  });

  it("記録前の翻訳でも source_hash が現在の日本語と一致すれば、下書き保存でスナップショットを埋める", () => {
    expect(
      buildTranslationStatusFields({
        intent: "draft",
        existing: {
          status: "generated",
          source_hash: NEW_HASH,
          source_snapshot: null,
        },
        currentSourceHash: NEW_HASH,
        currentSource: NEW_SOURCE,
        reviewer: "admin@example.com",
        now: NOW,
      }).source_snapshot
    ).toEqual(NEW_SOURCE);
  });

  it("スナップショット記録前の翻訳を下書き保存しても、現在の日本語で埋めない", () => {
    // source_hash は古い日本語のままなので、現在の日本語を入れると差分が消えてしまう
    expect(
      buildTranslationStatusFields({
        intent: "draft",
        existing: {
          status: "generated",
          source_hash: OLD_HASH,
          source_snapshot: null,
        },
        currentSourceHash: NEW_HASH,
        currentSource: NEW_SOURCE,
        reviewer: "admin@example.com",
        now: NOW,
      }).source_snapshot
    ).toBeNull();
  });
});

describe("buildRevokeStatusFields", () => {
  it("generated に戻し、承認情報を消す", () => {
    expect(buildRevokeStatusFields()).toEqual({
      status: "generated",
      reviewed_at: null,
      reviewed_by: null,
    });
  });
});

describe("shortenSourceHash", () => {
  it("バージョンを残してダイジェストを縮める", () => {
    expect(shortenSourceHash(OLD_HASH)).toBe("v1:aaaaaaaaaaaa…");
  });

  it("形式が違う値はそのまま返す", () => {
    expect(shortenSourceHash("broken")).toBe("broken");
  });
});

describe("canApproveTranslationLocale", () => {
  it("英語は承認できる", () => {
    expect(canApproveTranslationLocale("en")).toBe(true);
  });

  it.each(GUIDE_LOCALES)("%s は承認できない（下書きのみ）", (locale) => {
    expect(canApproveTranslationLocale(locale)).toBe(false);
  });

  it("ja や未対応の値も承認できない", () => {
    expect(canApproveTranslationLocale("ja")).toBe(false);
    expect(canApproveTranslationLocale("fr")).toBe(false);
  });
});
