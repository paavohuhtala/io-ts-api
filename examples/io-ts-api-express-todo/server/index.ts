import Express from "express"
import { mountApi } from "io-ts-api-express"
import {
  getTodosEndpoint,
  createTodoEndpoint,
  updateTodoEndpoint
} from "../common"

const app = Express()

let idCounter = 1
let todos = [{ id: idCounter++, title: "Finish this example", done: false }]

mountApi(app, getTodosEndpoint, (req, res) => {
  res.send(todos)
})

mountApi(app, createTodoEndpoint, (req, res) => {
  const id = idCounter++
  todos.push({ ...req.body, id, done: false })
  res.send({ id })
})

mountApi(app, updateTodoEndpoint, (req, res) => {
  res.sendStatus(200)
})

app.listen(8080, () => {
  console.log("Server running.")
})
