import {createContext, type PropsWithChildren, useContext, useId, useMemo} from 'react'

export type IdContextProps = {
  /**
   * The prefix for use with unique `id` attributes for the list view and its subcomponents.
   */
  idPrefix: string
}

export const IdContext = createContext<IdContextProps | undefined>(undefined)

export const IdProvider = ({children}: PropsWithChildren) => {
  const idPrefix = useId()
  const contextProps = useMemo(() => ({idPrefix}) satisfies IdContextProps, [idPrefix])

  return <IdContext.Provider value={contextProps}>{children}</IdContext.Provider>
}

IdProvider.displayName = 'ListViewIdProvider'

export const useListViewId = () => {
  const context = useContext(IdContext)
  if (!context) throw new Error('useListViewId must be used with IdProvider.')
  return context
}

/**
 * Determine if it's safe to use the `useListViewId` hook.
 * @returns true when called from within a ListView component
 */
export const useIsWithinListView = () => {
  return useContext(IdContext) !== undefined
}
