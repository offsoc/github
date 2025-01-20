import type {SeriesData, SeriesDataItem} from '../types'

export const transform = (series: SeriesData): SeriesData => {
  if (!series) {
    return series
  }

  if (series[0]?.length === 3) {
    return transfromGroupedSeries(series)
  } else {
    return transfromSeries(series)
  }
}

const transfromSeries = (series: SeriesData): SeriesData => {
  let sum = 0
  return series.map((item: SeriesDataItem) => {
    const [col1, col2] = item

    sum += col2 ? col2 : 0
    return [col1, sum]
  })
}

const transfromGroupedSeries = (series: SeriesData): SeriesData => {
  const sums: {[key: string]: number} = {}
  return series.map((item: SeriesDataItem): SeriesData[number] => {
    const [col1, col2, col3 = 'Y Value'] = item
    if (!sums[col3]) {
      sums[col3] = 0
    }

    sums[col3] += col2 ? col2 : 0
    return [
      col1,
      // default here matches that above, but we're just making typescript happy
      sums[col3] ?? 0,
      col3,
    ]
  })
}
