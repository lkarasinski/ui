import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, FolderKanban, Plus, Settings2 } from "lucide-react";
import { Navbar } from "./navbar";

const meta: Meta<typeof Navbar> = {
  title: "UI/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "A composable application navbar. Assemble Brand, Nav, Search, Actions, and Profile slots to fit the surface instead of configuring a large prop matrix.\n\n`variant` sets the chrome: `default` and `compact` are flush bars with a bottom border, `command` adds a second row, and `inset` floats the bar on its own gutter to match `<Sidebar variant=\"inset\" />`. `showBrand={false}` drops the logo when another surface carries it.",
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

const nav = (
  <Navbar.Nav>
    <Navbar.Item itemKey="overview">Overview</Navbar.Item>
    <Navbar.Item itemKey="activity">Activity</Navbar.Item>
    <Navbar.Item itemKey="people">People</Navbar.Item>
  </Navbar.Nav>
);

export const Default: Story = {
  render: (args) => (
    <Navbar {...args}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
        <Navbar.Brand />
        {nav}
        <Navbar.Actions>
          <Navbar.Search />
          <Navbar.Divider />
          <Navbar.IconButton label="Notifications" icon={Bell} />
          <Navbar.Profile />
        </Navbar.Actions>
      </div>
    </Navbar>
  ),
};

export const CommandCenter: Story = {
  args: { variant: "command", defaultActiveKey: "inbox" },
  render: (args) => (
    <Navbar {...args}>
      <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-5 px-5">
        <Navbar.Brand name="Northstar" eyebrow="Operations" />
        <Navbar.Actions className="mr-auto ml-1 hidden md:flex"><Navbar.IconButton label="Create new" icon={Plus} className="bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground" /></Navbar.Actions>
        <Navbar.Search placeholder="Jump to a project, person, or task" />
        <Navbar.Actions><Navbar.IconButton label="Notifications" icon={Bell} /><Navbar.Profile name="Jon Bell" initials="JB" detail="Admin" /></Navbar.Actions>
      </div>
      <div className="h-10 border-t border-border/70"><div className="mx-auto flex h-full max-w-6xl items-center gap-5 px-5">{<Navbar.Nav><Navbar.Item itemKey="inbox">Inbox</Navbar.Item><Navbar.Item itemKey="projects">Projects</Navbar.Item><Navbar.Item itemKey="reports">Reports</Navbar.Item></Navbar.Nav>}<span className="ml-auto hidden font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground sm:block">Last sync 09:41</span></div></div>
    </Navbar>
  ),
};

export const CompactWorkspace: Story = {
  args: { variant: "compact", defaultActiveKey: "board" },
  render: (args) => (
    <Navbar {...args}>
      <div className="mx-auto flex h-[52px] max-w-6xl items-center gap-4 px-4">
        <Navbar.Brand name="Fieldnotes" eyebrow="Personal" />
        <Navbar.Nav className="max-sm:!hidden"><Navbar.Item itemKey="board">Board</Navbar.Item><Navbar.Item itemKey="calendar">Calendar</Navbar.Item><Navbar.Item itemKey="archive">Archive</Navbar.Item></Navbar.Nav>
        <Navbar.Actions className="min-w-0"><Navbar.Search className="max-w-[140px] sm:max-w-[188px]" placeholder="Filter" /><Navbar.Divider /><Navbar.Profile initials="ŁK" /></Navbar.Actions>
      </div>
    </Navbar>
  ),
};

export const MinimalCenter: Story = {
  args: { defaultActiveKey: "work" },
  render: (args) => (
    <Navbar {...args}>
      <div className="mx-auto flex h-16 max-w-5xl items-center px-5">
        <Navbar.Brand name="Arc" eyebrow="Studio" />
        <Navbar.Nav className="mx-auto hidden sm:flex">
          <Navbar.Item itemKey="work">Work</Navbar.Item>
          <Navbar.Item itemKey="notes">Notes</Navbar.Item>
          <Navbar.Item itemKey="team">Team</Navbar.Item>
        </Navbar.Nav>
        <Navbar.Actions>
          <Navbar.Status>All changes saved</Navbar.Status>
          <Navbar.IconButton label="Settings" icon={Settings2} />
        </Navbar.Actions>
      </div>
    </Navbar>
  ),
};

export const ProjectContext: Story = {
  args: { defaultActiveKey: "overview" },
  render: (args) => (
    <Navbar {...args}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
        <Navbar.Brand name="Northstar" eyebrow="Workspace" />
        <Navbar.Context className="hidden sm:block"><span className="inline-flex items-center gap-1.5"><FolderKanban aria-hidden="true" className="size-3.5" />Website refresh</span></Navbar.Context>
        <Navbar.Nav className="ml-2 hidden md:flex">
          <Navbar.Item itemKey="overview">Overview</Navbar.Item>
          <Navbar.Item itemKey="tasks">Tasks</Navbar.Item>
          <Navbar.Item itemKey="files">Files</Navbar.Item>
        </Navbar.Nav>
        <Navbar.Actions>
          <Navbar.IconButton label="Notifications" icon={Bell} />
          <Navbar.IconButton label="Create new" icon={Plus} className="bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground" />
          <Navbar.Profile name="Jon Bell" initials="JB" detail="Admin" />
        </Navbar.Actions>
      </div>
    </Navbar>
  ),
};

export const Inset: Story = {
  args: { variant: "inset", defaultActiveKey: "projects" },
  parameters: {
    docs: { description: { story: "The inset variant: a floating bar with its own gutter, radius, and elevation, matching `<Sidebar variant=\"inset\" />`. It carries the spacing itself, so the layout around it needs no wrapper padding. A floating bar has no edge to underline, so the active tab takes a filled pill instead of the hairline." } },
  },
  render: (args) => (
    <div className="min-h-screen bg-background">
      <Navbar {...args}>
        <div className="flex h-full items-center gap-4 px-3">
          <Navbar.Brand name="Northstar" eyebrow="Workspace" />
          <Navbar.Nav>
            <Navbar.Item itemKey="projects">Projects</Navbar.Item>
            <Navbar.Item itemKey="activity">Activity</Navbar.Item>
            <Navbar.Item itemKey="people">People</Navbar.Item>
          </Navbar.Nav>
          <Navbar.Actions>
            <Navbar.Search className="max-lg:hidden" />
            <Navbar.IconButton label="Settings" icon={Settings2} />
            <Navbar.Profile />
          </Navbar.Actions>
        </div>
      </Navbar>
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
      <Navbar {...args}>
        <div className="flex h-full items-center gap-4 px-3">
          <Navbar.Brand name="Northstar" eyebrow="Workspace" />
          <Navbar.Nav>
            <Navbar.Item itemKey="projects">Projects</Navbar.Item>
            <Navbar.Item itemKey="activity">Activity</Navbar.Item>
            <Navbar.Item itemKey="people">People</Navbar.Item>
          </Navbar.Nav>
          <Navbar.Actions>
            <Navbar.Search className="max-lg:hidden" />
            <Navbar.IconButton label="Settings" icon={Settings2} />
            <Navbar.Profile />
          </Navbar.Actions>
        </div>
      </Navbar>
    </div>
  ),
};
