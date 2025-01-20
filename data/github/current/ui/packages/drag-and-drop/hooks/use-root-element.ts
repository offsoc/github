import {useContext} from 'react'

import {RootElementContext} from '../context/RootElementContext'

export function useRootElement() {
  const rootElement = useContext(RootElementContext)
  return rootElement
}
