import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowUpRight, Check, GitBranch, Lock, ShieldAlert, Sparkles } from "lucide-react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  args: { children: "Active" },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Badge

Badge is a compact label for status, counts, roles, and tags. It renders a \`span\`, so it can sit inside a
heading, a table cell, a nav item, or a button label without extra layout.

The component owns the surface only. Icons, dots, and numbers are children, which keeps one variant set
usable for every kind of badge instead of growing a prop per content type.

\`\`\`tsx
<Badge variant="success">
  <Badge.Dot />
  Deployed
</Badge>

<Badge variant="outline" size="sm">
  <GitBranch />
  main
</Badge>
\`\`\`

Badge is not interactive. When the label needs a click target — a removable filter chip, for example —
wrap it in a button and keep the badge as the visual.
`,
      },
    },
  },
  argTypes: {
    variant: {
      description: "Visual tone. Use `default` for the primary emphasis, `muted` for neutral metadata, and the semantic tones for state.",
      control: "select",
      options: ["default", "outline", "muted", "success", "warning", "destructive"],
      table: { category: "Appearance", defaultValue: { summary: "default" } },
    },
    size: {
      description: "`md` matches body rows and headers. `sm` is for dense tables and nav counters.",
      control: "inline-radio",
      options: ["sm", "md"],
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    children: {
      description: "Badge content. Accepts text, a `Badge.Dot`, and Lucide icons, which are sized to 12px automatically.",
      control: "text",
      table: { category: "Content" },
    },
    className: {
      description: "Additional Tailwind classes merged with the badge styles.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  parameters: { docs: { description: { story: "The primary badge. Use it sparingly — one emphasized badge per row reads better than five." } } },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="muted">Muted</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
  parameters: { docs: { description: { story: "All tones side by side. The semantic tones are tinted rather than solid so a table full of them stays readable." } } },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="sm" variant="outline">
        Small outline
      </Badge>
      <Badge size="md" variant="outline">
        Medium outline
      </Badge>
    </div>
  ),
  parameters: { docs: { description: { story: "Both sizes keep the same horizontal rhythm, so mixing them inside one table is safe." } } },
};

export const WithDot: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="success">
        <Badge.Dot />
        Running
      </Badge>
      <Badge variant="warning">
        <Badge.Dot />
        Degraded
      </Badge>
      <Badge variant="destructive">
        <Badge.Dot />
        Failed
      </Badge>
      <Badge variant="muted">
        <Badge.Dot />
        Paused
      </Badge>
    </div>
  ),
  parameters: {
    docs: { description: { story: "`Badge.Dot` inherits the badge text color through `bg-current`, so status pills need one prop, not two." } },
  },
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline">
        <GitBranch />
        feature/billing
      </Badge>
      <Badge variant="success">
        <Check />
        Verified
      </Badge>
      <Badge variant="destructive">
        <ShieldAlert />
        Access revoked
      </Badge>
      <Badge>
        <Sparkles />
        New
      </Badge>
    </div>
  ),
  parameters: { docs: { description: { story: "Icons are sized and aligned by the badge itself. Put the icon first unless it points forward, like an external-link arrow." } } },
};

export const Counts: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm" variant="muted" className="min-w-4.5 justify-center px-1 font-mono tabular-nums">
        3
      </Badge>
      <Badge size="sm" className="min-w-4.5 justify-center px-1 font-mono tabular-nums">
        12
      </Badge>
      <Badge size="sm" variant="destructive" className="min-w-4.5 justify-center px-1 font-mono tabular-nums">
        99+
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Counters use the mono font and `tabular-nums` so the badge does not resize as the number changes. A minimum width keeps single digits round.",
      },
    },
  },
};

export const InContext: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
      {[
        { name: "api-gateway", tone: "success", state: "Deployed", meta: "2m ago" },
        { name: "billing-worker", tone: "warning", state: "Restarting", meta: "just now" },
        { name: "legacy-cron", tone: "muted", state: "Paused", meta: "3d ago" },
      ].map((row) => (
        <div key={row.name} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
          <span className="flex items-center gap-2 text-sm font-medium">
            {row.name}
            {row.name === "billing-worker" && (
              <Badge size="sm" variant="outline">
                <Lock />
                locked
              </Badge>
            )}
          </span>
          <span className="flex items-center gap-2">
            <Badge size="sm" variant={row.tone as "success" | "warning" | "muted"}>
              <Badge.Dot />
              {row.state}
            </Badge>
            <span className="text-xs text-muted-foreground">{row.meta}</span>
          </span>
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "A realistic density check: badges inside a service list, mixing a role tag with a status pill." } } },
};

export const Interactive: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-primary/25">
        <Badge variant="outline" className="transition-colors hover:border-input hover:bg-secondary-hover">
          Open in dashboard
          <ArrowUpRight />
        </Badge>
      </button>
      <button type="button" className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-primary/25">
        <Badge variant="muted" className="transition-colors hover:bg-border">
          owner:me
          <span aria-hidden="true">×</span>
          <span className="sr-only">Remove filter</span>
        </Badge>
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Badge stays non-interactive. For a clickable chip, wrap it in a real button and let the button own focus, hover, and the accessible name.",
      },
    },
  },
};

export const LongContent: Story = {
  render: () => (
    <div className="flex w-[240px] flex-col items-start gap-2">
      <Badge variant="outline" className="max-w-full">
        <GitBranch />
        <span className="truncate">release/2026-08-payments-migration</span>
      </Badge>
      <Badge variant="muted">Wraps only if you let it</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Badges never wrap on their own. In a narrow container, cap the width and truncate the label so the pill shape survives.",
      },
    },
  },
};
