import {assert} from './assert'

// Type for a `non-empty` and `defined` array.
export type NonEmptyArray<T> = ([T, ...T[]] | [...T[], T] | [T, ...T[], T]) & {0: T} & NonNullable<T[]>

/**
 * Asserts that an array is not empty and is defined(non null or undefined).
 *
 * ## Examples
 *
 * ```typescript
 * // a simple assert with an error message
 * assertNonEmptyArray([1, 2], 'Must be non-empty array.')
 *
 * // also throws if array is not defined
 * let array: number[] | null = null
 * assertNonEmptyArray(array, 'Must be non-empty array.')
 * ```
 */
export function assertNonEmptyArray<T>(
  array: T[],
  error: string | NonNullable<Error>,
): asserts array is NonEmptyArray<T> {
  const nullError = `Provided array is null or undefined: ${error}`
  assert(array != null, nullError)

  assert(array.length > 0, error)
}
