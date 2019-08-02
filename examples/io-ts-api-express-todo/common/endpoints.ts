import * as t from "io-ts"
import { defineApi as defineEndpoint, NumberFromString } from "io-ts-api-core"
import { TodoCodec } from "./types"

export const getTodosEndpoint = defineEndpoint({
  method: "get",
  route: "/todos",
  resType: t.array(TodoCodec)
})

export const createTodoEndpoint = defineEndpoint({
  method: "post",
  route: "/todos",
  reqType: t.type({
    title: t.string
  }),
  resType: t.type({
    id: t.number
  })
})

export const updateTodoEndpoint = defineEndpoint({
  method: "put",
  route: {
    paramTypes: t.type({ id: NumberFromString }),
    format: ({ id }) => `/todos/${id}`
  },
  reqType: t.type({
    title: t.string
  }),
  resType: t.void
})
