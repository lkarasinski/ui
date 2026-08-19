import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/28 data-[state=open]:animate-dialog-overlay-in data-[state=closed]:animate-dialog-overlay-out" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-51 w-[min(420px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-border bg-card p-4.5 text-card-foreground shadow-[0_20px_45px_rgb(61_46_31_/_22%)] data-[state=open]:animate-dialog-content-in data-[state=closed]:animate-dialog-content-out",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({
  className,
  children,
  closeDisabled,
  ...props
}: ComponentProps<"div"> & { closeDisabled?: boolean }) {
  return (
    <div
      className={cn(
        "-mx-4.5 -mt-4.5 mb-3.5 flex items-center justify-between gap-3 border-b border-border bg-gradient-to-b from-white to-card px-4.5 py-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_85%)]",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        disabled={closeDisabled}
        className="inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        aria-label="Close"
      >
        <X size={14} />
      </DialogPrimitive.Close>
    </div>
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("m-0 text-base font-medium", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mt-3.5 flex items-center justify-end gap-2", className)} {...props} />;
}
