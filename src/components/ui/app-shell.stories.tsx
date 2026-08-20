import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, CalendarDays, FolderKanban, Home, Inbox, Settings2, Users } from "lucide-react";
import { AppShell } from "./app-shell";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

const meta: Meta<typeof AppShell> = {
  title: "UI/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### AppShell

AppShell is the page frame that puts a [Navbar](/docs/ui-navbar--docs), a [Sidebar](/docs/ui-sidebar--docs), and the
content area in the same layout. It arranges surfaces and owns nothing else: the navbar and sidebar keep their own
chrome, variants, and state.

\`\`\`tsx
<AppShell>
  <AppShell.Header><Navbar>{/* ... */}</Navbar></AppShell.Header>
  <AppShell.Body>
    <AppShell.Sidebar><Sidebar className="hidden md:flex">{/* ... */}</Sidebar></AppShell.Sidebar>
    <AppShell.Main>
      <AppShell.Content>{children}</AppShell.Content>
    </AppShell.Main>
  </AppShell.Body>
</AppShell>
\`\`\`

#### Anatomy

- \`AppShell.Header\` — full-width slot above the body. It paints nothing itself and renders a \`div\`, so the navbar
  stays the only \`header\` landmark on the page.
- \`AppShell.Body\` — the row holding the sidebar, the content column, and an optional detail panel.
- \`AppShell.Sidebar\` — the slot for the rail. It only earns its keep in a \`page\` shell, where it holds the rail in
  view, but using it everywhere keeps the anatomy the same across shells.
- \`AppShell.Column\` — a vertical stack inside the body, for arrangements where the sidebar runs the full height.
- \`AppShell.Main\` — the main content surface, and the scroll container in an \`app\` shell.
- \`AppShell.Content\` — a centered, padded measure inside \`Main\`, with \`width\` of \`full\`, \`wide\`, or \`narrow\`.
- \`AppShell.Aside\` — a detail or inspector panel beside the content. It takes a \`label\` and is hidden below \`lg\`.
- \`AppShell.Footer\` — a status bar across the bottom.

Every block is also a named export (\`AppShellHeader\`, \`AppShellBody\`, \`AppShellSidebar\`, \`AppShellColumn\`,
\`AppShellMain\`, \`AppShellContent\`, \`AppShellAside\`, \`AppShellFooter\`) for consumers that prefer direct imports.

#### Arrangements

The arrangement is composition, not a prop. Put the header above \`AppShell.Body\` for a full-width header
(\`Dashboard\`), or inside an \`AppShell.Column\` next to a full-height sidebar (\`DockedSidebar\`).

#### Variants

\`variant\` sets the chrome of the content surfaces:

- \`flush\` — main sits on the canvas edge to edge, and the aside and footer separate themselves with a border.
- \`inset\` — main, aside, and footer become floating panels with their own gutter and elevation.

Each inset surface carries its own 8px gutter, so panels sit 8px from the frame. Pair the inset shell with
\`<Sidebar variant="inset" />\` and the two rails sit 16px apart; pair it with the default rail and the border
does the separating, at 8px. Both read as deliberate — pick one and keep it. \`<Navbar variant="inset" />\` floats
the bar on the same gutter (\`InsetSurfaces\`).

#### Logo placement

A navbar and a rail both want to show the logo, which puts it on screen twice. \`showBrand\` on each of them
settles it: the surface that starts at the top-left of the frame keeps the logo and the other one drops it.
With a full-width navbar above the body that is the navbar; in the docked arrangements (\`DockedSidebar\`,
\`PageScroll\`) the rail runs the full height, so the rail keeps it.

#### Scroll

\`scroll\` decides who owns the viewport:

- \`app\` — the shell holds the viewport height and \`AppShell.Main\` scrolls internally, so the navbar and sidebar
  stay put. This is the default and what a dashboard or a developer tool wants.
- \`page\` — the shell grows with its content and the document scrolls. The header sticks itself, and
  \`AppShell.Sidebar\` pins the rail to the viewport so it does not stretch with the document and scroll away.

In a \`page\` shell, dock the rail (header inside \`AppShell.Column\`) as \`PageScroll\` does. With a full-width
header above the body, the sticky header and the pinned rail both want the top of the viewport and overlap.

#### Responsive

The sidebar is the consumer's call: hide it below \`md\` with a class and offer the drawer composition from the
Sidebar stories on small screens. \`AppShell.Aside\` hides itself below \`lg\`, where inspector content belongs on
its own screen or in a dialog.
`,
      },
    },
  },
  argTypes: {
    variant: {
      description: "Chrome of the content surfaces: edge to edge (`flush`) or floating panels (`inset`).",
      control: "select",
      options: ["flush", "inset"],
      table: { category: "Appearance", defaultValue: { summary: "flush" } },
    },
    scroll: {
      description: "Whether the shell holds the viewport and scrolls `Main` (`app`), or grows with the document (`page`).",
      control: "select",
      options: ["app", "page"],
      table: { category: "Layout", defaultValue: { summary: "app" } },
    },
    className: {
      description: "Additional Tailwind classes merged with the shell styles.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

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

// Only one surface shows the logo: the one that starts at the top-left of the frame. With a
// full-width navbar above the body that is the navbar, so the rail leaves its workspace block
// out; the docked arrangements flip both props.
function WorkspaceSidebar({ showBrand = false, variant }: { showBrand?: boolean; variant?: "default" | "inset" }) {
  return (
    <Sidebar defaultActiveKey="projects" showBrand={showBrand} variant={variant} className="hidden md:flex">
      {/* The header only earns its 64px band when it holds the logo; the toggle rides the rail's edge. */}
      <Sidebar.Toggle />
      {showBrand && <Sidebar.Header><Sidebar.Workspace /></Sidebar.Header>}
      <Sidebar.Nav><Navigation /></Sidebar.Nav>
      <Sidebar.Footer><Sidebar.Item itemKey="settings" icon={Settings2}>Settings</Sidebar.Item></Sidebar.Footer>
    </Sidebar>
  );
}

function WorkspaceNavbar({ showBrand = true, variant }: { showBrand?: boolean; variant?: "default" | "compact" | "inset" }) {
  return (
    <Navbar defaultActiveKey="projects" showBrand={showBrand} variant={variant}>
      <div className="flex h-full items-center gap-5 px-5">
        <Navbar.Brand name="Northstar" eyebrow="Workspace" />
        <Navbar.Nav>
          <Navbar.Item itemKey="projects">Projects</Navbar.Item>
          <Navbar.Item itemKey="activity">Activity</Navbar.Item>
        </Navbar.Nav>
        <Navbar.Actions>
          <Navbar.Search />
          <Navbar.IconButton label="Notifications" icon={Bell} />
          <Navbar.Profile />
        </Navbar.Actions>
      </div>
    </Navbar>
  );
}

function Page({ title, lead, blocks = 3 }: { title: string; lead: string; blocks?: number }) {
  return (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">Workspace overview</p>
      <h1 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-foreground">{title}</h1>
      <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{lead}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: blocks }, (_, index) => (
          <div key={index} className="h-28 rounded-lg border border-border bg-card" />
        ))}
      </div>
    </>
  );
}

