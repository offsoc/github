import type {PropsWithChildren} from 'react'
import {createContext, useContext, useMemo, useState} from 'react'

import {MergeMethod} from '../types'

interface MergeMethodContextData {
  mergeMethod: MergeMethod
  setMergeMethod: (mergeMethod: MergeMethod) => void
}

export const MergeMethodContext = createContext<MergeMethodContextData>({
  mergeMethod: MergeMethod.MERGE,
  setMergeMethod: () => {},
})

export function MergeMethodContextProvider({
  children,
  defaultMergeMethod,
}: PropsWithChildren<{defaultMergeMethod: MergeMethod}>) {
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>(defaultMergeMethod)

  const value = useMemo(
    () => ({
      mergeMethod,
      setMergeMethod,
    }),
    [mergeMethod],
  )

  return <MergeMethodContext.Provider value={value}>{children}</MergeMethodContext.Provider>
}

export function useMergeMethodContext(): MergeMethodContextData {
  const contextData = useContext(MergeMethodContext)
  return contextData
}
