import {ColumnChartElement} from '@github-ui/insights-charts'

import {makeComponentFromWebComponent} from '../../../../components/factories/make-component-from-web-component'

export const COLUMN_CHART_TAG_NAME = 'column-chart-memex-insights'

class ColumnChartElementMemex extends ColumnChartElement {}

export const ColumnChart = makeComponentFromWebComponent({
  tagName: COLUMN_CHART_TAG_NAME,
  elementClass: ColumnChartElementMemex,
})
