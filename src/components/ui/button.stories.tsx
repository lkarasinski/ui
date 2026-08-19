import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Check, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button, useButtonFeedback } from "./button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: { children: "Button" },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Button

Use Button for actions that submit, save, continue, or navigate. It fills the available width, supports the native button props, and animates content changes such as switching from a label to a loading indicator.

#### Variants

- **default**: the primary action. This is the default.
- **outline**: a secondary action or an action with less visual emphasis.

#### Composition

Use \`Button.Icon\` for icons at either side of the label. The icon slot animates in and out while preserving the button layout.

Use \`useButtonFeedback\` when the async action is owned by another component, such as a dialog. Pass the controller to \`Button.Root\` and call \`feedback.confirm(message)\` after the action succeeds.

#### Examples

\`\`\`tsx
<Button onClick={save}>Save</Button>

<Button variant="outline">
  Continue
  <Button.Icon><ArrowRight /></Button.Icon>
</Button>

<Button disabled={isSaving}>
  {isSaving && <Button.Icon><Loader2 className="animate-spin" /></Button.Icon>}
  {isSaving ? "Saving…" : "Save"}
</Button>
\`\`\`

Keep the label action-oriented and do not use \`Button.Icon\` as a replacement for an accessible label. For icon-only actions, provide an \`aria-label\`.
`,
      },
    },
  },
  argTypes: {
    variant: {
      description: "Visual treatment of the button.",
      control: "inline-radio",
      options: ["default", "outline"],
      table: { category: "Button", defaultValue: { summary: "default" } },
    },
    disabled: {
      description: "Prevents interaction and applies the disabled visual state.",
      control: "boolean",
      table: { category: "Button", defaultValue: { summary: "false" } },
    },
    children: {
      description: "Button label. Use a story render function to compose `Button.Icon` or other React elements.",
      control: "text",
      table: { category: "Button" },
    },
    type: {
      description: "Native button type. Set `submit` when the button submits a form; use `button` for other actions.",
      control: "select",
      options: ["button", "submit", "reset"],
      table: { category: "Native button", defaultValue: { summary: "button" } },
    },
    className: {
      description: "Additional Tailwind classes merged with the component styles.",
      control: "text",
      table: { category: "Styling" },
    },
    onClick: {
      description: "Called when the button is activated.",
      control: false,
      table: { category: "Events" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  parameters: {
    docs: { description: { story: "The default button is intended for the primary action in a group of controls. Use the Controls panel to try different labels and native button states." } },
  },
};

export const Outline: Story = {
  args: { variant: "outline" },
  parameters: {
    docs: { description: { story: "Use the outline variant for secondary or less prominent actions. It keeps the same dimensions and interaction behavior as the default variant." } },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    docs: { description: { story: "Disabled buttons cannot be activated. Keep the disabled state tied to the operation that is unavailable, pending, or not valid yet." } },
  },
};

export const IconLeft: Story = {
  parameters: {
    docs: { description: { story: "Place `Button.Icon` before the label for an icon-leading action. Use this for actions such as download, upload, or add." } },
  },
  render: () => (
    <Button>
      <Button.Icon>
        <Download />
      </Button.Icon>
      Download
    </Button>
  ),
};

export const IconRight: Story = {
  parameters: {
    docs: { description: { story: "Place `Button.Icon` after the label for an icon-trailing action, such as continue, open, or navigate." } },
  },
  render: () => (
    <Button variant="outline">
      Continue
      <Button.Icon>
        <ArrowRight />
      </Button.Icon>
    </Button>
  ),
};

export const IconAppearing: Story = {
  parameters: {
    docs: { description: { story: "Use the appearing icon pattern for a pending action. Disable the button while work is in progress so the action cannot be submitted twice." } },
  },
  render: function Render() {
    const [loading, setLoading] = useState(false);
    return (
      <Button onClick={() => setLoading((v) => !v)} disabled={loading}>
        {loading && (
          <Button.Icon key="spinner">
            <Loader2 className="animate-spin" />
          </Button.Icon>
        )}
        {loading ? "Saving…" : "Save"}
      </Button>
    );
  },
};

export const Confirmation: Story = {
  parameters: {
    docs: {
      description: {
        story: `Create a feedback controller once, pass it to \`Button.Root\`, and call \`feedback.confirm(message)\` from the dialog after the async action succeeds. The message appears above the trigger and is dismissed automatically after three seconds by default.

\`\`\`tsx
const feedback = useButtonFeedback();

<Button.Root feedback={feedback}>
  <Button.Trigger variant="outline" onClick={() => setDialogOpen(true)}>
    Save
  </Button.Trigger>
</Button.Root>

<EditDialog onSaved={() => feedback.confirm(<>✓ Saved</>)} />
\`\`\``,
      },
      source: {
        code: `const feedback = useButtonFeedback();

<Button.Root feedback={feedback}>
  <Button.Trigger variant="outline" onClick={() => setDialogOpen(true)}>
    Save
  </Button.Trigger>
</Button.Root>

<EditDialog onSaved={() => feedback.confirm(<>✓ Saved</>)} />`,
      },
    },
  },
  render: function Render() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const feedback = useButtonFeedback();
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Button.Root feedback={feedback}>
          <DialogTrigger asChild>
            <Button.Trigger variant="outline">Open editor</Button.Trigger>
          </DialogTrigger>
        </Button.Root>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit workspace</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">The dialog owns the async action. The button only owns its feedback.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="w-auto min-h-8 px-3">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="w-auto min-h-8 px-3"
              onClick={() => {
                setDialogOpen(false);
                feedback.confirm(
                  <>
                    <Check size={14} />
                    Saved
                  </>,
                );
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};
