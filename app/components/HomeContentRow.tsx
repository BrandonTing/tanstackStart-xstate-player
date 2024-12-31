import type { DeepReadonly } from "@/lib/type";
import { wheelScrollMachine } from "@/machines/wheelScrollMachine";
import { Link } from "@tanstack/react-router";
import { useMachine } from "@xstate/react";
import { useRef } from "react";
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
	const barRef = useRef<HTMLDivElement | null>(null);
	const [_, send] = useMachine(
		wheelScrollMachine.provide({
			actions: {
				subscribeWheelEvent: ({ context }) => {
					window.addEventListener(
						"wheel",
						(e) => {
							e.preventDefault();
							e.stopImmediatePropagation();
							barRef.current?.scrollBy({
								left: e.deltaY,
							});
							return false;
						},
						{
							passive: false,
							capture: true,
							signal: context.abortController.signal,
						},
					);
				},
				unSubscribeWheelEvent: ({ context }) => {
					context.abortController.abort();
				},
			},
		}),
	);
	return (
		<div
			className="mb-8"
			ref={(node) => {
				const abortController = new AbortController();
				if (node) {
					node.addEventListener("mouseenter", () => {
						send({ type: "Start Listening" });
					});
					node.addEventListener("mouseleave", () => {
						send({ type: "End" });
					});
				}
				return () => {
					abortController.abort();
				};
			}}
		>
			<h2 className="mb-4 text-2xl font-semibold text-white">{title}</h2>
			<div
				className="flex pb-4 space-x-4 overflow-x-auto bg-black custom-scrollbar"
				ref={barRef}
			>
				{contents.map((content) => (
					<Link
						key={content.id}
						to={`/detail/${title === "TV Shows" ? "tvShows" : "movies"}/${content.id}`}
						className="flex-none"
            preload="intent"
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
