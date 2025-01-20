import {createContext, type ReactNode, useCallback, useContext, useMemo, useRef} from 'react'

type ItemPickerOpenStates = Readonly<Record<string, boolean>>

type ItemPickersContextType = {
  // Method to update the open state of an itempicker
  updateOpenState: (id: string, isOpen: boolean) => void
  // Method to get the open state of an itempicker
  anyItemPickerOpen: () => boolean
}

type ItemPickersContextProviderType = {
  children: ReactNode
}

const ItemPickersContext = createContext<ItemPickersContextType>({
  updateOpenState: () => undefined,
  anyItemPickerOpen: () => false,
})

export function ItemPickersContextProvider({children}: ItemPickersContextProviderType) {
  const itemPickerOpenStates = useRef<ItemPickerOpenStates>({})

  const updateOpenState = useCallback((id: string, isOpen: boolean) => {
    const previousState = itemPickerOpenStates.current
    if (previousState[id] === isOpen) return itemPickerOpenStates.current
    itemPickerOpenStates.current = {...previousState, [id]: isOpen}
    return itemPickerOpenStates.current
  }, [])

  const anyItemPickerOpen = useCallback(() => {
    return Object.values(itemPickerOpenStates.current).some(s => s)
  }, [itemPickerOpenStates])

  const contextValue = useMemo(() => {
    return {updateOpenState, anyItemPickerOpen}
  }, [anyItemPickerOpen, updateOpenState])

  return <ItemPickersContext.Provider value={contextValue}>{children}</ItemPickersContext.Provider>
}

export function useItemPickersContext(): ItemPickersContextType {
  const context = useContext(ItemPickersContext)

  if (!context) {
    throw new Error('useItemPickersContext must be used within a ItemPickersContextProvider.')
  }

  return context
}
