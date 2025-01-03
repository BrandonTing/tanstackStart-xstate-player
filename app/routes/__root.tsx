// app/routes/__root.tsx
import { Header } from "@/components/Header";
import "@/index.css";
import css from "@/index.css?url";
import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
  useLocation,
  useParams,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import type { ReactNode } from "react";
import { Monitoring } from "react-scan/monitoring";
export const Route = createRootRoute({
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
  const params = useParams({ strict: false })
  const { pathname } = useLocation()
  return (
    <html lang="en-US">
      <head>
        <Meta />
      </head>
      <body className="text-white bg-black">
        <div className="min-h-screen">
          <Header />
          {children}
        </div>
        <ScrollRestoration />
        <Scripts />
        <Monitoring
          apiKey="uH8Itqx7cFX8-b4mXlj3JbzQ5qEpiFsa"
          url="https://monitoring.react-scan.com/api/v1/ingest"
          params={params}
          path={pathname}
        />

      </body>
    </html>
  );
}
