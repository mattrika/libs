// Wire / JSON-compatible frontend type (handles Date & null serialization over HTTP)
type NullKeys<T> = {
    [K in keyof T]-?: null extends T[K] ? K : never
}[keyof T]

export type SerializedOptional<T> = T extends Date
    ? string
    : T extends (infer U)[]
      ? SerializedOptional<U>[]
      : T extends object
        ? {
              [K in Exclude<keyof T, NullKeys<T>>]: SerializedOptional<T[K]>
          } & {
              [K in NullKeys<T>]?: SerializedOptional<Exclude<T[K], null>>
          }
        : T
