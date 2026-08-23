import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function HoverCard({ children, ...props }: ComponentProps<typeof HoverCardPrimitive.Root>) {
  return (
    <HoverCardPrimitive.Root closeDelay={80} {...props}>
      {children}
    </HoverCardPrimitive.Root>
  );
}

export function HoverCardTrigger(props: ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger asChild {...props} />;
}

/**
 * A compact hover surface for status indicators and other inline detail.
 * Renders through a portal so table and navbar overflow never clip it.
 */
export function HoverCardContent({ className, children, ...props }: ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        sideOffset={6}
        collisionPadding={8}
        className={cn(
          "z-50 w-64 rounded-md border border-border bg-card p-2.5 text-[12px] leading-5 text-card-foreground shadow-[0_4px_16px_rgb(80_55_35_/_14%)]",
          className,
        )}
        {...props}
      >
        {children}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  );
}
