import { getClientEnvProgram, getServerEnvProgram } from "@/services/env";
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
					Effect.catchTag("EnvValidateError", (e) => {
						Effect.runSync(Console.error(e));
						return Effect.fail(null);
					}),
          Effect.runSync
				)
		},
	};
}
