import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  args: { placeholder: "Workspace name" },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true, value: "Acme Inc." } };
