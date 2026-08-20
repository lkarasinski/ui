import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, FolderKanban, Plus, Settings2 } from "lucide-react";
import { useState } from "react";
import { Navbar } from "./navbar";

const meta: Meta<typeof Navbar> = {
  title: "UI/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### Navbar

Navbar is a composable application header for workspaces, dashboards, and developer tools. The root owns
active navigation state; the attached building blocks only render their own surface.

\`\`\`tsx
import { Bell } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

<Navbar defaultActiveKey="overview">
  <Navbar.Row width="wide">
    <Navbar.Brand name="Northstar" />
    <Navbar.Nav>
      <Navbar.Item itemKey="overview">Overview</Navbar.Item>
      <Navbar.Item itemKey="activity">Activity</Navbar.Item>
    </Navbar.Nav>
    <Navbar.Actions>
      <Navbar.IconButton label="Notifications" icon={Bell} />
      <Navbar.Profile />
    </Navbar.Actions>
  </Navbar.Row>
</Navbar>
\`\`\`

Every block is also available as a named export: \`NavbarRow\`, \`NavbarSubrow\`, \`NavbarBrand\`, \`NavbarNav\`,
\`NavbarItem\`, \`NavbarSearch\`, \`NavbarActions\`, \`NavbarIconButton\`, \`NavbarMenuTrigger\`,
\`NavbarMenu\`, \`NavbarMenuFooter\`, \`NavbarProfile\`, \`NavbarDivider\`, \`NavbarContext\`, and \`NavbarStatus\`.

#### Variants

\`variant\` changes the navbar chrome while the blocks and state stay the same:

- \`default\` — a flush bar with a bottom border.
- \`command\` — a two-row bar with a search line and a tab row.
- \`compact\` — a shorter, denser flush bar.
- \`inset\` — a floating bar with its own gutter, radius, and elevation, matching \`<Sidebar variant="inset" />\`.

Use slots and class names to compose a new arrangement. Reach for a variant only when the navbar chrome,
height, and responsive sizing need to change together. \`showBrand={false}\` removes the logo when another
surface carries it.

#### Responsive behavior

The navbar height steps down below \`sm\`, and \`Navbar.Row\` fills the remaining space without clipping its
contents. The default bar is exactly 64px at \`sm\` and above, including its border. A bar \`Navbar.Nav\`
scrolls sideways instead of pushing its neighbours off the edge. Below \`md\`, move destinations into
\`Navbar.Menu\`, opened by \`Navbar.MenuTrigger\`; the menu traps focus, closes on Escape or outside click,
and shares the navbar's active key.

#### Active state

Each \`Navbar.Item\` needs a unique \`itemKey\`. The active item exposes \`aria-current="page"\` and a
reduced-motion-safe animated indicator. Active navigation can be controlled or uncontrolled:

\`\`\`tsx
<Navbar activeKey={activeKey} onActiveKeyChange={setActiveKey}>
  {/* ... */}
</Navbar>
\`\`\`

See the stories below for working compositions, mobile behavior, menu state, and each navbar variant.
`,
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["default", "command", "compact", "inset"] },
    activeKey: { control: "text" },
    showBrand: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

// Declared once and rendered in both the bar and the drawer — each Nav decides how its items look.
const workspaceItems = (
  <>
    <Navbar.Item itemKey="overview">Overview</Navbar.Item>
    <Navbar.Item itemKey="activity">Activity</Navbar.Item>
    <Navbar.Item itemKey="people">People</Navbar.Item>
  </>
);

