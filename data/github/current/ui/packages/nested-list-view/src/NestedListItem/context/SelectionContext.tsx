import {announce} from '@github-ui/aria-live'
import {noop} from '@github-ui/noop'
import {createContext, type PropsWithChildren, useContext, useMemo} from 'react'

import {useNestedListItemTitle} from './TitleContext'

export type NestedListItemSelectionContextProps = {
  isSelected: boolean
  onSelect: (isSelected: boolean) => void
}

const NestedListItemSelectionContext = createContext<NestedListItemSelectionContextProps>({
  isSelected: false,
  onSelect: noop,
})

type NestedListItemSelectionProviderProps = PropsWithChildren & {value: NestedListItemSelectionContextProps}

export const NestedListItemSelectionProvider = ({
  children,
  value: {isSelected, onSelect},
}: NestedListItemSelectionProviderProps) => {
  const {title} = useNestedListItemTitle()

  const contextProps = useMemo(() => {
    const onSelectAndAnnounce = (selected: boolean) => {
      announce(selected ? `Selected. ${title}.` : `Unselected. ${title}.`)
      onSelect(selected)
    }
    return {isSelected, onSelect: onSelectAndAnnounce}
  }, [isSelected, onSelect, title])
  return (
    <NestedListItemSelectionContext.Provider value={contextProps}>{children}</NestedListItemSelectionContext.Provider>
  )
}

export const useNestedListItemSelection = () => {
  return useContext(NestedListItemSelectionContext)
}
