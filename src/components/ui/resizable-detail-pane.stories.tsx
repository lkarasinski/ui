import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShell } from "@/components/ui/app-shell";
import { ResizableDetailPane } from "./resizable-detail-pane";

const meta: Meta<typeof ResizableDetailPane> = {
  title: "UI/ResizableDetailPane",
  component: ResizableDetailPane,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### ResizableDetailPane

The docked right panel of the two-pane split, rendered as an \`AppShell.Aside\`. Drag its left
edge — or focus the edge and use the arrow keys — to resize it between 280px and 720px.

With a \`storageKey\` the width persists through localStorage and survives reload; without one
the pane resets on every mount.

\`\`\`tsx
<AppShell>
  <AppShell.Body>
    <AppShell.Main>{list}</AppShell.Main>
    <ResizableDetailPane label="Details" storageKey="inbox.detail-width">
      {details}
    </ResizableDetailPane>
  </AppShell.Body>
</AppShell>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    label: { description: "Accessible name of the pane and its resize handle.", table: { category: "Content" } },
    storageKey: { description: "localStorage key that persists the width across reloads.", table: { category: "Behavior" } },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

function PaneContent() {
  return (
    <>
      <div className="flex h-14 shrink-0 items-center border-b border-border px-4 sm:h-16">
        <p className="text-[13px] font-bold tracking-[-0.02em] text-foreground">Details</p>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-16 shrink-0 rounded-lg border border-border bg-secondary/50" />
        ))}
      </div>
    </>
  );
}

export const InShell: Story = {
  args: { label: "Details", storageKey: "storybook.resizable-detail-pane" },
  render: (args) => (
    <AppShell>
      <AppShell.Body>
        <AppShell.Main>
          <div className="p-8">
            <h1 className="text-2xl font-bold tracking-[-0.04em] text-foreground">Inbox</h1>
            <div className="mt-6 flex flex-col gap-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-16 rounded-lg border border-border bg-card" />
              ))}
            </div>
          </div>
        </AppShell.Main>
        <ResizableDetailPane {...args}>
          <PaneContent />
        </ResizableDetailPane>
      </AppShell.Body>
    </AppShell>
  ),
};
