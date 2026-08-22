import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";
import { ItemTable } from "./item-table";
import type { ItemGroup, ItemTableHandle, TableItem, TableStatus } from "./item-table";

const meta: Meta<typeof ItemTable> = {
  title: "UI/ItemTable",
  component: ItemTable,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### ItemTable

The dense grouped table behind list-and-detail screens: 44px hairline rows, sticky collapsible
group headers, and one designed state per situation — loading, error, empty, populated.

The active row is the selected row. \`j\`/\`k\` (or the arrow keys) move it through the visible
rows; with \`selectMode="confirm"\` (default) \`Enter\` or a click commits and fires \`onSelect\`,
with \`"instant"\` every step commits as it passes. The scroll position follows the active row,
keeping three rows of padding on both sides. Group collapse persists through localStorage under
the table's \`storageKey\`, so it survives reloads.

Pass a \`ref\` to drive selection from outside (\`ref.current.selectItem(id)\`).

**Sources are data, not code.** A row carries an optional \`prefix\` (\`#\`, \`!\`, ...) with its
own color class; the table never branches on where items came from.

Rows render from \`groups\` only while \`status\` is \`ready\`. A table-level failure dims four
skeleton rows to hold the layout and floats a warning alert with a retry action over their middle.
A failed group keeps its header and shows an inline retry banner in place of its rows.
        `,
      },
    },
  },
  argTypes: {
    groups: { description: "Groups to render; empty groups are hidden.", table: { category: "Data" } },
    status: { description: "Discriminated loading / error / ready state.", table: { category: "Data" } },
    storageKey: { description: "Uniquely names this table's collapse state in localStorage.", table: { category: "Data" } },
    initialSelectedId: { description: "Id of the initially selected row.", table: { category: "Selection" } },
    selectMode: { description: 'How keyboard movement commits selection: "confirm" (default) or "instant".', table: { category: "Selection" } },
    onSelect: { description: "Selection handler; fires on click, Enter, and every step in instant mode.", table: { category: "Selection" } },
    onGroupRetry: { description: "Retries a failed group fetch.", table: { category: "Data" } },
    label: { description: 'Accessible name of the row list, e.g. "work items".', table: { category: "Content" } },
    emptyTitle: { description: "Title of the empty state.", table: { category: "Content" } },
    emptyHint: { description: "Hint line of the empty state; defaults to a note when every group is collapsed.", table: { category: "Content" } },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const HOUR = 3_600_000;
const NOW = Date.now();

function item(overrides: Partial<TableItem> & { id: string }): TableItem {
  return {
    state: "todo",
    flags: [],
    title: "Item title",
    updatedAt: NOW - 2 * HOUR,
    tags: [],
    ...overrides,
  };
}

const issue = { glyph: "#", className: "text-info" };
const request = { glyph: "!", className: "text-primary" };

const populatedGroups: ItemGroup[] = [
  {
    id: "needs-my-action",
    label: "Needs my action",
    items: [
      item({ id: "4821", prefix: issue, state: "in-progress", flags: ["needs-my-action"], title: "Review access request for the reporting workspace", projectName: "Platform", updatedAt: NOW - 12 * 60_000, tags: ["review"] }),
      item({ id: "913", prefix: request, state: "needs-review", flags: ["needs-my-action", "blocked"], title: "Rebase required before pipeline can merge", projectName: "web-client", updatedAt: NOW - 3 * HOUR, tags: ["backend"] }),
    ],
  },
  {
    id: "in-progress",
    label: "In progress",
    items: [
      item({ id: "4790", prefix: issue, state: "in-progress", title: "Split the export job into per-project chunks", projectName: "Platform", updatedAt: NOW - 5 * HOUR }),
      item({ id: "4802", prefix: issue, state: "todo", title: "Audit log retention is counted in wall days", projectName: "Platform", updatedAt: NOW - 26 * HOUR, tags: ["ops"] }),
      item({ id: "77", prefix: request, state: "in-progress", title: "Debounce project search input", projectName: "web-client", updatedAt: NOW - 2 * 24 * HOUR }),
    ],
  },
  {
    id: "done",
    label: "Done",
    items: [
      item({ id: "4712", prefix: issue, state: "done", title: "Rotate the API token", projectName: "Platform", updatedAt: NOW - 9 * 24 * HOUR, tags: ["security"] }),
    ],
  },
];

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="flex h-dvh flex-col bg-background">{children}</div>;
}

