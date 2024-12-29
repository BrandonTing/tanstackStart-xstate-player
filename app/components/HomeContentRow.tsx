import type { DeepReadonly } from "@/lib/type";
import { Link } from "@tanstack/react-router";

interface Content {
	id: number;
	title: string;
	posterPath: string;
}

interface HomeContentRowProps {
	title: string;
	contents: DeepReadonly<Array<Content>>;
}

export function HomeContentRow({ title, contents }: HomeContentRowProps) {
	return (
		<div className="mb-8">
			<h2 className="mb-4 text-2xl font-semibold text-white">{title}</h2>
			<div className="flex pb-4 space-x-4 overflow-x-auto bg-black custom-scrollbar">
				{contents.map((content) => (
					<Link
						key={content.id}
						href={`/watch/${content.id}`}
						className="flex-none"
					>
						<img
							src={content.posterPath}
							alt={content.title}
							width={200}
							height={300}
							className="transition-transform duration-200 rounded-md hover:scale-105"
						/>
					</Link>
				))}
			</div>
		</div>
	);
}
