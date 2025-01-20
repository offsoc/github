import {createContext, useContext} from 'react'

export const RootElementContext = createContext<HTMLElement | undefined>(undefined)

export function useRootElement() {
  const rootElement = useContext(RootElementContext)
  return rootElement
}
