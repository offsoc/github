import {useContext} from 'react'

import {ColumnsContext} from './columns-state-provider'

/**
 * Accesses the ColumnsContext, which contains state related to the columns
 * of a project. Consuming this context will cause a component to re-render
 * any time the state changes.
 * @returns The value of the ColumnsContext
 */
export const useColumnsContext = () => {
  const context = useContext(ColumnsContext)
  if (!context) {
    throw new Error('useColumnsContext must be used within a ColumnsContext.Provider')
  }

  return context
}
