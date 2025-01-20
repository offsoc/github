/**
 * A method mirroring typescripts non-null assertion
 * type operator, but with the benefit of being easy to search
 * for in code
 *
 * In the general case we should avoiding using this method, and instead
 * use `invariant` to throw an error if the value is null or undefined
 * or do an explicit check instead
 */
export function not_typesafe_nonNullAssertion<T>(value: T | null | undefined) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return value!
}
