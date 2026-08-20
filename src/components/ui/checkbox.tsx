import { cva, type VariantProps } from "class-variance-authority";
import { Check, Minus } from "lucide-react";
import { useCallback, useId, type ComponentProps, type Ref } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

const checkboxVariants = cva(
  "peer col-start-1 row-start-1 shrink-0 appearance-none rounded-[5px] border border-input bg-card shadow-[0_1px_2px_rgb(80_55_35_/_8%)] outline-none transition-[background-color,border-color,box-shadow] duration-150 checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary hover:not-disabled:border-ring focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50",
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

const checkboxMarkVariants = cva(
  "pointer-events-none col-start-1 row-start-1 scale-75 text-primary-foreground opacity-0 transition-[opacity,transform] duration-100",
  {
    variants: {
      size: {
        sm: "size-2.5",
        md: "size-3",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type CheckboxVariant = "default" | "card";

type CheckboxContextValue = {
  controlId: string;
  descriptionId: string;
  disabled: boolean;
  variant: CheckboxVariant;
};

const CheckboxContext = createContext<CheckboxContextValue | null>(null);

function useCheckbox<T>(selector: (context: CheckboxContextValue) => T) {
  return useContextSelector(CheckboxContext, (context) => (context ? selector(context) : (undefined as T)));
}

export type CheckboxProps = Omit<ComponentProps<"input">, "type" | "size"> &
  VariantProps<typeof checkboxVariants> & {
    /** Renders the mixed state used by a "select all" box whose children are partly selected. */
    indeterminate?: boolean;
    ref?: Ref<HTMLInputElement>;
  };

/**
 * A checkbox control backed by a native input.
 *
 * The input itself is styled with `appearance-none`, so form submission, the
 * `indeterminate` DOM state, autofill, and keyboard behavior stay native while the
 * box matches the rest of the library.
 *
 * Used on its own it needs an `aria-label` or an external label. Inside
 * `Checkbox.Root` it picks up the generated id and description automatically.
 */
export function Checkbox({ className, size, indeterminate = false, disabled, id, ref, ...props }: CheckboxProps) {
  const fallbackId = useId();
  const contextId = useCheckbox((context) => context.controlId);
  const descriptionId = useCheckbox((context) => context.descriptionId);
  const contextDisabled = useCheckbox((context) => context.disabled);

  // `indeterminate` exists only on the DOM node, never as an attribute. A ref
  // callback keyed on the prop syncs it without an effect.
  const setNode = useCallback(
    (node: HTMLInputElement | null) => {
      if (node) node.indeterminate = indeterminate;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [indeterminate, ref],
  );

  return (
    <span className="inline-grid shrink-0 place-items-center">
      <input
        {...props}
        ref={setNode}
        type="checkbox"
        id={id ?? contextId ?? fallbackId}
        aria-describedby={props["aria-describedby"] ?? descriptionId}
        disabled={disabled ?? contextDisabled}
        className={cn(checkboxVariants({ size }), className)}
      />
      <Check aria-hidden="true" strokeWidth={3} className={cn(checkboxMarkVariants({ size }), "peer-checked:scale-100 peer-checked:opacity-100 peer-indeterminate:scale-75 peer-indeterminate:opacity-0")} />
      <Minus aria-hidden="true" strokeWidth={3} className={cn(checkboxMarkVariants({ size }), "peer-indeterminate:scale-100 peer-indeterminate:opacity-100")} />
    </span>
  );
}

const checkboxRootVariants = cva("relative flex min-w-0 items-start gap-2.5", {
  variants: {
    variant: {
      default: "",
      // A selectable tile: the whole surface reacts to the checked state.
      card: "rounded-md border border-border bg-card p-3 transition-[background-color,border-color] duration-150 has-[:checked]:border-primary/45 has-[:checked]:bg-primary/6 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-primary/25",
    },
  },
  defaultVariants: { variant: "default" },
});

export type CheckboxRootProps = ComponentProps<"div"> & {
  disabled?: boolean;
  variant?: CheckboxVariant;
};

/**
 * Pairs a checkbox with its label and description.
 *
 * The root generates the id wiring, so the parts stay independent: the label and
 * the description read what they need from context instead of taking props from
 * the form above them.
 */
export function CheckboxRoot({ variant = "default", disabled = false, className, children, ...props }: CheckboxRootProps) {
  const id = useId();

  return (
    <CheckboxContext.Provider value={{ controlId: `${id}-control`, descriptionId: `${id}-description`, disabled, variant }}>
      <div data-variant={variant} data-disabled={disabled || undefined} className={cn(checkboxRootVariants({ variant }), disabled && "opacity-60", className)} {...props}>
        {children}
      </div>
    </CheckboxContext.Provider>
  );
}

/** Stacks the label and description next to the control. */
export function CheckboxContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-col gap-0.5", className)} {...props} />;
}

/**
 * The visible label, connected to the control through the generated id.
 *
 * In the `card` variant the label stretches an invisible layer over the whole tile
 * so a click anywhere toggles the box. Keep links out of a card's description —
 * that layer sits above them.
 */
export function CheckboxLabel({ className, htmlFor, ...props }: ComponentProps<"label">) {
  const controlId = useCheckbox((context) => context.controlId);
  const variant = useCheckbox((context) => context.variant);

  return (
    <label
      htmlFor={htmlFor ?? controlId}
      className={cn(
        "text-sm leading-tight font-medium text-card-foreground select-none",
        variant === "card" && "after:absolute after:inset-0 after:content-['']",
        className,
      )}
      {...props}
    />
  );
}

/** Supporting text below the label, exposed to screen readers as the control's description. */
export function CheckboxDescription({ className, id, ...props }: ComponentProps<"p">) {
  const descriptionId = useCheckbox((context) => context.descriptionId);
  return <p id={id ?? descriptionId} className={cn("m-0 text-sm text-muted-foreground", className)} {...props} />;
}

/** A labelled set of related checkboxes. Renders a real `fieldset`, so the legend names the group. */
export function CheckboxGroup({ label, description, className, children, ...props }: ComponentProps<"fieldset"> & { label: string; description?: string }) {
  return (
    <fieldset className={cn("m-0 flex min-w-0 flex-col gap-2.5 border-0 p-0", className)} {...props}>
      <legend className="mb-0.5 p-0 text-sm font-medium text-card-foreground">{label}</legend>
      {description && <p className="m-0 -mt-2 text-sm text-muted-foreground">{description}</p>}
      {children}
    </fieldset>
  );
}

Checkbox.Root = CheckboxRoot;
Checkbox.Content = CheckboxContent;
Checkbox.Label = CheckboxLabel;
Checkbox.Description = CheckboxDescription;
Checkbox.Group = CheckboxGroup;
