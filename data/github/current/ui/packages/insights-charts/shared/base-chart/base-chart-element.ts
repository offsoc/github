import {Chart, registerables} from 'chart.js'
import type {ChartData, ChartDataset, ChartOptions, ChartType, Plugin, ChartTypeRegistry} from 'chart.js'
import 'chartjs-adapter-date-fns'
import {MalformedInputErrorMsg, DataNullErrorMsg} from '../constants'
import nullTemplate from '../null-template'
import errorTemplate from '../error-template'
import loadingTemplate from '../loading-template'
import maskedTemplate from '../masked-template'
import {fillMissing} from '../../src/padding'
import {type Series, SeriesType, type SeriesData, type SeriesDataItem, type ColorCodingConfig} from '../../src/types'
import {detectSeriesType} from '../../src/series'
import {
  chartOptions,
  type DataSetConfig,
  getDatasetConfig,
  getDefaultChartConfig,
  initializeChartConfig,
  type InputChartConfig,
  setChartAttributes,
} from './config'
import {getTheme} from '../primer'
import {ChartError} from './chart-error'
import {RegisterSeriesTable} from '../../src/series-table-element'
import {createScreenReaderDataTable} from '../chart-hamburger'
import {generateAriaLabelFromTimeSeriesData, generateAriaLabelFromCategoricalData} from '../../src/aria'

class BaseChartElement extends HTMLElement {
  inputChartConfig: InputChartConfig | undefined

  filltype: string | boolean = false

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  plugins: Array<Plugin<keyof ChartTypeRegistry, any>> = []

