import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Command, Menu, Search, X, type LucideIcon } from "lucide-react";
import { useId, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

export type NavbarVariant = "default" | "command" | "compact" | "inset";

type NavbarContextValue = {
  activeKey: string;
  indicatorId: string;
  menuOpen: boolean;
  onActiveKeyChange?: (key: string) => void;
  onMenuOpenChange?: (open: boolean) => void;
  showBrand: boolean;
  variant: NavbarVariant;
};

const NavbarStateContext = createContext<NavbarContextValue | null>(null);

function useNavbar<T>(selector: (context: NavbarContextValue) => T) {
  return useContextSelector(NavbarStateContext, (context) => (context ? selector(context) : (undefined as T)));
}

/** How a nav lays its items out: as tabs along the bar, or as rows inside the mobile menu. */
export type NavbarNavPresentation = "bar" | "menu";

const NavbarNavContext = createContext<NavbarNavPresentation>("bar");

function useNavPresentation() {
  return useContextSelector(NavbarNavContext, (presentation) => presentation);
}

/**
 * The heights are outer heights: `box-sizing: border-box` puts the hairline
 * inside them, so a `default` bar occupies exactly 64px the way a 64px
 * `Sidebar.Header` does and the two borders land on the same line.
 */
const navbarVariants = cva("flex flex-col overflow-hidden bg-card text-card-foreground", {
  variants: {
    variant: {
      default: "h-14 w-full border-b border-border sm:h-16",
      // Two bands: the 40px subrow plus the row above it.
      command: "h-24 w-full border-b border-border sm:h-[108px]",
      compact: "h-12 w-full border-b border-border sm:h-13",
      // Floating bar: carries its own gutter and elevation, so it needs no wrapper padding.
      inset: "m-1.5 h-14 rounded-lg border border-border shadow-[0_1px_2px_rgb(80_55_35_/_8%),0_10px_24px_rgb(61_46_31_/_8%)] sm:m-2 sm:h-16",
    },
  },
  defaultVariants: { variant: "default" },
});

type NavbarRootProps = ComponentProps<"header"> & {
  activeKey?: string;
  defaultActiveKey?: string;
  menuOpen?: boolean;
  onActiveKeyChange?: (key: string) => void;
  onMenuOpenChange?: (open: boolean) => void;
  /** Set to false when another surface — an inset sidebar, usually — carries the logo. */
  showBrand?: boolean;
  variant?: NavbarVariant;
};

/**
 * The bar itself. It owns the active item and the mobile menu, and hands both to
 * the blocks below through a context selector.
 *
 * Its height is an outer height that steps down below `sm`, so a bar shortens on
 * a phone instead of clipping what does not fit. `Navbar.Row` fills what is left
 * of it, which keeps the height in one place.
 */
export function NavbarRoot({ activeKey, defaultActiveKey = "overview", menuOpen, onActiveKeyChange, onMenuOpenChange, showBrand = true, variant = "default", className, children, ...props }: NavbarRootProps) {
  const [uncontrolledActiveKey, setUncontrolledActiveKey] = useState(defaultActiveKey);
  const [uncontrolledMenuOpen, setUncontrolledMenuOpen] = useState(false);
  const indicatorId = useId();
  const currentActiveKey = activeKey ?? uncontrolledActiveKey;
  const currentMenuOpen = menuOpen ?? uncontrolledMenuOpen;
  const isActiveControlled = activeKey !== undefined;
  const isMenuControlled = menuOpen !== undefined;
  const contextValue = useMemo<NavbarContextValue>(
    () => ({
      activeKey: currentActiveKey,
      indicatorId,
      menuOpen: currentMenuOpen,
      onActiveKeyChange: (key) => {
        if (!isActiveControlled) setUncontrolledActiveKey(key);
        // Picking a destination is what the menu is for, so it dismisses itself once one is picked.
        if (!isMenuControlled) setUncontrolledMenuOpen(false);
        onActiveKeyChange?.(key);
        onMenuOpenChange?.(false);
      },
      onMenuOpenChange: (open) => {
        if (!isMenuControlled) setUncontrolledMenuOpen(open);
        onMenuOpenChange?.(open);
      },
      showBrand,
      variant,
    }),
    [currentActiveKey, currentMenuOpen, indicatorId, isActiveControlled, isMenuControlled, onActiveKeyChange, onMenuOpenChange, showBrand, variant],
  );

  return (
    <NavbarStateContext.Provider value={contextValue}>
      <header {...props} data-variant={variant} className={cn(navbarVariants({ variant }), className)}>
        {children}
      </header>
    </NavbarStateContext.Provider>
  );
}

const navbarRowVariants = cva("mx-auto flex w-full min-h-0 flex-1 items-center gap-3 sm:gap-4", {
  variants: {
    variant: {
      default: "px-4 sm:px-5",
      command: "px-4 sm:px-5",
      compact: "px-3 sm:px-4",
      inset: "px-2.5 sm:px-3",
    },
    width: {
      full: "max-w-none",
      wide: "max-w-6xl",
      narrow: "max-w-5xl",
    },
  },
  defaultVariants: { variant: "default", width: "full" },
});

export type NavbarRowWidth = NonNullable<VariantProps<typeof navbarRowVariants>["width"]>;

/**
 * The horizontal band the bar's blocks sit in. It fills what the navbar's height
 * leaves it and takes its gutter from the variant, so nothing inside a bar has to
 * restate a height.
 *
 * `width` sets the measure the row centres on, matching `AppShell.Content`.
 */
export function NavbarRow({ width, className, children, ...props }: ComponentProps<"div"> & { width?: NavbarRowWidth }) {
  const variant = useNavbar((context) => context.variant) ?? "default";
  return <div className={cn(navbarRowVariants({ variant, width }), className)} {...props}>{children}</div>;
}

const navbarSubrowVariants = cva("mx-auto flex h-full w-full items-center gap-4 px-4 sm:px-5", {
  variants: {
    width: { full: "max-w-none", wide: "max-w-6xl", narrow: "max-w-5xl" },
  },
  defaultVariants: { width: "full" },
});

/**
 * The second band of the `command` variant, for a tab row under the search line.
 *
 * It is 40px including its hairline, and the row above takes whatever the
 * navbar's height leaves over.
 */
export function NavbarSubrow({ width, className, children, ...props }: ComponentProps<"div"> & { width?: NavbarRowWidth }) {
  return (
    <div className="h-10 w-full shrink-0 border-t border-border/70">
      <div className={cn(navbarSubrowVariants({ width }), className)} {...props}>{children}</div>
    </div>
  );
}

/** The logo block. It renders nothing when the navbar is set to `showBrand={false}`. */
export function NavbarBrand({ name = "Fieldnotes", className, children, ...props }: ComponentProps<"a"> & { name?: string }) {
  const showBrand = useNavbar((context) => context.showBrand) ?? true;
  if (!showBrand) return null;

  return (
    <a href="#" className={cn("group inline-flex min-w-0 shrink-0 items-center gap-2.5 outline-none focus-visible:ring-3 focus-visible:ring-primary/25", className)} {...props}>
      {children ?? <span aria-hidden="true" className="relative grid size-8 shrink-0 place-items-center rounded-[9px] bg-foreground text-card">
        <span className="absolute h-3.5 w-1 rounded-full bg-primary" />
        <span className="absolute h-1 w-3.5 -translate-y-1 rounded-full bg-card" />
        <span className="absolute h-1 w-2.5 translate-y-1 rounded-full bg-card" />
      </span>}
      <span className="truncate text-[14px] font-bold tracking-[-0.03em] text-foreground">{name}</span>
    </a>
  );
}

/**
 * A group of items. Pass `aria-label` when a navbar holds more than one group.
 *
 * In the bar it scrolls sideways rather than pushing its neighbours off the edge,
 * so a tab row survives a narrow viewport with every tab still reachable. In the
 * menu it stacks into full-width rows.
 */
export function NavbarNav({ presentation = "bar", children, className, ...props }: ComponentProps<"nav"> & { presentation?: NavbarNavPresentation }) {
  return (
    <NavbarNavContext.Provider value={presentation}>
      <nav
        aria-label={presentation === "menu" ? "Menu navigation" : "Primary navigation"}
        className={cn(
          presentation === "menu"
            ? "flex flex-col items-stretch gap-0.5"
            : "flex min-w-0 items-stretch gap-1 overflow-x-auto scrollbar-none",
          className,
        )}
        {...props}
      >
        {children}
      </nav>
    </NavbarNavContext.Provider>
  );
}

export function NavbarItem({ itemKey, icon: Icon, children, className, ...props }: ComponentProps<"button"> & { itemKey: string; icon?: LucideIcon }) {
  const activeKey = useNavbar((context) => context.activeKey);
  const onActiveKeyChange = useNavbar((context) => context.onActiveKeyChange);
  const indicatorId = useNavbar((context) => context.indicatorId);
  const variant = useNavbar((context) => context.variant);
  const presentation = useNavPresentation();
  const reduceMotion = useReducedMotion();
  const active = activeKey === itemKey;
  const inMenu = presentation === "menu";

  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={() => onActiveKeyChange?.(itemKey)}
      className={cn(
        "relative inline-flex min-h-10 items-center gap-2 px-2.5 text-[12px] font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25",
        active && "text-foreground",
        !inMenu && "shrink-0 whitespace-nowrap",
        !inMenu && variant === "compact" && "min-h-9 px-2 text-[11px]",
        !inMenu && variant === "inset" && "min-h-9 rounded-md hover:bg-muted",
        // A menu row is a touch target first: full width, 44px tall, and marked like a sidebar item.
        inMenu && "min-h-11 w-full justify-start rounded-md px-3 text-[13px] hover:bg-muted",
        inMenu && active && "bg-secondary",
        className,
      )}
      {...props}
    >
      {active && !inMenu && (
        <motion.span
          layoutId={`${indicatorId}-active-tab`}
          aria-hidden="true"
          transition={reduceMotion ? { duration: 0 } : { type: "tween", duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          // A floating bar has no edge to underline, so the active item takes a filled pill instead.
          className={cn(variant === "inset" ? "absolute inset-0 rounded-md bg-secondary" : "absolute inset-x-2 bottom-[-1px] h-px bg-primary")}
        />
      )}
      {active && inMenu && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />}
      <span className="relative inline-flex items-center gap-2">
        {Icon && <Icon aria-hidden="true" className={cn("shrink-0", inMenu ? "size-4" : "size-3.5", inMenu && active && "text-primary")} strokeWidth={1.8} />}
        {children}
      </span>
    </button>
  );
}

export function NavbarSearch({ placeholder = "Search anything", className }: { placeholder?: string; className?: string }) {
  const variant = useNavbar((context) => context.variant);
  return (
    <label className={cn("group flex h-9 min-w-0 items-center gap-2 rounded-md border border-input bg-secondary px-2.5 text-muted-foreground transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-primary/15", variant === "command" ? "w-full max-w-[360px]" : "w-full max-w-[244px]", variant === "compact" && "h-8 max-w-[188px]", className)}>
      <Search aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
      <input aria-label={placeholder} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground" />
      <kbd className="hidden items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 text-[9px] text-muted-foreground sm:inline-flex"><Command className="size-2.5" />K</kbd>
    </label>
  );
}

export function NavbarActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("ml-auto flex min-w-0 items-center gap-1 sm:gap-1.5", className)}>{children}</div>;
}

