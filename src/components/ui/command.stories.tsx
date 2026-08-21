import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CircleDot,
  FileText,
  GitBranch,
  LayoutDashboard,
  Monitor,
  Moon,
  Pause,
  Palette,
  Plus,
  Rocket,
  RotateCw,
  Settings,
  Sun,
  Undo2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Command } from "./command";
import { Kbd } from "./kbd";

const meta: Meta<typeof Command> = {
  title: "UI/Command",
  component: Command,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
### Command

A command palette. Search, run, and navigate from one surface, without leaving the keyboard.

Every story below renders the palette inside a framed stage rather than over the whole page, using
the \`container\` prop. In a real app you leave \`container\` out and the palette portals to the body.

\`\`\`tsx
<Command shortcut="mod+k">
  <Command.Input placeholder="Search commands…" />
  <Command.Home>
    <Command.Body>
      <Command.List>
        <Command.Empty />
        <Command.Group heading="Actions">
          <Command.Item icon={<Plus />} shortcut="mod+n" onSelect={createProject}>
            New project
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Body>
  </Command.Home>
  <Command.Footer>
    <Command.Hint keys="enter">Run</Command.Hint>
  </Command.Footer>
</Command>
\`\`\`

**The root owns everything shared.** Open state, search text, the page stack, size, and density all
live on \`Command\` and reach the parts through a context selector. That is why \`Command.Item\` can
open a sub-page and \`Command.Detail\` can preview the highlighted row without either one being
handed props from the top.

**Filtering comes from [cmdk](https://cmdk.paco.me).** Items are scored and reordered as you type,
with \`keywords\` for aliases a user might reach for instead of the label. Pass
\`shouldFilter={false}\` when a server is doing the matching — see *Async search*.

**Sub-pages are declarative.** An item with \`page\` pushes; \`Command.Page\` renders while it is on
top. Backspace on an empty field and Escape both pop one level, and Escape only closes the palette
once the stack is empty. Search clears on every push and pop.

**Keyboard.** Arrows move, Enter runs, Escape leaves. \`ctrl+n\`/\`ctrl+p\` and \`ctrl+j\`/\`ctrl+k\`
work too, from cmdk's vim bindings. The selection loops at both ends.

**Every state is designed.** \`Command.Loading\` covers the first fetch, \`Command.Empty\` covers no
matches — and stays hidden while \`loading\` is set, so a search in flight never flashes "No results"
before its own results land. \`Command.Error\` covers the failure, and it takes a retry control as
children so the palette never dead-ends.

**Nothing shifts.** The loading edge under the input is 2px and absolutely positioned, the detail
pane has a fixed width, and search text and the page stack reset when the palette *opens* rather
than when it closes — so nothing snaps back to the root page behind the exit animation.

**Responsive.** The palette is full-width less a gutter below \`sm\`. The detail pane is hidden below
\`md\`, where it would leave the list too narrow to read, and the hint footer is hidden below \`sm\`,
where there is no keyboard to hint at.
        `,
      },
    },
  },
  argTypes: {
    open: { description: "Controlled open state. Pair it with `onOpenChange`.", control: "boolean", table: { category: "State" } },
    defaultOpen: { description: "Initial open state for an uncontrolled palette.", control: "boolean", table: { category: "State" } },
    onOpenChange: { description: "Called when the palette opens or closes.", control: false, table: { category: "Events" } },
    shortcut: {
      description: "A global key that toggles the palette. `mod` is ⌘ on Apple hardware and Ctrl elsewhere.",
      control: "text",
      table: { category: "Behaviour" },
    },
    size: {
      description: "Dialog width and list height. `sm` for a switcher, `lg` for a search-heavy palette or one with a detail pane.",
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    density: {
      description: "`compact` for long developer-tool lists, `comfortable` for everything else.",
      control: "inline-radio",
      options: ["compact", "comfortable"],
      table: { category: "Appearance", defaultValue: { summary: "comfortable" } },
    },
    loading: {
      description: "Draws the loading edge under the input and suppresses the empty state.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    search: { description: "Controlled search text. Leave it out and the palette owns it.", control: "text", table: { category: "State" } },
    onSearchChange: { description: "Called with the new search text on every keystroke.", control: false, table: { category: "Events" } },
    shouldFilter: {
      description: "Set to false when a server does the matching and you render the results yourself.",
      control: "boolean",
      table: { category: "Behaviour", defaultValue: { summary: "true" } },
    },
    container: { description: "Portals the palette into this element instead of the body.", control: false, table: { category: "Behaviour" } },
    modal: {
      description: "Set to false for a palette that leaves the page behind it usable.",
      control: "boolean",
      table: { category: "Behaviour", defaultValue: { summary: "true" } },
    },
    label: { description: "The accessible name of the dialog. Not shown.", control: "text", table: { category: "Accessibility" } },
  },
};

export default meta;
type Story = StoryObj<typeof Command>;

/**
 * A framed page with a faux app behind it, so the overlay and the shadow read the
 * way they would in a product. `transform` gives the frame its own containing
 * block, which is what keeps the fixed-position palette inside it.
 */
function Stage({ height = 460, onOpen, children }: { height?: number; onOpen?: () => void; children: (container: HTMLElement) => ReactNode }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setContainer}
      style={{ height }}
      className="relative w-full overflow-hidden rounded-xl border border-border bg-background [transform:translateZ(0)]"
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 rounded-full bg-border" />
          <div className="h-2 w-12 rounded-full bg-border/70" />
          {onOpen && (
            <button
              type="button"
              onClick={onOpen}
              className="ml-auto inline-flex items-center gap-2 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs text-muted-foreground outline-none transition-colors hover:border-ring hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25"
            >
              Open palette
              <Kbd keys="mod+k" size="sm" />
            </button>
          )}
        </div>
        <div className="grid flex-1 grid-cols-3 gap-3">
          {[0, 1, 2].map((column) => (
            <div key={column} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
              <div className="h-2 w-2/3 rounded-full bg-border" />
              <div className="h-2 w-1/2 rounded-full bg-border/60" />
              <div className="h-2 w-3/5 rounded-full bg-border/60" />
            </div>
          ))}
        </div>
      </div>
      {container && children(container)}
    </div>
  );
}

