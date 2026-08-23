import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

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
  /** Extra detail line in the hover card, e.g. a latency or error string. */
  detail?: string;
  /** Additional lines in the hover card, e.g. freshness ("showing data from 14:32"). */
  info?: ReactNode;
  className?: string;
  "data-testid"?: string;
};

/**
 * A live connection indicator for one external dependency.
 *
 * The dot holds a fixed size in every state — checking included — so polling
 * never shifts the surrounding content. State comes in through props; the
 * polling itself stays with the consumer. Hovering opens a card with the
 * full status; keyboard focus opens it too.
 */
export function HealthDot({ name, state, showLabel = false, detail, info, className, ...props }: HealthDotProps) {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <span
          role="status"
          aria-label={`${name}: ${STATE_LABEL[state]}`}
          tabIndex={0}
          {...props}
          className={cn(
            "inline-flex cursor-default items-center gap-1.5 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-primary/25",
            className,
          )}
        >
          <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", DOT_CLASS[state])} />
          {showLabel && (
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{name}</span>
          )}
        </span>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="font-semibold text-foreground">
          {name}: {STATE_LABEL[state]}
        </p>
        {detail && <p className="mt-0.5 text-muted-foreground">{detail}</p>}
        {info}
      </HoverCardContent>
    </HoverCard>
  );
}