export function NavbarIconButton({ label, icon: Icon, className, ...props }: ComponentProps<"button"> & { label: string; icon: LucideIcon }) {
  // 40px on touch, 36px once there is a pointer and the row is tighter.
  return <button type="button" aria-label={label} className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25 sm:size-9", className)} {...props}><Icon aria-hidden="true" className="size-4" strokeWidth={1.8} /></button>;
}

/**
 * Opens the mobile menu. Hidden from `md` up, where `Navbar.Nav` shows the same
 * destinations in the bar; pass a `className` to move that boundary.
 */
export function NavbarMenuTrigger({ label = "Open navigation", className, ...props }: Omit<ComponentProps<"button">, "children"> & { label?: string }) {
  const menuOpen = useNavbar((context) => context.menuOpen) ?? false;
  const onMenuOpenChange = useNavbar((context) => context.onMenuOpenChange);

  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={menuOpen}
      aria-haspopup="dialog"
      onClick={() => onMenuOpenChange?.(true)}
      className={cn("-ml-1.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25 md:hidden", className)}
      {...props}
    >
      <Menu aria-hidden="true" className="size-5" strokeWidth={1.8} />
    </button>
  );
}

/**
 * The mobile menu: a drawer holding the destinations that do not fit the bar.
 *
 * It is a modal dialog, so it traps focus, closes on Escape or a tap outside, and
 * holds the page still behind it. Put a `Navbar.Nav presentation="menu"` inside —
 * items share the navbar's active key, and picking one closes the drawer.
 *
 * A drawer rather than a full-screen sheet: it keeps the page visible behind it,
 * so a mistaken tap on the trigger costs one tap to undo instead of a reorientation.
 */
