import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type PropertyListProps = ComponentProps<"dl">;

/**
 * A label/value list for the facts of an item — project, branch, pipeline,
 * assignee. Rows are full-width and divided by hairlines, so a panel can
 * stack any number of them without a grid drifting out of alignment.
 */
export function PropertyList({ className, ...props }: PropertyListProps) {
  return <dl data-testid="property-list" {...props} className={cn("m-0 flex min-w-0 flex-col", className)} />;
}

export type PropertyRowProps = ComponentProps<"div"> & {
  /** The fact's name; kept short so the value gets the width. */
  label: string;
  /** Renders the value in mono — ids, branch names, SHAs. */
  mono?: boolean;
};

/**
 * One fact. Values align right on their baseline with the label, truncate
 * with a native tooltip, and may be any node — a badge, a link, plain text.
 */
export function PropertyRow({ label, mono, className, children, ...props }: PropertyRowProps) {
  return (
    <div
      data-testid="property-row"
      {...props}
      className={cn("flex items-baseline justify-between gap-3 border-b border-border/50 py-1.5 last:border-b-0", className)}
    >
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "m-0 min-w-0 truncate text-right text-sm",
          mono && "font-mono text-[13px]",
          "[&_a]:font-medium [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline",
        )}
        title={typeof children === "string" ? children : undefined}
      >
        {children}
      </dd>
    </div>
  );
}

PropertyList.Row = PropertyRow;

export const PropertyListRoot = PropertyList;
