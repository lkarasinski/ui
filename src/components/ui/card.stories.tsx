import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowUpRight, Ellipsis, GitCommitHorizontal, Rocket, TriangleAlert } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Card

Card is the base content surface: a settings block, a dashboard tile, a list panel, an empty state.

Padding lives on the slots, not on the root. That is what lets one card hold a padded header above a
full-bleed table or chart without a wrapper fighting the container.

\`\`\`tsx
<Card>
  <Card.Header divided>
    <Card.Heading>
      <Card.Title>Deployments</Card.Title>
      <Card.Description>Last 24 hours</Card.Description>
    </Card.Heading>
    <Card.Actions>
      <Badge variant="success">Healthy</Badge>
    </Card.Actions>
  </Card.Header>
  <Card.Content>…</Card.Content>
  <Card.Footer>
    <Button>Deploy</Button>
  </Card.Footer>
</Card>
\`\`\`

Every slot is optional and reorderable. \`Card.Divider\` and \`Card.Media\` are full-bleed, so they line up
with the header seam instead of the body padding.

The card clips its children to its own radius, which is what keeps a header background or a full-bleed
table from covering the rounded border. The trade-off: content that has to escape the card — a
non-portalled popover, for example — will be clipped.

For a card that is itself a click target, use \`Card.Button\` — it renders a real button, so keyboard
activation and focus come from the platform. For a navigation card, apply
\`cardVariants({ interactive: true })\` to an anchor.
`,
      },
    },
  },
  argTypes: {
    variant: {
      description: "Surface treatment. `default` for most content, `elevated` when the card floats over a busy page, `flat` in grids, `muted` for secondary blocks.",
      control: "select",
      options: ["default", "elevated", "flat", "muted"],
      table: { category: "Appearance", defaultValue: { summary: "default" } },
    },
    children: {
      description: "Card slots. Compose `Card.Header`, `Card.Content`, `Card.Footer`, `Card.Media`, and `Card.Divider` in any order.",
      control: false,
      table: { category: "Content" },
    },
    className: {
      description: "Additional Tailwind classes merged with the card styles. Use it for width and grid placement.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-[360px]">
      <Card.Header>
        <Card.Heading>
          <Card.Title>Workspace settings</Card.Title>
          <Card.Description>Applies to everyone in Northstar.</Card.Description>
        </Card.Heading>
      </Card.Header>
      <Card.Content className="pt-0 text-sm text-muted-foreground">
        Members inherit workspace defaults unless a project overrides them.
      </Card.Content>
    </Card>
  ),
  parameters: { docs: { description: { story: "Header plus body. Without a footer, drop the body's top padding so the description and text sit close together." } } },
};

export const Variants: Story = {
  render: () => (
    <div className="grid w-[760px] grid-cols-2 gap-4">
      {(["default", "elevated", "flat", "muted"] as const).map((variant) => (
        <Card key={variant} variant={variant}>
          <Card.Header>
            <Card.Heading>
              <Card.Title className="capitalize">{variant}</Card.Title>
              <Card.Description>Same slots, different surface.</Card.Description>
            </Card.Heading>
          </Card.Header>
          <Card.Content className="pt-0 text-sm text-muted-foreground">
            The variant only changes fill, border, and elevation.
          </Card.Content>
        </Card>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "The four surfaces. Mixing `default` and `muted` in one grid is the usual way to rank two blocks without a heading change." } } },
};

export const WithHeaderActions: Story = {
  render: () => (
    <Card className="w-[420px]">
      <Card.Header divided>
        <Card.Heading>
          <Card.Title>Production</Card.Title>
          <Card.Description>eu-central-1</Card.Description>
        </Card.Heading>
        <Card.Actions>
          <Badge variant="success">
            <Badge.Dot />
            Healthy
          </Badge>
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25"
          >
            <Ellipsis className="size-4" />
          </button>
        </Card.Actions>
      </Card.Header>
      <Card.Content className="text-sm text-muted-foreground">Deployed 12 minutes ago from `main`.</Card.Content>
    </Card>
  ),
  parameters: {
    docs: { description: { story: "`Card.Actions` holds the trailing header slot. `divided` adds the seam, which you want as soon as the header carries controls." } },
  },
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[420px]">
      <Card.Header divided>
        <Card.Heading>
          <Card.Title>Invite teammates</Card.Title>
          <Card.Description>They will join with the Member role.</Card.Description>
        </Card.Heading>
      </Card.Header>
      <Card.Content className="text-sm text-muted-foreground">
        Anyone with the link can request access. Requests appear in the pending list for an admin to approve.
      </Card.Content>
      <Card.Footer>
        <div className="w-24">
          <Button variant="outline">Copy link</Button>
        </div>
        <div className="w-24">
          <Button>
            <Button.Icon>
              <Rocket />
            </Button.Icon>
            Invite
          </Button>
        </div>
      </Card.Footer>
    </Card>
  ),
  parameters: { docs: { description: { story: "Footer actions align right. Buttons in this library stretch to their container, so give each one a width." } } },
};

