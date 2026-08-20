import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Badge } from "./badge";
import { Card } from "./card";
import { RadioGroup } from "./radio-group";

const meta: Meta<typeof RadioGroup> = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### RadioGroup

RadioGroup is a set of mutually exclusive options built on native radio inputs. Arrow-key navigation,
the roving tab stop, and form submission come from the browser rather than from JavaScript.

The root owns the value and shares it through a context selector, so an option never receives the
group's state as a prop:

\`\`\`tsx
<RadioGroup defaultValue="team" onValueChange={setPlan}>
  <RadioGroup.Legend>Plan</RadioGroup.Legend>
  <RadioGroup.Item value="team">
    <RadioGroup.Radio />
    <RadioGroup.Content>
      <RadioGroup.Label>Team</RadioGroup.Label>
      <RadioGroup.Description>Up to 25 seats.</RadioGroup.Description>
    </RadioGroup.Content>
  </RadioGroup.Item>
</RadioGroup>
\`\`\`

The control is an explicit part, so an option can put it on either side, or replace the content with a
price block, a chart, or a preview.

Use radios when the choice is visible and small — three to five options. Beyond that, a select is
faster to scan.
`,
      },
    },
  },
  argTypes: {
    value: {
      description: "Controlled selected value. Pair it with `onValueChange`.",
      control: "text",
      table: { category: "State" },
    },
    defaultValue: {
      description: "Initial selection for an uncontrolled group.",
      control: "text",
      table: { category: "State" },
    },
    onValueChange: {
      description: "Called with the value of the option that was selected.",
      control: false,
      table: { category: "Events" },
    },
    orientation: {
      description: "`vertical` stacks options; `horizontal` wraps them in a row for short labels or card tiles.",
      control: "inline-radio",
      options: ["vertical", "horizontal"],
      table: { category: "Layout", defaultValue: { summary: "vertical" } },
    },
    variant: {
      description: "`default` for a plain list, `card` to turn each option into a selectable tile.",
      control: "inline-radio",
      options: ["default", "card"],
      table: { category: "Appearance", defaultValue: { summary: "default" } },
    },
    name: {
      description: "Shared form field name for the inputs. Generated when omitted.",
      control: "text",
      table: { category: "Form" },
    },
    disabled: {
      description: "Disables every option in the group through the native fieldset.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    className: {
      description: "Additional Tailwind classes merged with the group layout.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

const plans = [
  { value: "hobby", label: "Hobby", description: "One project, community support." },
  { value: "team", label: "Team", description: "Up to 25 seats and shared environments." },
  { value: "enterprise", label: "Enterprise", description: "SSO, audit log, and a support contract." },
];

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="team" className="w-[380px]">
      {plans.map((plan) => (
        <RadioGroup.Item key={plan.value} value={plan.value}>
          <RadioGroup.Radio />
          <RadioGroup.Content>
            <RadioGroup.Label>{plan.label}</RadioGroup.Label>
          </RadioGroup.Content>
        </RadioGroup.Item>
      ))}
    </RadioGroup>
  ),
  parameters: { docs: { description: { story: "A plain list of options. Focus the group and use the arrow keys — that behavior is native, not scripted." } } },
};

export const WithLegendAndDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="team" className="w-[400px]">
      <RadioGroup.Legend>Plan</RadioGroup.Legend>
      <RadioGroup.Hint>You can change this at any time; charges are prorated.</RadioGroup.Hint>
      {plans.map((plan) => (
        <RadioGroup.Item key={plan.value} value={plan.value}>
          <RadioGroup.Radio />
          <RadioGroup.Content>
            <RadioGroup.Label>{plan.label}</RadioGroup.Label>
            <RadioGroup.Description>{plan.description}</RadioGroup.Description>
          </RadioGroup.Content>
        </RadioGroup.Item>
      ))}
    </RadioGroup>
  ),
  parameters: { docs: { description: { story: "The legend names the group, each description names its own option. Both are wired automatically." } } },
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="week" orientation="horizontal" className="w-[420px]">
      <RadioGroup.Legend className="w-full">Range</RadioGroup.Legend>
      {[
        { value: "day", label: "24 hours" },
        { value: "week", label: "7 days" },
        { value: "month", label: "30 days" },
      ].map((range) => (
        <RadioGroup.Item key={range.value} value={range.value} className="flex-none">
          <RadioGroup.Radio size="sm" />
          <RadioGroup.Content>
            <RadioGroup.Label className="font-normal">{range.label}</RadioGroup.Label>
          </RadioGroup.Content>
        </RadioGroup.Item>
      ))}
    </RadioGroup>
  ),
  parameters: { docs: { description: { story: "Short labels read better in a row. The horizontal orientation wraps, so a narrow column will not clip an option." } } },
};

export const Cards: Story = {
  render: () => (
    <RadioGroup defaultValue="team" variant="card" className="w-[560px]">
      <RadioGroup.Legend>Plan</RadioGroup.Legend>
      {plans.map((plan) => (
        <RadioGroup.Item key={plan.value} value={plan.value}>
          <RadioGroup.Radio />
          <RadioGroup.Content>
            <RadioGroup.Label>{plan.label}</RadioGroup.Label>
            <RadioGroup.Description>{plan.description}</RadioGroup.Description>
          </RadioGroup.Content>
        </RadioGroup.Item>
      ))}
    </RadioGroup>
  ),
  parameters: {
    docs: { description: { story: "The `card` variant makes the whole tile the click target and tints the selected one. Same markup, one prop on the root." } },
  },
};

