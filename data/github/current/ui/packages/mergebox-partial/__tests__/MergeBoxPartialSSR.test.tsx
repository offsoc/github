/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getMergeBoxPartialProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders mergebox-partial partial with SSR', async () => {
  const props = getMergeBoxPartialProps()

  const view = await serverRenderReact({
    name: 'mergebox-partial',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).not.toBeNull()
})
