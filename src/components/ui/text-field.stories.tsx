import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField } from "./text-field";

const meta: Meta<typeof TextField> = {
  title: "UI/TextField",
  component: TextField,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### TextField

A labelled single-line input: label, optional helper text, optional inline error, all wired
to the input through \`aria-describedby\` / \`aria-invalid\`.

Use it for form fields that own their label — connection forms, settings rows, onboarding
steps. For bare inputs composed into custom field layouts, use [Input](#ui-input) instead.

**Errors replace descriptions.** When \`error\` is set, the input turns destructive and the
error message takes over the \`aria-describedby\` slot; both never render at once.

\`\`\`tsx
<TextField label="Workspace URL" description="Where your data lives." required />
<TextField label="API key" type="password" labelSuffix="Optional" />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    label: { description: "Visible field label, bound to the input via `htmlFor`.", table: { category: "Content" } },
    description: { description: "Helper text rendered between label and input.", table: { category: "Content" } },
    error: { description: "Validation message; switches the input to the destructive look.", table: { category: "State" } },
    labelSuffix: { description: "Small uppercase annotation at the end of the label line, e.g. `Optional`.", table: { category: "Content" } },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Workspace URL",
    placeholder: "https://example.com",
  },
};

export const WithDescription: Story = {
  args: {
    label: "Workspace URL",
    description: "The base address of your workspace instance.",
    placeholder: "https://example.com",
  },
};

export const Optional: Story = {
  args: {
    label: "Secondary URL",
    labelSuffix: "Optional",
    placeholder: "https://secondary.example.com",
  },
};

export const Error: Story = {
  args: {
    label: "API key",
    error: "API key is required",
  },
};

export const Password: Story = {
  args: {
    label: "API key",
    type: "password",
    placeholder: "••••••••",
  },
};

export const Disabled: Story = {
  args: {
    label: "Workspace URL",
    value: "https://example.com",
    disabled: true,
  },
};
