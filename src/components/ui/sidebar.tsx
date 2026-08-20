import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronsLeft, ChevronsRight, type LucideIcon } from "lucide-react";
import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

const sidebarVariants = cva(
  "relative flex min-h-0 shrink-0 flex-col self-stretch bg-card text-card-foreground transition-[width] duration-200",
  {
    variants: {
      variant: {
        // Flush rail: sits against the shell and only separates itself with a right border.
        default: "border-r border-border",
        // Floating panel: carries its own gutter and elevation, so it needs no wrapper padding.
        inset: "m-2 rounded-lg border border-border shadow-[0_1px_2px_rgb(80_55_35_/_8%),0_10px_24px_rgb(61_46_31_/_8%)]",
      },
      collapsed: {
        true: "w-[60px]",
        false: "w-[240px]",
      },
    },
    defaultVariants: { variant: "default", collapsed: false },
  },
);

export type SidebarVariant = NonNullable<VariantProps<typeof sidebarVariants>["variant"]>;

const visuallyHidden = "absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]";

type SidebarContextValue = {
  activeKey: string;
  collapsed: boolean;
  onActiveKeyChange?: (key: string) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  showBrand: boolean;
};

const SidebarStateContext = createContext<SidebarContextValue | null>(null);

function useSidebar<T>(selector: (context: SidebarContextValue) => T) {
  return useContextSelector(SidebarStateContext, (context) => (context ? selector(context) : (undefined as T)));
}

export type SidebarRootProps = ComponentProps<"aside"> & {
  activeKey?: string;
  collapsed?: boolean;
  defaultActiveKey?: string;
  defaultCollapsed?: boolean;
  onActiveKeyChange?: (key: string) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Set to false when another surface — an inset navbar, usually — carries the logo. */
  showBrand?: boolean;
  variant?: SidebarVariant;
};

/**
 * A collapsible navigation rail that owns active-item and collapsed state.
 *
 * Both pieces of state work controlled (`activeKey`, `collapsed`) or uncontrolled
 * (`defaultActiveKey`, `defaultCollapsed`). Child blocks read the state through a
 * context selector, so they can be reordered or replaced without prop drilling.
 * The rail stretches to its flex parent; pass a height class for standalone use.
 */
export function SidebarRoot({
  activeKey,
  collapsed,
  defaultActiveKey = "home",
  defaultCollapsed = false,
  onActiveKeyChange,
  onCollapsedChange,
  showBrand = true,
  variant = "default",
  className,
  children,
  ...props
}: SidebarRootProps) {
  const [uncontrolledActiveKey, setUncontrolledActiveKey] = useState(defaultActiveKey);
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
  const currentActiveKey = activeKey ?? uncontrolledActiveKey;
  const currentCollapsed = collapsed ?? uncontrolledCollapsed;
  const isActiveControlled = activeKey !== undefined;
  const isCollapsedControlled = collapsed !== undefined;
  const contextValue = useMemo<SidebarContextValue>(
    () => ({
      activeKey: currentActiveKey,
      collapsed: currentCollapsed,
      onActiveKeyChange: (key) => {
        if (!isActiveControlled) setUncontrolledActiveKey(key);
        onActiveKeyChange?.(key);
      },
      onCollapsedChange: (nextCollapsed) => {
        if (!isCollapsedControlled) setUncontrolledCollapsed(nextCollapsed);
        onCollapsedChange?.(nextCollapsed);
      },
      showBrand,
    }),
    [currentActiveKey, currentCollapsed, isActiveControlled, isCollapsedControlled, onActiveKeyChange, onCollapsedChange, showBrand],
  );

  return (
    <SidebarStateContext.Provider value={contextValue}>
      <aside
        {...props}
        data-collapsed={currentCollapsed}
        data-variant={variant}
        className={cn(sidebarVariants({ variant, collapsed: currentCollapsed }), className)}
      >
        {children}
      </aside>
    </SidebarStateContext.Provider>
  );
}

/** The top slot of the rail, for a workspace switcher or another control. */
export function SidebarHeader({ children, className, ...props }: ComponentProps<"div">) {
  // The padding does not change with the rail, so the mark keeps its position while the rail narrows.
  // It is 4px tighter than the nav's so the 32px mark centres on the same column as the 16px icons.
  return <div className={cn("flex min-h-16 items-center gap-2 border-b border-border px-2.5", className)} {...props}>{children}</div>;
}

/**
 * A workspace switcher that keeps only its mark when the rail is collapsed.
 * It renders nothing when the sidebar is set to `showBrand={false}`.
 */
