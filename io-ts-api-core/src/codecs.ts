import * as t from "io-ts"

export const IntFromString = new t.Type<number, string, unknown>(
  "IntFromString",
  t.number.is,
  (u, c) => {
    if (typeof u !== "string") {
      return t.failure(u, c)
    }
    const num = parseInt(u, 10)
    if (isNaN(num)) {
      return t.failure(u, c)
    }
    return t.success(num)
  },
  String
)
