import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";
import { PropertyList } from "./property-list";

const meta: Meta<typeof PropertyList> = {
  title: "UI/PropertyList",
  component: PropertyList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### PropertyList

A label/value list for the facts of an item — project, branch, pipeline,
assignee. Rows divide by hairlines, so a panel can stack any number of them
without a grid drifting out of alignment.

Values align right on the label's baseline, truncate with a native tooltip,
and may be any node — a \`Badge\`, a link, plain text. Pass \`mono\` for ids,
branch names, and SHAs.

\`\`\`tsx
<PropertyList>
  <PropertyList.Row label="Branch" mono>fix/safari-login-crash</PropertyList.Row>
  <PropertyList.Row label="Pipeline"><Badge variant="success" size="sm">passed</Badge></PropertyList.Row>
</PropertyList>
\`\`\`
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-96 p-4">
      <PropertyList>
        <PropertyList.Row label="Project">Panel</PropertyList.Row>
        <PropertyList.Row label="Assignee">you</PropertyList.Row>
        <PropertyList.Row label="Priority">Urgent</PropertyList.Row>
      </PropertyList>
    </div>
  ),
};

export const MonoValues: Story = {
  render: () => (
    <div className="w-96 p-4">
      <PropertyList>
        <PropertyList.Row label="Issue" mono>#6030</PropertyList.Row>
        <PropertyList.Row label="Merge request" mono>!412</PropertyList.Row>
        <PropertyList.Row label="Branch" mono>fix/safari-login-crash</PropertyList.Row>
        <PropertyList.Row label="Commit" mono>9f2c1ab</PropertyList.Row>
      </PropertyList>
    </div>
  ),
};

export const NodeValues: Story = {
  render: () => (
    <div className="w-96 p-4">
      <PropertyList>
        <PropertyList.Row label="Pipeline">
          <Badge variant="success" size="sm">
            passed
          </Badge>
        </PropertyList.Row>
        <PropertyList.Row label="Blocked by">
          <a href="#6011">#6011</a>
        </PropertyList.Row>
        <PropertyList.Row label="Sprint">Sprint 24</PropertyList.Row>
      </PropertyList>
    </div>
  ),
};

export const Truncating: Story = {
  render: () => (
    <div className="w-72 p-4">
      <PropertyList>
        <PropertyList.Row label="Branch" mono>fix/very-long-descriptive-branch-name-that-overflows</PropertyList.Row>
        <PropertyList.Row label="Reporter">aleksandra.mazur@example.com</PropertyList.Row>
      </PropertyList>
    </div>
  ),
};
