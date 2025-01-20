/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getCopilotProgressIndicatorProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders copilot-progress-indicator partial with SSR', async () => {
  const props = getCopilotProgressIndicatorProps()

  const view = await serverRenderReact({
    name: 'copilot-progress-indicator',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch('copilot-spinner')
})
