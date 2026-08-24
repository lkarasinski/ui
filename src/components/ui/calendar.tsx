import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentProps, type MouseEvent, type KeyboardEvent, type ReactNode } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

/** A range being picked has `to` undefined until the second click lands. */
export type CalendarRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type CalendarCommonProps = {
  /** Formats the month title and weekday names. Defaults to the runtime locale. */
  locale?: string;
  /** Day the week starts on. `0` is Sunday, `1` is Monday. */
  weekStartsOn?: 0 | 1;
  /** Dates for which this returns true cannot be selected and are skipped by keyboard moves. */
  isDateDisabled?: (date: Date) => boolean;
  /** Disables the whole control: no selection, no month navigation. */
  disabled?: boolean;
  /** Month shown initially when uncontrolled. */
  defaultMonth?: Date;
  /** Visible month when controlled; pass the first day of the month. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  className?: string;
  children?: ReactNode;
};

export type CalendarSingleProps = CalendarCommonProps & {
  mode?: "single";
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date | undefined) => void;
};

export type CalendarRangeProps = CalendarCommonProps & {
  mode: "range";
  value?: CalendarRange;
  defaultValue?: CalendarRange;
  onValueChange?: (value: CalendarRange) => void;
};

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

type CalendarContextValue = {
  mode: "single" | "range";
  disabled: boolean;
  locale: string | undefined;
  weekStartsOn: 0 | 1;
  titleId: string;
  viewMonth: Date;
  cursor: Date;
  rangeStart: Date | undefined;
  rangeEnd: Date | undefined;
  selecting: boolean;
  previewEnd: Date | undefined;
  focusSignal: { key: string; nonce: number } | null;
  isDateAllowed: (date: Date) => boolean;
  select: (date: Date) => void;
  hoverPreview: (date: Date | undefined) => void;
  setCursor: (date: Date, requestFocus: boolean) => void;
  navigate: (month: Date, focusDate?: Date) => void;
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

function useCalendar<T>(selector: (context: CalendarContextValue) => T) {
  return useContextSelector(CalendarContext, (context) => (context ? selector(context) : (undefined as T)));
}

// All arithmetic goes through the local-date constructors; adding milliseconds
// drifts an hour across DST transitions.
function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function addMonths(date: Date, amount: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + amount;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(date.getDate(), lastDay));
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Clamps a day-of-month onto `month`, e.g. January 31 becomes February 28. */
function clampIntoMonth(focusDate: Date, month: Date): Date {
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return new Date(month.getFullYear(), month.getMonth(), Math.min(focusDate.getDate(), lastDay));
}

function isSameDay(a: Date | undefined, b: Date | undefined): boolean {
  return a !== undefined && b !== undefined && a.getTime() === b.getTime();
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function compareDays(a: Date, b: Date): number {
  return a.getTime() - b.getTime();
}

function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDayKey(key: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function startOfWeek(date: Date, weekStartsOn: 0 | 1): Date {
  return addDays(date, -((date.getDay() - weekStartsOn + 7) % 7));
}

/** Six rows keep the grid height constant between months. */
function getMonthMatrix(month: Date, weekStartsOn: 0 | 1): Date[][] {
  const offset = (startOfMonth(month).getDay() - weekStartsOn + 7) % 7;
  const start = addDays(startOfMonth(month), -offset);
  return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)));
}

/**
 * Steps a candidate until it lands on an allowed date, walking in `onDisabled`
 * direction when the candidate itself is blocked. Undefined after a full sweep,
 * which only happens when an entire stretch is disabled.
 */
function advanceToAllowed(candidate: Date, onDisabled: (date: Date) => Date, isAllowed: (date: Date) => boolean): Date | undefined {
  let current = candidate;
  for (let tries = 0; tries < 62; tries += 1) {
    if (isAllowed(current)) return current;
    current = onDisabled(current);
  }
  return undefined;
}

