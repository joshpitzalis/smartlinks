import type { Meta, StoryObj } from "@storybook/react-vite";
import { fakeAdData } from "@/worker/features/metaAds/tests/dummy-data";
import { WinnerBox } from "./winnerBox";

const meta = {
	title: "Ads Info/WinnerBox",
	component: WinnerBox,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof WinnerBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		ads: fakeAdData.ads,
	},
};
