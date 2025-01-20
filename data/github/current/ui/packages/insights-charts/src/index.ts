import {InsightsQueryElement, RegisterInsightsQuery} from './insights-query-element'
import {BarChartElement, RegisterBarChart} from './bar-chart-element'
import {StackedAreaChartElement, RegisterStackedAreaChart} from './stacked-area-chart-element'
import {LineChartElement, RegisterLineChart} from './line-chart-element'
import {ColumnChartElement, RegisterColumnChart} from './column-chart-element'
import {SeriesTableElement, RegisterSeriesTable} from './series-table-element'
import {HeroStatElement, RegisterHeroStat} from './hero-stat-element'
import type {ColorCodingConfig, Series, SeriesData} from './types'
import {getTheme, colors} from '../shared/primer'
import {simpleTheme, colorScale, type InputChartConfig} from '../shared/base-chart/config'
// eslint-disable-next-line import/no-namespace
import * as forecasting from './forecasting'
// eslint-disable-next-line import/no-namespace
import * as padding from './padding'
// eslint-disable-next-line import/no-namespace
import * as rollingSum from './rolling-sum'

export {InsightsQueryElement, RegisterInsightsQuery}
export {BarChartElement, RegisterBarChart}
export {StackedAreaChartElement, RegisterStackedAreaChart}
export {LineChartElement, RegisterLineChart}
export {ColumnChartElement, RegisterColumnChart}
export {SeriesTableElement, RegisterSeriesTable}
export {HeroStatElement, RegisterHeroStat}
export {forecasting}
export {padding}
export {rollingSum}
export type {ColorCodingConfig, Series, SeriesData, InputChartConfig}
export {getTheme, colors}
export {simpleTheme, colorScale}
