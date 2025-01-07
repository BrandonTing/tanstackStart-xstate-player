import type { DeepReadonly } from "@/lib/type";
import type { Credit } from "@/schema/base";

interface CreditListProps {
	creditList: DeepReadonly<Array<Credit>>;
}

export function CreditList({ creditList }: CreditListProps) {

	return (
		<div className="mb-6">
			<h2 className="mb-4 text-2xl font-semibold text-white">Cast</h2>
			<div className="flex flex-wrap gap-4">
				{creditList.map((credit) => (
					<div key={credit.id} className="flex flex-col items-center">
						{credit.profilePath ? (
							<img
								src={credit.profilePath}
								alt={credit.name}
								className="w-24 rounded-lg h-36"
							/>
						) : null}
						<span className="w-24 mt-2 text-sm text-white truncate">{credit.name}</span>
					</div>
				))}
			</div>
		</div>
	);
}
