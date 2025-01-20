import {useCallback, useEffect, useMemo, useState} from 'react'

import type {MemexWorkflow} from '../../../api/workflows/contracts'
import {useWorkflowPermissions} from '../../../hooks/use-workflow-permissions'
import {useAutomationGraph} from '../../../state-providers/workflows/use-automation-graph'

interface UseSearchInputParams {
  query: string
  initialQuery: string
  workflow: MemexWorkflow
  onQueryChange?: (query: string) => void
}

export const useSearchInputState = ({query, initialQuery, onQueryChange}: UseSearchInputParams) => {
  const [queryCheckpoint, setQueryCheckpoint] = useState<string>(initialQuery)
  const isDirty = useMemo(() => query.trim() !== queryCheckpoint, [query, queryCheckpoint])
  const {isEditing} = useAutomationGraph()
  const {hasWorkflowWritePermission} = useWorkflowPermissions()

  const editingDisabled = !hasWorkflowWritePermission || !isEditing

  const updateQueryState = useCallback(
    (newQuery: string) => {
      onQueryChange?.(newQuery)
    },
    [onQueryChange],
  )

  const clearQuery = useCallback(() => {
    updateQueryState('')
  }, [updateQueryState])

  const resetChanges = useCallback(() => {
    updateQueryState(queryCheckpoint)
  }, [queryCheckpoint, updateQueryState])

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateQueryState(e.currentTarget.value)
    },
    [updateQueryState],
  )

  const setValueFromSuggestion = useCallback(
    (value: string) => {
      updateQueryState(value)
    },
    [updateQueryState],
  )

  // initialQuery changes when the user saves workflow changes
  useEffect(() => {
    setQueryCheckpoint(initialQuery)
  }, [initialQuery])

  return {
    queryCheckpoint,
    editingDisabled,
    isDirty,
    clearQuery,
    handleQueryChange,
    setValueFromSuggestion,
    setQueryCheckpoint,
    resetChanges,
  }
}