/**
 * Month grid for picking single dates or a from-to range inside one calendar.
 *
 * The root owns the selection and the visible month — controlled through
 * `value`/`month`, uncontrolled through `defaultValue`/`defaultMonth`. It
 * renders nothing by itself: compose `Header`, `Previous`, `Title`, `Next`,
 * and `Grid` inside it so the surrounding surface stays yours.
 *
 * In `range` mode the first click starts a range and `to` stays undefined
 * until the second click completes it; clicking an earlier date restarts the
 * range, so a mis-pick never needs a reset button.
 */
export function CalendarRoot(props: CalendarProps) {
  const rangeProps = props.mode === "range" ? props : undefined;
  const singleProps = props.mode === "range" ? undefined : props;

  const disabled = props.disabled ?? false;
  const locale = props.locale;
  const weekStartsOn = props.weekStartsOn ?? 0;
  const isDateDisabled = props.isDateDisabled;
  const baseId = useId();

  const [stored, setStored] = useState<{ single?: Date; range?: CalendarRange }>(() => ({
    single: singleProps?.defaultValue,
    range: rangeProps?.defaultValue,
  }));
  const [viewMonthState, setViewMonthState] = useState<Date>(() =>
    startOfMonth(props.month ?? props.defaultMonth ?? stored.single ?? stored.range?.from ?? new Date()),
  );
  // While a range pick is in flight the draft start drives the visuals, even
  // for a controlled root whose owner may not echo the half-open range back.
  const [draftFrom, setDraftFrom] = useState<Date | undefined>();
  const [previewEnd, setPreviewEnd] = useState<Date | undefined>();
  const [cursorState, setCursorState] = useState<Date | undefined>();
  const [focusSignal, setFocusSignal] = useState<{ key: string; nonce: number } | null>(null);
  const focusNonce = useRef(0);

  const shownSingle = singleProps ? (singleProps.value ?? stored.single) : undefined;
  const shownRange = rangeProps ? (rangeProps.value ?? stored.range) : undefined;

  const viewMonth = props.month ? startOfMonth(props.month) : viewMonthState;
  const isDateAllowed = useCallback((date: Date) => !disabled && !(isDateDisabled?.(date) ?? false), [disabled, isDateDisabled]);

  // Roving-focus target before the first interaction: the selected date, else
  // today when visible, else the first allowed day of the visible month.
  const today = new Date();
  const cursor =
    cursorState ??
    shownSingle ??
    (isSameMonth(today, viewMonth)
      ? today
      : (advanceToAllowed(startOfMonth(viewMonth), (date) => addDays(date, 1), isDateAllowed) ?? startOfMonth(viewMonth)));

  // Single selections ride through the same endpoints the grid paints, so
  // both modes share one rendering path.
  const rangeStart = draftFrom ?? shownRange?.from ?? shownSingle;
  const rangeEnd = draftFrom ? undefined : (shownRange?.to ?? shownSingle);
  const selecting = draftFrom !== undefined;

  const commit = useCallback(
    (patch: { single?: Date; range?: CalendarRange }) => {
      if (rangeProps && rangeProps.value === undefined) setStored((previous) => ({ ...previous, ...patch }));
      else if (singleProps && singleProps.value === undefined && patch.single !== undefined)
        setStored((previous) => ({ ...previous, single: patch.single }));
    },
    [rangeProps, singleProps],
  );

  const navigate = useCallback(
    (month: Date, focusDate?: Date) => {
      const targetMonth = startOfMonth(month);
      if (!isSameMonth(targetMonth, viewMonth)) {
        if (props.month === undefined) setViewMonthState(targetMonth);
        props.onMonthChange?.(targetMonth);
      }
      if (focusDate) {
        const clamped = clampIntoMonth(focusDate, targetMonth);
        const allowed = advanceToAllowed(clamped, (date) => addDays(date, 1), isDateAllowed) ?? clamped;
        setCursorState(allowed);
        focusNonce.current += 1;
        setFocusSignal({ key: dayKey(allowed), nonce: focusNonce.current });
      }
    },
    [isDateAllowed, props.month, props.onMonthChange, viewMonth],
  );

  const select = useCallback(
    (date: Date) => {
      if (!isDateAllowed(date)) return;
      if (!isSameMonth(date, viewMonth)) navigate(date);
      if (rangeProps) {
        if (draftFrom === undefined || compareDays(date, draftFrom) < 0) {
          setDraftFrom(date);
          commit({ range: { from: date, to: undefined } });
          rangeProps.onValueChange?.({ from: date, to: undefined });
        } else {
          setDraftFrom(undefined);
          setPreviewEnd(undefined);
          commit({ range: { from: draftFrom, to: date } });
          rangeProps.onValueChange?.({ from: draftFrom, to: date });
        }
      } else if (singleProps) {
        commit({ single: date });
        singleProps.onValueChange?.(date);
      }
    },
    [commit, draftFrom, isDateAllowed, navigate, rangeProps, singleProps, viewMonth],
  );

  const hoverPreview = useCallback(
    (date: Date | undefined) => {
      // Only meaningful mid-pick; otherwise stray hovers would clear nothing.
      if (draftFrom === undefined) return;
      setPreviewEnd(date);
    },
    [draftFrom],
  );

  const setCursor = useCallback((date: Date, requestFocus: boolean) => {
    setCursorState(date);
    if (requestFocus) {
      focusNonce.current += 1;
      setFocusSignal({ key: dayKey(date), nonce: focusNonce.current });
    }
  }, []);

  const contextValue: CalendarContextValue = {
    mode: rangeProps ? "range" : "single",
    disabled,
    locale,
    weekStartsOn,
    titleId: `${baseId}-title`,
    viewMonth,
    cursor,
    rangeStart,
    rangeEnd,
    selecting,
    previewEnd,
    focusSignal,
    isDateAllowed,
    select,
    hoverPreview,
    setCursor,
    navigate,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      <div className={cn("w-fit", props.className)}>{props.children}</div>
    </CalendarContext.Provider>
  );
}

