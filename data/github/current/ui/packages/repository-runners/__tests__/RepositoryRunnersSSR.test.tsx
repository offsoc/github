/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getRepositoryRunnersProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

// Mock the following properties to avoid focus errors for ListView
beforeAll(() => {
  Object.defineProperties(HTMLElement.prototype, {
    offsetHeight: {get: () => 42},
    offsetWidth: {get: () => 42},
    getClientRects: {get: () => () => [42]},
    offsetParent: {get: () => true},
  })
})

test('Renders repository-runners partial with SSR', async () => {
  const props = getRepositoryRunnersProps()

  const view = await serverRenderReact({
    name: 'repository-runners',
    data: {props},
  })

  expect(view).toMatch('GitHub-hosted runners')
})