export const Default: Story = {
  render: (args) => (
    <Navbar {...args}>
      <Navbar.Row width="wide" className="sm:gap-6 lg:gap-8">
        <Navbar.MenuTrigger />
        <Navbar.Brand />
        <Navbar.Nav className="hidden md:flex">{workspaceItems}</Navbar.Nav>
        <Navbar.Actions>
          <Navbar.Search className="hidden md:flex" />
          <Navbar.Divider />
          <Navbar.IconButton label="Notifications" icon={Bell} />
          <Navbar.Profile />
        </Navbar.Actions>
      </Navbar.Row>
      <Navbar.Menu title="Fieldnotes">
        <Navbar.Search className="max-w-none" />
        <Navbar.Nav presentation="menu">{workspaceItems}</Navbar.Nav>
      </Navbar.Menu>
    </Navbar>
  ),
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2" } },
  parameters: {
    docs: {
      description: {
        story: "The same composition at phone width. The row is 8px shorter, the search and the tabs have left the bar, and `Navbar.MenuTrigger` opens the drawer that holds them. Nothing about the markup changed — only which slots the breakpoint classes let through.",
      },
    },
  },
  render: Default.render,
};

export const MobileMenuOpen: Story = {
  globals: { viewport: { value: "mobile2" } },
  parameters: {
    docs: {
      description: {
        story: "The drawer open. It is a modal dialog: focus is trapped inside it, Escape and a tap on the scrim close it, and the page behind it holds still. Rows are 44px tall and marked with the same left rail the sidebar uses; picking one closes the drawer.",
      },
    },
  },
  render: function MobileMenuOpenStory(args) {
    const [menuOpen, setMenuOpen] = useState(true);
    return (
      <Navbar {...args} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen}>
        <Navbar.Row width="wide">
          <Navbar.MenuTrigger />
          <Navbar.Brand />
          <Navbar.Actions>
            <Navbar.IconButton label="Notifications" icon={Bell} />
            <Navbar.Profile />
          </Navbar.Actions>
        </Navbar.Row>
        <Navbar.Menu title="Fieldnotes">
          <Navbar.Search className="max-w-none" />
          <Navbar.Nav presentation="menu">{workspaceItems}</Navbar.Nav>
          <Navbar.MenuFooter>
            <Navbar.Profile className="w-full" />
          </Navbar.MenuFooter>
        </Navbar.Menu>
      </Navbar>
    );
  },
};

export const Controlled: Story = {
  args: { activeKey: "overview" },
  parameters: {
    docs: {
      description: {
        story: "The active destination is owned by the consumer. Clicking an item updates the local state and demonstrates the controlled `activeKey` and `onActiveKeyChange` contract.",
      },
    },
  },
  render: function ControlledStory(args) {
    const [activeKey, setActiveKey] = useState("overview");
    return (
      <Navbar {...args} activeKey={activeKey} onActiveKeyChange={setActiveKey}>
        <Navbar.Row width="wide">
          <Navbar.Brand />
          <Navbar.Nav>
            <Navbar.Item itemKey="overview">Overview</Navbar.Item>
            <Navbar.Item itemKey="activity">Activity</Navbar.Item>
            <Navbar.Item itemKey="people">People</Navbar.Item>
          </Navbar.Nav>
          <Navbar.Status className="ml-auto">Selected: {activeKey}</Navbar.Status>
        </Navbar.Row>
      </Navbar>
    );
  },
};

const commandItems = (
  <>
    <Navbar.Item itemKey="inbox">Inbox</Navbar.Item>
    <Navbar.Item itemKey="projects">Projects</Navbar.Item>
    <Navbar.Item itemKey="reports">Reports</Navbar.Item>
  </>
);