export const CardsHorizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="regional" variant="card" orientation="horizontal" className="w-[620px]">
      <RadioGroup.Legend className="w-full">Deployment region</RadioGroup.Legend>
      {[
        { value: "regional", label: "Regional", description: "One region, lowest cost." },
        { value: "multi", label: "Multi-region", description: "Failover across two regions." },
        { value: "edge", label: "Edge", description: "Runs close to every user." },
      ].map((option) => (
        <RadioGroup.Item key={option.value} value={option.value} className="basis-[180px]">
          <RadioGroup.Radio />
          <RadioGroup.Content>
            <RadioGroup.Label>{option.label}</RadioGroup.Label>
            <RadioGroup.Description>{option.description}</RadioGroup.Description>
          </RadioGroup.Content>
        </RadioGroup.Item>
      ))}
    </RadioGroup>
  ),
  parameters: { docs: { description: { story: "Cards in a row. Items grow to fill the line, so a basis class is enough to control the column count." } } },
};

export const RichOptions: Story = {
  render: () => (
    <RadioGroup defaultValue="team" variant="card" className="w-[460px]">
      <RadioGroup.Legend>Plan</RadioGroup.Legend>
      {[
        { value: "hobby", label: "Hobby", price: "$0", note: "1 project" },
        { value: "team", label: "Team", price: "$29", note: "25 seats", badge: "Popular" },
        { value: "enterprise", label: "Enterprise", price: "Custom", note: "Unlimited" },
      ].map((plan) => (
        <RadioGroup.Item key={plan.value} value={plan.value} className="items-center">
          <RadioGroup.Radio />
          <RadioGroup.Content className="flex-1">
            <span className="flex items-center gap-2">
              <RadioGroup.Label>{plan.label}</RadioGroup.Label>
              {plan.badge && (
                <Badge size="sm" variant="muted">
                  {plan.badge}
                </Badge>
              )}
            </span>
            <RadioGroup.Description>{plan.note}</RadioGroup.Description>
          </RadioGroup.Content>
          <span className="font-mono text-sm tabular-nums">{plan.price}</span>
        </RadioGroup.Item>
      ))}
    </RadioGroup>
  ),
  parameters: {
    docs: { description: { story: "Because the control is an explicit part, an option can carry a badge and a price without a new prop on the group." } },
  },
};

export const DisabledOption: Story = {
  render: () => (
    <RadioGroup defaultValue="team" className="w-[400px]">
      <RadioGroup.Legend>Plan</RadioGroup.Legend>
      {plans.map((plan) => (
        <RadioGroup.Item key={plan.value} value={plan.value} disabled={plan.value === "enterprise"}>
          <RadioGroup.Radio />
          <RadioGroup.Content>
            <RadioGroup.Label>{plan.label}</RadioGroup.Label>
            <RadioGroup.Description>{plan.value === "enterprise" ? "Contact sales to enable this plan." : plan.description}</RadioGroup.Description>
          </RadioGroup.Content>
        </RadioGroup.Item>
      ))}
    </RadioGroup>
  ),
  parameters: { docs: { description: { story: "A single option can be disabled while the rest stay usable. Say why in its description instead of leaving it dead." } } },
};

export const DisabledGroup: Story = {
  render: () => (
    <RadioGroup defaultValue="team" disabled className="w-[400px]">
      <RadioGroup.Legend>Plan</RadioGroup.Legend>
      <RadioGroup.Hint>Billing is managed by your organization owner.</RadioGroup.Hint>
      {plans.map((plan) => (
        <RadioGroup.Item key={plan.value} value={plan.value}>
          <RadioGroup.Radio />
          <RadioGroup.Content>
            <RadioGroup.Label>{plan.label}</RadioGroup.Label>
          </RadioGroup.Content>
        </RadioGroup.Item>
      ))}
    </RadioGroup>
  ),
  parameters: { docs: { description: { story: "`disabled` on the root uses the native fieldset, so every input inside it is disabled without a prop per option." } } },
};

export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = useState("team");
    return (
      <Card className="w-[460px]">
        <Card.Header divided>
          <Card.Heading>
            <Card.Title>Change plan</Card.Title>
            <Card.Description>Current selection: {value}</Card.Description>
          </Card.Heading>
        </Card.Header>
        <Card.Content>
          <RadioGroup value={value} onValueChange={setValue} variant="card">
            {plans.map((plan) => (
              <RadioGroup.Item key={plan.value} value={plan.value}>
                <RadioGroup.Radio />
                <RadioGroup.Content>
                  <RadioGroup.Label>{plan.label}</RadioGroup.Label>
                  <RadioGroup.Description>{plan.description}</RadioGroup.Description>
                </RadioGroup.Content>
              </RadioGroup.Item>
            ))}
          </RadioGroup>
        </Card.Content>
      </Card>
    );
  },
  parameters: { docs: { description: { story: "The controlled form: the parent owns the value and the group reports changes through `onValueChange`." } } },
};
