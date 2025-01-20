import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {ColumnModel} from '.'
import type {DateColumnModel} from './custom/date'
import type {IterationColumnModel} from './custom/iteration'
import type {SingleSelectColumnModel} from './custom/single-select'
import type {StatusColumnModel} from './system/status'

export function isIterationColumnModel(columnModel?: ColumnModel): columnModel is IterationColumnModel {
  return columnModel?.dataType === MemexColumnDataType.Iteration
}

export function isAnySingleSelectColumnModel(
  columnModel?: ColumnModel,
): columnModel is SingleSelectColumnModel | StatusColumnModel {
  return columnModel?.dataType === MemexColumnDataType.SingleSelect
}

export function isDateColumnModel(columnModel?: ColumnModel): columnModel is DateColumnModel {
  return columnModel?.dataType === MemexColumnDataType.Date
}
