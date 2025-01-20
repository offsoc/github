import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {CopilotImmersive} from '../routes/CopilotImmersive'
import {getCopilotImmersiveRoutePayload} from '../test-utils/mock-data'

beforeEach(() => {
  // We utilize service workers to fuzy search references in Copilot Chat
  // when they are not available we show a warning to the user.
  // Workers are not available in JSDOM so we need to mock the console.warn.
  jest.spyOn(console, 'warn').mockImplementation()
})

jest.mock('@github-ui/feature-flags', () => {
  return {
    isFeatureEnabled: jest.fn().mockReturnValue(true),
  }
})

test('Renders the CopilotImmersive', async () => {
  const routePayload = getCopilotImmersiveRoutePayload()
  render(<CopilotImmersive />, {
    routePayload,
  })

  await expect(screen.findByText('Ask Copilot')).resolves.toBeInTheDocument()
})
