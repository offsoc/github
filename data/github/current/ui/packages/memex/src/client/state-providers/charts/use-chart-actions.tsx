import {createContext, useContext} from 'react'

import type {
  CreateMemexChartRequest,
  GetMemexChartResponse,
  MemexChartConfiguration,
  UpdateMemexChartNameRequest,
  UpdateMemexChartRequest,
} from '../../api/charts/contracts/api'
import type {UseApiRequest} from '../../hooks/use-api-request'

export const ChartActionsContext = createContext<{
  createChartConfiguration: UseApiRequest<CreateMemexChartRequest, void, GetMemexChartResponse>
  updateChartConfiguration: UseApiRequest<UpdateMemexChartRequest, void, GetMemexChartResponse>
  updateChartName: UseApiRequest<UpdateMemexChartNameRequest, void, GetMemexChartResponse>
  destroyChartConfiguration: UseApiRequest<number, void, void>
  updateLocalChartConfiguration: (chartNumber: number, configuration: Partial<MemexChartConfiguration>) => void
  resetLocalChangesForChartNumber: (chartNumber: number) => void
} | null>(null)

export function useChartActions() {
  const ctx = useContext(ChartActionsContext)
  if (ctx === null) {
    throw new Error('useCharts can only be used inside a ChartStateProvider')
  }
  return ctx
}