  connectedCallback(): void {
    initializeChartConfig(this, 'inputChartConfig')
    if (registerables) {
      Chart.register(...registerables)
    }
    this.render()

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      this.render()
    })

    // we use the series-table inside our charts, so we need to ensure it's registered
    RegisterSeriesTable()
  }

  static get observedAttributes(): string[] {
    let attributes = [
      'series',
      'error',
      'loading',
      'masked',
      'height',
      'padding-applied',
      'forecast-startdate',
      'color-coding',
    ]
    attributes = attributes.concat(Array.from(chartOptions.keys()))
    return attributes
  }

  get paddingApplied(): boolean {
    const paddingApplied = this.getAttribute('padding-applied')
    return paddingApplied === '' || (!!paddingApplied && paddingApplied.toLowerCase() === 'true')
  }

  // called from changes on observedAttributes attributes
  // HACK: separating out the handler into a separate function so that it can be stubbed
  // in tests. for some reason this method isn't able to be stubbed directly :(
  attributeChangedCallback(): void {
    if (registerables) {
      Chart.register(...registerables)
    }
    this.handleAttributeChanged()
  }

  // HACK: this handler is separated into a separate function from attributeChangedCallback
  // so that the behavior can be stubbed in tests :(
  handleAttributeChanged(): void {
    this.render()
  }

  // wrapping this method so it can be mocked in tests
  fillMissing(series: SeriesData, padValue?: number): SeriesData {
    return fillMissing(series, padValue, this.seriesType)
  }

  render(): void {
    try {
      if (this.error || this.error === '') {
        this.innerHTML = errorTemplate(undefined, this.error === '' ? undefined : this.error)
        return
      } else if (this.loading) {
        this.innerHTML = loadingTemplate
        return
      } else if (this.masked) {
        this.innerHTML = maskedTemplate
        this.addEventListener('click', this.unmask)
        return
      }

      let inputConfigData = this.inputChartConfig
      let data = this.seriesData
      if (!data) {
        this.innerHTML = nullTemplate
        return
      }

      const inputIsValid =
        this.seriesType === SeriesType.Time ? this.validateTimeSeriesInput() : this.validateCategoricalInput()

      if (!inputIsValid) {
        const message = Array.isArray(data) && data.filter(d => d[1] === null).length > 0 ? DataNullErrorMsg : undefined
        throw new ChartError(MalformedInputErrorMsg, message)
      }

      const columnLabels = data.shift()
      const yDefaultLabel = columnLabels ? (columnLabels[1] ? `${columnLabels[1]}` : 'Y value') : 'Y value'
      const xAndYLabel = this.getXAndYLabels(columnLabels)
      inputConfigData = {
        ...inputConfigData,
        'scales.x.title.text': xAndYLabel[0],
        'scales.y.title.text': xAndYLabel[1],
      }

      inputConfigData = this.handleStackedChartAttribute(inputConfigData)

      if (data.length === 0) {
        this.innerHTML = nullTemplate
        return
      }

      // backwards compatibility
      // Base chart should always pad unless...
      // - the <insights-query> already set "padding-applied"
      // - forecasting was already applied (we assume that forecast startdate indicates this)
      if (!this.paddingApplied && !this.getForecastStartdate()) {
        data = this.fillMissing(data)
      }

      const formattedData =
        this.seriesType === SeriesType.Time
          ? this.formatTimeSeriesData(data, yDefaultLabel)
          : this.formatCategoricalData(data, yDefaultLabel)

      const ariaLabel =
        this.seriesType === SeriesType.Time
          ? generateAriaLabelFromTimeSeriesData(formattedData, data, this.chartName, xAndYLabel)
          : generateAriaLabelFromCategoricalData(formattedData, data, this.chartName, xAndYLabel)

      const wrapper = document.createElement('div')

      const height = this.height ? this.height : `100%`
      wrapper.setAttribute('style', `position: relative; width: 100%; height: ${height};`)

      const canvas = document.createElement('canvas')
      wrapper.appendChild(canvas)

      canvas.setAttribute('role', 'img')
      canvas.setAttribute('aria-label', ariaLabel)

      this.textContent = ''

      const dataTable = createScreenReaderDataTable(this.series, this.getForecastStartdate())
      this.appendChild(wrapper)
      this.appendChild(dataTable)

      const configOptions = this.getCompleteChartConfigOptions(inputConfigData)

      new Chart(canvas, {
        // @ts-expect-error - this has been a long-term TS error but it's been working, ignoring for now
        type: this.chartType,
        data: formattedData,
        options: configOptions,
        plugins: this.plugins,
      })
    } catch (e) {
      if (e instanceof ChartError) {
        this.innerHTML = errorTemplate(undefined, e.userErrorMessage)
      }
      throw e
    }
  }

  handleStackedChartAttribute(inputConfigData: InputChartConfig): InputChartConfig {
    return inputConfigData
  }

  get colorCoding(): ColorCodingConfig | null {
    const colorCoding = this.getAttribute('color-coding')

    if (colorCoding) {
      const decodedColorCoding = JSON.parse(decodeURI(colorCoding))
      const filledColorCoding = {}

      return Object.keys(decodedColorCoding).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            ...decodedColorCoding[key],
            borderWidth: 2,
            pointHoverBackgroundColor: decodedColorCoding[key].backgroundColor,
            pointHoverBorderWidth: 2,
            pointHoverRadius: 3,
          },
        }),
        filledColorCoding,
      )
    }

    return null
  }

  set colorCoding(val: ColorCodingConfig | null) {
    if (val) {
      this.setAttribute('color-coding', encodeURI(JSON.stringify(val)))
    } else {
      this.removeAttribute('color-coding')
    }
  }

  get defaultColorCoding(): DataSetConfig[] {
    return getDatasetConfig()
  }

  get seriesType(): SeriesType {
    return detectSeriesType(this.series)
  }

  get series(): Series | null {
    const series = this.getAttribute('series')

    if (series) {
      return JSON.parse(decodeURI(series))
    }
    return null
  }

  set series(val: Series | null) {
    if (val) {
      this.setAttribute('series', encodeURI(JSON.stringify(val)))
    } else {
      this.removeAttribute('series')
    }
  }

  get seriesData(): SeriesData | null {
    const data = this.series
    if (data) {
      if (data.columns === undefined || data.rows === undefined) {
        this.throwError(MalformedInputErrorMsg)
      }
      return [data.columns.map(d => d.name), ...data.rows] as SeriesDataItem[]
    }
    return null
  }

  get error(): string | null {
    const error = this.getAttribute('error')
    if (error || error === '') {
      return decodeURI(error)
    }
    return null
  }

  set error(val: string | null) {
    if (val || val === '') {
      this.setAttribute('error', encodeURI(val))
    } else {
      this.removeAttribute('error')
    }
  }

  get loading(): boolean {
    return this.hasAttribute('loading')
  }

  set loading(val: boolean) {
    if (val) {
      this.setAttribute('loading', '')
    } else {
      this.removeAttribute('loading')
    }
  }

  get masked(): boolean {
    return this.hasAttribute('masked')
  }

  set masked(val: boolean) {
    if (val) {
      this.setAttribute('masked', '')
    } else {
      this.removeAttribute('masked')
    }
  }

  get height(): string | null {
    return this.getAttribute('height')
  }

  set height(val: string | null) {
    if (val) {
      this.setAttribute('height', val)
    } else {
      this.removeAttribute('height')
    }
  }

  formatTimeSeriesData(data: SeriesData, yDefaultLabel: string): ChartData<'line'> {
    const dataSets: {[key: string]: ChartDataset<'line'>} = {}
    const labels: Set<string> = new Set()

    // Sort the data by date
    data = data.sort((a, b) => Date.parse(a[0]) - Date.parse(b[0]))

    // Create a dataSet for each unique label in the data
    for (const d of data) {
      const valueLabel = d[2] && d[2] !== 'Y value' ? d[2] : yDefaultLabel
      labels.add(d[0])

      if (dataSets[valueLabel] === undefined) {
        dataSets[valueLabel] = {
          label: valueLabel,
          fill: this.filltype,
          data: [],
        }
      }

      dataSets[valueLabel].data.push(d[1])
    }

    const forecastStartDate = this.getForecastStartdate()
    const index = forecastIndex(labels, forecastStartDate)
    const borderDash = [5, 5]

    // Augment each dataSet in dataSets with a border and backgroundColor
    for (const [i, dataSet] of Object.keys(dataSets).entries()) {
      dataSets[dataSet] = {
        ...(dataSets[dataSet] as ChartDataset<'line'>),
        ...(this.colorCoding && this.colorCoding[dataSet]
          ? this.colorCoding[dataSet]
          : this.defaultColorCoding[i]
            ? this.defaultColorCoding[i]
            : this.defaultColorCoding[i % this.defaultColorCoding.length]),
      }

      const backgroundColor = this.getBackgroundColor(dataSet, i)

      if (forecastStartDate) {
        dataSets[dataSet].segment = {
          borderDash: ctx => (forecasted(ctx.p0DataIndex, index) ? borderDash : undefined),
          backgroundColor: ctx =>
            forecasted(ctx.p0DataIndex, index) ? createDiagonalPattern(backgroundColor) : undefined,
        }
      }
    }

    return {
      datasets: Object.values(dataSets),
      labels: [...labels],
    }
  }

  formatCategoricalData(data: SeriesData, yDefaultLabel: string): ChartData<'line'> {
    const dataSets: {[key: string]: ChartDataset<'line'>} = {}

    const labels: Set<string> = new Set()

    // Create a dataSet for each unique label in the data
    for (const d of data) {
      const valueLabel = d[2] && d[2] !== 'Y value' ? d[2] : yDefaultLabel

      const dataSetItem: ChartDataset<'line'> | undefined = dataSets[valueLabel]
      if (dataSetItem) {
        dataSets[valueLabel] = {
          ...dataSets[valueLabel],
          data: [...dataSetItem.data, d[1]],
        }

        labels.add(d[0].toString() || 'Unlabeled')

        continue
      }

      dataSets[valueLabel] = {
        label: valueLabel,
        fill: this.filltype,
        data: [d[1]],
      }

      labels.add(d[0].toString() || 'Unlabeled')
    }

    // Augment each dataSet in dataSets with a border and backgroundColor
    for (const [i, dataSet] of Object.keys(dataSets).entries()) {
      dataSets[dataSet] = {
        ...(dataSets[dataSet] as ChartDataset<'line'>),
        ...(this.colorCoding && this.colorCoding[dataSet]
          ? this.colorCoding[dataSet]
          : this.defaultColorCoding[i]
            ? this.defaultColorCoding[i]
            : this.defaultColorCoding[i % this.defaultColorCoding.length]),
      }
    }

    return {
      datasets: Object.values(dataSets),
      labels: [...labels],
    }
  }

  getForecastStartdate(): string | null {
    return null
  }

  getCompleteChartConfigOptions(inputChartConfig: InputChartConfig): ChartOptions {
    const completeChartOptions = getDefaultChartConfig(this.seriesType, getTheme(), this.stacked, this.indexAxis)

    // apply user defined chart config on top of default one
    for (const [key, value] of Object.entries(inputChartConfig)) {
      setChartAttributes(completeChartOptions, key, value)
    }

    return completeChartOptions
  }

  getBackgroundColor(dataSet: string, i: number): string {
    const colorCoding =
      this.colorCoding && this.colorCoding[dataSet]
        ? this.colorCoding[dataSet].backgroundColor
        : this.defaultColorCoding[i]
          ? this.defaultColorCoding[i].backgroundColor
          : this.defaultColorCoding[i % this.defaultColorCoding.length]!.backgroundColor

    return colorCoding
  }

  getXAndYLabels(columnLabels: SeriesDataItem | undefined): [string, string] {
    const xLabel = columnLabels ? (columnLabels[0] ? `${columnLabels[0]}` : '') : ''
    const yLabel = columnLabels ? (columnLabels[1] ? `${columnLabels[1]}` : '') : ''
    return [xLabel, yLabel]
  }

  validateTimeSeriesInput(): boolean {
    const dataToValidate = this.seriesData
    return validateTimeSeriesInput(dataToValidate)
  }

  validateCategoricalInput(): boolean {
    const dataToValidate = this.seriesData
    return validateCategoricalInput(dataToValidate)
  }

  unmask(): void {
    this.removeEventListener('click', this.unmask)
    this.masked = false
  }

  indexAxis?: 'x' | 'y' | undefined = 'x'
  chartType: ChartType | undefined
  chartName: string | undefined
  stacked: boolean | undefined

  throwError(_message: string): void {
    return
  }
}