/** Row grouping the navigation buttons around `Title`; order stays free. */
export function CalendarHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-center justify-between gap-2 px-1 pb-2", className)} {...props} />;
}

const navigationButtonClassName =
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:not-disabled:bg-muted hover:not-disabled:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";

/** Moves the grid one month back, keeping the focused day-of-month. */
export function CalendarPrevious({ className, "aria-label": ariaLabel = "Previous month", onClick, ...props }: ComponentProps<"button">) {
  const viewMonth = useCalendar((context) => context.viewMonth);
  const cursor = useCalendar((context) => context.cursor);
  const disabled = useCalendar((context) => context.disabled);
  const navigate = useCalendar((context) => context.navigate);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(event) => {
        navigate(addMonths(viewMonth, -1), cursor);
        onClick?.(event);
      }}
      className={cn(navigationButtonClassName, className)}
      {...props}
    >
      <ChevronLeft aria-hidden="true" />
    </button>
  );
}

/** Moves the grid one month forward, keeping the focused day-of-month. */
export function CalendarNext({ className, "aria-label": ariaLabel = "Next month", onClick, ...props }: ComponentProps<"button">) {
  const viewMonth = useCalendar((context) => context.viewMonth);
  const cursor = useCalendar((context) => context.cursor);
  const disabled = useCalendar((context) => context.disabled);
  const navigate = useCalendar((context) => context.navigate);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(event) => {
        navigate(addMonths(viewMonth, 1), cursor);
        onClick?.(event);
      }}
      className={cn(navigationButtonClassName, className)}
      {...props}
    >
      <ChevronRight aria-hidden="true" />
    </button>
  );
}

/** The visible month and year, formatted through the root's locale. */
export function CalendarTitle({ className, ...props }: ComponentProps<"div">) {
  const titleId = useCalendar((context) => context.titleId);
  const viewMonth = useCalendar((context) => context.viewMonth);
  const locale = useCalendar((context) => context.locale);

  const label = useMemo(() => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(viewMonth), [locale, viewMonth]);

  return (
    <div
      id={titleId}
      className={cn("min-w-0 flex-1 truncate text-center text-sm font-semibold text-card-foreground", className)}
      {...props}
    >
      {label}
    </div>
  );
}

