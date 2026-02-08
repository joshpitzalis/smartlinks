import { Context } from "effect";

export type FacebookPage = {
	page_id: string;
	category: string;
	image_uri: string;
	likes: number;
	verification: string;
	name: string;
	entity_type: string;
	ig_username: string;
	ig_followers: number;
	page_alias: string;
};

export class UrlToPageIds extends Context.Tag("UrlToPageIds")<
	UrlToPageIds,
	{
		getPageIds: (url: string) => FacebookPage[];
	}
>() {}

// strip off the username
// validate the response

export const mockUrlToPageIds = {
	getPageIds: (url: string) => [
		{
			page_id: "110887675450872",
			category: "Brand",
			image_uri:
				"https://scontent.fbom9-1.fna.fbcdn.net/v/t39.30808-1/588012480_122230447532102063_3788719702371786278_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=105&ccb=1-7&_nc_sid=418b77&_nc_ohc=y3lYZvogX4kQ7kNvwG0WGB8&_nc_oc=AdlCB_9Y-51DJVDz2XboVEE2OHV3sXuNwYuhb-3TfESC6fDgVmu-UTcWmUoRnzgzrkc&_nc_zt=24&_nc_ht=scontent.fbom9-1.fna&_nc_gid=As8Qt4U_cN9LG6Jwovl4VQ&oh=00_AfvsnufAIL7sMHjHB9YUV862y3Pr3YbJNbWMTzuQU0Omjg&oe=698E107A",
			likes: 2589,
			verification: "NOT_VERIFIED",
			name: "Teslahubs",
			entity_type: "PERSON_PROFILE",
			ig_username: "teslahubs",
			ig_followers: 11057,
			page_alias: "teslahubs",
		},
	],
};
