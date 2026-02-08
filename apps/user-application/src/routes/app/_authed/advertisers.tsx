import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CardImage } from "@/modules/ads-info/components/card";
import { Gantt } from "@/modules/ads-info/gantt";
import {
	type FacebookPage,
	mockUrlToPageIds,
	UrlToPageIds,
} from "@/modules/ads-info/services/url-to-pageId-service";

export const Route = createFileRoute("/app/_authed/advertisers")({
	component: RouteComponent,
});

function RouteComponent() {
	const [inputValue, setInputValue] = useState("");
	const [pageId, setPageId] = useState("");
	const [profileResults, setProfileResults] = useState<FacebookPage[]>([]);
	const [searchKey, setSearchKey] = useState(0);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (inputValue.trim()) {
			handleProfileSearch(inputValue.trim());
			setSearchKey((k) => k + 1);
		}
	};

	const handleProfileSearch = (query: string) =>
		Effect.runPromise(
			getFacebookProfiles(query).pipe(
				Effect.provideService(UrlToPageIds, mockUrlToPageIds),
				Effect.match({
					onFailure: (_error) => {
						//       switch (error._tag) {
						//         case "DbError":
						//           console.error("Problem with the
						// database");
						//         case "NoUserFoundError":
						//           console.error("no user found");
						//         default: {
						//           const _exhaustive: never = error;
						//           return _exhaustive;
						//         }
						//       }
					},
					onSuccess: (results) => setProfileResults(results),
				}),
			),
		);

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

const getFacebookProfiles = (query: string) =>
	Effect.gen(function* () {
		const { getPageIds } = yield* UrlToPageIds;
		// const user = yield* getUser(id);
		// if (!user) {
		//   return yield* new NoUserFoundError({ id });
		// }
		return getPageIds(query);
	});
