import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Calendar, type CalendarRange } from "./calendar";
import { Input } from "./input";
import { Card } from "./card";

const meta: Meta<typeof Calendar> = {
  title: "UI/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Calendar

Calendar is a month grid for picking a single date or a **from–to range inside one calendar**. It is hand-rolled on plain \`Date\` values — no date library — and formats through \`Intl.DateTimeFormat\`, so month titles, weekday names, and cell labels follow the locale automatically.

The root owns the selection and the visible month. Both work controlled or uncontrolled:

| Concern | Uncontrolled | Controlled |
| --- | --- | --- |
| Selection | \`defaultValue\` | \`value\` + \`onValueChange\` |
| Visible month | \`defaultMonth\` | \`month\` + \`onMonthChange\` |

The value shape depends on \`mode\`: a single \`Date\`, or a \`{ from, to }\` range where \`to\` is undefined while a pick is in flight. Treat a half-open range as "the user is still picking", not as an error.

#### Composition

The root renders nothing by itself. Compose the parts so the surrounding surface stays yours:

\`\`\`tsx
<Calendar.Root mode="range">
  <Calendar.Header>
    <Calendar.Previous />
    <Calendar.Title />
    <Calendar.Next />
  </Calendar.Header>
  <Calendar.Grid />
</Calendar.Root>
\`\`\`

Wrap it in a \`Card\`, embed it in your own popover or dialog, or put an \`Input\` above it to show the formatted result — see the *With input* story.

#### Range behavior

1. First click sets \`from\`; the band under the pointer previews the range live.
2. Second click completes it.
3. Clicking an earlier date restarts the range instead of producing an inverted one, so a mis-pick never needs a reset button.

#### Keyboard

One cell is in the tab order (the selected day, today, or the first allowed day). From there:

| Key | Result |
| --- | --- |
| Arrow keys | Move focus by day / by week |
| Home, End | First / last day of the week |
| PageUp, PageDown | Previous / next month |
| Shift + PageUp/PageDown | Previous / next year |
| Enter, Space | Select the focused day |

Disabled dates are skipped by keyboard moves, and clicking a day from an adjacent month selects it and follows it into view.

#### Disabling dates

Pass a predicate — weekends, past dates, booked ranges:

\`\`\`tsx
<Calendar.Root mode="range" isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6}>
  <Calendar.Header>
    <Calendar.Previous />
    <Calendar.Title />
    <Calendar.Next />
  </Calendar.Header>
  <Calendar.Grid />
</Calendar.Root>
\`\`\`
`,
      },
    },
  },
  argTypes: {
    mode: {
      description: "Selection model. `single` picks one date; `range` picks a from–to pair in one grid.",
      control: "radio",
      options: ["single", "range"],
      table: { category: "Selection", defaultValue: { summary: "single" } },
    },
    value: {
      description: "Controlled selection. A `Date`, or `{ from, to }` where `to` is undefined mid-pick.",
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
    month: {
      description: "Visible month when controlled. Pass any date inside the month.",
      control: false,
      table: { category: "Navigation" },
    },
    defaultMonth: {
      description: "Visible month initially when uncontrolled.",
      control: false,
      table: { category: "Navigation" },
    },
    onMonthChange: {
      description: "Called when the visible month changes, from either the buttons or the keyboard.",
      control: false,
      table: { category: "Navigation" },
    },
    isDateDisabled: {
      description: "Predicate marking dates as unselectable. Keyboard moves step over them.",
      control: false,
      table: { category: "Rules" },
    },
    disabled: {
      description: "Disables the whole control.",
      control: "boolean",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    weekStartsOn: {
      description: "First day of the week. `0` is Sunday, `1` is Monday.",
      control: "radio",
      options: [0, 1],
      table: { category: "Layout", defaultValue: { summary: "0" } },
    },
    locale: {
      description: "BCP 47 tag for Intl formatting. Defaults to the runtime locale.",
      control: "text",
      table: { category: "Localization" },
    },
    className: {
      description: "Additional Tailwind classes merged onto the root wrapper.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const formatLong = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const formatShort = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export const Single: Story = {
  render: () => (
    <Calendar.Root>
      <Calendar.Header>
        <Calendar.Previous />
        <Calendar.Title />
        <Calendar.Next />
      </Calendar.Header>
      <Calendar.Grid />
    </Calendar.Root>
  ),
  parameters: {
    docs: { description: { story: "Default single-date mode. Click any day to select it; the dot marks today." } },
  },
};

export const SinglePresetValue: Story = {
  name: "Single, preset value",
  render: () => (
    <Calendar.Root defaultValue={new Date()}>
      <Calendar.Header>
        <Calendar.Previous />
        <Calendar.Title />
        <Calendar.Next />
      </Calendar.Header>
      <Calendar.Grid />
    </Calendar.Root>
  ),
  parameters: {
    docs: { description: { story: "An initial selection through defaultValue. The tab order starts on the selected day." } },
  },
};

export const SingleControlled: Story = {
  render: function Render() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <div className="flex flex-col items-start gap-3">
        <Calendar.Root value={date} onValueChange={setDate}>
          <Calendar.Header>
            <Calendar.Previous />
            <Calendar.Title />
            <Calendar.Next />
          </Calendar.Header>
          <Calendar.Grid />
        </Calendar.Root>
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-medium text-card-foreground">{date ? formatLong.format(date) : "none"}</span>
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: { story: "A controlled root: the parent owns the value and receives every pick through onValueChange." },
    },
  },
};

export const RangeOneCalendar: Story = {
  name: "Range, one calendar",
  render: () => (
    <Calendar.Root mode="range">
      <Calendar.Header>
        <Calendar.Previous />
        <Calendar.Title />
        <Calendar.Next />
      </Calendar.Header>
      <Calendar.Grid />
    </Calendar.Root>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "From–to range picked inside a single grid. First click starts the range, hovering previews the band, second click completes it. Clicking an earlier day restarts the pick.",
      },
    },
  },
};