/**
 * The static showcase palettes. Several render on one docs page, so none of them
 * may take focus — the page would jump to whichever mounted last.
 */
const showcase = {
  modal: false,
  open: true,
  onOpenChange: () => {},
  onOpenAutoFocus: (event: Event) => event.preventDefault(),
} as const;

/** Keeps a story's palette reopenable after it is dismissed. */
function useStagePalette(initial = true) {
  const [open, setOpen] = useState(initial);
  return { open, setOpen, onOpen: () => setOpen(true) };
}

function StandardFooter() {
  return (
    <Command.Footer>
      <Command.Hint keys={["up", "down"]}>Navigate</Command.Hint>
      <Command.Hint keys="enter">Run</Command.Hint>
      <Command.Hint keys="esc" className="ml-auto">
        Close
      </Command.Hint>
    </Command.Footer>
  );
}

function DemoList() {
  return (
    <Command.List>
      <Command.Empty>Try a project name, or “deploy”.</Command.Empty>
      <Command.Group heading="Actions">
        <Command.Item value="new-project" icon={<Plus />} shortcut="mod+n" keywords={["create", "add"]}>
          New project
        </Command.Item>
        <Command.Item value="new-issue" icon={<CircleDot />} shortcut="mod+i" keywords={["bug", "ticket"]}>
          New issue
        </Command.Item>
        <Command.Item value="invite" icon={<UserPlus />} keywords={["member", "teammate"]}>
          Invite people
        </Command.Item>
      </Command.Group>
      <Command.Group heading="Go to">
        <Command.Item value="go-dashboard" icon={<LayoutDashboard />} shortcut={["g", "d"]}>
          Dashboard
        </Command.Item>
        <Command.Item value="go-docs" icon={<FileText />} shortcut={["g", "o"]}>
          Documentation
        </Command.Item>
        <Command.Item value="go-team" icon={<Users />} shortcut={["g", "t"]}>
          Team
        </Command.Item>
      </Command.Group>
      <Command.Separator />
      <Command.Group heading="Deploys">
        <Command.Item
          value="deploy-production"
          icon={<Rocket />}
          description="main → production"
          trailing={<Badge size="sm" variant="warning">Needs approval</Badge>}
        >
          Deploy to production
        </Command.Item>
        <Command.Item value="roll-back" icon={<Undo2 />} description="Last deploy 12 minutes ago">
          Roll back
        </Command.Item>
        <Command.Item value="pause-deploys" icon={<Pause />} disabled description="Only an owner can pause deploys">
          Pause deploys
        </Command.Item>
      </Command.Group>
    </Command.List>
  );
}

