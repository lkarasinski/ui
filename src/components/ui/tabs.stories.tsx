import type { Meta, StoryObj } from "@storybook/react-vite";
import { Activity, FileText, GitPullRequest, Settings2, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "./badge";
import { Card } from "./card";
import { Tabs } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Tabs

Tabs switch one region of the page. Every panel must be reachable at any time and in any order — a
sequence with a required order is a wizard, not a tab set.

The root owns the active value and generates the tab/panel id pairing, so triggers and panels connect
themselves:

\`\`\`tsx
<Tabs defaultValue="overview" variant="line">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">…</Tabs.Content>
  <Tabs.Content value="activity">…</Tabs.Content>
</Tabs>
\`\`\`

**Keyboard.** Only the selected trigger is in the tab order. Arrow keys, Home, and End move between
tabs and activate them, following the ARIA tabs pattern. \`vimKeys\` on \`Tabs.List\` adds \`h\`/\`l\`.

**Motion.** The active indicator is a shared layout element, so it slides between tabs instead of
fading. Under \`prefers-reduced-motion\` it jumps.

**Switching cost.** Triggers commit on \`mousedown\`, like navigation. Panels unmount when hidden;
pass \`keepMounted\` to preserve scroll position or form state in an expensive panel.
`,
      },
    },
  },
  argTypes: {
    value: {
      description: "Controlled active tab. Pair it with `onValueChange`.",
      control: "text",
      table: { category: "State" },
    },
    defaultValue: {
      description: "Initially active tab for an uncontrolled tab set.",
      control: "text",
      table: { category: "State" },
    },
    onValueChange: {
      description: "Called with the value of the tab that became active.",
      control: false,
      table: { category: "Events" },
    },
    variant: {
      description: "`line` for page sections, `pill` for switching a view in place, `ghost` for toolbars and card headers.",
      control: "inline-radio",
      options: ["line", "pill", "ghost"],
      table: { category: "Appearance", defaultValue: { summary: "line" } },
    },
    className: {
      description: "Additional Tailwind classes merged with the root layout.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const panelText = {
  overview: "Two environments, both healthy. Last deploy 12 minutes ago from main.",
  activity: "maja deployed to production · lk opened a pull request · CI finished in 2m 41s.",
  members: "18 of 25 seats used. Three invitations are still pending.",
  settings: "Preview deployments are on. Cleanup after merge is off.",
};

export const Default: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="overview" className="w-[460px]">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="members">Members</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview" className="text-sm text-muted-foreground">
        {panelText.overview}
      </Tabs.Content>
      <Tabs.Content value="activity" className="text-sm text-muted-foreground">
        {panelText.activity}
      </Tabs.Content>
      <Tabs.Content value="members" className="text-sm text-muted-foreground">
        {panelText.members}
      </Tabs.Content>
    </Tabs>
  ),
  parameters: { docs: { description: { story: "The default underlined tabs. Focus a trigger and use the arrow keys — the indicator slides with the selection." } } },
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-[460px] flex-col gap-8">
      {(["line", "pill", "ghost"] as const).map((variant) => (
        <Tabs key={variant} defaultValue="overview" variant={variant}>
          <Tabs.List className={variant === "pill" ? "self-start" : undefined}>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
            <Tabs.Trigger value="members">Members</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview" className="text-sm text-muted-foreground">
            <code className="font-mono text-xs">variant=&quot;{variant}&quot;</code> — {panelText.overview}
          </Tabs.Content>
          <Tabs.Content value="activity" className="text-sm text-muted-foreground">
            {panelText.activity}
          </Tabs.Content>
          <Tabs.Content value="members" className="text-sm text-muted-foreground">
            {panelText.members}
          </Tabs.Content>
        </Tabs>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "All three surfaces. `pill` reads as a control, so give it a width that fits its labels instead of the full row." } } },
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="activity" variant="pill" className="w-[520px]">
      <Tabs.List className="self-start">
        <Tabs.Trigger value="overview">
          <FileText />
          Overview
        </Tabs.Trigger>
        <Tabs.Trigger value="activity">
          <Activity />
          Activity
        </Tabs.Trigger>
        <Tabs.Trigger value="members">
          <Users />
          Members
        </Tabs.Trigger>
        <Tabs.Trigger value="settings">
          <Settings2 />
          Settings
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview" className="text-sm text-muted-foreground">
        {panelText.overview}
      </Tabs.Content>
      <Tabs.Content value="activity" className="text-sm text-muted-foreground">
        {panelText.activity}
      </Tabs.Content>
      <Tabs.Content value="members" className="text-sm text-muted-foreground">
        {panelText.members}
      </Tabs.Content>
      <Tabs.Content value="settings" className="text-sm text-muted-foreground">
        {panelText.settings}
      </Tabs.Content>
    </Tabs>
  ),
  parameters: { docs: { description: { story: "Icons are sized by the trigger. Keep them for tabs whose labels are ambiguous on their own." } } },
};

