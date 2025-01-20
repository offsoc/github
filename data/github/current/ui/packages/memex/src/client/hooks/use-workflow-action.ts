import type {MemexWorkflowAction} from '../api/workflows/contracts'
import {useFindColumnByDatabaseId} from '../state-providers/columns/use-find-column-by-database-id'

/**
 * Hook to get field information for the specified workflow action of type SetField.
 */
export const useWorkflowSetFieldAction = (action: MemexWorkflowAction) => {
  const {findColumnByDatabaseId} = useFindColumnByDatabaseId()

  const {fieldOptionId, fieldId} = action.arguments

  const column = fieldId ? findColumnByDatabaseId(fieldId) : undefined
  const selectedOption =
    column && 'options' in column.settings
      ? column.settings.options?.find(option => option.id === fieldOptionId)
      : undefined

  return {
    column,
    selectedOption,
  }
}
