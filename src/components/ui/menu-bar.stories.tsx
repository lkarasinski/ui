import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  MarkdownEditorDefaultMenuBar,
  MarkdownEditor,
  MarkdownEditorBlockquote,
  MarkdownEditorBold,
  MarkdownEditorBulletList,
  MarkdownEditorCode,
  MarkdownEditorContent,
  MarkdownEditorHeading,
  MarkdownEditorItalic,
  MarkdownEditorMenuSeparator,
  MarkdownEditorMenuBar,
  MarkdownEditorOrderedList,
  MarkdownEditorRedo,
  MarkdownEditorStrike,
  MarkdownEditorUndo,
} from "./markdown-editor";

const meta: Meta = {
  title: "UI/MenuBar",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### MarkdownEditorMenuBar

The menu bar is its own component — a \`toolbar\` row that hosts the toggle components. It renders
nothing on its own; compose the toggles you need and order them freely. Use
\`MarkdownEditorMenuSeparator\` between groups.

Every toggle reads the editor from \`MarkdownEditor\` context, tracks its own active state,
and disables itself when the command cannot run or the editor is read-only.
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Full: Story = {
  render: () => (
    <MarkdownEditor className="w-[560px]">
      <MarkdownEditorMenuBar>
        <MarkdownEditorUndo />
        <MarkdownEditorRedo />
        <MarkdownEditorMenuSeparator />
        <MarkdownEditorHeading level={1} />
        <MarkdownEditorHeading level={2} />
        <MarkdownEditorHeading level={3} />
        <MarkdownEditorMenuSeparator />
        <MarkdownEditorBold />
        <MarkdownEditorItalic />
        <MarkdownEditorStrike />
        <MarkdownEditorCode />
        <MarkdownEditorMenuSeparator />
        <MarkdownEditorBulletList />
        <MarkdownEditorOrderedList />
        <MarkdownEditorBlockquote />
      </MarkdownEditorMenuBar>
      <MarkdownEditorContent />
    </MarkdownEditor>
  ),
  parameters: { docs: { description: { story: "The full set, grouped with separators: history, headings, inline marks, then block types." } } },
};

export const DefaultMenuBar: Story = {
  render: () => (
    <MarkdownEditor className="w-[560px]">
      <MarkdownEditorDefaultMenuBar />
      <MarkdownEditorContent />
    </MarkdownEditor>
  ),
  parameters: { docs: { description: { story: "`DefaultMenuBar` is the same composition as `Full`, packaged for when the surface does not need a custom set." } } },
};

export const InlineMarksOnly: Story = {
  render: () => (
    <MarkdownEditor className="w-[420px]">
      <MarkdownEditorMenuBar>
        <MarkdownEditorBold />
        <MarkdownEditorItalic />
        <MarkdownEditorCode />
      </MarkdownEditorMenuBar>
      <MarkdownEditorContent className="min-h-20" />
    </MarkdownEditor>
  ),
  parameters: { docs: { description: { story: "A short-form surface keeps only inline marks. Toggles are independent pieces, so there is no variant flag to fight." } } },
};
