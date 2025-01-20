import {createContext, type PropsWithChildren, useContext, useId, useMemo, useState} from 'react'

export type PropertiesContextProps = {
  /**
   * The prefix for use with unique `id` attributes for the list view and its subcomponents.
   */
  idPrefix: string

  /**
   * Parameter to control whether the title component can collapse the tree view completely
   */
  isCollapsible: boolean
  /*
   * An option to disable dragging and selection on the Nested List View
   */
  isReadOnly?: boolean
  /**
   * Parameter to control whether the tree view is expanded or collapsed
   */
  isExpanded: boolean
  setIsExpanded: (isExpanded: boolean) => void
}

const PropertiesContext = createContext<PropertiesContextProps | undefined>(undefined)

export type PropertiesProviderProps = PropsWithChildren<{
  isCollapsible?: boolean
  isReadOnly?: boolean
}>

export const PropertiesProvider = ({children, isCollapsible = false, isReadOnly = false}: PropertiesProviderProps) => {
  const idPrefix = useId()
  const [isExpanded, setIsExpanded] = useState(true)
  const contextProps = useMemo(
    () => ({idPrefix, isExpanded, setIsExpanded, isCollapsible, isReadOnly}) satisfies PropertiesContextProps,
    [idPrefix, isExpanded, isCollapsible, isReadOnly],
  )

  return <PropertiesContext.Provider value={contextProps}>{children}</PropertiesContext.Provider>
}
PropertiesProvider.displayName = 'NestedListViewPropertiesProvider'

export const useNestedListViewProperties = () => {
  const context = useContext(PropertiesContext)
  if (!context) throw new Error('useNestedListViewProperties must be used with PropertiesProvider.')
  return context
}
