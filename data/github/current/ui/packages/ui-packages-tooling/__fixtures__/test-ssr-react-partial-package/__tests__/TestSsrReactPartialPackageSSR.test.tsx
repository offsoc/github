/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getTestSsrReactPartialPackageProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders test-ssr-react-partial-package partial with SSR', async () => {
  const props = getTestSsrReactPartialPackageProps()
  const view = await serverRenderReact({
    name: 'test-ssr-react-partial-package',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch(props.exampleMessage)
})
