import type shaka from "shaka-player";
import { assign, enqueueActions, fromPromise, raise, setup } from "xstate";
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
			animationActionTimestamp: number;
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
					type: "Video.ToggleWithAnimate";
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
			| { type: "Time.skipBackward.keyboard" }
			| { type: "Time.skipForward.keyboard" }
			| { type: "Time.seek"; time: number }
			| { type: "Volume.Toggle" }
			| { type: "Volume.Set"; volume: number }
			| { type: "play-state-animation.end" }
			| {
					type: "animate";
					animation: "playing" | "paused" | "backward" | "forward";
			  },
		tags: {} as
			| "Show Control"
			| "Animate action"
			| "Animate playing state"
			| "Animate paused state"
			| "Animate backward"
			| "Animate forward",
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
		"Set animation timestamp to now": assign({
			animationActionTimestamp: () => Date.now(),
		}),
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
		animationActionTimestamp: 0, // used on animation key to ensure rerendeering
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
					type: "parallel",
					states: {
						Controls: {
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
										"Video.ToggleWithAnimate": {
											target: "paused",
											actions: raise({
												type: "animate",
												animation: "paused",
											}),
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
										"Video.ToggleWithAnimate": {
											target: "play",
											actions: raise({
												type: "animate",
												animation: "playing",
											}),
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
								"Time.skipBackward.keyboard": {
									actions: [
										{
											type: "Seek",
											params: ({ context }) => {
												return { time: Math.max(context.currentTime - 10, 0) };
											},
										},
										raise({
											type: "animate",
											animation: "backward",
										}),
									],
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
								"Time.skipForward.keyboard": {
									actions: [
										{
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
										raise({
											type: "animate",
											animation: "forward",
										}),
									],
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
						Animation: {
							initial: "Idle",
							states: {
								Idle: {},
								"Animating playing state": {
									tags: ["Animate action", "Animate playing state"],
								},
								"Animating paused state": {
									tags: ["Animate action", "Animate paused state"],
								},
								"Animating backward": {
									tags: ["Animate action", "Animate backward"],
								},
								"Animating forward": {
									tags: ["Animate action", "Animate forward"],
								},
							},
							on: {
								"play-state-animation.end": {
									target: ".Idle",
								},
								animate: [
									{
										guard: ({ event }) => event.animation === "playing",
										target: ".Animating playing state",
										actions: "Set animation timestamp to now",
									},
									{
										guard: ({ event }) => event.animation === "paused",
										target: ".Animating paused state",
										actions: "Set animation timestamp to now",
									},
									{
										guard: ({ event }) => event.animation === "backward",
										target: ".Animating backward",
										actions: "Set animation timestamp to now",
									},
									{
										guard: ({ event }) => event.animation === "forward",
										target: ".Animating forward",
										actions: "Set animation timestamp to now",
									},
								],
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
