import type {ChartType} from 'chart.js'
import {BaseChartElement} from '../shared/base-chart/base-chart-element'
import {ChartError} from '../shared/base-chart/chart-error'
import 'chartjs-adapter-date-fns'
import {chartOptions} from '../shared/base-chart/config'
import {InvalidForecastStartdateErrorMsg, InvalidForecastStartdateShortErrorMsg} from '../shared/constants'

class StackedAreaChartElement extends BaseChartElement {
  override chartType: ChartType = 'line'
  override chartName = 'stacked area'
  override filltype = true
  override stacked = true
  override throwError = (message: string): void => {
    throw new StackedAreaChartError(message)
  }

  static override get observedAttributes(): string[] {
    return Array.from(
      new Set(
        BaseChartElement.observedAttributes.concat(['forecast-startdate']).concat(Array.from(chartOptions.keys())),
      ),
    )
  }

  get forecastStartdate(): string | null {
    return this.getAttribute('forecast-startdate')
  }

  set forecastStartdate(val: string | null) {
    if (val) {
      this.setAttribute('forecast-startdate', encodeURI(val))
    } else {
      this.removeAttribute('forecast-startdate')
    }
  }

  override getForecastStartdate(): string | null {
    if (this.forecastStartdate) {
      if (Number.isFinite(Date.parse(this.forecastStartdate))) {
        return this.forecastStartdate
      }

      throw new StackedAreaChartError(InvalidForecastStartdateErrorMsg, InvalidForecastStartdateShortErrorMsg)
    }

    return null
  }
}

class StackedAreaChartError extends ChartError {
  constructor(message: string, userErrorMessage?: string) {
    super(message, userErrorMessage)
    this.name = 'StackedAreaChartError'
  }
}

function RegisterStackedAreaChart() {
  if (!window.customElements.get('stacked-area-chart')) {
    window.customElements.define('stacked-area-chart', StackedAreaChartElement)
  }
}

export {StackedAreaChartElement, StackedAreaChartError, RegisterStackedAreaChart}
