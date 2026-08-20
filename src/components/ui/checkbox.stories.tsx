import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { Card } from "./card";
import { Checkbox } from "./checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  args: { "aria-label": "Enable notifications" },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Checkbox

Checkbox is a native \`input[type=checkbox]\` styled with \`appearance-none\`. Form submission, the
\`indeterminate\` DOM state, autofill, and keyboard behavior stay native; only the box is ours.

On its own it needs an \`aria-label\`. Inside \`Checkbox.Root\` the id wiring is generated, so the label
and description connect themselves:

\`\`\`tsx
<Checkbox.Root>
  <Checkbox defaultChecked />
  <Checkbox.Content>
    <Checkbox.Label>Weekly digest</Checkbox.Label>
    <Checkbox.Description>A summary of deployments every Monday.</Checkbox.Description>
  </Checkbox.Content>
</Checkbox.Root>
\`\`\`

\`indeterminate\` is a DOM property, not an attribute — the component syncs it through a ref callback
keyed on the prop, which is what a "select all" box needs when only some children are checked.

Use \`Checkbox.Group\` for a set of related options; it renders a real \`fieldset\` so the legend names
the group for screen readers.
`,
      },
    },
  },
  argTypes: {
    checked: {
      description: "Controlled checked state. Pair it with `onChange`.",
      control: "boolean",
      table: { category: "State" },
    },
    defaultChecked: {
      description: "Initial checked state for an uncontrolled checkbox.",
      control: "boolean",
      table: { category: "State" },
    },
    indeterminate: {
      description: "Mixed state for a parent checkbox whose children are partly selected. It is visual and does not affect the submitted value.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    disabled: {
      description: "Prevents interaction and excludes the value from form submission.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    size: {
      description: "`md` for forms, `sm` for dense tables and toolbars.",
      control: "inline-radio",
      options: ["sm", "md"],
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    name: {
      description: "Native form field name.",
      control: "text",
      table: { category: "Form" },
    },
    onChange: {
      description: "Native change event. Read `event.target.checked`.",
      control: false,
      table: { category: "Events" },
    },
    className: {
      description: "Additional Tailwind classes merged with the box styles.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  parameters: { docs: { description: { story: "A bare checkbox. Standalone it must carry an `aria-label`, since nothing else names it." } } },
};

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-5">
      {[
        { label: "Unchecked", props: {} },
        { label: "Checked", props: { defaultChecked: true } },
        { label: "Mixed", props: { indeterminate: true } },
        { label: "Disabled", props: { disabled: true } },
        { label: "Disabled checked", props: { disabled: true, defaultChecked: true } },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2">
          <Checkbox aria-label={item.label} {...item.props} />
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "Every state the box can be in. The check and the dash cross-fade, so switching between them does not flash an empty box." } } },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Checkbox size="sm" defaultChecked aria-label="Small" />
        <span className="text-sm">sm</span>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox size="md" defaultChecked aria-label="Medium" />
        <span className="text-sm">md</span>
      </div>
    </div>
  ),
  parameters: { docs: { description: { story: "`sm` is for row selection in dense tables, where a 16px box would dominate the line." } } },
};

export const WithLabel: Story = {
  render: () => (
    <Checkbox.Root className="w-[380px]">
      <Checkbox defaultChecked />
      <Checkbox.Content>
        <Checkbox.Label>Weekly digest</Checkbox.Label>
      </Checkbox.Content>
    </Checkbox.Root>
  ),
  parameters: { docs: { description: { story: "`Checkbox.Root` generates the id, so the label connects to the box without any wiring in the form." } } },
};

export const WithDescription: Story = {
  render: () => (
    <Checkbox.Root className="w-[380px]">
      <Checkbox defaultChecked />
      <Checkbox.Content>
        <Checkbox.Label>Weekly digest</Checkbox.Label>
        <Checkbox.Description>A summary of deployments and incidents, sent every Monday at 09:00.</Checkbox.Description>
      </Checkbox.Content>
    </Checkbox.Root>
  ),
  parameters: { docs: { description: { story: "The description is exposed through `aria-describedby`, so it is announced after the label rather than as part of it." } } },
};

export const DisabledRow: Story = {
  render: () => (
    <Checkbox.Root disabled className="w-[380px]">
      <Checkbox defaultChecked />
      <Checkbox.Content>
        <Checkbox.Label>Audit log export</Checkbox.Label>
        <Checkbox.Description>Available on the Enterprise plan.</Checkbox.Description>
      </Checkbox.Content>
    </Checkbox.Root>
  ),
  parameters: { docs: { description: { story: "`disabled` on the root dims the whole row and disables the control, so the label never looks active next to a dead box." } } },
};

