/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getSearchResultsProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders search-results partial with SSR', async () => {
  const props = getSearchResultsProps()

  const view = await serverRenderReact({
    name: 'search-results',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch('Loading search results...')
})
