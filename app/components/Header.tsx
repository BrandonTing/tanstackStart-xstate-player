import { Link } from "@tanstack/react-router";
// import { UserMenu } from "./UserMenu";

export function Header() {
	return (
		<header className="fixed top-0 z-50 w-full bg-black bg-opacity-75">
			<div className="container flex items-center justify-center p-4 mx-auto">
				<nav>
					<ul className="flex space-x-4">
						<li>
							<Link
								to="/"
								className=" hover:text-gray-300"
								activeProps={{
									className: "font-bold border-b-2 border-red-600",
								}}
							>
								Home
							</Link>
						</li>
						<li>
							<Link
								to="/movies"
								search={{
									contentType: "tv",
								}}
								className=" hover:text-gray-300"
								activeProps={{
									className: "font-bold border-b-2 border-red-600",
								}}
							>
								TV Shows
							</Link>
						</li>
						<li>
							<Link
								to="/movies"
								className=" hover:text-gray-300"
								activeProps={{
									className: "font-bold border-b-2 border-red-600",
								}}
							>
								Movies
							</Link>
						</li>
					</ul>
				</nav>
				{/* <UserMenu /> */}
			</div>
		</header>
	);
}
