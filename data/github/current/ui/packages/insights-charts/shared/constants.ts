/* eslint i18n-text/no-en: off */
export const MalformedInputErrorMsg =
  'Malformed input. For time series input, the multi-series data should be of the form: { columns:[{name: xAxisTitle, dataType: date},{name: yAxisTitle, dataType: int},{name: zAxisTitle, dataType: string}], rows:[[xAxisValue: DateString, yAxisValue: int, zAxisValue: string], ...]} or { columns:[{name: xAxisTitle, dataType: date},{name: yAxisTitle, dataType: int}],  [xAxisValue: DateString, yAxisValue: Int], ...]} for single-series data. For categorical input, the multi-series data must be of the form: { columns:[{name: xAxisTitle, dataType: date},{name: yAxisTitle, dataType: Int},{name: zAxisTitle, dataType: string}], rows:[[xAxisValue: string, yAxisValue: Int, zAxisValue: string], ...]} or { columns:[{name: xAxisTitle, dataType: string},{name: yAxisTitle, dataType: Int}],  [xAxisValue: string, yAxisValue: Int], ...]} for single-series data.'
export const DataNullErrorMsg = 'Data cannot contain null values'
export const DateDataTypes = ['date', 'smalldatetime', 'datetime', 'datetime2', 'datetimeoffset', 'timestamp']
export const InvalidForecastStartdateShortErrorMsg = 'Invalid value provided for forecast-startdate attribute'
export const InvalidForecastStartdateErrorMsg =
  'Value provided for forecast-startdate attribute is not of a valid date/time format'
