import { cva, type VariantProps } from "class-variance-authority";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useId, useState, type ComponentProps, type KeyboardEvent } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

const tabsListVariants = cva("flex min-w-0 items-center gap-1 overflow-x-auto scrollbar-none", {
  variants: {
    variant: {
      // Underlined tabs for page-level sections.
      line: "gap-4 border-b border-border",
      // A segmented control for switching a view in place.
      pill: "gap-0.5 rounded-lg border border-border bg-muted p-1",
      // No track at all, for toolbars and card headers.
      ghost: "gap-1",
    },
  },
  defaultVariants: { variant: "line" },
});

const tabsTriggerVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center gap-1.5 border-0 bg-transparent text-sm font-medium whitespace-nowrap outline-none transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        line: "rounded-t-sm px-0.5 pt-1.5 pb-2.5 text-muted-foreground hover:not-disabled:text-foreground aria-selected:text-foreground",
        pill: "rounded-md px-2.5 py-1 text-muted-foreground hover:not-disabled:text-foreground aria-selected:text-card-foreground",
        ghost: "rounded-md px-2.5 py-1 text-muted-foreground hover:not-disabled:bg-muted hover:not-disabled:text-foreground aria-selected:text-foreground",
      },
    },
    defaultVariants: { variant: "line" },
  },
);

const tabsIndicatorVariants = cva("absolute", {
  variants: {
    variant: {
      line: "inset-x-0 -bottom-px h-0.5 rounded-full bg-primary",
      pill: "inset-0 rounded-md border border-border bg-card shadow-[0_1px_2px_rgb(80_55_35_/_8%)]",
      ghost: "inset-0 rounded-md bg-muted",
    },
  },
  defaultVariants: { variant: "line" },
});

export type TabsVariant = NonNullable<VariantProps<typeof tabsListVariants>["variant"]>;

type TabsContextValue = {
  value: string | undefined;
  baseId: string;
  variant: TabsVariant;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs<T>(selector: (context: TabsContextValue) => T) {
  return useContextSelector(TabsContext, (context) => (context ? selector(context) : (undefined as T)));
}

export type TabsRootProps = Omit<ComponentProps<"div">, "onChange"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
};

/**
 * A tab set that switches one region of the page.
 *
 * The root owns the active value — controlled through `value`, uncontrolled
 * through `defaultValue` — and shares it through a context selector, so a trigger
 * deep inside a header never needs the value passed down. Ids for the
 * tab/panel relationship are generated from the root.
 *
 * Tabs are for switching a view, not for a wizard: every panel should be
 * reachable at any time, in any order.
 */
export function TabsRoot({ value, defaultValue, onValueChange, variant = "line", className, children, ...props }: TabsRootProps) {
  const baseId = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = value ?? uncontrolledValue;

  return (
    <TabsContext.Provider
      value={{
        value: currentValue,
        baseId,
        variant,
        setValue: (nextValue) => {
          if (value === undefined) setUncontrolledValue(nextValue);
          onValueChange?.(nextValue);
        },
      }}
    >
      <LayoutGroup id={baseId}>
        <div data-variant={variant} className={cn("flex min-w-0 flex-col", className)} {...props}>
          {children}
        </div>
      </LayoutGroup>
    </TabsContext.Provider>
  );
}

export type TabsListProps = ComponentProps<"div"> & {
  /** Adds `h`/`l` next to the arrow keys. Off by default; turn it on in your own tools. */
  vimKeys?: boolean;
};

/**
 * The row of triggers.
 *
 * Arrow keys, Home, and End move between tabs and activate them, per the ARIA
 * tabs pattern. The list scrolls sideways rather than wrapping, so a narrow
 * viewport never costs a second row.
 */
export function TabsList({ vimKeys = false, className, onKeyDown, children, ...props }: TabsListProps) {
  const variant = useTabs((context) => context.variant) ?? "line";

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>, step: number | "first" | "last") => {
    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'));
    if (tabs.length === 0) return;
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      step === "first" ? tabs[0] : step === "last" ? tabs[tabs.length - 1] : tabs[(Math.max(current, 0) + step + tabs.length) % tabs.length];
    event.preventDefault();
    next.focus();
    next.click();
  };

  return (
    <div
      role="tablist"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowRight" || event.key === "ArrowDown" || (vimKeys && event.key === "l")) moveFocus(event, 1);
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp" || (vimKeys && event.key === "h")) moveFocus(event, -1);
        else if (event.key === "Home") moveFocus(event, "first");
        else if (event.key === "End") moveFocus(event, "last");
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export type TabsTriggerProps = ComponentProps<"button"> & { value: string };

/**
 * One tab. Only the selected trigger is in the tab order; the arrow keys move
 * between the rest, which is what keeps a long tab row from flooding Tab presses.
 */
export function TabsTrigger({ value, className, children, onClick, ...props }: TabsTriggerProps) {
  const selectedValue = useTabs((context) => context.value);
  const baseId = useTabs((context) => context.baseId);
  const variant = useTabs((context) => context.variant) ?? "line";
  const setValue = useTabs((context) => context.setValue);
  const reduceMotion = useReducedMotion();
  const selected = selectedValue === value;

  return (
    <button
      {...props}
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-controls={`${baseId}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      // Navigation-like switches feel faster when they commit on press.
      onMouseDown={(event) => {
        if (event.button === 0) setValue?.(value);
      }}
      onClick={(event) => {
        setValue?.(value);
        onClick?.(event);
      }}
      className={cn(tabsTriggerVariants({ variant }), className)}
    >
      {selected && (
        <motion.span
          aria-hidden="true"
          layoutId="tabs-indicator"
          transition={reduceMotion ? { duration: 0 } : { type: "tween", duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className={cn(tabsIndicatorVariants({ variant }))}
        />
      )}
      <span className="relative inline-flex items-center gap-1.5">{children}</span>
    </button>
  );
}

export type TabsContentProps = ComponentProps<"div"> & {
  value: string;
  /** Keeps the panel mounted while it is hidden, so scroll position and form state survive. */
  keepMounted?: boolean;
};

/** The panel for one tab. It is labelled by its trigger through the generated ids. */
export function TabsContent({ value, keepMounted = false, className, children, ...props }: TabsContentProps) {
  const selectedValue = useTabs((context) => context.value);
  const baseId = useTabs((context) => context.baseId);
  const selected = selectedValue === value;

  if (!selected && !keepMounted) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!selected}
      tabIndex={0}
      className={cn("min-w-0 pt-3.5 outline-none focus-visible:ring-3 focus-visible:ring-primary/25", className)}
      {...props}
    >
      {children}
    </div>
  );
}

TabsRoot.List = TabsList;
TabsRoot.Trigger = TabsTrigger;
TabsRoot.Content = TabsContent;

export const Tabs = TabsRoot;
