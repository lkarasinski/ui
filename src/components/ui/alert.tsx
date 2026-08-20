import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

const alertVariants = cva("flex w-full min-w-0 gap-3 rounded-md border p-3.5 text-sm", {
  variants: {
    variant: {
      info: "border-border bg-card text-card-foreground",
      success: "border-success/25 bg-success/8 text-card-foreground",
      warning: "border-warning/25 bg-warning/8 text-card-foreground",
      destructive: "border-destructive/25 bg-destructive/8 text-card-foreground",
    },
  },
  defaultVariants: { variant: "info" },
});

const alertIconVariants = cva("mt-px inline-flex size-4 shrink-0 items-center justify-center [&_svg]:size-4", {
  variants: {
    variant: {
      info: "text-muted-foreground",
      success: "text-success-foreground",
      warning: "text-warning-foreground",
      destructive: "text-destructive-foreground",
    },
  },
  defaultVariants: { variant: "info" },
});

export type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

const AlertContext = createContext<{ variant: AlertVariant } | null>(null);

function useAlertVariant() {
  return useContextSelector(AlertContext, (context) => context?.variant ?? "info");
}

export type AlertRootProps = ComponentProps<"div"> & { variant?: AlertVariant };

/**
 * An inline message about the state of the surrounding surface.
 *
 * The alert is a message, not a dialog: it stays in the flow and never steals
 * focus. The icon is composed rather than derived from the variant, so a warning
 * can carry a clock, a shield, or nothing at all. Only the icon color follows the
 * tone, through a context selector.
 *
 * Use `role="alert"` for a message that appears in response to something the user
 * just did; leave the default `role="status"` for context that was already there.
 */
export function AlertRoot({ variant = "info", role = "status", className, children, ...props }: AlertRootProps) {
  return (
    <AlertContext.Provider value={{ variant }}>
      <div role={role} data-variant={variant} className={cn(alertVariants({ variant }), className)} {...props}>
        {children}
      </div>
    </AlertContext.Provider>
  );
}

/** A 16px icon slot tinted by the alert tone. Mark it `aria-hidden` — the text carries the meaning. */
export function AlertIcon({ className, ...props }: ComponentProps<"span">) {
  const variant = useAlertVariant();
  return <span aria-hidden="true" className={cn(alertIconVariants({ variant }), className)} {...props} />;
}

/** Wraps the title, description, and actions so the icon and close button stay on the outside. */
export function AlertBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-1 flex-col gap-1", className)} {...props} />;
}

/** A one-line summary. Without a title the description carries the whole message. */
export function AlertTitle({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("m-0 text-sm leading-tight font-semibold", className)} {...props} />;
}

/** The explanation, and where to say what the user can do about it. */
export function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("m-0 text-sm text-muted-foreground [&_a]:font-medium [&_a]:text-inherit [&_a]:underline [&_a]:underline-offset-2", className)} {...props} />;
}

/** A row for the recovery actions, below the message. */
export function AlertActions({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mt-1.5 flex flex-wrap items-center gap-2", className)} {...props} />;
}

/**
 * Dismisses the alert. It only renders the control — the parent owns whether the
 * alert is mounted, because only the parent knows if it should come back.
 */
export function AlertClose({ className, "aria-label": ariaLabel = "Dismiss", ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "-mt-0.5 -mr-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-foreground/6 hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25 [&_svg]:size-3.5",
        className,
      )}
      {...props}
    >
      <X aria-hidden="true" />
    </button>
  );
}

AlertRoot.Icon = AlertIcon;
AlertRoot.Body = AlertBody;
AlertRoot.Title = AlertTitle;
AlertRoot.Description = AlertDescription;
AlertRoot.Actions = AlertActions;
AlertRoot.Close = AlertClose;

export const Alert = AlertRoot;
