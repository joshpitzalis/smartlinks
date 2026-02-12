import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";
import { CardImage } from "./card";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
	title: "Example/Card",
	component: CardImage,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		// layout: "centered",
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ["autodocs"],
	// Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
	args: { setPageId: fn() },
} satisfies Meta<typeof CardImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		profile: {
			page_id: "22092443056",
			category: "Food & Beverage Company",
			image_uri:
				"https://scontent.fglw1-1.fna.fbcdn.net/v/t39.30808-1/481111297_1069997801826454_9215366077499599073_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=1&ccb=1-7&_nc_sid=418b77&_nc_ohc=PbYFWsmkWDoQ7kNvwGVNsEW&_nc_oc=Adlq0KQko4wJXhuziPompN1Zs9EzBbnUKkCwDWgzpZ_vew4H4lqsZjsXE6QPltoQZiU&_nc_zt=24&_nc_ht=scontent.fglw1-1.fna&_nc_gid=FJFwz-B-1dS3e9Cq952XuA&oh=00_AftpgjiUzvWJmC1dsfyPY2RE5LyqCQhxBceqQJ-TPUJPtw&oe=698D29B5",
			likes: 34402408,
			verification: "BLUE_VERIFIED",
			name: "Starbucks",
			entity_type: "PERSON_PROFILE",
			ig_username: "starbucks",
			ig_followers: 17765823,
			ig_verification: true,
			page_alias: "Starbucks",
		},
	},
};
