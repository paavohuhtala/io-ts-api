import { FetchConfig, bindApi } from "io-ts-api-fetch"
import {
  getTodosEndpoint,
  createTodoEndpoint,
  updateTodoEndpoint
} from "../common"

console.log("Client running.")

const config: FetchConfig = {
  baseUrl: "http://localhost:8080"
}

const getTodos = bindApi(config, getTodosEndpoint)
const createTodo = bindApi(config, createTodoEndpoint)
const updateTodo = bindApi(config, updateTodoEndpoint)

async function doStuff() {
  const { id } = await createTodo({ title: "Demonstrate this library" })
  console.dir(await getTodos(), { colors: true })
  await updateTodo({ id }, { done: true })
  console.dir(await getTodos(), { colors: true })
}

doStuff()
