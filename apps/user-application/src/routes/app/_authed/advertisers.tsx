import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TRPCClientError } from "@trpc/client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
	type ActionMap,
	type Statechart,
	useMachina,
} from "@/lib/react-machina";
import { convertPageData } from "@/lib/utils";
import { CardImage } from "@/modules/ads-info/components/card";
// import { FilterBox } from "@/modules/ads-info/components/filterBox";
import { Gantt } from "@/modules/ads-info/components/gantt-chart";
import { queryClient, trpc } from "@/router";
import type { FacebookPageResults } from "@/worker/features/metaAds/schemas";

// https://stately.ai/viz/3b9902e9-bf60-4676-8f08-e7f2bab420f4
const statechart = {
	initial: "idle",
	context: {
		input: "",
		pageId: "",
		error: "",
		pageResults: [] as FacebookPageResults[],
	},
	states: {
		idle: {
			on: {
				SELECT_PAGE: { target: "ad_page", action: "assign" },
				TYPE: { target: "idle", action: "assign" },
				SEARCH: { target: "loading", action: "assign" },
			},
		},
		loading: {
			on: {
				CACHED_RESULT: { target: "ad_page", action: "assign" },
				ONLY_ONE_NEW_RESULT: { target: "ad_page", action: "assign" },
				NEWS_PAGES_RESULTS: { target: "new_results", action: "assign" },
				NO_RESULTS: { target: "error", action: "assign" },
				ERROR: "error",
			},
			onEntry: "fetchData",
			onExit: "clearInput",
		},
		ad_page: {
			on: {
				TYPE: { target: "idle", action: "assign" },
				SEARCH: { target: "loading", action: "assign" },
				CLEAR: "idle",
			},
		},
		new_results: {
			on: {
				SELECT_PAGE: { target: "ad_page", action: "assign" },
				TYPE: { target: "idle", action: "assign" },
				CLEAR: { target: "idle", action: "clearInput" },
			},
		},
		error: {
			on: {
				TYPE: { target: "idle", action: "assign" },
				SEARCH: { target: "loading", action: "assign" },
				CLEAR: "idle",
			},
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

	const handleSearch = async (query: string) => {
		try {
			const results = await queryClient.fetchQuery(
				trpc.advertisers.searchPages.queryOptions({ query }),
			);
			if (typeof results === "string") {
				send({ type: "CACHED_RESULT", pageId: results });
			} else if (results.length === 1) {
				send({ type: "ONLY_ONE_NEW_RESULT", pageId: results[0].page_id });
			} else {
				send({ type: "NEWS_PAGES_RESULTS", pageResults: results });
			}
		} catch (error) {
			if (
				error instanceof TRPCClientError &&
				error.message === "No results found for the given query"
			) {
				send({ type: "NO_RESULTS", error: error.message });
				return;
			}
			send({ type: "ERROR", error: JSON.stringify(error) });
		}
	};

	const actions: ActionMap<typeof statechart> = {
		assign: (ctx, { _, ...data }) => ({ ...ctx, ...data }),
		clearInput: (ctx) => ({ ...ctx, input: "" }),
		fetchData: (ctx) => {
			handleSearch(ctx.input);
		},
	};

	const { context, send, matches, can } = useMachina(statechart, actions);

	return (
		<div className="p-6">
			<SearchBox send={send} context={context} matches={matches} can={can} />
			{/*<FilterBox />*/}

			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
				{matches("error") && (
					<div className="text-red-500">{context.error}</div>
				)}
				{matches("idle") &&
					Array.isArray(data.advertiserData) &&
					data.advertiserData.map((profile) => (
						<CardImage
							key={profile.pageId}
							profile={convertPageData(profile)}
							setPageId={(pageId) => send({ type: "SELECT_PAGE", pageId })}
						/>
					))}

				{matches("new_results") &&
					context.pageResults.length &&
					context.pageResults.map((profile) => (
						<CardImage
							key={profile.page_id}
							profile={profile}
							setPageId={(pageId) => send({ type: "SELECT_PAGE", pageId })}
							// type needed in child when passing in 'send'
							// { send: (event:MachineEvent<typeof statechart>) => void }
						/>
					))}
			</div>

			{matches("ad_page") && context.pageId && (
				<Gantt page_id={context.pageId} />
			)}
		</div>
	);
}

const SearchBox = ({
	send,
	context,
	matches,
	can,
}: Pick<
	ReturnType<typeof useMachina<typeof statechart>>,
	"send" | "context" | "matches" | "can"
>) => (
	<form
		onSubmit={(e) => {
			e.preventDefault();
			if (can("SEARCH") && context.input.trim().length > 0) {
				send({ type: "SEARCH", query: context.input });
			} else {
				console.log("no go");
			}
		}}
		className="mb-4 max-w-md"
	>
		<Field orientation="horizontal">
			<Input
				type="search"
				placeholder="Search for an advertiser..."
				value={context.input}
				onChange={(e) => send({ type: "TYPE", input: e.target.value })}
			/>
			<Button
				type="submit"
				className="cursor-pointer"
				disabled={!can("SEARCH") || !context.input.trim()}
			>
				{matches("loading") ? (
					<>
						<Spinner /> Loading...
					</>
				) : (
					"Search"
				)}
			</Button>
			{can("CLEAR") && (
				<Button
					type="button"
					className="bg-transparent cursor-pointer"
					onClick={() => send("CLEAR")}
				>
					<ArrowLongLeftIcon /> Clear
				</Button>
			)}
		</Field>
	</form>
);
