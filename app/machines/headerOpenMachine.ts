import { setup } from "xstate";

export const headerOpenMachine = setup({
	types: {
		events: {} as
			| {
					type: "Show";
			  }
			| {
					type: "Hide";
			  },
		tags: "" as "Show",
	},
}).createMachine({
	initial: "Idle",
	states: {
		Idle: {
			tags: ["Show"],
			after: {
				1000: {
					target: "Hide",
				},
			},
		},
		Triggered: {
			tags: ["Show"],
			on: {
				Hide: {
					target: "Hide",
				},
			},
		},
		Hide: {
			on: {
				Show: {
					target: "Triggered",
				},
			},
		},
	},
});
