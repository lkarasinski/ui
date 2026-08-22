import { Alert } from "@/components/ui/alert";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Normalized lifecycle states. The icons follow the Linear convention:
 * outline circle, half-filled circle, dotted center, filled check.
 */
export type ItemState = "todo" | "in-progress" | "needs-review" | "done";

/** Orthogonal attention flags; a row can carry any combination. */
export type ItemFlag = "needs-my-action" | "blocked";

/** Colored glyph rendered before the row id, e.g. `#` for issues, `!` for merge requests. */
export type ItemPrefix = {
  glyph: string;
  className?: string;
};

export type TableItem = {
  /** Source-native id, rendered after the prefix glyph (`#123`, `!45`). */
  id: string;
  state: ItemState;
  flags: ItemFlag[];
  title: string;
  projectName?: string;
  /** Epoch milliseconds of the last update. */
  updatedAt: number;
  tags: string[];
  /** Optional colored prefix glyph shown before the id. */
  prefix?: ItemPrefix;
};

export type ItemGroup = {
  id: string;
  label: string;
  items: TableItem[];
  /** Inline failure banner under this group's header; its rows are then empty. */
  error?: string;
};

export type TableStatus =
  | { kind: "loading" }
  | { kind: "error"; message: string; onRetry?: () => void }
  | { kind: "ready" };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Short relative time in the dense-table register: `just now`, `5m`, `3h`,
 * `2d`, `6w`. Anything older falls back to weeks — these rows refresh too
 * often for month-level granularity to matter.
 */