export function NavbarMenu({ title = "Navigation", className, children }: { title?: string; className?: string; children: ReactNode }) {
  const menuOpen = useNavbar((context) => context.menuOpen) ?? false;
  const onMenuOpenChange = useNavbar((context) => context.onMenuOpenChange);
  const reduceMotion = useReducedMotion();

  return (
    <DialogPrimitive.Root open={menuOpen} onOpenChange={(open) => onMenuOpenChange?.(open)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-foreground/28", !reduceMotion && "data-[state=open]:animate-dialog-overlay-in data-[state=closed]:animate-dialog-overlay-out")} />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 left-0 z-51 flex w-[min(320px,86vw)] flex-col border-r border-border bg-card text-card-foreground shadow-[0_20px_45px_rgb(61_46_31_/_22%)]",
            !reduceMotion && "data-[state=open]:animate-navbar-menu-in data-[state=closed]:animate-navbar-menu-out",
            className,
          )}
        >
          <div className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-3">
            <DialogPrimitive.Title className="truncate text-[13px] font-bold tracking-[-0.02em] text-foreground">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Close aria-label="Close navigation" className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25">
              <X aria-hidden="true" className="size-4" strokeWidth={1.8} />
            </DialogPrimitive.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-y-contain p-3">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** A pinned block at the bottom of the menu, for the account row or a primary action. */
export function NavbarMenuFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mt-auto flex shrink-0 items-center gap-2 border-t border-border pt-3", className)}>{children}</div>;
}