export function SidebarWorkspace({ name = "Northstar", detail = "Workspace", className }: { name?: string; detail?: string; className?: string }) {
  const collapsed = useSidebar((context) => context.collapsed);
  const showBrand = useSidebar((context) => context.showBrand) ?? true;
  if (!showBrand) return null;

  return (
    <button type="button" className={cn("group flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-primary/25", className)}>
      <span aria-hidden="true" className="relative grid size-8 shrink-0 place-items-center rounded-[9px] bg-foreground text-card">
        <span className="absolute h-3.5 w-1 rounded-full bg-primary" />
        <span className="absolute h-1 w-3.5 -translate-y-1 rounded-full bg-card" />
        <span className="absolute h-1 w-2.5 translate-y-1 rounded-full bg-card" />
      </span>
      {!collapsed && <span className="min-w-0 leading-none"><span className="block truncate text-[12px] font-bold tracking-[-0.02em] text-foreground">{name}</span><span className="mt-1 block truncate font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{detail}</span></span>}
      {!collapsed && <ChevronDown aria-hidden="true" className="ml-auto size-3.5 shrink-0 text-muted-foreground" />}
    </button>
  );
}

/**
 * The scrollable navigation region between header and footer.
 *
 * The x axis is clipped rather than left to compute to `auto` alongside
 * `overflow-y`, which would give the list a horizontal scrollbar for the frames
 * where the collapsing rail is a sub-pixel narrower than an icon tile needs.
 */
export function SidebarNav({ children, className, ...props }: ComponentProps<"nav">) {
  return <nav aria-label="Sidebar navigation" className={cn("min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4", className)} {...props}>{children}</nav>;
}

/** Groups related items with spacing below them. */
export function SidebarSection({ children, className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mb-5 last:mb-0", className)} {...props}>{children}</div>;
}

/**
 * A group heading. It is visually hidden while collapsed but stays readable to
 * assistive tech, since clipping it to no height leaves it in the tree.
 *
 * Rather than dropping out of flow and letting the group below snap up, the row
 * keeps the height of its text and gives it up over the same 200ms and the same
 * curve as the rail's width, so the icons ride up with the contraction.
 */
export function SidebarSectionLabel({ children, className, ...props }: ComponentProps<"div">) {
  const collapsed = useSidebar((context) => context.collapsed);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={false}
      animate={{ height: collapsed ? 0 : "auto", opacity: collapsed ? 0 : 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : // `ease` is the curve `transition-[width]` runs on, so the two stay in step.
            { height: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }, opacity: { duration: 0.12 } }
      }
      className="overflow-hidden"
    >
      <div className={cn("mb-1.5 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground", className)} {...props}>{children}</div>
    </motion.div>
  );
}

/**
 * A navigation item. `itemKey` identifies it against the sidebar's active key,
 * and the active item is marked with `aria-current="page"`.
 *
 * Collapsed items keep their icon and accessible name; the `end` slot is dropped
 * because it has no room. The icon holds its position through the transition —
 * the tile narrows around it instead of the icon sliding to the middle.
 */
export function SidebarItem({ itemKey, icon: Icon, end, children, className, ...props }: ComponentProps<"button"> & { end?: ReactNode; icon?: LucideIcon; itemKey: string }) {
  const activeKey = useSidebar((context) => context.activeKey);
  const collapsed = useSidebar((context) => context.collapsed);
  const onActiveKeyChange = useSidebar((context) => context.onActiveKeyChange);
  const active = activeKey === itemKey;

  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={() => onActiveKeyChange?.(itemKey)}
      className={cn(
        // Overflow is clipped so a label or badge that comes back on expand cannot spill past the narrow rail.
        "group relative flex min-h-10 w-full items-center gap-2.5 overflow-hidden rounded-md px-2.5 text-left text-xs font-semibold text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25",
        active && "bg-secondary text-foreground",
        className,
      )}
      {...props}
    >
      {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />}
      {Icon && <Icon aria-hidden="true" className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} strokeWidth={1.8} />}
      <span className={cn("min-w-0 flex-1 truncate", collapsed && visuallyHidden)}>{children}</span>
      {!collapsed && end}
    </button>
  );
}

/** A count or status pill for the `end` slot of an item. */
export function SidebarBadge({ children, className, ...props }: ComponentProps<"span">) {
  return <span className={cn("inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 font-mono text-[9px] font-medium text-muted-foreground", className)} {...props}>{children}</span>;
}

/** A hairline between two sections. */
export function SidebarDivider({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden="true" className={cn("my-3 h-px bg-border", className)} {...props} />;
}

/** The bottom slot of the rail, for settings or a primary action. */
export function SidebarFooter({ children, className, ...props }: ComponentProps<"div">) {
  return <div className={cn("border-t border-border p-3", className)} {...props}>{children}</div>;
}

/**
 * Collapses and expands the rail.
 *
 * It is a handle on the rail's outer edge rather than a block in a slot, so it
 * costs no row in either width — a 60px rail has no tile to spare. Render it
 * anywhere inside the rail; it positions itself against the rail either way.
 */
export function SidebarToggle({ className, ...props }: Omit<ComponentProps<"button">, "children">) {
  const collapsed = useSidebar((context) => context.collapsed);
  const onCollapsedChange = useSidebar((context) => context.onCollapsedChange);
  const Icon = collapsed ? ChevronsRight : ChevronsLeft;

  return <button type="button" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => onCollapsedChange?.(!collapsed)} className={cn("absolute top-1/2 -right-3 z-10 grid size-6 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-[0_1px_2px_rgb(80_55_35_/_10%)] outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25", className)} {...props}><Icon aria-hidden="true" className="size-3" strokeWidth={2} /></button>;
}

SidebarRoot.Header = SidebarHeader;
SidebarRoot.Workspace = SidebarWorkspace;
SidebarRoot.Nav = SidebarNav;
SidebarRoot.Section = SidebarSection;
SidebarRoot.SectionLabel = SidebarSectionLabel;
SidebarRoot.Item = SidebarItem;
SidebarRoot.Badge = SidebarBadge;
SidebarRoot.Divider = SidebarDivider;
SidebarRoot.Footer = SidebarFooter;
SidebarRoot.Toggle = SidebarToggle;

export const Sidebar = SidebarRoot;
