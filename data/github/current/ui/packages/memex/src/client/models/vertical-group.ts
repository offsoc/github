import type {Iteration, IterationConfiguration, IterationValue} from '../api/columns/contracts/iteration'
import type {PersistedOption, SingleSelectValue} from '../api/columns/contracts/single-select'
import type {GroupMetadata} from '../api/memex-items/paginated-views'
import {compareAscending, compareDescending} from '../helpers/iterations'
import type {ColumnModel} from './column-model'
import type {IterationColumnModel} from './column-model/custom/iteration'
import type {SingleSelectColumnModel} from './column-model/custom/single-select'
import {isAnySingleSelectColumnModel, isIterationColumnModel} from './column-model/guards'
import type {StatusColumnModel} from './column-model/system/status'

/**
 * Deprecated: Identifier for reserved "no value" group when rendering board
 * This identifier will be removed:
 * https://github.com/github/projects-platform/issues/2127
 */
export const MissingVerticalGroupId = 'no_vertical_group'
/** Backwards-compatible fieldId for the 'No Value' vertical group */
export const StatsNoValueGroupId = MissingVerticalGroupId

export type VerticalGroupMetadata = PersistedOption | Iteration

export type VerticalGroupItemValue = SingleSelectValue | IterationValue | undefined

export type VerticalGroup = {
  // Identifier for the group itself
  // When PWL is enabled, this is an opaque server-generated string
  id: string
  name: string
  nameHtml: string
  // The metadata object associated with this group
  // i.e., a SingleSelect PersistedOption or an Iteration
  groupMetadata: VerticalGroupMetadata | undefined
}

export const isVerticalGroupMetadata = (metadata?: GroupMetadata): metadata is VerticalGroupMetadata =>
  !!metadata && (isSingleSelectOption(metadata) || isIteration(metadata))

export const isSingleSelectOption = (metadata?: GroupMetadata | VerticalGroupMetadata): metadata is PersistedOption =>
  !!metadata &&
  'color' in metadata &&
  'name' in metadata &&
  'nameHtml' in metadata &&
  'description' in metadata &&
  'descriptionHtml' in metadata

export const isIteration = (metadata?: GroupMetadata | VerticalGroupMetadata): metadata is Iteration =>
  !!metadata && 'duration' in metadata && 'title' in metadata && 'startDate' in metadata

export const buildVerticalGroupForOption = (option: PersistedOption): VerticalGroup => ({
  ...option,
  groupMetadata: option,
})

export const buildVerticalGroupForIteration = (iteration: Iteration): VerticalGroup => ({
  id: iteration.id,
  name: iteration.title,
  nameHtml: iteration.titleHtml,
  groupMetadata: iteration,
})

export const buildNoValueVerticalGroup = (fieldName: string): VerticalGroup => ({
  id: MissingVerticalGroupId,
  name: `No ${fieldName}`,
  nameHtml: `No ${fieldName}`,
  groupMetadata: undefined,
})

const verticalGroupsForSingleSelect = (options: Array<PersistedOption>): Array<VerticalGroup> => {
  return options.map(buildVerticalGroupForOption)
}

const verticalGroupsForIteration = (
  configuration: IterationConfiguration,
  {includeAllCompletedIterations = false} = {},
): Array<VerticalGroup> => {
  const {iterations, completedIterations} = configuration
  const sortedCompletedIterations = completedIterations.slice().sort(compareDescending)
  const allIterations = [
    ...(includeAllCompletedIterations ? sortedCompletedIterations : sortedCompletedIterations.slice(0, 3)),
    ...iterations,
  ]
  return allIterations.sort(compareAscending).map(buildVerticalGroupForIteration)
}

export function getVerticalGroupsForField(
  columnModel?: ColumnModel,
  opts: {includeAllCompletedIterations?: boolean} = {},
) {
  if (!columnModel) {
    return []
  }

  const noValueGroup = buildNoValueVerticalGroup(columnModel.name)

  if (isAnySingleSelectColumnModel(columnModel)) {
    return [noValueGroup, ...verticalGroupsForSingleSelect(columnModel.settings.options)]
  }

  if (isIterationColumnModel(columnModel)) {
    const {configuration} = columnModel.settings
    return [noValueGroup, ...verticalGroupsForIteration(configuration, opts)]
  }

  throw new Error(`Unable to obtain vertical groups for field type: ${columnModel.dataType}`)
}

export function canVerticalGroup(
  columnModel: ColumnModel,
): columnModel is IterationColumnModel | SingleSelectColumnModel | StatusColumnModel {
  return isAnySingleSelectColumnModel(columnModel) || isIterationColumnModel(columnModel)
}
