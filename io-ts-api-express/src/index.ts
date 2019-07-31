import * as t from "io-ts"
import { either } from "fp-ts"
import { Request, Response, Router } from "express"
import {
  Api,
  ReqOf,
  ResOf,
  ParamsOf,
  AnyApi,
  hasRequestBody
} from "io-ts-api-core"

export type ApiRequest<Params extends object, Req extends t.Any> = Omit<
  Request,
  "body" | "params"
> & {
  params: Params
  body: t.TypeOf<Req>
}

export type ApiResponse<Res extends t.Any> = Omit<Response, "send"> & {
  send(obj: t.TypeOf<Res>): void
}

function formatRoute(api: AnyApi) {
  if (typeof api.route === "string") {
    return api.route
  }

  const placeholders = Object.keys(api.route.paramTypes.props).reduce(
    (obj, k) => ({ ...obj, [k]: ":" + k }),
    {}
  )
  return api.route.format(placeholders)
}

export function mountApi<
  P extends object | never,
  Req extends t.Any,
  Res extends t.Any
>(
  router: Router,
  api: Api<P, Req, Res>,
  cb: (req: ApiRequest<P, Req>, res: ApiResponse<Res>) => unknown
) {
  const route = formatRoute(api)

  router[api.method](route, (req: Request, res: Response) => {
    if (hasRequestBody(api)) {
      if (!api.reqType.is(req.body)) {
        return res.sendStatus(400)
      }
    }

    if (typeof api.route === "object") {
      const parsedParams = api.route.paramTypes.decode(req.params)
      if (either.isLeft(parsedParams)) {
        return res.sendStatus(400)
      }

      req.params = parsedParams
    }

    cb(req, res)
  })
}
