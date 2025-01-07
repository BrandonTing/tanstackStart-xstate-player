import type { FileRoutesByTo } from "@/routeTree.gen";
import { Link } from "@tanstack/react-router";
import { UserMenu } from "./UserMenu";
// import { UserMenu } from "./UserMenu";

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full bg-black bg-opacity-75">
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
        <UserMenu />
      </div>
    </header>
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
    >
      {children}
    </Link>
  );
}
