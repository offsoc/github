import {type PropsWithChildren, createContext, useContext} from 'react'
import type {RequestType} from '../delegated-bypass-types'

const RequestTypeContext = createContext<RequestType | null>(null)

export function RequestTypeProvider({requestType, children}: PropsWithChildren<{requestType: RequestType}>) {
  return <RequestTypeContext.Provider value={requestType}>{children}</RequestTypeContext.Provider>
}

export function useRequestTypeContext() {
  const context = useContext(RequestTypeContext)

  if (!context) {
    throw new Error('useRequestTypeContext must be used within RequestTypeProvider')
  }

  return context
}
