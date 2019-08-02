import { FetchConfig, bindApi } from "io-ts-api-fetch"
import { getTodosEndpoint, createTodoEndpoint } from "../common"

console.log("Client running.")

const config: FetchConfig = {
  baseUrl: "http://localhost:8080"
}

const getTodos = bindApi(config, getTodosEndpoint)
const createTodo = bindApi(config, createTodoEndpoint)

async function doStuff() {
  let todos = await getTodos()
  console.dir(todos, { colors: true })
  await createTodo({ title: "Hello from client!" })
  todos = await getTodos()
  console.dir(todos, { colors: true })
}

doStuff()
