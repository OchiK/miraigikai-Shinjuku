import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        /* 可決・承認・同意・認定・採択 */
        default:
          "border-transparent bg-status-passed-bg text-status-passed [a&]:hover:opacity-90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-primary-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 aria-invalid:ring-destructive/20",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        /* 議案上程前・準備中 */
        muted:
          "border-transparent bg-status-review-bg text-status-review [a&]:hover:opacity-90",
        /* 否決・不承認・不同意・不認定・不採択 */
        dark: "border-transparent bg-status-rejected-bg text-status-rejected [a&]:hover:opacity-90",
        /* 審議中 */
        light:
          "border-transparent bg-status-review-bg text-status-review [a&]:hover:opacity-90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
