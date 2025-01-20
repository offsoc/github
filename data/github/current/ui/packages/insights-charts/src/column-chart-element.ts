import type {ChartData, ChartType} from 'chart.js'
import {chartOptions} from '../shared/base-chart/config'
import {BaseChartElement} from '../shared/base-chart/base-chart-element'
import type {SeriesData} from './types'
import {ChartError} from '../shared/base-chart/chart-error'

class ColumnChartElement extends BaseChartElement {
  static override get observedAttributes(): string[] {
    return Array.from(
      new Set(BaseChartElement.observedAttributes.concat(['chart-stacked']).concat(Array.from(chartOptions.keys()))),
    )
  }
  override chartType: ChartType = 'bar'

  override chartName = 'bar'
  override stacked = undefined
  override throwError = (message: string): void => {
    throw new ColumnChartError(message)
  }

  override handleStackedChartAttribute(inputConfigData: {[key: string]: string | null}): {
    [key: string]: string | null
  } {
    if (this.chartStacked) {
      inputConfigData = {
        ...inputConfigData,
        'scales.x.stacked': 'true',
        'scales.y.stacked': 'true',
      }
    } else {
      inputConfigData = {
        ...inputConfigData,
        'scales.x.grouped': 'true',
        'scales.y.grouped': 'true',
      }
    }

    return inputConfigData
  }
  override formatTimeSeriesData(data: SeriesData, yDefaultLabel: string): ChartData<'line'> {
    this.filltype = 'stack'
    return super.formatTimeSeriesData(data, yDefaultLabel)
  }

  get chartStacked(): boolean {
    return this.hasAttribute('chart-stacked')
  }

  set chartStacked(val: boolean) {
    if (val) {
      this.setAttribute('chart-stacked', '')
    } else {
      this.removeAttribute('chart-stacked')
    }
  }
}

class ColumnChartError extends ChartError {
  constructor(message: string) {
    super(message)
    this.name = 'ColumnChartError'
  }
}

function RegisterColumnChart() {
  if (!window.customElements.get('column-chart')) {
    window.customElements.define('column-chart', ColumnChartElement)
  }
}

export {ColumnChartElement, ColumnChartError, RegisterColumnChart}
