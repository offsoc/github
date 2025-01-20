import {useColumnsContext} from './use-columns-context'

/**
 * Returns a list of all columns in the project.
 *
 * This accesses the state of the ColumnsContext, so it will cause components
 * consuming this hook to re-render when that state changes.
 *
 * @returns The value of the ColumnsContext
 */
export const useAllColumns = () => {
  return useColumnsContext()
}