function validateTimeSeriesInput(dataToValidate: SeriesData | null): boolean {
  if (!dataToValidate) {
    return false
  }

  const slicedData = dataToValidate.slice(1)

  const valid = slicedData.every(
    val =>
      typeof val[0] === 'string' &&
      Number.isFinite(Date.parse(val[0])) &&
      // Check if the second value in an array item is a number
      Number.isFinite(val[1]) &&
      // Check for third value, if it exists ensure item is a string
      (val[2] ? typeof val[2] === 'string' : true) &&
      // Check if the array item is the same length as the header item
      val.length === dataToValidate[0]!.length,
  )

  return valid
}

function validateCategoricalInput(dataToValidate: SeriesData | null): boolean {
  if (!dataToValidate || !Array.isArray(dataToValidate)) {
    return false
  }

  const slicedData = dataToValidate.slice(1)

  const valid = slicedData.every(
    val =>
      // Check if the second value in an array item is a number
      (Number.isFinite(val[1]) || val[1] === null) &&
      // Check for third value, if it exists ensure item is a string
      (val[2] ? typeof val[2] === 'string' : true) &&
      // Check if the array item is the same length as the header item
      val.length === dataToValidate[0]!.length,
  )

  return valid
}

function forecasted(currentIndex: number, index: number): boolean {
  return index > -1 && currentIndex >= index
}

