import {CircleSlashIcon} from '@primer/octicons-react'

import {BaseChartError} from './base-chart-error'

export const MissingChartError: React.FC = () => (
  <BaseChartError
    icon={CircleSlashIcon}
    heading="This insight chart no longer exists"
    content="Select another chart to view insights"
  />
)
