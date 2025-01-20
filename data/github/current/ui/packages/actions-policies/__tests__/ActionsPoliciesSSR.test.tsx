/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getActionsPoliciesProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders actions-policies partial with SSR', async () => {
  const props = getActionsPoliciesProps()
  const view = await serverRenderReact({
    name: 'actions-policies',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch(props.type)
})
