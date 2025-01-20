import {createContext, useContext} from 'react'

import type {CreateMemexChartRequest, MemexChart} from '../../api/charts/contracts/api'

export type ChartState = Pick<MemexChart, 'name'> & {
  number: number
  description?: string
  localVersion: Omit<Pick<MemexChart, 'configuration'>, 'description'>
  serverVersion: Omit<Pick<MemexChart, 'configuration'>, 'description'>
}

export const ChartStateContext = createContext<{
  chartConfigurations: Readonly<{[chartNumber: number]: ChartState}>
  getChartConfigurationByNumber: (number: number) => ChartState | undefined
  getChartLinkTo: (chartNumber: number) => {
    url: string
    pathname: string
    search: string
  }
  getCreateChartRequest: () => CreateMemexChartRequest
  canCreateChart: () => boolean
  getDefaultChart: () => CreateMemexChartRequest
  updateChartConfigurations: (charts: Array<MemexChart>) => void
} | null>(null)

export function useCharts() {
  const ctx = useContext(ChartStateContext)
  if (ctx === null) {
    throw new Error('useCharts can only be used inside a ChartStateProvider')
  }
  return ctx
}
