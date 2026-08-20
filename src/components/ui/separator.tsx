import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type SeparatorProps = Omit<ComponentProps<"div">, "children"> & {
  orientation?: "horizontal" | "vertical";
  /** Optional text in the middle of the rule, for "or" dividers and section breaks. */
  label?: string;
  /**
   * Purely visual rules should stay out of the accessibility tree. Set this to
   * false when the rule actually separates two sections that a screen reader
   * should hear as distinct.
   */
  decorative?: boolean;
};

/**
 * A rule between two blocks of content.
 *
 * The vertical orientation stretches to its flex parent, so it needs a row with a
 * known height rather than a height of its own.
 */
export function Separator({ orientation = "horizontal", label, decorative = true, className, ...props }: SeparatorProps) {
  const a11y = decorative ? ({ role: "none" } as const) : ({ role: "separator", "aria-orientation": orientation } as const);

  if (label) {
    return (
      <div className={cn("flex w-full items-center gap-3", className)} {...props}>
        <span {...a11y} className="h-px flex-1 bg-border" />
        <span className="shrink-0 text-xs font-medium tracking-[0.04em] text-muted-foreground uppercase">{label}</span>
        <span role="none" className="h-px flex-1 bg-border" />
      </div>
    );
  }

  return (
    <div
      {...a11y}
      data-orientation={orientation}
      className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch", className)}
      {...props}
    />
  );
}
