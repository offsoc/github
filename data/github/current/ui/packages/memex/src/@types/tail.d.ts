// Returns all values of an array except for the first
type Tail<T extends Array<any>> = T extends [any, ...infer U] ? U : never
