import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const cardVariants = cva("flex min-w-0 flex-col rounded-lg border text-card-foreground", {
  variants: {
    variant: {
      // The default surface: a sheet of paper lifted just off the background.
      default: "border-border bg-card shadow-[0_1px_2px_rgb(80_55_35_/_8%)]",
      // For cards that float above content — dropped-in panels, dashboards on a busy page.
      elevated: "border-border bg-card shadow-[0_1px_2px_rgb(80_55_35_/_8%),0_10px_24px_rgb(61_46_31_/_8%)]",
      // No fill: for grids where the page background should read through.
      flat: "border-border bg-transparent",
      // A quieter block for secondary information next to a default card.
      muted: "border-border bg-muted",
    },
    interactive: {
      true: "cursor-pointer text-left outline-none transition-[background-color,border-color,box-shadow,transform] duration-150 hover:border-input hover:bg-secondary-hover focus-visible:ring-3 focus-visible:ring-primary/25 active:translate-y-px",
      false: "",
    },
  },
  defaultVariants: { variant: "default", interactive: false },
});

export type CardVariant = NonNullable<VariantProps<typeof cardVariants>["variant"]>;

export type CardProps = ComponentProps<"div"> & { variant?: CardVariant };

/**
 * A content surface with header, body, and footer slots.
 *
 * Padding lives on the slots rather than the root, so a card can hold a full-bleed
 * table or image next to padded text without fighting the container.
 */
export function CardRoot({ variant, className, ...props }: CardProps) {
  return <div data-variant={variant ?? "default"} className={cn(cardVariants({ variant }), className)} {...props} />;
}

/**
 * A card that is itself the click target.
 *
 * It renders a real `button`, so keyboard activation, focus, and disabled state come
 * from the platform instead of a `role` on a `div`. For a navigation card, apply
 * `cardVariants({ interactive: true })` to an anchor the same way.
 */
export function CardButton({ variant, className, ...props }: ComponentProps<"button"> & { variant?: CardVariant }) {
  return <button type="button" data-variant={variant ?? "default"} className={cn(cardVariants({ variant, interactive: true }), className)} {...props} />;
}

/**
 * The card header. `divided` adds the same seam the dialog header uses, which is
 * what you want as soon as the body scrolls or holds a table.
 */
export function CardHeader({ divided = false, className, ...props }: ComponentProps<"div"> & { divided?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 px-4 pt-3.5 pb-3",
        divided && "border-b border-border bg-gradient-to-b from-white to-card pb-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_85%)]",
        className,
      )}
      {...props}
    />
  );
}

/** Groups the title and description so header actions can sit opposite them. */
export function CardHeading({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-col gap-0.5", className)} {...props} />;
}

/** The card title. Render it as the right heading level for the page with `as`-style composition. */
export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("m-0 truncate text-base leading-tight font-semibold tracking-[-0.01em]", className)} {...props} />;
}

/** One line of supporting context under the title. Keep it short; the body is for detail. */
export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("m-0 text-sm text-muted-foreground", className)} {...props} />;
}

/** The trailing slot of the header, for a menu, a badge, or a small action. */
export function CardActions({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex shrink-0 items-center gap-2", className)} {...props} />;
}

/** The card body. Pass `className="p-0"` for full-bleed content such as a table or image. */
export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("min-w-0 flex-1 px-4 py-3.5", className)} {...props} />;
}

/** The footer, separated by its own rule. Actions align right by default. */
export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-center justify-end gap-2 border-t border-border px-4 py-3", className)} {...props} />;
}

/** A full-bleed rule between two body blocks. It cancels the body padding on both sides. */
export function CardDivider({ className, ...props }: ComponentProps<"div">) {
  return <div role="separator" className={cn("h-px shrink-0 bg-border", className)} {...props} />;
}

/** A full-bleed media slot for a preview, chart, or cover image. */
export function CardMedia({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("overflow-hidden border-b border-border bg-muted first:rounded-t-[11px] last:rounded-b-[11px] last:border-b-0", className)} {...props} />;
}

CardRoot.Button = CardButton;
CardRoot.Header = CardHeader;
CardRoot.Heading = CardHeading;
CardRoot.Title = CardTitle;
CardRoot.Description = CardDescription;
CardRoot.Actions = CardActions;
CardRoot.Content = CardContent;
CardRoot.Footer = CardFooter;
CardRoot.Divider = CardDivider;
CardRoot.Media = CardMedia;

export const Card = CardRoot;
