import { OTPInput, OTPInputContext, type OTPInputProps } from "input-otp";
import { useContext } from "react";
import { cn } from "@/lib/utils";

export function InputOTP({ className, ...props }: OTPInputProps) {
  return <OTPInput containerClassName={cn("flex items-center justify-start gap-1.5", className)} {...props} />;
}

export function InputOTPGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex">{children}</div>;
}

export function InputOTPSlot({ index }: { index: number }) {
  const { slots } = useContext(OTPInputContext);
  const slot = slots[index];
  return (
    <div
      className={cn(
        "relative grid h-9.5 w-8.5 -ml-px place-items-center border border-input bg-card text-sm font-medium first:ml-0 first:rounded-l-md last:rounded-r-md",
        slot.isActive && "z-10 border-ring ring-1 ring-ring",
      )}
    >
      {slot.char}
    </div>
  );
}

export function InputOTPSeparator() {
  return <span className="h-px w-1.5 bg-muted-foreground" aria-hidden="true" />;
}
