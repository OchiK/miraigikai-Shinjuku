import { cn } from "@/lib/utils";
import {
  type AvatarTone,
  getAvatarInitial,
  getAvatarTone,
} from "../../shared/utils/avatar-initial";

const TONE_CLASSES: Record<AvatarTone, string> = {
  terracotta: "bg-terracotta-200 text-terracotta-800",
  sage: "bg-sage-200 text-sage-800",
  neutral: "bg-neutral-200 text-neutral-800",
};

const SIZE_CLASSES = {
  md: "size-12 text-xl",
  lg: "size-20 text-3xl",
} as const;

type Props = {
  id: string;
  name: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
};

/**
 * 顔写真の代わりに姓の頭文字を出すモノグラム。
 * 肖像権に配慮して議員の写真は使わない。氏名は隣に必ず文字で出すので、
 * アバター自体は装飾として読み上げから外す。色は id から決まり、意味を持たない。
 */
export function CouncilorAvatar({ id, name, size = "md", className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-heading font-bold",
        TONE_CLASSES[getAvatarTone(id)],
        SIZE_CLASSES[size],
        className
      )}
    >
      {getAvatarInitial(name)}
    </span>
  );
}
