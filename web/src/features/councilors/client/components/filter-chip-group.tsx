import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

const chipClass = (active: boolean) =>
  `h-11 rounded-full px-4 py-1.5 font-bold text-xs transition-colors ${
    active
      ? "bg-primary text-mirai-text hover:bg-primary-accent hover:text-mirai-text"
      : "bg-neutral-200 text-mirai-text-muted hover:bg-neutral-300 hover:text-mirai-text-muted"
  }`;

type Props<T> = {
  legend: string;
  options: { value: T; label: ReactNode }[];
  selected: T;
  onSelect: (value: T) => void;
};

/** 見出し付きのチップ群。選んだチップを aria-pressed で示す（role="tablist" は使わない） */
export function FilterChipGroup<T extends string | null>({
  legend,
  options,
  selected,
  onSelect,
}: Props<T>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-bold text-mirai-text text-sm">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label }) => (
          <Button
            key={value ?? ""}
            variant="ghost"
            aria-pressed={selected === value}
            onClick={() => onSelect(value)}
            className={chipClass(selected === value)}
          >
            {label}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}
