import {type SeriesData, type SeriesDataItem, SeriesType} from '../types'
import {eachDayOfInterval, isSameDay} from 'date-fns'

interface GroupedByCol1AndCol3 {
  groupedByCol1: {
    [key: string]: {
      groupedByCol3: {
        [key: string]: SeriesDataItem
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      key: any
    }
  }
  uniqueCol3: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

export const fillMissing = (series: SeriesData, value = 0, seriesType: SeriesType | null = null): SeriesData => {
  if (!series) {
    return series
  }
  if (series[0]!.length === 3) {
    return fillMissingGroupedSeries(series, value)
  }
  if (seriesType === SeriesType.Categorical) {
    return series
  }
  return fillMissingSingleSeries(series, value)
}

const fillMissingSingleSeries = (series: SeriesData, value: number): SeriesData => {
  // find first, and last possible day in the series
  // and build a range of all days in between
  const sortedByDate = series.sort((a: SeriesDataItem, b: SeriesDataItem) => {
    return new Date(a[0]).getTime() - new Date(b[0]).getTime()
  })
  const range = eachDayOfInterval({
    start: new Date(sortedByDate[0]![0]),
    end: new Date(sortedByDate[sortedByDate.length - 1]![0]),
  })

  // Padding here relies on the assumption that it's operating on col1 representing a "DAY"
  // If col1 is some other valid date (like minutes or seconds), or if it's not a date at all,
  // then the range length will be less than the series length.
  if (range.length <= series.length) {
    return series
  }

  series = range.map(d => {
    const existingItem = series.find((e: SeriesDataItem) => isSameDay(new Date(e[0]), new Date(d)))
    if (existingItem) {
      return existingItem
    } else {
      return [d.toISOString(), value]
    }
  })
  return series
}

const fillMissingGroupedSeries = (series: SeriesData, padValue: number): SeriesData => {
  // group input series by col1 and find all unique col3 values
  const {groupedByCol1, uniqueCol3} = series.reduce(
    (acc: GroupedByCol1AndCol3, cur: SeriesDataItem) => {
      const [col1, , col3 = 'Y Value'] = cur
      if (!acc.groupedByCol1[col1]) {
        acc.groupedByCol1[col1] = {
          groupedByCol3: {
            [col3]: cur,
          },
          key: col1,
        }
      }
      acc.groupedByCol1[col1].groupedByCol3[col3] = cur
      acc.uniqueCol3[col3] = col3
      return acc
    },
    {groupedByCol1: {}, uniqueCol3: {}},
  )

  // Assign a default padValue for every unique (col1, col3)
  const result: SeriesData = []
  for (const col1 in groupedByCol1) {
    for (const col3 in uniqueCol3) {
      if (groupedByCol1[col1]?.groupedByCol3[col3]) {
        result.push(groupedByCol1[col1]?.groupedByCol3[col3])
      } else {
        result.push([groupedByCol1[col1]?.key, padValue, uniqueCol3[col3]])
      }
    }
  }
  return result
}
