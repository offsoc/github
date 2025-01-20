import type {IterationConfiguration, IterationValue} from '../api/columns/contracts/iteration'
import type {SingleSelectValue} from '../api/columns/contracts/single-select'
import type {ColumnData} from '../api/columns/contracts/storage'
import type {SettingsOption} from '../helpers/new-column'
import type {ColumnModel} from '../models/column-model'

/**
 * This method calculates the amount of items that will be affected by removing a list of options
 * @param column  The column model containing the current options
 * @param changedOptions  The options to check against
 * @param items   The items to check containing the column data
 * @returns  The amount of items that will be affected by removing the options
 */
export function countAffectedOptionsUsed(
  column: ColumnModel,
  changedOptions: Array<SettingsOption>,
  itemColumns: Readonly<Array<ColumnData>>,
) {
  const optionIds = new Set(changedOptions.map(option => option.id))
  const optionsToBeRemoved = new Set(
    'options' in column.settings
      ? column.settings.options.filter(columnOption => !optionIds.has(columnOption.id)).map(option => option.id)
      : undefined,
  )

  let count = 0

  for (const columns of itemColumns) {
    const columnData = columns[column.id]
    const key = (columnData as SingleSelectValue)?.id
    // if it's a matching column type and the value key is one that will be removed
    if (optionsToBeRemoved.has(key)) {
      count++
    }
  }

  return count
}

/**
 * This method calculates the amount of items that will be affected by removing a list of iterations
 * @param column  The column model containing the server configuration
 * @param changedIterations  The local configuration to check against
 * @param items  The items to check containing the column data
 * @returns
 */
export function countAffectedIterationsUsed(
  column: ColumnModel,
  changedIterations: Partial<IterationConfiguration>,
  itemColumns: Readonly<Array<ColumnData>>,
) {
  const iterationsToBeRemoved = new Set<string>()
  // We need to check both active and completed iterations as iteration could move between lists
  const changedIterationIds = new Set([
    ...(changedIterations.iterations?.map(iteration => iteration.id) || []),
    ...(changedIterations.completedIterations?.map(iteration => iteration.id) || []),
  ])

  if ('configuration' in column.settings) {
    for (const iteration of column.settings.configuration.iterations) {
      if (!changedIterationIds.has(iteration.id)) {
        iterationsToBeRemoved.add(iteration.id)
      }
    }

    for (const iteration of column.settings.configuration.completedIterations) {
      if (!changedIterationIds.has(iteration.id)) {
        iterationsToBeRemoved.add(iteration.id)
      }
    }
  }

  let count = 0

  for (const columns of itemColumns) {
    const columnData = columns[column.id]
    const key = (columnData as IterationValue)?.id
    // if it's an iteration column and the iteration is one that will be removed
    if (iterationsToBeRemoved.has(key)) {
      count++
    }
  }

  return count
}
