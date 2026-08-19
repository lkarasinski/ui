import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { useActor } from "@xstate/react";
import { assign, createMachine } from "xstate";
import { Children, Fragment, isValidElement, useCallback, useMemo, type ReactNode } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex min-h-9 w-full min-w-0 shrink items-center justify-center gap-2 overflow-hidden rounded-md border px-3.5 text-sm font-medium outline-none transition-[background-color,border-color,box-shadow,transform] duration-150 select-none disabled:cursor-not-allowed disabled:opacity-50 active:not-disabled:translate-y-px focus-visible:ring-3 focus-visible:ring-primary/25",
  {
    variants: {
      variant: {
        default:
          "border-black/15 bg-primary text-primary-foreground shadow-[0_1px_3px_rgb(180_90_30_/_35%),0_2px_6px_rgb(180_90_30_/_20%)] hover:not-disabled:border-black/20 hover:not-disabled:bg-primary-hover active:not-disabled:bg-primary-active",
        outline:
          "border-border bg-secondary text-secondary-foreground shadow-[0_1px_2px_rgb(80_55_35_/_8%)] hover:not-disabled:border-input hover:not-disabled:bg-secondary-hover",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

type ButtonContextValue = { variant: ButtonVariant };

const ButtonContext = createContext<ButtonContextValue | null>(null);

function useButtonVariant() {
  return useContextSelector(ButtonContext, (ctx) => ctx?.variant);
}

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & VariantProps<typeof buttonVariants> & { children?: ReactNode };

type ButtonFeedbackEvent = { type: "CONFIRM"; message: ReactNode } | { type: "DISMISS" };

function createButtonFeedbackMachine(duration: number) {
  return createMachine({
    types: {} as {
      context: { message: ReactNode | null };
      events: ButtonFeedbackEvent;
    },
    context: { message: null },
    initial: "idle",
    states: {
      idle: {
        on: {
          CONFIRM: {
            target: "confirmed",
            actions: assign({ message: ({ event }) => event.message }),
          },
        },
      },
      confirmed: {
        on: {
          CONFIRM: {
            target: "confirmed",
            actions: assign({ message: ({ event }) => event.message }),
          },
          DISMISS: {
            target: "idle",
            actions: assign({ message: null }),
          },
        },
        after: {
          [duration]: {
            target: "idle",
            actions: assign({ message: null }),
          },
        },
      },
    },
  });
}

/**
 * Controls confirmation feedback for a button from any component, including
 * a dialog that is rendered outside `Button.Root`.
 */
export function useButtonFeedback(duration = 3000) {
  const machine = useMemo(() => createButtonFeedbackMachine(duration), [duration]);
  const [snapshot, send] = useActor(machine);
  const confirm = useCallback((message: ReactNode) => send({ type: "CONFIRM", message }), [send]);
  const dismiss = useCallback(() => send({ type: "DISMISS" }), [send]);

  return {
    message: snapshot.context.message,
    confirmed: snapshot.matches("confirmed"),
    confirm,
    dismiss,
  };
}

export type ButtonFeedback = ReturnType<typeof useButtonFeedback>;

/**
 * A full-width action button with default and outline visual variants.
 *
 * Children are animated when they are added or removed, which makes the
 * component suitable for actions that switch between a label and a loading
 * state. Use `Button.Icon` for icons so the icon slot keeps a stable width.
 */
export function Button({ className, variant, children, ...props }: ButtonProps) {
  // AnimatePresence only tracks ReactElements; plain text children need a keyed wrapper
  // so they keep rendering instead of being silently dropped.
  const items = Children.map(children, (child, index) =>
    isValidElement(child) ? child : <Fragment key={`text-${index}`}>{child}</Fragment>,
  );

  return (
    <ButtonContext.Provider value={{ variant }}>
      <motion.button layout transition={{ type: "tween", duration: 0.15, ease: "linear" }} className={cn(buttonVariants({ variant }), className)} {...props}>
        <AnimatePresence initial={false} mode="popLayout">
          {items}
        </AnimatePresence>
      </motion.button>
    </ButtonContext.Provider>
  );
}

type ButtonRootProps = {
  feedback: ButtonFeedback;
  children: ReactNode;
};

/** Renders a button and its dynamic confirmation feedback together. */
function ButtonRoot({ feedback, children }: ButtonRootProps) {
  return (
    <div className="relative inline-block">
      {children}
      <AnimatePresence>
        {feedback.confirmed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "linear" }}
            className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 items-center gap-1.5 text-nowrap rounded-md border border-border bg-card px-3 py-1.5 text-sm text-success-foreground shadow-[0_4px_12px_rgb(61_46_31_/_15%)]"
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

Button.Root = ButtonRoot;
Button.Trigger = Button;

/** An animated 16px icon slot for the start or end of a button label. */
function ButtonIcon({ children }: { children: ReactNode }) {
  const variant = useButtonVariant();
  return (
    <motion.span
      layout
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 16, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "tween", duration: 0.15, ease: "linear" }}
      data-variant={variant}
      className="inline-flex shrink-0 items-center justify-center overflow-hidden [&_svg]:size-4"
    >
      {children}
    </motion.span>
  );
}

Button.Icon = ButtonIcon;
