// import { withDecodingDefault } from "effect/Schema";
import {
	Stories,
	StoriesContent,
	Story,
	StoryAuthor,
	StoryAuthorImage,
	StoryAuthorName,
	StoryOverlay,
	StoryVideo,
} from "@/components/kibo-ui/stories";
import type { AdSchemaType } from "@/worker/features/metaAds/schemas";

export const WinnerBox = ({ ads }: { ads: AdSchemaType[] }) => (
	<div className="size-full overflow-y-auto">
		<div className="p-3">
			<h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
				What's working...
			</h1>
			<p className="max-w-prose m-4 text-gray-600">
				CSS has come a long way since its inception. From simple layout tweaks
				to complex responsive designs, it's become an essential tool for
				crafting delightful web experiences. In this article, we’ll explore
				various HTML elements commonly styled with modern CSS utility systems
				like <code>tailwindcss</code>
				and component libraries.
			</p>
			<StoriesSet stories={ads} />
			<h2 className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
				These Ads have been running for more than 30 days...
			</h2>
			<p className="max-w-prose text-gray-600">
				Web design today is more accessible than ever. Thanks to utility-first
				frameworks and component-based architectures, developers can build
				beautiful UIs with less effort.
			</p>
		</div>
	</div>
);

interface ExtractedMedia {
	type: "card" | "video";
	mediaUrl: string;
	body: string;
	title: string;
	pageName: string;
	pageProfilePictureUrl: string;
	id: string;
}

// todo - if its a horizontal add, render withDecodingDefault
// todo - show title and body
const StoriesSet = ({ stories }: { stories: AdSchemaType[] }) => {
	const winners = extractLongRunningAdMedia(stories);
	return (
		<Stories>
			<StoriesContent>
				{winners.map((item) => {
					return (
						<Story className="aspect-[3/4] w-[200px] basis-auto" key={item.id}>
							<StoryVideo src={item.mediaUrl} />
							<StoryOverlay />
							<StoryAuthor>
								<StoryAuthorImage
									name={item.pageName}
									src={item.pageProfilePictureUrl}
								/>
								<StoryAuthorName>{item.pageName}</StoryAuthorName>
							</StoryAuthor>
						</Story>
					);
				})}
			</StoriesContent>
		</Stories>
	);
};

function extractLongRunningAdMedia(ads: AdSchemaType[]): ExtractedMedia[] {
	const cutoff = 5 * 24 * 60 * 60 * 1000;

	const longRunningAds = ads.filter((ad) => {
		const endDateOrNow = ad.end_date
			? new Date(ad.end_date).getTime()
			: Date.now();
		const duration = endDateOrNow - new Date(ad.start_date).getTime();
		return duration >= cutoff;
	});

	const extractedMedia: ExtractedMedia[] = [];

	longRunningAds.forEach((ad) => {
		const { snapshot } = ad;
		if (!snapshot) return;

		// todo - find out which fields are actually guarnateed by the API
		const pageName = snapshot.page_name || "";
		const pageProfilePictureUrl = snapshot.page_profile_picture_url || "";
		const id = ad.ad_archive_id || "";

		// Extract cards
		if (snapshot.cards && snapshot.cards.length > 0) {
			snapshot.cards.forEach((card) => {
				extractedMedia.push({
					type: "card",
					mediaUrl: card.resized_image_url || "",
					body: card.body || "",
					title: card.title || "",
					pageName,
					pageProfilePictureUrl,
					id,
				});
			});
		}

		// Extract videos
		if (snapshot.videos && snapshot.videos.length > 0) {
			snapshot.videos.forEach((video) => {
				extractedMedia.push({
					type: "video",
					mediaUrl:
						video.video_sd_url ||
						video.video_hd_url ||
						video.video_preview_image_url ||
						"",
					body: snapshot.body?.text || "",
					title: snapshot.title || "",
					pageName,
					pageProfilePictureUrl,
					id,
				});
			});
		}
	});

	return extractedMedia.slice(0, 5);
}
