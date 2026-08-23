import type { Meta, StoryObj } from "@storybook/react-vite";
import { HealthDot } from "./health-dot";

const meta: Meta<typeof HealthDot> = {
  title: "UI/HealthDot",
  component: HealthDot,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### HealthDot

A live connection indicator for one external dependency: a small colored dot, optionally
followed by the dependency's name.

The dot holds a fixed size in every state — checking included — so polling never shifts the
surrounding content. State arrives through props; the polling itself stays with the consumer,
which keeps the dot usable with any health check.

Hovering or focusing the dot opens a [HoverCard](/docs/ui-hovercard--docs) with the full
status, an optional \`detail\` line, and any extra nodes passed as \`info\` — a freshness
stamp, a link to the status page.

\`\`\`tsx
<HealthDot name="api" state="healthy" showLabel />
<HealthDot name="mail" state="checking" />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    name: { description: "Name of the watched thing, spoken in the accessible label.", table: { category: "Content" } },
    state: { description: "`healthy`, `unhealthy`, `unconfigured`, or `checking`.", table: { category: "State" } },
    showLabel: { description: "Shows the name next to the dot.", table: { category: "Content" } },
    detail: { description: "Extra detail line in the hover card.", table: { category: "Content" } },
    info: { description: "Additional hover card lines, e.g. freshness.", table: { category: "Content" } },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Healthy: Story = {
  args: { name: "api", state: "healthy", showLabel: true },
};

export const Unreachable: Story = {
  args: { name: "api", state: "unhealthy", showLabel: true, detail: "connection refused" },
};

export const Checking: Story = {
  args: { name: "mail", state: "checking", showLabel: true },
};

export const Unconfigured: Story = {
  args: { name: "backup", state: "unconfigured", showLabel: true, detail: "No token set for this workspace." },
};

export const WithoutLabel: Story = {
  args: { name: "api", state: "healthy" },
};

export const WithInfo: Story = {
  args: {
    name: "redmine",
    state: "unhealthy",
    showLabel: true,
    detail: "HTTP 502 · last reached 12 minutes ago",
    info: <p className="mt-1.5 border-t border-border pt-1.5 text-muted-foreground">Showing data from 14:32.</p>,
  },
};

export const Row: Story = {
  parameters: {
    docs: { description: { story: "Several dependencies in one status strip; each dot opens its own card." } },
  },
  render: () => (
    <div className="flex items-center gap-4 rounded-md border border-border bg-card px-3 py-2">
      <HealthDot name="api" state="healthy" showLabel detail="42 ms" />
      <HealthDot name="redmine" state="unhealthy" showLabel detail="connection refused" />
      <HealthDot name="mail" state="checking" showLabel />
      <HealthDot name="backup" state="unconfigured" showLabel />
    </div>
  ),
};
