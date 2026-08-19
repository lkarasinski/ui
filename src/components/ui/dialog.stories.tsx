import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Input } from "./input";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process output</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Dialog body content goes here.</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="w-auto min-h-8 px-3">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

type SaveState = { status: "idle" } | { status: "pending" } | { status: "error"; message: string };

function mockSaveRequest(shouldFail: boolean) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => (shouldFail ? reject(new Error("Couldn't reach the server. Try again.")) : resolve()), 1200);
  });
}

function AsyncRenameDialog({ shouldFail }: { shouldFail: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Acme Inc.");
  const [state, setState] = useState<SaveState>({ status: "idle" });
  const [showSuccess, setShowSuccess] = useState(false);
  const pending = state.status === "pending";

  const handleOpenChange = (next: boolean) => {
    if (pending) return;
    setOpen(next);
    // Reset on open, not on close: clearing state the instant `open` flips to
    // false would change the dialog's content (and height) while it's still
    // animating out, causing a visible flash.
    if (next) setState({ status: "idle" });
  };

  const handleSave = async () => {
    setState({ status: "pending" });
    try {
      await mockSaveRequest(shouldFail);
      setOpen(false);
      setShowSuccess(true);
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Something went wrong." });
    }
  };

  return (
    <Button.Confirmation
      show={showSuccess}
      onDismiss={() => setShowSuccess(false)}
      message={
        <>
          <Check size={14} />
          Saved
        </>
      }
    >
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">Rename workspace</Button>
        </DialogTrigger>
        <DialogContent
          onEscapeKeyDown={(event) => pending && event.preventDefault()}
          onInteractOutside={(event) => pending && event.preventDefault()}
        >
          <DialogHeader closeDisabled={pending}>
            <DialogTitle>Rename workspace</DialogTitle>
          </DialogHeader>
          <label htmlFor="workspace-name" className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            Workspace name
            <Input
              id="workspace-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={pending}
            />
          </label>
          {state.status === "error" && <p className="mt-2 text-sm text-destructive-foreground">{state.message}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="w-auto min-h-8 px-3" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="w-auto min-h-8 px-3"
              onClick={handleSave}
              disabled={pending || name.trim().length === 0}
            >
              {pending && (
                <Button.Icon key="spinner">
                  <Loader2 className="animate-spin" />
                </Button.Icon>
              )}
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Button.Confirmation>
  );
}

export const AsyncSuccess: Story = {
  name: "Async / Succeeds",
  render: () => <AsyncRenameDialog shouldFail={false} />,
};

export const AsyncError: Story = {
  name: "Async / Fails",
  render: () => <AsyncRenameDialog shouldFail={true} />,
};
