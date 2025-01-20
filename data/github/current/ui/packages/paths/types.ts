export type PathParams = Record<string, string | number> | undefined
export type PathFunction<T extends PathParams | void = void> = (args: T) => string
export type Query = Record<string, string | number | boolean | null | undefined>
