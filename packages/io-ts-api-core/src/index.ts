import * as t from "io-ts"
export * from "./codecs"

type TypeFromString<T> = t.Type<T, any, unknown>

type StringifiedType<T extends object> = {
  [K in keyof T]: TypeFromString<T[K]>
}
type Stringified<T extends object> = { [K in keyof T]: string }

export type DynamicRoute<P extends object> = {
  paramTypes: t.InterfaceType<StringifiedType<P>, P, Stringified<P>, unknown>
  format: (props: P | Stringified<P>) => string
}
export type StaticRoute = string
export type Route<P extends object> = StaticRoute | DynamicRoute<P>

type HttpMethodWithBody = "post" | "put"
type HttpMethodWithoutBody = "get" | "head" | "delete"

export type BodilessApi<P extends object, Res> = {
  method: HttpMethodWithoutBody
  route: Route<P>
  resType: t.Type<Res>
}
export type AnyBodilessApi = BodilessApi<any, any>

export type BodifulApi<P extends object, Req, Res> = {
  method: HttpMethodWithBody
  route: Route<P>
  reqType: t.Type<Req>
  resType: t.Type<Res>
}
export type AnyBodifulApi = BodifulApi<any, any, any>

export type Api<P extends object, Req, Res> =
  | BodilessApi<P, Res>
  | BodifulApi<P, Req, Res>

export type AnyApi = AnyBodilessApi | AnyBodifulApi

export function defineEndpoint<A extends AnyApi>(api: A): A {
  return api
}

export type ParamsOf<A extends AnyApi> = A extends Api<infer Params, any, any>
  ? Params
  : never
export type ReqOf<A extends AnyApi> = A extends Api<any, infer Req, any>
  ? Req
  : never
export type ResOf<A extends AnyApi> = A extends Api<any, any, infer Res>
  ? Res
  : never

export function isBodifulApi<P extends object, Req, Res>(
  api: Api<P, Req, Res>
): api is BodifulApi<P, Req, Res> {
  return api.method == "put" || api.method == "post"
}
