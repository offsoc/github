import {StackedAreaChartElement} from '@github-ui/insights-charts'

import {makeComponentFromWebComponent} from '../../../../components/factories/make-component-from-web-component'

export const STACKED_AREA_CHART_TAG_NAME = 'stacked-area-chart-memex-insights'

class StackedAreaChartElementMemex extends StackedAreaChartElement {}

export const StackedAreaChart = makeComponentFromWebComponent({
  tagName: STACKED_AREA_CHART_TAG_NAME,
  elementClass: StackedAreaChartElementMemex,
})