export const RangeControlledWithPreset: Story = {
  name: "Range, controlled with preset",
  render: function Render() {
    const now = new Date();
    const [range, setRange] = useState<CalendarRange | undefined>({
      from: new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 4)),
      to: now,
    });
    return (
      <div className="flex flex-col items-start gap-3">
        <Calendar.Root mode="range" value={range} onValueChange={setRange}>
          <Calendar.Header>
            <Calendar.Previous />
            <Calendar.Title />
            <Calendar.Next />
          </Calendar.Header>
          <Calendar.Grid />
        </Calendar.Root>
        <p className="text-sm text-muted-foreground">
          Booked:{" "}
          <span className="font-medium text-card-foreground">
            {range ? `${range.from ? formatShort.format(range.from) : "…"} – ${range.to ? formatShort.format(range.to) : "…"}` : "nothing"}
          </span>
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "A preset, fully controlled range. While the user is mid-pick you receive `{ from, to: undefined }` — keep showing the previous complete value if a half-open range means nothing in your domain.",
      },
    },
  },
};

export const DisabledDates: Story = {
  render: () => (
    <Calendar.Root isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6 || date < new Date()}>
      <Calendar.Header>
        <Calendar.Previous />
        <Calendar.Title />
        <Calendar.Next />
      </Calendar.Header>
      <Calendar.Grid />
    </Calendar.Root>
  ),
  parameters: {
    docs: {
      description: {
        story: "Weekends and past days are disabled through a predicate: dimmed, unreachable by keyboard stepping, and inert to clicks.",
      },
    },
  },
};

export const WeekStartsOnMonday: Story = {
  render: () => (
    <Calendar.Root weekStartsOn={1} defaultMonth={new Date(2026, 7, 15)}>
      <Calendar.Header>
        <Calendar.Previous />
        <Calendar.Title />
        <Calendar.Next />
      </Calendar.Header>
      <Calendar.Grid />
    </Calendar.Root>
  ),
  parameters: {
    docs: { description: { story: "Set weekStartsOn to 1 for Monday-first weeks. Home and End follow the configured week." } },
  },
};

export const GermanLocale: Story = {
  name: "Locale: de-DE",
  render: () => (
    <Calendar.Root locale="de-DE" weekStartsOn={1} defaultValue={new Date(2026, 7, 15)} defaultMonth={new Date(2026, 7, 15)}>
      <Calendar.Header>
        <Calendar.Previous />
        <Calendar.Title />
        <Calendar.Next />
      </Calendar.Header>
      <Calendar.Grid />
    </Calendar.Root>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Formatting goes through Intl, so one prop localizes the title, weekday names, and screen-reader labels. Combine with weekStartsOn where the convention differs.",
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <Calendar.Root disabled defaultValue={new Date()}>
      <Calendar.Header>
        <Calendar.Previous />
        <Calendar.Title />
        <Calendar.Next />
      </Calendar.Header>
      <Calendar.Grid />
    </Calendar.Root>
  ),
  parameters: {
    docs: {
      description: {
        story: "A disabled root blocks selection and both navigation buttons. Use it while the surrounding form is locked, not for individual dates.",
      },
    },
  },
};

export const InsideCard: Story = {
  render: () => (
    <Card variant="elevated" className="w-fit">
      <Card.Content className="px-3 py-3">
        <Calendar.Root>
          <Calendar.Header>
            <Calendar.Previous />
            <Calendar.Title />
            <Calendar.Next />
          </Calendar.Header>
          <Calendar.Grid />
        </Calendar.Root>
      </Card.Content>
    </Card>
  ),
  parameters: {
    docs: {
      description: { story: "The calendar paints no surface of its own. Wrap it in a Card (or your popover panel) to float it over content." },
    },
  },
};

export const WithInput: Story = {
  render: function Render() {
    const [date, setDate] = useState<Date | undefined>();
    return (
      <div className="flex w-fit flex-col gap-2">
        <Input.Label htmlFor="trip-start">Start date</Input.Label>
        <Input.Root value={date ? formatLong.format(date) : ""}>
          <Input.Field id="trip-start" placeholder="Pick a date below" readOnly aria-describedby="trip-start-hint" />
        </Input.Root>
        <p id="trip-start-hint" className="text-xs text-muted-foreground">
          The input mirrors the calendar; open it from your own popover or dialog.
        </p>
        <Card className="mt-1 w-fit">
          <Card.Content className="px-3 py-3">
            <Calendar.Root value={date} onValueChange={setDate}>
              <Calendar.Header>
                <Calendar.Previous />
                <Calendar.Title />
                <Calendar.Next />
              </Calendar.Header>
              <Calendar.Grid />
            </Calendar.Root>
          </Card.Content>
        </Card>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "The calendar-input composition: a read-only field shows the formatted selection while the Calendar owns the picking. The field stays composable — wire its visibility through whatever popover primitive the consuming app has.",
      },
    },
  },
};
