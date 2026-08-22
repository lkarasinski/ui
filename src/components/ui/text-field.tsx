import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type TextFieldProps = ComponentProps<"input"> & {
  label: string;
  description?: string;
  error?: string;
  labelSuffix?: string;
};

/** A labelled single-line input with optional helper text and inline error. */
export function TextField({ label, description, error, labelSuffix, className, id, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={inputId} className="flex items-baseline justify-between text-[12px] font-semibold text-foreground">
        {label}
        {labelSuffix && <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{labelSuffix}</span>}
      </label>
      {description && (
        <p id={descriptionId} className="text-[11.5px] leading-4 text-muted-foreground">
          {description}
        </p>
      )}
      <input
        id={inputId}
        aria-describedby={error ? errorId : descriptionId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-9 rounded-md border border-input bg-card px-2.5 text-[13px] text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:border-destructive/50 focus-visible:ring-destructive/20",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-[11.5px] leading-4 text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
