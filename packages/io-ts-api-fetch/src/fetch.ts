import * as t from "io-ts"
import { PathReporter } from "io-ts/lib/PathReporter"
import {
  BodilessApi,
  BodifulApi,
  AnyApi,
  isBodifulApi,
  Api
} from "io-ts-api-core"
import fetch from "cross-fetch"
import { Route } from "io-ts-api-core"
import { isLeft } from "fp-ts/lib/Either"

type FetchApiFunction<P extends object, Res> = object extends P
  ? (() => Promise<Res>)
  : ((params: P) => Promise<Res>)

type PostApiFunction<P extends object, Req, Res> = object extends P
  ? ((req: Req) => Promise<Res>)
  : ((params: P, req: Req) => Promise<Res>)

type BoundApiFunction<A extends AnyApi> = A extends BodilessApi<
  infer P,
  infer Res
>
  ? FetchApiFunction<P, Res>
  : A extends BodifulApi<infer P, infer Req, infer Res>
  ? PostApiFunction<P, Req, Res>
  : never

export interface FetchConfig {
  baseUrl: string
  credentials?: Request["credentials"]
  headers?: Record<string, string>
  validateResponse?: boolean
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

  if (api.resType.name === t.void.name) {
    return undefined as any
  }

  const resJson = await res.json()

  if (config.validateResponse) {
    const validated = api.resType.decode(resJson)
    if (isLeft(validated)) {
      throw new Error(
        `Unexpected response from server: ${PathReporter.report(validated)}`
      )
    }
  }

  return resJson as Res
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

  if (api.resType.name === t.void.name) {
    return undefined as any
  }

  const resJson = await res.json()

  if (config.validateResponse) {
    const validated = api.resType.decode(resJson)
    if (isLeft(validated)) {
      throw new Error(
        `Unexpected response from server: ${PathReporter.report(validated)}`
      )
    }
  }

  return resJson as Res
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

export function bindApi<P extends object, Res>(
  config: FetchConfig,
  api: BodilessApi<P, Res>
): FetchApiFunction<P, Res>
export function bindApi<P extends object, Req, Res>(
  config: FetchConfig,
  api: BodifulApi<P, Req, Res>
): PostApiFunction<P, Req, Res>
export function bindApi(
  config: FetchConfig,
  api: AnyApi
): BoundApiFunction<any> {
  if (isBodifulApi(api)) {
    return bindApiPost(config, api)
  }
  return bindApiFetch(config, api)
}

type Endpoints = Record<string, AnyApi>
type BoundApis<E extends Endpoints> = { [K in keyof E]: BoundApiFunction<E[K]> }

export function bindAll<E extends Endpoints>(
  config: FetchConfig,
  endpoints: E
): BoundApis<E> {
  return Object.entries(endpoints)
    .map(e => [e[0], bindApi(config, e[1] as any)] as const)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}) as BoundApis<E>
}