export const Group: Story = {
  render: () => (
    <Checkbox.Group label="Notify me about" description="Applies to this project only." className="w-[380px]">
      {[
        { id: "deploys", label: "Deployments", description: "Every successful and failed deploy.", defaultChecked: true },
        { id: "incidents", label: "Incidents", description: "When an environment reports an error budget breach." },
        { id: "mentions", label: "Mentions", description: "When someone mentions you in a comment.", defaultChecked: true },
      ].map((option) => (
        <Checkbox.Root key={option.id}>
          <Checkbox name="notifications" value={option.id} defaultChecked={option.defaultChecked} />
          <Checkbox.Content>
            <Checkbox.Label>{option.label}</Checkbox.Label>
            <Checkbox.Description>{option.description}</Checkbox.Description>
          </Checkbox.Content>
        </Checkbox.Root>
      ))}
    </Checkbox.Group>
  ),
  parameters: { docs: { description: { story: "`Checkbox.Group` renders a `fieldset` and `legend`, which is what makes the set read as one question instead of three unrelated toggles." } } },
};

export const CardVariant: Story = {
  render: () => (
    <div className="grid w-[560px] grid-cols-2 gap-3">
      {[
        { id: "read", label: "Read", description: "View projects, deployments, and logs.", defaultChecked: true },
        { id: "write", label: "Write", description: "Create and edit projects." },
        { id: "deploy", label: "Deploy", description: "Ship to staging and production." },
        { id: "admin", label: "Admin", description: "Manage members, roles, and billing." },
      ].map((permission) => (
        <Checkbox.Root key={permission.id} variant="card">
          <Checkbox name="permissions" value={permission.id} defaultChecked={permission.defaultChecked} />
          <Checkbox.Content>
            <Checkbox.Label>{permission.label}</Checkbox.Label>
            <Checkbox.Description>{permission.description}</Checkbox.Description>
          </Checkbox.Content>
        </Checkbox.Root>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "The `card` variant turns each option into a selectable tile. The label covers the tile, so the whole surface toggles the box — keep links out of these descriptions.",
      },
    },
  },
};

export const SelectAll: Story = {
  render: function Render() {
    const services = ["api-gateway", "billing-worker", "search-indexer", "legacy-cron"];
    const [selected, setSelected] = useState<string[]>(["api-gateway"]);
    const allSelected = selected.length === services.length;
    const someSelected = selected.length > 0 && !allSelected;
    const label = useMemo(() => (selected.length === 0 ? "None selected" : `${selected.length} of ${services.length} selected`), [selected.length, services.length]);

    return (
      <Card className="w-[420px]">
        <Card.Header divided>
          <Card.Heading>
            <Checkbox.Root>
              <Checkbox
                size="sm"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={(event) => setSelected(event.target.checked ? services : [])}
              />
              <Checkbox.Content>
                <Checkbox.Label>Select all</Checkbox.Label>
              </Checkbox.Content>
            </Checkbox.Root>
          </Card.Heading>
          <Card.Actions>
            <span className="text-xs text-muted-foreground tabular-nums">{label}</span>
          </Card.Actions>
        </Card.Header>
        <Card.Content className="p-0">
          <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
            {services.map((service) => (
              <li key={service} className="px-4 py-2.5">
                <Checkbox.Root>
                  <Checkbox
                    size="sm"
                    checked={selected.includes(service)}
                    onChange={(event) => setSelected((current) => (event.target.checked ? [...current, service] : current.filter((item) => item !== service)))}
                  />
                  <Checkbox.Content>
                    <Checkbox.Label className="font-normal">{service}</Checkbox.Label>
                  </Checkbox.Content>
                </Checkbox.Root>
              </li>
            ))}
          </ul>
        </Card.Content>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "The mixed state in practice. The header box is checked only when every row is; anything in between renders the dash, and clicking it clears the selection.",
      },
    },
  },
};

export const Invalid: Story = {
  render: () => (
    <div className="flex w-[380px] flex-col gap-1.5">
      <Checkbox.Root>
        <Checkbox aria-invalid required className="border-destructive/70" />
        <Checkbox.Content>
          <Checkbox.Label>I accept the processing agreement</Checkbox.Label>
          <Checkbox.Description className="text-destructive-foreground">Required before the workspace can be created.</Checkbox.Description>
        </Checkbox.Content>
      </Checkbox.Root>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "There is no invalid variant. Mark the input with `aria-invalid`, tint the border, and put the reason in the description — one error, one channel.",
      },
    },
  },
};
