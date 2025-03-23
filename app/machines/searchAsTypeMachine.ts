import type { DeepReadonly } from "@/lib/type";
import type { Content, ContentType } from "@/schema/base";
import { getSearchResult, searchApiRuntime } from "@/services/searchService";
import { createServerFn } from "@tanstack/react-start";
import { assign, fromPromise, setup } from "xstate";

const getMovies = createServerFn({
  method: "GET",
})
  .validator((data: { keyword: string; type: ContentType }) => data)
  .handler(({ data: { keyword, type } }) =>
    searchApiRuntime.runPromise(getSearchResult(keyword, type)),
  );

export const typeLabelMap = [
  {
    value: "movies",
    label: "Movie",
  },
  {
    value: "tvShows",
    label: "TV Shows",
  },
] satisfies Array<{
  value: ContentType;
  label: string;
}>;

export const searchAsTypeMachine = setup({
  types: {
    input: {} as {
      initType: ContentType;
    },
    events: {} as
      | {
        type: "Status.Activate";
      }
      | {
        type: "Status.Inactivate";
      }
      | {
        type: "Condition.Keyword.Change";
        keyword: string;
      }
      | {
        type: "Condition.Type.Change";
        searchType: ContentType;
      }
      | {
        type: "Item.Select";
        content: Content;
      },
    context: {} as {
      keyword: string;
      type: ContentType;
      results: DeepReadonly<Array<Content>>;
    },
  },
  actors: {
    getSearchResult: fromPromise<
      DeepReadonly<Array<Content>>,
      { keyword: string; type: ContentType }
    >(async ({ input: { keyword, type } }) => {
      return getMovies({
        data: {
          keyword,
          type,
        },
      });
    }),
  },
  actions: {
    "On Item Select": (_, _params: { content: Content }) => { },
    "Clear Context": assign(() => {
      return {
        keyword: "",
        results: [],
      };
    }),
    "On Active": () => { },
    "On Inactive": () => { },
  },
}).createMachine({
  context: ({ input: { initType } }) => ({
    keyword: "",
    type: initType,
    results: [],
  }),
  initial: "Inactive",
  states: {
    Inactive: {
      entry: "On Inactive",
      on: {
        "Status.Activate": {
          target: "Active",
        },
      },
    },
    Active: {
      entry: "On Active",
      initial: "Idle",
      states: {
        Idle: {},
        Debouncing: {
          after: {
            500: [
              {
                target: "Fetching",
                guard: ({ context }) => {
                  return context.keyword.length > 2;
                },
              },
              {
                target: "Idle",
                actions: assign(() => {
                  return {
                    results: [],
                  };
                }),
              },
            ],
          },
        },
        Fetching: {
          invoke: {
            src: "getSearchResult",
            input: ({ context }) => {
              return {
                keyword: context.keyword,
                type: context.type,
              };
            },
            onDone: {
              target: "Fetch Done",
              actions: assign({
                results: ({ event }) => event.output,
              }),
            },
          },
        },
        "Fetch Done": {},
      },
      on: {
        "Status.Inactivate": {
          target: "Inactive",
          actions: "Clear Context",
        },
        "Condition.Keyword.Change": {
          target: ".Debouncing",
          reenter: true,
          actions: assign(({ event }) => {
            return {
              keyword: event.keyword,
            };
          }),
        },
        "Condition.Type.Change": {
          target: ".Debouncing",
          reenter: true,
          actions: assign(({ event }) => {
            return {
              type: event.searchType,
            };
          }),
        },
        "Item.Select": {
          target: "Inactive",
          actions: [
            "Clear Context",
            {
              type: "On Item Select",
              params: ({ event }) => {
                return {
                  content: event.content,
                };
              },
            },
          ],
        },
      },
    },
  },
});
