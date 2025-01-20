import {MemexColumnDataType} from '../columns/contracts/memex-column'

export function getDateFieldToolbarStatsContext(length: number, type?: MemexColumnDataType) {
  let dateFields = 'none'

  if (type === MemexColumnDataType.Iteration) {
    dateFields = 'iteration_field'
  } else if (type === MemexColumnDataType.Date) {
    dateFields = `${length}_date_field${length === 1 ? '' : 's'}`
  }

  return {dateFields}
}
