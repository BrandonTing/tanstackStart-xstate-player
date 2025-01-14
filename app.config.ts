import { defineConfig } from "@tanstack/start/config";
import "@total-typescript/ts-reset";
import tsConfigPaths from "vite-tsconfig-paths";
import { envValidationPlugin } from "vite/envValidationPlugin";

export default defineConfig({
	vite: {
		plugins: [
			tsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
			envValidationPlugin(),
		],
	},
});
