import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {CopilotCodeGuidelinesPlayground} from '../CopilotCodeGuidelinesPlayground'
import {getCopilotCodeGuidelinesPlaygroundProps} from '../test-utils/mock-data'

test('Renders the CopilotCodeGuidelinesPlayground', async () => {
  const props = getCopilotCodeGuidelinesPlaygroundProps()
  render(<CopilotCodeGuidelinesPlayground {...props} />)
  const heading = await screen.findByRole('heading', {name: 'Guideline playground'})
  expect(heading).toBeInTheDocument()
})
