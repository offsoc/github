import {BaseChartError} from './base-chart-error'

export const ChartErrorFallback: React.FC = () => (
  <BaseChartError
    heading="This chart configuration is no longer valid"
    content="A required field may have been deleted. You will need to delete and re-create this chart."
  />
)
