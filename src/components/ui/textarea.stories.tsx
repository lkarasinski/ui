import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  args: { placeholder: "Describe what changed…" },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Textarea

Textarea is the multi-line counterpart to Input. On its own it is a styled \`textarea\` that forwards
every native prop, including \`rows\`, \`maxLength\`, \`required\`, and \`aria-*\`.

\`Textarea.Root\` owns the value, which is what lets the counter read the length without the form
passing it down:

\`\`\`tsx
<Textarea.Root maxLength={280} onValueChange={setBio}>
  <Textarea.Label>Bio</Textarea.Label>
  <Textarea.Field rows={4} />
  <Textarea.Footer>
    <Textarea.Hint>Shown on your public profile.</Textarea.Hint>
    <Textarea.Counter />
  </Textarea.Footer>
</Textarea.Root>
\`\`\`

\`autoSize\` grows the field with its content through CSS \`field-sizing\`, with no measuring and no
effect. Pair it with a \`max-h-*\` class so a pasted stack trace cannot push the submit button off
screen. Where \`field-sizing\` is unsupported the field falls back to its \`rows\` height and scrolls.
`,
      },
    },
  },
  argTypes: {
    rows: {
      description: "Initial visible height in lines. The field is still resizable unless `autoSize` is set.",
      control: { type: "number", min: 2, max: 12 },
      table: { category: "Layout" },
    },
    autoSize: {
      description: "Grows with the content instead of scrolling. Cap it with a `max-h-*` class.",
      control: "boolean",
      table: { category: "Layout", defaultValue: { summary: "false" } },
    },
    placeholder: {
      description: "Short example of the expected content. Not a substitute for a label.",
      control: "text",
      table: { category: "Input" },
    },
    maxLength: {
      description: "Native length limit. On `Textarea.Root` it also enables the counter.",
      control: "number",
      table: { category: "Validation" },
    },
    disabled: {
      description: "Prevents editing and excludes the value from form submission.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    readOnly: {
      description: "Keeps the value visible and submittable while preventing edits.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    "aria-invalid": {
      description: "Marks the current value as invalid. Pair it with a visible message.",
      control: "boolean",
      mapping: { true: "true", false: undefined },
      table: { category: "Validation" },
    },
    className: {
      description: "Additional Tailwind classes merged with the field styles.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: (args) => <Textarea {...args} className="w-[420px]" />,
  parameters: { docs: { description: { story: "The bare field. Add a label in the surrounding form, or use `Textarea.Root`." } } },
};

export const Rows: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-3">
      <Textarea rows={2} placeholder="rows=2" />
      <Textarea rows={4} placeholder="rows=4" />
      <Textarea rows={8} placeholder="rows=8" />
    </div>
  ),
  parameters: { docs: { description: { story: "Height is set in lines. Pick the height from the expected answer — a commit message is not a changelog." } } },
};

export const AutoSize: Story = {
  render: function Render() {
    const [value, setValue] = useState("Type a few lines.\nThe field grows with the content and stops at max-h-48.");
    return (
      <Textarea
        autoSize
        className="max-h-48 w-[420px]"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Auto-sizing notes"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: "`autoSize` uses CSS `field-sizing`, so there is no measuring, no ref, and no effect. The `max-h-48` cap keeps a long paste from taking over the page.",
      },
    },
  },
};

export const Disabled: Story = {
  render: () => <Textarea disabled className="w-[420px]" defaultValue="Generated from the deployment log." />,
  parameters: { docs: { description: { story: "Disabled values are not submitted. Use it only when the field is unavailable." } } },
};

export const ReadOnly: Story = {
  render: () => (
    <Textarea readOnly rows={4} className="w-[420px] font-mono" defaultValue={"POST /v1/deployments 201\nPOST /v1/deployments 500\nGET  /v1/health 200"} />
  ),
  parameters: { docs: { description: { story: "Read-only keeps the value selectable and submittable. The mono class is a per-use decision, not a variant." } } },
};

