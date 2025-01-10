import { assign, fromPromise, setup } from "xstate";

export const ratingMachine = setup({
	types: {
		context: {} as {
			tempRating: number;
		},
		events: {} as
			| {
					type: "Dialog.Show";
					initialRating: number;
			  }
			| {
					type: "Rating.SetTemp";
					rating: number;
			  }
			| {
					type: "Dialog.Cancel";
			  }
			| {
					type: "Rating.Set";
			  },
	},
	actions: {
		"Set Default Temp Rating": assign(
			(_, params: { initialRating: number }) => {
				return {
					tempRating: params.initialRating,
				};
			},
		),
		"Assign Temp Rating": assign((_, params: { rating: number }) => {
			return {
				tempRating: params.rating,
			};
		}),
	},
	actors: {
		"Setting Rating": fromPromise<void, { rating: number }>(async () => {}),
	},
}).createMachine({
	context: {
		tempRating: 0,
	},
	initial: "Idle",
	states: {
		Idle: {
			on: {
				"Dialog.Show": {
					target: "Dialog",
					actions: {
						type: "Set Default Temp Rating",
						params({ event }) {
							return {
								initialRating: event.initialRating,
							};
						},
					},
				},
			},
		},
		Dialog: {
			on: {
				"Dialog.Cancel": {
					target: "Idle",
				},
				"Rating.SetTemp": {
					actions: {
						type: "Assign Temp Rating",
						params({ event }) {
							return {
								rating: event.rating,
							};
						},
					},
				},
				"Rating.Set": {
					target: "Setting",
				},
			},
		},
		Setting: {
			invoke: {
				src: "Setting Rating",
				input: ({ context }) => ({ rating: context.tempRating }),
				onDone: {
					target: "Idle",
				},
			},
		},
	},
});
