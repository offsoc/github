import {createContext, memo, useCallback, useContext, useMemo, useState} from 'react'

import {shallowEqual} from '../../helpers/util'

type ColumnIdType = string | number

type CellValidationState = {
  rowId: string
  colId: ColumnIdType
  validationMessage: string
}

type CellValidationContextType = {
  validationState: CellValidationState | undefined
  setValidationMessage: (validationMessage: string, rowId: string, colId: ColumnIdType) => void
  clearValidationMessage: () => void
}

const CellValidationContext = createContext<CellValidationContextType | null>(null)

export const CellValidationContextProvider = memo(function CellValidationContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [validationState, setValidationState] = useState<CellValidationState | undefined>(undefined)

  const setValidationMessage = useCallback((validationMessage: string, rowId: string, colId: ColumnIdType) => {
    const newState = {validationMessage, rowId, colId}
    setValidationState(currentState => {
      // We don't want to re-render if the state has not changed
      // Returning currentState will kick in React's Object.is equality check, which
      // will succeed and not trigger a re-render
      // https://reactjs.org/docs/hooks-reference.html#bailing-out-of-a-state-update
      if (currentState !== undefined && shallowEqual(currentState, newState)) {
        return currentState
      }

      return newState
    })
  }, [])

  const clearValidationMessage = useCallback(() => {
    setValidationState(undefined)
  }, [])

  const value = useMemo(() => {
    return {validationState, setValidationMessage, clearValidationMessage}
  }, [clearValidationMessage, setValidationMessage, validationState])

  return <CellValidationContext.Provider value={value}>{children}</CellValidationContext.Provider>
})

export function useCellValidationMessage(rowId: string, colId: ColumnIdType) {
  const context = useContext(CellValidationContext)
  if (!context) {
    throw new Error('Wrap use of `useCellValidationMessage` in `CellValidationContext` provider')
  }
  let validationMessage: string | undefined = undefined
  if (context.validationState && context.validationState.rowId === rowId && context.validationState.colId === colId) {
    validationMessage = context.validationState.validationMessage
  }
  return {
    validationMessage,
    setValidationMessage: context.setValidationMessage,
    clearValidationMessage: context.clearValidationMessage,
    validationMessageId: validationMessage && 'table-cell-validation-message',
  }
}
