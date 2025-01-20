import {announce} from '@github-ui/aria-live'
import {noop} from '@github-ui/noop'
import {createContext, type PropsWithChildren, useContext, useMemo} from 'react'

import {useListItemTitle} from './TitleContext'

export type SelectionContextProps = {
  isSelected: boolean
  onSelect: (isSelected: boolean) => void
}

const SelectionContext = createContext<SelectionContextProps>({isSelected: false, onSelect: noop})

type SelectionProviderProps = PropsWithChildren & {value: SelectionContextProps}

export const SelectionProvider = ({children, value: {isSelected, onSelect}}: SelectionProviderProps) => {
  const {title} = useListItemTitle()

  const contextProps = useMemo(() => {
    const onSelectAndAnnounce = (selected: boolean) => {
      announce(selected ? `Selected. ${title}.` : `Unselected. ${title}.`)
      onSelect(selected)
    }
    return {isSelected, onSelect: onSelectAndAnnounce}
  }, [isSelected, onSelect, title])
  return <SelectionContext.Provider value={contextProps}>{children}</SelectionContext.Provider>
}
SelectionProvider.displayName = 'ListItemSelectionProvider'

export const useListItemSelection = () => {
  return useContext(SelectionContext)
}
