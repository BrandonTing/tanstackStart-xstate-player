import { defineConfig } from "@tanstack/start/config";
import '@total-typescript/ts-reset';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
  },
});
