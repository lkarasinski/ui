import { AppShell } from "@/components/ui/app-shell";
import { useCallback, useEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_WIDTH = 440;
const MIN_WIDTH = 280;
const MAX_WIDTH = 720;
const KEYBOARD_STEP = 24;

function clampWidth(width: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(width)));
}

function readStoredWidth(storageKey: string | undefined) {
  if (!storageKey) return DEFAULT_WIDTH;
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw === null ? Number.NaN : Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? clampWidth(parsed) : DEFAULT_WIDTH;
  } catch {
    return DEFAULT_WIDTH;
  }
}

export type ResizableDetailPaneProps = Omit<ComponentProps<typeof AppShell.Aside>, "label"> & {
  label: string;
  /** Persists the width in localStorage under this key across reloads. */
  storageKey?: string;
};

/**
 * The docked right panel of the two-pane split.
 *
 * The width starts at 440px and can be changed by dragging its left edge or,
 * with the edge focused, with the arrow keys. When `storageKey` is given the
 * width survives reloads through localStorage. Reading the stored value waits
 * for mount: the server render and the first client render must agree, so
 * persistence joins in after hydration.
 */
export function ResizableDetailPane({ label, storageKey, className, children, ...props }: ResizableDetailPaneProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const widthRef = useRef(DEFAULT_WIDTH);
  const dragState = useRef<{ pointerId: number; startClientX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const stored = readStoredWidth(storageKey);
    widthRef.current = stored;
    setWidth(stored);
  }, [storageKey]);

  const applyWidth = useCallback((nextWidth: number) => {
    const clamped = clampWidth(nextWidth);
    widthRef.current = clamped;
    setWidth(clamped);
  }, []);

  const persistWidth = useCallback(() => {
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, String(widthRef.current));
    } catch {
      // Storage being unavailable (private mode, quota) must not break resizing.
    }
  }, [storageKey]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragState.current = { pointerId: event.pointerId, startClientX: event.clientX, startWidth: width };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    if (state === null || state.pointerId !== event.pointerId) return;
    // The pane is docked right, so dragging left widens it.
    applyWidth(state.startWidth - (event.clientX - state.startClientX));
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current === null || dragState.current.pointerId !== event.pointerId) return;
    dragState.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    persistWidth();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      applyWidth(width + KEYBOARD_STEP);
      persistWidth();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      applyWidth(width - KEYBOARD_STEP);
      persistWidth();
    }
  };

  return (
    <AppShell.Aside label={label} className={cn("relative w-auto", className)} style={{ width }} {...props}>
      {children}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${label.toLowerCase()}`}
        data-testid="detail-pane-resize-handle"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
        className="absolute inset-y-0 left-0 z-10 w-1 cursor-col-resize touch-none outline-none transition-colors after:absolute after:inset-y-0 after:-left-1.5 after:-right-1 after:content-[''] hover:bg-primary/25 focus-visible:bg-primary/50"
      />
    </AppShell.Aside>
  );
}
