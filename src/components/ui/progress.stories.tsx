import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Progress } from "./progress";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  args: { value: 62 },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Progress

Progress shows how far along a piece of work is.

Pass \`value\` when the duration is knowable — an upload, an import, a seat quota. Omit it and the bar
loops, which says "working" without pretending to know how long it will take. Guessing a percentage is
worse than admitting you cannot measure one.

\`Progress.Root\` owns the value so the bar and the readout can never disagree:

\`\`\`tsx
<Progress.Root value={uploaded} max={total}>
  <Progress.Header>
    <Progress.Label>Uploading archive</Progress.Label>
    <Progress.Value format={(value, max) => \`\${value} / \${max} MB\`} />
  </Progress.Header>
  <Progress.Bar />
</Progress.Root>
\`\`\`

The fill transitions over 300ms, so a jump from 10% to 90% reads as movement instead of a cut. Under
\`prefers-reduced-motion\` it snaps, and the indeterminate bar stops looping.
`,
      },
    },
  },
  argTypes: {
    value: {
      description: "Current progress. Leave it undefined for indeterminate work.",
      control: { type: "range", min: 0, max: 100, step: 1 },
      table: { category: "State" },
    },
    max: {
      description: "Upper bound of the scale.",
      control: "number",
      table: { category: "State", defaultValue: { summary: "100" } },
    },
    tone: {
      description: "Fill color. Use the semantic tones when the number itself is the warning — a quota near its limit, for example.",
      control: "inline-radio",
      options: ["default", "success", "warning", "destructive"],
      table: { category: "Appearance", defaultValue: { summary: "default" } },
    },
    size: {
      description: "`md` for a standalone bar, `sm` inside dense rows and cards.",
      control: "inline-radio",
      options: ["sm", "md"],
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    className: {
      description: "Additional Tailwind classes merged with the track styles.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: (args) => <Progress {...args} aria-label="Import progress" className="w-[320px]" />,
  parameters: { docs: { description: { story: "A determinate bar. Standalone it needs an `aria-label`, or a label connected with `aria-labelledby`." } } },
};

export const Values: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      {[0, 25, 62, 100].map((value) => (
        <Progress key={value} value={value} aria-label={`${value} percent`} />
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "Zero and full are both real states — the track stays visible at 0% so the control never disappears." } } },
};

export const Tones: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      {(["default", "success", "warning", "destructive"] as const).map((tone) => (
        <Progress key={tone} tone={tone} value={tone === "destructive" ? 96 : tone === "warning" ? 84 : 62} aria-label={tone} />
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "Tone follows meaning, not style: switch to warning or destructive when the number itself is the problem." } } },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <Progress size="sm" value={62} aria-label="Small" />
      <Progress size="md" value={62} aria-label="Medium" />
    </div>
  ),
  parameters: { docs: { description: { story: "`sm` fits under a table row or inside a card footer without dominating it." } } },
};

export const Indeterminate: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-2">
      <Progress aria-label="Preparing export" />
      <p className="m-0 text-sm text-muted-foreground">Preparing export…</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "No `value` means no `aria-valuenow`, so assistive tech reports indeterminate progress instead of a made-up number.",
      },
    },
  },
};

export const WithLabelAndValue: Story = {
  render: () => (
    <Progress.Root value={62} className="w-[360px]">
      <Progress.Header>
        <Progress.Label>Indexing repository</Progress.Label>
        <Progress.Value />
      </Progress.Header>
      <Progress.Bar aria-label="Indexing repository" />
    </Progress.Root>
  ),
  parameters: { docs: { description: { story: "The readout reads the value from the root, so it cannot drift from the bar." } } },
};

export const CustomFormat: Story = {
  render: () => (
    <Progress.Root value={412} max={1024} className="w-[360px]">
      <Progress.Header>
        <Progress.Label>Uploading archive</Progress.Label>
        <Progress.Value format={(value, max) => `${value} / ${max} MB`} />
      </Progress.Header>
      <Progress.Bar aria-label="Uploading archive" />
    </Progress.Root>
  ),
  parameters: { docs: { description: { story: "`format` receives the raw value and max, which is how you show bytes, seats, or steps instead of a percentage." } } },
};

export const Quota: Story = {
  render: () => (
    <Card className="w-[420px]">
      <Card.Header divided>
        <Card.Heading>
          <Card.Title>Usage</Card.Title>
          <Card.Description>Resets on 1 September.</Card.Description>
        </Card.Heading>
        <Card.Actions>
          <Badge size="sm" variant="warning">
            84%
          </Badge>
        </Card.Actions>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        {[
          { label: "Build minutes", value: 4200, max: 5000, tone: "warning" as const, unit: "min" },
          { label: "Seats", value: 18, max: 25, tone: "default" as const, unit: "seats" },
          { label: "Storage", value: 96, max: 100, tone: "destructive" as const, unit: "GB" },
        ].map((row) => (
          <Progress.Root key={row.label} value={row.value} max={row.max}>
            <Progress.Header>
              <Progress.Label>{row.label}</Progress.Label>
              <Progress.Value format={(value, max) => `${value} / ${max} ${row.unit}`} />
            </Progress.Header>
            <Progress.Bar size="sm" tone={row.tone} aria-label={row.label} />
          </Progress.Root>
        ))}
      </Card.Content>
    </Card>
  ),
  parameters: { docs: { description: { story: "A quota card: three bars, three formats, one composition. The tone carries the urgency the number implies." } } },
};

export const Live: Story = {
  render: function Render() {
    const [value, setValue] = useState<number | undefined>(0);
    const [running, setRunning] = useState(false);

    const start = () => {
      setRunning(true);
      setValue(0);
      const timer = window.setInterval(() => {
        setValue((current) => {
          const next = (current ?? 0) + 12;
          if (next >= 100) {
            window.clearInterval(timer);
            setRunning(false);
            return 100;
          }
          return next;
        });
      }, 400);
    };

    return (
      <div className="flex w-[360px] flex-col gap-3">
        <Progress.Root value={value}>
          <Progress.Header>
            <Progress.Label>Restore from backup</Progress.Label>
            <Progress.Value />
          </Progress.Header>
          <Progress.Bar aria-label="Restore from backup" tone={value === 100 ? "success" : "default"} />
        </Progress.Root>
        <div className="flex gap-2">
          <div className="w-28">
            <Button onClick={start} disabled={running}>
              {running ? "Restoring…" : "Start"}
            </Button>
          </div>
          <div className="w-32">
            <Button variant="outline" onClick={() => setValue(undefined)} disabled={running}>
              Unknown length
            </Button>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Run it: the fill eases between steps rather than snapping, and switching to “unknown length” drops the value so the same bar goes indeterminate.",
      },
    },
  },
};
