import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleAlert, CircleCheck, Info, RotateCw, ShieldAlert, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Alert } from "./alert";
import { Button } from "./button";
import { Card } from "./card";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### Alert

Alert is an inline message about the state of the surface around it: a validation summary, a failed
sync, a plan limit, a warning before a destructive action.

It stays in the flow and never takes focus. For something that interrupts, use a dialog; for something
transient, use a toast. One failure should surface through exactly one of the three.

\`\`\`tsx
<Alert variant="destructive" role="alert">
  <Alert.Icon>
    <CircleAlert />
  </Alert.Icon>
  <Alert.Body>
    <Alert.Title>Deployment failed</Alert.Title>
    <Alert.Description>The build exited with code 1.</Alert.Description>
    <Alert.Actions>
      <Button variant="outline">View logs</Button>
    </Alert.Actions>
  </Alert.Body>
  <Alert.Close onClick={dismiss} />
</Alert>
\`\`\`

The icon is composed, not derived from the variant — a warning about time and a warning about
permissions should not be forced to share a glyph. Only the icon *color* follows the tone, through a
context selector, so the two never drift apart.

**Roles.** The default is \`role="status"\`, which screen readers announce politely. Pass \`role="alert"\`
when the message appears in response to something the user just did.
`,
      },
    },
  },
  argTypes: {
    variant: {
      description: "Tone of the message. `info` is neutral; the rest tint the surface and the icon.",
      control: "select",
      options: ["info", "success", "warning", "destructive"],
      table: { category: "Appearance", defaultValue: { summary: "info" } },
    },
    role: {
      description: "`status` for ambient context, `alert` for a message caused by a user action.",
      control: "inline-radio",
      options: ["status", "alert"],
      table: { category: "Accessibility", defaultValue: { summary: "status" } },
    },
    children: {
      description: "Compose `Alert.Icon`, `Alert.Body` (`Title`, `Description`, `Actions`), and `Alert.Close`.",
      control: false,
      table: { category: "Content" },
    },
    className: {
      description: "Additional Tailwind classes merged with the alert styles.",
      control: "text",
      table: { category: "Styling" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: (args) => (
    <Alert {...args} className="w-[440px]">
      <Alert.Icon>
        <Info />
      </Alert.Icon>
      <Alert.Body>
        <Alert.Title>Scheduled maintenance</Alert.Title>
        <Alert.Description>Deployments are paused on Sunday between 02:00 and 04:00 UTC.</Alert.Description>
      </Alert.Body>
    </Alert>
  ),
  parameters: { docs: { description: { story: "The neutral alert. Use it for context the user did not ask for but should see." } } },
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-[460px] flex-col gap-3">
      <Alert variant="info">
        <Alert.Icon>
          <Info />
        </Alert.Icon>
        <Alert.Body>
          <Alert.Title>Info</Alert.Title>
          <Alert.Description>Neutral context that does not need a decision.</Alert.Description>
        </Alert.Body>
      </Alert>
      <Alert variant="success">
        <Alert.Icon>
          <CircleCheck />
        </Alert.Icon>
        <Alert.Body>
          <Alert.Title>Success</Alert.Title>
          <Alert.Description>The migration finished with no errors.</Alert.Description>
        </Alert.Body>
      </Alert>
      <Alert variant="warning">
        <Alert.Icon>
          <TriangleAlert />
        </Alert.Icon>
        <Alert.Body>
          <Alert.Title>Warning</Alert.Title>
          <Alert.Description>You are at 92% of the included build minutes.</Alert.Description>
        </Alert.Body>
      </Alert>
      <Alert variant="destructive" role="alert">
        <Alert.Icon>
          <CircleAlert />
        </Alert.Icon>
        <Alert.Body>
          <Alert.Title>Destructive</Alert.Title>
          <Alert.Description>The last deployment failed and was rolled back.</Alert.Description>
        </Alert.Body>
      </Alert>
    </div>
  ),
  parameters: { docs: { description: { story: "All four tones. The tint is deliberately light — a page with three alerts should still be readable." } } },
};

export const TitleOnly: Story = {
  render: () => (
    <Alert variant="warning" className="w-[440px]">
      <Alert.Icon>
        <TriangleAlert />
      </Alert.Icon>
      <Alert.Body>
        <Alert.Title>Your session expires in 5 minutes.</Alert.Title>
      </Alert.Body>
    </Alert>
  ),
  parameters: { docs: { description: { story: "Drop the description when one line says everything. The title stays the only text, so nothing looks truncated." } } },
};

export const WithoutIcon: Story = {
  render: () => (
    <Alert className="w-[440px]">
      <Alert.Body>
        <Alert.Title>Read-only mode</Alert.Title>
        <Alert.Description>This environment is mirrored from production. Changes are discarded on the next sync.</Alert.Description>
      </Alert.Body>
    </Alert>
  ),
  parameters: { docs: { description: { story: "The icon is optional. Without it, the message keeps the full width — useful in a narrow column." } } },
};

export const WithActions: Story = {
  render: () => (
    <Alert variant="destructive" role="alert" className="w-[460px]">
      <Alert.Icon>
        <CircleAlert />
      </Alert.Icon>
      <Alert.Body>
        <Alert.Title>Deployment failed</Alert.Title>
        <Alert.Description>The build exited with code 1 while running `bun test`.</Alert.Description>
        <Alert.Actions>
          <div className="w-28">
            <Button variant="outline">View logs</Button>
          </div>
          <div className="w-24">
            <Button variant="outline">
              <Button.Icon>
                <RotateCw />
              </Button.Icon>
              Retry
            </Button>
          </div>
        </Alert.Actions>
      </Alert.Body>
    </Alert>
  ),
  parameters: { docs: { description: { story: "An error is only finished when the user can act on it. `Alert.Actions` keeps the recovery path attached to the message." } } },
};

export const Dismissible: Story = {
  render: function Render() {
    const [visible, setVisible] = useState(true);
    return (
      <div className="flex w-[460px] flex-col items-start gap-3">
        {visible ? (
          <Alert variant="success" className="w-full">
            <Alert.Icon>
              <CircleCheck />
            </Alert.Icon>
            <Alert.Body>
              <Alert.Title>Invitation sent</Alert.Title>
              <Alert.Description>maja@northstar.dev will receive an email shortly.</Alert.Description>
            </Alert.Body>
            <Alert.Close onClick={() => setVisible(false)} />
          </Alert>
        ) : (
          <p className="m-0 text-sm text-muted-foreground">Alert dismissed.</p>
        )}
        <div className="w-32">
          <Button variant="outline" onClick={() => setVisible(true)} disabled={visible}>
            Show again
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "`Alert.Close` renders the control only. The parent decides whether the alert is mounted, because only the parent knows whether it should come back.",
      },
    },
  },
};

