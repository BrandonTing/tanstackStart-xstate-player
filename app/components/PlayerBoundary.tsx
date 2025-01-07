import { Player } from "./Player";

export function PlayerBoundary() {
  return (
    <div className="w-full mx-auto mt-12 overflow-hidden rounded-lg bg-zinc-900 max-w-7xl">
      <Player src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" />
    </div>
  );
}
