/** This type represents a column value being loaded from the server */
type LoadingState = {state: 'loading'}
/** This type represents a column value being found in the client */
type FoundState<T> = {state: 'found'; value: T}
/** This type represents an "undefined" value being found in the client */
type EmptyState = {state: 'empty'}

/**
 * Wrapper type to support providing an "undefined" value to emulate the
 * reactivity of MobX without access to the MobX `makeObservable`.
 */
export type ColumnValue<T> = FoundState<T> | EmptyState | LoadingState

const ColumnValueState = {
  Found: 'found',
  Empty: 'empty',
  Loading: 'loading',
} as const
type ColumnValueState = ObjectValues<typeof ColumnValueState>

/** Helper function for wrapping a value in the required type */
export function withValue<T>(value: T): FoundState<T> {
  return {state: ColumnValueState.Found, value}
}

/** Shared object used to represent the "loading" state in code */
export const LoadingValue = {state: ColumnValueState.Loading} as const

/** Shared object used to represent the "undefined" state in code */
export const EmptyValue = {state: ColumnValueState.Empty} as const

/** Type guard to check if value is in loading state */
export function isLoading<T>(value: ColumnValue<T>): value is LoadingState {
  return value.state === 'loading'
}

/** Type guard to check if value is in "undefined" state */
export function isEmpty<T>(value: ColumnValue<T>): value is EmptyState {
  return value.state === 'empty'
}

/** Type guard to check if value has been located */
export function hasValue<T>(value: ColumnValue<T>): value is FoundState<T> {
  return value.state === 'found'
}
