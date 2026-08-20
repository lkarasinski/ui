import { cva, type VariantProps } from "class-variance-authority";
import { useId, useState, type ComponentProps } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

const radioGroupVariants = cva("m-0 flex min-w-0 border-0 p-0", {
  variants: {
    orientation: {
      vertical: "flex-col gap-2.5",
      horizontal: "flex-row flex-wrap items-start gap-4",
    },
  },
  defaultVariants: { orientation: "vertical" },
});

const radioVariants = cva(
  "peer col-start-1 row-start-1 shrink-0 appearance-none rounded-full border border-input bg-card shadow-[0_1px_2px_rgb(80_55_35_/_8%)] outline-none transition-[background-color,border-color,box-shadow] duration-150 checked:border-primary hover:not-disabled:border-ring focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "size-3.5",
        md: "size-4",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const radioDotVariants = cva(
  "pointer-events-none col-start-1 row-start-1 scale-50 rounded-full bg-primary opacity-0 transition-[opacity,transform] duration-100 peer-checked:scale-100 peer-checked:opacity-100",
  {
    variants: {
      size: {
        sm: "size-1.5",
        md: "size-2",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type RadioGroupVariant = "default" | "card";

type RadioGroupContextValue = {
  name: string;
  value: string | undefined;
  disabled: boolean;
  variant: RadioGroupVariant;
  setValue: (value: string) => void;
};

type RadioItemContextValue = {
  controlId: string;
  descriptionId: string;
  value: string;
  disabled: boolean;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);
const RadioItemContext = createContext<RadioItemContextValue | null>(null);

function useRadioGroup<T>(selector: (context: RadioGroupContextValue) => T) {
  return useContextSelector(RadioGroupContext, (context) => (context ? selector(context) : (undefined as T)));
}

function useRadioItem<T>(selector: (context: RadioItemContextValue) => T) {
  return useContextSelector(RadioItemContext, (context) => (context ? selector(context) : (undefined as T)));
}

export type RadioGroupRootProps = Omit<ComponentProps<"fieldset">, "onChange" | "defaultValue"> &
  VariantProps<typeof radioGroupVariants> & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Shared `name` for the underlying inputs. Generated when omitted. */
    name?: string;
    variant?: RadioGroupVariant;
  };

/**
 * A set of mutually exclusive options backed by native radio inputs.
 *
 * The root owns the selected value — controlled through `value` or uncontrolled
 * through `defaultValue` — and shares it with the items through a context
 * selector, so an option never takes the group's state as a prop.
 *
 * It renders a real `fieldset`. Arrow-key navigation, the roving tab stop, and
 * form submission come from the browser's radio behavior rather than from
 * JavaScript.
 */
export function RadioGroupRoot({
  value,
  defaultValue,
  onValueChange,
  name,
  orientation = "vertical",
  variant = "default",
  disabled = false,
  className,
  children,
  ...props
}: RadioGroupRootProps) {
  const generatedName = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = value ?? uncontrolledValue;

  return (
    <RadioGroupContext.Provider
      value={{
        name: name ?? generatedName,
        value: currentValue,
        disabled,
        variant,
        setValue: (nextValue) => {
          if (value === undefined) setUncontrolledValue(nextValue);
          onValueChange?.(nextValue);
        },
      }}
    >
      <fieldset
        data-orientation={orientation}
        data-variant={variant}
        disabled={disabled}
        className={cn(radioGroupVariants({ orientation }), disabled && "opacity-60", className)}
        {...props}
      >
        {children}
      </fieldset>
    </RadioGroupContext.Provider>
  );
}

/** The question the options answer. Renders a `legend`, so it names the group for screen readers. */
export function RadioGroupLegend({ className, ...props }: ComponentProps<"legend">) {
  return <legend className={cn("mb-0.5 p-0 text-sm font-medium text-card-foreground", className)} {...props} />;
}

/** Optional guidance under the legend, before the options. */
export function RadioGroupHint({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("m-0 -mt-2 text-sm text-muted-foreground", className)} {...props} />;
}

const radioItemVariants = cva("relative flex min-w-0 items-start gap-2.5", {
  variants: {
    variant: {
      default: "",
      card: "flex-1 rounded-md border border-border bg-card p-3 transition-[background-color,border-color] duration-150 has-[:checked]:border-primary/45 has-[:checked]:bg-primary/6 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-primary/25",
    },
  },
  defaultVariants: { variant: "default" },
});

export type RadioGroupItemProps = ComponentProps<"div"> & { value: string; disabled?: boolean };

/** One option. It carries the value and generates the id wiring for its own label and description. */
export function RadioGroupItem({ value, disabled = false, className, children, ...props }: RadioGroupItemProps) {
  const id = useId();
  const variant = useRadioGroup((context) => context.variant) ?? "default";

  return (
    <RadioItemContext.Provider value={{ controlId: `${id}-control`, descriptionId: `${id}-description`, value, disabled }}>
      <div data-value={value} data-disabled={disabled || undefined} className={cn(radioItemVariants({ variant }), disabled && "opacity-60", className)} {...props}>
        {children}
      </div>
    </RadioItemContext.Provider>
  );
}

export type RadioProps = Omit<ComponentProps<"input">, "type" | "size" | "value" | "onChange"> & VariantProps<typeof radioVariants>;

/** The radio control for the surrounding item. It reads its value and name from context. */
export function Radio({ className, size, disabled, id, ...props }: RadioProps) {
  const name = useRadioGroup((context) => context.name);
  const groupValue = useRadioGroup((context) => context.value);
  const setValue = useRadioGroup((context) => context.setValue);
  const value = useRadioItem((context) => context.value);
  const controlId = useRadioItem((context) => context.controlId);
  const descriptionId = useRadioItem((context) => context.descriptionId);
  const itemDisabled = useRadioItem((context) => context.disabled);

  return (
    <span className="inline-grid shrink-0 place-items-center">
      <input
        {...props}
        type="radio"
        id={id ?? controlId}
        name={name}
        value={value}
        checked={groupValue === value}
        onChange={() => setValue?.(value)}
        aria-describedby={props["aria-describedby"] ?? descriptionId}
        disabled={disabled ?? itemDisabled}
        className={cn(radioVariants({ size }), className)}
      />
      <span aria-hidden="true" className={cn(radioDotVariants({ size }))} />
    </span>
  );
}

/** Stacks the option label and description next to the control. */
export function RadioGroupContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-col gap-0.5", className)} {...props} />;
}

/**
 * The option label. In the `card` variant it stretches over the whole tile, so a
 * click anywhere selects the option — keep links out of a card's description.
 */
export function RadioGroupLabel({ className, htmlFor, ...props }: ComponentProps<"label">) {
  const controlId = useRadioItem((context) => context.controlId);
  const variant = useRadioGroup((context) => context.variant);

  return (
    <label
      htmlFor={htmlFor ?? controlId}
      className={cn("cursor-pointer text-sm leading-tight font-medium text-card-foreground select-none", variant === "card" && "after:absolute after:inset-0 after:content-['']", className)}
      {...props}
    />
  );
}

/** Supporting text for one option, announced after its label. */
export function RadioGroupDescription({ className, id, ...props }: ComponentProps<"p">) {
  const descriptionId = useRadioItem((context) => context.descriptionId);
  return <p id={id ?? descriptionId} className={cn("m-0 text-sm text-muted-foreground", className)} {...props} />;
}

RadioGroupRoot.Legend = RadioGroupLegend;
RadioGroupRoot.Hint = RadioGroupHint;
RadioGroupRoot.Item = RadioGroupItem;
RadioGroupRoot.Radio = Radio;
RadioGroupRoot.Content = RadioGroupContent;
RadioGroupRoot.Label = RadioGroupLabel;
RadioGroupRoot.Description = RadioGroupDescription;

export const RadioGroup = RadioGroupRoot;
