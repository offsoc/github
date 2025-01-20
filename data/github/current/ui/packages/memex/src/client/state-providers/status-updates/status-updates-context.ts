import {createContext, useContext} from 'react'

import type {PersistedOption} from '../../api/columns/contracts/single-select'
import type {MemexStatus} from '../../api/memex/contracts'

export type StatusUpdate = {
  id: number
  body: string
  startDate: Date | null
  status: PersistedOption | null
  targetDate: Date | null
}

type StatusUpdatesContext = {
  memexStatusItems: Array<MemexStatus>
  statusOptions: Array<PersistedOption>
  addStatusUpdate: (statusUpdate: StatusUpdate) => Promise<void>
  deleteStatusUpdate: (id: number) => void
  updateStatusUpdate: (statusUpdate: StatusUpdate) => Promise<MemexStatus>
  isLoading: boolean
  statusUpdateIdParam: string | null
  latestStatusItem: MemexStatus | undefined
}

export const StatusUpdatesContext = createContext<StatusUpdatesContext | null>(null)

export function useStatusUpdates() {
  const context = useContext(StatusUpdatesContext)

  if (!context) {
    throw new Error('useStatusUpdates must be used within a StatusUpdatesContext.Provider.')
  }

  return context
}
