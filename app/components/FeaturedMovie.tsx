import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

interface FeaturedMovieProps {
	id: number;
	title: string;
	description: string;
	imageUrl: string;
}

export function FeaturedMovie({
	id,
	title,
	description,
	imageUrl,
}: FeaturedMovieProps) {
	return (
		<div
			className="relative h-[80vh] bg-cover bg-center"
			style={{ backgroundImage: `url(${imageUrl})` }}
		>
			<div className="absolute inset-0 bg-gradient-to-r from-black to-transparent">
				<div className="container flex flex-col justify-center h-full px-4 mx-auto">
					<h1 className="mb-4 text-5xl font-bold text-white">{title}</h1>
					<p className="max-w-xl mb-6 text-lg text-white">{description}</p>
					<div className="space-x-4">
						<Link href={`/watch/${id}`}>
							<Button variant="default" size="lg">
								Play
							</Button>
						</Link>
						<Button variant="outline" size="lg">
							More Info
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
