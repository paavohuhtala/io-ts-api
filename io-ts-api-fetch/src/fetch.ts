import { BodilessApi, BodifulApi } from "io-ts-api-core"
import fetch from "cross-fetch"
import { Route } from "io-ts-api-core"

type FetchApiFunction<P extends object, Res> = object extends P
  ? (() => Promise<Res>)
  : ((params: P) => Promise<Res>)

type PostApiFunction<P extends object, Req, Res> = object extends P
  ? ((req: Req) => Promise<Res>)
  : ((params: P, req: Req) => Promise<Res>)

export interface FetchConfig {
  baseUrl: string
  credentials?: Request["credentials"]
  headers?: Record<string, string>
}

function formatRoute<P extends object>(route: Route<P>, params: P): string {
  if (typeof route === "string") {
    return route
  }

  return route.format(params)
}

async function fetchApi<P extends object, Res>(
  config: FetchConfig,
  api: BodilessApi<P, Res>,
  params: P
): Promise<Res> {
  const method = api.method.toUpperCase()
  const path = formatRoute(api.route, params)

  const { credentials, headers } = config

  const res = await fetch(config.baseUrl + path, {
    method,
    ...(credentials ? { credentials } : {}),
    headers: {
      ...(headers || {}),
      Accept: "application/json"
    }
  })

  const resJson = await res.json()

  if (api.resType.is(resJson)) {
    return resJson
  } else {
    throw new Error("Unexpected response from server")
  }
}

async function postApi<P extends object, Req, Res>(
  config: FetchConfig,
  api: BodifulApi<P, Req, Res>,
  params: P,
  req: Req
): Promise<Res> {
  const method = api.method.toUpperCase()
  const path = formatRoute(api.route, params)
  const body = JSON.stringify(req)

  const { credentials, headers } = config

  const res = await fetch(config.baseUrl + path, {
    method,
    ...(credentials ? { credentials } : {}),
    headers: {
      ...(headers || {}),
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body
  })

  if (res.status >= 400) {
    const text = await res.text()
    throw new Error(`Server error: ${text}`)
  }

  const resJson = await res.json()

  if (api.resType.is(resJson)) {
    return resJson
  } else {
    throw new Error("Unexpected response from server")
  }
}

export function bindApiFetch<P extends object, Res>(
  config: FetchConfig,
  api: BodilessApi<P, Res>
): FetchApiFunction<P, Res> {
  if (typeof api.route === "object") {
    return ((params: P) => fetchApi(config, api, params)) as any
  } else {
    return (() => fetchApi(config, api, {} as any)) as any
  }
}

export function bindApiPost<P extends object, Req, Res>(
  config: FetchConfig,
  api: BodifulApi<P, Req, Res>
): PostApiFunction<P, Req, Res> {
  if (typeof api.route === "object") {
    return ((params: P, req: Req) => postApi(config, api, params, req)) as any
  } else {
    return ((req: Req) => postApi(config, api, {} as any, req)) as any
  }
}
