import { FetchConfig, bindAll } from "io-ts-api-fetch"
import {
  getTodosEndpoint,
  createTodoEndpoint,
  updateTodoEndpoint
} from "../common"

console.log("Client running.")

const config: FetchConfig = {
  baseUrl: "http://localhost:8080"
}

const TodoApi = bindAll(config, {
  get: getTodosEndpoint,
  create: createTodoEndpoint,
  update: updateTodoEndpoint
})

async function doStuff() {
  const { id } = await TodoApi.create({ title: "Demonstrate this library" })
  console.dir(await TodoApi.get(), { colors: true })
  await TodoApi.update({ id }, { done: true })
  console.dir(await TodoApi.get(), { colors: true })
}

doStuff()
