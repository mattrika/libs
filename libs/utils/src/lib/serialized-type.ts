import { Prettify } from './prettify-type.util'

// Wire / JSON-compatible frontend type (handles Date & null serialization over HTTP)
type NullKeys<T> = {
    [K in keyof T]-?: null extends T[K] ? K : never
}[keyof T]

type NonNullPart<T> = Pick<T, Exclude<keyof T, NullKeys<T>>>

export type SerializedOptional<T> = T extends Date
    ? string
    : T extends (infer U)[]
      ? SerializedOptional<U>[]
      : T extends object
        ? Prettify<
              {
                  [K in keyof NonNullPart<T>]: SerializedOptional<
                      NonNullPart<T>[K]
                  >
              } & {
                  [K in NullKeys<T>]?: SerializedOptional<Exclude<T[K], null>>
              }
          >
        : T
