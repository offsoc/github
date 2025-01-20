import type React from 'react'
import {createContext, useContext} from 'react'

import type {CommitsFilters} from '../types/commits-types'

const emptyFilters: CommitsFilters = {
  since: null,
  until: null,
  author: null,
  currentBlobPath: '',
  pagination: {
    hasNextPage: false,
    hasPreviousPage: false,
    endCursor: '',
    startCursor: '',
  },
  newPath: null,
  originalBranch: null,
}

const FilterContext = createContext<CommitsFilters>(emptyFilters)

export function FilterProvider({filters, children}: React.PropsWithChildren<{filters: CommitsFilters}>) {
  return <FilterContext.Provider value={filters}>{children}</FilterContext.Provider>
}

export function useFilters() {
  return useContext(FilterContext)
}
