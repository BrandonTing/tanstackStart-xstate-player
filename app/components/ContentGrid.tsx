import type { DeepReadonly } from "@/lib/type";
import { Link } from "@tanstack/react-router";

interface Content {
	id: number;
	title: string;
	poster_path: string;
	release_date: string;
}

interface ContentGridProps {
	title: string;
	contents: DeepReadonly<Content[]>;
	limit?: number;
}

export function ContentGrid({ title, contents, limit }: ContentGridProps) {
	const displayedContents = limit ? contents.slice(0, limit) : contents;

	return (
		<div className="mb-8">
			<h2 className="mb-4 text-2xl font-semibold text-white">{title}</h2>
			<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{displayedContents.map((content) => (
					<Link
						key={content.id}
						href={`/watch/${content.id}`}
						className="group"
					>
						<div className="relative aspect-[2/3] overflow-hidden rounded-md">
							<img
								src={content.poster_path}
								alt={content.title}
								className="transition-transform duration-200 group-hover:scale-105"
							/>
						</div>
						<h3 className="mt-2 text-sm font-medium text-white transition-colors group-hover:text-gray-300">
							{content.title}
						</h3>
						<p className="text-xs text-gray-400">
							{new Date(content.release_date).getFullYear()}
						</p>
					</Link>
				))}
			</div>
		</div>
	);
}
