import { cva, type VariantProps } from "class-variance-authority";
import { useMemo, type ComponentProps } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

const appShellVariants = cva("flex w-full flex-col bg-background text-foreground", {
  variants: {
    // App shells hold the viewport and scroll their content; page shells grow and let the document scroll.
    scroll: {
      app: "h-screen overflow-hidden",
      page: "min-h-screen",
    },
  },
  defaultVariants: { scroll: "app" },
});

const appShellHeaderVariants = cva("w-full shrink-0", {
  variants: {
    scroll: {
      app: "",
      // Nothing pins the header when the document scrolls, so it sticks itself.
      page: "sticky top-0 z-40",
    },
  },
  defaultVariants: { scroll: "app" },
});

const appShellSidebarVariants = cva("flex shrink-0", {
  variants: {
    scroll: {
      app: "",
      // The rail would stretch with the document and scroll away, so the slot holds it in view.
      page: "sticky top-0 h-screen self-start",
    },
  },
  defaultVariants: { scroll: "app" },
});

const appShellMainVariants = cva("flex min-h-0 min-w-0 flex-1 flex-col", {
  variants: {
    variant: {
      flush: "bg-background",
      inset: "m-2 rounded-lg border border-border bg-card shadow-[0_1px_2px_rgb(80_55_35_/_8%),0_10px_24px_rgb(61_46_31_/_8%)]",
    },
    scroll: {
      // `contain` keeps the overscroll bounce inside the content and stops it chaining
      // out to the shell, so the navbar and the rail never ride along with it.
      app: "overflow-y-auto overscroll-y-contain",
      page: "",
    },
  },
  defaultVariants: { variant: "flush", scroll: "app" },
});

const appShellAsideVariants = cva("hidden w-[320px] shrink-0 flex-col overflow-y-auto overscroll-y-contain lg:flex", {
  variants: {
    variant: {
      flush: "border-l border-border bg-card",
      inset: "m-2 ml-0 rounded-lg border border-border bg-card shadow-[0_1px_2px_rgb(80_55_35_/_8%),0_10px_24px_rgb(61_46_31_/_8%)]",
    },
  },
  defaultVariants: { variant: "flush" },
});

const appShellFooterVariants = cva("flex min-h-9 shrink-0 items-center gap-3 px-4 text-xs text-muted-foreground", {
  variants: {
    variant: {
      flush: "border-t border-border bg-card",
      inset: "m-2 mt-0 rounded-lg border border-border bg-card",
    },
  },
  defaultVariants: { variant: "flush" },
});

const appShellContentVariants = cva("mx-auto w-full px-5 py-6 md:px-8 md:py-10", {
  variants: {
    width: {
      full: "max-w-none",
      wide: "max-w-6xl",
      narrow: "max-w-2xl",
    },
  },
  defaultVariants: { width: "wide" },
});

export type AppShellVariant = NonNullable<VariantProps<typeof appShellMainVariants>["variant"]>;
export type AppShellScroll = NonNullable<VariantProps<typeof appShellVariants>["scroll"]>;

type AppShellContextValue = {
  scroll: AppShellScroll;
  variant: AppShellVariant;
};

const AppShellStateContext = createContext<AppShellContextValue | null>(null);

function useAppShell<T>(selector: (context: AppShellContextValue) => T) {
  return useContextSelector(AppShellStateContext, (context) => (context ? selector(context) : (undefined as T)));
}

export type AppShellRootProps = ComponentProps<"div"> & {
  scroll?: AppShellScroll;
  variant?: AppShellVariant;
};

/**
 * The page frame that holds a navbar, a sidebar, and the content area.
 *
 * The shell only arranges surfaces; the navbar and sidebar keep their own chrome
 * and state. Its two axes are the chrome of the content surfaces (`variant`) and
 * how the page scrolls (`scroll`); both reach the blocks below through context, so
 * a block can be moved or replaced without threading props.
 */
