export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type ExactDeep<T, Shape> = T extends Shape
  ? Shape extends object
    ? T extends object
    ? {
        [K in keyof T]: K extends keyof Shape
          ? ExactDeep<T[K], Shape[K]>
          : never
      } & (Exclude<keyof T, keyof Shape> extends never ? unknown : never)
      : T
    : T
  : never
