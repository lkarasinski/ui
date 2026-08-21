import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "./button";
import { Card } from "./card";
import {
  MarkdownEditorDefaultMenuBar as DefaultMenuBar,
  MarkdownEditor,
  MarkdownEditorBlockquote,
  MarkdownEditorBold,
  MarkdownEditorBulletList,
  MarkdownEditorCode,
  MarkdownEditorContent,
  MarkdownEditorItalic,
  MarkdownEditorMenuSeparator,
  MarkdownEditorMenuBar,
} from "./markdown-editor";

const sampleDocument = `# Release notes

Ships the **new editor** and a *faster* table.

## Fixes

- Editor no longer loses focus after save
- Table rows keep their height while loading

> Markdown in, markdown out. The value is plain text you can store anywhere.

\`\`\`ts
const notes = await updateReleaseNotes({ body: markdown });
\`\`\`
`;

const meta: Meta<typeof MarkdownEditor> = {
  title: "UI/MarkdownEditor",
  component: MarkdownEditor,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### MarkdownEditor

A rich text editor built on TipTap that reads and writes **markdown**. The value is a plain
markdown string — store it like any other text field.

The root owns the TipTap instance and the value (controlled through \`value\`, uncontrolled
through \`defaultValue\`). Everything else is composed inside it:

\`\`\`tsx
<MarkdownEditor defaultValue={draft} onValueChange={setDraft}>
  <MarkdownEditorMenuBar>
    <MarkdownEditorUndo />
    <MarkdownEditorRedo />
    <MarkdownEditorMenuSeparator />
    <MarkdownEditorBold />
    <MarkdownEditorItalic />
  </MarkdownEditorMenuBar>
  <MarkdownEditorContent />
</MarkdownEditor>
\`\`\`

Pick toggles per surface — a comment box may only need bold and lists, while a document
editor takes the full bar. \`DefaultMenuBar\` is the common set if you do not
want to compose your own.
`,
      },
    },
  },
  argTypes: {
    value: {
      description: "Markdown value when controlled. Omit it for uncontrolled use.",
      control: "text",
      table: { category: "Value" },
    },
    defaultValue: {
      description: "Initial markdown when uncontrolled.",
      control: "text",
      table: { category: "Value" },
    },
    onValueChange: {
      description: "Called with the markdown serialization after every edit.",
      table: { category: "Value" },
    },
    editable: {
      description: "When false the content cannot be edited.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "true" } },
    },
    className: {
      description: "Additional Tailwind classes merged with the frame styles.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MarkdownEditor>;

export const Default: Story = {
  render: () => (
    <MarkdownEditor className="w-[560px]">
      <DefaultMenuBar />
      <MarkdownEditorContent />
    </MarkdownEditor>
  ),
  parameters: { docs: { description: { story: "The default menu bar over an empty document. Type `# `, `- `, or `> ` at the start of a line to see the markdown shortcuts." } } },
};

export const WithInitialContent: Story = {
  render: () => (
    <MarkdownEditor defaultValue={sampleDocument} className="w-[560px]">
      <DefaultMenuBar />
      <MarkdownEditorContent />
    </MarkdownEditor>
  ),
  parameters: { docs: { description: { story: "Headings, lists, quotes, inline code, and fenced blocks round-trip through the markdown serialization." } } },
};

export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = useState(sampleDocument);
    return (
      <div className="flex w-[720px] flex-col gap-3">
        <MarkdownEditor value={value} onValueChange={setValue}>
          <DefaultMenuBar />
          <MarkdownEditorContent />
        </MarkdownEditor>
        <pre className="max-h-40 overflow-auto rounded-md border border-input bg-muted p-2.5 font-mono text-xs whitespace-pre-wrap">
          {value}
        </pre>
      </div>
    );
  },
  parameters: { docs: { description: { story: "Controlled use: every edit emits markdown, and the consumer owns the value. The panel below shows exactly what would be stored." } } },
};

export const ReadOnly: Story = {
  render: () => (
    <MarkdownEditor defaultValue={sampleDocument} editable={false} className="w-[560px]">
      <DefaultMenuBar />
      <MarkdownEditorContent />
    </MarkdownEditor>
  ),
  parameters: { docs: { description: { story: "`editable={false}` keeps the document readable and selectable. Toggles render disabled because no command can run." } } },
};

export const MinimalCommentBox: Story = {
  render: function Render() {
    const [value, setValue] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const empty = value.trim().length === 0;

    return (
      <Card className="w-[460px]">
        <Card.Header divided>
          <Card.Heading>
            <Card.Title>Add comment</Card.Title>
            <Card.Description>Markdown is supported.</Card.Description>
          </Card.Heading>
        </Card.Header>
        <Card.Content>
          <MarkdownEditor value={value} onValueChange={setValue}>
            <MarkdownEditorMenuBar>
              <MarkdownEditorBold />
              <MarkdownEditorItalic />
              <MarkdownEditorCode />
              <MarkdownEditorMenuSeparator />
              <MarkdownEditorBulletList />
              <MarkdownEditorBlockquote />
            </MarkdownEditorMenuBar>
            <MarkdownEditorContent className="min-h-20" />
          </MarkdownEditor>
        </Card.Content>
        <Card.Footer>
          <div className="w-32">
            <Button
              disabled={empty || submitting}
              onClick={() => {
                setSubmitting(true);
                window.setTimeout(() => setSubmitting(false), 900);
              }}
            >
              {submitting ? "Posting…" : "Comment"}
            </Button>
          </div>
        </Card.Footer>
      </Card>
    );
  },
  parameters: { docs: { description: { story: "A comment box composes only the toggles it needs. The submit button reports its own pending state and cannot fire twice." } } },
};
