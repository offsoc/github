import type {PropsWithChildren} from 'react'
import {createContext, useContext} from 'react'

const CustomerIdContext = createContext<string | null>(null)

export function CustomerIdProvider({children, customerId}: PropsWithChildren<{customerId: string}>) {
  return <CustomerIdContext.Provider value={customerId}>{children}</CustomerIdContext.Provider>
}

export function useCustomerId() {
  const context = useContext(CustomerIdContext)

  if (!context) {
    throw new Error('useCustomerId must be used within a CustomerIdContextProvider.')
  }

  return context
}
