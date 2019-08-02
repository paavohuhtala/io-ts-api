import * as t from "io-ts"

export const TodoCodec = t.type({
  id: t.number,
  title: t.string,
  done: t.boolean
})

export type Todo = t.TypeOf<typeof TodoCodec>

export const TodoUpdateCodec = t.partial({
  title: t.string,
  done: t.boolean
})

export type TodoUpdate = t.TypeOf<typeof TodoUpdateCodec>
