import {createContext, useContext} from 'react'
import type {DialogContextValue} from '../security-products-enablement-types'

export const DialogContext = createContext<DialogContextValue | undefined>(undefined)

export function useDialogContext() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialogContext must be used within a DialogProvider')
  }
  return context
}
