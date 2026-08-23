import type { Meta, StoryObj } from "@storybook/react-vite";
import { UndoToast } from "./undo-toast";

const meta: Meta<typeof UndoToast> = {
  title: "UI/UndoToast",
  component: UndoToast,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### UndoToast

A timed confirmation strip for destructive-but-reversible actions — the triage
verbs, a dismissed report, a deleted note. It announces what happened, offers
one recovery action, and expires on its own.

The countdown pauses while the pointer or focus is inside, so reaching for the
button never races the clock. A hairline bar along the bottom edge drains with
the remaining time; its height is constant, so nothing shifts.

Mounting stays with the parent — render it only while the undo window is open:

\`\`\`tsx
{pendingDismiss && (
  <UndoToast
    message="Report dismissed"
    onAction={() => restoreReport(pendingDismiss)}
    onExpire={() => setPendingDismiss(null)}
  />
)}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    message: { description: "What just happened.", table: { category: "Content" } },
    actionLabel: { description: "Label of the recovery action.", table: { category: "Content" } },
    duration: { description: "Milliseconds before automatic expiry.", table: { category: "Behavior" } },
    onAction: { description: "Called when the action button is pressed.", table: { category: "Events" }, action: "actioned" },
    onExpire: { description: "Called once when the countdown runs out (also wired to the close button).", table: { category: "Events" }, action: "expired" },
  },
  decorators: [
    // The toast positions itself against the viewport; give the canvas height
    // so the fixed placement is visible in the story.
    (Story) => (
      <div className="relative h-64">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { message: "Report dismissed", duration: 15000 },
};

export const CustomActionLabel: Story = {
  args: { message: "Moved to handled", actionLabel: "Restore", duration: 15000 },
};

export const DismissOnly: Story = {
  args: { message: "Snapshot saved", duration: 60000 },
};

export const LongMessage: Story = {
  args: { message: 'Linked to "#6030 — Login page crashes on Safari"', duration: 15000 },
};
