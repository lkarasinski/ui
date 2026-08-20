import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  "relative overflow-hidden bg-muted after:absolute after:inset-0 after:-translate-x-full after:animate-skeleton-sheen after:bg-gradient-to-r after:from-transparent after:via-white/65 after:to-transparent motion-reduce:after:animate-none",
  {
    variants: {
      shape: {
        block: "rounded-md",
        text: "h-3.5 rounded-sm",
        circle: "rounded-full",
      },
    },
    defaultVariants: { shape: "block" },
  },
);

export type SkeletonProps = ComponentProps<"div"> & VariantProps<typeof skeletonVariants>;

/**
 * A placeholder for content that is still loading.
 *
 * The skeleton has no size of its own — give it the size of the thing it stands
 * in for, so the real content lands in the same place and nothing shifts. Under
 * `prefers-reduced-motion` the sheen stops and the block stays flat.
 *
 * Use it only when there is nothing to show yet. If content is already on screen,
 * an inline spinner is less disruptive than replacing it with grey boxes.
 */
export function Skeleton({ shape, className, ...props }: SkeletonProps) {
  return <div aria-hidden="true" data-shape={shape ?? "block"} className={cn(skeletonVariants({ shape }), className)} {...props} />;
}

export type SkeletonTextProps = ComponentProps<"div"> & {
  /** Number of lines. The last one is shortened, the way a real paragraph ends. */
  lines?: number;
};

/** A paragraph placeholder. */
export function SkeletonText({ lines = 3, className, ...props }: SkeletonTextProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)} {...props}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} shape="text" className={index === lines - 1 ? "w-3/5" : "w-full"} />
      ))}
    </div>
  );
}

/**
 * Wraps a loading region.
 *
 * It marks the area as busy and hides the placeholder tree from screen readers,
 * so the announcement is "loading" rather than a list of empty boxes.
 */
export function SkeletonRegion({ label = "Loading", className, ...props }: ComponentProps<"div"> & { label?: string }) {
  return <div role="status" aria-busy="true" aria-label={label} className={cn("min-w-0", className)} {...props} />;
}

Skeleton.Text = SkeletonText;
Skeleton.Region = SkeletonRegion;
