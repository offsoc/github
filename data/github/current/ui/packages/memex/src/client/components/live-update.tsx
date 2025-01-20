import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {memo, useCallback, useEffect, useRef} from 'react'

import {cancelGetAllMemexData} from '../api/memex/api-get-all-memex-data'
import {
  isValidBulkCopyEventShape,
  isValidBulkUpdateEventShape,
  isValidMemexRefreshEventShape,
  isValidPaginatedRefreshEvent,
  isValidProjectMigrationEventShape,
  isValidRefreshEventType,
} from '../helpers/alive'
import {getInitialState} from '../helpers/initial-state'
import {useSetTimeout} from '../hooks/common/timeouts/use-timeout'
import {usePreviousValue} from '../hooks/common/use-previous-value'
import {useAliveChannel} from '../hooks/use-alive-channel'
import {useEnabledFeatures} from '../hooks/use-enabled-features'
import {usePageVisibility} from '../hooks/use-page-visibility'
import {useHandleDataRefresh} from '../state-providers/data-refresh/use-handle-data-refresh'
import {useHandlePaginatedDataRefresh} from '../state-providers/data-refresh/use-handle-paginated-data-refresh'
import {useSingleDataRefresh} from '../state-providers/data-refresh/use-single-data-refresh'
import {useProcessProjectMigrationState} from '../state-providers/project-migration/use-process-project-migration-state'
import {BulkCopyResources, BulkUpdateResources} from '../strings'
import useToasts, {type AddToastProps, ToastType} from './toasts/use-toasts'

export const LiveUpdate = memo(function LiveUpdate() {
  const {addToast} = useToasts()
  const addToastAfterDelay = useSetTimeout(addToast)
  const aliveMessageRef = useRef<HTMLSpanElement | null>(null)
  const handleDataRefresh = useHandleDataRefresh()
  const handleSingleMemexUpdate = useSingleDataRefresh()
  const setDataRefreshTimeout = useSetTimeout(handleDataRefresh)
  const {memex_table_without_limits} = useEnabledFeatures()

  const doSingleRefreshWithToast = useCallback(
    async (addToastProps: AddToastProps) => {
      await handleSingleMemexUpdate()
      addToastAfterDelay(2000)(addToastProps)
    },
    [handleSingleMemexUpdate, addToastAfterDelay],
  )
  // Disable this rule to keep paginated behind a FF (FFs are static for the lifetime of the component)
  const handlePaginatedDataRefresh = memex_table_without_limits
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useHandlePaginatedDataRefresh().handleRefresh
    : noop
  const isPageVisible = usePageVisibility()
  const isPageVisiblePrev = usePreviousValue(isPageVisible)
  const {processProjectMigrationState, processProjectMigrationOnPageVisibility, isMigrationComplete} =
    useProcessProjectMigrationState()

  const [attrs] = useAliveChannel(aliveMessageRef, 'message', detail => {
    if (isValidProjectMigrationEventShape(detail.data)) {
      processProjectMigrationState(detail.data.project_migration)
      setDataRefreshTimeout(detail.data.wait ?? 0)()
      return
    }

    if (isValidBulkUpdateEventShape(detail.data)) {
      const {loggedInUser} = getInitialState()
      const {bulkUpdateSuccess, actor, bulkUpdateErrors} = detail.data
      if (actor.id === loggedInUser?.id) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: bulkUpdateSuccess ? ToastType.success : ToastType.error,
          message: bulkUpdateSuccess
            ? BulkUpdateResources.successMessage
            : BulkUpdateResources.refreshPageMessage(bulkUpdateErrors?.length || 0),
        })
      }
    }

    if (isValidMemexRefreshEventShape(detail.data)) {
      const {type} = detail.data

      if (isValidRefreshEventType(type)) {
        /**
         * Messages may have a waitFor attribute,
         * describing how long to wait for replication
         * lag before doing anything
         */
        setDataRefreshTimeout(detail.data.wait ?? 0)()
      }
    } else if (isValidPaginatedRefreshEvent(detail.data)) {
      handlePaginatedDataRefresh(detail.data.timestamp)
    }

    if (isValidBulkCopyEventShape(detail.data)) {
      const {loggedInUser} = getInitialState()
      const {bulkCopySuccess, actor} = detail.data
      if (actor.id === loggedInUser?.id) {
        doSingleRefreshWithToast({
          type: bulkCopySuccess ? ToastType.success : ToastType.error,
          message: bulkCopySuccess ? BulkCopyResources.successMessage : BulkCopyResources.failureMessage,
        })
      }
    }
  })

  useEffect(() => {
    if (isPageVisible) {
      processProjectMigrationOnPageVisibility()
    }

    /**
     * when the page becomes visible, we want to refresh the data
     * since we might have missed updates while it was not visible
     */
    if (isPageVisible && !isPageVisiblePrev) {
      // Refresh item data (noop when MWL is disabled)
      handlePaginatedDataRefresh()
      // Refresh project data (excludes items when MWL is enabled)
      handleDataRefresh()
    }
  }, [
    isPageVisible,
    isPageVisiblePrev,
    handleDataRefresh,
    processProjectMigrationOnPageVisibility,
    isMigrationComplete,
    handlePaginatedDataRefresh,
  ])

  useEffect(() => {
    /**
     * When we unmount, we want to cancel any pending requests
     */
    return () => {
      cancelGetAllMemexData()
    }
  }, [])

  const props = isPageVisible ? attrs : undefined
  return <span {...props} ref={aliveMessageRef} hidden {...testIdProps('live-update-listener')} />
})
