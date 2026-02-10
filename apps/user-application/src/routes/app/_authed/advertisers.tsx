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
});

function RouteComponent() {
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
			// todo - if only 1 result comes back from searchPages then shortcircuit straght t showing teh gantt chart

			setProfileResults(results);
		} catch (error) {
			console.error("Error searching pages:", error);
		}
	};

	return (
		<div className="p-6">
			<form onSubmit={handleSubmit} className="mb-4 max-w-md">
				<Field orientation="horizontal">
					<Input
						type="search"
						placeholder="Facebook Page for..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
					/>
					<Button type="submit" className="cursor-pointer">
						Search
					</Button>
				</Field>
			</form>

			<div className="mt-2 flex justify-start flex-wrap" key={searchKey}>
				{!pageId &&
					profileResults.length &&
					profileResults?.map((profile) => (
						<CardImage
							key={profile.page_id}
							profile={profile}
							setPageId={setPageId}
						/>
					))}
			</div>

			{pageId && <Gantt key={searchKey} page_id={pageId} />}
		</div>
	);
}
