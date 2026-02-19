import type { AdSchemaType } from "@repo/data-ops/schema/adsSchema";

export const extactAdvertiserData = (ads: AdSchemaType[]) => {
	// todo - if the first item in the array doesnt have the values then you could riffle through the remaining results
	const ad = ads[0];
	if (!ad) return;

	return {
		pageId: ad.page_id,
		pageName: ad.page_name,
		categories: ad.categories,
		isAaaEligible: ad.is_aaa_eligible,
		pageProfileUri: ad.snapshot?.page_profile_uri,
		pageProfilePictureUrl: ad.snapshot?.page_profile_picture_url,
		pageCategories: ad.snapshot?.page_categories,
		pageLikeCount: ad.snapshot?.page_like_count,
	};
};
