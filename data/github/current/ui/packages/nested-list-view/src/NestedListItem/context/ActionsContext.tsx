import {noop} from '@github-ui/noop'
import type {Dispatch, PropsWithChildren, SetStateAction} from 'react'
import {createContext, useContext, useMemo, useState} from 'react'

type NestedListItemActionsContextProps = {
  actionsOpen: boolean
  setActionsOpen: Dispatch<SetStateAction<boolean>>
}

const NestedListItemActionsContext = createContext<NestedListItemActionsContextProps>({
  actionsOpen: false,
  setActionsOpen: noop,
})

export const NestedListItemActionsProvider = ({children}: PropsWithChildren) => {
  const [actionsOpen, setActionsOpen] = useState(false)
  const contextProps = useMemo(() => ({actionsOpen, setActionsOpen}), [actionsOpen])
  return <NestedListItemActionsContext.Provider value={contextProps}>{children}</NestedListItemActionsContext.Provider>
}

export const useNestedListItemActions = () => {
  return useContext(NestedListItemActionsContext)
}