export const WithCounters: Story = {
  render: () => (
    <Tabs defaultValue="open" className="w-[460px]">
      <Tabs.List>
        <Tabs.Trigger value="open">
          <GitPullRequest />
          Open
          <Badge size="sm" variant="muted" className="tabular-nums">
            12
          </Badge>
        </Tabs.Trigger>
        <Tabs.Trigger value="review">
          Needs review
          <Badge size="sm" variant="warning" className="tabular-nums">
            3
          </Badge>
        </Tabs.Trigger>
        <Tabs.Trigger value="merged">Merged</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="open" className="text-sm text-muted-foreground">
        12 open pull requests across 4 repositories.
      </Tabs.Content>
      <Tabs.Content value="review" className="text-sm text-muted-foreground">
        3 pull requests are waiting for your review.
      </Tabs.Content>
      <Tabs.Content value="merged" className="text-sm text-muted-foreground">
        41 merged in the last 30 days.
      </Tabs.Content>
    </Tabs>
  ),
  parameters: { docs: { description: { story: "Badges compose into a trigger without a counter prop, which keeps the tab API the same for every kind of label." } } },
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[460px]">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="audit" disabled>
          Audit log
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview" className="text-sm text-muted-foreground">
        {panelText.overview}
      </Tabs.Content>
      <Tabs.Content value="activity" className="text-sm text-muted-foreground">
        {panelText.activity}
      </Tabs.Content>
    </Tabs>
  ),
  parameters: { docs: { description: { story: "A disabled trigger is skipped by the arrow keys, so keyboard users never land on a tab that cannot open." } } },
};

export const InCardHeader: Story = {
  render: () => (
    <Card className="w-[480px]">
      <Tabs defaultValue="activity" variant="ghost">
        <Card.Header divided>
          <Card.Heading>
            <Card.Title>northstar/api</Card.Title>
          </Card.Heading>
          <Card.Actions>
            <Tabs.List>
              <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
              <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            </Tabs.List>
          </Card.Actions>
        </Card.Header>
        <Card.Content>
          <Tabs.Content value="activity" className="pt-0 text-sm text-muted-foreground">
            {panelText.activity}
          </Tabs.Content>
          <Tabs.Content value="settings" className="pt-0 text-sm text-muted-foreground">
            {panelText.settings}
          </Tabs.Content>
        </Card.Content>
      </Tabs>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "The list and the panels do not have to be siblings. Here the triggers sit in the card header and the panel in the body, connected through context.",
      },
    },
  },
};

export const Scrollable: Story = {
  render: () => (
    <div className="w-[320px]">
      <Tabs defaultValue="overview">
        <Tabs.List>
          {["Overview", "Activity", "Members", "Environments", "Integrations", "Audit log"].map((label) => (
            <Tabs.Trigger key={label} value={label.toLowerCase()}>
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="overview" className="text-sm text-muted-foreground">
          The list scrolls sideways instead of wrapping, and the scrollbar is hidden so it costs no row.
        </Tabs.Content>
        {["activity", "members", "environments", "integrations", "audit log"].map((value) => (
          <Tabs.Content key={value} value={value} className="text-sm text-muted-foreground">
            Panel for {value}.
          </Tabs.Content>
        ))}
      </Tabs>
    </div>
  ),
  parameters: { docs: { description: { story: "Too many tabs for the width: the row scrolls rather than wrapping, which keeps the panel in the same place." } } },
};

export const KeepMounted: Story = {
  render: () => (
    <Tabs defaultValue="draft" variant="pill" className="w-[460px]">
      <Tabs.List className="self-start">
        <Tabs.Trigger value="draft">Draft</Tabs.Trigger>
        <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="draft" keepMounted>
        <textarea
          aria-label="Draft"
          defaultValue="Type here, switch to Preview, and come back — the text survives because the panel stays mounted."
          className="min-h-24 w-full rounded-md border border-input bg-card p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-primary/25"
        />
      </Tabs.Content>
      <Tabs.Content value="preview" className="text-sm text-muted-foreground">
        Rendered output would go here.
      </Tabs.Content>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: "Panels unmount by default. `keepMounted` hides the panel instead, which is what you want for a form, a scrolled list, or an expensive chart.",
      },
    },
  },
};

export const VimKeys: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[460px]">
      <Tabs.List vimKeys>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="members">Members</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview" className="text-sm text-muted-foreground">
        Focus a tab and press `h` or `l`. Arrow keys keep working.
      </Tabs.Content>
      <Tabs.Content value="activity" className="text-sm text-muted-foreground">
        {panelText.activity}
      </Tabs.Content>
      <Tabs.Content value="members" className="text-sm text-muted-foreground">
        {panelText.members}
      </Tabs.Content>
    </Tabs>
  ),
  parameters: { docs: { description: { story: "`vimKeys` adds `h`/`l` next to the arrow keys. It is off by default — turn it on for tools where that is the house style." } } },
};

export const Controlled: Story = {
  render: function Render() {
    const [tab, setTab] = useState("activity");
    return (
      <div className="flex w-[460px] flex-col gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
            <Tabs.Trigger value="members">Members</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview" className="text-sm text-muted-foreground">
            {panelText.overview}
          </Tabs.Content>
          <Tabs.Content value="activity" className="text-sm text-muted-foreground">
            {panelText.activity}
          </Tabs.Content>
          <Tabs.Content value="members" className="text-sm text-muted-foreground">
            {panelText.members}
          </Tabs.Content>
        </Tabs>
        <p className="m-0 font-mono text-xs text-muted-foreground">value: {tab}</p>
      </div>
    );
  },
  parameters: { docs: { description: { story: "Controlled tabs, which is what you need when the active tab lives in the URL or in a router search param." } } },
};