export const CommandCenter: Story = {
  args: { variant: "command", defaultActiveKey: "inbox" },
  parameters: {
    docs: {
      description: {
        story: "Two bands: search on top, tabs below. The tab row stays in the bar on a phone rather than moving into the drawer — three destinations fit, and the row scrolls sideways if more are added. The drawer still carries the actions that left the top band.",
      },
    },
  },
  render: (args) => (
    <Navbar {...args}>
      <Navbar.Row width="wide" className="sm:gap-5">
        <Navbar.MenuTrigger />
        <Navbar.Brand name="Northstar" className="max-sm:hidden" />
        <Navbar.Actions className="mr-auto ml-1 hidden md:flex">
          <Navbar.IconButton label="Create new" icon={Plus} className="bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground" />
        </Navbar.Actions>
        <Navbar.Search placeholder="Jump to a project, person, or task" />
        <Navbar.Actions>
          <Navbar.IconButton label="Notifications" icon={Bell} className="max-sm:hidden" />
          <Navbar.Profile name="Jon Bell" initials="JB" detail="Admin" />
        </Navbar.Actions>
      </Navbar.Row>
      <Navbar.Subrow width="wide">
        <Navbar.Nav>{commandItems}</Navbar.Nav>
        <span className="ml-auto hidden shrink-0 text-[9px] uppercase tracking-[0.15em] text-muted-foreground sm:block">Last sync 09:41</span>
      </Navbar.Subrow>
      <Navbar.Menu title="Northstar">
        <Navbar.Nav presentation="menu">{commandItems}</Navbar.Nav>
        <Navbar.MenuFooter>
          <Navbar.Profile name="Jon Bell" initials="JB" detail="Admin" className="w-full" />
        </Navbar.MenuFooter>
      </Navbar.Menu>
    </Navbar>
  ),
};

export const CommandCenterMobile: Story = {
  ...CommandCenter,
  globals: { viewport: { value: "mobile1" } },
  parameters: {
    docs: {
      description: {
        story: "The command centre at 320px, the narrowest width the app supports. The brand mark and the notification bell step aside so the search keeps a usable width, and the tab row below holds its full set.",
      },
    },
  },
};

const compactItems = (
  <>
    <Navbar.Item itemKey="board">Board</Navbar.Item>
    <Navbar.Item itemKey="calendar">Calendar</Navbar.Item>
    <Navbar.Item itemKey="archive">Archive</Navbar.Item>
  </>
);

export const CompactWorkspace: Story = {
  args: { variant: "compact", defaultActiveKey: "board" },
  render: (args) => (
    <Navbar {...args}>
      <Navbar.Row width="wide">
        <Navbar.MenuTrigger className="-ml-1 size-9" />
        <Navbar.Brand name="Fieldnotes" />
        <Navbar.Nav className="hidden md:flex">{compactItems}</Navbar.Nav>
        <Navbar.Actions>
          <Navbar.Search className="max-w-[130px] sm:max-w-[188px]" placeholder="Filter" />
          <Navbar.Divider />
          <Navbar.Profile initials="ŁK" />
        </Navbar.Actions>
      </Navbar.Row>
      <Navbar.Menu title="Fieldnotes">
        <Navbar.Nav presentation="menu">{compactItems}</Navbar.Nav>
      </Navbar.Menu>
    </Navbar>
  ),
};

const studioItems = (
  <>
    <Navbar.Item itemKey="work">Work</Navbar.Item>
    <Navbar.Item itemKey="notes">Notes</Navbar.Item>
    <Navbar.Item itemKey="team">Team</Navbar.Item>
  </>
);

export const MinimalCenter: Story = {
  args: { defaultActiveKey: "work" },
  render: (args) => (
    <Navbar {...args}>
      <Navbar.Row width="narrow">
        <Navbar.MenuTrigger />
        <Navbar.Brand name="Arc" />
        <Navbar.Nav className="mx-auto hidden md:flex">{studioItems}</Navbar.Nav>
        <Navbar.Actions>
          <Navbar.Status className="max-sm:hidden">All changes saved</Navbar.Status>
          <Navbar.IconButton label="Settings" icon={Settings2} />
        </Navbar.Actions>
      </Navbar.Row>
      <Navbar.Menu title="Arc">
        <Navbar.Nav presentation="menu">{studioItems}</Navbar.Nav>
        <Navbar.MenuFooter>
          <Navbar.Status>All changes saved</Navbar.Status>
        </Navbar.MenuFooter>
      </Navbar.Menu>
    </Navbar>
  ),
};

