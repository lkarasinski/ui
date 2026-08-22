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
    detail: { description: "Extra detail appended to the hover tooltip.", table: { category: "Content" } },
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
  args: { name: "backup", state: "unconfigured", showLabel: true },
};