export function formatRelativeTime(from: number, now = Date.now()): string {
  const elapsed = Math.max(0, now - from);
  if (elapsed < MINUTE) return "just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h`;
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)}d`;
  return `${Math.floor(elapsed / (7 * DAY))}w`;
}

const STATE_LABEL: Record<ItemState, string> = {
  todo: "todo",
  "in-progress": "in progress",
  "needs-review": "needs review",
  done: "done",
};

const STATE_CLASS: Record<ItemState, string> = {
  todo: "text-muted-foreground/70",
  "in-progress": "text-warning",
  "needs-review": "text-info",
  done: "text-success",
};

function StateGlyph({ state }: { state: ItemState }) {
  switch (state) {
    case "todo":
      return <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />;
    case "in-progress":
      return (
        <>
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 2 A6 6 0 0 0 8 14 Z" fill="currentColor" />
        </>
      );
    case "needs-review":
      return (
        <>
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2.5" fill="currentColor" />
        </>
      );
    case "done":
      return (
        <>
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <path
            d="M4.8 8.2 L7 10.4 L11.2 5.8"
            fill="none"
            stroke="var(--color-card)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
  }
}

/** The 16px lifecycle icon that leads every row, per the Linear convention. */
export function StateIcon({ state, className }: { state: ItemState; className?: string }) {
  return (
    <svg role="img" aria-label={STATE_LABEL[state]} viewBox="0 0 16 16" className={cn("size-4 shrink-0", STATE_CLASS[state], className)}>
      <StateGlyph state={state} />
    </svg>
  );
}

const FLAG_CLASS: Record<ItemFlag, string> = {
  "needs-my-action": "border-warning/40 bg-warning/10 text-warning",
  blocked: "border-destructive/40 bg-destructive/10 text-destructive",
};

const FLAG_LABEL: Record<ItemFlag, string> = {
  "needs-my-action": "action",
  blocked: "blocked",
};

export type ItemRowProps = {
  item: TableItem;
  focused: boolean;
  selected: boolean;
  now?: number;
  onSelect?: (item: TableItem) => void;
};

/**
 * One 44px row of the table: state icon, mono id with an optional colored
 * prefix, truncated title, flags, and right-aligned meta. Hairline divider,
 * no zebra.
 */
export function ItemRow({ item, focused, selected, now, onSelect }: ItemRowProps) {
  return (
    <div
      role="option"
      aria-selected={selected}
      data-testid="item-table-row"
      data-focused={focused || undefined}
      tabIndex={-1}
      onClick={() => onSelect?.(item)}
      className="group/row relative flex h-11 shrink-0 cursor-default items-center border-b border-border/60 px-3 text-sm outline-none"
    >
      {/* Fill layers paint bottom to top: focus, selection, hover. Each is
          translucent, so combinations darken instead of overwriting. */}
      <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", focused && "bg-accent")} />
      <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", selected && "bg-primary/[0.08]")} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-foreground/[0.06] opacity-0 transition-opacity duration-100 group-hover/row:opacity-100"
      />
      <span className="relative flex min-w-0 flex-1 items-center gap-2">
        <StateIcon state={item.state} />
        <span className="w-12 shrink-0 overflow-hidden font-mono text-[13px] tabular-nums whitespace-nowrap">
          {item.prefix && (
            <span aria-hidden="true" className={item.prefix.className}>
              {item.prefix.glyph}
            </span>
          )}
          <span className="text-muted-foreground">{item.id}</span>
        </span>
        <span className="min-w-0 flex-1 truncate text-foreground">{item.title}</span>
        {item.flags.map((flag) => (
          <span key={flag} className={cn("shrink-0 rounded border px-1.5 py-px text-[10px] font-medium leading-[14px]", FLAG_CLASS[flag])}>
            {FLAG_LABEL[flag]}
          </span>
        ))}
        <span className="ml-auto flex shrink-0 items-center gap-2 pl-2 text-[13px] text-muted-foreground">
          {item.projectName && <span className="max-w-40 truncate">{item.projectName}</span>}
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(item.updatedAt).toISOString()} className="w-10 text-right tabular-nums">
            {formatRelativeTime(item.updatedAt, now)}
          </time>
          {item.tags.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="flex max-w-48 gap-1 overflow-hidden">
                {item.tags.map((tag) => (
                  <span key={tag} className="truncate rounded bg-secondary px-1.5 py-px text-[10px] leading-[14px]">
                    {tag}
                  </span>
                ))}
              </span>
            </>
          )}
        </span>
      </span>
    </div>
  );
}

export type GroupHeaderProps = {
  label: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
};

/**
 * Sticky uppercase group header with a count badge. The whole header is the
 * collapse toggle, so there is one target to hit, not two.
 */
export function GroupHeader({ label, count, collapsed, onToggle }: GroupHeaderProps) {
  return (
    <button
      type="button"
      data-testid="item-table-group-header"
      aria-expanded={!collapsed}
      onClick={onToggle}
      className={cn(
        "sticky top-0 z-10 flex h-7 w-full shrink-0 items-center gap-1.5 border-b border-border bg-card px-3",
        "text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
        "transition-colors hover:text-foreground",
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className={cn("size-3 shrink-0 transition-transform", collapsed && "-rotate-90")}>
        <path d="M4 6 L8 10 L12 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span>{label}</span>
      <span className="rounded-full bg-secondary px-1.5 text-[10px] font-medium leading-4 tabular-nums">{count}</span>
    </button>
  );
}

export type EmptyStateProps = {
  title: string;
  hint?: string;
};

/** The full-area state shown when the table has nothing to render. */
export function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div data-testid="item-table-empty" className="flex flex-1 flex-col items-center justify-center gap-1 p-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint && <p className="max-w-xs text-[13px] leading-5 text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      data-testid="item-table-error"
      className="flex h-10 shrink-0 items-center gap-2 border-b border-destructive/25 bg-destructive/[0.04] px-3 text-[13px]"
    >
      <svg role="img" aria-label="error" viewBox="0 0 16 16" className="size-4 shrink-0 text-destructive">
        <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.75v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.25" r="0.875" fill="currentColor" />
      </svg>
      <span className="min-w-0 flex-1 truncate text-destructive">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          Retry
        </button>
      )}
    </div>
  );
}

const SKELETON_ROW_COUNT = 10;
const ERROR_SKELETON_ROW_COUNT = 4;

/** Placeholder rows shown while content is on its way. Purely decorative. */
function SkeletonRows({ count, className }: { count: number; className?: string }) {
  return (
    <div aria-hidden="true" className={className}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex h-11 shrink-0 items-center gap-2 border-b border-border/60 px-3">
          <span aria-hidden="true" className="size-4 shrink-0 animate-pulse rounded-full bg-secondary" />
          <span aria-hidden="true" className="h-3 w-12 shrink-0 animate-pulse rounded bg-secondary" />
          <span
            aria-hidden="true"
            className="h-3 min-w-0 flex-1 max-w-64 animate-pulse rounded bg-secondary"
            style={{ maxWidth: `${28 - (index % 5) * 3}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export type ItemTableProps = {
  /** Groups to render; empty groups are hidden. */
  groups: ItemGroup[];
  status: TableStatus;
  /** Uniquely names this table's collapse state in localStorage. */
  storageKey: string;
  selectedId?: string;
  onSelect?: (item: TableItem) => void;
  /** Retries a failed group fetch; only called when a group carries an error. */
  onGroupRetry?: (groupId: string) => void;
  /** Accessible name of the row list, e.g. "work items". */
  label: string;
  emptyTitle?: string;
  emptyHint?: string;
  className?: string;
  "data-testid"?: string;
};

function collapsedStorageKey(storageKey: string) {
  return `${storageKey}.collapsed-groups`;
}

function readCollapsedGroups(storageKey: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(collapsedStorageKey(storageKey));
    if (raw === null) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((entry): entry is string => typeof entry === "string")) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * The dense grouped table behind list-and-detail screens: 44px hairline rows,
 * sticky collapsible group headers, and one designed state per situation
 * (loading, error, empty, populated).
 *
 * `j`/`k` move a visual focus through the visible rows and Enter selects the
 * focused one. Group collapse persists through localStorage under the table's
 * `storageKey`, so it survives reloads.
 */
