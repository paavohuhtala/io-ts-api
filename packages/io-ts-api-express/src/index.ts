import { PathReporter } from "io-ts/lib/PathReporter"
import { isLeft } from "fp-ts/es6/Either"
import { Request, Response, Router, json } from "express"
import { Api, AnyApi, isBodifulApi } from "io-ts-api-core"

export type ApiRequest<Params extends object, Req> = Omit<
  Request,
  "body" | "params"
> & {
  params: Params
  body: Req
}

export type ApiResponse<Res> = Omit<Response, "send"> & {
  send(obj: Res): void
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

export function mountApi<P extends object, Req, Res>(
  router: Router,
  api: Api<P, Req, Res>,
  cb: (req: ApiRequest<P, Req>, res: ApiResponse<Res>) => unknown
) {
  const route = formatRoute(api)

  router[api.method](route, json(), (req: Request, res: Response) => {
    if (isBodifulApi(api)) {
      const decoded = api.reqType.decode(req.body)
      if (isLeft(decoded)) {
        return res.status(400).send(PathReporter.report(decoded))
      }
    }

    // This cast should be safe - params is of the right type, but the new express typings don't agree.
    const validatedRequest: ApiRequest<P, Req> = req as any

    if (typeof api.route === "object") {
      const parsedParams = api.route.paramTypes.decode(req.params)
      if (isLeft(parsedParams)) {
        return res.sendStatus(400)
      }

      validatedRequest.params = parsedParams.right
    }

    cb(validatedRequest, res)
  })
}
