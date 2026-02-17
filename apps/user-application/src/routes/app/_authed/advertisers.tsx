import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { type Statechart, useMachina } from "@/lib/react-machina";
import { convertPageData } from "@/lib/utils";
import { CardImage } from "@/modules/ads-info/components/card";
import { FilterBox } from "@/modules/ads-info/components/filterBox";
import { Gantt } from "@/modules/ads-info/components/gantt-chart";
import { queryClient, trpc } from "@/router";
import type { FacebookPageResults } from "@/worker/features/metaAds/schemas";

// https://stately.ai/viz/3b9902e9-bf60-4676-8f08-e7f2bab420f4
const statechart = {
	initial: "idle",
	context: { query: "", pageId: "", pageResults: [] },
	states: {
		idle: {
			on: { SEARCH: { target: "loading", action: "setQuery" } },
		},
		loading: {
			on: {
				CACHED_RESULT: { target: "ad_page", action: "setPageId" },
				ONLY_ONE_NEW_RESULT: { target: "ad_page", action: "setPageId" },
				NEWS_PAGES_RESULTS: { target: "new_results", action: "setPageResults" },
				NO_RESULTS: "error",
			},
			onEntry: "fetchData",
		},
		ad_page: {
			on: {
				SEARCH: { target: "loading", action: "setQuery" },
				CLEAR: "idle",
			},
		},
		new_results: {
			on: { CLEAR: "idle" },
		},
		error: {
			on: { SEARCH: { target: "loading", action: "setQuery" }, CLEAR: "idle" },
			onEntry: "logError",
		},
	},
} as const satisfies Statechart;

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

	const handleProfileSearch = async (query: string) => {
		try {
			const results = await queryClient.fetchQuery(
				trpc.advertisers.searchPages.queryOptions({ query }),
			);
			console.log({ results });
			if (typeof results === "string") {
				send({ type: "CACHED_RESULT", value: results });
			} else if (results.length === 1) {
				send({ type: "ONLY_ONE_NEW_RESULT", value: results[0].page_id });
			} else {
				send({ type: "NEWS_PAGES_RESULTS", value: results });
			}
		} catch (error) {
			console.error("Error searching pages:", error);
		}
	};

	const { context, send, matches, can } = useMachina(statechart, {
		setQuery: (ctx, event) => ({ ...ctx, query: event?.value ?? "" }),
		setPageId: (ctx, event) => ({ ...ctx, pageId: event?.value ?? "" }),
		setPageResults: (ctx, event) => ({
			...ctx,
			pageResults: event?.value ?? [],
		}),
		fetchData: (ctx) => {
			handleProfileSearch(ctx.query);
		},
	});

	return (
		<div className="p-6">
			{/*input field*/}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					// send({ type: "SEARCH" });
					send({ type: "SEARCH", value: inputValue });
				}}
				className="mb-4 max-w-md"
			>
				<Field orientation="horizontal">
					<Input
						type="search"
						placeholder="Search for an advertiser..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
					/>
					<Button
						type="submit"
						className="cursor-pointer"
						disabled={!can("SEARCH")}
					>
						{matches("loading") ? (
							<>
								<Spinner /> Loading...
							</>
						) : (
							"Search"
						)}
					</Button>
				</Field>
			</form>

			<FilterBox />

			<div
				className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
				key={searchKey}
			>
				{matches("idle") &&
					Array.isArray(data.advertiserData) &&
					data.advertiserData.map((profile) => (
						<CardImage
							key={profile.pageId}
							profile={convertPageData(profile)}
							// profile={profile}
							setPageId={setPageId}
						/>
					))}

				{matches("new_results") &&
					context.pageResults.length &&
					context.pageResults.map((profile) => (
						<CardImage
							key={profile.page_id}
							profile={profile}
							setPageId={setPageId}
						/>
					))}
			</div>

			{matches("ad_page") && context.pageId && (
				<Gantt key={searchKey} page_id={context.pageId} />
			)}
		</div>
	);
}
