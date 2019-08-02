import Express from "express"
import { mountApi } from "io-ts-api-express"
import {
  getTodosEndpoint,
  createTodoEndpoint,
  updateTodoEndpoint,
  Todo
} from "../common"

const app = Express()

let idCounter = 1
let todos: Todo[] = []

mountApi(app, getTodosEndpoint, (req, res) => {
  res.send(todos)
})

mountApi(app, createTodoEndpoint, (req, res) => {
  const id = idCounter++
  todos.push({ ...req.body, id, done: false })
  res.send({ id })
})

mountApi(app, updateTodoEndpoint, (req, res) => {
  const id = req.params.id
  const todo = todos.find(todo => todo.id === id)

  if (todo === undefined) {
    return res.sendStatus(404)
  }

  if (req.body.title !== undefined) {
    todo.title = req.body.title
  }

  if (req.body.done !== undefined) {
    todo.done = req.body.done
  }

  res.sendStatus(200)
})

app.listen(8080, () => {
  console.log("Server running.")
})
