// app/routes/__root.tsx
import { Header } from "@/components/Header";
import "@/index.css";
import css from "@/index.css?url";
import { ClerkProvider } from '@clerk/tanstack-start';
import type { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import type { ReactNode } from "react";

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
              {children}
            </main>
          </div>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </ClerkProvider>

  );
}
