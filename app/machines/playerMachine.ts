import type shaka from "shaka-player";
import { assign, enqueueActions, fromPromise, setup } from "xstate";
export const playerMachine = setup({
	types: {
		context: {} as {
			player: shaka.Player | null;
			media: HTMLVideoElement | null;
			src: string;
			metadata: {
				duration: number;
			};
			currentTime: number;
			volume: number;
			isMuted: boolean;
		},
		events: {} as
			| {
					type: "Idle.setPlayer";
					player: shaka.Player;
					media: HTMLVideoElement | null;
			  }
			| {
					type: "Change Source";
					src: string;
			  }
			| {
					type: "Destroy Player";
			  }
			| {
					type: "Loaded.Play";
			  }
			| {
					type: "Loaded.Pause";
			  }
			| {
					type: "Play.Hover";
			  }
			| {
					type: "Play.HoverEnd";
			  }
			| { type: "Time.update"; currentTime: number }
			| { type: "Time.skipBackward" }
			| { type: "Time.skipForward" }
			| { type: "Time.seek"; time: number }
			| { type: "Volume.Toggle" }
			| { type: "Volume.Set"; volume: number },
		tags: {} as "Show Control",
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
	actions: {
		"Get Metadata": assign(({ context }) => {
			if (!context.media) {
				return {};
			}
			return {
				metadata: {
					duration: context.media.duration,
				},
			};
		}),
		"Play the video": ({ context }) => {
			context.media?.play();
		},
		"Pause the video": ({ context }) => {
			context.media?.pause();
		},
		"Update Current Time": assign((_, params: { time: number }) => {
			return {
				currentTime: params.time,
			};
		}),
		Seek: enqueueActions(({ context, enqueue }, params: { time: number }) => {
			if (!context.media) {
				return;
			}
			context.media.currentTime = params.time;
			enqueue.assign(() => {
				return {
					currentTime: params.time,
				};
			});
		}),
		"Set Volume": assign(
			(
				{ context },
				params: {
					target: number;
				},
			) => {
				if (context.media) {
					context.media.volume = params.target;
				}
				return {
					volume: params.target,
				};
			},
		),
	},
}).createMachine({
	context: {
		player: null,
		media: null,
		src: "",
		metadata: {
			duration: 0,
		},
		currentTime: 0,
		volume: 1,
		isMuted: false,
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
							media: event.media,
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
						},
						onError: {
							target: "Error",
						},
					},
				},
				Loaded: {
					initial: "play",
					entry: "Get Metadata",
					states: {
						play: {
							entry: "Play the video",
							on: {
								"Loaded.Pause": {
									target: "paused",
								},
								"Time.update": {
									actions: {
										type: "Update Current Time",
										params: ({ event }) => {
											return {
												time: event.currentTime,
											};
										},
									},
								},
							},
							initial: "Idle",
							states: {
								Idle: {
									on: {
										"Play.Hover": {
											target: "Hovering",
										},
									},
								},
								Hovering: {
									after: {
										2000: {
											target: "Idle",
										},
									},
									tags: ["Show Control"],
									on: {
										"Play.HoverEnd": {
											target: "Idle",
										},
									},
								},
							},
						},
						paused: {
							entry: "Pause the video",
							tags: ["Show Control"],
							on: {
								"Loaded.Play": {
									target: "play",
								},
							},
						},
					},
					on: {
						"Time.seek": {
							actions: {
								type: "Seek",
								params: ({ event }) => {
									return { time: event.time };
								},
							},
						},
						"Time.skipBackward": {
							actions: {
								type: "Seek",
								params: ({ context }) => {
									return { time: Math.max(context.currentTime - 10, 0) };
								},
							},
						},
						"Time.skipForward": {
							actions: {
								type: "Seek",
								params: ({ context }) => {
									return {
										time: Math.min(
											context.currentTime + 10,
											context.metadata.duration,
										),
									};
								},
							},
						},
						"Volume.Toggle": {
							actions: assign(({ context }) => {
								return {
									isMuted: !context.isMuted,
								};
							}),
						},
						"Volume.Set": {
							actions: {
								type: "Set Volume",
								params: ({ event }) => {
									return {
										target: event.volume,
									};
								},
							},
						},
					},
				},
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
