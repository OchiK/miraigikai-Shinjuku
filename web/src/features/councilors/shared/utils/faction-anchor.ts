import type { Route } from "next";
import { routes } from "@/lib/routes";

/**
 * 議員一覧の会派セクションに付けるアンカーID。
 * 会派の slug（factions.name）から作り、議案詳細の会派賛否からのリンクと揃える。
 * 会派に属さない議員のセクションは slug が無いため固定のIDにする。
 */
export function getFactionAnchorId(factionSlug: string | null): string {
  return factionSlug ? `faction-${factionSlug}` : "faction-unaffiliated";
}

/** 議員一覧の該当会派セクションへのリンク先 */
export function getFactionCouncilorsHref(factionSlug: string): Route {
  return `${routes.councilors()}#${getFactionAnchorId(factionSlug)}` as Route;
}
