import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Badge } from "./badge";
import { Card } from "./card";
import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
  args: { "aria-label": "Enable preview deployments" },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Switch

Switch applies its change immediately. That is the whole difference from a checkbox: use a checkbox
when the value is submitted with a form, and a switch when flipping it *is* the action.

Because the change is immediate, the write needs to be visible. Pass \`pending\` while it is in flight —
the thumb shows a spinner, the control blocks input, and the position only moves once the caller flips
\`checked\`. That way a failed request never leaves the UI claiming a setting was saved.

\`\`\`tsx
<Switch.Root>
  <Switch.Content>
    <Switch.Label>Preview deployments</Switch.Label>
    <Switch.Description>Build every pull request.</Switch.Description>
  </Switch.Content>
  <Switch checked={enabled} pending={isSaving} onCheckedChange={save} />
</Switch.Root>
\`\`\`

It renders a \`button\` with \`role="switch"\`. Buttons are labelable, so \`Switch.Label\` names it and
toggles it on click through the generated id. There is no hidden form field — a switch that must be
submitted with a form is a checkbox.
`,
      },
    },
  },
  argTypes: {
    checked: {
      description: "Controlled state. Pair it with `onCheckedChange`.",
      control: "boolean",
      table: { category: "State" },
    },
    defaultChecked: {
      description: "Initial state for an uncontrolled switch.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    pending: {
      description: "Shows a spinner in the thumb and blocks input while the change is being saved.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    disabled: {
      description: "Prevents interaction. Explain why next to the control instead of leaving it dead.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    size: {
      description: "`md` for settings rows, `sm` for toolbars and table headers.",
      control: "inline-radio",
      options: ["sm", "md"],
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    onCheckedChange: {
      description: "Called with the next state when the switch is toggled.",
      control: false,
      table: { category: "Events" },
    },
    className: {
      description: "Additional Tailwind classes merged with the track styles.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  parameters: { docs: { description: { story: "An uncontrolled switch. Standalone it needs an `aria-label`, since nothing else names it." } } },
};

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {[
        { label: "Off", props: {} },
        { label: "On", props: { defaultChecked: true } },
        { label: "Pending", props: { defaultChecked: true, pending: true } },
        { label: "Disabled", props: { disabled: true } },
        { label: "Disabled on", props: { disabled: true, defaultChecked: true } },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2">
          <Switch aria-label={item.label} {...item.props} />
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "Every state. The thumb slides rather than jumping, and the transition is dropped under `prefers-reduced-motion`." } } },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Switch size="sm" defaultChecked aria-label="Small" />
        <span className="text-sm">sm</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch size="md" defaultChecked aria-label="Medium" />
        <span className="text-sm">md</span>
      </div>
    </div>
  ),
  parameters: { docs: { description: { story: "`sm` fits a toolbar or a table header where a 20px track would crowd the row." } } },
};

export const WithLabel: Story = {
  render: () => (
    <Switch.Root className="w-[420px]">
      <Switch.Content>
        <Switch.Label>Preview deployments</Switch.Label>
      </Switch.Content>
      <Switch defaultChecked />
    </Switch.Root>
  ),
  parameters: { docs: { description: { story: "`Switch.Root` spreads the label and the control to opposite edges — the layout a settings list wants." } } },
};

export const WithDescription: Story = {
  render: () => (
    <Switch.Root className="w-[420px]">
      <Switch.Content>
        <Switch.Label>Preview deployments</Switch.Label>
        <Switch.Description>Build every pull request and post the URL as a comment.</Switch.Description>
      </Switch.Content>
      <Switch defaultChecked />
    </Switch.Root>
  ),
  parameters: { docs: { description: { story: "The description is announced after the label through `aria-describedby`, not merged into the name." } } },
};

export const ControlOnTheLeft: Story = {
  render: () => (
    <Switch.Root className="w-[420px] justify-start gap-3">
      <Switch />
      <Switch.Content>
        <Switch.Label>Require review before merge</Switch.Label>
        <Switch.Description>At least one approval from a code owner.</Switch.Description>
      </Switch.Content>
    </Switch.Root>
  ),
  parameters: { docs: { description: { story: "The parts are ordered by the consumer. Nothing in the root assumes the control is last." } } },
};

