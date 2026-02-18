import type { AdSchemaType } from "@/features/ads/adsSchema";

export const santize = (query: string) => {
	const trimmed = query.trim();

	if (trimmed.includes("://")) {
		const url = new URL(trimmed);
		const params = url.searchParams;

		// handle profile.php?id=123 style URLs
		if (params.has("id")) {
			return params.get("id")!;
		}

		// grab the last non-empty path segment
		const segments = url.pathname.split("/").filter(Boolean);
		const raw = segments.at(-1) ?? "";
		return raw.replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
	}

	return trimmed.replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
};

export type AdvertiserData = ReturnType<typeof extactAdvertiserData>;
export const extactAdvertiserData = (ads: AdSchemaType[]) => {
	// todo - if the first item in the array doesnt have the values then you could riffle through the remaining results
	const { page_id, page_name, categories, is_aaa_eligible } = ads[0];

	const {
		page_profile_uri,
		page_profile_picture_url,
		page_categories,
		page_like_count,
	} = ads[0].snapshot || {};

	const result = {
		pageId: page_id,
		pageName: page_name,
		categories,
		isAaaEligible: is_aaa_eligible,
		pageProfileUri: page_profile_uri,
		pageProfilePictureUrl: page_profile_picture_url,
		pageCategories: page_categories,
		pageLikeCount: page_like_count,
	};

	return result;
};
