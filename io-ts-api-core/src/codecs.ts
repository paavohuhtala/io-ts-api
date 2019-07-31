import * as t from "io-ts"

export const NumberFromString = new t.Type<number, string, unknown>(
  "NumberFromString",
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