function DefaultStory(args: Partial<Parameters<typeof Command>[0]>) {
  const { open, setOpen, onOpen } = useStagePalette();

  return (
    <Stage onOpen={onOpen}>
      {(container) => (
        <Command {...args} container={container} open={open} onOpenChange={setOpen}>
          <Command.Input placeholder="Search commands…" />
          <Command.Home>
            <Command.Body>
              <DemoList />
            </Command.Body>
          </Command.Home>
          <StandardFooter />
        </Command>
      )}
    </Stage>
  );
}

export const Default: Story = {
  render: (args) => <DefaultStory {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "Groups, icons, shortcut chips, a description line, a trailing badge, and a disabled row. Type to filter — `bug` finds *New issue* through its keywords, not its label.",
      },
    },
  },
};

export const Sizes: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-6">
        {(["sm", "md", "lg"] as const).map((size) => (
          <div key={size} className="flex flex-col gap-2">
            <code className="font-mono text-xs text-muted-foreground">size=&quot;{size}&quot;</code>
            <Stage height={400}>
              {(container) => (
                <Command container={container} {...showcase} size={size} label={`${size} palette`}>
                  <Command.Input placeholder="Search commands…" autoFocus={false} />
                  <Command.Home>
                    <Command.Body>
                      <Command.List>
                        <Command.Empty />
                        <Command.Group heading="Actions">
                          <Command.Item value={`${size}-new`} icon={<Plus />} shortcut="mod+n">
                            New project
                          </Command.Item>
                          <Command.Item value={`${size}-issue`} icon={<CircleDot />} shortcut="mod+i">
                            New issue
                          </Command.Item>
                          <Command.Item value={`${size}-deploy`} icon={<Rocket />}>
                            Deploy to production
                          </Command.Item>
                        </Command.Group>
                      </Command.List>
                    </Command.Body>
                  </Command.Home>
                </Command>
              )}
            </Stage>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "`sm` for a quick switcher, `md` for most palettes, `lg` when results are long or a detail pane sits beside them. Size sets both the dialog width and the list's height cap. These three are `modal={false}` so they can share a page.",
      },
    },
  },
};

