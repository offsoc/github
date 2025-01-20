import {PRIMER_FONT_STACK, getTheme, colors as primerColors} from '../primer'
import type {ChartOptions} from 'chart.js'
import typography from '../primer/typography'
import {SeriesType} from '../../src/types'

export interface DataSetConfig {
  borderColor: string
  backgroundColor: string
  borderWidth?: number
  pointBackgroundColor?: string
  pointBorderColor?: string
  pointHoverBackgroundColor?: string
  pointHoverBorderWidth?: number
  pointHoverRadius?: number
  pointHoverBorderColor?: string
}

export const getDefaultChartConfig = (
  seriesType: SeriesType,
  theme = getTheme(),
  stacked?: boolean,
  indexAxis?: 'x' | 'y',
): ChartOptions => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  indexAxis,
  animations: {
    colors: false,
    x: false,
  },
  transitions: {
    active: {
      animation: {
        duration: 0,
      },
    },
  },
  plugins: {
    title: {
      display: false,
    },
    subtitle: {
      display: false,
    },
    tooltip: {
      usePointStyle: true,
      caretSize: 0,
      caretPadding: 20,
      multiKeyBackground: primerColors[theme].canvas.default,
      titleFont: {
        size: 14,
        weight: '500',
        family: PRIMER_FONT_STACK,
      },
      titleColor: primerColors[theme].fg.muted,
      bodyFont: {
        size: 14,
        weight: 'normal',
        family: PRIMER_FONT_STACK,
      },
      bodyColor: primerColors[theme].fg.default,
      backgroundColor: primerColors[theme].canvas.default,
      xAlign: 'left',
      yAlign: 'center',
      borderColor: primerColors[theme].border.default,
      callbacks: {
        labelPointStyle() {
          return {
            pointStyle: 'circle',
            rotation: 0,
            margin: 16,
            backgroundColor: primerColors[theme].canvas.default,
          }
        },
        label(context) {
          return `  ${context['dataset'].label}  ${context.formattedValue}`
        },
        ...(seriesType === SeriesType.Time
          ? {
              title(context) {
                const title = context[0]?.label.split(',')

                if (!title) return '' // skip rendering the title if data is malformed

                const year = title[1]?.trim()
                const monthDay = title[0]?.split(' ')

                if (!monthDay) return '' // skip rendering the title if data is malformed

                const monthShort = monthDay[0]
                const day = monthDay[1]

                const date = new Date(Date.parse(`${title[0]},${title[1]}`))
                const weekDay = date.toLocaleDateString('en-US', {weekday: 'short'})

                return `${weekDay} ${day}. ${monthShort} ${year}`
              },
            }
          : {}),
      },
      itemSort: (a, b) => b.datasetIndex - a.datasetIndex,
      bodySpacing: 6,
      padding: 16,
      titleMarginBottom: 16,
      displayColors: true,
      boxWidth: 12,
      boxHeight: 12,
      borderWidth: 2,
      cornerRadius: 12,
    },
    legend: {
      position: 'top',
      align: 'end',
      display: true,
      reverse: true,
      labels: {
        boxHeight: 8,
        boxWidth: 8,
        textAlign: 'left',
        usePointStyle: true,
        pointStyle: 'circle',
        color: primerColors[theme].fg.default,
        padding: 16,
        font: {
          family: PRIMER_FONT_STACK,
          size: 14,
        },
      },
    },
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  interaction: {
    mode: 'nearest',
    axis: indexAxis,
    intersect: false,
  },
  scales: {
    x: {
      stacked,
      title: {
        display: false,
      },
      grid: {
        borderDash: [2, 2],
        tickBorderDash: [2, 2],
        borderColor: primerColors[theme].fg.subtle,
        color: primerColors[theme].border.subtle,
        drawTicks: false,
        z: 10,
      },
      ticks: {
        color: primerColors[theme].fg.subtle,
        padding: 10,
        font: {
          size: 12,
          lineHeight: typography.normal.lineHeight.condensed,
          family: PRIMER_FONT_STACK,
        },
      },
      ...(seriesType === SeriesType.Time && indexAxis === 'x'
        ? {
            type: 'time',
            time: {
              unit: 'day',
            },
          }
        : {}),
    },
    y: {
      stacked,
      grid: {
        borderDash: [2, 2],
        tickBorderDash: [2, 2],
        borderColor: primerColors[theme].fg.subtle,
        color: primerColors[theme].border.subtle,
        drawTicks: true,
        z: 10,
      },
      ticks: {
        color: primerColors[theme].fg.subtle,
        padding: 10,
        font: {
          size: 12,
          lineHeight: typography.normal.lineHeight.condensed,
          family: PRIMER_FONT_STACK,
        },
      },
      title: {
        display: false,
      },
      ...(seriesType === SeriesType.Time && indexAxis === 'y'
        ? {
            type: 'time',
            time: {
              unit: 'day',
            },
          }
        : {}),
    },
  },
})