export function AppShellRoot({ scroll = "app", variant = "flush", className, children, ...props }: AppShellRootProps) {
  const contextValue = useMemo<AppShellContextValue>(() => ({ scroll, variant }), [scroll, variant]);

  return (
    <AppShellStateContext.Provider value={contextValue}>
      <div {...props} data-scroll={scroll} data-variant={variant} className={cn(appShellVariants({ scroll }), className)}>
        {children}
      </div>
    </AppShellStateContext.Provider>
  );
}

/**
 * The full-width slot above the body, for a `Navbar`.
 *
 * It paints nothing of its own — the navbar brings its own height, border, and
 * background — and it renders a `div` so the navbar stays the only `header`.
 */
export function AppShellHeader({ className, children, ...props }: ComponentProps<"div">) {
  const scroll = useAppShell((context) => context.scroll);
  return <div className={cn(appShellHeaderVariants({ scroll }), className)} {...props}>{children}</div>;
}

/** The row holding the sidebar, the content column, and an optional detail panel. */
export function AppShellBody({ className, children, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex min-h-0 w-full flex-1", className)} {...props}>{children}</div>;
}

/**
 * The slot for the `Sidebar` inside the body.
 *
 * In a `page` shell it keeps the rail in view while the document scrolls; pair
 * that with the docked arrangement so the sticky header does not cover it.
 */
export function AppShellSidebar({ className, children, ...props }: ComponentProps<"div">) {
  const scroll = useAppShell((context) => context.scroll);
  return <div className={cn(appShellSidebarVariants({ scroll }), className)} {...props}>{children}</div>;
}

/**
 * A vertical stack inside the body, for arrangements where the sidebar runs the
 * full height and the header belongs beside it rather than above it.
 */
export function AppShellColumn({ className, children, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)} {...props}>{children}</div>;
}

/**
 * The main content surface. It scrolls on its own in an `app` shell and grows
 * with the document in a `page` shell.
 *
 * Only the `app` shell can bounce the content alone: a `page` shell hands the
 * scroll to the document, so the overscroll is the document's and the sticky
 * chrome moves with it.
 */
export function AppShellMain({ className, children, ...props }: ComponentProps<"main">) {
  const scroll = useAppShell((context) => context.scroll);
  const variant = useAppShell((context) => context.variant);
  return <main className={cn(appShellMainVariants({ scroll, variant }), className)} {...props}>{children}</main>;
}

export type AppShellContentProps = ComponentProps<"div"> & VariantProps<typeof appShellContentVariants>;

/** A centered, padded measure inside `AppShell.Main`. Use `width` to keep long-form content readable. */
export function AppShellContent({ width, className, children, ...props }: AppShellContentProps) {
  return <div className={cn(appShellContentVariants({ width }), className)} {...props}>{children}</div>;
}

export type AppShellAsideProps = ComponentProps<"aside"> & { label: string };

/**
 * A detail or inspector panel beside the main content. It is hidden below `lg`,
 * where the panel content belongs on its own screen or in a dialog.
 *
 * `label` names the landmark, which a page with two complementary regions needs.
 */
export function AppShellAside({ label, className, children, ...props }: AppShellAsideProps) {
  const variant = useAppShell((context) => context.variant);
  return <aside aria-label={label} className={cn(appShellAsideVariants({ variant }), className)} {...props}>{children}</aside>;
}

/** A status bar across the bottom of the shell, for connection state, counts, or shortcuts. */
export function AppShellFooter({ className, children, ...props }: ComponentProps<"footer">) {
  const variant = useAppShell((context) => context.variant);
  return <footer className={cn(appShellFooterVariants({ variant }), className)} {...props}>{children}</footer>;
}

AppShellRoot.Header = AppShellHeader;
AppShellRoot.Body = AppShellBody;
AppShellRoot.Sidebar = AppShellSidebar;
AppShellRoot.Column = AppShellColumn;
AppShellRoot.Main = AppShellMain;
AppShellRoot.Content = AppShellContent;
AppShellRoot.Aside = AppShellAside;
AppShellRoot.Footer = AppShellFooter;

export const AppShell = AppShellRoot;
