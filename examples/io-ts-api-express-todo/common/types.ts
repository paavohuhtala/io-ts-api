import * as t from "io-ts"

export const TodoCodec = t.type({
  id: t.number,
  title: t.string,
  done: t.boolean
})