const projectItems = (
  <>
    <Navbar.Item itemKey="overview">Overview</Navbar.Item>
    <Navbar.Item itemKey="tasks">Tasks</Navbar.Item>
    <Navbar.Item itemKey="files">Files</Navbar.Item>
  </>
);

export const ProjectContext: Story = {
  args: { defaultActiveKey: "overview" },
  render: (args) => (
    <Navbar {...args}>
      <Navbar.Row width="wide">
        <Navbar.MenuTrigger />
        <Navbar.Brand name="Northstar" />
        <Navbar.Context className="hidden sm:block"><span className="inline-flex items-center gap-1.5"><FolderKanban aria-hidden="true" className="size-3.5" />Website refresh</span></Navbar.Context>
        <Navbar.Nav className="ml-2 hidden md:flex">{projectItems}</Navbar.Nav>
        <Navbar.Actions>
          <Navbar.IconButton label="Notifications" icon={Bell} className="max-sm:hidden" />
          <Navbar.IconButton label="Create new" icon={Plus} className="bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground" />
          <Navbar.Profile name="Jon Bell" initials="JB" detail="Admin" />
        </Navbar.Actions>
      </Navbar.Row>
      <Navbar.Menu title="Website refresh">
        <Navbar.Nav presentation="menu">{projectItems}</Navbar.Nav>
        <Navbar.MenuFooter>
          <Navbar.IconButton label="Notifications" icon={Bell} />
        </Navbar.MenuFooter>
      </Navbar.Menu>
    </Navbar>
  ),
};

const insetItems = (
  <>
    <Navbar.Item itemKey="projects">Projects</Navbar.Item>
    <Navbar.Item itemKey="activity">Activity</Navbar.Item>
    <Navbar.Item itemKey="people">People</Navbar.Item>
  </>
);

function InsetNavbar(args: Parameters<NonNullable<Story["render"]>>[0]) {
  return (
    <Navbar {...args}>
      <Navbar.Row>
        <Navbar.MenuTrigger className="-ml-0.5" />
        <Navbar.Brand name="Northstar" />
        <Navbar.Nav className="hidden md:flex">{insetItems}</Navbar.Nav>
        <Navbar.Actions>
          <Navbar.Search className="max-lg:hidden" />
          <Navbar.IconButton label="Settings" icon={Settings2} />
          <Navbar.Profile />
        </Navbar.Actions>
      </Navbar.Row>
      <Navbar.Menu title="Northstar">
        <Navbar.Search className="max-w-none" />
        <Navbar.Nav presentation="menu">{insetItems}</Navbar.Nav>
      </Navbar.Menu>
    </Navbar>
  );
}

export const Inset: Story = {
  args: { variant: "inset", defaultActiveKey: "projects" },
  parameters: {
    docs: { description: { story: "The inset variant: a floating bar with its own gutter, radius, and elevation, matching `<Sidebar variant=\"inset\" />`. It carries the spacing itself, so the layout around it needs no wrapper padding — and the gutter narrows to 6px below `sm`, where the screen has none to spare. A floating bar has no edge to underline, so the active tab takes a filled pill instead of the hairline." } },
  },
  render: (args) => (
    <div className="min-h-screen bg-background">
      <InsetNavbar {...args} />
      <div className="px-2 py-4 text-sm text-muted-foreground md:px-4 md:py-8">The floating bar brings its own gutter and elevation, so the page beneath it needs no wrapper padding.</div>
    </div>
  ),
};

export const InsetWithoutBrand: Story = {
  args: { variant: "inset", defaultActiveKey: "projects", showBrand: false },
  parameters: {
    docs: { description: { story: "`showBrand={false}` drops the logo from the navbar without changing the composition, for shells where an inset sidebar already carries it. `Sidebar` takes the same prop, so one value in your code decides which surface shows the logo." } },
  },
  render: (args) => (
    <div className="min-h-screen bg-background">
      <InsetNavbar {...args} />
    </div>
  ),
};
