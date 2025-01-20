import {noop} from '@github-ui/noop'
import type {Dispatch, PropsWithChildren, SetStateAction} from 'react'
import {createContext, useContext, useMemo, useState} from 'react'

type ActionsContextProps = {
  actionsOpen: boolean
  setActionsOpen: Dispatch<SetStateAction<boolean>>
}

const ActionsContext = createContext<ActionsContextProps>({
  actionsOpen: false,
  setActionsOpen: noop,
})

export const ActionsProvider = ({children}: PropsWithChildren) => {
  const [actionsOpen, setActionsOpen] = useState(false)
  const contextProps = useMemo(() => ({actionsOpen, setActionsOpen}), [actionsOpen])
  return <ActionsContext.Provider value={contextProps}>{children}</ActionsContext.Provider>
}
ActionsProvider.displayName = 'ListItemActionsProvider'

export const useListItemActions = () => {
  return useContext(ActionsContext)
}