export const Populated: Story = {
  args: {
    groups: populatedGroups,
    status: { kind: "ready" },
    storageKey: "storybook.item-table.populated",
    label: "work items",
    initialSelectedId: "4790",
    onSelect: () => {},
  },
  render: (args) => (
    <Frame>
      <ItemTable {...args} />
    </Frame>
  ),
};

export const InstantSelection: Story = {
  args: {
    groups: populatedGroups,
    status: { kind: "ready" },
    storageKey: "storybook.item-table.instant",
    label: "work items",
    selectMode: "instant",
    initialSelectedId: "4790",
    onSelect: () => {},
  },
  render: (args) => (
    <Frame>
      <ItemTable {...args} />
    </Frame>
  ),
};

export const AutoScroll: Story = {
  args: {
    groups: [
      {
        id: "backlog",
        label: "Backlog",
        items: Array.from({ length: 40 }, (_, index) =>
          item({ id: String(3000 + index), state: index % 5 === 4 ? "done" : "todo", title: `Backlog item ${index + 1}`, updatedAt: NOW - (index + 1) * HOUR }),
        ),
      },
    ],
    status: { kind: "ready" },
    storageKey: "storybook.item-table.autoscroll",
    label: "long backlog",
    initialSelectedId: "3000",
  },
  render: (args) => (
    <Frame>
      <ItemTable {...args} />
    </Frame>
  ),
};

export function ExternalControlStory({ groups, storageKey }: { groups: ItemGroup[]; storageKey: string }) {
  const tableRef = useRef<ItemTableHandle>(null);
  return (
    <Frame>
      <div className="flex gap-2 border-b border-border bg-card px-3 py-2">
        <button
          type="button"
          onClick={() => tableRef.current?.selectItem("4790")}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-accent"
        >
          Select #4790
        </button>
        <button
          type="button"
          onClick={() => tableRef.current?.selectItem("77")}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-accent"
        >
          Select !77
        </button>
      </div>
      <ItemTable ref={tableRef} groups={groups} status={{ kind: "ready" }} storageKey={storageKey} label="work items" />
    </Frame>
  );
}

export const ExternalControl: Story = {
  args: {},
  render: () => <ExternalControlStory groups={populatedGroups} storageKey="storybook.item-table.external" />,
};

export const Loading: Story = {
  args: { groups: [], status: { kind: "loading" }, storageKey: "storybook.item-table.loading", label: "work items" },
  render: (args) => (
    <Frame>
      <ItemTable {...args} />
    </Frame>
  ),
};

export const Error: Story = {
  args: {
    groups: [],
    status: { kind: "error", message: "The source is unreachable.", onRetry: () => {} } satisfies TableStatus,
    storageKey: "storybook.item-table.error",
    label: "work items",
  },
  render: (args) => (
    <Frame>
      <ItemTable {...args} />
    </Frame>
  ),
};

export const PartialError: Story = {
  args: {
    groups: [
      populatedGroups[1],
      { id: "failed", label: "Failed group", items: [], error: "This group could not be loaded." },
    ],
    status: { kind: "ready" },
    storageKey: "storybook.item-table.partial-error",
    label: "work items",
  },
  render: (args) => (
    <Frame>
      <ItemTable {...args} />
    </Frame>
  ),
};

export const Empty: Story = {
  args: {
    groups: [{ id: "inbox", label: "Needs my action", items: [] }],
    status: { kind: "ready" },
    storageKey: "storybook.item-table.empty",
    label: "work items",
    emptyTitle: "Inbox zero",
    emptyHint: "Nothing needs your action right now.",
  },
  render: (args) => (
    <Frame>
      <ItemTable {...args} />
    </Frame>
  ),
};