export const Dashboard: Story = {
  parameters: {
    docs: { description: { story: "The default arrangement: a full-width navbar above a sidebar and the content column. The shell holds the viewport, so only the content scrolls." } },
  },
  render: (args) => (
    <AppShell {...args}>
      <AppShell.Header><WorkspaceNavbar /></AppShell.Header>
      <AppShell.Body>
        <AppShell.Sidebar><WorkspaceSidebar /></AppShell.Sidebar>
        <AppShell.Main>
          <AppShell.Content>
            <Page title="Good morning, Marta" lead="A quiet place for projects, conversations, and the work that needs your attention." blocks={6} />
          </AppShell.Content>
        </AppShell.Main>
      </AppShell.Body>
    </AppShell>
  ),
};

export const DockedSidebar: Story = {
  parameters: {
    docs: { description: { story: "The sidebar runs the full height and the navbar sits beside it, inside `AppShell.Column`. Same blocks, different composition — no prop switches the arrangement." } },
  },
  render: (args) => (
    <AppShell {...args}>
      <AppShell.Body>
        <AppShell.Sidebar><WorkspaceSidebar showBrand /></AppShell.Sidebar>
        <AppShell.Column>
          <AppShell.Header><WorkspaceNavbar showBrand={false} /></AppShell.Header>
          <AppShell.Main>
            <AppShell.Content>
              <Page title="Projects" lead="The workspace switcher stays at the top of the rail, and the header only spans the content column." blocks={6} />
            </AppShell.Content>
          </AppShell.Main>
        </AppShell.Column>
      </AppShell.Body>
    </AppShell>
  ),
};

export const Inset: Story = {
  args: { variant: "inset" },
  parameters: {
    docs: { description: { story: "The inset variant floats the content surface on the canvas. Pair it with `<Sidebar variant=\"inset\" />` so both carry the same gutter." } },
  },
  render: (args) => (
    <AppShell {...args}>
      <AppShell.Header><WorkspaceNavbar /></AppShell.Header>
      <AppShell.Body>
        <AppShell.Sidebar><WorkspaceSidebar variant="inset" /></AppShell.Sidebar>
        <AppShell.Main>
          <AppShell.Content>
            <Page title="Design system" lead="Both the rail and the content surface bring their own gutter, so the shell adds no padding of its own." blocks={6} />
          </AppShell.Content>
        </AppShell.Main>
      </AppShell.Body>
    </AppShell>
  ),
};

