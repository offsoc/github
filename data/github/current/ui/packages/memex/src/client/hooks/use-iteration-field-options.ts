import {useCallback, useEffect, useMemo, useState} from 'react'

import type {Iteration, IterationConfiguration, IterationInterval} from '../api/columns/contracts/iteration'
import {
  SettingsDataLossIterationCancel,
  SettingsDataLossIterationSave,
  SettingsDataLossIterationWarning,
} from '../api/stats/contracts'
import {appendNewIteration, removeIteration, updateBreak, updateIteration} from '../helpers/iteration-builder'
import {
  adjustStartDate,
  compareAscending,
  daysToDuration,
  doesBreakExist,
  getAllIterationsForConfiguration,
  getDefaultNewIterationStartDate as getMinimumNewStartDate,
  type IterationDuration,
} from '../helpers/iterations'
import {countAffectedIterationsUsed} from '../helpers/options'
import {withAdjacentElements} from '../helpers/util'
import type {ColumnModel} from '../models/column-model'
import type {SelectedTab} from '../pages/settings/components/iteration/types'
import {useFindLoadedFieldIds} from '../state-providers/columns/use-find-loaded-field-ids'
import {useMemexItems} from '../state-providers/memex-items/use-memex-items'
import {type Status, useApiRequest} from './/use-api-request'
import {useLoadColumnsWithItemColumnValues} from './/use-load-required-fields'
import {usePostStats} from './common/use-post-stats'
import {usePreviousValue} from './common/use-previous-value'
import {useConfirmDeleteFieldValues} from './use-confirm-delete-field-values'

const IN_MEMORY_ID_PREFIX = 'inMemoryIteration'
let inMemoryIdCounter = 0

type IterationFieldOptionsProps = {
  column: ColumnModel
  // Name of field, to use when generating new iterations
  fieldName: string
  //The server-side configuration state.
  serverConfiguration: IterationConfiguration
  // The callback to invoke with changes to the configuration for this field
  onUpdate: (changes: Partial<IterationConfiguration>) => Promise<void>
}

