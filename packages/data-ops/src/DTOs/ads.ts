import type { AdSchemaType } from "../schemas/adsSchema";
export type AdvertiserData = ReturnType<typeof extactAdvertiserData>;
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

export type InsightsType = ReturnType<typeof deriveInsights>;
export const deriveInsights = (ads: AdSchemaType[]) => {
	const totalAds = (ads: AdSchemaType[]) => ads.length;
	const activeAds = (ads: AdSchemaType[]) =>
		ads.filter((ad) => ad.is_active === true).length;
	const adsByFormat = (ads: AdSchemaType[]) =>
		ads.reduce<Record<string, number>>((acc, ad) => {
			const format = ad.snapshot?.display_format;
			if (format) {
				acc[format] = (acc[format] ?? 0) + 1;
			}
			return acc;
		}, {});
	const adsByCategory = (ads: AdSchemaType[]) => {
		const categories = new Set<string>();
		for (const ad of ads) {
			for (const category of ad.categories ?? []) {
				if (category !== "UNKNOWN") categories.add(category);
			}
			for (const category of ad.snapshot?.page_categories ?? []) {
				if (category !== "UNKNOWN") categories.add(category);
			}
		}
		return [...categories];
	};
	const platformDistribution = (ads: AdSchemaType[]) => {
		const platforms = new Set<string>();
		for (const ad of ads) {
			for (const platform of ad.publisher_platform ?? []) {
				platforms.add(platform);
			}
		}
		return [...platforms];
	};
	const advertisingSince = (ads: AdSchemaType[]) => {
		const earliest = ads.reduce((min, ad) => {
			const start = new Date(ad.start_date).getTime();
			return start < min ? start : min;
		}, Infinity);
		return new Date(earliest).toISOString().split("T")[0];
	};
	const adLifespanDays = (ad: AdSchemaType[][number]) => {
		const start = new Date(ad.start_date).getTime();
		const end = new Date(ad.end_date ?? ad.start_date).getTime();
		return Math.round((end - start) / (1000 * 60 * 60 * 24));
	};
	const averageAdLifespan = (ads: AdSchemaType[]) => {
		const lifespans = ads.map(adLifespanDays);
		return Math.round(lifespans.reduce((a, b) => a + b, 0) / lifespans.length);
	};
	const longestRunningAd = (ads: AdSchemaType[]) => {
		const avg = averageAdLifespan(ads);
		const ad = [...ads].sort(
			(a, b) => adLifespanDays(b) - adLifespanDays(a),
		)[0];
		const days = adLifespanDays(ad);
		const snapshot = ad.snapshot;
		const media: string[] = [];
		for (const card of snapshot?.cards ?? []) {
			if (card.original_image_url) media.push(card.original_image_url);
		}
		for (const video of snapshot?.videos ?? []) {
			if (video.video_hd_url) media.push(video.video_hd_url);
			if (video.video_preview_image_url)
				media.push(video.video_preview_image_url);
		}
		return {
			libraryId: ad.ad_archive_id,
			isActive: ad.is_active,
			title: snapshot?.title,
			body: snapshot?.body,
			format: snapshot?.display_format,
			ctaType: snapshot?.cta_type,
			linkUrl: snapshot?.link_url,
			platforms: ad.publisher_platform,
			startDate: ad.start_date,
			endDate: ad.end_date,
			days,
			lifespanVsAveragePct: Math.round((days / avg) * 100),
			media,
		};
	};

	return {
		totalAds: totalAds(ads),
		activeAds: activeAds(ads),
		adsByFormat: adsByFormat(ads),
		adsByCategory: adsByCategory(ads),
		platformDistribution: platformDistribution(ads),
		advertisingSince: advertisingSince(ads),
		averageAdLifespanDays: averageAdLifespan(ads),
		longestRunningAd: longestRunningAd(ads),
	};
};
