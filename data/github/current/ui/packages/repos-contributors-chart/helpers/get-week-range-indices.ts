import type {Week} from '../repos-contributors-chart-types'
import type {RangeSelection} from '@github-ui/date-picker'

type getWeekRangeIndicesProps = {
  weeks: Week[]
  rangeSelection?: RangeSelection
}

type Result = {
  from: number
  to: number
}

export function getWeekRangeIndices({weeks, rangeSelection}: getWeekRangeIndicesProps): Result {
  if (!rangeSelection) {
    return {
      from: 0,
      to: weeks.length - 1,
    }
  }
  const startIndex = weeks.findIndex(({date}) => date >= rangeSelection.from)
  const endIndex = weeks.length - [...weeks].reverse().findIndex(({date}) => date >= rangeSelection.to)

  if (startIndex === -1 && endIndex === -1) {
    return {
      from: 0,
      to: weeks.length - 1,
    }
  }

  return {
    from: startIndex,
    to: endIndex,
  }
}
