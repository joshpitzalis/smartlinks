import type { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { FacebookPage } from "@/modules/ads-info/services/url-to-pageId-service";

export function CardImage({
	profile,
	setPageId,
}: {
	profile: FacebookPage;
	setPageId: Dispatch<SetStateAction<string>>;
}) {
	return (
		<Card className="relative w-full max-w-sm pt-0 ml-4 mb-4">
			<div className="absolute inset-0 z-30 aspect-video bg-black/35 rounded-t-3xl" />
			<img
				src={profile.image_uri}
				alt={profile.page_alias}
				className="relative z-20 rounded-t-3xl aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
			/>
			<CardHeader>
				{profile.verification && (
					<CardAction>
						<Badge variant="secondary">Verified</Badge>
					</CardAction>
				)}
				<CardTitle>{profile.name}</CardTitle>
				<CardDescription>{profile.category}</CardDescription>
			</CardHeader>
			<CardFooter>
				<Button className="w-full" onClick={() => setPageId(profile.page_id)}>
					Show Ads
				</Button>
			</CardFooter>
		</Card>
	);
}
