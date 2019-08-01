import * as t from "io-ts"
import Express from "express"
import { defineApi, NumberFromString } from "io-ts-api-core"
import { mountApi } from "io-ts-api-express"

const app = Express()

const createTodoApi = defineApi({
  method: "post",
  route: "/todos",
  reqType: t.type({
    title: t.string
  }),
  resType: t.type({
    id: t.number
  })
})

const updateTodoApi = defineApi({
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

mountApi(app, createTodoApi, (req, res) => {
  res.send({ id: 1 })
})

mountApi(app, updateTodoApi, (req, res) => {
  console.dir(req.params.id)
  res.sendStatus(200)
})
