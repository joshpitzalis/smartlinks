import { useQuery } from "@tanstack/react-query";
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

export const Gantt = () => {
	const query = useQuery(trpc.advertisers.getAllAdvertisers.queryOptions());
	if (query.isLoading) {
		return <div>Loading...</div>;
	}
	if (query.isError) {
		return <div>Error!</div>;
	}

	const features = (query.data ?? []).map((f) => ({
		...f,
		startAt: new Date(f.startAt),
		endAt: new Date(f.endAt),
	}));
	const groupedFeatures = groupBy(features, "group.name");
	const sortedGroupedFeatures = Object.fromEntries(
		Object.entries(groupedFeatures).sort(([nameA], [nameB]) =>
			nameA.localeCompare(nameB),
		),
	);
	return (
		<GanttProvider className="border" range="monthly" zoom={100}>
			<GanttSidebar>
				{Object.entries(sortedGroupedFeatures).map(([group, features]) => (
					<GanttSidebarGroup key={group} name={group}>
						{features.map((feature) => (
							<GanttSidebarItem feature={feature} key={feature.id} />
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
								<div className="flex" key={feature.id}>
									<GanttFeatureItem {...feature}>
										<p className="flex-1 truncate text-xs">{feature.name}</p>
										{feature.owner && (
											<Avatar className="h-4 w-4">
												<Glimpse closeDelay={0} openDelay={0}>
													<GlimpseTrigger asChild className="cursor-pointer">
														<AvatarImage src={feature.owner.image} />
													</GlimpseTrigger>
													<GlimpseContent className="w-80">
														{/*<GlimpseImage src={data.image ?? ""} />
                                  <GlimpseTitle>{data.title}</GlimpseTitle>
                                  <GlimpseDescription>{data.description}</GlimpseDescription>*/}
														<GlimpseImage src={feature.owner.image ?? ""} />
														<GlimpseTitle>{feature.owner.name}</GlimpseTitle>
														<GlimpseDescription>
															A description of the ad goes here
														</GlimpseDescription>
													</GlimpseContent>
												</Glimpse>
												<AvatarFallback>
													{feature.owner.name?.slice(0, 2)}
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
	);
};
