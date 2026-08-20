import { useCallback, useId, useState, type ComponentProps } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

const textareaClassName =
  "flex min-h-16 w-full min-w-0 rounded-md border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50";

export type TextareaProps = ComponentProps<"textarea"> & {
  /**
   * Grows the field with its content instead of scrolling, using CSS
   * `field-sizing`. Cap it with a `max-h-*` class so a pasted log cannot push
   * the submit button off screen.
   */
  autoSize?: boolean;
};

/**
 * A multi-line text field with the shared field styling.
 *
 * Labels, hints, validation, and the character counter are composed around it, so
 * the same primitive works in a native form and in a form library.
 */
export function Textarea({ autoSize = false, className, ...props }: TextareaProps) {
  return <textarea className={cn(textareaClassName, autoSize ? "field-sizing-content resize-none" : "resize-y", className)} {...props} />;
}

type TextareaContextValue = {
  value: string;
  maxLength: number | undefined;
  controlId: string;
  descriptionId: string;
  disabled: boolean;
  setValue: (value: string) => void;
};

const TextareaContext = createContext<TextareaContextValue | null>(null);

function useTextarea<T>(selector: (context: TextareaContextValue) => T) {
  return useContextSelector(TextareaContext, (context) => (context ? selector(context) : (undefined as T)));
}

export type TextareaRootProps = Omit<ComponentProps<"div">, "onChange"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Enables the counter and the native length limit on the field. */
  maxLength?: number;
  disabled?: boolean;
};

/**
 * Composes a textarea with its label, hint, and counter.
 *
 * The root owns the value — controlled through `value`, uncontrolled through
 * `defaultValue` — so the counter can read the length without the form passing it
 * down. It also generates the id wiring for the label and the description.
 */
export function TextareaRoot({ value, defaultValue = "", onValueChange, maxLength, disabled = false, className, children, ...props }: TextareaRootProps) {
  const id = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = value ?? uncontrolledValue;
  const isControlled = value !== undefined;

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  return (
    <TextareaContext.Provider
      value={{ value: currentValue, maxLength, controlId: `${id}-control`, descriptionId: `${id}-description`, disabled, setValue }}
    >
      <div className={cn("flex w-full min-w-0 flex-col gap-1.5", className)} {...props}>
        {children}
      </div>
    </TextareaContext.Provider>
  );
}

/** The textarea inside `Textarea.Root`. It reads the value, limit, and ids from context. */
export function TextareaField({ className, onChange, value: _value, defaultValue: _defaultValue, disabled, id, maxLength, ...props }: TextareaProps) {
  const contextValue = useTextarea((context) => context.value);
  const contextMaxLength = useTextarea((context) => context.maxLength);
  const controlId = useTextarea((context) => context.controlId);
  const descriptionId = useTextarea((context) => context.descriptionId);
  const contextDisabled = useTextarea((context) => context.disabled);
  const setValue = useTextarea((context) => context.setValue);

  return (
    <Textarea
      {...props}
      id={id ?? controlId}
      value={contextValue}
      maxLength={maxLength ?? contextMaxLength}
      aria-describedby={props["aria-describedby"] ?? descriptionId}
      disabled={disabled ?? contextDisabled}
      onChange={(event) => {
        setValue?.(event.target.value);
        onChange?.(event);
      }}
      className={className}
    />
  );
}

/** The field label, connected to `Textarea.Field` through the generated id. */
export function TextareaLabel({ className, htmlFor, ...props }: ComponentProps<"label">) {
  const controlId = useTextarea((context) => context.controlId);
  return <label htmlFor={htmlFor ?? controlId} className={cn("text-sm font-medium text-card-foreground", className)} {...props} />;
}

/** Guidance or a validation message, announced through `aria-describedby`. */
export function TextareaHint({ className, id, ...props }: ComponentProps<"p">) {
  const descriptionId = useTextarea((context) => context.descriptionId);
  return <p id={id ?? descriptionId} className={cn("m-0 text-sm text-muted-foreground", className)} {...props} />;
}

/** A row under the field for the hint and the counter. */
export function TextareaFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-start justify-between gap-3", className)} {...props} />;
}

/**
 * A live character count.
 *
 * It turns destructive once the remaining budget is small, so the limit is visible
 * before it is hit rather than after. Requires `maxLength` on the root.
 */
export function TextareaCounter({ className, warnAt = 20, ...props }: ComponentProps<"span"> & { warnAt?: number }) {
  const value = useTextarea((context) => context.value);
  const maxLength = useTextarea((context) => context.maxLength);
  if (maxLength === undefined) return null;

  const remaining = maxLength - value.length;

  return (
    <span
      aria-live="polite"
      className={cn("shrink-0 font-mono text-xs tabular-nums", remaining <= warnAt ? "text-destructive-foreground" : "text-muted-foreground", className)}
      {...props}
    >
      {value.length} / {maxLength}
    </span>
  );
}

Textarea.Root = TextareaRoot;
Textarea.Field = TextareaField;
Textarea.Label = TextareaLabel;
Textarea.Hint = TextareaHint;
Textarea.Footer = TextareaFooter;
Textarea.Counter = TextareaCounter;
