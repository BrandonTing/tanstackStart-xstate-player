import { getClientEnvProgram } from "@/services/clientEnv";
import { getServerEnvProgram } from "@/services/env";
import "@total-typescript/ts-reset";
import { Console, Data, Effect } from "effect";
import type { Plugin } from "vite";

export class EnvValidateError extends Data.TaggedError("EnvValidateError")<{
	message: string;
}> {}

export function envValidationPlugin(): Plugin {
	return {
		name: "env validation",
		options() {
			Effect.gen(function* () {
				yield* getClientEnvProgram;
				yield* getServerEnvProgram;
			})
				.pipe(
					Effect.catchTags({
						EnvValidateError: (e) => {
							Effect.runSync(Console.error(e));
							return Effect.fail(null);
						},
					}),
				)
				.pipe(Effect.runSync);
		},
	};
}
