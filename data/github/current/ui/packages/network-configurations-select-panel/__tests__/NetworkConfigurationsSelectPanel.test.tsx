import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {NetworkConfigurationsSelectPanel} from '../NetworkConfigurationsSelectPanel'
import {getNetworkConfigurationsSelectPanelProps} from '../test-utils/mock-data'

test('Renders the NetworkConfigurationsSelectPanel', () => {
  const props = getNetworkConfigurationsSelectPanelProps()
  render(<NetworkConfigurationsSelectPanel {...props} />)
  expect(screen.getByRole('article')).toHaveTextContent('Network configurations')
})
