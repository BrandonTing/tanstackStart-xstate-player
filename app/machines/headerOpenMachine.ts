import { setup } from "xstate";

export const headerOpenMachine = setup({
	types: {
		events: {} as
			| {
					type: "Show";
			  }
			| {
					type: "Hide";
			  }
			| {
					type: "Fixed.Activate";
			  }
			| {
					type: "Fixed.InActivate";
			  },
		tags: "" as "Show" | "Can Hide",
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
			on: {
				Show: {
					target: "Triggered",
				},
			},
		},
		Triggered: {
			tags: ["Show"],
			initial: "Debounce",
			states: {
				Debounce: {
					after: {
						300: {
							target: "Go To Can Hide",
						},
					},
				},
				"Go To Can Hide": {
					type: "final",
				},
			},
			onDone: {
				target: "Can Hide",
			},
			on: {
				"Fixed.Activate": {
					target: "Fixed",
				},
			},
		},
		"Can Hide": {
			tags: ["Show"],
			on: {
				Hide: {
					target: "Hide",
				},
				"Fixed.Activate": {
					target: "Fixed",
				},
			},
		},
		Fixed: {
			tags: ["Show"],
			on: {
				"Fixed.InActivate": {
					target: "Triggered",
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
