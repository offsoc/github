import {GraphIcon, type Icon} from '@primer/octicons-react'

import type {MemexChartType} from '../../api/charts/contracts/api'
import {BarChartIcon} from './icons/bar-chart-icon'
import {ColumnChartIcon} from './icons/column-chart-icon'
import {StackedAreaChartIcon} from './icons/stacked-area-chart-icon'

type LayoutOption = {label: string; type: MemexChartType; icon: Icon}

export const chartLayoutsMap: {
  [key in MemexChartType]: LayoutOption
} = {
  bar: {
    label: 'Bar',
    type: 'bar',
    icon: BarChartIcon,
  },
  column: {
    label: 'Column',
    type: 'column',
    icon: ColumnChartIcon,
  },
  line: {
    label: 'Line',
    type: 'line',
    icon: GraphIcon,
  },
  'stacked-area': {
    label: 'Stacked area',
    type: 'stacked-area',
    icon: StackedAreaChartIcon,
  },
  'stacked-bar': {
    label: 'Stacked bar',
    type: 'stacked-bar',
    icon: BarChartIcon,
  },
  'stacked-column': {
    label: 'Stacked column',
    type: 'stacked-column',
    icon: ColumnChartIcon,
  },
}
export const chartLayouts: Array<LayoutOption> = Object.values(chartLayoutsMap)
