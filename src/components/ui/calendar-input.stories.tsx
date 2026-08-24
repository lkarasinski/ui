import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CalendarInput, type CalendarInputRangeProps, type CalendarInputSingleProps } from "./calendar-input";
import { Input } from "./input";

const meta: Meta<typeof CalendarInput> = {
  title: "UI/Calendar Input",
  component: CalendarInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Calendar Input

The all-in-one date field: a trigger styled like an input opens a **popover holding the Calendar**, so picking a date never leaves the form. The selection API matches \`Calendar\` exactly — same modes, same value shapes, same props (\`locale\`, \`weekStartsOn\`, \`isDateDisabled\`) — which makes the two interchangeable.

#### Modes

| Prop | Value shape |
| --- | --- |
| \`mode="single"\` (default) | \`Date\` |
| \`mode="range"\` | \`{ from, to }\`, \`to\` undefined mid-pick |

#### Open and close behavior

- Single mode closes as soon as a day is picked.
- Range mode stays open between the two clicks and closes when the range completes.
- Escape and outside clicks close without losing what is already selected.
- The panel flips and shifts to stay in the viewport; alignment follows \`align\`.

#### Forms

Pass \`name\` to render a hidden input that submits with the surrounding form. A single date serializes as a local ISO day (\`2026-08-24\`); a range as both ends joined by \`/\` (\`2026-08-01/2026-08-05\`). Labels connect through the native pair:

\`\`\`tsx
<label htmlFor="start">Start date</label>
<CalendarInput id="start" name="startDate" clearable />
\`\`\`

#### Composition

For full control of the surface — inline pickers, custom panels, your own trigger design — use the \`Calendar\` component directly. This block exists for the common case where the answer is simply "input, then popover".
`,
      },
    },
  },
  argTypes: {
    mode: {
      description: "Selection model, mirroring Calendar.",
      control: "radio",
      options: ["single", "range"],
      table: { category: "Selection", defaultValue: { summary: "single" } },
    },
    value: {
      description: "Controlled selection.",
      control: false,
      table: { category: "Selection" },
    },
    defaultValue: {
      description: "Initial uncontrolled selection.",
      control: false,
      table: { category: "Selection" },
    },
    onValueChange: {
      description: "Called with the new selection after each pick.",
      control: false,
      table: { category: "Selection" },
    },
    placeholder: {
      description: "Trigger text while nothing is selected.",
      control: "text",
      table: { category: "Field", defaultValue: { summary: "—" } },
    },
    clearable: {
      description: "Shows a clear action while a value is set; focus returns to the trigger afterwards.",
      control: "boolean",
      table: { category: "Field", defaultValue: { summary: "false" } },
    },
    name: {
      description: "Hidden-input name for form submission. Single dates serialize as local ISO days, ranges as `from/to`.",
      control: "text",
      table: { category: "Form" },
    },
    id: {
      description: "Id of the trigger button, for `<label htmlFor>`.",
      control: "text",
      table: { category: "Form" },
    },
    disabled: {
      description: "Disables opening and clearing.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    isDateDisabled: {
      description: "Predicate marking dates as unselectable inside the popover.",
      control: false,
      table: { category: "Rules" },
    },
    locale: {
      description: "BCP 47 tag for Intl formatting of the trigger text and calendar labels.",
      control: "text",
      table: { category: "Localization" },
    },
    weekStartsOn: {
      description: "First day of the week inside the calendar.",
      control: "radio",
      options: [0, 1],
      table: { category: "Layout", defaultValue: { summary: "0" } },
    },
    defaultMonth: {
      description: "Month shown on open when no value is selected.",
      control: false,
      table: { category: "Navigation" },
    },
    align: {
      description: "Panel alignment against the trigger.",
      control: "radio",
      options: ["start", "center", "end"],
      table: { category: "Positioning", defaultValue: { summary: "start" } },
    },
    className: {
      description: "Classes merged onto the trigger wrapper.",
      control: "text",
      table: { category: "Styling" },
    },
    contentClassName: {
      description: "Classes merged onto the floating panel.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarInput>;

const formatLong = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export const Default: Story = {
  args: {
    placeholder: "Pick a date",
    clearable: true,
  } satisfies Partial<CalendarInputSingleProps>,
  parameters: {
    docs: { description: { story: "Single-date mode. Click the field or press Enter to open, pick a day, done. Clearable adds an accessible reset beside the chevron." } },
  },
};

export const PresetValue: Story = {
  name: "Preset value",
  args: {
    defaultValue: new Date(),
    clearable: true,
  } satisfies Partial<CalendarInputSingleProps>,
  parameters: {
    docs: { description: { story: "Opens showing the formatted preset; the calendar lands on its month." } },
  },
};

export const RangeMode: Story = {
  name: "Range mode",
  args: {
    mode: "range",
    placeholder: "Check-in – Check-out",
    clearable: true,
  } satisfies Partial<CalendarInputRangeProps>,
  parameters: {
    docs: {
      description: {
        story:
          "From–to picking in one calendar. The field stays open between the two clicks and shows the half-open range as soon as the start is set; it closes when the range completes. Clicking an earlier day restarts the pick.",
      },
    },
  },
};

export const Controlled: Story = {
  render: function Render() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <div className="flex w-72 flex-col gap-2">
        <Input.Label htmlFor="deadline">Deadline</Input.Label>
        <CalendarInput id="deadline" value={date} onValueChange={setDate} clearable />
        <p className="text-sm text-muted-foreground">
          Value:{" "}
          <span className="font-medium text-card-foreground" data-testid="controlled-value">
            {date ? formatLong.format(date) : "none"}
          </span>
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: { story: "A controlled field: the parent owns the Date and reacts to every pick, including clears (undefined)." },
    },
  },
};

export const DisabledDates: Story = {
  args: {
    placeholder: "Weekdays only, no past dates",
    isDateDisabled: (date) => date.getDay() === 0 || date.getDay() === 6 || date < new Date(),
    defaultMonth: new Date(),
  } satisfies Partial<CalendarInputSingleProps>,
  parameters: {
    docs: {
      description: { story: "The predicate applies inside the popover exactly as on a bare Calendar: dimmed days cannot be picked and keyboard moves step over them." },
    },
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: new Date(),
    disabled: true,
  } satisfies Partial<CalendarInputSingleProps>,
  parameters: {
    docs: { description: { story: "A locked field: neither the popover nor the clear action respond." } },
  },
};

export const InForm: Story = {
  name: "In a form",
  args: {
    id: "window-starts",
    name: "windowStarts",
    placeholder: "Select a date",
    clearable: true,
  } satisfies Partial<CalendarInputSingleProps>,
  parameters: {
    docs: {
      description: {
        story:
          "With name set, a hidden input joins the nearest form and submits the selection as `windowStarts=2026-08-24`. Connect the visible label through htmlFor/id — the trigger is a real button, so Enter opens it from the keyboard.",
      },
    },
  },
};
