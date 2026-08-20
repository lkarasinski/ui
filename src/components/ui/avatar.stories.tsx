import type { Meta, StoryObj } from "@storybook/react-vite";
import { Building2, Plus, User } from "lucide-react";
import { Avatar } from "./avatar";
import { Badge } from "./badge";
import { Card } from "./card";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Avatar

Avatar shows a user or entity picture with a text fallback.

The image and the fallback share one grid cell. The fallback is painted first, so it is already there
while the image loads and stays if the image fails — no spinner, no layout shift, no flash of an empty
circle:

\`\`\`tsx
<Avatar size="md">
  <Avatar.Fallback>ŁK</Avatar.Fallback>
  <Avatar.Image src={user.avatarUrl} alt="" />
  <Avatar.Status tone="online" label="Online" />
</Avatar>
\`\`\`

Keep \`alt\` empty when the name is already next to the avatar; otherwise a screen reader reads it
twice. \`Avatar.Status\` takes a \`label\` because a colored dot means nothing without it.
`,
      },
    },
  },
  argTypes: {
    size: {
      description: "`xs` and `sm` for table rows and comment lists, `md` for headers, `lg` for profile blocks.",
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg"],
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    shape: {
      description: "`circle` for people, `square` for organizations, repositories, and services.",
      control: "inline-radio",
      options: ["circle", "square"],
      table: { category: "Appearance", defaultValue: { summary: "circle" } },
    },
    children: {
      description: "Compose `Avatar.Fallback`, `Avatar.Image`, and `Avatar.Status`. Put the fallback first so it renders underneath.",
      control: false,
      table: { category: "Content" },
    },
    className: {
      description: "Additional Tailwind classes merged with the avatar styles.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

const portrait = "https://i.pravatar.cc/160?img=12";

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <Avatar.Fallback>ŁK</Avatar.Fallback>
      <Avatar.Image src={portrait} alt="" />
    </Avatar>
  ),
  parameters: { docs: { description: { story: "Image with initials underneath. The initials are what you see if the network is slow or the URL is dead." } } },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Avatar size={size}>
            <Avatar.Fallback>ŁK</Avatar.Fallback>
            <Avatar.Image src={portrait} alt="" />
          </Avatar>
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "Four sizes. The fallback text and the status dot scale with the avatar, so nothing needs a second prop." } } },
};

export const Fallbacks: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <Avatar.Fallback>ŁK</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback>
          <User />
        </Avatar.Fallback>
      </Avatar>
      <Avatar shape="square">
        <Avatar.Fallback>
          <Building2 />
        </Avatar.Fallback>
      </Avatar>
      <Avatar className="bg-primary/12 text-primary">
        <Avatar.Fallback>MK</Avatar.Fallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: { description: { story: "Initials, an icon, or a tinted surface. Tinting is a `className` decision rather than a variant, since the tone usually comes from the data." } },
  },
};

export const BrokenImage: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <Avatar.Fallback>ŁK</Avatar.Fallback>
        <Avatar.Image src="https://example.invalid/missing.png" alt="" />
      </Avatar>
      <span className="text-sm text-muted-foreground">The image 404s; the fallback was already underneath.</span>
    </div>
  ),
  parameters: { docs: { description: { story: "A failed image unmounts itself and uncovers the fallback. There is no error state to design because nothing ever goes blank." } } },
};

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar shape="circle">
        <Avatar.Fallback>ŁK</Avatar.Fallback>
        <Avatar.Image src={portrait} alt="" />
      </Avatar>
      <Avatar shape="square">
        <Avatar.Fallback>NS</Avatar.Fallback>
      </Avatar>
      <Avatar shape="square" size="lg">
        <Avatar.Fallback>
          <Building2 />
        </Avatar.Fallback>
      </Avatar>
    </div>
  ),
  parameters: { docs: { description: { story: "Circles read as people, squares as things. Keeping them visually different saves a label in dense lists." } } },
};

export const WithStatus: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(["online", "busy", "away", "offline"] as const).map((tone) => (
        <div key={tone} className="flex flex-col items-center gap-2">
          <Avatar>
            <Avatar.Fallback>ŁK</Avatar.Fallback>
            <Avatar.Image src={portrait} alt="" />
            <Avatar.Status tone={tone} label={tone} />
          </Avatar>
          <span className="text-xs text-muted-foreground capitalize">{tone}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "The dot carries no meaning on its own, so `label` is required and exposed as an image role to screen readers." } } },
};

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Avatar.Group>
        {["ŁK", "MK", "AN"].map((initials) => (
          <Avatar key={initials}>
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar>
        ))}
      </Avatar.Group>
      <Avatar.Group size="sm">
        {["ŁK", "MK", "AN", "PB"].map((initials) => (
          <Avatar key={initials} size="sm">
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar>
        ))}
        <Avatar size="sm" className="bg-card text-muted-foreground">
          <Avatar.Fallback>+7</Avatar.Fallback>
        </Avatar>
      </Avatar.Group>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "The group only sets the overlap and the ring. The overflow count is an ordinary avatar in the last slot, which is why it needs no `max` prop.",
      },
    },
  },
};

export const GroupWithAction: Story = {
  render: () => (
    <Avatar.Group size="sm">
      {["ŁK", "MK", "AN"].map((initials) => (
        <Avatar key={initials} size="sm">
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar>
      ))}
      <button
        type="button"
        aria-label="Invite teammate"
        className="grid size-6 place-items-center rounded-full border border-dashed border-input bg-card text-muted-foreground ring-2 ring-card outline-none transition-colors hover:border-ring hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25"
      >
        <Plus className="size-3" />
      </button>
    </Avatar.Group>
  ),
  parameters: { docs: { description: { story: "The last slot can be a real button. Because the group makes no assumptions about its children, no prop is needed for this." } } },
};

export const InRow: Story = {
  render: () => (
    <Card className="w-[420px]">
      <Card.Header divided>
        <Card.Heading>
          <Card.Title>Members</Card.Title>
        </Card.Heading>
        <Card.Actions>
          <Avatar.Group size="xs">
            {["ŁK", "MK", "AN"].map((initials) => (
              <Avatar key={initials} size="xs">
                <Avatar.Fallback>{initials}</Avatar.Fallback>
              </Avatar>
            ))}
          </Avatar.Group>
        </Card.Actions>
      </Card.Header>
      <Card.Content className="p-0">
        <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
          {[
            { name: "Łukasz Karasiński", email: "lk@northstar.dev", role: "Owner", tone: "online" as const },
            { name: "Maja Kowalska", email: "maja@northstar.dev", role: "Admin", tone: "busy" as const },
            { name: "Adam Nowak", email: "adam@northstar.dev", role: "Member", tone: "offline" as const },
          ].map((member) => (
            <li key={member.email} className="flex items-center gap-3 px-4 py-2.5">
              <Avatar size="sm">
                <Avatar.Fallback>
                  {member.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </Avatar.Fallback>
                <Avatar.Status tone={member.tone} label={member.tone} />
              </Avatar>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{member.name}</span>
                <span className="truncate text-xs text-muted-foreground">{member.email}</span>
              </span>
              <Badge size="sm" variant="muted">
                {member.role}
              </Badge>
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card>
  ),
  parameters: { docs: { description: { story: "A member list at real density. `alt` stays empty because the name is right there — otherwise it would be announced twice." } } },
};
