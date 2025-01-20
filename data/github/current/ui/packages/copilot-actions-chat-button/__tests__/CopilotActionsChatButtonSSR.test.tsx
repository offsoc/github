/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders copilot-actions-chat-button partial with SSR', async () => {
  const view = await serverRenderReact({
    name: 'copilot-actions-chat-button',
    data: {props: {}},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch('Suggest a fix')
})
