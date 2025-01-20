/**
 * Asserts that a provided condition is `true`, throwing an error
 * with the provided error or error message otherwise.
 *
 * ## Examples
 *
 * ```typescript
 * // an assert with an error message
 * assert(1 === 1, 'Math is broken.')
 *
 * // an assert with an error object
 * assert(2 === 2, new Error('Math is broken.'))
 * ```
 */
export function assert(condition: boolean, error: string | NonNullable<Error>): asserts condition is true {
  if (condition !== true) {
    const errorToThrow = typeof error === 'string' ? new Error(error) : error

    throw errorToThrow
  }
}
