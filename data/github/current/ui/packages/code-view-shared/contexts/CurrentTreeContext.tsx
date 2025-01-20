import type {TreePayload} from '@github-ui/code-view-types'
import React from 'react'

const TreeContext = React.createContext({} as TreePayload)

export function useCurrentTree() {
  return React.useContext(TreeContext)
}

export function CurrentTreeProvider({payload, children}: React.PropsWithChildren<{payload: TreePayload}>) {
  return <TreeContext.Provider value={payload}>{children}</TreeContext.Provider>
}
