import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ActionBarProps = {
  /** How many rows are selected; renders nothing below one. */
  count: number;
  /** Accessible name of the bar, e.g. "3 selected items". */
  label?: string;
  /** Clears the selection; the parent owns the selection state. */
  onClear?: () => void;
  /** The bulk actions, usually a row of `ActionBar.Action`. */
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
};

/**
 * A floating toolbar for bulk actions on a multi-select: what is selected,
 * what can be done to all of it, and one clear escape.
 *
 * It floats above the list it acts on and renders nothing while nothing is
 * selected, so mounting it unconditionally is safe. Focus stays where the
 * user's keyboard put it — the bar never steals it — because the surrounding
 * list keeps handling `x`, `Esc`, and friends.
 */
export function ActionBar({ count, label, onClear, children, className, ...props }: ActionBarProps) {
  if (count < 1) return null;

  return (
    <div
      role="toolbar"
      aria-label={label ?? `${count} selected`}
      data-testid="action-bar"
      {...props}
      className={cn(
        "fixed bottom-16 left-1/2 z-40 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-border bg-card p-1.5 shadow-[0_12px_32px_rgb(61_46_31/_22%)]",
        className,
      )}
    >
      <span data-testid="action-bar-count" className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold tabular-nums text-primary-foreground">
        {count}
      </span>
      <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
      {children}
      {onClear && (
        <>
          <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
          <button
            type="button"
            aria-label="Clear selection"
            data-testid="action-bar-clear"
            onClick={onClear}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25 [&_svg]:size-3.5"
          >
            <X aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}

/** One bulk action inside an `ActionBar`. */
export function ActionBarAction({ destructive, className, ...props }: ComponentProps<"button"> & { destructive?: boolean }) {
  return (
    <button
      type="button"
      data-destructive={destructive || undefined}
      {...props}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium outline-none transition-colors",
        "text-secondary-foreground hover:bg-accent focus-visible:ring-3 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:size-3.5 [&_svg]:shrink-0",
        destructive && "text-destructive hover:not-disabled:bg-destructive/10",
        className,
      )}
    />
  );
}

ActionBar.Action = ActionBarAction;
