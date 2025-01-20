import {fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SponsorsExploreFilter} from '../SponsorsExploreFilter'
import {getSponsorsExploreFilterProps} from '../test-utils/mock-data'

const mockNavigate = jest.fn()

jest.mock('@github-ui/use-navigate', () => {
  return {
    ...jest.requireActual('@github-ui/use-navigate'),
    useNavigate: () => mockNavigate,
  }
})

const mockUseLocationValue = {
  pathname: '/sponsors/explore',
  search: '',
  key: 'key',
  hash: '',
  state: null,
}

jest.mock('@github-ui/ssr-utils', () => ({
  ...jest.requireActual('@github-ui/ssr-utils'),
  get ssrSafeLocation() {
    return mockUseLocationValue
  },
}))

beforeEach(() => {
  mockNavigate.mockClear()
})

test('Renders the SponsorsExploreFilter', () => {
  const props = getSponsorsExploreFilterProps()
  render(<SponsorsExploreFilter {...props} />)
  expect(screen.getByTestId('sponsors-explore-filter')).toBeInTheDocument()
})

test('Navigates on click with expected parameters', () => {
  render(<SponsorsExploreFilter {...getSponsorsExploreFilterProps()} />)

  const applyButton = screen.getByTestId('sponsors-explore-filter-button')
  fireEvent.click(applyButton)

  expect(mockNavigate.mock.calls.length).toBe(1)
  expect(mockNavigate.mock.calls[0][0]).toStrictEqual(
    '/sponsors/explore?account=monalisa&ecosystems=FOO&sort_by=MOST_USED',
  )
})
