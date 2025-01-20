import {createContext, useContext} from 'react'
import {useGroupTree, type UseGroupTreeResult} from '../hooks/use-group-tree'
import type {Group} from '../types'

const defaultValue: UseGroupTreeResult = {
  tree: undefined,
  groups: [],
  getGroup(_id: number) {
    return undefined
  },
  walkTree(_id: number) {
    return undefined
  },
}

const GroupTreeContext = createContext<UseGroupTreeResult>(defaultValue)

export function GroupTreeProvider({groups, children}: React.PropsWithChildren<{groups: Group[]}>) {
  const value = useGroupTree(groups)
  return <GroupTreeContext.Provider value={value}>{children}</GroupTreeContext.Provider>
}

export function useGroupTreeContext() {
  const context = useContext(GroupTreeContext)
  if (context === undefined) {
    throw new Error('useGroupTreeContext must be within GroupTreeProvider')
  }
  return context
}
