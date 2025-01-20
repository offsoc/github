import {DateDataTypes} from '../../shared/constants'
import {type Series, SeriesType} from '../types'

export const isTimeSeries = (series: Series): boolean => {
  return detectSeriesType(series) === SeriesType.Time
}

export const detectSeriesType = (series: Series | null): SeriesType => {
  if (series) {
    const dataTypes = series.columns.map(d => d.dataType)
    return DateDataTypes.indexOf(dataTypes[0]!.toLowerCase()) !== -1 ? SeriesType.Time : SeriesType.Categorical
  }

  return SeriesType.Time
}
