import {useContext} from 'react'

import {TableColumnsContext} from './table-columns-provider'

export const useTableColumns = () => {
  const contextValue = useContext(TableColumnsContext)

  if (contextValue === null) {
    throw new Error('useTableColumns must be accessed from within a TableColumnsContext.Provider')
  }

  return contextValue
}