export const FullBleedContent: Story = {
  render: () => (
    <Card className="w-[460px]">
      <Card.Header divided>
        <Card.Heading>
          <Card.Title>Recent commits</Card.Title>
        </Card.Heading>
        <Card.Actions>
          <Badge size="sm" variant="muted">
            3 new
          </Badge>
        </Card.Actions>
      </Card.Header>
      <Card.Content className="p-0">
        <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
          {[
            { sha: "a3f91c2", message: "fix: keep sidebar indicator in sync", author: "lk" },
            { sha: "71bd004", message: "feat: add badge and card surfaces", author: "lk" },
            { sha: "0c22de9", message: "chore: bump storybook", author: "mk" },
          ].map((commit) => (
            <li key={commit.sha} className="flex items-center gap-2.5 px-4 py-2.5 text-sm">
              <GitCommitHorizontal className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{commit.message}</span>
              <span className="font-mono text-xs text-muted-foreground">{commit.sha}</span>
            </li>
          ))}
        </ul>
      </Card.Content>
      <Card.Footer className="justify-start">
        <span className="text-sm text-muted-foreground">Showing 3 of 128</span>
      </Card.Footer>
    </Card>
  ),
  parameters: {
    docs: { description: { story: "`Card.Content` with `p-0` hands the padding to the rows, so dividers reach the card edges and line up with the header seam." } },
  },
};

export const WithMedia: Story = {
  render: () => (
    <Card className="w-[360px]" variant="elevated">
      <Card.Media>
        <div className="flex h-32 items-end gap-1 bg-gradient-to-b from-secondary to-muted px-4 pb-4">
          {[38, 54, 30, 72, 48, 88, 64].map((height, index) => (
            <div key={index} className="flex-1 rounded-t-sm bg-primary/70" style={{ height: `${height}%` }} />
          ))}
        </div>
      </Card.Media>
      <Card.Header>
        <Card.Heading>
          <Card.Title>Requests</Card.Title>
          <Card.Description>Last 7 days</Card.Description>
        </Card.Heading>
        <Card.Actions>
          <span className="font-mono text-sm tabular-nums">128k</span>
        </Card.Actions>
      </Card.Header>
    </Card>
  ),
  parameters: { docs: { description: { story: "`Card.Media` is full-bleed. The card clips its children to its own radius, so a cover or chart at either end needs no wrapper and no radius of its own." } } },
};

export const Sections: Story = {
  render: () => (
    <Card className="w-[420px]">
      <Card.Header divided>
        <Card.Heading>
          <Card.Title>Billing</Card.Title>
        </Card.Heading>
      </Card.Header>
      <Card.Content className="flex items-center justify-between">
        <span className="text-sm">Plan</span>
        <Badge variant="outline">Team</Badge>
      </Card.Content>
      <Card.Divider />
      <Card.Content className="flex items-center justify-between">
        <span className="text-sm">Seats</span>
        <span className="font-mono text-sm tabular-nums">18 / 25</span>
      </Card.Content>
      <Card.Divider />
      <Card.Content className="flex items-center justify-between">
        <span className="text-sm">Next invoice</span>
        <span className="text-sm text-muted-foreground">1 Sep 2026</span>
      </Card.Content>
    </Card>
  ),
  parameters: { docs: { description: { story: "Repeating `Card.Content` and `Card.Divider` builds a settings list without a second component." } } },
};

export const Clickable: Story = {
  render: () => (
    <div className="grid w-[560px] grid-cols-2 gap-3">
      {[
        { title: "Blank project", description: "Start from an empty repository." },
        { title: "From template", description: "Fork a preconfigured service." },
      ].map((option) => (
        <Card.Button key={option.title} onClick={() => {}}>
          <Card.Header>
            <Card.Heading>
              <Card.Title>{option.title}</Card.Title>
              <Card.Description>{option.description}</Card.Description>
            </Card.Heading>
            <Card.Actions>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </Card.Actions>
          </Card.Header>
        </Card.Button>
      ))}
    </div>
  ),
  parameters: {
    docs: { description: { story: "`Card.Button` is a real button: it takes focus, activates on Enter and Space, and presses down one pixel like the rest of the library." } },
  },
};

export const EmptyState: Story = {
  render: () => (
    <Card className="w-[420px]" variant="flat">
      <Card.Content className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
          <TriangleAlert className="size-4" />
        </span>
        <Card.Heading className="items-center">
          <Card.Title>No environments yet</Card.Title>
          <Card.Description>Create one to start deploying this service.</Card.Description>
        </Card.Heading>
        <div className="w-40 pt-1">
          <Button>Create environment</Button>
        </div>
      </Card.Content>
    </Card>
  ),
  parameters: { docs: { description: { story: "The empty state is the same card with a `flat` surface, so it never looks heavier than the content it replaces." } } },
};

export const Responsive: Story = {
  render: () => (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {["API", "Workers", "Storage", "Queues", "Cron", "Webhooks"].map((title) => (
        <Card key={title}>
          <Card.Header>
            <Card.Heading>
              <Card.Title>{title}</Card.Title>
              <Card.Description>Operational</Card.Description>
            </Card.Heading>
            <Card.Actions>
              <Badge size="sm" variant="success">
                <Badge.Dot />
                OK
              </Badge>
            </Card.Actions>
          </Card.Header>
        </Card>
      ))}
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: { description: { story: "Cards carry no width of their own, so a grid controls the layout. Resize the preview to see the columns collapse below `sm`." } },
  },
};
