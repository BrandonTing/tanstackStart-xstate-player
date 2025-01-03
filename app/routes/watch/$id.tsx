import { PlayerBoundary } from "@/components/PlayerBoundary";
import { createFileRoute } from "@tanstack/react-router";
// currently using demo video source, id is useless.
export const Route = createFileRoute("/watch/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	return <PlayerBoundary />;
}
