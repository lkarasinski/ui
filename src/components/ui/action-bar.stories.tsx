import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, ExternalLink, CheckCheck, EyeOff } from "lucide-react";
import { ActionBar } from "./action-bar";

const meta: Meta<typeof ActionBar> = {
  title: "UI/ActionBar",
  component: ActionBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### ActionBar

A floating toolbar for bulk actions on a multi-select — the \`x\` / \`shift+j\`
selection model's action surface. Shows how many rows are selected, the actions
that apply to all of them, and one clear escape.

Renders nothing while \`count < 1\`, so it can stay mounted. It floats above
the list and never steals focus: the list keeps owning \`j/k/x/Esc\` while the
bar is up.

\`\`\`tsx
<ActionBar count={selected.size} onClear={() => setSelected(new Set())}>
  <ActionBar.Action onClick={copyLinks}><Copy /> Copy</ActionBar.Action>
  <ActionBar.Action destructive onClick={dismissAll}><EyeOff /> Dismiss</ActionBar.Action>
</ActionBar>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    count: { description: "Number of selected rows; renders nothing below 1.", table: { category: "State" } },
    label: { description: "Accessible name of the bar.", table: { category: "Content" } },
    onClear: { description: "Clears the selection.", table: { category: "Events" } },
  },
  decorators: [
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
  args: {
    count: 3,
    onClear: () => {},
    children: (
      <>
        <ActionBar.Action>
          <Copy aria-hidden="true" /> Copy
        </ActionBar.Action>
        <ActionBar.Action>
          <ExternalLink aria-hidden="true" /> Open
        </ActionBar.Action>
        <ActionBar.Action>
          <CheckCheck aria-hidden="true" /> Mark handled
        </ActionBar.Action>
        <ActionBar.Action destructive>
          <EyeOff aria-hidden="true" /> Dismiss
        </ActionBar.Action>
      </>
    ),
  },
};

export const SingleAction: Story = {
  args: {
    count: 1,
    onClear: () => {},
    children: (
      <ActionBar.Action>
        <Copy aria-hidden="true" /> Copy
      </ActionBar.Action>
    ),
  },
};

export const DisabledAction: Story = {
  args: {
    count: 12,
    onClear: () => {},
    children: (
      <>
        <ActionBar.Action disabled>
          <Copy aria-hidden="true" /> Copy
        </ActionBar.Action>
        <ActionBar.Action>
          <ExternalLink aria-hidden="true" /> Open
        </ActionBar.Action>
      </>
    ),
  },
};

export const HiddenWithoutSelection: Story = {
  args: { count: 0, onClear: () => {} },
};
