export interface AlertActivityChartData {
  date: string
  endDate: string
  closed: number
  opened: number
}

export interface FetchResponse {
  data: AlertActivityChartData[]
}
