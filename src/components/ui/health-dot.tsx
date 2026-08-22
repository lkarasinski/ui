import { cn } from "@/lib/utils";

export type HealthDotState = "checking" | "healthy" | "unhealthy" | "unconfigured";

const DOT_CLASS: Record<HealthDotState, string> = {
  healthy: "bg-success",
  unhealthy: "bg-destructive",
  unconfigured: "bg-muted-foreground/40",
  checking: "bg-muted-foreground/40 animate-pulse",
};

const STATE_LABEL: Record<HealthDotState, string> = {
  healthy: "healthy",
  unhealthy: "unreachable",
  unconfigured: "not configured",
  checking: "checking",
};

export type HealthDotProps = {
  /** Name of the watched thing, spoken in the accessible label ("redmine: healthy"). */
  name: string;
  state: HealthDotState;
  /** Shows the name next to the dot. */
  showLabel?: boolean;
  /** Extra detail appended to the hover tooltip, e.g. a latency or error string. */
  detail?: string;
  className?: string;
  "data-testid"?: string;
};

/**
 * A live connection indicator for one external dependency.
 *
 * The dot holds a fixed size in every state — checking included — so polling
 * never shifts the surrounding content. State comes in through props; the
 * polling itself stays with the consumer.
 */
export function HealthDot({ name, state, showLabel = false, detail, className, ...props }: HealthDotProps) {
  const title = state === "checking" ? `${name}: checking…` : `${name}: ${STATE_LABEL[state]}${detail ? ` (${detail})` : ""}`;

  return (
    <span role="status" aria-label={`${name}: ${STATE_LABEL[state]}`} title={title} {...props} className={cn("inline-flex items-center gap-1.5", className)}>
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", DOT_CLASS[state])} />
      {showLabel && (
        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{name}</span>
      )}
    </span>
  );
}
