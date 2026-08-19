import { Search, Bell, ChevronDown, Command, Plus, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useId, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

export type NavbarVariant = "default" | "command" | "compact";

type NavbarContextValue = {
  activeKey: string;
  indicatorId: string;
  onActiveKeyChange?: (key: string) => void;
  variant: NavbarVariant;
};

const NavbarStateContext = createContext<NavbarContextValue | null>(null);

function useNavbar<T>(selector: (context: NavbarContextValue) => T) {
  return useContextSelector(NavbarStateContext, (context) => (context ? selector(context) : (undefined as T)));
}

type NavbarRootProps = ComponentProps<"header"> & {
  activeKey?: string;
  defaultActiveKey?: string;
  onActiveKeyChange?: (key: string) => void;
  variant?: NavbarVariant;
};

export function NavbarRoot({ activeKey, defaultActiveKey = "overview", onActiveKeyChange, variant = "default", className, children, ...props }: NavbarRootProps) {
  const [uncontrolledActiveKey, setUncontrolledActiveKey] = useState(defaultActiveKey);
  const indicatorId = useId();
  const currentActiveKey = activeKey ?? uncontrolledActiveKey;
  const isControlled = activeKey !== undefined;
  const height = variant === "command" ? 108 : variant === "compact" ? 52 : 64;
  const contextValue = useMemo<NavbarContextValue>(
    () => ({
      activeKey: currentActiveKey,
      indicatorId,
      onActiveKeyChange: (key) => {
        if (!isControlled) setUncontrolledActiveKey(key);
        onActiveKeyChange?.(key);
      },
      variant,
    }),
    [currentActiveKey, indicatorId, isControlled, onActiveKeyChange, variant],
  );

  return (
    <NavbarStateContext.Provider value={contextValue}>
      <header
        {...props}
        style={{ height, minHeight: height, maxHeight: height, ...props.style }}
        className={cn("w-full overflow-hidden border-b border-border bg-card text-card-foreground", className)}
      >
        {children}
      </header>
    </NavbarStateContext.Provider>
  );
}

export function NavbarBrand({ name = "Fieldnotes", eyebrow = "Workspace", className, children, ...props }: ComponentProps<"a"> & { name?: string; eyebrow?: string }) {
  return (
    <a href="#" className={cn("group inline-flex shrink-0 items-center gap-2.5 outline-none focus-visible:ring-3 focus-visible:ring-primary/25", className)} {...props}>
      {children ?? <span aria-hidden="true" className="relative grid size-8 place-items-center rounded-[9px] bg-foreground text-card">
        <span className="absolute h-3.5 w-1 rounded-full bg-primary" />
        <span className="absolute h-1 w-3.5 -translate-y-1 rounded-full bg-card" />
        <span className="absolute h-1 w-2.5 translate-y-1 rounded-full bg-card" />
      </span>}
      <span className="flex flex-col leading-none">
        <span className="text-[14px] font-bold tracking-[-0.03em] text-foreground">{name}</span>
        <span className="mt-1 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</span>
      </span>
    </a>
  );
}

export function NavbarNav({ children, className }: { children: ReactNode; className?: string }) {
  return <nav aria-label="Primary navigation" className={cn("flex items-stretch gap-1", className)}>{children}</nav>;
}

export function NavbarItem({ itemKey, icon: Icon, children, className, ...props }: ComponentProps<"button"> & { itemKey: string; icon?: LucideIcon }) {
  const activeKey = useNavbar((context) => context.activeKey);
  const onActiveKeyChange = useNavbar((context) => context.onActiveKeyChange);
  const indicatorId = useNavbar((context) => context.indicatorId);
  const variant = useNavbar((context) => context.variant);
  const reduceMotion = useReducedMotion();
  const active = activeKey === itemKey;

  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={() => onActiveKeyChange?.(itemKey)}
      className={cn(
        "relative inline-flex min-h-10 items-center gap-2 px-2.5 text-[12px] font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25",
        active && "text-foreground",
        variant === "compact" && "min-h-9 px-2 text-[11px]",
        className,
      )}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" className="size-3.5" strokeWidth={1.8} />}
      {children}
      {active && (
        <motion.span
          layoutId={`${indicatorId}-active-tab`}
          aria-hidden="true"
          transition={reduceMotion ? { duration: 0 } : { type: "tween", duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-2 bottom-[-1px] h-px bg-primary"
        />
      )}
    </button>
  );
}

export function NavbarSearch({ placeholder = "Search anything", className }: { placeholder?: string; className?: string }) {
  const variant = useNavbar((context) => context.variant);
  return (
    <label className={cn("group flex h-9 min-w-0 items-center gap-2 rounded-md border border-input bg-secondary px-2.5 text-muted-foreground transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-primary/15", variant === "command" ? "w-full max-w-[360px]" : "w-full max-w-[244px]", variant === "compact" && "h-8 max-w-[188px]", className)}>
      <Search aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
      <input aria-label={placeholder} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground" />
      <kbd className="hidden items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground sm:inline-flex"><Command className="size-2.5" />K</kbd>
    </label>
  );
}

export function NavbarActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("ml-auto flex items-center gap-1.5", className)}>{children}</div>;
}

export function NavbarIconButton({ label, icon: Icon, className, ...props }: ComponentProps<"button"> & { label: string; icon: LucideIcon }) {
  return <button type="button" aria-label={label} className={cn("inline-flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25", className)} {...props}><Icon aria-hidden="true" className="size-4" strokeWidth={1.8} /></button>;
}

export function NavbarProfile({ name = "Marta Nowak", initials = "MN", detail = "Product design", className }: { name?: string; initials?: string; detail?: string; className?: string }) {
  const variant = useNavbar((context) => context.variant);
  return (
    <button type="button" className={cn("group inline-flex min-w-max shrink-0 items-center gap-2 whitespace-nowrap rounded-md p-1 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-primary/25", className)}>
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#d8bca2] font-mono text-[10px] font-semibold text-[#4c3024]">{initials}</span>
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
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground", className)}><span aria-hidden="true" className="size-1.5 rounded-full bg-success" />{children}</span>;
}

NavbarRoot.Brand = NavbarBrand;
NavbarRoot.Nav = NavbarNav;
NavbarRoot.Item = NavbarItem;
NavbarRoot.Search = NavbarSearch;
NavbarRoot.Actions = NavbarActions;
NavbarRoot.IconButton = NavbarIconButton;
NavbarRoot.Profile = NavbarProfile;
NavbarRoot.Divider = NavbarDivider;
NavbarRoot.Context = NavbarContext;
NavbarRoot.Status = NavbarStatus;

export const Navbar = NavbarRoot;
