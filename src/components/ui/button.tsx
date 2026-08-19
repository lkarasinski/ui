import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { Children, Fragment, isValidElement, type ReactNode } from "react";
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

export function Button({ className, variant, children, ...props }: ButtonProps) {
  // AnimatePresence only tracks ReactElements; plain text children need a keyed wrapper
  // so they keep rendering instead of being silently dropped.
  const items = Children.map(children, (child, index) =>
    isValidElement(child) ? child : <Fragment key={`text-${index}`}>{child}</Fragment>,
  );

  return (
    <ButtonContext.Provider value={{ variant }}>
      <motion.button layout transition={{ type: "spring", stiffness: 500, damping: 34 }} className={cn(buttonVariants({ variant }), className)} {...props}>
        <AnimatePresence initial={false} mode="popLayout">
          {items}
        </AnimatePresence>
      </motion.button>
    </ButtonContext.Provider>
  );
}

function ButtonIcon({ children }: { children: ReactNode }) {
  const variant = useButtonVariant();
  return (
    <motion.span
      layout
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "auto", opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      data-variant={variant}
      className="inline-flex shrink-0 items-center justify-center overflow-hidden [&_svg]:size-4"
    >
      {children}
    </motion.span>
  );
}

Button.Icon = ButtonIcon;
