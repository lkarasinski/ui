import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { ChevronRight, Search, SearchX, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";
import { isApplePlatform, Kbd } from "./kbd";
import { Progress } from "./progress";
import { Skeleton } from "./skeleton";

const contentVariants = cva(
  "fixed top-[10vh] left-1/2 z-51 flex max-h-[min(600px,76vh)] w-[calc(100vw-24px)] -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-[0_24px_60px_rgb(61_46_31_/_26%)] data-[state=closed]:animate-command-content-out data-[state=open]:animate-command-content-in motion-reduce:animate-none sm:top-[14vh]",
  {
    variants: {
      size: {
        sm: "sm:w-[420px]",
        md: "sm:w-[560px]",
        lg: "sm:w-[720px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const inputRowVariants = cva("relative flex shrink-0 items-center border-b border-border", {
  variants: {
    density: {
      compact: "h-11 gap-2 px-3",
      comfortable: "h-14 gap-2.5 px-4",
    },
  },
  defaultVariants: { density: "comfortable" },
});

const listVariants = cva("min-h-0 flex-1 scroll-py-2 overflow-y-auto overscroll-contain p-2", {
  variants: {
    size: {
      sm: "max-h-[280px]",
      md: "max-h-[340px]",
      lg: "max-h-[420px]",
    },
  },
  defaultVariants: { size: "md" },
});

const itemVariants = cva(
  "group relative flex cursor-pointer items-center rounded-md text-card-foreground outline-none transition-colors duration-100 select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-muted",
  {
    variants: {
      density: {
        compact: "min-h-8 gap-2 px-2 py-1 text-sm [&_svg]:size-3.5",
        comfortable: "min-h-10 gap-2.5 px-2.5 py-1.5 text-sm [&_svg]:size-4",
      },
    },
    defaultVariants: { density: "comfortable" },
  },
);

const groupVariants = cva(
  "mt-1 first:mt-0 [&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[0.04em] [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase",
  {
    variants: {
      density: {
        compact: "[&_[cmdk-group-heading]]:h-6 [&_[cmdk-group-heading]]:px-2",
        comfortable: "[&_[cmdk-group-heading]]:h-7 [&_[cmdk-group-heading]]:px-2.5",
      },
    },
    defaultVariants: { density: "comfortable" },
  },
);

export type CommandSize = NonNullable<VariantProps<typeof contentVariants>["size"]>;
export type CommandDensity = NonNullable<VariantProps<typeof itemVariants>["density"]>;

/** One level of the page stack. The label is what the breadcrumb chip shows. */
export type CommandPageEntry = { value: string; label: string };

type CommandContextValue = {
  size: CommandSize;
  density: CommandDensity;
  loading: boolean;
  search: string;
  pages: CommandPageEntry[];
  /** Which way the last page change went, so the entering page slides from the right side. */
  direction: "forward" | "back";
  setSearch: (search: string) => void;
  pushPage: (page: CommandPageEntry) => void;
  popPage: () => void;
  popToDepth: (depth: number) => void;
};

const CommandContext = createContext<CommandContextValue | null>(null);

function useCommand<T>(selector: (context: CommandContextValue) => T) {
  return useContextSelector(CommandContext, (context) => (context ? selector(context) : (undefined as T)));
}

/** `<input>`-like targets swallow bare-key shortcuts; a chord with a modifier still wins. */
function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * Matches a `"mod+k"`-style descriptor against a real key event.
 *
 * `mod` is the platform's primary modifier — Command on Apple hardware, Control
 * everywhere else — so one string binds correctly on both. Modifiers are matched
 * exactly, so `mod+k` does not fire for `mod+shift+k`.
 */
function matchesShortcut(event: KeyboardEvent, shortcut: string) {
  const parts = shortcut.toLowerCase().split("+").map((part) => part.trim());
  const key = parts[parts.length - 1];
  const modifiers = parts.slice(0, -1);
  const wantMeta = modifiers.includes("meta") || modifiers.includes("cmd") || (modifiers.includes("mod") && isApplePlatform);
  const wantCtrl = modifiers.includes("ctrl") || modifiers.includes("control") || (modifiers.includes("mod") && !isApplePlatform);
  const wantAlt = modifiers.includes("alt") || modifiers.includes("option");
  const wantShift = modifiers.includes("shift");

  if (event.metaKey !== wantMeta || event.ctrlKey !== wantCtrl || event.altKey !== wantAlt || event.shiftKey !== wantShift) return false;
  // A shortcut with no modifier would otherwise steal every keystroke in a form.
  if (!wantMeta && !wantCtrl && !wantAlt && isEditableTarget(event.target)) return false;
  return event.key.toLowerCase() === key;
}

export type CommandProps = Omit<ComponentProps<typeof CommandPrimitive>, "label"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * A global key that toggles the palette — `"mod+k"`, `"ctrl+j"`, `"/"`. The
   * listener ignores keystrokes inside inputs when the shortcut has no modifier.
   */
  shortcut?: string;
  /**
   * Renders the palette inside this element instead of `document.body`. The
   * element needs its own containing block (a `transform` or `filter` is enough)
   * for the fixed positioning to land inside it.
   */
  container?: HTMLElement | null;
  /** Set to false for a palette that leaves the page behind it usable. */
  modal?: boolean;
  /**
   * A control that opens the palette, rendered outside the dialog. It has to be
   * a prop rather than a child, because children render *inside* the palette.
   */
  trigger?: ReactNode;
  size?: CommandSize;
  density?: CommandDensity;
  /** Shows the loading edge under the input and suppresses the empty state. */
  loading?: boolean;
  /** Controlled search text. Leave it out and the palette owns it. */
  search?: string;
  onSearchChange?: (search: string) => void;
  /**
   * Called when the palette takes focus on open. Prevent the event to leave focus
   * where it was — several palettes on one page would otherwise fight over it.
   */
  onOpenAutoFocus?: ComponentProps<typeof DialogPrimitive.Content>["onOpenAutoFocus"];
  /** The accessible name of the dialog. Not shown. */
  label?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * A command palette in a dialog.
 *
 * The root owns everything that spans the palette: open state, the search text,
 * the page stack, and the size and density the parts read through a context
 * selector. That is what lets `Command.Item` push a sub-page and lets
 * `Command.Detail` preview the highlighted row without either one being handed
 * props from the top.
 *
 * Search text and the page stack reset when the palette *opens*, never when it
 * closes, so nothing flashes back to the root page behind the exit animation.
 *
 * ```tsx
 * <Command shortcut="mod+k" size="lg">
 *   <Command.Input placeholder="Search commands…" />
 *   <Command.Home>
 *     <Command.Body>
 *       <Command.List>
 *         <Command.Empty />
 *         <Command.Group heading="Actions">
 *           <Command.Item icon={<Plus />} shortcut="mod+n">New project</Command.Item>
 *           <Command.Item icon={<Palette />} page="theme">Change theme</Command.Item>
 *         </Command.Group>
 *       </Command.List>
 *     </Command.Body>
 *   </Command.Home>
 *   <Command.Page value="theme">…</Command.Page>
 * </Command>
 * ```
 */
export function Command({
  open,
  defaultOpen = false,
  onOpenChange,
  shortcut,
  container,
  modal = true,
  trigger,
  size = "md",
  density = "comfortable",
  loading = false,
  search,
  onSearchChange,
  onOpenAutoFocus,
  label = "Command palette",
  className,
  children,
  ...props
}: CommandProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [uncontrolledSearch, setUncontrolledSearch] = useState("");
  const [pages, setPages] = useState<CommandPageEntry[]>([]);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const currentOpen = open ?? uncontrolledOpen;
  const currentSearch = search ?? uncontrolledSearch;

  const openRef = useRef(currentOpen);
  openRef.current = currentOpen;
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  const setSearch = useCallback(
    (next: string) => {
      if (search === undefined) setUncontrolledSearch(next);
      onSearchChange?.(next);
    },
    [onSearchChange, search],
  );

  // Reset on the way in, never on the way out — clearing on close would swap the
  // content out while the palette is still fading. This runs on the open state
  // itself rather than in the change handler, so it also covers an app that flips
  // `open` from somewhere else entirely. Adjusting state during render is React's
  // documented answer to a prop changing, and it costs no effect.
  const previousOpenRef = useRef(currentOpen);
  if (previousOpenRef.current !== currentOpen) {
    previousOpenRef.current = currentOpen;
    if (currentOpen) {
      setPages([]);
      setDirection("forward");
      setUncontrolledSearch("");
    }
  }

  const handleOpenChange = useCallback(
    (next: boolean) => {
      // A controlled search belongs to the consumer, so clear it on their behalf.
      if (next) onSearchChange?.("");
      if (open === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, onSearchChange, open],
  );

  const handleOpenChangeRef = useRef(handleOpenChange);
  handleOpenChangeRef.current = handleOpenChange;

  // A global key binding is DOM-wide state, so it has to be an effect. The
  // handler reads open state from a ref to keep the listener registered once.
  useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || !matchesShortcut(event, shortcut)) return;
      event.preventDefault();
      handleOpenChangeRef.current(!openRef.current);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcut]);

  const pushPage = useCallback(
    (page: CommandPageEntry) => {
      setDirection("forward");
      setPages((current) => [...current, page]);
      setSearch("");
    },
    [setSearch],
  );

  const popPage = useCallback(() => {
    setDirection("back");
    setPages((current) => current.slice(0, -1));
    setSearch("");
  }, [setSearch]);

  const popToDepth = useCallback(
    (depth: number) => {
      setDirection("back");
      setPages((current) => current.slice(0, depth));
      setSearch("");
    },
    [setSearch],
  );

  return (
    <DialogPrimitive.Root open={currentOpen} onOpenChange={handleOpenChange} modal={modal}>
      <CommandContext.Provider
        value={{ size, density, loading, search: currentSearch, pages, direction, setSearch, pushPage, popPage, popToDepth }}
      >
        {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
        <DialogPrimitive.Portal container={container ?? undefined}>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/28 data-[state=closed]:animate-dialog-overlay-out data-[state=open]:animate-dialog-overlay-in motion-reduce:animate-none" />
          <DialogPrimitive.Content
            className={cn(contentVariants({ size }), className)}
            onOpenAutoFocus={onOpenAutoFocus}
            // Escape walks back out of a sub-page before it closes the palette.
            onEscapeKeyDown={(event) => {
              if (pagesRef.current.length > 0) {
                event.preventDefault();
                popPage();
              }
            }}
          >
            <DialogPrimitive.Title className="sr-only">{label}</DialogPrimitive.Title>
            <CommandPrimitive
              label={label}
              loop
              {...props}
              className="flex min-h-0 flex-1 flex-col"
              onKeyDown={(event) => {
                props.onKeyDown?.(event);
                if (event.defaultPrevented) return;
                // Backspace on an empty field is the fastest way back a level.
                if (event.key === "Backspace" && currentSearch === "" && pagesRef.current.length > 0) {
                  event.preventDefault();
                  popPage();
                }
              }}
            >
              {children}
            </CommandPrimitive>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </CommandContext.Provider>
    </DialogPrimitive.Root>
  );
}

export type CommandInputProps = Omit<ComponentProps<typeof CommandPrimitive.Input>, "value" | "onValueChange"> & {
  /** Replaces the leading magnifier. */
  icon?: ReactNode;
  /** Rendered at the end of the row — an Esc chip, a scope selector, a count. */
  trailing?: ReactNode;
};

/**
 * The search row: leading icon, the breadcrumb of open sub-pages, the field, and
 * a loading edge along the bottom border.
 *
 * The field is driven by the root, so pushing a page can clear it. The loading
 * edge is absolutely positioned and 2px tall, so it appears without moving the
 * list below it.
 */
export function CommandInput({ icon, trailing, className, placeholder = "Search…", autoFocus = true, ...props }: CommandInputProps) {
  const density = useCommand((context) => context.density) ?? "comfortable";
  const loading = useCommand((context) => context.loading) ?? false;
  const search = useCommand((context) => context.search) ?? "";
  const pages = useCommand((context) => context.pages);
  const setSearch = useCommand((context) => context.setSearch);
  const popToDepth = useCommand((context) => context.popToDepth);

  return (
    <div className={cn(inputRowVariants({ density }), className)}>
      <span aria-hidden="true" className="flex shrink-0 items-center text-muted-foreground [&_svg]:size-4">
        {icon ?? <Search strokeWidth={2} />}
      </span>
      {pages?.map((page, index) => (
        <button
          key={page.value}
          type="button"
          onClick={() => popToDepth?.(index)}
          className="inline-flex max-w-[40%] shrink-0 items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-card-foreground outline-none transition-colors hover:bg-secondary-hover focus-visible:ring-3 focus-visible:ring-primary/25"
        >
          <span className="truncate">{page.label}</span>
        </button>
      ))}
      <CommandPrimitive.Input
        {...props}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={search}
        onValueChange={(value) => setSearch?.(value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-card-foreground outline-none placeholder:text-muted-foreground"
      />
      {trailing}
      {loading && (
        <Progress size="sm" aria-label="Loading results" className="absolute inset-x-0 -bottom-px h-0.5 rounded-none bg-transparent" />
      )}
    </div>
  );
}

/** The scroll row: the list, and the detail pane beside it when there is one. */
export function CommandBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex min-h-0 flex-1 overflow-hidden", className)} {...props} />;
}

export type CommandListProps = ComponentProps<typeof CommandPrimitive.List>;

/**
 * The results. It scrolls on its own and caps its height by the root's `size`,
 * so a palette with three results is short and one with fifty is not taller than
 * the viewport.
 */
export function CommandList({ className, ...props }: CommandListProps) {
  const size = useCommand((context) => context.size) ?? "md";
  return <CommandPrimitive.List className={cn(listVariants({ size }), className)} {...props} />;
}

export type CommandGroupProps = ComponentProps<typeof CommandPrimitive.Group>;

/** A titled run of items. Groups hide themselves when the search filters all of their items out. */
export function CommandGroup({ className, ...props }: CommandGroupProps) {
  const density = useCommand((context) => context.density) ?? "comfortable";
  return <CommandPrimitive.Group className={cn(groupVariants({ density }), className)} {...props} />;
}

/** A rule between groups. It hides itself while a search is narrowing the list. */
export function CommandSeparator({ className, ...props }: ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator className={cn("my-1 h-px bg-border", className)} {...props} />;
}

export type CommandItemProps = Omit<ComponentProps<typeof CommandPrimitive.Item>, "children"> & {
  icon?: ReactNode;
  /** A second line under the label. Both lines truncate rather than wrap. */
  description?: ReactNode;
  /** A shortcut chip at the end of the row — `"mod+k"`, `["g", "h"]`. */
  shortcut?: string | string[];
  /** Extra content before the shortcut: a badge, a count, an avatar. */
  trailing?: ReactNode;
  /** Selecting the item pushes this sub-page instead of running an action. */
  page?: string;
  /** Overrides the breadcrumb text, which otherwise reads the item's own label. */
  pageLabel?: string;
  children?: ReactNode;
};

/**
 * One row.
 *
 * `icon`, `description`, `shortcut`, and `trailing` are slots, not switches —
 * they exist because every palette row has that shape, and anything richer goes
 * in `children`. An item with `page` gets a chevron and pushes a sub-page when
 * chosen, taking its breadcrumb text from its own label.
 */
export function CommandItem({ icon, description, shortcut, trailing, page, pageLabel, className, children, onSelect, ...props }: CommandItemProps) {
  const density = useCommand((context) => context.density) ?? "comfortable";
  const pushPage = useCommand((context) => context.pushPage);
  const labelRef = useRef<HTMLSpanElement>(null);

  return (
    <CommandPrimitive.Item
      {...props}
      className={cn(itemVariants({ density }), className)}
      onSelect={(value) => {
        if (page) pushPage?.({ value: page, label: pageLabel ?? labelRef.current?.textContent?.trim() ?? page });
        onSelect?.(value);
      }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary opacity-0 transition-opacity duration-100 group-data-[selected=true]:opacity-100 motion-reduce:transition-none"
      />
      {icon && (
        <span
          aria-hidden="true"
          className="relative flex shrink-0 items-center justify-center text-muted-foreground transition-colors duration-100 group-data-[selected=true]:text-primary"
        >
          {icon}
        </span>
      )}
      <span className="relative flex min-w-0 flex-1 flex-col">
        <span ref={labelRef} className="truncate">
          {children}
        </span>
        {description && <span className="truncate text-xs text-muted-foreground">{description}</span>}
      </span>
      {trailing && <span className="relative flex shrink-0 items-center gap-1.5">{trailing}</span>}
      {shortcut && <Kbd keys={shortcut} size={density === "compact" ? "sm" : "md"} className="relative" />}
      {page && <ChevronRight aria-hidden="true" className="relative shrink-0 text-muted-foreground" strokeWidth={2} />}
    </CommandPrimitive.Item>
  );
}

export type CommandEmptyProps = ComponentProps<typeof CommandPrimitive.Empty> & {
  icon?: ReactNode;
  title?: ReactNode;
};

/**
 * Shown when nothing matches.
 *
 * It stays hidden while the root is `loading`, so a search that is still in
 * flight never flashes "No results" before its own results land.
 */
export function CommandEmpty({ icon, title = "No results", className, children, ...props }: CommandEmptyProps) {
  const loading = useCommand((context) => context.loading) ?? false;
  if (loading) return null;

  return (
    <CommandPrimitive.Empty className={cn("flex flex-col items-center justify-center gap-2 px-6 py-10 text-center", className)} {...props}>
      <span aria-hidden="true" className="text-muted-foreground [&_svg]:size-5">
        {icon ?? <SearchX strokeWidth={1.8} />}
      </span>
      <span className="text-sm font-medium text-card-foreground">{title}</span>
      {children && <span className="text-xs text-muted-foreground">{children}</span>}
    </CommandPrimitive.Empty>
  );
}

export type CommandLoadingProps = ComponentProps<"div"> & {
  /** How many placeholder rows to draw. Match it to the list you usually get back. */
  rows?: number;
};

/** Widths that look like a list of commands rather than a stack of identical bars. */
const skeletonWidths = ["w-[58%]", "w-[41%]", "w-[67%]", "w-[35%]", "w-[52%]", "w-[46%]"];

/**
 * Placeholder rows for the first load of an async list.
 *
 * Use it only when there is nothing to show yet. Once results are on screen,
 * leave them there and let the loading edge under the input carry the refresh —
 * replacing a filled list with grey boxes on every keystroke is worse than a
 * slightly stale one.
 */
export function CommandLoading({ rows = 5, className, ...props }: CommandLoadingProps) {
  const density = useCommand((context) => context.density) ?? "comfortable";

  return (
    <Skeleton.Region label="Loading results" className={cn("flex flex-col gap-1", className)} {...props}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={cn("flex items-center", density === "compact" ? "min-h-8 gap-2 px-2" : "min-h-10 gap-2.5 px-2.5")}>
          <Skeleton shape="circle" className={density === "compact" ? "size-3.5" : "size-4"} />
          <Skeleton shape="text" className={skeletonWidths[index % skeletonWidths.length]} />
        </div>
      ))}
    </Skeleton.Region>
  );
}

export type CommandErrorProps = ComponentProps<"div"> & {
  icon?: ReactNode;
  title?: ReactNode;
};

/**
 * The failed state of an async list. Render it in place of the list, with the
 * retry control as children — the palette should never dead-end on an error.
 */
export function CommandError({ icon, title = "Could not load results", className, children, ...props }: CommandErrorProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center gap-2 px-6 py-10 text-center", className)} {...props}>
      <span aria-hidden="true" className="text-destructive [&_svg]:size-5">
        {icon ?? <TriangleAlert strokeWidth={1.8} />}
      </span>
      <span className="text-sm font-medium text-card-foreground">{title}</span>
      {children && <span className="flex flex-col items-center gap-3 text-xs text-muted-foreground">{children}</span>}
    </div>
  );
}

