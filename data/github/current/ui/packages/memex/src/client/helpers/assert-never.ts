/**
 * This function is a control flow helper, that ensures exhaustive checks
 * have been performed, typically as a default to a switch case, where
 * all valid types should be handled.
 */
export function assertNever(x: never): never {
  throw new Error(
    `${x} has a value, but the types suggest this should not be possible. Did we account for all possible options properly in the typings?`,
  )
}
