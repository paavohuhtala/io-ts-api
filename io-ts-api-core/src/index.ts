import * as t from "io-ts"
import { NumberFromString } from "./codecs"
export * from "./codecs"

type TypeFromString<T> = t.Type<T, any, unknown>

type StringifiedType<T extends object> = {
  [K in keyof T]: TypeFromString<T[K]>
}
type Stringified<T extends object> = { [K in keyof T]: string }

type DynamicRoute<P extends object> = {
  paramTypes: t.InterfaceType<StringifiedType<P>, P, Stringified<P>, unknown>
  format: (props: P | Stringified<P>) => string
}

type StaticRoute = string

type Route<P extends object> = StaticRoute | DynamicRoute<P>

type HttpMethodWithBody = "post" | "put"
type HttpMethodWithoutBody = "get" | "head" | "delete"

export type BodilessApi<P extends object, Res extends t.Any> = {
  method: HttpMethodWithoutBody
  route: Route<P>
  resType: Res
}
export type AnyBodilessApi = BodilessApi<any, t.Any>

export type BodifulApi<
  P extends object,
  Req extends t.Any,
  Res extends t.Any
> = {
  method: HttpMethodWithBody
  route: Route<P>
  reqType: Req
  resType: Res
}
export type AnyBodifulApi = BodifulApi<any, t.Any, t.Any>

export type Api<P extends object, Req extends t.Any, Res extends t.Any> =
  | BodilessApi<P, Res>
  | BodifulApi<P, Req, Res>

export type AnyApi = AnyBodilessApi | AnyBodifulApi

export function defineApi<A extends AnyApi>(api: A): A {
  return api
}

export type ParamsOf<A extends AnyApi> = A extends Api<infer Params, any, any>
  ? Params
  : never
export type ReqOf<A extends AnyApi> = A extends Api<any, infer Req, any>
  ? t.TypeOf<Req>
  : never
export type ResOf<A extends AnyApi> = A extends Api<any, any, infer Res>
  ? t.TypeOf<Res>
  : never

export const hasRequestBody = (api: AnyApi): api is BodifulApi<any, any, any> =>
  api.method == "put" || api.method == "post"