export const useIterationFieldOptions = ({
  column,
  fieldName,
  serverConfiguration,
  onUpdate,
}: IterationFieldOptionsProps) => {
  const {postStats} = usePostStats()
  const [selectedTab, setSelectedTab] = useState<SelectedTab>('active')

  /** Current local state, containing the user's unsaved changes. */
  const [localConfiguration, _setLocalConfiguration] = useState(serverConfiguration)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const setLocalConfiguration = useCallback((configuration: IterationConfiguration) => {
    _setLocalConfiguration(configuration)
    setHasUnsavedChanges(true)
  }, [])

  const {items} = useMemexItems()
  const itemColumns = items.map(item => item.columns)
  const {findLoadedFieldIds} = useFindLoadedFieldIds()
  const areColumnValuesLoaded = findLoadedFieldIds().includes(column.id)
  const {loadColumnsWithItemColumnValues} = useLoadColumnsWithItemColumnValues()

  useEffect(() => {
    if (!areColumnValuesLoaded) {
      loadColumnsWithItemColumnValues([column.id])
    }
  }, [areColumnValuesLoaded, column.id, loadColumnsWithItemColumnValues])

  const localConfigWithoutTempIds: IterationConfiguration = useMemo(
    () => ({
      ...localConfiguration,
      iterations: clearTempIds(localConfiguration.iterations),
      completedIterations: clearTempIds(localConfiguration.completedIterations),
    }),
    [localConfiguration],
  )

  const affectedIterationOptionsUsedCount = useMemo(
    () => countAffectedIterationsUsed(column, localConfigWithoutTempIds, itemColumns),
    [column, localConfigWithoutTempIds, itemColumns],
  )

  const prevServerConfiguration = usePreviousValue(serverConfiguration)

  useEffect(() => {
    // Avoid overwriting local state if a live update comes in while the user is editing
    if (!hasUnsavedChanges && serverConfiguration !== prevServerConfiguration)
      _setLocalConfiguration(serverConfiguration)
  }, [hasUnsavedChanges, serverConfiguration, prevServerConfiguration])

  // This will result in more renders then necessary because most of the time the min start date won't
  // change when the config does, but it's fine because the datepicker is hidden when the config changes
  const minimumStartDate = useMemo(() => getMinimumNewStartDate(localConfiguration), [localConfiguration])
  const defaultDuration = useMemo(() => daysToDuration(localConfiguration.duration), [localConfiguration.duration])

  const {perform: performRequest, status: requestStatusRef} = useApiRequest({
    // Should trigger the parent component to update `initialConfiguration`
    request: useCallback(async () => {
      await onUpdate(localConfigWithoutTempIds)
    }, [localConfigWithoutTempIds, onUpdate]),
    showErrorToast: false,
  })

  const isActiveTab = selectedTab === 'active'

  const [requestStatus, setRequestStatus] = useState<Status<void>['status']>('idle')

  /** Save unsaved changes. */
  const saveChanges = useCallback(async () => {
    // We can't just reference the requestStatusRef directly because it doesn't trigger a re-render
    // on change (because it's a ref, not state). So we have to explicitly check it and update state.
    setRequestStatus('loading')
    // No need to try...finally this request because useApiRequest does not throw on failures
    await performRequest()

    const status = requestStatusRef.current.status
    // On failure, keep the unsaved changes so the user can try again
    if (status !== 'failed') setHasUnsavedChanges(false)
    setRequestStatus(status)
  }, [performRequest, requestStatusRef])

  const confirmDelete = useConfirmDeleteFieldValues()

  const handleSaveChanges = useCallback(async () => {
    if (affectedIterationOptionsUsedCount > 0) {
      postStats({
        name: SettingsDataLossIterationWarning,
        context: JSON.stringify({
          columnId: column.id,
          affectedIterationOptionsUsedCount,
        }),
      })

      const allServerIterations = [...serverConfiguration.iterations, ...serverConfiguration.completedIterations]
      const allLocalIterations = [...localConfiguration.iterations, ...localConfiguration.completedIterations]

      const shouldContinue = await confirmDelete({
        field: column,
        values: allServerIterations
          .filter(iteration => !allLocalIterations.some(local => local.id === iteration.id))
          .map(iteration => iteration.title),
        affectedItems: affectedIterationOptionsUsedCount,
        affectedWorkflows: 0, // iterations not yet supported in workflows
      })

      if (shouldContinue) {
        postStats({
          name: SettingsDataLossIterationSave,
          context: JSON.stringify({
            columnId: column.id,
            affectedIterationOptionsUsedCount,
          }),
        })
        await saveChanges()
      } else {
        postStats({
          name: SettingsDataLossIterationCancel,
          context: JSON.stringify({
            columnId: column.id,
            affectedIterationOptionsUsedCount,
          }),
        })
      }
    } else {
      saveChanges()
    }
  }, [
    affectedIterationOptionsUsedCount,
    postStats,
    column,
    serverConfiguration.iterations,
    serverConfiguration.completedIterations,
    localConfiguration.iterations,
    localConfiguration.completedIterations,
    confirmDelete,
    saveChanges,
  ])

  /** Update the local state with changes. Does not save them. */
  const applyChangesLocally = useCallback(
    (changes: Partial<IterationConfiguration>) => {
      if (Object.entries(changes).length === 0) return // no changes
      setRequestStatus('idle')
      const updatedConfig = {...localConfiguration, ...changes}
      setLocalConfiguration(updatedConfig)
    },
    [localConfiguration, setLocalConfiguration],
  )

  const handleRemoveIteration = useCallback(
    (iteration: Iteration) => applyChangesLocally(removeIteration(localConfiguration, iteration)),
    [localConfiguration, applyChangesLocally],
  )

  const handleCreateIteration = useCallback(
    (startDate: Date, duration: IterationDuration) => {
      const updatedConfiguration = appendNewIteration(
        localConfiguration,
        fieldName,
        startDate,
        duration,
        `${IN_MEMORY_ID_PREFIX}-${++inMemoryIdCounter}`,
      )
      applyChangesLocally(updatedConfiguration)
    },
    [localConfiguration, fieldName, applyChangesLocally],
  )

  const handleChangeIteration = useCallback(
    (iteration: Iteration) => applyChangesLocally(updateIteration(localConfiguration, iteration)),
    [localConfiguration, applyChangesLocally],
  )

  const handleAddBreak = useCallback(
    (beforeIteration: Iteration) =>
      applyChangesLocally(
        updateIteration(localConfiguration, adjustStartDate(beforeIteration, localConfiguration.duration)),
      ),
    [localConfiguration, applyChangesLocally],
  )

  const handleChangeBreak = useCallback(
    (previousIteration: Iteration, nextIteration: Iteration, updatedBreakInterval: IterationInterval) =>
      applyChangesLocally(updateBreak(localConfiguration, previousIteration, nextIteration, updatedBreakInterval)),
    [applyChangesLocally, localConfiguration],
  )

  const handleReset = useCallback(() => {
    setLocalConfiguration(serverConfiguration)
    setRequestStatus('idle')
  }, [serverConfiguration, setLocalConfiguration])

  const allRowData = useMemo(
    () => buildRowData(serverConfiguration, localConfiguration),
    [serverConfiguration, localConfiguration],
  )

  /**
   * The number of active iterations that will be pushed forward if this change is applied.
   * On the completed tab the user cannot see if their changes will cascade onto the active
   * tab, so we have to let them know.
   *
   * If all active iterations are back to back then this is equal to length of active
   * iterations. But we can't naively use that value because if there are breaks then it
   * could just be the iterations before the break.
   */
  const countPushedActiveIterations = useMemo(
    () =>
      allRowData.filter(
        row => !row.originalIsCompleted && row.originalIteration?.startDate !== row.localIteration?.startDate,
      ).length,
    [allRowData],
  )

  return {
    // data
    allRowData,
    // checks
    areColumnValuesLoaded,
    hasUnsavedChanges,
    isActiveTab,
    // selected tab
    selectedTab,
    setSelectedTab,
    // handlers
    handleRemoveIteration,
    handleCreateIteration,
    handleChangeIteration,
    handleAddBreak,
    handleChangeBreak,
    handleReset,
    handleSaveChanges,
    // counts
    countPushedActiveIterations,
    // configurations
    localConfiguration,
    minimumStartDate,
    defaultDuration,
    requestStatus,
  }
}

