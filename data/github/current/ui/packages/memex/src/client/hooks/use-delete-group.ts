import {useCallback} from 'react'

import {findVerticalGroupLabelById} from '../helpers/vertical-group'
import type {ColumnModel} from '../models/column-model'
import {isAnySingleSelectColumnModel, isIterationColumnModel} from '../models/column-model/guards'
import {useDestroyColumnIteration} from '../state-providers/columns/use-destroy-column-iteration'
import {useUpdateOptions} from '../state-providers/columns/use-update-options'
import {useMemexItems} from '../state-providers/memex-items/use-memex-items'
import {useWorkflows} from '../state-providers/workflows/use-workflows'
import {useConfirmDeleteFieldValues} from './use-confirm-delete-field-values'

export const useDeleteGroup = (field: ColumnModel | undefined) => {
  const {workflowsUsingColumnOption} = useWorkflows()

  const {destroyColumnOption} = useUpdateOptions()
  const {destroyColumnIteration} = useDestroyColumnIteration()

  const destroyGroup = useCallback(
    async (column: ColumnModel, id: string) => {
      if (isAnySingleSelectColumnModel(column)) {
        return destroyColumnOption(column, {id})
      }

      if (isIterationColumnModel(column)) {
        return destroyColumnIteration(column, id)
      }
    },
    [destroyColumnIteration, destroyColumnOption],
  )

  const isDestroyable = useCallback(
    (column: ColumnModel) => isAnySingleSelectColumnModel(column) || isIterationColumnModel(column),
    [],
  )

  const {items} = useMemexItems()

  const getAffectedWorkflows = useCallback(
    (fieldId: number, optionId: string) => {
      return workflowsUsingColumnOption(fieldId, optionId)
    },
    [workflowsUsingColumnOption],
  )

  const getAffectedItems = useCallback(
    (optionId: string) => {
      if (!field) return 0
      return items.map(item => item.columns[field.id]).filter(value => value && 'id' in value && value.id === optionId)
        .length
    },
    [field, items],
  )

  const confirm = useConfirmDeleteFieldValues()
  const deleteGroup = useCallback(
    async (optionId: string) => {
      if (!field || !isDestroyable(field)) return
      const verticalGroupLabel = findVerticalGroupLabelById(field, optionId)
      const affectedItems = getAffectedItems(optionId)
      if (!verticalGroupLabel || !field) {
        // Must have been deleted somewhere else.
        return
      }

      const affectedWorkflows = getAffectedWorkflows(field.databaseId, optionId).length

      const isConfirmed = await confirm({
        field,
        values: [verticalGroupLabel],
        affectedItems,
        affectedWorkflows,
      })
      if (isConfirmed) return destroyGroup(field, optionId)
    },
    [field, isDestroyable, getAffectedItems, getAffectedWorkflows, confirm, destroyGroup],
  )

  return {deleteGroup: field && isDestroyable(field) ? deleteGroup : undefined}
}
