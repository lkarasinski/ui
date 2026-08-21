import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd, isApplePlatform } from "./kbd";

const meta: Meta<typeof Kbd> = {
  title: "UI/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Kbd

A keyboard key, or a chord of them. It exists so a shortcut hint looks the same in a menu, a
tooltip, a footer, and a command palette row.

\`\`\`tsx
<Kbd keys="mod+k" />
<Kbd keys={["g", "h"]} separator="then" />
<Kbd>⏎</Kbd>
\`\`\`

**\`mod\` is the point.** It renders \`⌘\` on Apple hardware and \`Ctrl\` everywhere else, so the same
string is correct on both and no call site branches on the platform. \`ctrl\`, \`alt\`, \`shift\`,
\`enter\`, \`esc\`, \`backspace\`, and the arrows all have glyphs too.

**Spoken, not spelled.** A chord carries one \`aria-label\` — "Command K" — because a screen reader
has nothing useful to say about \`⌘\`. The individual chips are hidden from the accessibility tree.

**It is a hint, not a control.** Nothing here is focusable or clickable; bind the actual key
where the action lives.
        `,
      },
    },
  },
  argTypes: {
    keys: {
      description: "A shortcut to render as chips. `\"mod+k\"`, `\"shift+enter\"`, or `[\"g\", \"h\"]` for a sequence.",
      control: "text",
      table: { category: "Content" },
    },
    separator: {
      description: "Shown between chips. `then` reads better than `+` for a two-stroke sequence.",
      control: "text",
      table: { category: "Content" },
    },
    size: {
      description: "`sm` inside a dense list or a footer, `md` next to body text.",
      control: "inline-radio",
      options: ["sm", "md"],
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    className: {
      description: "Additional Tailwind classes merged with the chip.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Default: Story = {
  args: { keys: "mod+k" },
  parameters: {
    docs: {
      description: {
        story: `Rendered on this machine, \`mod\` resolved to \`${isApplePlatform ? "⌘" : "Ctrl"}\`.`,
      },
    },
  },
};

export const Modifiers: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-sm">
      {(
        [
          ["mod+k", "Open the command palette"],
          ["mod+shift+p", "Run a command"],
          ["alt+enter", "Open in a new pane"],
          ["shift+tab", "Focus the previous field"],
        ] as const
      ).map(([keys, meaning]) => (
        <div key={keys} className="flex items-center gap-3">
          <Kbd keys={keys} />
          <span className="text-muted-foreground">{meaning}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "Modifiers resolve per platform. Each chord is one chip group with a single spoken name." } } },
};

export const NamedKeys: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {["enter", "esc", "backspace", "tab", "space", "up", "down", "left", "right"].map((key) => (
        <Kbd key={key} keys={key} />
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "Named keys get their glyph and a readable name, so `↵` is announced as “Enter”." } } },
};

export const Sequence: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-3">
        <Kbd keys={["g", "h"]} separator="then" />
        <span className="text-muted-foreground">Go home</span>
      </div>
      <div className="flex items-center gap-3">
        <Kbd keys={["g", "p"]} separator="then" />
        <span className="text-muted-foreground">Go to projects</span>
      </div>
    </div>
  ),
  parameters: { docs: { description: { story: "A two-stroke sequence. `separator` labels the gap so it does not read as a chord." } } },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(["sm", "md"] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Kbd keys="mod+k" size={size} />
          <code className="font-mono text-xs text-muted-foreground">{size}</code>
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "`sm` for dense rows and footers, `md` when the chip sits beside body text." } } },
};

export const Raw: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Kbd>⏎</Kbd>
      <Kbd>F5</Kbd>
      <Kbd>Fn</Kbd>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Without `keys`, the chip renders exactly what it is given — for keys the glyph table does not know about.",
      },
    },
  },
};