const todayDotClassName =
  "after:absolute after:bottom-1 after:left-1/2 after:h-[2px] after:w-3.5 after:-translate-x-1/2 after:rounded-full";

function CalendarDay({ date }: { date: Date }) {
  const viewMonth = useCalendar((context) => context.viewMonth);
  const cursor = useCalendar((context) => context.cursor);
  const rangeStart = useCalendar((context) => context.rangeStart);
  const rangeEnd = useCalendar((context) => context.rangeEnd);
  const selecting = useCalendar((context) => context.selecting);
  const previewEnd = useCalendar((context) => context.previewEnd);
  const isDateAllowed = useCalendar((context) => context.isDateAllowed);
  const select = useCalendar((context) => context.select);
  const hoverPreview = useCalendar((context) => context.hoverPreview);
  const setCursor = useCalendar((context) => context.setCursor);

  const outside = !isSameMonth(date, viewMonth);
  const notAllowed = !isDateAllowed(date);

  // Mid-pick, the hovered date stands in for `to`, so the band under the
  // pointer looks exactly like the committed range will.
  const effectiveStart = rangeStart;
  const effectiveEnd = rangeEnd ?? (selecting ? previewEnd : undefined);
  const isSelected = isSameDay(date, effectiveStart) || isSameDay(date, effectiveEnd);
  const inBand =
    effectiveStart !== undefined &&
    effectiveEnd !== undefined &&
    compareDays(date, effectiveStart) > 0 &&
    compareDays(date, effectiveEnd) < 0;
  const isToday = isSameDay(date, new Date());
  const isCursor = isSameDay(date, cursor);

  const bandSide =
    isSelected && isSameDay(date, effectiveStart) && !isSameDay(effectiveStart, effectiveEnd)
      ? "start"
      : isSelected && isSameDay(date, effectiveEnd) && !isSameDay(effectiveStart, effectiveEnd)
        ? "end"
        : null;

  return (
    <button
      type="button"
      role="gridcell"
      data-date={dayKey(date)}
      aria-selected={isSelected}
      aria-label={new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date)}
      tabIndex={isCursor ? 0 : -1}
      disabled={notAllowed}
      onMouseEnter={() => hoverPreview(outside ? undefined : date)}
      onFocus={() => setCursor(date, false)}
      onClick={() => select(date)}
      className={cn(
        "relative inline-flex size-9 cursor-pointer items-center justify-center text-sm tabular-nums outline-none transition-colors duration-100 focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:text-muted-foreground/40",
        outside && "text-muted-foreground/45",
        !outside && !isSelected && !inBand && "text-card-foreground hover:not-disabled:bg-accent",
        inBand && "rounded-none bg-primary/12 text-card-foreground",
        isSelected && "bg-primary text-primary-foreground hover:not-disabled:bg-primary-hover",
        bandSide === "start" && "rounded-l-md rounded-r-none",
        bandSide === "end" && "rounded-r-md rounded-l-none",
        isToday && todayDotClassName,
        isToday && isSelected ? "after:bg-primary-foreground" : isToday ? "after:bg-primary" : null,
      )}
    >
      {date.getDate()}
    </button>
  );
}

/**
 * Weekday header plus six week rows for the visible month.
 *
 * One cell is in the tab order; arrow keys move focus across days and weeks,
 * Home/End jump within the week, PageUp/PageDown change month and Shift adds
 * a year. Clicking a day from an adjacent month selects it and follows it.
 */