export function NavbarProfile({ name = "Marta Nowak", initials = "MN", detail = "Product design", className }: { name?: string; initials?: string; detail?: string; className?: string }) {
  const variant = useNavbar((context) => context.variant);
  return (
    <button type="button" className={cn("group inline-flex min-w-max shrink-0 items-center gap-2 whitespace-nowrap rounded-md p-1 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-primary/25", className)}>
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#d8bca2] text-[10px] font-semibold text-[#4c3024]">{initials}</span>
      {variant !== "compact" && <span className="hidden min-w-max leading-none sm:block"><span className="block text-[11px] font-bold text-foreground">{name}</span><span className="mt-1 block text-[9px] text-muted-foreground">{detail}</span></span>}
      <ChevronDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
    </button>
  );
}

export function NavbarDivider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />;
}

export function NavbarContext({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-w-0 truncate border-l border-border pl-4 text-xs text-muted-foreground", className)}>{children}</div>;
}

export function NavbarStatus({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-[9px] uppercase tracking-[0.12em] text-muted-foreground", className)}><span aria-hidden="true" className="size-1.5 rounded-full bg-success" />{children}</span>;
}

NavbarRoot.Row = NavbarRow;
NavbarRoot.Subrow = NavbarSubrow;
NavbarRoot.Brand = NavbarBrand;
NavbarRoot.Nav = NavbarNav;
NavbarRoot.Item = NavbarItem;
NavbarRoot.Search = NavbarSearch;
NavbarRoot.Actions = NavbarActions;
NavbarRoot.IconButton = NavbarIconButton;
NavbarRoot.MenuTrigger = NavbarMenuTrigger;
NavbarRoot.Menu = NavbarMenu;
NavbarRoot.MenuFooter = NavbarMenuFooter;
NavbarRoot.Profile = NavbarProfile;
NavbarRoot.Divider = NavbarDivider;
NavbarRoot.Context = NavbarContext;
NavbarRoot.Status = NavbarStatus;

export const Navbar = NavbarRoot;
