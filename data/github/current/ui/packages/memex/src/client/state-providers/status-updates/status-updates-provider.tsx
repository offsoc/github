import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'

import type {PersistedOption} from '../../api/columns/contracts/single-select'
import {apiCreateMemexStatus, apiDestroyMemexStatus} from '../../api/memex/api-create-status'
import {apiGetMemexStatuses} from '../../api/memex/api-get-statuses'
import {apiUpdateMemexStatus} from '../../api/memex/api-update-status'
import type {MemexStatus} from '../../api/memex/contracts'
import {getInitialState} from '../../helpers/initial-state'
import {fetchJSONIslandData} from '../../helpers/json-island'
import {formatISODateString} from '../../helpers/parsing'
import {useSidePanel} from '../../hooks/use-side-panel'
import {STATUS_UPDATE_ID_PARAM} from '../../platform/url'
import {useSearchParams} from '../../router'
import {useNotificationSubscriptions} from '../notification-subscriptions/notification-subscriptions-context'
import {useCreateStatusUpdateReducer} from './hooks/use-status-updates-editor-reducer'
import {type StatusUpdate, StatusUpdatesContext} from './status-updates-context'
import {StatusUpdatesEditorStateContext} from './status-updates-editor-state-context'

export const MemexStatusItemsProvider = memo(function MemexStatusItemsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const {loggedInUser} = getInitialState()
  const {sidePanelState} = useSidePanel()
  const {statusUpdateDrafts, statusUpdateDraftsDispatch} = useCreateStatusUpdateReducer()
  const {setViewerIsSubscribed} = useNotificationSubscriptions()
  const [memexStatusItems, setMemexStatusItems] = useState<Array<MemexStatus>>([])
  const [statusOptions, setStatusOptions] = useState<Array<PersistedOption>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [latestStatusItem, setLatestStatusItem] = useState<MemexStatus | undefined>(
    fetchJSONIslandData('latest-memex-project-status'),
  )

  const fetchingRef = useRef(false)
  const [searchParams] = useSearchParams()
  const statusUpdateIdParam = searchParams.get(STATUS_UPDATE_ID_PARAM)

  // Only fetch when the 'info' panel is opened
  const sidePanelOpen = sidePanelState?.type === 'info'

  useEffect(() => {
    if (fetchingRef.current || !sidePanelOpen) {
      return
    }

    fetchingRef.current = true
    setIsLoading(true)

    apiGetMemexStatuses().then(response => {
      setMemexStatusItems(response.statuses)
      setStatusOptions(response.form.status.options)

      // For now, as live-updates are unavailable, refetch everytime the info panel is opened.
      fetchingRef.current = false
      setIsLoading(false)
    })
  }, [setMemexStatusItems, sidePanelOpen])

  useEffect(() => {
    // sync latest status item, which is intially set from the json island and updated while the info panel is open
    if (sidePanelOpen && !isLoading) {
      setLatestStatusItem(memexStatusItems[0])
    }
  }, [isLoading, memexStatusItems, sidePanelOpen])

  const addStatusUpdate = useCallback(
    async ({body, startDate, targetDate, status}: StatusUpdate) => {
      if (!loggedInUser) {
        throw new Error('Must be logged in to create a status update')
      }

      const {status: newStatus, viewerIsSubscribed} = await apiCreateMemexStatus({
        body,
        startDate: startDate ? formatISODateString(startDate) : '',
        targetDate: targetDate ? formatISODateString(targetDate) : '',
        statusId: status?.id ?? null,
      })

      // Creating a new status update will automatically subscribe the user to the memex project
      setViewerIsSubscribed(viewerIsSubscribed)
      setMemexStatusItems(statuses => [newStatus, ...statuses])
    },
    [loggedInUser, setViewerIsSubscribed],
  )

  const deleteStatusUpdate = useCallback(
    async (id: number) => {
      setMemexStatusItems(statuses => statuses.filter(s => s.id !== id))

      try {
        await apiDestroyMemexStatus(id)
      } catch {
        setMemexStatusItems(memexStatusItems)
      }
    },
    [memexStatusItems],
  )

  const updateStatusUpdate = useCallback(
    async ({id, body, startDate, targetDate, status}: StatusUpdate) => {
      if (!id) {
        throw new Error('Unable to determine id of status')
      }

      if (!loggedInUser) {
        throw new Error('Must be logged in to update a status update')
      }

      const indexOfStatus = memexStatusItems.findIndex(s => s.id === id)
      const statusItem: MemexStatus | undefined = memexStatusItems[indexOfStatus]
      if (!statusItem) {
        throw new Error('Unable to find memex status')
      }

      const newStatusUpdates = [...memexStatusItems]

      const {status: updatedStatus, viewerIsSubscribed} = await apiUpdateMemexStatus({
        id,
        body,
        startDate: startDate ? formatISODateString(startDate) : '',
        targetDate: targetDate ? formatISODateString(targetDate) : '',
        statusId: status?.id ?? null,
      })

      newStatusUpdates[indexOfStatus] = updatedStatus

      setViewerIsSubscribed(viewerIsSubscribed)
      setMemexStatusItems(newStatusUpdates)
      return updatedStatus
    },
    [loggedInUser, memexStatusItems, setViewerIsSubscribed],
  )

  return (
    <StatusUpdatesEditorStateContext.Provider
      value={useMemo(() => {
        return {
          statusUpdateDrafts,
          statusUpdateDraftsDispatch,
        }
      }, [statusUpdateDrafts, statusUpdateDraftsDispatch])}
    >
      <StatusUpdatesContext.Provider
        value={useMemo(() => {
          return {
            memexStatusItems,
            statusOptions,
            addStatusUpdate,
            deleteStatusUpdate,
            updateStatusUpdate,
            isLoading,
            statusUpdateIdParam,
            latestStatusItem,
          }
        }, [
          memexStatusItems,
          statusOptions,
          addStatusUpdate,
          deleteStatusUpdate,
          updateStatusUpdate,
          isLoading,
          statusUpdateIdParam,
          latestStatusItem,
        ])}
      >
        {children}
      </StatusUpdatesContext.Provider>
    </StatusUpdatesEditorStateContext.Provider>
  )
})
