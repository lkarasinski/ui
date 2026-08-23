import type { Meta, StoryObj } from "@storybook/react-vite";
import { Markdown } from "./markdown";

const meta: Meta<typeof Markdown> = {
  title: "UI/Markdown",
  component: Markdown,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Markdown

A read-only renderer for text you did not write — issue descriptions, comments,
release notes pulled from an API. It renders at the density of the rest of the
library: 13px body, tight lists, chip-styled inline code.

Raw HTML in the source is escaped, never rendered, so a hostile description
cannot inject markup. Links open in a new tab with \`rel="noreferrer"\`.

For editing markdown, use [MarkdownEditor](/docs/ui-markdowneditor--docs) instead.

\`\`\`tsx
<Markdown text={issue.description} />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    text: { description: "Markdown source; untrusted, so raw HTML never renders.", table: { category: "Content" } },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="w-[34rem] rounded-md border border-border bg-card p-4">{children}</div>;
}

export const Default: Story = {
  render: () => (
    <Panel>
      <Markdown
        text={[
          "# Deploy checklist",
          "",
          "Rotate the tokens **before** the migration runs, then verify `GET /healthz`.",
          "",
          "## Steps",
          "",
          "1. Drain the queue",
          "2. Run the migration",
          "3. Re-enable the workers",
          "",
          "- [ ] Announced in #ops",
          "- [ ] Rollback tested",
          "",
          "> The window closes at 23:00; anything unfinished waits for tomorrow.",
          "",
          "---",
          "",
          "See the [runbook](https://example.com/runbook) for the rollback path.",
        ].join("\n")}
      />
    </Panel>
  ),
};

export const CodeBlock: Story = {
  render: () => (
    <Panel>
      <Markdown
        text={[
          "The failing check runs:",
          "",
          "```sh",
          "bun run test --filter item-table --reporter verbose",
          "```",
          "",
          "It exits `1` when the fixture is stale.",
        ].join("\n")}
      />
    </Panel>
  ),
};

export const RawHtmlIsEscaped: Story = {
  parameters: {
    docs: {
      description: { story: "Markup from an untrusted source is shown as text instead of being rendered." },
    },
  },
  render: () => (
    <Panel>
      <Markdown text={'<img src=x onerror="alert(1)"> <b>not bold</b> — the source is untrusted, so this stays text.'} />
    </Panel>
  ),
};

export const Image: Story = {
  render: () => (
    <Panel>
      <Markdown
        text={"Screenshot from the report:\n\n![Chart of weekly runs](https://placehold.co/480x180/f1ece3/24201d?text=weekly+runs)"}
      />
    </Panel>
  ),
};

export const Empty: Story = {
  parameters: {
    docs: { description: { story: "Empty source renders nothing, so a consumer can hand it a missing description as-is." } },
  },
  render: () => (
    <Panel>
      <Markdown text="" />
    </Panel>
  ),
};
