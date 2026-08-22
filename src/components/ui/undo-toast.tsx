import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TICK_MS = 100;

export type UndoToastProps = {
  /** What just happened, e.g. "Report dismissed". */
  message: string;
  /** Label of the recovery action; defaults to "Undo". */
  actionLabel?: string;
  /** Milliseconds before the toast expires on its own. */
  duration?: number;
  /** Called when the action button is pressed; unmounting stays with the parent. */
  onAction?: () => void;
  /** Called once when the countdown runs out without an action. */
  onExpire?: () => void;
  className?: string;
  "data-testid"?: string;
};

/**
 * A timed confirmation strip for destructive-but-reversible actions: it
 * announces what happened, offers one recovery action, and expires on its own.
 *
 * The countdown pauses while the pointer or focus is inside, so moving toward
 * the button never races the clock. The remaining fraction drains along a
 * hairline at the bottom edge — same height in every state, so nothing shifts.
 * Mounting is the parent's decision, exactly like `Alert.Close`.
 */
export function UndoToast({ message, actionLabel = "Undo", duration = 5000, onAction, onExpire, className, ...props }: UndoToastProps) {
  const [remaining, pausedRef] = useRemainingClock(duration, onExpire);

  return (
    <div
      role="status"
      data-testid="undo-toast"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onFocus={() => (pausedRef.current = true)}
      onBlur={() => (pausedRef.current = false)}
      {...props}
      className={cn(
        "fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 overflow-hidden rounded-lg border border-border bg-card py-2 pr-1.5 pl-3.5 shadow-[0_8px_24px_rgb(61_46_31/_18%)]",
        className,
      )}
    >
      <span className="text-sm whitespace-nowrap">{message}</span>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-primary outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-primary/25"
        >
          {actionLabel}
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onExpire}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-foreground/6 hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25 [&_svg]:size-3.5"
      >
        <X aria-hidden="true" />
      </button>
      {/* The drain bar sits on the border edge and never changes layout. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-primary/15">
        <span className="block h-full bg-primary/50" style={{ width: `${(remaining / duration) * 100}%` }} />
      </span>
    </div>
  );
}

/**
 * A millisecond countdown that ticks down to zero and then stops. Pausing goes
 * through the returned ref so hovering never re-renders anything.
 */
function useRemainingClock(duration: number, onExpire?: () => void) {
  const [remaining, setRemaining] = useState(duration);
  const expiredRef = useRef(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    const tick = window.setInterval(() => {
      if (pausedRef.current) return;
      setRemaining((previous) => Math.max(0, previous - TICK_MS));
    }, TICK_MS);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (remaining > 0 || expiredRef.current) return;
    expiredRef.current = true;
    onExpire?.();
  }, [remaining, onExpire]);

  return [remaining, pausedRef] as const;
}
