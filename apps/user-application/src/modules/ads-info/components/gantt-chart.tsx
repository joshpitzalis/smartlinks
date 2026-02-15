import { useQuery } from "@tanstack/react-query";

type Mutable<T> = {
	-readonly [K in keyof T]: T[K] extends ReadonlyArray<infer U>
		? U[]
		: T[K] extends object
			? Mutable<T[K]>
			: T[K];
};

// import { glimpse } from "@/components/kibo-ui/glimpse/server";
import groupBy from "lodash.groupby";
import {
	GanttFeatureItem,
	GanttFeatureList,
	GanttFeatureListGroup,
	GanttHeader,
	GanttProvider,
	GanttSidebar,
	GanttSidebarGroup,
	GanttSidebarItem,
	GanttTimeline,
	GanttToday,
} from "@/components/kibo-ui/gantt";
import {
	Glimpse,
	GlimpseContent,
	GlimpseDescription,
	GlimpseImage,
	GlimpseTitle,
	GlimpseTrigger,
} from "@/components/kibo-ui/glimpse";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/router";

export const Gantt = ({ page_id }: { page_id: string }) => {
	const query = useQuery(
		trpc.advertisers.getAllAdvertisers.queryOptions({ page_id }),
	);
	if (query.isLoading) {
		return <div>Loading...</div>;
	}
	if (query.isError) {
		return <div>Error!</div>;
	}

	const features = (query.data?.ads ?? []).map((f) => ({
		...(f as Mutable<typeof f>),
		id: f.ad_archive_id,
		name: f.page_name ?? "",
		startAt: new Date(f.start_date),
		endAt: new Date(f.end_date ?? Date.now()),
		status: {
			id: "is_active" in f && f.is_active === true ? "active" : "inactive",
			name: "is_active" in f && f.is_active === true ? "Active" : "Inactive",
			color: "is_active" in f && f.is_active === true ? "#10b981" : "#6b7280",
		},
	}));
	// const groupedFeatures = groupBy(features, (f) => f.status.id);

	// const sortedGroupedFeatures = Object.fromEntries(
	// 	Object.entries(groupedFeatures)
	// 		.sort(([groupA], [groupB]) => {
	// 			// "active" before "inactive"
	// 			if (groupA === "active") return -1;
	// 			if (groupB === "active") return 1;
	// 			return 0;
	// 		})
	// 		.map(([group, ads]) => [
	// 			group,
	// 			[...ads].sort(
	// 				(a, b) =>
	// 					new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
	// 			),
	// 		]),
	// );
	//
	const groupedFeatures = groupBy(features, (f) => {
		const isActive = "is_active" in f && f.is_active === true;
		const format =
			f.snapshot?.display_format === "VIDEO" ? "video" : "carousel";
		return `${isActive ? "active" : "inactive"}-${format}`;
	});

	const groupOrder = [
		"active video ads",
		"inactive-video",
		"active-carousel",
		"inactive-carousel",
	];

	const sortedGroupedFeatures = Object.fromEntries(
		Object.entries(groupedFeatures)
			.sort(([a], [b]) => groupOrder.indexOf(a) - groupOrder.indexOf(b))
			.map(([group, ads]) => [
				group,
				[...ads].sort(
					(a, b) =>
						new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
				),
			]),
	);

	return (
		<>
			{/*<WinnerBox ads={query.data} />*/}
			<GanttProvider range="monthly" zoom={100} className="mt-4 border">
				<GanttSidebar>
					{Object.entries(sortedGroupedFeatures).map(([group, features]) => (
						<GanttSidebarGroup key={group} name={group}>
							{features.map((feature) => (
								<GanttSidebarItem
									feature={feature}
									key={feature.ad_archive_id}
								/>
							))}
						</GanttSidebarGroup>
					))}
				</GanttSidebar>
				<GanttTimeline>
					<GanttHeader />
					<GanttFeatureList>
						{Object.entries(sortedGroupedFeatures).map(([group, features]) => (
							<GanttFeatureListGroup key={group}>
								{features.map((feature) => (
									<div className="flex" key={feature.ad_archive_id}>
										<GanttFeatureItem {...feature}>
											<p className="flex-1 truncate text-xs">
												{feature.page_name}
											</p>
											{feature.page_name && (
												<Avatar className="h-4 w-4">
													<Glimpse closeDelay={0} openDelay={0}>
														<GlimpseTrigger asChild className="cursor-pointer">
															<AvatarImage src={getBestImage(feature)} />
														</GlimpseTrigger>
														<GlimpseContent className="w-80">
															{/*<GlimpseImage src={data.image ?? ""} />
                                  <GlimpseTitle>{data.title}</GlimpseTitle>
                                  <GlimpseDescription>{data.description}</GlimpseDescription>*/}
															<GlimpseImage src={getBestImage(feature)} />
															<GlimpseTitle>
																{feature.snapshot?.title}
															</GlimpseTitle>
															<GlimpseDescription>
																{feature.snapshot?.body?.text}
															</GlimpseDescription>
														</GlimpseContent>
													</Glimpse>
													<AvatarFallback>
														{getBestImage(feature)}
													</AvatarFallback>
												</Avatar>
											)}
										</GanttFeatureItem>
									</div>
								))}
							</GanttFeatureListGroup>
						))}
					</GanttFeatureList>
					<GanttToday className="bg-blue-100 text-blue-950" />
				</GanttTimeline>
			</GanttProvider>
		</>
	);
};

const getBestImage = (feature: {
	snapshot?: {
		videos?: readonly { video_preview_image_url?: string }[];
		cards?: readonly { resized_image_url?: string }[];
		page_profile_picture_url?: string;
	};
}) => {
	if (feature.snapshot?.videos?.[0]?.video_preview_image_url) {
		return feature.snapshot.videos[0].video_preview_image_url;
	} else if (feature.snapshot?.cards?.[0]?.resized_image_url) {
		return feature.snapshot.cards[0].resized_image_url;
	} else {
		return feature.snapshot?.page_profile_picture_url;
	}
};
