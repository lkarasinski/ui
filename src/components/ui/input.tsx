import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Children, isValidElement, useCallback, useState, type ComponentProps, type ReactNode } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

const inputClassName =
  "flex min-h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-card-foreground outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * A single-line text input with the shared field styling.
 *
 * Labels, help text, validation messages, and field layout are composed by
 * the consuming form. Native input props are passed through unchanged.
 */
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

type InputContextValue = {
  value: string;
  disabled: boolean;
  readOnly: boolean;
  clearable: boolean;
  hasLeftIcon: boolean;
  hasRightIcon: boolean;
  setValue: (value: string) => void;
  clear: () => void;
};

const InputContext = createContext<InputContextValue | null>(null);

function isInputIcon(child: ReactNode, side: "left" | "right") {
  return isValidElement<InputIconProps>(child) && child.type === InputIcon && (child.props.side ?? "left") === side;
}

function useInputContext<T>(selector: (context: InputContextValue) => T) {
  return useContextSelector(InputContext, (context) => (context ? selector(context) : (undefined as T)));
}

type InputRootProps = {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
};

/** A composable label for an input. Connect it to `Input.Field` with `htmlFor`. */
function InputLabel({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium text-card-foreground", className)} {...props} />;
}

/**
 * Composes an input field with optional icons and a value-clearing action.
 * The dialog or form can stay outside this root and control the value through
 * `onValueChange` or `onClear`.
 */
function InputRoot({
  children,
  value,
  defaultValue = "",
  onValueChange,
  onClear,
  clearable = false,
  disabled = false,
  readOnly = false,
  className,
}: InputRootProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = value ?? uncontrolledValue;
  const items = Children.toArray(children);
  const hasLeftIcon = items.some((child) => isInputIcon(child, "left"));
  const hasRightIcon = items.some((child) => isInputIcon(child, "right"));
  const hasClear = items.some((child) => isValidElement(child) && child.type === InputClear);
  const isControlled = value !== undefined;

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  const clear = useCallback(() => {
    if (disabled || readOnly) return;
    setValue("");
    onClear?.();
  }, [disabled, onClear, readOnly, setValue]);

  const contextValue: InputContextValue = {
    value: currentValue,
    disabled,
    readOnly,
    clearable,
    hasLeftIcon,
    hasRightIcon,
    setValue,
    clear,
  };

  return (
    <div className={cn("relative w-full", className)}>
      <InputContext.Provider value={contextValue}>
        {children}
        {clearable && !hasClear && <InputClear />}
      </InputContext.Provider>
    </div>
  );
}

type InputFieldProps = ComponentProps<"input">;

/** The native input field used inside `Input.Root`. */
function InputField({ className, onChange, value: _value, defaultValue: _defaultValue, disabled, readOnly, ...props }: InputFieldProps) {
  const value = useInputContext((context) => context.value);
  const setValue = useInputContext((context) => context.setValue);
  const rootDisabled = useInputContext((context) => context.disabled);
  const rootReadOnly = useInputContext((context) => context.readOnly);
  const hasLeftIcon = useInputContext((context) => context.hasLeftIcon);
  const hasRightIcon = useInputContext((context) => context.hasRightIcon);
  const clearable = useInputContext((context) => context.clearable);

  return (
    <input
      {...props}
      value={value}
      disabled={rootDisabled || disabled}
      readOnly={rootReadOnly || readOnly}
      onChange={(event) => {
        setValue(event.target.value);
        onChange?.(event);
      }}
      className={cn(inputClassName, hasLeftIcon && "pl-8", (hasRightIcon || clearable) && "pr-8", className)}
    />
  );
}

type InputIconProps = {
  side?: "left" | "right";
  children: ReactNode;
};

/** A 12px icon slot positioned at the start or end of the field. */
function InputIcon({ side = "left", children }: InputIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-1/2 z-1 inline-flex size-3 -translate-y-1/2 items-center justify-center overflow-hidden [&_svg]:size-3",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      {children}
    </span>
  );
}

type InputClearProps = {
  "aria-label"?: string;
  className?: string;
  disabled?: boolean;
};

/** Clears the current value when the field is non-empty. Usually rendered by `Input.Root`. */
function InputClear({ className, disabled, "aria-label": ariaLabel = "Clear input" }: InputClearProps) {
  const value = useInputContext((context) => context.value);
  const rootDisabled = useInputContext((context) => context.disabled);
  const readOnly = useInputContext((context) => context.readOnly);
  const clear = useInputContext((context) => context.clear);
  const hasRightIcon = useInputContext((context) => context.hasRightIcon);

  return (
    <AnimatePresence initial={false}>
      {value.length > 0 && !readOnly && (
        <motion.button
          type="button"
          aria-label={ariaLabel}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15, ease: "linear" }}
          disabled={rootDisabled || disabled}
          onClick={clear}
          className={cn(
            "absolute top-1/2 right-2 z-1 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5",
            hasRightIcon && "right-9",
            className,
          )}
        >
          <X aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

Input.Root = InputRoot;
Input.Field = InputField;
Input.Icon = InputIcon;
Input.Clear = InputClear;
Input.Label = InputLabel;
