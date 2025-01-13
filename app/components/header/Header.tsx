import { headerOpenMachine } from "@/machines/headerOpenMachine";
import type { FileRoutesByTo } from "@/routeTree.gen";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Link } from "@tanstack/react-router";
import { useMachine } from "@xstate/react";
import { Match } from "effect";
import { useCallback } from "react";
import { Drawer } from "vaul";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";

export function Header() {
  const [snapshot, send] = useMachine(headerOpenMachine)
  const isHeaderShown = snapshot.hasTag("Show")
  const toggleHeaderFixed = useCallback((active: boolean) => {
    Match.value(active).pipe(
      Match.when(true, () => {
        send({ type: "Fixed.Activate" })
      }),
      Match.orElse(() => {
        send({ type: "Fixed.InActivate" })
      })
    )
  }, [send])
  return (
    <>
      {
        isHeaderShown ? null : (
          <div className="fixed top-0 z-10 w-screen h-10" ref={(node) => {
            const abortController = new AbortController()
            if (node) {
              node.addEventListener("mouseenter", () => {
                send({ type: "Show" })
              }, {
                signal: abortController.signal
              })
            }

            return () => {
              abortController.abort()
            }
          }} />
        )
      }
      <Drawer.Root open={isHeaderShown} direction="top">
        <Drawer.Portal>
          <Drawer.Content className="fixed top-0 left-0 right-0">
            <VisuallyHidden.Root>
              <Drawer.Title>Dynamic Header</Drawer.Title>
              <Drawer.Description>The header will expand once user move mouse toward top of the screen</Drawer.Description>
            </VisuallyHidden.Root>
            <header className="z-50 w-full bg-black bg-opacity-75" ref={(node) => {
              const abortController = new AbortController()
              if (node) {
                node.addEventListener("mouseleave", () => {
                  send({ type: "Hide" })
                }, {
                  signal: abortController.signal
                })
                node.addEventListener("mouseenter", () => {
                  send({ type: "Show" })
                }, {
                  signal: abortController.signal
                })
              }
              return () => {
                abortController.abort()
              }
            }}>
              <div className="container flex items-center justify-between p-4 mx-auto">
                <div>Demo site</div>
                <nav>
                  <ul className="flex space-x-4">
                    <li>
                      <HeaderLink to="/">Home</HeaderLink>
                    </li>
                    <li>
                      <HeaderLink to="/tvShows">TV Shows</HeaderLink>
                    </li>
                    <li>
                      <HeaderLink to="/movies">Movies</HeaderLink>
                    </li>
                  </ul>
                </nav>
                <div className="flex items-center gap-4">
                  <SearchBar onActiveChange={toggleHeaderFixed} />
                  <UserMenu onActiveChange={toggleHeaderFixed} />
                </div>
              </div>
            </header>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>

  );
}

function HeaderLink({
  to,
  children,
}: {
  to: keyof FileRoutesByTo;
  children: string;
}) {
  return (
    <Link
      to={to}
      preload="intent"
      className=" hover:text-gray-300"
      activeProps={{
        className: "font-bold border-b-2 border-red-600",
      }}
      viewTransition
    >
      {children}
    </Link>
  );
}