export const WithLink: Story = {
  render: () => (
    <Alert variant="warning" className="w-[460px]">
      <Alert.Icon>
        <ShieldAlert />
      </Alert.Icon>
      <Alert.Body>
        <Alert.Title>Two-factor authentication is off</Alert.Title>
        <Alert.Description>
          Admins are required to enable it. <a href="#settings">Open security settings</a> to finish setup.
        </Alert.Description>
      </Alert.Body>
    </Alert>
  ),
  parameters: { docs: { description: { story: "Links inside the description are underlined and inherit the text color, so the tint stays the only signal of tone." } } },
};

export const InsideCard: Story = {
  render: () => (
    <Card className="w-[460px]">
      <Card.Header divided>
        <Card.Heading>
          <Card.Title>Danger zone</Card.Title>
          <Card.Description>Irreversible actions for this workspace.</Card.Description>
        </Card.Heading>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <Alert variant="destructive">
          <Alert.Icon>
            <TriangleAlert />
          </Alert.Icon>
          <Alert.Body>
            <Alert.Description>Deleting the workspace removes 18 projects and cannot be undone.</Alert.Description>
          </Alert.Body>
        </Alert>
        <div className="w-40 self-end">
          <Button variant="outline">Delete workspace</Button>
        </div>
      </Card.Content>
    </Card>
  ),
  parameters: { docs: { description: { story: "Inside a card the alert keeps its own border, which separates the warning from the card body without a second surface." } } },
};

export const LongContent: Story = {
  render: () => (
    <Alert variant="warning" className="w-[420px]">
      <Alert.Icon>
        <TriangleAlert />
      </Alert.Icon>
      <Alert.Body>
        <Alert.Title>Configuration drift detected between environments</Alert.Title>
        <Alert.Description>
          Staging and production disagree on 7 variables. The comparison ignores secrets, so the real difference may be larger. Re-running the
          sync will overwrite staging with the production values, including anything set manually in the last 24 hours.
        </Alert.Description>
      </Alert.Body>
      <Alert.Close />
    </Alert>
  ),
  parameters: { docs: { description: { story: "A wrapping title and a multi-line description keep the icon and close button anchored to the top edge." } } },
};
