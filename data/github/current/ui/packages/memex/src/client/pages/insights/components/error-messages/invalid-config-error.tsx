import {testIdProps} from '@github-ui/test-id-props'
import {Button} from '@primer/react'

import {useInsightsConfigurationPane} from '../../hooks/use-insights-configuration-pane'
import {BaseChartError} from './base-chart-error'

export const InvalidConfigError = () => {
  const {openPane} = useInsightsConfigurationPane()

  return (
    <BaseChartError
      {...testIdProps('chart-invalid-config-error')}
      heading="This chart configuration is no longer valid"
      content={'A required field may have been deleted. Update the configuration or delete the chart.'}
    >
      <Button sx={{mt: 2}} onClick={openPane}>
        Update configuration
      </Button>
    </BaseChartError>
  )
}
