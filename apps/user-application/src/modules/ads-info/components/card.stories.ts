import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";
import { CardImage } from "./card";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
	title: "Ads Info/Card",
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
				"https://scontent.fbom9-1.fna.fbcdn.net/v/t39.30808-1/392935072_700105445485560_4956643143255939812_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=1&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=2iDrf206pEsQ7kNvwGTpHGI&_nc_oc=Adk12AOk8ElMYpZvC8Bbq1H5lNSNyqM-xJgAFdt0l2wGq_LEzPGrKhTGDG8Er5IOaSY&_nc_zt=24&_nc_ht=scontent.fbom9-1.fna&_nc_gid=Be9x0VvA3bnYBNWczbMUOQ&oh=00_AfsgHWX8yYp0L7bpcnpOvxu9c07jjoPqNmfMm3S0eEA5-g&oe=69931D14",
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
