/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getTestReactPartialPackageProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../entry'

test('Renders test-react-partial-package partial with SSR', async () => {
  const props = getTestReactPartialPackageProps()
  const view = await serverRenderReact({
    name: 'test-react-partial-package',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch(props.exampleMessage)
})
