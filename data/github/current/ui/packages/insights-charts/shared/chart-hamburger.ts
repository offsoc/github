import type {SeriesTableElement} from '../src'
import type {Series} from '../src/types'

export const createScreenReaderDataTable = (
  series: Series | null,
  forecastStartDate: string | null,
): SeriesTableElement => {
  const dataTable = document.createElement('series-table')
  dataTable.setAttribute('series', JSON.stringify(series))
  dataTable.setAttribute('class', 'sr-only')

  if (forecastStartDate) {
    dataTable.setAttribute('forecast-start-date', forecastStartDate)
  }

  return dataTable
}
