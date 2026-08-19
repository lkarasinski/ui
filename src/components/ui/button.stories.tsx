import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: { children: "Button" },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Outline: Story = { args: { variant: "outline" } };

export const Disabled: Story = { args: { disabled: true } };

export const IconLeft: Story = {
  render: () => (
    <Button>
      <Button.Icon>
        <Download />
      </Button.Icon>
      Download
    </Button>
  ),
};

export const IconRight: Story = {
  render: () => (
    <Button variant="outline">
      Continue
      <Button.Icon>
        <ArrowRight />
      </Button.Icon>
    </Button>
  ),
};

export const IconAppearing: Story = {
  render: function Render() {
    const [loading, setLoading] = useState(false);
    return (
      <Button onClick={() => setLoading((v) => !v)} disabled={loading}>
        {loading && (
          <Button.Icon key="spinner">
            <Loader2 className="animate-spin" />
          </Button.Icon>
        )}
        {loading ? "Saving…" : "Save"}
      </Button>
    );
  },
};
