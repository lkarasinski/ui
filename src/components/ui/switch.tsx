import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { useId, useState, type ComponentProps } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

const switchVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border p-0.5 outline-none transition-colors duration-150 aria-checked:border-black/15 aria-checked:bg-primary focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-4 w-7 border-input bg-muted",
        md: "h-5 w-9 border-input bg-muted",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const switchThumbVariants = cva(
  "grid place-items-center rounded-full bg-card shadow-[0_1px_2px_rgb(80_55_35_/_25%)] transition-transform duration-150 motion-reduce:transition-none",
  {
    variants: {
      size: {
        sm: "size-3",
        md: "size-4",
      },
      checked: {
        true: "",
        false: "translate-x-0",
      },
    },
    compoundVariants: [
      { size: "sm", checked: true, class: "translate-x-3" },
      { size: "md", checked: true, class: "translate-x-4" },
    ],
    defaultVariants: { size: "md", checked: false },
  },
);

type SwitchContextValue = {
  controlId: string;
  descriptionId: string;
  disabled: boolean;
};

const SwitchContext = createContext<SwitchContextValue | null>(null);

function useSwitch<T>(selector: (context: SwitchContextValue) => T) {
  return useContextSelector(SwitchContext, (context) => (context ? selector(context) : (undefined as T)));
}

export type SwitchProps = Omit<ComponentProps<"button">, "onChange" | "type" | "value"> &
  VariantProps<typeof switchVariants> & {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    /**
     * Shows a spinner in the thumb and blocks input while the change is being saved.
     * The switch stays in its current position until the caller flips `checked`.
     */
    pending?: boolean;
  };

/**
 * An instant on/off control.
 *
 * A switch applies its change immediately, which is what separates it from a
 * checkbox: use a checkbox when the value is submitted with a form, and a switch
 * when flipping it *is* the action. Because the change is immediate, it needs a
 * visible pending state — pass `pending` while the write is in flight.
 *
 * It renders a `button` with `role="switch"`, so it is labelable: a
 * `Switch.Label` with `htmlFor` names it and toggles it on click.
 */
export function Switch({ checked, defaultChecked = false, onCheckedChange, pending = false, size, disabled, id, className, onClick, ...props }: SwitchProps) {
  const fallbackId = useId();
  const contextId = useSwitch((context) => context.controlId);
  const descriptionId = useSwitch((context) => context.descriptionId);
  const contextDisabled = useSwitch((context) => context.disabled);
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const isChecked = checked ?? uncontrolledChecked;
  const isDisabled = (disabled ?? contextDisabled) || pending;

  return (
    <button
      {...props}
      type="button"
      role="switch"
      id={id ?? contextId ?? fallbackId}
      aria-checked={isChecked}
      aria-busy={pending || undefined}
      aria-describedby={props["aria-describedby"] ?? descriptionId}
      disabled={isDisabled}
      onClick={(event) => {
        if (checked === undefined) setUncontrolledChecked(!isChecked);
        onCheckedChange?.(!isChecked);
        onClick?.(event);
      }}
      className={cn(switchVariants({ size }), className)}
    >
      <span aria-hidden="true" className={cn(switchThumbVariants({ size, checked: isChecked }))}>
        {pending && <LoaderCircle className="size-2 animate-spin text-muted-foreground" />}
      </span>
    </button>
  );
}

export type SwitchRootProps = ComponentProps<"div"> & { disabled?: boolean };

/**
 * A settings row: label and description on one side, control on the other.
 *
 * The root generates the id wiring, so the label and description connect
 * themselves and the control can be moved to either end by reordering children.
 */
export function SwitchRoot({ disabled = false, className, children, ...props }: SwitchRootProps) {
  const id = useId();

  return (
    <SwitchContext.Provider value={{ controlId: `${id}-control`, descriptionId: `${id}-description`, disabled }}>
      <div data-disabled={disabled || undefined} className={cn("flex min-w-0 items-start justify-between gap-4", disabled && "opacity-60", className)} {...props}>
        {children}
      </div>
    </SwitchContext.Provider>
  );
}

/** Stacks the label and description opposite the control. */
export function SwitchContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-col gap-0.5", className)} {...props} />;
}

/** The visible label. It targets the switch through the generated id, so clicking it toggles. */
export function SwitchLabel({ className, htmlFor, ...props }: ComponentProps<"label">) {
  const controlId = useSwitch((context) => context.controlId);
  return <label htmlFor={htmlFor ?? controlId} className={cn("cursor-pointer text-sm leading-tight font-medium text-card-foreground select-none", className)} {...props} />;
}

/** Supporting text, announced after the label through `aria-describedby`. */
export function SwitchDescription({ className, id, ...props }: ComponentProps<"p">) {
  const descriptionId = useSwitch((context) => context.descriptionId);
  return <p id={id ?? descriptionId} className={cn("m-0 text-sm text-muted-foreground", className)} {...props} />;
}

Switch.Root = SwitchRoot;
Switch.Content = SwitchContent;
Switch.Label = SwitchLabel;
Switch.Description = SwitchDescription;