export const InsetSurfaces: Story = {
  args: { variant: "inset" },
  parameters: {
    docs: { description: { story: "Every surface floats: an inset navbar over an inset rail and an inset content panel. The navbar starts at the top-left, so it carries the logo and the rail sets `showBrand={false}`; swap the two to move it into the rail." } },
  },
  render: (args) => (
    <AppShell {...args}>
      <AppShell.Header><WorkspaceNavbar variant="inset" /></AppShell.Header>
      <AppShell.Body>
        <AppShell.Sidebar><WorkspaceSidebar variant="inset" /></AppShell.Sidebar>
        <AppShell.Main>
          <AppShell.Content>
            <Page title="Design system" lead="The navbar, the rail, and the content surface each bring their own gutter, so the shell adds no padding of its own." blocks={6} />
          </AppShell.Content>
        </AppShell.Main>
      </AppShell.Body>
    </AppShell>
  ),
};

export const WithDetailPanel: Story = {
  parameters: {
    docs: { description: { story: "A three-column workspace. `AppShell.Aside` takes a label for its landmark and hides itself below `lg`, where the same content belongs on its own screen." } },
  },
  render: (args) => (
    <AppShell {...args}>
      <AppShell.Header><WorkspaceNavbar /></AppShell.Header>
      <AppShell.Body>
        <AppShell.Sidebar><WorkspaceSidebar /></AppShell.Sidebar>
        <AppShell.Main>
          <AppShell.Content width="full">
            <Page title="Onboarding revamp" lead="Select an item to inspect it. The panel keeps its width while the content column absorbs the rest." blocks={4} />
          </AppShell.Content>
        </AppShell.Main>
        <AppShell.Aside label="Item details">
          <div className="border-b border-border px-4 py-3.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Details</p>
            <p className="mt-1.5 text-[13px] font-bold tracking-[-0.02em] text-foreground">Onboarding revamp</p>
          </div>
          <dl className="grid gap-3 px-4 py-4 text-xs">
            <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">Owner</dt><dd className="font-medium text-foreground">Marta Nowak</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">Status</dt><dd className="font-medium text-foreground">In review</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">Updated</dt><dd className="font-medium text-foreground">2 hours ago</dd></div>
          </dl>
        </AppShell.Aside>
      </AppShell.Body>
    </AppShell>
  ),
};

export const WithStatusBar: Story = {
  parameters: {
    docs: { description: { story: "A developer-tool shell: a compact navbar, a dense sidebar, and a status bar pinned to the bottom of the frame." } },
  },
  render: (args) => (
    <AppShell {...args}>
      <AppShell.Header><WorkspaceNavbar variant="compact" /></AppShell.Header>
      <AppShell.Body>
        <AppShell.Sidebar><WorkspaceSidebar /></AppShell.Sidebar>
        <AppShell.Main>
          <AppShell.Content width="full">
            <Page title="Pipelines" lead="The status bar sits outside the scroll container, so it stays visible while the content moves." blocks={6} />
          </AppShell.Content>
        </AppShell.Main>
      </AppShell.Body>
      <AppShell.Footer>
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em]"><span aria-hidden="true" className="size-1.5 rounded-full bg-success" />Connected</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em]">Last sync 09:41</span>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.12em]">6 running · 2 queued</span>
      </AppShell.Footer>
    </AppShell>
  ),
};

export const PageScroll: Story = {
  args: { scroll: "page" },
  parameters: {
    docs: { description: { story: "A document-like shell: the page grows with its content and the whole document scrolls. The header sticks to the top of its column and `AppShell.Sidebar` keeps the rail in view, which is why this arrangement docks the rail instead of putting the header above it." } },
  },
  render: (args) => (
    <AppShell {...args}>
      <AppShell.Body>
        <AppShell.Sidebar><WorkspaceSidebar showBrand /></AppShell.Sidebar>
        <AppShell.Column>
          <AppShell.Header><WorkspaceNavbar showBrand={false} /></AppShell.Header>
          <AppShell.Main>
            <AppShell.Content width="narrow">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">Changelog</p>
              <h1 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-foreground">What shipped this month</h1>
              {Array.from({ length: 12 }, (_, index) => (
                <p key={index} className="mt-4 text-sm leading-6 text-muted-foreground">
                  A narrow measure keeps long-form reading comfortable while the rail stays available. The shell grows with the content instead of trapping it in a scroll container, so find-in-page and anchor links behave the way a reader expects.
                </p>
              ))}
            </AppShell.Content>
          </AppShell.Main>
        </AppShell.Column>
      </AppShell.Body>
    </AppShell>
  ),
};

export const FocusedContent: Story = {
  parameters: {
    docs: { description: { story: "No sidebar: a header over a narrow measure, for settings, onboarding, or a single-purpose form." } },
  },
  render: (args) => (
    <AppShell {...args}>
      <AppShell.Header><WorkspaceNavbar /></AppShell.Header>
      <AppShell.Body>
        <AppShell.Main>
          <AppShell.Content width="narrow">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">Settings</p>
            <h1 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-foreground">Workspace preferences</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Without a sidebar the content carries the page, so keep the measure narrow and the actions close to what they change.</p>
            <div className="mt-8 grid gap-3">
              <div className="h-20 rounded-lg border border-border bg-card" />
              <div className="h-20 rounded-lg border border-border bg-card" />
            </div>
          </AppShell.Content>
        </AppShell.Main>
      </AppShell.Body>
    </AppShell>
  ),
};
