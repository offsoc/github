import type {ChartType, ChartOptions, Chart, ChartDataset} from 'chart.js'
import {chartOptions, type InputChartConfig, setChartAttributes} from '../shared/base-chart/config'
import {BaseChartElement} from '../shared/base-chart/base-chart-element'
import {ChartError} from '../shared/base-chart/chart-error'
import {InvalidForecastStartdateErrorMsg, InvalidForecastStartdateShortErrorMsg} from '../shared/constants'
import colorLib from '@kurkle/color'

class LineChartElement extends BaseChartElement {
  static override get observedAttributes(): string[] {
    return Array.from(
      new Set(
        BaseChartElement.observedAttributes.concat(['forecast-startdate']).concat(Array.from(chartOptions.keys())),
      ),
    )
  }

  override chartType: ChartType = 'line'
  override chartName = 'line'
  override filltype = false
  override stacked = undefined
  override throwError = (message: string): void => {
    throw new LineChartError(message)
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

      throw new LineChartError(InvalidForecastStartdateErrorMsg, InvalidForecastStartdateShortErrorMsg)
    }

    return null
  }

  override getCompleteChartConfigOptions(inputChartConfig: InputChartConfig): ChartOptions {
    const customChartConfig = super.getCompleteChartConfigOptions(inputChartConfig)
    const customTooltipMode = customChartConfig.plugins?.tooltip?.mode

    if (!customTooltipMode) setChartAttributes(customChartConfig, 'plugins.tooltip.mode', 'point')

    customChartConfig.onHover = (event, activeElements, chart: Chart<'line'>) => {
      if (!event.native) {
        return
      }

      const colorWithOpacity = (value: string, opacity: number) => {
        const alpha = opacity === undefined ? 0.5 : 1 - opacity
        return colorLib(value).alpha(alpha).rgbString()
      }

      const datasetColorOpacity = (d: ChartDataset<'line'>, active: boolean) => {
        if (d.borderColor && d.backgroundColor) {
          const opacity = active ? 0 : 0.9

          d.borderColor = colorWithOpacity(d.borderColor.toString(), opacity)
          d.pointHoverBackgroundColor = colorWithOpacity(d.borderColor, opacity)
          d.pointHoverBorderColor = colorWithOpacity(d.borderColor, opacity)
        }
      }

      const points = chart.getElementsAtEventForMode(
        event.native,
        customTooltipMode || 'nearest',
        {intersect: customChartConfig.plugins?.tooltip?.intersect || true},
        true,
      )

      // if no tooltip points
      if (points.length === 0) {
        for (const d of chart.data.datasets) {
          datasetColorOpacity(d, true)
        }

        chart.update()
        return
      }

      const pointIndexes: number[] = []
      for (const line of points) {
        pointIndexes.push(line.datasetIndex)
      }

      // eslint-disable-next-line github/array-foreach
      chart.data.datasets.forEach((d, i) => {
        datasetColorOpacity(d, pointIndexes.includes(i))
      })
      chart.update()
    }

    return customChartConfig
  }
}

class LineChartError extends ChartError {
  constructor(message: string, userErrorMessage?: string) {
    super(message, userErrorMessage)
    this.name = 'LineChartError'
  }
}

function RegisterLineChart() {
  if (!window.customElements.get('line-chart')) {
    window.customElements.define('line-chart', LineChartElement)
  }
}

export {LineChartElement, LineChartError, RegisterLineChart}
