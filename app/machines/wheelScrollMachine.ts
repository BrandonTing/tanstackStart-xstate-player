import { assign, setup } from "xstate"
export const wheelScrollMachine = setup({
  types: {
    context: {} as {
      abortController: AbortController
    },
    events: {} as {
      type: "Start Listening"
    } | {
      type: "End"
    }
  },
  actions: {
    subscribeWheelEvent: () => {},
    unSubscribeWheelEvent: () => {}
  }
}).createMachine({
  context: {
    abortController: new AbortController()
  },
  initial: "Idle",
  states: {
    "Idle": {
      on: {
        "Start Listening": {
          target: "Listening",
          actions: "subscribeWheelEvent"
        }
      }
    },
    "Listening": {
      on: {
        "End": {
          target: "Idle",
          actions: [
            "unSubscribeWheelEvent",
            assign(() => {
              return {
                abortController: new AbortController()
              }
            })
          ]
        }
      }
    }
  }
})