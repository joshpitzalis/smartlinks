import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatRelativeTime = (timestamp: string) => {
	const now = new Date();
	const clickedTime = new Date(timestamp);
	console.log(clickedTime);
	const diffInSeconds = Math.floor(
		(now.getTime() - clickedTime.getTime()) / 1000,
	);

	if (diffInSeconds < 60) {
		return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
};

export interface GeoClick {
	latitude: number;
	longitude: number;
}

export interface GroupedGeoClick {
	latitude: number;
	longitude: number;
	count: number;
}

// Round coordinates to nearest mile (approximately 0.0145 degrees)
const roundToMile = (coord: number) => {
	const mileInDegrees = 0.0145;
	return Math.floor(coord / mileInDegrees) * mileInDegrees;
};

// Group clicks by rounded coordinates and count them
export const groupClicksByMile = (clicks: GeoClick[]): GroupedGeoClick[] => {
	const clickGroups = clicks.reduce(
		(acc, click) => {
			const key = `${roundToMile(click.latitude)}_${roundToMile(click.longitude)}`;
			if (!acc[key]) {
				acc[key] = {
					latitude: roundToMile(click.latitude),
					longitude: roundToMile(click.longitude),
					count: 0,
				};
			}
			acc[key].count++;
			return acc;
		},
		{} as Record<string, GroupedGeoClick>,
	);

	return Object.values(clickGroups);
};

export function convertPageData(input: {
	pageId: string;
	pageName: string | null;
	categories: string | null;
	isAaaEligible: number | null;
	pageProfileUri: string | null;
	pageProfilePictureUrl: string | null;
	pageCategories: string | null;
	pageLikeCount: number | null;
	createdAt: string | null;
	updatedAt: string | null;
}): {
	readonly name: string;
	readonly page_id: string;
	readonly category?: string | undefined;
	readonly image_uri?: string | undefined;
	readonly likes?: number | undefined;
	readonly verification?: string | undefined;
	readonly entity_type?: string | undefined;
	readonly ig_username?: string | undefined;
	readonly ig_verification?: boolean | undefined;
	readonly ig_followers?: number | undefined;
	readonly page_alias?: string | undefined;
} {
	return {
		name: input.pageName ?? "",
		page_id: input.pageId,
		...(input.pageCategories && { category: input.pageCategories }),
		...(input.pageProfilePictureUrl && {
			image_uri: input.pageProfilePictureUrl,
		}),
		...(input.pageLikeCount !== null && { likes: input.pageLikeCount }),
		...(input.isAaaEligible !== null && {
			verification: input.isAaaEligible === 1 ? "verified" : "unverified",
		}),
		page_alias: input.pageProfileUri?.split("/").at(-1) ?? "",
	};
}
