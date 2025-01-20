import {createContext, memo, useCallback, useContext, useMemo, useState} from 'react'

import type {ItemUpdates} from '../api/columns/contracts/domain'
import type {MemexProjectColumnId} from '../api/columns/contracts/memex-column'
import type {BulkUpdateError} from '../api/memex-items/contracts'

type BulkUpdateItemsContextType = {
  /** The list of opposite updates to make to undo the updates being made */
  reverts: Array<ItemUpdates>

  /** Keep track of the context of a bulk update operation that's about to happen */
  onPreparingToBulkUpdate: (
    newReverts: Array<ItemUpdates>,
    newSelectedItemIds: Array<number>,
    newMemexProjectColumnId: MemexProjectColumnId,
  ) => void

  /** What failures occurred per Memex item when doing a bulk update, if any */
  errorMessageFor: (memexProjectItemId: number, memexProjectColumnId: MemexProjectColumnId) => string | undefined

  /** Once a bulk update has completed, store the errors that were returned, if any */
  setErrors: (errors: Array<BulkUpdateError>) => void

  /** Which column's value is being modified on Memex items, as part of a bulk update */
  memexProjectColumnId: MemexProjectColumnId

  /** Which Memex items are being bulk updated */
  selectedItemIds: Array<number>
}

const BulkUpdateItemsContext = createContext<BulkUpdateItemsContextType | null>(null)

export const useBulkUpdateItemsContext = () => useContext(BulkUpdateItemsContext)

export const BulkUpdateItemsProvider = memo(function BulkUpdateItemsProvider({children}: {children: React.ReactNode}) {
  const [errors, setErrors] = useState<Array<BulkUpdateError>>([])
  const [memexProjectColumnId, setMemexProjectColumnId] = useState<MemexProjectColumnId>(-1)
  const [selectedItemIds, setSelectedItemIds] = useState<Array<number>>([])
  const [reverts, setReverts] = useState<Array<ItemUpdates>>([])

  const errorMessageFor = useCallback(
    (memexProjectItemId: number, columnId: MemexProjectColumnId) => {
      if (errors.length > 0 && columnId === memexProjectColumnId) {
        const error = errors.find(err => Number(err.memexProjectItemId) === memexProjectItemId)
        return error?.message
      }
    },
    [errors, memexProjectColumnId],
  )

  const onPreparingToBulkUpdate = useCallback(
    (
      newReverts: Array<ItemUpdates>,
      newSelectedItemIds: Array<number>,
      newMemexProjectColumnId: MemexProjectColumnId,
    ) => {
      setReverts(newReverts)
      setSelectedItemIds(newSelectedItemIds)
      setMemexProjectColumnId(newMemexProjectColumnId)
      if (errors.length > 0) setErrors([])
    },
    [setReverts, setSelectedItemIds, setMemexProjectColumnId, errors, setErrors],
  )

  const value = useMemo(() => {
    return {
      setErrors,
      memexProjectColumnId,
      errorMessageFor,
      selectedItemIds,
      reverts,
      onPreparingToBulkUpdate,
    }
  }, [setErrors, memexProjectColumnId, selectedItemIds, reverts, errorMessageFor, onPreparingToBulkUpdate])

  return <BulkUpdateItemsContext.Provider value={value}>{children}</BulkUpdateItemsContext.Provider>
})
