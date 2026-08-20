import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-black/10 bg-primary text-primary-foreground",
        outline: "border-border bg-card text-card-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        success: "border-success/25 bg-success/12 text-success-foreground",
        warning: "border-warning/25 bg-warning/12 text-warning-foreground",
        destructive: "border-destructive/25 bg-destructive/12 text-destructive-foreground",
      },
      size: {
        sm: "min-h-4.5 px-1.5 text-[11px] leading-none",
        md: "min-h-5.5 px-2 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

/**
 * A compact status or count label.
 *
 * The badge only carries the surface. Put the icon, dot, or number inside it so
 * the same variant works for a status pill, a table cell tag, and a nav counter.
 */
export function Badge({ variant, size, className, ...props }: BadgeProps) {
  return <span data-variant={variant ?? "default"} className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

/**
 * A leading status dot that inherits the badge's text color.
 *
 * `bg-current` keeps it in step with the variant, so a tone change never needs a
 * second prop.
 */
function BadgeDot({ className, ...props }: ComponentProps<"span">) {
  return <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full bg-current", className)} {...props} />;
}

Badge.Dot = BadgeDot;
