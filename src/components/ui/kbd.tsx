import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Apple keyboards label the primary modifier `⌘`, every other platform labels it
 * `Ctrl`. Read once at module load — this library targets a client-rendered app,
 * so there is no server render for the value to disagree with.
 */
export const isApplePlatform = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

/** What the chip shows. `mod` resolves per platform, so one string works everywhere. */
const keyGlyphs: Record<string, string> = {
  mod: isApplePlatform ? "⌘" : "Ctrl",
  meta: "⌘",
  cmd: "⌘",
  command: "⌘",
  ctrl: isApplePlatform ? "⌃" : "Ctrl",
  control: isApplePlatform ? "⌃" : "Ctrl",
  alt: isApplePlatform ? "⌥" : "Alt",
  option: "⌥",
  shift: "⇧",
  enter: "↵",
  return: "↵",
  escape: "Esc",
  esc: "Esc",
  backspace: "⌫",
  delete: "⌦",
  tab: "⇥",
  space: "Space",
  up: "↑",
  arrowup: "↑",
  down: "↓",
  arrowdown: "↓",
  left: "←",
  arrowleft: "←",
  right: "→",
  arrowright: "→",
};

/** What a screen reader hears, since `⌘` and `↵` do not read as anything useful. */
const keyNames: Record<string, string> = {
  mod: isApplePlatform ? "Command" : "Control",
  meta: "Command",
  cmd: "Command",
  command: "Command",
  ctrl: "Control",
  control: "Control",
  alt: isApplePlatform ? "Option" : "Alt",
  option: "Option",
  shift: "Shift",
  enter: "Enter",
  return: "Enter",
  escape: "Escape",
  esc: "Escape",
  backspace: "Backspace",
  delete: "Delete",
  tab: "Tab",
  space: "Space",
  up: "Arrow up",
  arrowup: "Arrow up",
  down: "Arrow down",
  arrowdown: "Arrow down",
  left: "Arrow left",
  arrowleft: "Arrow left",
  right: "Arrow right",
  arrowright: "Arrow right",
};

const kbdVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center rounded border border-border bg-card font-sans font-medium text-muted-foreground shadow-[inset_0_-1px_0_rgb(80_55_35_/_10%)]",
  {
    variants: {
      size: {
        sm: "h-4 min-w-4 px-1 text-[10px] leading-none",
        md: "h-5 min-w-5 px-1.5 text-[11px] leading-none",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type KbdSize = NonNullable<VariantProps<typeof kbdVariants>["size"]>;

/** Splits `"mod+k"` / `"g h"` into the parts a reader sees as separate chips. */
function parseKeys(keys: string | string[]) {
  return Array.isArray(keys) ? keys : keys.split(/[+\s]+/).filter(Boolean);
}

export function formatKeyGlyph(key: string) {
  return keyGlyphs[key.toLowerCase()] ?? (key.length === 1 ? key.toUpperCase() : key);
}

export function formatKeyName(key: string) {
  return keyNames[key.toLowerCase()] ?? key.toUpperCase();
}

export type KbdProps = Omit<ComponentProps<"kbd">, "children"> &
  VariantProps<typeof kbdVariants> & {
    /**
     * A shortcut to render as chips — `"mod+k"`, `"shift+enter"`, or `["g", "h"]`
     * for a sequence. `mod` becomes `⌘` on Apple hardware and `Ctrl` elsewhere.
     */
    keys?: string | string[];
    /** Shown between chips. `"then"` reads better for a two-stroke sequence than `+`. */
    separator?: string;
    children?: ComponentProps<"kbd">["children"];
  };

/**
 * A keyboard key, or a chord of them.
 *
 * Pass `keys` to let the chip resolve platform glyphs and the spoken name, or
 * pass children to render one key verbatim. The whole chord carries a single
 * accessible name, so a screen reader says "Command K" instead of spelling out
 * two symbols it has no words for.
 */
export function Kbd({ keys, separator, size, className, children, ...props }: KbdProps) {
  if (keys === undefined) {
    return (
      <kbd className={cn(kbdVariants({ size }), className)} {...props}>
        {children}
      </kbd>
    );
  }

  const parts = parseKeys(keys);
  const label = parts.map(formatKeyName).join(separator ? ` ${separator} ` : " ");

  return (
    <kbd aria-label={label} className={cn("inline-flex shrink-0 items-center gap-1", className)} {...props}>
      {parts.map((key, index) => (
        <span key={`${key}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 && separator && (
            <span aria-hidden="true" className="text-[10px] text-muted-foreground">
              {separator}
            </span>
          )}
          <kbd aria-hidden="true" className={cn(kbdVariants({ size }))}>
            {formatKeyGlyph(key)}
          </kbd>
        </span>
      ))}
    </kbd>
  );
}
