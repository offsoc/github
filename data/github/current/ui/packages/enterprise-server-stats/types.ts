export enum TimePeriod {
  Week = 'week',
  Month = 'month',
  Year = 'year',
}

export interface HeroStatData {
  label: string
  percentChange?: number
  total: number
}

export interface SeriesData {
  columns: ColumnData[]
  rows: RowData[]
}

type DateDataType = 'datetime'
type CountDataType = 'int'
type DescriptionDataType = 'nvarchar'
type DateValue = string
type CountValue = number
type DescriptionValue = string

export interface ColumnData {
  dataType: DateDataType | CountDataType | DescriptionDataType
  name: string
}

export type RowData = [DateValue, CountValue, DescriptionValue]
