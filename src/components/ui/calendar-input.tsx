import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Calendar, type CalendarRange } from "./calendar";

type CalendarInputCommonProps = {
  /** Connects a `<label>` to the trigger through `htmlFor`. */
  id?: string;
  /** Renders a hidden input with this name so the value submits with a form. */
  name?: string;
  /** Shown in the trigger while nothing is selected. */
  placeholder?: string;
  /** Shows an accessible clear action beside the trigger while a value is set. */
  clearable?: boolean;
  /** Accessible name of the trigger. Defaults to "Choose date". */
  "aria-label"?: string;
  disabled?: boolean;
  /** Formats the trigger text plus every label inside the calendar. */
  locale?: string;
  weekStartsOn?: 0 | 1;
  isDateDisabled?: (date: Date) => boolean;
  /** Month shown on open when no value is selected. */
  defaultMonth?: Date;
  /** Alignment of the floating panel against the trigger. */
  align?: "start" | "center" | "end";
  className?: string;
  /** Additional Tailwind classes merged onto the floating panel. */
  contentClassName?: string;
};

export type CalendarInputSingleProps = CalendarInputCommonProps & {
  mode?: "single";
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date | undefined) => void;
};

export type CalendarInputRangeProps = CalendarInputCommonProps & {
  mode: "range";
  value?: CalendarRange;
  defaultValue?: CalendarRange;
  onValueChange?: (value: CalendarRange) => void;
};

export type CalendarInputProps = CalendarInputSingleProps | CalendarInputRangeProps;

function formatDate(date: Date | undefined, locale: string | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Date field with the picker built in: a trigger styled like an input opens a
 * popover holding the `Calendar`, and the selection API matches `Calendar`,
 * so the two stay interchangeable.
 *
 * Single mode closes on pick; range mode stays open between the two clicks and
 * closes once the range completes. Escape and outside clicks close too. With
 * `clearable`, a clear action sits next to the trigger and hands focus back to
 * it afterwards. A hidden input carries the value into forms via `name`.
 */
export function CalendarInput(props: CalendarInputProps) {
  const rangeProps = props.mode === "range" ? props : undefined;
  const singleProps = props.mode === "range" ? undefined : props;

  const [open, setOpen] = useState(false);
  const [stored, setStored] = useState<{ single?: Date; range?: CalendarRange }>(() => ({
    single: singleProps?.defaultValue,
    range: rangeProps?.defaultValue,
  }));
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const shownSingle = singleProps ? (singleProps.value ?? stored.single) : undefined;
  const shownRange = rangeProps ? (rangeProps.value ?? stored.range) : undefined;

  const selectSingle = useCallback(
    (value: Date | undefined) => {
      if (!singleProps) return;
      if (singleProps.value === undefined) setStored((previous) => ({ ...previous, single: value }));
      singleProps.onValueChange?.(value);
      if (value !== undefined) setOpen(false);
    },
    [singleProps],
  );

  const selectRange = useCallback(
    (value: CalendarRange) => {
      if (!rangeProps) return;
      if (rangeProps.value === undefined) setStored((previous) => ({ ...previous, range: value }));
      rangeProps.onValueChange?.(value);
      // Keep the picker open between the two clicks of a range.
      if (value.to !== undefined) setOpen(false);
    },
    [rangeProps],
  );

  const clear = useCallback(() => {
    if (rangeProps) {
      if (rangeProps.value === undefined) setStored((previous) => ({ ...previous, range: { from: undefined, to: undefined } }));
      rangeProps.onValueChange?.({ from: undefined, to: undefined });
    } else if (singleProps) {
      if (singleProps.value === undefined) setStored((previous) => ({ ...previous, single: undefined }));
      singleProps.onValueChange?.(undefined);
    }
    setOpen(false);
    triggerRef.current?.focus();
  }, [rangeProps, singleProps]);

  const hasValue =
    shownSingle !== undefined || Boolean(shownRange?.from !== undefined || shownRange?.to !== undefined);

  const label =
    rangeProps !== undefined
      ? [formatDate(shownRange?.from, props.locale), formatDate(shownRange?.to, props.locale)].filter(Boolean).join(" – ")
      : formatDate(shownSingle, props.locale);

  const serializedFormValue =
    shownSingle !== undefined
      ? toDayKey(shownSingle)
      : shownRange?.from !== undefined
        ? shownRange.to !== undefined
          ? `${toDayKey(shownRange.from)}/${toDayKey(shownRange.to)}`
          : toDayKey(shownRange.from)
        : "";

  const calendarCommon = {
    locale: props.locale,
    weekStartsOn: props.weekStartsOn,
    isDateDisabled: props.isDateDisabled,
    defaultMonth: shownRange?.from ?? shownSingle ?? props.defaultMonth,
  };

  const calendarChrome: ReactNode = (
    <>
      <Calendar.Header>
        <Calendar.Previous />
        <Calendar.Title />
        <Calendar.Next />
      </Calendar.Header>
      <Calendar.Grid />
    </>
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <span className={cn("relative inline-flex w-full min-w-0", props.className)}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={triggerRef}
            type="button"
            id={props.id}
            aria-label={props["aria-label"] ?? "Choose date"}
            disabled={props.disabled}
            className={cn(
              "flex min-h-9 w-full min-w-0 cursor-pointer items-center rounded-md border border-input bg-card pr-8 pl-8 text-left text-sm outline-none transition-[border-color,box-shadow] duration-150 hover:not-disabled:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-primary/25 data-[state=open]:border-ring data-[state=open]:ring-3 data-[state=open]:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50",
              label ? "text-card-foreground" : "text-muted-foreground",
            )}
          >
            <CalendarIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 shrink-0 text-muted-foreground"
            />
            <span className="min-w-0 flex-1 truncate">{label || props.placeholder}</span>
          </button>
        </PopoverPrimitive.Trigger>
        {!(props.clearable && !props.disabled && hasValue) && (
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
        )}
        {(props.clearable && !props.disabled && hasValue) && (
          <button
            type="button"
            aria-label="Clear value"
            onClick={clear}
            className="absolute top-1/2 right-2 z-1 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded bg-card text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5"
          >
            <X aria-hidden="true" />
          </button>
        )}
        {props.name && <input type="hidden" name={props.name} value={serializedFormValue} />}
      </span>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={props.align ?? "start"}
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            "z-50 w-fit rounded-lg border border-border bg-card p-3 text-card-foreground shadow-[0_4px_16px_rgb(80_55_35_/_14%)]",
            props.contentClassName,
          )}
        >
          {rangeProps ? (
            <Calendar.Root mode="range" {...calendarCommon} value={shownRange} onValueChange={selectRange}>
              {calendarChrome}
            </Calendar.Root>
          ) : (
            <Calendar.Root {...calendarCommon} value={shownSingle} onValueChange={selectSingle}>
              {calendarChrome}
            </Calendar.Root>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
