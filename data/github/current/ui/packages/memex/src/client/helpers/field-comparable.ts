import {type MemexColumn, MemexColumnDataType} from '../api/columns/contracts/memex-column'

export function isFieldComparable(field: MemexColumn) {
  return (
    field.dataType === MemexColumnDataType.Date ||
    field.dataType === MemexColumnDataType.Number ||
    field.dataType === MemexColumnDataType.Iteration
  )
}
