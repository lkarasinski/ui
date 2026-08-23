import type { Meta, StoryObj } from "@storybook/react-vite";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

const meta: Meta<typeof HoverCard> = {
  title: "UI/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### HoverCard

A compact card that opens on hover or keyboard focus, for detail that would
crowd the surface it belongs to — a status indicator, an id, an avatar.

The trigger renders \`asChild\`, so it keeps whatever element you pass and adds
no wrapper to the layout. Content goes through a portal, so a scroll container
or a navbar with \`overflow-hidden\` cannot clip it.

\`\`\`tsx
<HoverCard>
  <HoverCardTrigger>
    <button type="button">api</button>
  </HoverCardTrigger>
  <HoverCardContent>
    <p className="font-semibold text-foreground">api: healthy</p>
  </HoverCardContent>
</HoverCard>
\`\`\`
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const Trigger = ({ children }: { children: string }) => (
  <button
    type="button"
    className="rounded-md border border-border bg-card px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
  >
    {children}
  </button>
);

export const Default: Story = {
  render: () => (
    <div className="p-16">
      <HoverCard>
        <HoverCardTrigger>
          <Trigger>hover me</Trigger>
        </HoverCardTrigger>
        <HoverCardContent>
          <p className="font-semibold text-foreground">deploy #4821</p>
          <p className="mt-0.5 text-muted-foreground">Finished 4 minutes ago in 1m 12s.</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

export const Open: Story = {
  render: () => (
    <div className="p-16">
      <HoverCard open>
        <HoverCardTrigger>
          <Trigger>always open</Trigger>
        </HoverCardTrigger>
        <HoverCardContent>
          <p className="font-semibold text-foreground">api: unreachable</p>
          <p className="mt-0.5 text-muted-foreground">connection refused</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

export const Placement: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-16">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <HoverCard key={side}>
          <HoverCardTrigger>
            <Trigger>{side}</Trigger>
          </HoverCardTrigger>
          <HoverCardContent side={side} className="w-48">
            <p className="font-semibold text-foreground">side="{side}"</p>
            <p className="mt-0.5 text-muted-foreground">Flips to the opposite side when it would run off-screen.</p>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  ),
};

export const InsideOverflow: Story = {
  parameters: {
    docs: {
      description: {
        story: "The card portals out of a clipping scroll container instead of being cut off by it.",
      },
    },
  },
  render: () => (
    <div className="h-40 w-80 overflow-auto rounded-md border border-border p-3">
      <div className="flex h-64 items-center justify-center">
        <HoverCard>
          <HoverCardTrigger>
            <Trigger>inside a scroller</Trigger>
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="font-semibold text-foreground">Not clipped</p>
            <p className="mt-0.5 text-muted-foreground">Rendered into the body through a portal.</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  ),
};
