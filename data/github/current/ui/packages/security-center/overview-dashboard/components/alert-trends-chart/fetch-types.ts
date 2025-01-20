export interface AlertTrend {
  x: string
  y: number
}

export interface NoDataResponse {
  noData: string
}

export interface AlertTrendsResponse {
  alertTrends: {[key: string]: AlertTrend[]}
}

export type FetchResponse = NoDataResponse | AlertTrendsResponse

export function isNoDataResponse(response: FetchResponse): response is NoDataResponse {
  return response.hasOwnProperty('noData')
}
