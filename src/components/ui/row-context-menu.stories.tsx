import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RowContextMenu, type RowMenuItem } from "./row-context-menu";

const meta: Meta<typeof RowContextMenu> = {
  title: "UI/RowContextMenu",
  component: RowContextMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### RowContextMenu

The right-click menu for a row in a list or table. It renders into
\`document.body\`, so a scroll container, a transform, or an \`overflow-hidden\`
ancestor can never clip it, and its fixed position is clamped to stay on screen
near the edges.

The component owns no state: the opener keeps the position and the row it
opened for, and closes on pointer-down, Escape, or a chosen entry. It knows
nothing about the row's data — pass the accessible name as \`label\` and the
entries as \`items\`.

\`\`\`tsx
{menu && (
  <RowContextMenu
    label={menu.row.title}
    items={[{ label: "Open", onSelect: open }, { label: "Delete", destructive: true, onSelect: remove }]}
    position={menu.position}
    onClose={() => setMenu(null)}
  />
)}
\`\`\`
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const ROWS = ["Fix the Safari login crash", "Rotate the staging tokens", "Draft the release notes"];

function MenuDemo({ entriesFor }: { entriesFor: (row: string, log: (message: string) => void) => RowMenuItem[] }) {
  const [menu, setMenu] = useState<{ row: string; x: number; y: number } | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <div className="w-96 p-4">
      <div className="overflow-hidden rounded-md border border-border bg-card">
        {ROWS.map((row) => (
          <div
            key={row}
            onContextMenu={(event) => {
              event.preventDefault();
              if (entriesFor(row, setChosen).length === 0) return;
              setMenu({ row, x: event.clientX, y: event.clientY });
            }}
            className="flex h-11 cursor-default items-center border-b border-border/60 px-3 text-sm last:border-b-0 hover:bg-muted/60"
          >
            {row}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground">
        {chosen ? chosen : "Right-click a row."}
      </p>
      {menu && (
        <RowContextMenu
          label={menu.row}
          items={entriesFor(menu.row, setChosen)}
          position={menu}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <MenuDemo
      entriesFor={(row, log) => [
        { label: "Open", onSelect: () => log(`Opened "${row}"`) },
        { label: "Copy link", onSelect: () => log(`Copied a link to "${row}"`) },
        { label: "Snooze", onSelect: () => log(`Snoozed "${row}"`) },
      ]}
    />
  ),
};

export const WithDestructiveEntry: Story = {
  render: () => (
    <MenuDemo
      entriesFor={(row, log) => [
        { label: "Open", onSelect: () => log(`Opened "${row}"`) },
        { label: "Delete", destructive: true, onSelect: () => log(`Deleted "${row}"`) },
      ]}
    />
  ),
};

export const NoEntries: Story = {
  parameters: {
    docs: {
      description: {
        story: "A row with no entries opens nothing — the opener checks the list before it sets a position.",
      },
    },
  },
  render: () => <MenuDemo entriesFor={(row) => (row === ROWS[0] ? [{ label: "Open", onSelect: () => {} }] : [])} />,
};