export function CalendarGrid({ className, onKeyDown, onMouseLeave, ...props }: ComponentProps<"div">) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedKey = useRef<string | null>(null);
  const titleId = useCalendar((context) => context.titleId);
  const viewMonth = useCalendar((context) => context.viewMonth);
  const cursor = useCalendar((context) => context.cursor);
  const disabled = useCalendar((context) => context.disabled);
  const locale = useCalendar((context) => context.locale);
  const weekStartsOn = useCalendar((context) => context.weekStartsOn);
  const focusSignal = useCalendar((context) => context.focusSignal);
  const isDateAllowed = useCalendar((context) => context.isDateAllowed);
  const hoverPreview = useCalendar((context) => context.hoverPreview);
  const navigate = useCalendar((context) => context.navigate);

  useEffect(() => {
    if (!focusSignal) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusSignal.key}"]`)?.focus();
  }, [focusSignal]);

  const weekdays = useMemo(() => {
    const sunday = new Date(2023, 0, 1);
    const shortFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const longFormatter = new Intl.DateTimeFormat(locale, { weekday: "long" });
    return Array.from({ length: 7 }, (_, index) => {
      const day = addDays(sunday, (index + weekStartsOn) % 7);
      return { short: shortFormatter.format(day), long: longFormatter.format(day) };
    });
  }, [locale, weekStartsOn]);

  const weeks = useMemo(() => getMonthMatrix(viewMonth, weekStartsOn), [viewMonth, weekStartsOn]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;

    let step: ((date: Date) => Date) | undefined;
    let onDisabled: (date: Date) => Date = (date) => addDays(date, 1);
    switch (event.key) {
      case "ArrowRight":
        step = (date) => addDays(date, 1);
        break;
      case "ArrowLeft":
        step = (date) => addDays(date, -1);
        break;
      case "ArrowDown":
        step = (date) => addDays(date, 7);
        break;
      case "ArrowUp":
        step = (date) => addDays(date, -7);
        break;
      case "Home":
        step = (date) => startOfWeek(date, weekStartsOn);
        break;
      case "End":
        step = (date) => addDays(startOfWeek(date, weekStartsOn), 6);
        onDisabled = (date) => addDays(date, -1);
        break;
      case "PageUp":
        step = (date) => addMonths(date, event.shiftKey ? -12 : -1);
        onDisabled = (date) => addDays(date, -1);
        break;
      case "PageDown":
        step = (date) => addMonths(date, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }

    // The ref tracks keyboard intent synchronously, so holding a key across a
    // month boundary cannot outrun the render that moves real DOM focus.
    const activeKey =
      document.activeElement instanceof HTMLElement ? (document.activeElement.dataset.date ?? null) : null;
    const base = parseDayKey(lastFocusedKey.current ?? activeKey ?? "") ?? cursor;
    const target = advanceToAllowed(step(base), onDisabled, isDateAllowed);
    if (target === undefined) return;

    event.preventDefault();
    lastFocusedKey.current = dayKey(target);
    navigate(target, target);
  };

  const clearPreview = (event: MouseEvent<HTMLDivElement>) => {
    hoverPreview(undefined);
    onMouseLeave?.(event);
  };

  return (
    <div
      {...props}
      ref={gridRef}
      role="grid"
      aria-labelledby={titleId}
      onMouseLeave={clearPreview}
      onKeyDown={handleKeyDown}
      className={cn("w-fit select-none", className)}
    >
      <div role="row" className="grid grid-cols-7 pb-1">
        {weekdays.map((weekday) => (
          <div
            key={weekday.long}
            role="columnheader"
            title={weekday.long}
            className="flex h-8 w-9 items-center justify-center font-mono text-xs uppercase tracking-wider text-muted-foreground"
          >
            {weekday.short}
          </div>
        ))}
      </div>
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} role="row" className="grid grid-cols-7 gap-y-1">
          {week.map((date) => (
            <CalendarDay key={dayKey(date)} date={date} />
          ))}
        </div>
      ))}
    </div>
  );
}

CalendarRoot.Root = CalendarRoot;
CalendarRoot.Header = CalendarHeader;
CalendarRoot.Previous = CalendarPrevious;
CalendarRoot.Next = CalendarNext;
CalendarRoot.Title = CalendarTitle;
CalendarRoot.Grid = CalendarGrid;

export const Calendar = CalendarRoot;
