import {createContext, memo, useEffect, useMemo, useState} from 'react'

import {apiGetArchiveStatus} from '../../api/memex-items/api-get-archive-status'
import {debounceAsync, type DebouncedAsyncFunction} from '../../helpers/debounce-async'
import {getInitialState} from '../../helpers/initial-state'
import {useMemexItems} from '../memex-items/use-memex-items'

/**
 * 500ms is used because the function to be debounced is usually called very quickly in succession.
 * For example, when an item is archived, setArchiveStatus is invoked after the optimistic UI update (item.length changes)
 * and quickly again after the request to archive responds.
 */
export const DEBOUNCE_DELAY = 500

/**
 * This context exposes the project archive status to the project such that enabled workflows containing
 * archive_project_item actions can be disabled when the archive is full and the user can see a warning
 * message in the workflow editor.
 */

export type ArchiveStatusContextType = {
  isArchiveFull: boolean
  shouldDisableArchiveForActiveWorkflow: boolean
  setShouldDisableArchiveForActiveWorkflow: (value: boolean) => void
  setArchiveStatus: DebouncedAsyncFunction<() => Promise<void>>
}

export const ArchiveStatusContext = createContext<ArchiveStatusContextType | null>(null)

export const ArchiveStatusProvider = memo(function ArchiveStatusProvider({children}: {children: React.ReactNode}) {
  const {items} = useMemexItems()
  const {loggedInUser} = getInitialState()
  const [isArchiveFull, setIsArchiveFull] = useState<boolean>(false)
  const [shouldDisableArchiveForActiveWorkflow, setShouldDisableArchiveForActiveWorkflow] = useState<boolean>(false)

  const setArchiveStatus = useMemo(
    () =>
      debounceAsync(async () => {
        if (loggedInUser) {
          try {
            const {isArchiveFull: limitReached} = await apiGetArchiveStatus()
            setIsArchiveFull(limitReached)
          } catch (error) {
            // do not show archive status to users without write permission
            setIsArchiveFull(false)
          }
        }
      }, DEBOUNCE_DELAY),
    [loggedInUser],
  )

  useEffect(() => {
    // Number of memex items is needed in the dependency array because archive status needs to be updated
    // after the auto-archive workflow is run
    setArchiveStatus()

    return () => {
      setArchiveStatus.cancel()
    }
  }, [setArchiveStatus, items.length])

  return (
    <ArchiveStatusContext.Provider
      value={useMemo(
        () => ({
          isArchiveFull,
          setArchiveStatus,
          shouldDisableArchiveForActiveWorkflow,
          setShouldDisableArchiveForActiveWorkflow,
        }),
        [isArchiveFull, setArchiveStatus, shouldDisableArchiveForActiveWorkflow],
      )}
    >
      {children}
    </ArchiveStatusContext.Provider>
  )
})