/** All of the data necessary to render a row in the table (and potentially an adjacent break). */
type IterationRowData = {
  /** The iteration as it currently exists in memory. */
  localIteration: Iteration
  /** The previous iteration as it exists in memory. */
  localPreviousIteration?: Iteration
  /**
   * Does a break exist before this iteration? Can only be true if there is a previous
   * iteration and there is a gap between this and the previous. This represents local
   * state (ie, the break exists after unsaved changes are applied).
   */
  breakExistsBefore: boolean

  originalIteration?: Iteration
  originalPreviousIteration?: Iteration
  /**
   * Is the iteration marked as completed on server side?
   * We could calculate this locally but it may not exactly match the server state due to
   * timezones.
   */
  originalIsCompleted?: boolean
}

const byIdWithCompleted =
  (completed: boolean) =>
  (iteration: Iteration): [string, [Iteration, boolean]] => [iteration.id, [iteration, completed]]

/**
 * Combine local and server state to create row objects.
 * @param originalConfiguration The configuration as it exists on the server.
 * @param localConfiguration The configuration in local state (with any unsaved changes).
 */
function buildRowData(
  originalConfiguration: IterationConfiguration,
  localConfiguration: IterationConfiguration,
): Array<IterationRowData> {
  const originalIterationsById = new Map([
    ...originalConfiguration.completedIterations.map(byIdWithCompleted(true)),
    ...originalConfiguration.iterations.map(byIdWithCompleted(false)),
  ])

  return getAllIterationsForConfiguration(localConfiguration)
    .sort(compareAscending)
    .map(withAdjacentElements)
    .map(([prev, current]) => {
      const [originalIteration, originalIsCompleted] = originalIterationsById.get(current.id) ?? [undefined, undefined]
      const [originalPreviousIteration] = (prev && originalIterationsById.get(prev.id)) ?? [undefined]
      return {
        localIteration: current,
        localPreviousIteration: prev,
        breakExistsBefore: prev !== undefined && doesBreakExist(prev, current),
        originalIteration,
        originalIsCompleted,
        originalPreviousIteration,
      }
    })
}

function clearTempIds(iterations: Array<Iteration>): Array<Iteration> {
  return iterations.map(iteration =>
    iteration.id.startsWith(IN_MEMORY_ID_PREFIX) ? {...iteration, id: ''} : iteration,
  )
}
