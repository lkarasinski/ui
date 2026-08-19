import type { Meta, StoryObj } from "@storybook/react-vite";
import { AtSign, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  args: { placeholder: "Workspace name" },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Input

Input is the styled single-line text field primitive. It forwards native HTML input props, including \`type\`, \`name\`, \`value\`, \`required\`, \`disabled\`, and \`aria-*\` attributes.

The component does not render a label, hint, or validation message. Compose those pieces in the surrounding form so the label and message can be connected with \`htmlFor\` and \`aria-describedby\`.

For icons or clearing, use the compound API. \`Input.Root\` owns the value, \`Input.Field\` renders the native field, and \`Input.Icon\` can be placed on either side.

Use \`Input.Label\` with \`htmlFor\` to keep the label composable. It does not know anything about form state, so it can be used with TanStack Form or a native form.

#### Examples

\`\`\`tsx
<label htmlFor="workspace-name">Workspace name</label>
<Input id="workspace-name" name="workspaceName" placeholder="Acme Inc." />

<Input
  id="email"
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error">Enter a valid email address.</p>
\`\`\`

Use \`readOnly\` when the value is visible but should not be edited. Use \`disabled\` only when the field is unavailable; disabled values are not submitted with a form.
`,
      },
    },
  },
  argTypes: {
    type: {
      description: "Native input type.",
      control: "select",
      options: ["text", "email", "number", "password", "search", "tel", "url"],
      table: { category: "Input", defaultValue: { summary: "text" } },
    },
    placeholder: {
      description: "Short example of the expected value. Do not use it as the field label.",
      control: "text",
      table: { category: "Input" },
    },
    value: {
      description: "Current value. Use a story render function for a fully controlled interactive input.",
      control: "text",
      table: { category: "Input" },
    },
    disabled: {
      description: "Prevents editing and excludes the value from native form submission.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    readOnly: {
      description: "Keeps the value visible while preventing edits. Unlike disabled, the value can still be submitted.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    required: {
      description: "Marks the field as required for native form validation.",
      control: "boolean",
      table: { category: "Validation", defaultValue: { summary: "false" } },
    },
    "aria-invalid": {
      description: "Communicates that the current value is invalid. Pair it with a visible message and `aria-describedby`.",
      control: "boolean",
      mapping: { true: "true", false: undefined },
      table: { category: "Validation" },
    },
    "aria-describedby": {
      description: "ID of the hint or validation message associated with the input.",
      control: "text",
      table: { category: "Accessibility" },
    },
    onChange: {
      description: "Called when the value changes.",
      control: false,
      table: { category: "Events" },
    },
    className: {
      description: "Additional Tailwind classes merged with the input styles.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  parameters: {
    docs: { description: { story: "The basic text input. Add a label in the consuming form." } },
  },
};

export const Filled: Story = {
  args: { value: "Acme Inc.", readOnly: true },
  parameters: {
    docs: { description: { story: "A populated input. This story is read-only so the example value remains stable in Storybook." } },
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: "Acme Inc." },
  parameters: {
    docs: { description: { story: "Use disabled when the field is unavailable. Disabled values are not included in native form submission." } },
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, value: "Generated identifier" },
  parameters: {
    docs: { description: { story: "Use readOnly when the value should remain part of the form but must not be edited." } },
  },
};

export const Required: Story = {
  args: { required: true, placeholder: "Required workspace name" },
  parameters: {
    docs: { description: { story: "The required attribute participates in native browser validation. The surrounding form should still render a visible required-field cue." } },
  },
};

export const Invalid: Story = {
  args: { value: "not-an-email", readOnly: true, type: "email", "aria-invalid": true, "aria-describedby": "email-error" },
  render: (args) => (
    <div className="flex w-full max-w-sm flex-col gap-1.5">
      <Input {...args} />
      <p id="email-error" className="text-sm text-destructive-foreground">
        Enter a valid email address.
      </p>
    </div>
  ),
  parameters: {
    docs: { description: { story: "The input exposes an invalid state through aria-invalid. Render the explanation separately and connect it with aria-describedby." } },
  },
};

export const Interactive: Story = {
  args: { placeholder: "Type here" },
  render: function Render(args) {
    const [value, setValue] = useState("");
    return <Input {...args} value={value} onChange={(event) => setValue(event.target.value)} />;
  },
  parameters: {
    docs: { description: { story: "A controlled input example. The parent owns the value and updates it from onChange." } },
  },
};

export const IconLeft: Story = {
  render: () => (
    <Input.Root>
      <Input.Icon>
        <Search />
      </Input.Icon>
      <Input.Field placeholder="Search workspaces" />
    </Input.Root>
  ),
  parameters: {
    docs: { description: { story: "Place Input.Icon before the field content for search, location, or other leading context." } },
  },
};

export const IconRight: Story = {
  render: () => (
    <Input.Root>
      <Input.Field placeholder="name@example.com" type="email" />
      <Input.Icon side="right">
        <AtSign />
      </Input.Icon>
    </Input.Root>
  ),
  parameters: {
    docs: { description: { story: "Place Input.Icon on the right for trailing context, such as a unit or input type hint." } },
  },
};

export const Clearable: Story = {
  render: function Render() {
    const [value, setValue] = useState("Acme Inc.");
    return (
      <Input.Root value={value} onValueChange={setValue} clearable>
        <Input.Field aria-label="Workspace name" />
      </Input.Root>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Set clearable on Input.Root to show an accessible X button while the field has a value. The root clears both controlled and uncontrolled values through onValueChange.",
      },
    },
  },
};

export const ClearableWithIcons: Story = {
  render: function Render() {
    const [value, setValue] = useState("Search term");
    return (
      <Input.Root value={value} onValueChange={setValue} clearable>
        <Input.Icon>
          <Search />
        </Input.Icon>
        <Input.Field aria-label="Search" />
      </Input.Root>
    );
  },
  parameters: {
    docs: { description: { story: "The clear button reserves space next to a trailing icon and keeps the field content from being covered." } },
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-1.5">
      <Input.Label htmlFor="workspace-name">Workspace name</Input.Label>
      <Input.Root>
        <Input.Field id="workspace-name" name="workspaceName" placeholder="Acme Inc." />
      </Input.Root>
    </div>
  ),
  parameters: {
    docs: { description: { story: "Input.Label stays independent from the field state. Connect it to Input.Field through the native htmlFor and id attributes." } },
  },
};

export const WithLabelAndIcon: Story = {
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-1.5">
      <Input.Label htmlFor="workspace-search">Search workspaces</Input.Label>
      <Input.Root>
        <Input.Icon>
          <Search />
        </Input.Icon>
        <Input.Field id="workspace-search" name="query" placeholder="Search" />
      </Input.Root>
    </div>
  ),
  parameters: {
    docs: { description: { story: "Labels compose with the icon slots without changing the input API or owning its value." } },
  },
};
