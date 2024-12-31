import { Player } from "./Player";

export function PlayerBoundary() {
	return (
		<div className="w-full max-w-4xl mx-auto mt-32 overflow-hidden rounded-lg bg-zinc-900">
			<Player src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" />
		</div>
	);
}