export function ItemTable({
  groups,
  status,
  storageKey,
  selectedId,
  onSelect,
  onGroupRetry,
  label,
  emptyTitle = "Nothing here",
  emptyHint,
  className,
  ...props
}: ItemTableProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCollapsed(readCollapsedGroups(storageKey));
  }, [storageKey]);

  const toggleGroup = useCallback(
    (groupId: string) => {
      setCollapsed((previous) => {
        const next = new Set(previous);
        if (next.has(groupId)) {
          next.delete(groupId);
        } else {
          next.add(groupId);
        }
        try {
          window.localStorage.setItem(collapsedStorageKey(storageKey), JSON.stringify([...next]));
        } catch {
          // Storage being unavailable must not break collapsing.
        }
        return next;
      });
    },
    [storageKey],
  );

  // Only non-empty groups render, and only their rows when expanded; the flat
  // list drives j/k movement across group boundaries.
  const visibleItems = useMemo(() => {
    const flat: Array<{ item: TableItem; groupId: string }> = [];
    for (const group of groups) {
      if (group.items.length === 0 || collapsed.has(group.id)) continue;
      for (const item of group.items) {
        flat.push({ item, groupId: group.id });
      }
    }
    return flat;
  }, [groups, collapsed]);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const focusIndexRef = useRef(0);
  focusIndexRef.current = focusedIndex;

  const clampedFocus = visibleItems.length === 0 ? -1 : Math.min(focusedIndex, visibleItems.length - 1);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (visibleItems.length === 0) return;
    if (event.key === "j" || event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex(Math.min(focusIndexRef.current + 1, visibleItems.length - 1));
    } else if (event.key === "k" || event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex(Math.max(focusIndexRef.current - 1, 0));
    } else if (event.key === "Enter" && clampedFocus >= 0) {
      onSelect?.(visibleItems[clampedFocus].item);
    }
  };

  let renderedUpTo = 0;

  return (
    <div
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...props}
      className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain outline-none", className)}
    >
      {status.kind === "loading" && (
        <div aria-label="loading" data-testid="item-table-loading">
          <SkeletonRows count={SKELETON_ROW_COUNT} />
        </div>
      )}

      {status.kind === "error" && (
        <div className="relative">
          {/* Dimmed skeletons hold the layout; the alert floats over their middle. */}
          <SkeletonRows count={ERROR_SKELETON_ROW_COUNT} className="opacity-60" />
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
            <Alert variant="warning" role="alert" data-testid="item-table-error" className="max-w-sm bg-card shadow-[0_4px_16px_rgb(61_46_31/_10%)]">
              <Alert.Icon>
                <TriangleAlert />
              </Alert.Icon>
              <Alert.Body>
                <Alert.Description>{status.message}</Alert.Description>
                {status.onRetry && (
                  <Alert.Actions>
                    <button
                      type="button"
                      onClick={status.onRetry}
                      className="inline-flex h-7 shrink-0 items-center rounded-md border border-border bg-secondary px-2.5 text-xs font-medium text-secondary-foreground shadow-[0_1px_2px_rgb(80_55_35_/_8%)] outline-none transition-colors hover:not-disabled:border-input hover:not-disabled:bg-secondary-hover focus-visible:ring-3 focus-visible:ring-primary/25"
                    >
                      Retry
                    </button>
                  </Alert.Actions>
                )}
              </Alert.Body>
            </Alert>
          </div>
        </div>
      )}

      {status.kind === "ready" &&
        groups.map((group) => {
          // A failed group still renders: its inline error banner replaces its rows.
          if (group.items.length === 0 && !group.error) return null;
          const isCollapsed = collapsed.has(group.id);
          const firstIndex = renderedUpTo;
          if (!isCollapsed) renderedUpTo += group.items.length;
          return (
            <section key={group.id} className="contents">
              <GroupHeader
                label={group.label}
                count={group.items.length}
                collapsed={isCollapsed}
                onToggle={() => toggleGroup(group.id)}
              />
              {group.error && (
                <ErrorBanner message={group.error} onRetry={onGroupRetry ? () => onGroupRetry(group.id) : undefined} />
              )}
              {!isCollapsed &&
                group.items.map((item, index) => {
                  const flatIndex = firstIndex + index;
                  return (
                    <ItemRow
                      key={item.id}
                      item={item}
                      focused={flatIndex === clampedFocus}
                      selected={item.id === selectedId}
                      onSelect={onSelect}
                    />
                  );
                })}
            </section>
          );
        })}

      {status.kind === "ready" && visibleItems.length === 0 && (
        <EmptyState
          title={emptyTitle}
          hint={emptyHint ?? (groups.some((group) => group.items.length > 0) ? "Every group is collapsed." : undefined)}
        />
      )}
    </div>
  );
}
