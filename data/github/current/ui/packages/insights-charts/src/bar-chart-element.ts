import type {ChartData, ChartType} from 'chart.js'
import {chartOptions} from '../shared/base-chart/config'
import {BaseChartElement} from '../shared/base-chart/base-chart-element'
import type {SeriesData} from './types'
import {ChartError} from '../shared/base-chart/chart-error'

class BarChartElement extends BaseChartElement {
  static override get observedAttributes(): string[] {
    return Array.from(
      new Set(BaseChartElement.observedAttributes.concat(['chart-stacked']).concat(Array.from(chartOptions.keys()))),
    )
  }

  override chartType: ChartType = 'bar'
  override chartName = 'bar'
  override stacked = undefined
  override indexAxis: 'x' | 'y' | undefined = 'y'
  override throwError = (message: string): void => {
    throw new BarChartError(message)
  }

  override formatTimeSeriesData(data: SeriesData, yDefaultLabel: string): ChartData<'line'> {
    this.filltype = 'stack'
    return super.formatTimeSeriesData(data, yDefaultLabel)
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

class BarChartError extends ChartError {
  constructor(message: string, userErrorMessage?: string) {
    super(message, userErrorMessage)
    this.name = 'BarChartError'
  }
}

function RegisterBarChart() {
  if (!window.customElements.get('bar-chart')) {
    window.customElements.define('bar-chart', BarChartElement)
  }
}

export {BarChartElement, BarChartError, RegisterBarChart}
