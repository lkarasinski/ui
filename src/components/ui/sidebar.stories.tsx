import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDays, FolderKanban, Home, Inbox, Layers3, Plus, Settings2, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "UI/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### Sidebar

Sidebar is a composable navigation rail for workspaces, dashboards, and developer tools. The root owns
active-item and collapsed state; every block below it only renders its own surface.

\`\`\`tsx
<Sidebar defaultActiveKey="home">
  <Sidebar.Toggle />
  <Sidebar.Header>
    <Sidebar.Workspace name="Northstar" detail="Workspace" />
  </Sidebar.Header>
  <Sidebar.Nav>
    <Sidebar.Section>
      <Sidebar.SectionLabel>Workspace</Sidebar.SectionLabel>
      <Sidebar.Item itemKey="home" icon={Home}>Home</Sidebar.Item>
      <Sidebar.Item itemKey="inbox" icon={Inbox} end={<Sidebar.Badge>8</Sidebar.Badge>}>Inbox</Sidebar.Item>
    </Sidebar.Section>
  </Sidebar.Nav>
  <Sidebar.Footer>
    <Sidebar.Item itemKey="settings" icon={Settings2}>Settings</Sidebar.Item>
  </Sidebar.Footer>
</Sidebar>
\`\`\`

Every block is also a named export (\`SidebarHeader\`, \`SidebarWorkspace\`, \`SidebarNav\`, \`SidebarSection\`,
\`SidebarSectionLabel\`, \`SidebarItem\`, \`SidebarBadge\`, \`SidebarDivider\`, \`SidebarFooter\`, \`SidebarToggle\`)
for consumers that prefer direct imports.

#### Variants

\`variant\` changes how the rail sits in the page; the blocks, state, and collapsed behavior are identical.

- \`default\` — a flush rail separated from the content by a right border.
- \`inset\` — a floating panel with its own gutter, radius, and elevation. It carries the spacing itself, so
  the layout around it needs no wrapper padding.

Both variants stretch to the height of their flex parent. Pass a height class when the sidebar is used
outside a flex container, as \`MobileDrawer\` does with \`h-[620px]\`. Reach for a class name on the block you
want to change before adding a variant; a variant is for the rail chrome changing as a whole.

#### State

\`activeKey\` and \`collapsed\` each work controlled or uncontrolled:

\`\`\`tsx
<Sidebar defaultActiveKey="home" defaultCollapsed={false} />

<Sidebar
  activeKey={activeKey}
  collapsed={sidebarCollapsed}
  onActiveKeyChange={setActiveKey}
  onCollapsedChange={setSidebarCollapsed}
/>
\`\`\`

Collapsed mode narrows the rail from 240px to 60px, keeps icon targets available, and visually hides labels
without removing them from the accessibility tree. Nothing moves sideways on the way. Every mark and icon
centres on the same column 30px from the rail's left edge — the header pads 4px tighter than the nav so the
32px workspace mark lands on it too — and 60px is twice that, so the column that is left-aligned at full
width is the centred one when collapsed, without anything sliding to get there. Group headings give up their
height over the same 200ms and the same curve, so the icons below them ride up with the contraction instead of
snapping into place ahead of it. \`Sidebar.Toggle\` sits on
the rail's outer edge instead of inside a slot, so it stays reachable at both widths without spending a row —
at 60px there is none to spare.

#### Layout

The sidebar is a flex child that stretches to the height of its row. Give it a parent with a definite height
and put the content beside it:

\`\`\`tsx
<div className="flex h-screen">
  <Sidebar />
  <main className="min-w-0 flex-1">{children}</main>
</div>
\`\`\`
`,
      },
    },
  },
  argTypes: {
    variant: {
      description: "Flush rail (`default`) or floating panel with its own gutter and elevation (`inset`).",
      control: "select",
      options: ["default", "inset"],
      table: { category: "Appearance", defaultValue: { summary: "default" } },
    },
    activeKey: {
      description: "Key of the active item. Pass it to control the selection; omit it to let the sidebar own it.",
      control: "text",
      table: { category: "Navigation" },
    },
    defaultActiveKey: {
      description: "Initial active item key for uncontrolled use.",
      control: "text",
      table: { category: "Navigation", defaultValue: { summary: "home" } },
    },
    onActiveKeyChange: {
      description: "Called with the key of the item that was activated.",
      control: false,
      table: { category: "Events" },
    },
    collapsed: {
      description: "Collapsed state. Pass it to control the rail; pair it with `onCollapsedChange` or the toggle does nothing.",
      control: "boolean",
      table: { category: "Collapse" },
    },
    defaultCollapsed: {
      description: "Initial collapsed state for uncontrolled use.",
      control: "boolean",
      table: { category: "Collapse", defaultValue: { summary: "false" } },
    },
    onCollapsedChange: {
      description: "Called with the next collapsed state when `Sidebar.Toggle` is pressed.",
      control: false,
      table: { category: "Events" },
    },
    className: {
      description: "Additional Tailwind classes merged with the sidebar styles, e.g. a width or height for standalone use.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

function Navigation() {
  return (
    <>
      <Sidebar.Section>
        <Sidebar.SectionLabel>Workspace</Sidebar.SectionLabel>
        <Sidebar.Item itemKey="home" icon={Home}>Home</Sidebar.Item>
        <Sidebar.Item itemKey="inbox" icon={Inbox} end={<Sidebar.Badge>8</Sidebar.Badge>}>Inbox</Sidebar.Item>
        <Sidebar.Item itemKey="calendar" icon={CalendarDays}>Calendar</Sidebar.Item>
      </Sidebar.Section>
      <Sidebar.Section>
        <Sidebar.SectionLabel>Manage</Sidebar.SectionLabel>
        <Sidebar.Item itemKey="projects" icon={FolderKanban}>Projects</Sidebar.Item>
        <Sidebar.Item itemKey="people" icon={Users}>People</Sidebar.Item>
      </Sidebar.Section>
    </>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return <div className="flex h-screen bg-background text-foreground">{children}</div>;
}

function Content({ children }: { children: ReactNode }) {
  return <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>;
}

export const WorkspaceNavigation: Story = {
  args: { defaultActiveKey: "home" },
  parameters: {
    docs: { description: { story: "The default rail beside a content column. It is hidden below `md`; use the `MobileDrawer` composition on small screens." } },
  },
  render: (args) => (
    <Layout>
      <Sidebar {...args} className="hidden md:flex">
        <Sidebar.Toggle />
        <Sidebar.Header><Sidebar.Workspace /></Sidebar.Header>
        <Sidebar.Nav><Navigation /></Sidebar.Nav>
      </Sidebar>
      <Content>
        <div className="mx-auto max-w-4xl p-6 md:p-10"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">Workspace overview</p><h1 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-foreground">Good morning, Marta</h1><p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">A quiet place for projects, conversations, and the work that needs your attention.</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="h-28 rounded-lg border border-border bg-card" /><div className="h-28 rounded-lg border border-border bg-card" /><div className="h-28 rounded-lg border border-border bg-card" /></div></div>
      </Content>
    </Layout>
  ),
};

export const Collapsed: Story = {
  args: { defaultActiveKey: "projects", defaultCollapsed: true },
  parameters: {
    docs: { description: { story: "The rail starting collapsed. Labels are visually hidden but still exposed to assistive tech, and the edge handle expands it again." } },
  },
  render: (args) => (
    <Layout>
      <Sidebar {...args} className="hidden md:flex">
        <Sidebar.Toggle />
        <Sidebar.Header><Sidebar.Workspace /></Sidebar.Header>
        <Sidebar.Nav><Navigation /></Sidebar.Nav>
      </Sidebar>
      <Content><div className="p-10 text-sm text-muted-foreground">The content keeps its layout while the navigation contracts to icon-only targets.</div></Content>
    </Layout>
  ),
};

export const InsetWithGroups: Story = {
  args: { defaultActiveKey: "projects", variant: "inset" },
  parameters: {
    docs: { description: { story: "The inset variant in the same layout. It brings its own gutter and elevation, so nothing around it needs padding." } },
  },
  render: (args) => (
    <Layout>
      <Sidebar {...args}>
        <Sidebar.Toggle />
        <Sidebar.Header><Sidebar.Workspace /></Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Section><Sidebar.SectionLabel>Personal</Sidebar.SectionLabel><Sidebar.Item itemKey="projects" icon={Layers3}>My projects</Sidebar.Item><Sidebar.Item itemKey="calendar" icon={CalendarDays}>Calendar</Sidebar.Item></Sidebar.Section>
          <Sidebar.Divider />
          <Sidebar.Section><Sidebar.SectionLabel>Teams</Sidebar.SectionLabel><Sidebar.Item itemKey="design" icon={FolderKanban} end={<Sidebar.Badge>4</Sidebar.Badge>}>Design system</Sidebar.Item><Sidebar.Item itemKey="people" icon={Users}>Team members</Sidebar.Item></Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer><Sidebar.Item itemKey="settings" icon={Settings2}>Settings</Sidebar.Item></Sidebar.Footer>
      </Sidebar>
      <Content><div className="p-6 text-sm text-muted-foreground md:p-10">The inset rail brings its own gutter and elevation, so the layout around it needs no wrapper padding.</div></Content>
    </Layout>
  ),
};

export const MobileDrawer: Story = {
  args: { defaultActiveKey: "inbox" },
  parameters: {
    docs: { description: { story: "A standalone panel for a drawer surface. Outside a flex row the sidebar needs its own width and height, and the footer slot takes a primary action instead of navigation." } },
  },
  render: (args) => (
    <div className="flex min-h-screen items-start justify-center bg-background p-4 sm:p-8">
      <Sidebar {...args} className="h-[620px] w-full max-w-[320px]">
        <Sidebar.Toggle />
        <Sidebar.Header><Sidebar.Workspace /></Sidebar.Header>
        <Sidebar.Nav><Navigation /></Sidebar.Nav>
        <Sidebar.Footer><Sidebar.Item itemKey="new" icon={Plus} className="bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground">New project</Sidebar.Item></Sidebar.Footer>
      </Sidebar>
    </div>
  ),
};
