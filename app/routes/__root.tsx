// app/routes/__root.tsx
import { Header } from "@/components/header/Header";
import "@/index.css";
import css from "@/index.css?url";
import { getClientEnvProgram } from "@/services/env";
import { ClerkProvider } from '@clerk/tanstack-start';
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext
} from "@tanstack/react-router";
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
          <HeadContent />
        </head>
        <body className="text-white bg-black">
          <div className="min-h-screen">
            <Header />
            <Provider>
              {children}
            </Provider>
          </div>
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