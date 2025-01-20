import type {SuggestedChange} from '@github-ui/conversations'
import {isSuggestedChangeEqual, isSuggestedChangeInPendingBatch} from '@github-ui/conversations/suggested-changes'
import safeStorage from '@github-ui/safe-storage'
import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import type {PropsWithChildren} from 'react'
import {createContext, useCallback, useContext, useEffect, useMemo} from 'react'

import type {ItemIdentifier} from '../types/pull-request'

const localStorage = safeStorage('localStorage')

/**
 * Checks if an object is a SuggestedChange.
 */
function isSuggestedChange(object: unknown): object is SuggestedChange {
  if (typeof object !== 'object' || object === null) return false

  // test the properties on the object
  const suggestedChange = object as SuggestedChange
  if (
    typeof suggestedChange.commentId !== 'string' ||
    typeof suggestedChange.path !== 'string' ||
    typeof suggestedChange.threadId !== 'string' ||
    typeof suggestedChange.authorLogin !== 'string'
  )
    return false
  if (typeof suggestedChange.lineRange !== 'object' || !suggestedChange.lineRange) return false
  const {endLineNumber, endOrientation, startLineNumber, startOrientation} = suggestedChange.lineRange
  if (
    typeof endLineNumber !== 'number' ||
    typeof endOrientation !== 'string' ||
    typeof startLineNumber !== 'number' ||
    typeof startOrientation !== 'string'
  )
    return false

  return Array.isArray(suggestedChange.suggestion) && !suggestedChange.suggestion.some(s => typeof s !== 'string')
}

type PendingSuggestedChangesBatchContextData = {
  addSuggestedChangeToBatch: (suggestedChange: SuggestedChange) => void
  clearSuggestedChangesBatch: () => void
  pendingSuggestedChangesBatch: SuggestedChange[]
  removeSuggestedChangeFromBatch: (suggestedChangeToRemove: SuggestedChange) => void
}

export const PendingSuggestedChangesBatch = createContext<PendingSuggestedChangesBatchContextData | null>(null)

/**
 * Builds a unique key for the pending suggested changes batch. Includes the headRefOid
 * to ensure that the batch is only used for the current head of the PR, since that's the only version for which
 * the current suggested changes batch is guaranteed to be valid.
 */
export const buildStorageKey = (owner: string, repo: string, number: string, headRefOid: string) =>
  `pendingSuggestedChangesBatch:${owner}:${repo}:${number}:${headRefOid}`

export type PendingSuggestedChangesBatchContextProviderProps = PropsWithChildren<
  ItemIdentifier & {
    headRefOid: string
  }
>

export function PendingSuggestedChangesBatchContextProvider({
  children,
  headRefOid,
  number,
  owner,
  repo,
}: PendingSuggestedChangesBatchContextProviderProps) {
  const storageKey = buildStorageKey(owner, repo, number.toString(), headRefOid)
  const localStorageDispatch = useLocalStorage<SuggestedChange[]>(storageKey, [])
  let [pendingSuggestedChangesBatch] = localStorageDispatch
  const [, setPendingSuggestedChangesBatch] = localStorageDispatch
  const prevStorageKey = buildStorageKey(owner, repo, number.toString(), headRefOid)

  // Check that all the suggested changes in the batch are well-formed since data from local storage
  // isn't guaranteed to be in any particular state.
  // Note that we only filter if we need to so we can keep the same reference to the array if possible.
  if (Array.isArray(pendingSuggestedChangesBatch) && pendingSuggestedChangesBatch.some(sc => !isSuggestedChange(sc))) {
    pendingSuggestedChangesBatch = pendingSuggestedChangesBatch.filter(isSuggestedChange)
  }

  const addSuggestedChangeToBatch = useCallback(
    (suggestedChange: SuggestedChange) => {
      let nextBatch = pendingSuggestedChangesBatch
      if (isSuggestedChangeInPendingBatch(suggestedChange, nextBatch)) return
      else if (!nextBatch) nextBatch = [suggestedChange]
      else nextBatch = [...nextBatch, suggestedChange]

      setPendingSuggestedChangesBatch(nextBatch)
    },
    [pendingSuggestedChangesBatch, setPendingSuggestedChangesBatch],
  )

  const clearSuggestedChangesBatch = useCallback(() => {
    setPendingSuggestedChangesBatch([])
  }, [setPendingSuggestedChangesBatch])

  const removeSuggestedChangeFromBatch = useCallback(
    (suggestedChangeToRemove: SuggestedChange) => {
      setPendingSuggestedChangesBatch([
        ...pendingSuggestedChangesBatch.filter(sc => !isSuggestedChangeEqual(sc, suggestedChangeToRemove)),
      ])
    },
    [pendingSuggestedChangesBatch, setPendingSuggestedChangesBatch],
  )

  useEffect(() => {
    if (prevStorageKey !== storageKey) {
      // If the storage key changed, clear the previous batch from storage
      localStorage.removeItem(prevStorageKey)
    }
  })

  const contextData = useMemo(
    () => ({
      addSuggestedChangeToBatch,
      clearSuggestedChangesBatch,
      pendingSuggestedChangesBatch,
      removeSuggestedChangeFromBatch,
    }),
    [
      addSuggestedChangeToBatch,
      clearSuggestedChangesBatch,
      pendingSuggestedChangesBatch,
      removeSuggestedChangeFromBatch,
    ],
  )

  return <PendingSuggestedChangesBatch.Provider value={contextData}>{children}</PendingSuggestedChangesBatch.Provider>
}

export function usePendingSuggestedChangesBatchContext(): PendingSuggestedChangesBatchContextData {
  const contextData = useContext(PendingSuggestedChangesBatch)
  if (!contextData) {
    throw new Error('usePendingSuggestedChangesBatchContext must be used within a PendingSuggestedChangesBatch')
  }

  return contextData
}
