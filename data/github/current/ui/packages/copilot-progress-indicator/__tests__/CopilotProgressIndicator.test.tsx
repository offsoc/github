import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CopilotProgressIndicator} from '../CopilotProgressIndicator'
import {getCopilotProgressIndicatorProps} from '../test-utils/mock-data'

test('Renders the CopilotProgressIndicator', () => {
  const props = getCopilotProgressIndicatorProps()
  render(<CopilotProgressIndicator {...props} />)
  expect(screen.getByTestId('copilot-spinner')).toBeInTheDocument()
})
