/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getSponsorsExploreFilterProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

// Mock out use-navigate in SSR tests, see https://github.com/github/web-systems/issues/1809
jest.mock('@github-ui/use-navigate', () => {
  return {
    ...jest.requireActual('@github-ui/use-navigate'),
    useNavigate: () => jest.fn(),
  }
})

test('Renders sponsors-explore-filter partial with SSR', async () => {
  const props = getSponsorsExploreFilterProps()

  const view = await serverRenderReact({
    name: 'sponsors-explore-filter',
    data: {props},
  })
  expect(view).toMatch('sponsors-explore-filter')
})
