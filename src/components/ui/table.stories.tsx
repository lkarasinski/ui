import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "./avatar";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Checkbox } from "./checkbox";
import { Skeleton } from "./skeleton";
import { Table } from "./table";

const meta: Meta<typeof Table> = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
### Table

Table is a real \`table\`. Column alignment, row semantics, and screen-reader navigation come from the
platform; the component adds density, the header seam, and the row states.

\`\`\`tsx
<Table.Scroll>
  <Table density="compact" stickyHeader>
    <Table.Head>
      <Table.Row>
        <Table.HeaderCell>Service</Table.HeaderCell>
        <Table.HeaderCell numeric align="right">p95</Table.HeaderCell>
      </Table.Row>
    </Table.Head>
    <Table.Body>
      <Table.Row>
        <Table.RowHeaderCell>api-gateway</Table.RowHeaderCell>
        <Table.Cell numeric align="right">128 ms</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
</Table.Scroll>
\`\`\`

**What the table does not do.** Sorting, selection, filtering, and pagination stay with the consumer —
that is where the data lives. \`Table.SortButton\` and the \`selected\` prop on a row cover only the
presentation of that state, so the table works the same behind TanStack Table, a server query, or a
plain array.

**Numbers.** \`numeric\` switches a cell to the mono font with tabular figures and is usually paired
with \`align="right"\`, so digits line up down the column.

**Narrow viewports.** A table cannot shrink below its content. Wrap it in \`Table.Scroll\` so the table
scrolls sideways instead of the page.
`,
      },
    },
  },
  argTypes: {
    density: {
      description: "`comfortable` for entity lists, `compact` for logs and metrics where more rows beat more air.",
      control: "inline-radio",
      options: ["comfortable", "compact"],
      table: { category: "Appearance", defaultValue: { summary: "comfortable" } },
    },
    stickyHeader: {
      description: "Pins the header row. Needs a scrolling ancestor with a height.",
      control: "boolean",
      table: { category: "Layout", defaultValue: { summary: "false" } },
    },
    className: {
      description: "Additional Tailwind classes merged with the table styles.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

type Service = {
  name: string;
  owner: string;
  status: "healthy" | "degraded" | "down";
  latency: number;
  requests: number;
};

const services: Service[] = [
  { name: "api-gateway", owner: "Platform", status: "healthy", latency: 128, requests: 184_204 },
  { name: "billing-worker", owner: "Payments", status: "degraded", latency: 642, requests: 12_048 },
  { name: "search-indexer", owner: "Search", status: "healthy", latency: 311, requests: 64_190 },
  { name: "legacy-cron", owner: "Platform", status: "down", latency: 0, requests: 0 },
];

const statusTone = { healthy: "success", degraded: "warning", down: "destructive" } as const;

export const Default: Story = {
  render: (args) => (
    <Table {...args} className="w-[640px]">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Service</Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell align="right" numeric>
            p95
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {services.map((service) => (
          <Table.Row key={service.name}>
            <Table.RowHeaderCell>{service.name}</Table.RowHeaderCell>
            <Table.Cell className="text-muted-foreground">{service.owner}</Table.Cell>
            <Table.Cell>
              <Badge size="sm" variant={statusTone[service.status]}>
                <Badge.Dot />
                {service.status}
              </Badge>
            </Table.Cell>
            <Table.Cell align="right" numeric>
              {service.latency} ms
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
  parameters: { docs: { description: { story: "The base table. The first column is a `RowHeaderCell`, which is what lets a screen reader say which row a cell belongs to." } } },
};

export const Density: Story = {
  render: () => (
    <div className="flex w-[640px] flex-col gap-8">
      {(["comfortable", "compact"] as const).map((density) => (
        <div key={density} className="flex flex-col gap-2">
          <span className="font-mono text-xs text-muted-foreground">density=&quot;{density}&quot;</span>
          <Table density={density}>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Service</Table.HeaderCell>
                <Table.HeaderCell align="right" numeric>
                  Requests
                </Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {services.map((service) => (
                <Table.Row key={service.name}>
                  <Table.RowHeaderCell>{service.name}</Table.RowHeaderCell>
                  <Table.Cell align="right" numeric>
                    {service.requests.toLocaleString("en-US")}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "Density is set once on the root and read by every cell through context, so a cell never takes a density prop." } } },
};

export const InsideCard: Story = {
  render: () => (
    <Card className="w-[680px]">
      <Card.Header divided>
        <Card.Heading>
          <Card.Title>Services</Card.Title>
          <Card.Description>Last 24 hours</Card.Description>
        </Card.Heading>
        <Card.Actions>
          <Badge size="sm" variant="muted">
            4 total
          </Badge>
        </Card.Actions>
      </Card.Header>
      <Card.Content className="p-0">
        <Table.Scroll>
          <Table density="compact">
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Service</Table.HeaderCell>
                <Table.HeaderCell>Owner</Table.HeaderCell>
                <Table.HeaderCell align="right" numeric>
                  p95
                </Table.HeaderCell>
                <Table.HeaderCell align="right" numeric>
                  Requests
                </Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {services.map((service) => (
                <Table.Row key={service.name}>
                  <Table.RowHeaderCell>{service.name}</Table.RowHeaderCell>
                  <Table.Cell className="text-muted-foreground">{service.owner}</Table.Cell>
                  <Table.Cell align="right" numeric>
                    {service.latency} ms
                  </Table.Cell>
                  <Table.Cell align="right" numeric>
                    {service.requests.toLocaleString("en-US")}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Foot>
              <Table.Row>
                <Table.Cell colSpan={2}>Total</Table.Cell>
                <Table.Cell align="right" numeric>
                  —
                </Table.Cell>
                <Table.Cell align="right" numeric>
                  {services.reduce((sum, service) => sum + service.requests, 0).toLocaleString("en-US")}
                </Table.Cell>
              </Table.Row>
            </Table.Foot>
          </Table>
        </Table.Scroll>
      </Card.Content>
    </Card>
  ),
  parameters: {
    docs: { description: { story: "In a card, give the body `p-0` so the header seam and the table rules line up with the card edges." } },
  },
};

export const Sortable: Story = {
  render: function Render() {
    const [sort, setSort] = useState<{ key: keyof Service; direction: "asc" | "desc" }>({ key: "latency", direction: "desc" });

    const sorted = useMemo(
      () =>
        [...services].sort((a, b) => {
          const order = a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0;
          return sort.direction === "asc" ? order : -order;
        }),
      [sort],
    );

    const toggle = (key: keyof Service) =>
      setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));

    const directionFor = (key: keyof Service) => (sort.key === key ? sort.direction : null);
    const ariaSortFor = (key: keyof Service) => (sort.key === key ? (sort.direction === "asc" ? "ascending" : "descending") : "none");

    return (
      <Table className="w-[640px]">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell aria-sort={ariaSortFor("name")}>
              <Table.SortButton direction={directionFor("name")} onClick={() => toggle("name")}>
                Service
              </Table.SortButton>
            </Table.HeaderCell>
            <Table.HeaderCell aria-sort={ariaSortFor("owner")}>
              <Table.SortButton direction={directionFor("owner")} onClick={() => toggle("owner")}>
                Owner
              </Table.SortButton>
            </Table.HeaderCell>
            <Table.HeaderCell align="right" aria-sort={ariaSortFor("latency")}>
              <Table.SortButton direction={directionFor("latency")} onClick={() => toggle("latency")}>
                p95
              </Table.SortButton>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {sorted.map((service) => (
            <Table.Row key={service.name}>
              <Table.RowHeaderCell>{service.name}</Table.RowHeaderCell>
              <Table.Cell className="text-muted-foreground">{service.owner}</Table.Cell>
              <Table.Cell align="right" numeric>
                {service.latency} ms
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "The table reports intent; the story sorts the data. `aria-sort` on the header cell is what makes the direction audible rather than only visible.",
      },
    },
  },
};

export const Selectable: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<string[]>(["billing-worker"]);
    const allSelected = selected.length === services.length;

    return (
      <div className="flex w-[680px] flex-col gap-3">
        <Table density="compact">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell className="w-9">
                <Checkbox
                  size="sm"
                  aria-label="Select all services"
                  checked={allSelected}
                  indeterminate={selected.length > 0 && !allSelected}
                  onChange={(event) => setSelected(event.target.checked ? services.map((service) => service.name) : [])}
                />
              </Table.HeaderCell>
              <Table.HeaderCell>Service</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell align="right" numeric>
                p95
              </Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {services.map((service) => {
              const isSelected = selected.includes(service.name);
              return (
                <Table.Row key={service.name} selected={isSelected}>
                  <Table.Cell>
                    <Checkbox
                      size="sm"
                      aria-label={`Select ${service.name}`}
                      checked={isSelected}
                      onChange={(event) =>
                        setSelected((current) => (event.target.checked ? [...current, service.name] : current.filter((name) => name !== service.name)))
                      }
                    />
                  </Table.Cell>
                  <Table.RowHeaderCell>{service.name}</Table.RowHeaderCell>
                  <Table.Cell>
                    <Badge size="sm" variant={statusTone[service.status]}>
                      <Badge.Dot />
                      {service.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell align="right" numeric>
                    {service.latency} ms
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground tabular-nums">{selected.length} selected</span>
          <div className="w-32">
            <Button variant="outline" disabled={selected.length === 0}>
              Restart
            </Button>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Row selection with the checkbox's mixed state in the header. The row only draws the selection; the story owns the set of selected ids.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => (
    <Table className="w-[640px]">
      <Table.Caption>Click a row to open the service. Rows are only interactive when the whole row is a link.</Table.Caption>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Service</Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
          <Table.HeaderCell align="right" numeric>
            Requests
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {services.map((service) => (
          <Table.Row key={service.name} interactive onClick={() => {}}>
            <Table.RowHeaderCell>
              <span className="flex items-center gap-2">
                <Avatar size="xs" shape="square">
                  <Avatar.Fallback>{service.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                </Avatar>
                {service.name}
              </span>
            </Table.RowHeaderCell>
            <Table.Cell className="text-muted-foreground">{service.owner}</Table.Cell>
            <Table.Cell align="right" numeric>
              {service.requests.toLocaleString("en-US")}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story: "`interactive` adds the hover fill. Only use it when the whole row navigates somewhere — and put a real link in a cell so keyboard users can reach it.",
      },
    },
  },
};

export const StickyHeader: Story = {
  render: () => (
    <div className="h-64 w-[640px] overflow-auto rounded-lg border border-border bg-card">
      <Table density="compact" stickyHeader>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Time</Table.HeaderCell>
            <Table.HeaderCell>Event</Table.HeaderCell>
            <Table.HeaderCell align="right" numeric>
              Duration
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {Array.from({ length: 24 }, (_, index) => (
            <Table.Row key={index}>
              <Table.Cell numeric className="text-muted-foreground">
                08:{String(index).padStart(2, "0")}
              </Table.Cell>
              <Table.Cell>{index % 3 === 0 ? "deployment.succeeded" : "build.finished"}</Table.Cell>
              <Table.Cell align="right" numeric>
                {40 + index * 3} s
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  ),
  parameters: { docs: { description: { story: "Scroll the box: the header stays. The gradient on the header cells keeps the rows from showing through as they pass under it." } } },
};

export const Loading: Story = {
  render: () => (
    <Skeleton.Region label="Loading services" className="w-[640px]">
      <Table density="compact">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Service</Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
            <Table.HeaderCell align="right" numeric>
              p95
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {Array.from({ length: 4 }, (_, index) => (
            <Table.Row key={index}>
              <Table.Cell>
                <Skeleton shape="text" className="w-32" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton shape="text" className="w-20" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton shape="text" className="ml-auto w-12" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Skeleton.Region>
  ),
  parameters: { docs: { description: { story: "The loading table keeps the real columns and row height, so the data lands without moving anything." } } },
};

export const Empty: Story = {
  render: () => (
    <Table className="w-[640px]">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Service</Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
          <Table.HeaderCell align="right" numeric>
            p95
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Empty colSpan={3}>
          <span className="flex flex-col items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
              <Inbox className="size-4" />
            </span>
            No services match this filter.
            <span className="w-32 pt-1">
              <Button variant="outline">Clear filter</Button>
            </span>
          </span>
        </Table.Empty>
      </Table.Body>
    </Table>
  ),
  parameters: { docs: { description: { story: "The empty state keeps the header, so the columns still explain what would be here — and it offers the way out." } } },
};

export const Responsive: Story = {
  render: () => (
    <Table.Scroll className="rounded-lg border border-border bg-card">
      <Table density="compact" className="min-w-[720px]">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Service</Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell align="right" numeric>
              p95
            </Table.HeaderCell>
            <Table.HeaderCell align="right" numeric>
              Requests
            </Table.HeaderCell>
            <Table.HeaderCell align="right" numeric>
              Errors
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {services.map((service) => (
            <Table.Row key={service.name}>
              <Table.RowHeaderCell>{service.name}</Table.RowHeaderCell>
              <Table.Cell className="text-muted-foreground">{service.owner}</Table.Cell>
              <Table.Cell>
                <Badge size="sm" variant={statusTone[service.status]}>
                  <Badge.Dot />
                  {service.status}
                </Badge>
              </Table.Cell>
              <Table.Cell align="right" numeric>
                {service.latency} ms
              </Table.Cell>
              <Table.Cell align="right" numeric>
                {service.requests.toLocaleString("en-US")}
              </Table.Cell>
              <Table.Cell align="right" numeric>
                {service.status === "healthy" ? "0.01%" : "2.4%"}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Table.Scroll>
  ),
  parameters: {
    docs: {
      description: {
        story: "Narrow the preview: the table scrolls sideways inside its own container instead of pushing the page wide. A `min-w-*` sets the point where that starts.",
      },
    },
  },
};
