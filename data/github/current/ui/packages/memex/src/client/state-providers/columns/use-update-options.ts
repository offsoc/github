import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import {apiAddOption} from '../../api/columns/api-add-option'
import {apiDestroyOption} from '../../api/columns/api-destroy-option'
import {apiUpdateColumn} from '../../api/columns/api-update-column'
import {apiUpdateOption} from '../../api/columns/api-update-option'
import type {MemexColumn, MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {
  NewSingleOption,
  PersistedOption,
  SingleSelectValue,
  UpdateOptions,
  UpdateSingleOption,
} from '../../api/columns/contracts/single-select'
import {cancelGetAllMemexData} from '../../api/memex/api-get-all-memex-data'
import {filterEmptyOptions} from '../../helpers/new-column'
import {isNewSingleSelectOptionId} from '../../helpers/util'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {type ColumnModelForDataType, createColumnModel} from '../../models/column-model'
import {updateGroupMetadata, updateGroupPosition} from '../memex-items/query-client-api/memex-groups'
import {useUpdateColumnValues} from '../memex-items/use-update-column-values'
import {useUpdateColumns} from './use-update-columns'

type UpdateOptionsHookReturnType = {
  /**
   * Add options to a column
   * @param column     - the column to update
   * @param optionData - the new column options to update the column with
   */
  addColumnOption: (
    column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>,
    optionData: NewSingleOption,
  ) => Promise<void>
  /**
   * Updates the column options
   * @param column  - the column to update
   * @param options - the options to update the column with
   */
  updateOptions: (
    column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>,
    options: UpdateOptions,
  ) => Promise<void>
  /**
   * Move an option in a column
   * @param column     - the column to update
   * @param optionData - the option to move at the given location based on on `optionData.position`
   */
  moveColumnOption: (
    column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>,
    optionData: UpdateSingleOption,
  ) => Promise<void>
  /**
   * updates a column option (name, description, and/or color)
   * @param column     - the column to update
   * @param optionData - the data to update a column's option with
   * @param localOnly  - whether to update the column in the local state only or not
   */
  updateColumnOption: (
    column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>,
    optionData: UpdateSingleOption,
    localOnly?: boolean,
  ) => Promise<void>
  /**
   * destroys a column option
   * @param column     - the column to update
   * @param optionData - the data containing the id of the option to destroy
   */
  destroyColumnOption: (
    column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>,
    optionData: SingleSelectValue,
  ) => Promise<void>
}

export const useUpdateOptions = (): UpdateOptionsHookReturnType => {
  const {updateColumnEntry} = useUpdateColumns()
  const {updateColumnValues} = useUpdateColumnValues()
  const {memex_table_without_limits, memex_mwl_server_group_order} = useEnabledFeatures()

  const queryClient = useQueryClient()

  const updateOptions = useCallback(
    async (column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>, options: UpdateOptions) => {
      const updatedSettings = {...column.settings, options: createOptionsForUpdate(options)}

      cancelGetAllMemexData()
      const {memexProjectColumn: newColumnState} = await apiUpdateColumn({
        memexProjectColumnId: column.id,
        settings: updatedSettings,
      })

      if (newColumnState?.settings) {
        const {settings} = newColumnState
        updateColumnEntry(createColumnModel({...column, settings}))
      }

      if (newColumnState) {
        updateColumnValues(newColumnState)
      }
    },
    [updateColumnEntry, updateColumnValues],
  )

  const updateSettingsOptions = useCallback(
    (column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>, newColumnState: Partial<MemexColumn>) => {
      const {options} = newColumnState.settings ?? {}

      if (options) {
        const settings = {...column.settings, options}
        updateColumnEntry(createColumnModel({...column, settings}))
      }
    },
    [updateColumnEntry],
  )

  const addColumnOption = useCallback(
    async (column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>, optionData: NewSingleOption) => {
      if (!optionData.name) {
        return
      }
      const temporaryID = crypto.randomUUID()
      // create a new option with a temporary id
      const optimisticOptionsState = [
        ...column.settings.options,
        {
          id: temporaryID,
          ...optionData,
          nameHtml: optionData.name,
          descriptionHtml: optionData.description,
        },
      ]

      // optimistic update
      updateSettingsOptions(column, {settings: {options: optimisticOptionsState}})

      try {
        const {memexProjectColumn: newColumnState} = await apiAddOption({
          memexProjectColumnId: column.id,
          option: optionData,
        })

        updateSettingsOptions(column, newColumnState)
      } catch (error) {
        // revert optimistic update
        updateSettingsOptions(column, {
          settings: {options: column.settings.options.filter(option => option.id !== temporaryID)},
        })
        throw error
      }
    },
    [updateSettingsOptions],
  )

  const updateColumnOption = useCallback(
    async (
      column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>,
      optionData: UpdateSingleOption,
      localOnly = false,
    ) => {
      // validate name cannot be empty
      if (optionData.name !== undefined && optionData.name.trim() === '') return

      const optionToUpdate = column.settings.options.find(option => option.id === optionData.id)
      if (!optionToUpdate) return

      const newOptionsState = column.settings.options.map(option =>
        option.id === optionData.id
          ? {
              ...option,
              ...optionData,
              nameHtml: optionData.name ?? option.nameHtml,
              descriptionHtml: optionData.description ?? option.descriptionHtml,
            }
          : option,
      )

      if (memex_table_without_limits && memex_mwl_server_group_order) {
        const newGroupMetadata: PersistedOption = {
          ...optionToUpdate,
          ...optionData,
          nameHtml: optionData.name ?? optionToUpdate.nameHtml,
          descriptionHtml: optionData.description ?? optionToUpdate.descriptionHtml,
        }

        updateGroupMetadata(queryClient, newGroupMetadata, newGroupMetadata.name)
      }

      updateSettingsOptions(column, {settings: {options: newOptionsState}})

      if (localOnly) return

      // removes nameHtml and descriptionHtml that may be present when editing
      // a board group, as the server will warn when these fields are included
      const updateOptionData: UpdateSingleOption = {
        id: optionData.id,
        color: optionData.color,
        description: optionData.description,
        name: optionData.name,
      }

      const {memexProjectColumn: newColumnState} = await apiUpdateOption({
        memexProjectColumnId: column.id,
        option: updateOptionData,
      })

      updateSettingsOptions(column, newColumnState)
    },
    [memex_mwl_server_group_order, memex_table_without_limits, queryClient, updateSettingsOptions],
  )

  const moveColumnOption = useCallback(
    async (column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>, optionData: UpdateSingleOption) => {
      const optionToUpdateIndex = column.settings.options.findIndex(option => option.id === optionData.id)
      const optionToUpdate = column.settings.options[optionToUpdateIndex]

      if (optionData.position != null && optionToUpdate && column.settings.options) {
        const newOptions = [...column.settings.options]
        // Optimistically move option to its new location.
        newOptions.splice(optionToUpdateIndex, 1)
        newOptions.splice(optionData.position - 1, 0, optionToUpdate)
        updateSettingsOptions(column, {settings: {options: newOptions}})

        if (memex_table_without_limits && memex_mwl_server_group_order) {
          const overOptionId = column.settings.options[optionData.position - 1]?.id
          const after = optionData.position === column.settings.options.length
          if (!overOptionId) return
          updateGroupPosition(queryClient, optionToUpdate, overOptionId, after)
        }
      }

      const {memexProjectColumn: newColumnState} = await apiUpdateOption({
        memexProjectColumnId: column.id,
        option: optionData,
      })

      updateSettingsOptions(column, newColumnState)
    },
    [memex_mwl_server_group_order, memex_table_without_limits, queryClient, updateSettingsOptions],
  )

  const destroyColumnOption = useCallback(
    async (column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>, optionData: SingleSelectValue) => {
      const {memexProjectColumn: newColumnState} = await apiDestroyOption({
        memexProjectColumnId: column.id,
        option: optionData,
      })

      updateSettingsOptions(column, newColumnState)
    },
    [updateSettingsOptions],
  )

  return {
    addColumnOption,
    moveColumnOption,
    updateOptions,
    updateColumnOption,
    destroyColumnOption,
  }
}

/**
 * creates the payload for `updateOptions` action based on its argument
 * @param options - options used to generate the payload for the update action
 * @returns the payload for the update action
 */
function createOptionsForUpdate(options: UpdateOptions): UpdateOptions {
  // ensure no extra fields (like nameHtml) are kept
  return filterEmptyOptions(options).map(({id, color, description, name}) => ({
    id: isNewSingleSelectOptionId(id) ? '' : id,
    color,
    description,
    name,
  }))
}