export const Density: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(["comfortable", "compact"] as const).map((density) => (
        <div key={density} className="flex flex-col gap-2">
          <code className="font-mono text-xs text-muted-foreground">density=&quot;{density}&quot;</code>
          <Stage height={420}>
            {(container) => (
              <Command container={container} {...showcase} density={density} label={`${density} palette`}>
                <Command.Input placeholder="Search commands…" autoFocus={false} />
                <Command.Home>
                  <Command.Body>
                    <Command.List>
                      <Command.Empty />
                      <Command.Group heading="Go to">
                        <Command.Item value={`${density}-dashboard`} icon={<LayoutDashboard />} shortcut={["g", "d"]}>
                          Dashboard
                        </Command.Item>
                        <Command.Item value={`${density}-docs`} icon={<FileText />} shortcut={["g", "o"]}>
                          Documentation
                        </Command.Item>
                        <Command.Item value={`${density}-team`} icon={<Users />} shortcut={["g", "t"]}>
                          Team
                        </Command.Item>
                        <Command.Item value={`${density}-settings`} icon={<Settings />} shortcut="mod+,">
                          Settings
                        </Command.Item>
                      </Command.Group>
                    </Command.List>
                  </Command.Body>
                </Command.Home>
              </Command>
            )}
          </Stage>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Row height, padding, icon size, and the shortcut chip all follow density. `compact` fits roughly a third more rows in the same height — worth it in a developer tool, not in a consumer app.",
      },
    },
  },
};

