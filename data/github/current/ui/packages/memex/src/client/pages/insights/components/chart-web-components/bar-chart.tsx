import {BarChartElement} from '@github-ui/insights-charts'

import {makeComponentFromWebComponent} from '../../../../components/factories/make-component-from-web-component'

export const BAR_CHART_TAG_NAME = 'bar-chart-memex-insights'

class BarChartElementMemex extends BarChartElement {}

export const BarChart = makeComponentFromWebComponent({
  tagName: BAR_CHART_TAG_NAME,
  elementClass: BarChartElementMemex,
})
