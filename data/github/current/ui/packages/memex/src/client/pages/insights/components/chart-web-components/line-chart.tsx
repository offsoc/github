import {LineChartElement} from '@github-ui/insights-charts'

import {makeComponentFromWebComponent} from '../../../../components/factories/make-component-from-web-component'

export const LINE_CHART_TAG_NAME = 'line-chart-memex-insights'

class LineChartElementMemex extends LineChartElement {}

export const LineChart = makeComponentFromWebComponent({
  tagName: LINE_CHART_TAG_NAME,
  elementClass: LineChartElementMemex,
})
