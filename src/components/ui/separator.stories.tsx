import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import { Card } from "./card";
import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Separator

Separator is a rule between two blocks of content: a form section break, a toolbar divider, an "or"
between two sign-in methods.

\`\`\`tsx
<Separator />
<Separator orientation="vertical" />
<Separator label="or" />
\`\`\`

It is decorative by default and stays out of the accessibility tree — most rules are visual grouping
that a screen reader already gets from headings and landmarks. Pass \`decorative={false}\` when the rule
is the only thing separating two sections.

The vertical orientation stretches to its flex parent, so it belongs in a row with a known height
rather than carrying a height of its own.
`,
      },
    },
  },
  argTypes: {
    orientation: {
      description: "`horizontal` between stacked blocks, `vertical` between items in a row.",
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      table: { category: "Layout", defaultValue: { summary: "horizontal" } },
    },
    label: {
      description: "Optional text in the middle of the rule. Keep it to one or two words.",
      control: "text",
      table: { category: "Content" },
    },
    decorative: {
      description: "Keeps the rule out of the accessibility tree. Set it to false when the rule carries real meaning.",
      control: "boolean",
      table: { category: "Accessibility", defaultValue: { summary: "true" } },
    },
    className: {
      description: "Additional Tailwind classes merged with the rule styles.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: (args) => (
    <div className="flex w-[380px] flex-col gap-4">
      <p className="m-0 text-sm text-muted-foreground">Everything above the rule.</p>
      <Separator {...args} />
      <p className="m-0 text-sm text-muted-foreground">Everything below it.</p>
    </div>
  ),
  parameters: { docs: { description: { story: "The plain horizontal rule." } } },
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-3 text-sm">
      <span>Production</span>
      <Separator orientation="vertical" />
      <span className="text-muted-foreground">eu-central-1</span>
      <Separator orientation="vertical" />
      <span className="font-mono text-xs text-muted-foreground">a3f91c2</span>
    </div>
  ),
  parameters: { docs: { description: { story: "In a row the rule stretches to the parent's height — give the row a height and the separator needs no size." } } },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-[340px] flex-col gap-4">
      <Button variant="outline">Continue with SSO</Button>
      <Separator label="or" />
      <Button>Sign in with email</Button>
    </div>
  ),
  parameters: { docs: { description: { story: "The labelled rule splits two alternatives. The label uses the caption style, so it reads as a divider and not as a heading." } } },
};

export const SectionBreak: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="m-0 text-base font-semibold">Profile</h3>
        <p className="m-0 text-sm text-muted-foreground">Name, avatar, and public links.</p>
      </div>
      <Separator label="Danger zone" decorative={false} />
      <div className="flex flex-col gap-1">
        <h3 className="m-0 text-base font-semibold">Delete account</h3>
        <p className="m-0 text-sm text-muted-foreground">This removes every workspace you own.</p>
      </div>
    </div>
  ),
  parameters: {
    docs: { description: { story: "When the rule is the boundary between two sections rather than decoration, `decorative={false}` exposes it as a real separator." } },
  },
};

export const InToolbar: Story = {
  render: () => (
    <Card className="w-[440px]">
      <Card.Header className="items-center">
        <Card.Heading>
          <Card.Title>Editor</Card.Title>
        </Card.Heading>
        <Card.Actions className="h-6">
          <button type="button" className="rounded px-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            B
          </button>
          <button type="button" className="rounded px-1.5 text-sm text-muted-foreground italic transition-colors hover:bg-muted hover:text-foreground">
            I
          </button>
          <Separator orientation="vertical" />
          <button type="button" className="rounded px-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            {"</>"}
          </button>
        </Card.Actions>
      </Card.Header>
      <Card.Content className="pt-0 text-sm text-muted-foreground">Toolbar groups read faster with a rule than with extra spacing.</Card.Content>
    </Card>
  ),
  parameters: { docs: { description: { story: "Grouping toolbar buttons. The rule sits inside a fixed-height row, which is what gives it a height." } } },
};

export const InsideCard: Story = {
  render: () => (
    <Card className="w-[400px]">
      <Card.Content className="flex flex-col gap-3">
        <span className="text-sm font-medium">Session</span>
        <Separator className="-mx-4 w-auto" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Signed in</span>
          <span>2 hours ago</span>
        </div>
      </Card.Content>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "Inside a padded body a negative margin makes the rule full-bleed. For repeated sections, `Card.Divider` already does this without the margin trick.",
      },
    },
  },
};
