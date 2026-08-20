import { cva, type VariantProps } from "class-variance-authority";
import { useState, type ComponentProps } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

const avatarVariants = cva("relative inline-grid shrink-0 place-items-center border border-border bg-muted text-muted-foreground select-none", {
  variants: {
    size: {
      xs: "size-5 text-[10px]",
      sm: "size-6 text-[11px]",
      md: "size-8 text-xs",
      lg: "size-10 text-sm",
    },
    shape: {
      circle: "rounded-full",
      square: "rounded-md",
    },
  },
  defaultVariants: { size: "md", shape: "circle" },
});

export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>;

const AvatarContext = createContext<{ size: AvatarSize } | null>(null);

function useAvatarSize() {
  return useContextSelector(AvatarContext, (context) => context?.size ?? "md");
}

export type AvatarProps = ComponentProps<"span"> & VariantProps<typeof avatarVariants>;

/**
 * A user or entity picture with a text fallback.
 *
 * The parts are stacked in one grid cell, so the fallback is already painted
 * underneath while the image loads and stays there if it fails. Nothing shifts
 * and no spinner is needed.
 */
export function AvatarRoot({ size = "md", shape, className, children, ...props }: AvatarProps) {
  return (
    <AvatarContext.Provider value={{ size: size ?? "md" }}>
      <span data-size={size} className={cn(avatarVariants({ size, shape }), className)} {...props}>
        {children}
      </span>
    </AvatarContext.Provider>
  );
}

/** The picture. It hides itself if the source fails, uncovering the fallback below. */
export function AvatarImage({ className, onError, alt = "", ...props }: ComponentProps<"img">) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <img
      {...props}
      alt={alt}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      // `rounded-[inherit]` clips the image to the avatar shape without `overflow-hidden`,
      // which would cut the status dot off at the corner.
      className={cn("col-start-1 row-start-1 size-full rounded-[inherit] object-cover", className)}
    />
  );
}

/** Initials, an icon, or a placeholder shown until — or instead of — the image. */
export function AvatarFallback({ className, ...props }: ComponentProps<"span">) {
  return <span aria-hidden="true" className={cn("col-start-1 row-start-1 font-medium tracking-tight [&_svg]:size-1/2", className)} {...props} />;
}

const avatarStatusVariants = cva("absolute rounded-full ring-2 ring-card", {
  variants: {
    tone: {
      online: "bg-success",
      busy: "bg-destructive",
      away: "bg-warning",
      offline: "bg-muted-foreground",
    },
    size: {
      xs: "size-1.5 -right-px -bottom-px",
      sm: "size-2 right-0 bottom-0",
      md: "size-2.5 right-0 bottom-0",
      lg: "size-3 right-0 bottom-0",
    },
  },
  defaultVariants: { tone: "online", size: "md" },
});

export type AvatarStatusProps = Omit<ComponentProps<"span">, "children"> &
  Pick<VariantProps<typeof avatarStatusVariants>, "tone"> & {
    /** Names the state for screen readers, since the dot itself carries no text. */
    label: string;
  };

/** A presence dot in the corner, sized from the avatar it sits in. */
export function AvatarStatus({ tone = "online", label, className, ...props }: AvatarStatusProps) {
  const size = useAvatarSize();
  return (
    <span role="img" aria-label={label} data-tone={tone} className={cn(avatarStatusVariants({ tone, size }), className)} {...props} />
  );
}

const avatarGroupVariants = cva("flex items-center", {
  variants: {
    size: {
      xs: "-space-x-1.5",
      sm: "-space-x-2",
      md: "-space-x-2.5",
      lg: "-space-x-3",
    },
  },
  defaultVariants: { size: "md" },
});

export type AvatarGroupProps = ComponentProps<"div"> & { size?: AvatarSize };

/**
 * A stack of overlapping avatars.
 *
 * The group only sets the overlap and the ring; the avatars stay ordinary
 * children, so the last slot can be an overflow count, an add button, or a
 * differently shaped avatar.
 */
export function AvatarGroup({ size = "md", className, children, ...props }: AvatarGroupProps) {
  return (
    <div
      data-size={size}
      className={cn(avatarGroupVariants({ size }), "[&>*]:ring-2 [&>*]:ring-card", className)}
      {...props}
    >
      {children}
    </div>
  );
}

AvatarRoot.Image = AvatarImage;
AvatarRoot.Fallback = AvatarFallback;
AvatarRoot.Status = AvatarStatus;
AvatarRoot.Group = AvatarGroup;

export const Avatar = AvatarRoot;
