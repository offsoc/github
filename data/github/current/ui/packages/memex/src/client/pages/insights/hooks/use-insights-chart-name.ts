import {useSyncedState} from '@github-ui/use-synced-state'
import {useCallback} from 'react'

import {isDefaultChart} from '../../../state-providers/charts/chart-helpers'
import {useChartActions} from '../../../state-providers/charts/use-chart-actions'
import type {ChartState} from '../../../state-providers/charts/use-charts'

/**
 * This hook manages local and persisted state of a insights's chart name. The following
 * objects and functions are exposed:
 *
 * chartName: The working chartName of the insights chart based on user changes.
 *
 * setLocalChartName: function that should be called with the new chart name (on every keystroke).
 *
 * revertChartName: function that should be called to discard working changes to the chart name
 * and revert back to the server-persisted value.
 *
 * saveChartName: function that should be called to save working changes to the chart name
 * on the server.
 */
export const useInsightsChartName = (chart: ChartState) => {
  const {updateChartName} = useChartActions()

  const [localChartName, setLocalChartName] = useSyncedState(chart.name)

  const revertChartName = useCallback(() => {
    setLocalChartName(chart.name)
  }, [chart.name, setLocalChartName])

  const saveChartName = useCallback(async () => {
    if (isDefaultChart(chart)) return
    const nextName = localChartName.trim()
    if (nextName === chart.name) return
    if (nextName.length) {
      await updateChartName.perform({
        chartNumber: chart.number,
        chart: {
          name: nextName,
        },
      })
    } else {
      revertChartName()
    }
  }, [chart, localChartName, updateChartName, revertChartName])

  return {chartName: localChartName, setLocalChartName, revertChartName, saveChartName}
}
