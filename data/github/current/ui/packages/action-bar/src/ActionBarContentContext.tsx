import {createContext, type PropsWithChildren, useContext, useMemo} from 'react'

import type {Action, StaticMenuAction} from './types'

export type ActionBarContentContextProps = {
  /**
   * Description of the controls found in the action bar, e.g., "Issue actions", "Markdown formatting tools".
   * Will be used in a hidden label for accessibility purposes.
   */
  label: string
  /**
   * The controls to show in the action bar. These will move into a dropdown menu when the screen isn't big enough to
   * fit them side by side.
   */
  actions?: Action[]

  /**
   * The controls to always show in the overflow menu, even when there's enough space to show them side by side.
   */
  staticMenuActions?: StaticMenuAction[]

  /**
   * Determines accessibility specific behavior of the action bar. Toolbar assigns a toolbar role and enables custom keyboard navigation.
   * Menu uses default browser behavior and does not enable custom keyboard navigation.
   * Defaults to "toolbar"
   */
  variant?: 'toolbar' | 'menu'
}

const ActionBarContentContext = createContext<ActionBarContentContextProps>({
  actions: [],
  staticMenuActions: [],
  label: 'Actions',
})

type ActionBarContentProviderProps = PropsWithChildren & {value: ActionBarContentContextProps}

export const ActionBarContentProvider = ({
  children,
  value: {actions = [], staticMenuActions, variant = 'toolbar', label},
}: ActionBarContentProviderProps) => {
  const value = useMemo(
    () => ({actions, staticMenuActions, variant, label}),
    [actions, staticMenuActions, variant, label],
  )
  return <ActionBarContentContext.Provider value={value}>{children}</ActionBarContentContext.Provider>
}

export const useActionBarContent = () => {
  const context = useContext(ActionBarContentContext)
  if (!context) throw new Error('useActionBarContent must be used with ActionBarContentProvider.')
  return context
}
