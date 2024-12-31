"use client";
import { playerMachine } from "@/machines/playerMachine";
import { useMachine } from "@xstate/react";
import { useCallback } from "react";

interface PlayerProps {
	src: string;
}

export function Player({ src }: PlayerProps) {
	const [snapshot, send] = useMachine(playerMachine);
	if (snapshot.context.src !== src) {
		send({ type: "Change Source", src });
	}
	const refCallbacks = useCallback(
		(node: HTMLVideoElement) => {
			if (node) {
				const abortController = new AbortController();
				import("shaka-player").then(({ default: shaka }) => {
					shaka.polyfill.installAll();
					const player = new shaka.Player();
					player.attach(node);
					send({ type: "Idle.setPlayer", player: player });
					node.addEventListener(
						"click",
						() => {
							if (node.paused) {
								node.play();
							} else {
								node.pause();
							}
						},
						{
							signal: abortController.signal,
						},
					);
				});
				return () => {
					send({ type: "Destroy Player" });
					abortController.abort();
				};
			}
		},
		[send],
	);
	return (
		// biome-ignore lint/a11y/useMediaCaption: <explanation>
		<video ref={refCallbacks} className="w-full" />
	);
}
