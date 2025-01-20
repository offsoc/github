import {useContext} from 'react'

import {ColumnsStableContext} from './columns-state-provider'

/**
 * Accesses the ColumnsContext, which contains state related to the columns
 * of a project. Consuming this context will _not_ cause a component to re-render
 * any time the state changes, because it only contains a ref to the state
 * @returns The value of the ColumnsContext
 */
export const useColumnsStableContext = () => {
  const context = useContext(ColumnsStableContext)
  if (!context) {
    throw new Error('useColumnsStableContext must be used within a ColumnsStableContext.Provider')
  }

  return context
}
