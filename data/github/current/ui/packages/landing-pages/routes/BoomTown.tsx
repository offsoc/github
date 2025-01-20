import {z} from 'zod'

export function BoomTown() {
  /**
   * This should throw a ZodError that is caught by the ErrorBoundary
   * at the top of the tree (App.tsx).
   */
  z.number().parse('This is not a number')

  /**
   * This shouldn't render because the above line throws an error.
   */
  return <h1>BoomTown</h1>
}