export const getDatasetConfig = (theme = getTheme()): DataSetConfig[] => {
  const primerScaleColors = primerColors[simpleTheme(theme)].scale
  const recolor = (lightScale: number, darkScale: number) => colorScale(theme, lightScale, darkScale)

  return [
    // primary colors
    {
      borderColor: String(primerScaleColors.blue[recolor(5, 5)]),
      backgroundColor: String(primerScaleColors.blue[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.blue[recolor(5, 5)],
      pointHoverBackgroundColor: primerScaleColors.blue[recolor(5, 5)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.blue[recolor(5, 5)],
      pointHoverBorderColor: primerScaleColors.blue[recolor(5, 5)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.green[recolor(4, 5)]),
      backgroundColor: String(primerScaleColors.green[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.green[recolor(4, 5)],
      pointHoverBackgroundColor: primerScaleColors.green[recolor(4, 5)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.green[recolor(4, 5)],
      pointHoverBorderColor: primerScaleColors.green[recolor(4, 5)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.orange[recolor(4, 4)]),
      backgroundColor: String(primerScaleColors.orange[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.orange[recolor(4, 4)],
      pointHoverBackgroundColor: primerScaleColors.orange[recolor(4, 4)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.orange[recolor(4, 4)],
      pointHoverBorderColor: primerScaleColors.orange[recolor(4, 4)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.pink[recolor(5, 5)]),
      backgroundColor: String(primerScaleColors.pink[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.pink[recolor(5, 5)],
      pointHoverBackgroundColor: primerScaleColors.pink[recolor(5, 5)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.pink[recolor(5, 5)],
      pointHoverBorderColor: primerScaleColors.pink[recolor(5, 5)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.gray[recolor(6, 4)]),
      backgroundColor: String(primerScaleColors.gray[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.gray[recolor(6, 4)],
      pointHoverBackgroundColor: primerScaleColors.gray[recolor(6, 4)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.gray[recolor(6, 4)],
      pointHoverBorderColor: primerScaleColors.gray[recolor(6, 4)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.yellow[recolor(4, 4)]),
      backgroundColor: String(primerScaleColors.yellow[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.yellow[recolor(4, 4)],
      pointHoverBackgroundColor: primerScaleColors.yellow[recolor(4, 4)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.yellow[recolor(4, 4)],
      pointHoverBorderColor: primerScaleColors.yellow[recolor(4, 4)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.red[recolor(5, 5)]),
      backgroundColor: String(primerScaleColors.red[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.red[recolor(5, 5)],
      pointHoverBackgroundColor: primerScaleColors.red[recolor(5, 5)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.red[recolor(5, 5)],
      pointHoverBorderColor: primerScaleColors.red[recolor(5, 5)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.purple[recolor(5, 5)]),
      backgroundColor: String(primerScaleColors.purple[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.purple[recolor(5, 5)],
      pointHoverBackgroundColor: primerScaleColors.purple[recolor(5, 5)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.purple[recolor(5, 5)],
      pointHoverBorderColor: primerScaleColors.purple[recolor(5, 5)],
      pointHoverBorderWidth: 1,
    },
    // overflow colors
    {
      borderColor: String(primerScaleColors.blue[recolor(7, 3)]),
      backgroundColor: String(primerScaleColors.blue[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.blue[recolor(7, 3)],
      pointHoverBackgroundColor: primerScaleColors.blue[recolor(7, 3)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.blue[recolor(7, 3)],
      pointHoverBorderColor: primerScaleColors.blue[recolor(7, 3)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.green[recolor(6, 3)]),
      backgroundColor: String(primerScaleColors.green[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.green[recolor(6, 3)],
      pointHoverBackgroundColor: primerScaleColors.green[recolor(6, 3)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.green[recolor(6, 3)],
      pointHoverBorderColor: primerScaleColors.green[recolor(6, 3)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.orange[recolor(6, 2)]),
      backgroundColor: String(primerScaleColors.orange[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.orange[recolor(6, 2)],
      pointHoverBackgroundColor: primerScaleColors.orange[recolor(6, 2)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.orange[recolor(6, 2)],
      pointHoverBorderColor: primerScaleColors.orange[recolor(6, 2)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.pink[recolor(7, 3)]),
      backgroundColor: String(primerScaleColors.pink[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.pink[recolor(7, 3)],
      pointHoverBackgroundColor: primerScaleColors.pink[recolor(7, 3)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.pink[recolor(7, 3)],
      pointHoverBorderColor: primerScaleColors.pink[recolor(7, 3)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.gray[recolor(8, 2)]),
      backgroundColor: String(primerScaleColors.gray[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.gray[recolor(8, 2)],
      pointHoverBackgroundColor: primerScaleColors.gray[recolor(8, 2)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.gray[recolor(8, 2)],
      pointHoverBorderColor: primerScaleColors.gray[recolor(8, 2)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.yellow[recolor(6, 2)]),
      backgroundColor: String(primerScaleColors.yellow[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.yellow[recolor(6, 2)],
      pointHoverBackgroundColor: primerScaleColors.yellow[recolor(6, 2)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.yellow[recolor(6, 2)],
      pointHoverBorderColor: primerScaleColors.yellow[recolor(6, 2)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.red[recolor(7, 3)]),
      backgroundColor: String(primerScaleColors.red[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.red[recolor(7, 3)],
      pointHoverBackgroundColor: primerScaleColors.red[recolor(7, 3)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.red[recolor(7, 3)],
      pointHoverBorderColor: primerScaleColors.red[recolor(7, 3)],
      pointHoverBorderWidth: 1,
    },
    {
      borderColor: String(primerScaleColors.purple[recolor(7, 3)]),
      backgroundColor: String(primerScaleColors.purple[recolor(0, 9)]),
      borderWidth: 2,
      pointBackgroundColor: primerScaleColors.purple[recolor(7, 3)],
      pointHoverBackgroundColor: primerScaleColors.purple[recolor(7, 3)],
      pointHoverRadius: 3,
      pointBorderColor: primerScaleColors.purple[recolor(7, 3)],
      pointHoverBorderColor: primerScaleColors.purple[recolor(7, 3)],
      pointHoverBorderWidth: 1,
    },
  ]
}

export const simpleTheme = (theme: string) => {
  return theme.includes('dark') ? 'dark' : 'light'
}

export const colorScale = (theme: string, lightScale: number, darkScale: number) => {
  return theme.includes('dark') ? darkScale : lightScale
}

type ScalarValue = string | number | boolean | null
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type FunctionReturningScalarValue = (arg?: any) => ScalarValue
type ConfigValue = ScalarValue | ScalarValue[] | FunctionReturningScalarValue

export interface InputChartConfig {
  [key: string]: ConfigValue
}

// Stores the mapping of exposed chart config attribute and corresponding chart.js config path along with default value
export const chartOptions = new Map([
  ['chart-legends', {path: 'plugins.legend.display', type: 'boolean', defaultValue: true}],
  ['chart-tooltip', {path: 'plugins.tooltip.enabled', type: 'boolean', defaultValue: true}],
  ['chart-grid-vertical', {path: 'scales.x.grid.display', type: 'boolean', defaultValue: true}],
  ['chart-grid-horizontal', {path: 'scales.y.grid.display', type: 'boolean', defaultValue: true}],
  ['chart-label-x', {path: 'scales.x.title.display', type: 'boolean', defaultValue: false}],
  ['chart-label-y', {path: 'scales.y.title.display', type: 'boolean', defaultValue: false}],
  ['chart-title', {path: 'plugins.title.text', type: 'string', defaultValue: ''}],
  ['chart-subtitle', {path: 'plugins.subtitle.text', type: 'string', defaultValue: ''}],
  ['chart-precision-x', {path: 'scales.x.ticks.precision', type: 'number', defaultValue: 0}],
  ['chart-precision-y', {path: 'scales.y.ticks.precision', type: 'number', defaultValue: 0}],
  ['chart-min-y', {path: 'scales.y.min', type: 'number'}],
])

export function initializeChartConfig<T>(target: T, name: PropertyKey): void {
  const descriptor = {
    get(this: HTMLElement) {
      const config: InputChartConfig = {}

      for (const [key, value] of chartOptions) {
        if (this.hasAttribute(key)) {
          const attrValue = this.getAttribute(key)
          let parsedValue: ConfigValue = attrValue
          switch (value.type) {
            case 'number':
              parsedValue = Number(attrValue)
              break
            case 'boolean':
              if (attrValue === 'false') parsedValue = false
              else parsedValue = true
              break
            default:
              if (key === 'chart-title' && parsedValue !== '') {
                config['plugins.title.display'] = true
              } else if (key === 'chart-subtitle' && parsedValue !== '') {
                config['plugins.subtitle.display'] = true
              }
          }
          config[value.path] = parsedValue
        } else if (value.defaultValue !== undefined) {
          config[value.path] = value.defaultValue
        }
      }
      return config
    },
    enumerable: true,
    configurable: true,
  }
  Object.defineProperty(target, name, descriptor)
}

export const setChartAttributes = (obj: Record<string, unknown>, path: string, value: unknown) => {
  const keyPath = path.split('.')
  const lastKeyIndex = keyPath.length - 1

  for (let i = 0; i < lastKeyIndex; ++i) {
    const attr = String(keyPath[i])
    if (!(attr in obj)) {
      obj[attr] = {}
    }
    // @ts-expect-error existing functionality, don't want to break now
    obj = obj[attr]
  }
  obj[String(keyPath[lastKeyIndex])] = value
}
