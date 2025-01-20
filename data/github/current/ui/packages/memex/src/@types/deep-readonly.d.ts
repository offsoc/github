type DeepReadonly<T> = T extends Array<infer R>
  ? DeepReadonlyArray<R>
  : T extends (...args: Array<any>) => any
    ? T
    : T extends object
      ? DeepReadonlyObject<T>
      : T

type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}
