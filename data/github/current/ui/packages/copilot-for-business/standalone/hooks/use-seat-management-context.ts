import {createContext, useContext} from 'react'
import type {CopilotStandaloneSeatManagementPayload} from '../types'

export const SeatManagementContext = createContext<{
  payload: CopilotStandaloneSeatManagementPayload
  update: React.Dispatch<React.SetStateAction<CopilotStandaloneSeatManagementPayload>>
} | null>(null)

export function useSeatManagementContext() {
  const context = useContext(SeatManagementContext)
  if (!context) {
    throw new Error('useSeatManagementContext must be used within a SeatManagementContextProvider')
  }
  return context
}
