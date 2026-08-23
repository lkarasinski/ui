import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type RowMenuItem = {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
};

const MENU_WIDTH = 160;
const MENU_HEIGHT_PER_ITEM = 32;
const MENU_EDGE_PADDING = 8;

/** Clamps a cursor position so the fixed-position menu stays on screen. */
function clampMenuPosition(position: { x: number; y: number }, itemCount: number): { x: number; y: number } {
  const height = itemCount * MENU_HEIGHT_PER_ITEM + MENU_EDGE_PADDING * 2;
  return {
    x: Math.min(position.x, window.innerWidth - MENU_WIDTH - MENU_EDGE_PADDING),
    y: Math.min(position.y, window.innerHeight - height - MENU_EDGE_PADDING),
  };
}

export type RowContextMenuProps = {
  /** Names the row the menu acts on: "Actions for {label}". */
  label: string;
  items: RowMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
};

/**
 * A minimal right-click menu rendered into `document.body`, so no scroll
 * container or transform can clip it. Any pointer-down, Escape, or choosing
 * an entry closes it.
 *
 * The menu knows nothing about the row it belongs to — the opener passes the
 * accessible name and the entries.
 */
export function RowContextMenu({ label, items, position, onClose }: RowContextMenuProps) {
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const { x, y } = clampMenuPosition(position, items.length);

  return createPortal(
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40"
        onPointerDown={onClose}
        onContextMenu={(event) => {
          event.preventDefault();
          onClose();
        }}
      />
      <div
        role="menu"
        aria-label={`Actions for ${label}`}
        style={{ left: x, top: y }}
        className="fixed z-50 min-w-40 overflow-hidden rounded-md border border-border bg-card py-1 shadow-[0_4px_16px_rgb(61_46_31_/_12%)]"
      >
        {items.map((menuItem) => (
          <button
            key={menuItem.label}
            type="button"
            role="menuitem"
            onClick={() => {
              menuItem.onSelect();
              onClose();
            }}
            className={cn(
              "flex h-7 w-full items-center px-3 text-left text-[13px] outline-none transition-colors hover:bg-accent focus-visible:bg-accent",
              menuItem.destructive ? "text-destructive" : "text-foreground",
            )}
          >
            {menuItem.label}
          </button>
        ))}
      </div>
    </>,
    document.body,
  );
}
