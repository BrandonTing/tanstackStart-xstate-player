// app/routes/__root.tsx
import { Header } from "@/components/Header";
import "@/index.css";
import css from "@/index.css?url";
import { getClientEnvProgram } from "@/services/clientEnv";
import { ClerkProvider } from '@clerk/tanstack-start';
import type { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Effect } from "effect";
import { type ReactNode, useState } from "react";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        href: css,
        rel: "stylesheet",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en-US">
        <head>
          <Meta />
        </head>
        <body className="text-white bg-black">
          <div className="min-h-screen">
            <Header />
            <main>
              <Provider>
                {children}
              </Provider>
            </main>
          </div>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </ClerkProvider>
  );
}

function Provider({ children }: Readonly<{ children: ReactNode }>) {
  const [convex] = useState(() => {
    const env = Effect.runSync(getClientEnvProgram)
    return new ConvexReactClient(env.VITE_CONVEX_URL)
  });
  return <ConvexProvider client={convex}>
    {children}
  </ConvexProvider>
}