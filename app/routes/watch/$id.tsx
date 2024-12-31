import { PlayerBoundary } from "@/components/PlayerBoundary";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
// currently using demo video source, id is useless.
export const Route = createFileRoute("/watch/$id")({
	component: RouteComponent,
});

function RouteComponent() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
	return isClient ? <PlayerBoundary />: null;
}
