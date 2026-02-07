import { createFileRoute } from "@tanstack/react-router";
import { Gantt } from "@/modules/ads-info/gantt";

export const Route = createFileRoute("/app/_authed/advertisers")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-6">
			<Gantt />
		</div>
	);
}
