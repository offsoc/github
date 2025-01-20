/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getCodespacesPolicyNameInputProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders codespaces-policy-name-input partial with SSR', async () => {
  const props = getCodespacesPolicyNameInputProps()

  const view = await serverRenderReact({
    name: 'codespaces-policy-name-input',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch(props.existingPolicyName || '')
})