export const Invalid: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-1.5">
      <Textarea aria-invalid aria-describedby="reason-error" rows={3} defaultValue="tl;dr" className="border-destructive/70" />
      <p id="reason-error" className="m-0 text-sm text-destructive-foreground">
        Give at least 20 characters so the reviewer has context.
      </p>
    </div>
  ),
  parameters: { docs: { description: { story: "There is no invalid variant. Mark the field with `aria-invalid`, tint the border, and render the message next to it." } } },
};

export const WithLabelAndHint: Story = {
  render: () => (
    <Textarea.Root className="w-[420px]">
      <Textarea.Label>Release notes</Textarea.Label>
      <Textarea.Field rows={4} placeholder="What changed in this release?" />
      <Textarea.Hint>Markdown is supported. Keep the first line short — it becomes the release title.</Textarea.Hint>
    </Textarea.Root>
  ),
  parameters: { docs: { description: { story: "The root generates the id wiring, so the label and hint connect themselves to the field." } } },
};

export const WithCounter: Story = {
  render: function Render() {
    const [value, setValue] = useState("Ships the new badge and card surfaces.");
    return (
      <Textarea.Root maxLength={140} value={value} onValueChange={setValue} className="w-[420px]">
        <Textarea.Label>Summary</Textarea.Label>
        <Textarea.Field rows={3} />
        <Textarea.Footer>
          <Textarea.Hint>Shown in the changelog list.</Textarea.Hint>
          <Textarea.Counter />
        </Textarea.Footer>
      </Textarea.Root>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "The counter reads the length from the root. Type past 120 characters and it turns destructive — the limit becomes visible before it is hit, not after.",
      },
    },
  },
};

export const Uncontrolled: Story = {
  render: () => (
    <Textarea.Root defaultValue="Draft saved locally." maxLength={200} className="w-[420px]">
      <Textarea.Label>Notes</Textarea.Label>
      <Textarea.Field rows={3} />
      <Textarea.Footer>
        <Textarea.Hint>Only visible to you.</Textarea.Hint>
        <Textarea.Counter />
      </Textarea.Footer>
    </Textarea.Root>
  ),
  parameters: { docs: { description: { story: "The same composition without a controlled value. The root keeps the state, and the counter still works." } } },
};

export const InForm: Story = {
  render: function Render() {
    const [value, setValue] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const tooShort = value.trim().length > 0 && value.trim().length < 20;

    return (
      <Card className="w-[460px]">
        <Card.Header divided>
          <Card.Heading>
            <Card.Title>Request access</Card.Title>
            <Card.Description>An admin reviews every request.</Card.Description>
          </Card.Heading>
        </Card.Header>
        <Card.Content>
          <Textarea.Root value={value} onValueChange={setValue} maxLength={280}>
            <Textarea.Label>Why do you need access?</Textarea.Label>
            <Textarea.Field autoSize rows={3} className="max-h-40" aria-invalid={tooShort || undefined} placeholder="I am joining the payments team and need to read deployment logs." />
            <Textarea.Footer>
              <Textarea.Hint className={tooShort ? "text-destructive-foreground" : undefined}>
                {tooShort ? "Give at least 20 characters." : "Mention the team and what you will do."}
              </Textarea.Hint>
              <Textarea.Counter />
            </Textarea.Footer>
          </Textarea.Root>
        </Card.Content>
        <Card.Footer>
          <div className="w-32">
            <Button
              disabled={submitting || value.trim().length < 20}
              onClick={() => {
                setSubmitting(true);
                window.setTimeout(() => setSubmitting(false), 900);
              }}
            >
              {submitting ? "Sending…" : "Send request"}
            </Button>
          </div>
        </Card.Footer>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Everything together: auto-sizing with a cap, a hint that becomes the error, a counter, and a submit button that reports its own pending state.",
      },
    },
  },
};
