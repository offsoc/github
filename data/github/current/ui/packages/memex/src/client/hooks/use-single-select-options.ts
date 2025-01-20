import {announce} from '@github-ui/aria-live'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {type MemexColumnDataType, SystemColumnId} from '../api/columns/contracts/memex-column'
import {
  SettingsDataLossSingleSelectCancel,
  SettingsDataLossSingleSelectSave,
  SettingsDataLossSingleSelectWarning,
  SettingsFieldOptionMainUI,
} from '../api/stats/contracts'
import {useColumnSettings} from '../components/react_table/use-column-settings'
import {countAffectedOptionsUsed} from '../helpers/options'
import {usePostStats} from '../hooks/common/use-post-stats'
import {useLoadColumnsWithItemColumnValues} from '../hooks/use-load-required-fields'
import {useUpdateColumnOptions} from '../hooks/use-update-column-options'
import type {ColumnModelForDataType} from '../models/column-model'
import {useFindLoadedFieldIds} from '../state-providers/columns/use-find-loaded-field-ids'
import {useMemexItems} from '../state-providers/memex-items/use-memex-items'
import {useWorkflows} from '../state-providers/workflows/use-workflows'
import {Resources} from '../strings'
import {useTimeout} from './common/timeouts/use-timeout'
import {CommitState} from './use-autosave'
import {useConfirmDeleteFieldValues} from './use-confirm-delete-field-values'

export const useSingleSelectOptions = ({
  externalColumn,
}: {
  externalColumn?: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>
}) => {
  const {postStats} = usePostStats()
  const {items} = useMemexItems()
  const itemColumns = items.map(item => item.columns)
  const [column, setColumn] = useState(externalColumn)
  const {findLoadedFieldIds} = useFindLoadedFieldIds()
  const hideCommitStatus = useTimeout(() => {
    setCommitState(CommitState.None)
    hideCommitStatusRef.current = null
  }, 3000)
  const hideCommitStatusRef = useRef<{cancel: () => void} | null>()
  if (column === undefined) {
    throw new Error('Column is undefined')
  }

  const areColumnValuesLoaded = findLoadedFieldIds().includes(column.id)
  const {loadColumnsWithItemColumnValues} = useLoadColumnsWithItemColumnValues()

  useEffect(() => {
    if (!areColumnValuesLoaded) {
      loadColumnsWithItemColumnValues([column.id])
    }
  }, [areColumnValuesLoaded, column.id, loadColumnsWithItemColumnValues])

  const [commitState, setCommitState] = useState<CommitState>(CommitState.None)
  const onChangeCallback = useCallback(() => {
    setOptionsChanged(true)
    setCommitState(CommitState.None)
  }, [setCommitState])

  const {
    options,
    persistedOptions,
    commitMutations,
    revertMutations,
    onDrop,
    addOption,
    canRemoveOption,
    removeOption,
    updateOption,
  } = useColumnSettings({
    column,
    onChangeCallback,
    ui: SettingsFieldOptionMainUI,
  })

  // The count of persisted workflows that use any of the removed column options
  const {workflowsUsingMissingColumnOption} = useWorkflows()
  const affectedWorkflowsCount = useMemo(() => {
    return workflowsUsingMissingColumnOption(
      column.databaseId,
      options.map(o => o.id),
    ).length
  }, [column.databaseId, options, workflowsUsingMissingColumnOption])

  const affectedOptionsUsedCount = useMemo(
    () => countAffectedOptionsUsed(column, options, itemColumns),
    [column, options, itemColumns],
  )

  const {updateColumnOptions, updateColumnOptionsStatus} = useUpdateColumnOptions(column, options)
  const [optionsChanged, setOptionsChanged] = useState(false)

  // Only update column if there are no unsaved changes; otherwise ignore incoming updates to avoid overwriting local changes
  useEffect(() => {
    if (!optionsChanged) setColumn(externalColumn)
  }, [externalColumn, optionsChanged])

  const errorMessage = useRef(Resources.genericErrorMessage)

  const handleUpdateOptions = useCallback(async () => {
    await updateColumnOptions()

    if (updateColumnOptionsStatus.current.status === 'succeeded') {
      commitMutations()
      setOptionsChanged(false)
      setCommitState(CommitState.Successful)

      if (hideCommitStatusRef.current) hideCommitStatusRef.current.cancel()
      hideCommitStatusRef.current = hideCommitStatus()
    } else if (updateColumnOptionsStatus.current.status === 'failed') {
      revertMutations()
      setCommitState(CommitState.Failed)
      announce(Resources.updateColumnOptionsFailed, {assertive: true})
    }
  }, [commitMutations, hideCommitStatus, updateColumnOptions, updateColumnOptionsStatus, revertMutations])

  const confirmDelete = useConfirmDeleteFieldValues()

  const saveSingleSelectOptions = useCallback(async () => {
    const requiresConfirmation = affectedWorkflowsCount + affectedOptionsUsedCount > 0
    const emptyStatusField = column.id === SystemColumnId.Status && options.every(option => option.name.trim() === '')

    if (emptyStatusField) {
      errorMessage.current = Resources.statusFieldEmptyError
      setCommitState(CommitState.Failed)
    } else if (requiresConfirmation) {
      if (affectedOptionsUsedCount > 0) {
        postStats({
          name: SettingsDataLossSingleSelectWarning,
          context: JSON.stringify({
            columnId: column.id,
            affectedOptionsUsedCount,
          }),
        })
      }

      const shouldContinue = await confirmDelete({
        field: column,
        values: persistedOptions.filter(o => !options.some(option => option.id === o.id)).map(o => o.name),
        affectedItems: affectedOptionsUsedCount,
        affectedWorkflows: affectedWorkflowsCount,
      })

      if (shouldContinue) {
        postStats({
          name: SettingsDataLossSingleSelectSave,
          context: JSON.stringify({
            columnId: column.id,
            affectedOptionsUsedCount,
          }),
        })
        await handleUpdateOptions()
      } else {
        postStats({
          name: SettingsDataLossSingleSelectCancel,
          context: JSON.stringify({
            columnId: column.id,
            affectedOptionsUsedCount,
          }),
        })
        revertMutations()
        setOptionsChanged(false)
        setCommitState(CommitState.None)
      }
    } else {
      await handleUpdateOptions()
    }
  }, [
    affectedWorkflowsCount,
    affectedOptionsUsedCount,
    column,
    options,
    confirmDelete,
    persistedOptions,
    postStats,
    handleUpdateOptions,
    revertMutations,
  ])

  useEffect(() => {
    if (optionsChanged) {
      saveSingleSelectOptions()
    }
  }, [optionsChanged, saveSingleSelectOptions])

  return {
    commitState,
    // column settings
    options,
    onDrop,
    addOption,
    canRemoveOption,
    removeOption,
    updateOption,
    areColumnValuesLoaded,
    optionsChanged,
    // actions
    saveSingleSelectOptions,
    // error message
    errorMessage,
  }
}