function NestedPagesStory() {
  const { open, setOpen, onOpen } = useStagePalette();
  const [theme, setTheme] = useState("Match system");

  return (
    <Stage onOpen={onOpen}>
      {(container) => (
        <Command container={container} open={open} onOpenChange={setOpen}>
          <Command.Input placeholder="Search commands…" />

          <Command.Home>
            <Command.Body>
              <Command.List>
                <Command.Empty />
                <Command.Group heading="Workspace">
                  <Command.Item value="theme" icon={<Palette />} page="theme" description={`Currently ${theme.toLowerCase()}`}>
                    Change theme
                  </Command.Item>
                  <Command.Item value="assign" icon={<UserPlus />} page="assign">
                    Assign issue to
                  </Command.Item>
                  <Command.Item value="branch" icon={<GitBranch />} page="branch">
                    Switch branch
                  </Command.Item>
                </Command.Group>
                <Command.Group heading="Actions">
                  <Command.Item value="settings" icon={<Settings />} shortcut="mod+,">
                    Open settings
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command.Body>
          </Command.Home>

          <Command.Page value="theme">
            <Command.Body>
              <Command.List>
                <Command.Empty />
                <Command.Group heading="Theme">
                  {[
                    { label: "Light", icon: <Sun /> },
                    { label: "Dark", icon: <Moon /> },
                    { label: "Match system", icon: <Monitor /> },
                  ].map((option) => (
                    <Command.Item
                      key={option.label}
                      value={`theme-${option.label}`}
                      icon={option.icon}
                      trailing={theme === option.label ? <Badge size="sm" variant="muted">Current</Badge> : undefined}
                      onSelect={() => {
                        setTheme(option.label);
                        setOpen(false);
                      }}
                    >
                      {option.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command.Body>
          </Command.Page>

          <Command.Page value="assign">
            <Command.Body>
              <Command.List>
                <Command.Empty>Nobody by that name is in this workspace.</Command.Empty>
                <Command.Group heading="Members">
                  {["Maja Wolska", "Piotr Zieliński", "Anna Dąbrowska", "Tomasz Król"].map((person) => (
                    <Command.Item key={person} value={`assign-${person}`} icon={<UserPlus />} onSelect={() => setOpen(false)}>
                      {person}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command.Body>
          </Command.Page>

          <Command.Page value="branch">
            <Command.Body>
              <Command.List>
                <Command.Empty>No branch matches that name.</Command.Empty>
                <Command.Group heading="Branches">
                  {[
                    { name: "main", meta: "default" },
                    { name: "release/2.4", meta: "3 commits ahead" },
                    { name: "feat/command-palette", meta: "yours" },
                    { name: "fix/sidebar-overflow", meta: "2 days ago" },
                  ].map((branch) => (
                    <Command.Item
                      key={branch.name}
                      value={`branch-${branch.name}`}
                      icon={<GitBranch />}
                      description={branch.meta}
                      onSelect={() => setOpen(false)}
                    >
                      {branch.name}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command.Body>
          </Command.Page>

          <Command.Footer>
            <Command.Hint keys={["up", "down"]}>Navigate</Command.Hint>
            <Command.Hint keys="enter">Run</Command.Hint>
            <Command.Hint keys="backspace">Back</Command.Hint>
            <Command.Hint keys="esc" className="ml-auto">
              Close
            </Command.Hint>
          </Command.Footer>
        </Command>
      )}
    </Stage>
  );
}

export const NestedPages: Story = {
  render: () => <NestedPagesStory />,
  parameters: {
    docs: {
      description: {
        story: `
Three sub-pages, each opened by an item with a \`page\` prop. The breadcrumb chip left of the field
takes its text from the item that opened it, and clicking a chip pops back to that level.

Backspace on an empty field pops one level, and so does Escape — the palette only closes once the
stack is empty. Search clears on every push and pop, so a sub-page always opens showing everything
it has. The entering page slides in from the side it came from, and holds still under
\`prefers-reduced-motion\`.
        `,
      },
    },
  },
};

const commandDetails: Record<string, { title: string; meta: string; body: string; badge?: ReactNode }> = {
  "deploy-production": {
    title: "Deploy to production",
    meta: "main → production",
    body: "Builds the current tip of main and promotes it. Two approvals are required before the build starts.",
    badge: <Badge size="sm" variant="warning">Needs approval</Badge>,
  },
  "roll-back": {
    title: "Roll back",
    meta: "Reverts to build #4812",
    body: "Points production back at the previous build. Traffic moves in about 40 seconds; nothing is rebuilt.",
  },
  "run-migrations": {
    title: "Run migrations",
    meta: "3 pending",
    body: "Applies pending migrations against the production database. Runs inside a transaction and stops on the first failure.",
    badge: <Badge size="sm" variant="destructive">Destructive</Badge>,
  },
  "clear-cache": {
    title: "Clear edge cache",
    meta: "38 locations",
    body: "Purges every edge location. Expect a cold cache and slower first responses for a minute or two.",
  },
  "invite-people": {
    title: "Invite people",
    meta: "18 of 25 seats used",
    body: "Sends a workspace invitation by email. Invitations expire after seven days.",
  },
};

function DetailPaneStory() {
  const { open, setOpen, onOpen } = useStagePalette();

  return (
    <Stage height={520} onOpen={onOpen}>
      {(container) => (
        <Command container={container} open={open} onOpenChange={setOpen} size="lg">
          <Command.Input placeholder="Search commands…" />
          <Command.Home>
            <Command.Body>
              <Command.List>
                <Command.Empty>No command matches that.</Command.Empty>
                <Command.Group heading="Deploys">
                  <Command.Item value="deploy-production" icon={<Rocket />}>
                    Deploy to production
                  </Command.Item>
                  <Command.Item value="roll-back" icon={<Undo2 />}>
                    Roll back
                  </Command.Item>
                  <Command.Item value="run-migrations" icon={<GitBranch />}>
                    Run migrations
                  </Command.Item>
                  <Command.Item value="clear-cache" icon={<RotateCw />}>
                    Clear edge cache
                  </Command.Item>
                </Command.Group>
                <Command.Group heading="Workspace">
                  <Command.Item value="invite-people" icon={<UserPlus />}>
                    Invite people
                  </Command.Item>
                </Command.Group>
              </Command.List>
              <Command.Detail>
                {(value) => {
                  const detail = commandDetails[value];
                  if (!detail) return null;
                  return (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-card-foreground">{detail.title}</span>
                        {detail.badge}
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{detail.meta}</span>
                      <p className="m-0 text-xs leading-relaxed text-muted-foreground">{detail.body}</p>
                    </>
                  );
                }}
              </Command.Detail>
            </Command.Body>
          </Command.Home>
          <StandardFooter />
        </Command>
      )}
    </Stage>
  );
}

export const DetailPane: Story = {
  render: () => <DetailPaneStory />,
  parameters: {
    docs: {
      description: {
        story: `
The pane reads the highlighted item straight out of the command store, so arrowing through the list
updates it without the list knowing the pane exists:

\`\`\`tsx
<Command.Detail>{(value) => renderPreview(value)}</Command.Detail>
\`\`\`

Its width is fixed, so moving between a one-line command and a five-line one never resizes the
palette. It is hidden below \`md\` — pair it with \`size="md"\` or \`size="lg"\`.
        `,
      },
    },
  },
};

type Issue = { id: string; title: string; status: "open" | "merged" | "closed" };

const remoteIssues: Issue[] = [
  { id: "UI-418", title: "Command palette closes on the first arrow key", status: "open" },
  { id: "UI-402", title: "Sidebar overflows at 1280px", status: "open" },
  { id: "UI-377", title: "Dialog animation stutters on Safari", status: "merged" },
  { id: "UI-355", title: "Table header loses its shadow while scrolling", status: "closed" },
  { id: "UI-341", title: "Toast stacks in the wrong order", status: "open" },
  { id: "UI-320", title: "Focus ring clipped inside the card", status: "merged" },
];

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; results: Issue[] };

const issueStatusVariant = { open: "success", merged: "default", closed: "muted" } as const;

/**
 * A palette whose results come from a server.
 *
 * The state is a union rather than three booleans, so "loading and errored" is
 * not representable. Filtering is off — the server already did it — and results
 * stay on screen while the next request runs, with the loading edge under the
 * input carrying the refresh.
 */
function AsyncSearchStory({ failing = false }: { failing?: boolean }) {
  const { open, setOpen, onOpen } = useStagePalette();
  const [search, setSearch] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<SearchState>({ status: "idle" });

  // Debounced request. A network call on a keystroke is exactly what an effect is for.
  useEffect(() => {
    const query = search.trim();
    if (query === "") {
      setState({ status: "idle" });
      return;
    }
    setState({ status: "loading" });
    const timer = setTimeout(() => {
      if (failing) {
        setState({ status: "error", message: "The search service did not respond." });
        return;
      }
      setState({
        status: "success",
        results: remoteIssues.filter((issue) => `${issue.id} ${issue.title}`.toLowerCase().includes(query.toLowerCase())),
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [attempt, failing, search]);

  const results = state.status === "success" ? state.results : [];

  return (
    <Stage height={480} onOpen={onOpen}>
      {(container) => (
        <Command
          container={container}
          open={open}
          onOpenChange={setOpen}
          search={search}
          onSearchChange={setSearch}
          loading={state.status === "loading"}
          shouldFilter={false}
        >
          <Command.Input placeholder="Search issues…" />
          <Command.Home>
            <Command.Body>
              <Command.List>
                {state.status === "idle" && (
                  <p className="m-0 px-6 py-10 text-center text-xs text-muted-foreground">Type to search issues. Try “palette” or “UI-4”.</p>
                )}
                {state.status === "loading" && results.length === 0 && <Command.Loading rows={4} />}
                {state.status === "error" && (
                  <Command.Error title="Could not reach the issue search">
                    {state.message}
                    <button
                      type="button"
                      onClick={() => setAttempt((current) => current + 1)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-card-foreground outline-none transition-colors hover:bg-secondary-hover focus-visible:ring-3 focus-visible:ring-primary/25"
                    >
                      <RotateCw className="size-3" aria-hidden="true" />
                      Try again
                    </button>
                  </Command.Error>
                )}
                {state.status === "success" && (
                  <>
                    <Command.Empty>Nothing matches “{search.trim()}”.</Command.Empty>
                    <Command.Group heading="Issues">
                      {results.map((issue) => (
                        <Command.Item
                          key={issue.id}
                          value={issue.id}
                          icon={<CircleDot />}
                          description={issue.id}
                          trailing={
                            <Badge size="sm" variant={issueStatusVariant[issue.status]}>
                              {issue.status}
                            </Badge>
                          }
                          onSelect={() => setOpen(false)}
                        >
                          {issue.title}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </>
                )}
              </Command.List>
            </Command.Body>
          </Command.Home>
          <StandardFooter />
        </Command>
      )}
    </Stage>
  );
}

export const AsyncSearch: Story = {
  render: () => <AsyncSearchStory />,
  parameters: {
    docs: {
      description: {
        story: `
Server-side search: \`shouldFilter={false}\`, a controlled \`search\`, and a 600ms debounce.

Type "palette" and watch the order — idle prompt, skeleton rows, results. Then keep typing: the
results already on screen stay there and only the 2px edge under the input moves, because swapping
a filled list for grey boxes on every keystroke is worse than a list that is briefly one letter
behind. \`Command.Empty\` stays hidden while \`loading\` is set, so "Nothing matches" only appears
once the answer is actually in.
        `,
      },
    },
  },
};

export const AsyncError: Story = {
  render: () => <AsyncSearchStory failing />,
  parameters: {
    docs: {
      description: {
        story:
          "The same palette with a failing backend. `Command.Error` takes the retry control as children — a palette that can only be closed to escape an error is a dead end.",
      },
    },
  },
};

export const FirstLoad: Story = {
  render: () => (
    <Stage height={420}>
      {(container) => (
        <Command container={container} {...showcase} loading label="Loading palette">
          <Command.Input placeholder="Search commands…" autoFocus={false} />
          <Command.Home>
            <Command.Body>
              <Command.List>
                <Command.Loading rows={5} />
              </Command.List>
            </Command.Body>
          </Command.Home>
          <StandardFooter />
        </Command>
      )}
    </Stage>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The first fetch, with nothing to show yet. Placeholder rows match the real row height at the current density, so the results land where the skeletons were. The loading edge runs under the input at the same time.",
      },
    },
  },
};

function NoResultsStory() {
  const [search, setSearch] = useState("quarterly revenue");

  return (
    <Stage height={420}>
      {(container) => (
        <Command
          container={container}
          {...showcase}
          search={search}
          onSearchChange={setSearch}
          label="Empty palette"
        >
          <Command.Input placeholder="Search commands…" autoFocus={false} />
          <Command.Home>
            <Command.Body>
              <DemoList />
            </Command.Body>
          </Command.Home>
          <StandardFooter />
        </Command>
      )}
    </Stage>
  );
}

export const NoResults: Story = {
  render: () => <NoResultsStory />,
  parameters: {
    docs: {
      description: {
        story:
          "Nothing matches. The empty state says what to try instead of only saying no, and the footer stays put so the palette does not change shape around it.",
      },
    },
  },
};

const longList = Array.from({ length: 48 }, (_, index) => ({
  value: `service-${index}`,
  name: `${["api", "worker", "scheduler", "gateway", "ingest"][index % 5]}-${String(index).padStart(3, "0")}`,
  region: ["eu-central-1", "us-east-1", "ap-southeast-2"][index % 3],
}));

export const LongList: Story = {
  render: () => (
    <Stage height={540}>
      {(container) => (
        <Command container={container} {...showcase} size="lg" density="compact" label="Service palette">
          <Command.Input placeholder="Search services…" autoFocus={false} />
          <Command.Home>
            <Command.Body>
              <Command.List>
                <Command.Empty />
                <Command.Group heading="Services">
                  <Command.Item
                    value="service-long-name"
                    icon={<Rocket />}
                    description="A description long enough to run past the edge of the row and prove that it truncates rather than wrapping onto a second line"
                    trailing={<Badge size="sm" variant="muted">eu-central-1</Badge>}
                  >
                    A service whose name is far longer than the palette is wide, so the label has to give way first
                  </Command.Item>
                  {longList.map((service) => (
                    <Command.Item
                      key={service.value}
                      value={service.value}
                      icon={<Rocket />}
                      trailing={<Badge size="sm" variant="muted">{service.region}</Badge>}
                    >
                      {service.name}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command.Body>
          </Command.Home>
          <StandardFooter />
        </Command>
      )}
    </Stage>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "49 rows at `compact` density. The list scrolls on its own and keeps the highlighted row in view as you arrow past the edge. Long labels and descriptions truncate; the trailing badge and shortcut chip never shrink.",
      },
    },
  },
};

function GlobalShortcutStory() {
  const [lastRun, setLastRun] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-4">
      <p className="m-0 flex items-center gap-2 text-sm text-muted-foreground">
        Press <Kbd keys="mod+k" /> anywhere on this page.
      </p>
      <p className="m-0 text-xs text-muted-foreground">{lastRun ? `Last run: ${lastRun}` : "Nothing run yet."}</p>
      <Command
        shortcut="mod+k"
        trigger={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs text-muted-foreground outline-none transition-colors hover:border-ring hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25"
          >
            Open palette
            <Kbd keys="mod+k" size="sm" />
          </button>
        }
      >
        <Command.Input placeholder="Search commands…" />
        <Command.Home>
          <Command.Body>
            <Command.List>
              <Command.Empty />
              <Command.Group heading="Actions">
                {["New project", "New issue", "Invite people"].map((action) => (
                  <Command.Item key={action} value={action} icon={<Plus />} onSelect={() => setLastRun(action)}>
                    {action}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command.Body>
        </Command.Home>
        <StandardFooter />
      </Command>
    </div>
  );
}

export const GlobalShortcut: Story = {
  render: () => <GlobalShortcutStory />,
  parameters: {
    docs: {
      description: {
        story: `
The only story without a \`container\` — this one opens over the real page, the way it would in an
app, and closes when an item runs.

\`shortcut="mod+k"\` binds ⌘K on Apple hardware and Ctrl+K everywhere else, and toggles: pressing it
again closes the palette. A shortcut with no modifier — \`"/"\` — is ignored while the focus is in a
field, so it cannot eat a keystroke meant for a form. The \`trigger\` prop renders an opener
outside the dialog for anyone who does not know the key — it is a prop and not a child because
children of \`Command\` render *inside* the palette.
        `,
      },
    },
  },
};

export const Composition: Story = {
  render: () => (
    <Stage height={440}>
      {(container) => (
        <Command container={container} {...showcase} size="lg" label="Composed palette">
          <Command.Input
            placeholder="Search or jump to…"
            autoFocus={false}
            trailing={<Badge size="sm" variant="outline">Workspace</Badge>}
          />
          <Command.Home>
            <Command.Body>
              <Command.List>
                <Command.Empty />
                <Command.Group heading="Recent">
                  <Command.Item value="recent-1" icon={<FileText />} description="Opened 4 minutes ago">
                    Deployment checklist
                  </Command.Item>
                  <Command.Item value="recent-2" icon={<CircleDot />} description="Opened yesterday">
                    UI-418 · Command palette closes on the first arrow key
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command.Body>
          </Command.Home>
          <Command.Footer className={cn("justify-between")}>
            <span className="inline-flex items-center gap-3">
              <Command.Hint keys={["up", "down"]}>Navigate</Command.Hint>
              <Command.Hint keys="enter">Open</Command.Hint>
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Palette className="size-3" aria-hidden="true" />
              Search is scoped to this workspace
            </span>
          </Command.Footer>
        </Command>
      )}
    </Stage>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The parts are slots, not a fixed layout: `Command.Input` takes `trailing` for a scope chip, and `Command.Footer` takes whatever the product needs instead of hints. Anything the palette does not own — recent items, scoping, ranking — is data you pass in.",
      },
    },
  },
};
