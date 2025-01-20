import {createContext, useContext} from 'react'

export const AppPayloadContext = createContext<unknown>(undefined)

export function useAppPayload<T>(): T {
  const appPayload = useContext(AppPayloadContext)

  return appPayload as T
}
