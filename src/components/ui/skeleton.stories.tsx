import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Avatar } from "./avatar";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Skeleton } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Skeleton

Skeleton is a placeholder for content that has not arrived yet.

It has no size of its own on purpose. Give it the size of the thing it replaces, so the real content
lands in exactly the same place and the page does not jump when the data arrives:

\`\`\`tsx
<Skeleton.Region label="Loading members">
  <Skeleton shape="circle" className="size-8" />
  <Skeleton.Text lines={2} />
</Skeleton.Region>
\`\`\`

**When not to use it.** Only when there is nothing to show. If content is already on screen — a
refetch, a filter change, a sort — replacing it with grey boxes is more disruptive than an inline
spinner or a dimmed list.

The sheen stops under \`prefers-reduced-motion\`. \`Skeleton.Region\` marks the area \`aria-busy\` and
gives it one accessible name, so a screen reader hears "loading" instead of a list of empty boxes.
`,
      },
    },
  },
  argTypes: {
    shape: {
      description: "`block` for surfaces and buttons, `text` for lines of copy, `circle` for avatars.",
      control: "inline-radio",
      options: ["block", "text", "circle"],
      table: { category: "Appearance", defaultValue: { summary: "block" } },
    },
    className: {
      description: "Size and spacing. This is the main prop — match it to the real content.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: (args) => <Skeleton {...args} className="h-9 w-[260px]" />,
  parameters: { docs: { description: { story: "A block placeholder. The size always comes from the caller." } } },
};

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-9 w-24" />
        <span className="text-xs text-muted-foreground">block</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton shape="text" className="w-24" />
        <span className="text-xs text-muted-foreground">text</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton shape="circle" className="size-9" />
        <span className="text-xs text-muted-foreground">circle</span>
      </div>
    </div>
  ),
  parameters: { docs: { description: { story: "The three shapes differ only in radius; `text` also carries a line height so a paragraph needs no sizing." } } },
};

export const TextLines: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-6">
      <Skeleton.Text lines={2} />
      <Skeleton.Text lines={4} />
    </div>
  ),
  parameters: { docs: { description: { story: "`Skeleton.Text` shortens the last line, which is what makes a block of grey read as a paragraph." } } },
};

export const ListRows: Story = {
  render: () => (
    <Card className="w-[420px]">
      <Card.Header divided>
        <Card.Heading>
          <Card.Title>Members</Card.Title>
        </Card.Heading>
      </Card.Header>
      <Card.Content className="p-0">
        <Skeleton.Region label="Loading members">
          <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
            {Array.from({ length: 3 }, (_, index) => (
              <li key={index} className="flex items-center gap-3 px-4 py-2.5">
                <Skeleton shape="circle" className="size-6" />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Skeleton shape="text" className="h-3 w-32" />
                  <Skeleton shape="text" className="h-2.5 w-44" />
                </span>
                <Skeleton className="h-4.5 w-14 rounded-full" />
              </li>
            ))}
          </ul>
        </Skeleton.Region>
      </Card.Content>
    </Card>
  ),
  parameters: {
    docs: { description: { story: "The placeholder mirrors the real row down to the badge, so the switch to data changes pixels but not layout." } },
  },
};

export const NoLayoutShift: Story = {
  render: function Render() {
    const [loading, setLoading] = useState(true);
    return (
      <div className="flex w-[420px] flex-col gap-3">
        <Card>
          <Card.Header divided>
            <Card.Heading>
              <Card.Title>Deployment</Card.Title>
            </Card.Heading>
            <Card.Actions>
              {loading ? (
                <Skeleton className="h-5 w-20 rounded-full" />
              ) : (
                <Badge variant="success">
                  <Badge.Dot />
                  Healthy
                </Badge>
              )}
            </Card.Actions>
          </Card.Header>
          <Card.Content className="flex items-center gap-3">
            {loading ? (
              <Skeleton shape="circle" className="size-8" />
            ) : (
              <Avatar size="md">
                <Avatar.Fallback>ŁK</Avatar.Fallback>
              </Avatar>
            )}
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              {loading ? (
                <>
                  <Skeleton shape="text" className="h-3.5 w-40" />
                  <Skeleton shape="text" className="h-3 w-24" />
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">fix: keep sidebar indicator in sync</span>
                  <span className="text-xs text-muted-foreground">12 minutes ago</span>
                </>
              )}
            </span>
          </Card.Content>
        </Card>
        <div className="w-36 self-end">
          <Button variant="outline" onClick={() => setLoading((current) => !current)}>
            {loading ? "Show content" : "Show skeleton"}
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Toggle between the two states and watch the card: nothing moves. That is the whole test for a skeleton — if the layout jumps, the sizes are wrong.",
      },
    },
  },
};

export const CardPlaceholder: Story = {
  render: () => (
    <Skeleton.Region label="Loading dashboard" className="grid w-[620px] grid-cols-2 gap-4">
      {Array.from({ length: 2 }, (_, index) => (
        <Card key={index}>
          <Card.Media>
            <Skeleton className="h-28 rounded-none" />
          </Card.Media>
          <Card.Header>
            <Card.Heading className="w-full gap-2">
              <Skeleton shape="text" className="w-28" />
              <Skeleton shape="text" className="h-3 w-20" />
            </Card.Heading>
          </Card.Header>
        </Card>
      ))}
    </Skeleton.Region>
  ),
  parameters: { docs: { description: { story: "A dashboard grid while it loads. One region wraps the whole grid, so it is announced once rather than per tile." } } },
};

export const ReducedMotion: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-3">
      <Skeleton className="h-9 w-full" />
      <p className="m-0 text-sm text-muted-foreground">
        Enable “reduce motion” in your OS and reload: the sheen stops and the placeholder stays a flat block.
      </p>
    </div>
  ),
  parameters: { docs: { description: { story: "The animation is decorative, so it is dropped entirely under `prefers-reduced-motion` instead of being slowed down." } } },
};
