"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DeepReadonly } from "@/lib/type";
import {
  type searchAsTypeMachine,
  typeLabelMap,
} from "@/machines/searchAsTypeMachine";
import type { Content, ContentType } from "@/schema/base";
import { useSelector } from "@xstate/react";
import { Match } from "effect";
import { Loader2 } from "lucide-react";
import type { ActorRefFromLogic } from "xstate";
import { ScrollArea } from "./ui/scroll-area";

export function SearchBar({
  actorRef,
}: {
  actorRef: ActorRefFromLogic<typeof searchAsTypeMachine>;
}) {
  const { type, keyword, results } = useSelector(actorRef, ({ context }) => context);
  const isFetching = useSelector(actorRef, (snapshot) => snapshot.matches({ "Active": "Fetching" }))
  const isFetchDone = useSelector(actorRef, (snapshot) => snapshot.matches({ "Active": "Fetch Done" }))
  return (
    <div className="relative flex items-center" >
      <div className="relative flex items-center rounded-md bg-zinc-800">
        <Select
          value={type}
          onValueChange={(value: ContentType) => {
            actorRef.send({ type: "Condition.Type.Change", searchType: value })
          }}
          onOpenChange={(open) => {
            if (open) {
              actorRef.send({ type: "Status.Activate" });
            }
          }}
        >
          <SelectTrigger className="min-w-[100px] bg-transparent border-none text-white">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="text-white bg-zinc-800">
            {typeLabelMap.map((type) => {
              return (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Search..."
          className="text-white placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
          value={keyword}
          onFocus={() => {
            actorRef.send({ type: "Status.Activate" })
          }}
          onChange={(e) => actorRef.send({ type: "Condition.Keyword.Change", keyword: e.target.value })}
        />
      </div>
      {
        isFetching || isFetchDone ? (
          <div className="absolute left-0 z-50 w-full mt-2 overflow-hidden rounded-md shadow-lg top-full bg-zinc-800">
            {
              Match.type<{
                isFetching: boolean,
                results: DeepReadonly<Array<Content>>
              }>().pipe(
                Match.when({ isFetching: true }, () => {
                  return <div className="container flex items-center justify-center h-20">
                    <Loader2 className="animate-spin" />
                  </div>
                }),
                Match.when(({ results }) => {
                  return results.length === 0
                }, () => {
                  return <div className="container flex items-center justify-center h-20">
                    No Matching Content Found
                  </div>
                }),
                Match.orElse(({ results }) => {
                  return <ScrollArea className="h-64">
                    {results.map((result) => (
                      <div
                        key={result.id}
                        className="w-full px-4 py-2 cursor-pointer hover:bg-zinc-700"
                        onClick={() => {
                          actorRef.send({ type: "Item.Select", "content": result })
                        }}
                        onKeyDown={() => {
                          actorRef.send({ type: "Item.Select", "content": result })
                        }}
                      >
                        <p className="text-white">{result.title}</p>
                        <p className="text-sm text-gray-400">{typeLabelMap.find(map => map.value === result.type)?.label}</p>
                      </div>
                    ))}
                  </ScrollArea>
                })
              )({
                isFetching,
                results
              })
            }
          </div>
        ) : null
      }
    </div >
  );
}