export type CommandDetailProps = Omit<ComponentProps<"div">, "children"> & {
  /** Nodes, or a function of the highlighted item's value. */
  children: ReactNode | ((value: string) => ReactNode);
  /** Stands in when nothing is highlighted, or when the render function returns nothing. */
  placeholder?: ReactNode;
};

/**
 * A preview beside the list, driven by whichever row is highlighted.
 *
 * It reads the highlighted value straight out of the command store, so moving
 * the selection with the arrow keys updates it without the list knowing the pane
 * exists. Its width is fixed, so switching rows never resizes the palette.
 *
 * Hidden below `md`, where the pane would leave the list too narrow to read.
 * Pair it with `size="md"` or `size="lg"`.
 */
export function CommandDetail({ children, placeholder = "Highlight a command to preview it.", className, ...props }: CommandDetailProps) {
  const value = useCommandState((state) => state.value);
  const content = typeof children === "function" ? children(value) : children;

  return (
    <div
      className={cn("hidden w-[38%] shrink-0 flex-col gap-2 overflow-y-auto border-l border-border bg-secondary p-3 text-sm md:flex", className)}
      {...props}
    >
      {content ?? <p className="m-0 text-xs text-muted-foreground">{placeholder}</p>}
    </div>
  );
}

/** Slides the entering page in from the side it came from. */
function CommandPageTransition({ className, ...props }: ComponentProps<"div">) {
  const direction = useCommand((context) => context.direction) ?? "forward";
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        direction === "forward" ? "animate-command-page-in" : "animate-command-page-back-in",
        "motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

/** The root page. It renders while the page stack is empty. */
export function CommandHome({ children, ...props }: ComponentProps<"div">) {
  const depth = useCommand((context) => context.pages.length) ?? 0;
  if (depth > 0) return null;
  return <CommandPageTransition {...props}>{children}</CommandPageTransition>;
}

export type CommandPageProps = ComponentProps<"div"> & {
  /** Matched against the `page` of the item that opened it. */
  value: string;
};

/**
 * A sub-page. It renders only while it is the top of the stack.
 *
 * Backspace on an empty field and Escape both pop one level; Escape only closes
 * the palette once the stack is empty. Search text clears on every push and pop,
 * so a sub-page always opens showing everything it has.
 */
export function CommandPage({ value, children, ...props }: CommandPageProps) {
  const current = useCommand((context) => context.pages.at(-1)?.value);
  if (current !== value) return null;
  return <CommandPageTransition {...props}>{children}</CommandPageTransition>;
}

/** The hint bar along the bottom. Hidden below `sm`, where there is no keyboard to hint at. */
export function CommandFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("hidden shrink-0 items-center gap-3 border-t border-border bg-secondary px-3 py-2 text-xs text-muted-foreground sm:flex", className)}
      {...props}
    />
  );
}

export type CommandHintProps = ComponentProps<"span"> & {
  keys: string | string[];
  separator?: string;
};

/** One `key — meaning` pair for the footer. */
export function CommandHint({ keys, separator, className, children, ...props }: CommandHintProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} {...props}>
      <Kbd keys={keys} separator={separator} size="sm" />
      {children}
    </span>
  );
}

Command.Input = CommandInput;
Command.Home = CommandHome;
Command.Page = CommandPage;
Command.Body = CommandBody;
Command.List = CommandList;
Command.Group = CommandGroup;
Command.Item = CommandItem;
Command.Separator = CommandSeparator;
Command.Empty = CommandEmpty;
Command.Loading = CommandLoading;
Command.Error = CommandError;
Command.Detail = CommandDetail;
Command.Footer = CommandFooter;
Command.Hint = CommandHint;
