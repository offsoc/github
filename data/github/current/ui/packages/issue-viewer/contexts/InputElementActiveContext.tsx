import {createContext, type ReactNode, useCallback, useContext, useMemo, useRef} from 'react'

// Arbitrary input elements that can affect navigating away from the current issue
type InputElementStates = Readonly<Record<string, boolean>>

type InputElementActiveContextType = {
  isAnyInputElementActive: boolean
  setInputElementState: (id: string, state: boolean) => void
  clearInputElementStates: () => void
}

const InputElementActiveContext = createContext<InputElementActiveContextType | null>(null)

type InputElementActiveContextProviderType = {
  children: ReactNode
}

const defaultEmptyState = {}
export function InputElementActiveContextProvider({children}: InputElementActiveContextProviderType) {
  const inputElementStates = useRef<InputElementStates>(defaultEmptyState)
  const setInputElementState = useCallback((id: string, state: boolean) => {
    const previousInputElementStates = inputElementStates.current
    if (previousInputElementStates[id] === state) return inputElementStates.current
    inputElementStates.current = {
      ...previousInputElementStates,
      [id]: state,
    }
    return inputElementStates.current
  }, [])

  const isAnyInputElementActive = useMemo(() => {
    return Object.values(inputElementStates.current).some(s => s)
  }, [inputElementStates])

  const clearInputElementStates = useCallback(() => {
    inputElementStates.current = defaultEmptyState
  }, [])

  const contextValue: InputElementActiveContextType = useMemo(() => {
    return {
      setInputElementState,
      isAnyInputElementActive,
      clearInputElementStates,
    }
  }, [isAnyInputElementActive, setInputElementState, clearInputElementStates])

  return <InputElementActiveContext.Provider value={contextValue}>{children}</InputElementActiveContext.Provider>
}

export const useInputElementActiveContext = () => {
  const context = useContext(InputElementActiveContext)
  if (!context) {
    throw new Error('useInputElementActiveContext must be used within a InputElementActiveContextProvider.')
  }

  return context
}
