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
								search={{
									contentType: "tv",
								}}
								className="text-white hover:text-gray-300"
							>
								TV Shows
							</Link>
						</li>
						<li>
							<Link
								to="/"
								search={{
									contentType: "movie",
								}}
								className="text-white hover:text-gray-300"
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
