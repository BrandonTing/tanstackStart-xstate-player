import type shaka from "shaka-player";
import { assign, fromPromise, setup } from "xstate";
export const playerMachine = setup({
	types: {
		context: {} as {
			player: shaka.Player | null;
			src: string;
		},
		events: {} as
			| {
					type: "Idle.setPlayer";
					player: shaka.Player;
			  }
			| {
					type: "Change Source";
					src: string;
			  }
			| {
					type: "Destroy Player";
			  },
	},
	actors: {
		loadSrcActor: fromPromise(
			({ input }: { input: { player: shaka.Player | null; src: string } }) => {
				if (!input.player) {
					throw new Error("No Created Shaka Player");
				}
				return input.player.load(input.src);
			},
		),
	},
}).createMachine({
	context: {
		player: null,
		src: "",
	},
	initial: "Idle",
	states: {
		Idle: {
			always: {
				target: "PlayerLoaded",
				guard: ({ context }) => {
					return !!context.player;
				},
			},
			on: {
				"Idle.setPlayer": {
					actions: assign(({ event }) => {
						return {
							player: event.player,
						};
					}),
				},
			},
		},
		PlayerLoaded: {
			initial: "Load",
			states: {
				Load: {
					invoke: {
						id: "load",
						src: "loadSrcActor",
						input: ({ context }) => {
							return context;
						},
						onDone: {
							target: "Loaded",
							actions: () => {
								console.log("done");
							},
						},
						onError: {
							target: "Error",
						},
					},
				},
				Loaded: {},
				Error: {
					type: "final",
				},
				onDone: {
					target: "Idle",
				},
			},
			on: {
				"Destroy Player": {
					target: "Idle",
					actions: [
						({ context }) => {
							context.player?.destroy();
						},
						assign(() => {
							return {
								player: null,
							};
						}),
					],
				},
			},
		},
	},
	on: {
		"Change Source": {
			target: ".Idle",
			actions: [
				({ context }) => {
					context.player?.unload();
				},
				assign(({ event }) => {
					return {
						src: event.src,
					};
				}),
			],
		},
	},
});
