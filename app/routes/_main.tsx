import { Header } from "@/components/Header";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="min-h-screen bg-black">
			<Header />
			<main>
				<Outlet />
			</main>
		</div>
	);
}