export const Pending: Story = {
  render: function Render() {
    const [enabled, setEnabled] = useState(false);
    const [saving, setSaving] = useState(false);

    const save = (next: boolean) => {
      setSaving(true);
      window.setTimeout(() => {
        setEnabled(next);
        setSaving(false);
      }, 900);
    };

    return (
      <Switch.Root className="w-[420px]">
        <Switch.Content>
          <Switch.Label>Require two-factor authentication</Switch.Label>
          <Switch.Description>{saving ? "Saving…" : "Applies to every member of the workspace."}</Switch.Description>
        </Switch.Content>
        <Switch checked={enabled} pending={saving} onCheckedChange={save} />
      </Switch.Root>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "The switch stays where it was until the write lands. Toggle it and watch the thumb spin — the position never claims a change the server has not confirmed.",
      },
    },
  },
};

export const Failed: Story = {
  render: function Render() {
    const [enabled, setEnabled] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const save = (next: boolean) => {
      setSaving(true);
      setError(null);
      window.setTimeout(() => {
        setSaving(false);
        setError("Could not reach the settings service. Nothing was changed.");
        setEnabled((current) => current);
      }, 900);
      void next;
    };

    return (
      <Switch.Root className="w-[420px]">
        <Switch.Content>
          <Switch.Label>Auto-scale workers</Switch.Label>
          <Switch.Description className={error ? "text-destructive-foreground" : undefined}>
            {error ?? "Add capacity when the queue grows."}
          </Switch.Description>
        </Switch.Content>
        <Switch checked={enabled} pending={saving} onCheckedChange={save} />
      </Switch.Root>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "When the write fails the switch simply never moves, and the description carries the reason. One failure, one channel — no toast on top of this.",
      },
    },
  },
};

export const DisabledWithReason: Story = {
  render: () => (
    <Switch.Root disabled className="w-[420px]">
      <Switch.Content>
        <Switch.Label>SAML single sign-on</Switch.Label>
        <Switch.Description>Available on the Enterprise plan.</Switch.Description>
      </Switch.Content>
      <Switch />
    </Switch.Root>
  ),
  parameters: { docs: { description: { story: "`disabled` on the root dims the row and disables the control. Always leave a reason next to it." } } },
};

export const SettingsList: Story = {
  render: function Render() {
    const [settings, setSettings] = useState({ previews: true, comments: true, cleanup: false });
    const rows = [
      { key: "previews" as const, label: "Preview deployments", description: "Build every pull request." },
      { key: "comments" as const, label: "Comment with the preview URL", description: "Posts once per pull request." },
      { key: "cleanup" as const, label: "Delete previews after merge", description: "Frees build minutes on busy repositories." },
    ];

    return (
      <Card className="w-[460px]">
        <Card.Header divided>
          <Card.Heading>
            <Card.Title>Previews</Card.Title>
            <Card.Description>Applies to northstar/api.</Card.Description>
          </Card.Heading>
          <Card.Actions>
            <Badge size="sm" variant="muted" className="tabular-nums">
              {Object.values(settings).filter(Boolean).length} / 3 on
            </Badge>
          </Card.Actions>
        </Card.Header>
        <Card.Content className="flex flex-col gap-3.5">
          {rows.map((row) => (
            <Switch.Root key={row.key}>
              <Switch.Content>
                <Switch.Label>{row.label}</Switch.Label>
                <Switch.Description>{row.description}</Switch.Description>
              </Switch.Content>
              <Switch checked={settings[row.key]} onCheckedChange={(checked) => setSettings((current) => ({ ...current, [row.key]: checked }))} />
            </Switch.Root>
          ))}
        </Card.Content>
      </Card>
    );
  },
  parameters: { docs: { description: { story: "The usual home for a switch: a settings card where each row saves on its own." } } },
};
