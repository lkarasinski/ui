import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

const progressTrackVariants = cva("relative w-full overflow-hidden rounded-full bg-muted", {
  variants: {
    size: {
      sm: "h-1",
      md: "h-2",
    },
  },
  defaultVariants: { size: "md" },
});

const progressBarVariants = cva("h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none", {
  variants: {
    tone: {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
    },
  },
  defaultVariants: { tone: "default" },
});

type ProgressContextValue = {
  value: number | undefined;
  max: number;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

function useProgress<T>(selector: (context: ProgressContextValue) => T) {
  return useContextSelector(ProgressContext, (context) => (context ? selector(context) : (undefined as T)));
}

export type ProgressProps = Omit<ComponentProps<"div">, "children"> &
  VariantProps<typeof progressTrackVariants> &
  VariantProps<typeof progressBarVariants> & {
    /** Omit for work whose duration is unknown; the bar then loops instead of filling. */
    value?: number;
    max?: number;
  };

/**
 * A determinate or indeterminate progress bar.
 *
 * Pass `value` when the duration is knowable — an upload, an import, a quota. Omit
 * it and the bar loops, which says "working" without claiming to know how long.
 *
 * Inside `Progress.Root` the value comes from the root, so the bar and the
 * readout can never disagree.
 */
export function Progress({ value, max, size, tone, className, ...props }: ProgressProps) {
  const contextValue = useProgress((context) => context.value);
  const contextMax = useProgress((context) => context.max);
  const currentValue = value ?? contextValue;
  const currentMax = max ?? contextMax ?? 100;
  const indeterminate = currentValue === undefined;
  const percentage = indeterminate ? 0 : Math.min(100, Math.max(0, (currentValue / currentMax) * 100));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={currentMax}
      aria-valuenow={indeterminate ? undefined : currentValue}
      data-state={indeterminate ? "indeterminate" : "determinate"}
      className={cn(progressTrackVariants({ size }), className)}
      {...props}
    >
      {indeterminate ? (
        <div className={cn(progressBarVariants({ tone }), "absolute inset-y-0 w-2/5 animate-progress-indeterminate motion-reduce:animate-none motion-reduce:w-full motion-reduce:opacity-40")} />
      ) : (
        <div className={cn(progressBarVariants({ tone }))} style={{ width: `${percentage}%` }} />
      )}
    </div>
  );
}

export type ProgressRootProps = ComponentProps<"div"> & {
  value?: number;
  max?: number;
};

/**
 * Composes a progress bar with its label and readout.
 *
 * The root owns the value, so `Progress.Value` formats the same number the bar
 * draws instead of taking a second copy of it as a prop.
 */
export function ProgressRoot({ value, max = 100, className, children, ...props }: ProgressRootProps) {
  return (
    <ProgressContext.Provider value={{ value, max }}>
      <div className={cn("flex w-full min-w-0 flex-col gap-1.5", className)} {...props}>
        {children}
      </div>
    </ProgressContext.Provider>
  );
}

/** A row for the label and the readout, above the bar. */
export function ProgressHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-baseline justify-between gap-3", className)} {...props} />;
}

/** What the bar is measuring. Connect it to the bar with `aria-labelledby` when it needs a name. */
export function ProgressLabel({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("truncate text-sm font-medium text-card-foreground", className)} {...props} />;
}

export type ProgressValueProps = Omit<ComponentProps<"span">, "children"> & {
  /** Formats the readout. Defaults to a percentage, or an em dash while indeterminate. */
  format?: (value: number | undefined, max: number) => string;
};

/** The numeric readout, read from the root so it always matches the bar. */
export function ProgressValue({ format, className, ...props }: ProgressValueProps) {
  const value = useProgress((context) => context.value);
  const max = useProgress((context) => context.max) ?? 100;
  const formatted = format ? format(value, max) : value === undefined ? "—" : `${Math.round((value / max) * 100)}%`;

  return (
    <span className={cn("shrink-0 font-mono text-xs text-muted-foreground tabular-nums", className)} {...props}>
      {formatted}
    </span>
  );
}

Progress.Root = ProgressRoot;
Progress.Header = ProgressHeader;
Progress.Label = ProgressLabel;
Progress.Value = ProgressValue;
Progress.Bar = Progress;