function createDiagonalPattern(backgroundColor: string): CanvasPattern | undefined {
  const shape = document.createElement('canvas')
  shape.width = 10
  shape.height = 10

  const strokeColor = '#999897'
  const ctx = shape.getContext('2d')

  if (ctx) {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, 10, 10)
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 0.5

    // fractional numbers to address how browsers render 1px lines
    ctx.beginPath()
    ctx.moveTo(2.5, 0.5)
    ctx.lineTo(10.5, 8.5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0.5, 8.5)
    ctx.lineTo(2.5, 10.5)
    ctx.stroke()

    const pattern = ctx.createPattern(shape, 'repeat')
    return pattern ? pattern : undefined
  }

  return undefined
}

function forecastIndex(labels: Set<string>, forecastStartdate: string | null): number {
  if (forecastStartdate) {
    const forecastStartdateTimestamp = new Date(forecastStartdate).getTime()
    const labelsArr = Array.from(labels)

    for (let i = 0; i < labelsArr.length; i++) {
      const labelDateTimestamp = new Date(labelsArr[i]!).getTime()
      if (labelDateTimestamp >= forecastStartdateTimestamp) {
        return i
      }
    }
  }

  return -1
}

// eslint-disable-next-line custom-elements/no-exports-with-element
export {BaseChartElement, validateCategoricalInput, validateTimeSeriesInput, forecastIndex, forecasted}
