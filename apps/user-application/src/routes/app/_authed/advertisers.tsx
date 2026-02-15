import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CardImage } from "@/modules/ads-info/components/card";
import { Gantt } from "@/modules/ads-info/components/gantt-chart";
import { queryClient, trpc } from "@/router";
import type { FacebookPageResults } from "@/worker/features/metaAds/schemas";

export const Route = createFileRoute("/app/_authed/advertisers")({
	component: RouteComponent,
	loader: async ({ context: { queryClient, trpc } }) => {
		await queryClient.prefetchQuery(
			trpc.advertisers.getAllAdvertisers.queryOptions({}),
		);
	},
});

function RouteComponent() {
	const { data } = useSuspenseQuery(
		trpc.advertisers.getAllAdvertisers.queryOptions({}),
	);
	const [inputValue, setInputValue] = useState("");
	const [pageId, setPageId] = useState("");

	const [profileResults, setProfileResults] = useState<FacebookPageResults[]>(
		[],
	);
	const [searchKey, setSearchKey] = useState(0);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (inputValue.trim()) {
			handleProfileSearch(inputValue.trim());
			setSearchKey((k) => k + 1);
		}
	};

	const handleProfileSearch = async (query: string) => {
		try {
			const results = await queryClient.fetchQuery(
				trpc.advertisers.searchPages.queryOptions({ query }),
			);
			if (typeof results === "string") {
				setPageId(results);
			} else if (results.length === 1) {
				// if only 1 result comes back from searchPages then shortcircuit straight to showing the gantt chart
				setPageId(results[0].page_id);
			} else {
				// Fallback: ensure we have an array in state.
				setProfileResults(results);
			}
		} catch (error) {
			console.error("Error searching pages:", error);
		}
	};

	return (
		<div className="p-6">
			{/*input field*/}
			<form onSubmit={handleSubmit} className="mb-4 max-w-md">
				<Field orientation="horizontal">
					<Input
						type="search"
						placeholder="Search for an advertiser..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
					/>
					<Button type="submit" className="cursor-pointer">
						Search
					</Button>
				</Field>
			</form>

			{/*page results*/}
			<div
				// className="mt-2 flex justify-between flex-wrap"
				className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
				key={searchKey}
			>
				{!pageId && profileResults.length
					? profileResults?.map((profile) => (
							<CardImage
								key={profile.page_id}
								profile={profile}
								setPageId={setPageId}
							/>
						))
					: Array.isArray(data) &&
						data.map((profile) => (
							<CardImage
								key={profile.pageId}
								profile={convertPageData(profile)}
								setPageId={setPageId}
							/>
						))}
			</div>

			{/*ads results*/}

			{pageId && <Gantt key={searchKey} page_id={pageId} />}
		</div>
	);
}

function convertPageData(input: {
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
