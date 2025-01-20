import {screen, fireEvent, act} from '@testing-library/react'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import MarketplaceHeader from '../MarketplaceHeader'
import {mockSearchResults} from '../../test-utils/mock-data'
import {renderWithFilterContext} from '../../test-utils/Render'

const mockSetSearchParams = jest.fn()
jest.mock('@github-ui/use-navigate')

const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetchJSON: jest.fn(),
}))

beforeEach(() => {
  jest.resetAllMocks()

  const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
  useSearchParams.mockImplementation(() => [new URLSearchParams(), mockSetSearchParams])

  mockVerifiedFetchJSON.mockResolvedValue({
    ok: true,
    statusText: 'OK',
    json: async () => {
      return mockSearchResults()
    },
  })
})

const renderComponent = () => renderWithFilterContext(<MarketplaceHeader />)

describe('MarketplaceHeader', () => {
  jest.useFakeTimers()

  test('Renders the search input', async () => {
    renderComponent()

    const searchInput = screen.getByTestId('search-input')
    expect(searchInput).toHaveValue('')

    fireEvent.change(searchInput, {target: {value: 'test'}})
    expect(searchInput).toHaveValue('test')

    await act(() => {
      jest.runAllTimers() // Trigger the debounced fetch
    })

    expect(mockVerifiedFetchJSON).toHaveBeenCalledWith('/marketplace?query=test')
  })

  test('Prefills the input if present in params', async () => {
    const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
    const params = new URLSearchParams()
    params.set('query', 'some search')
    useSearchParams.mockImplementation(() => [params, jest.fn()])

    renderComponent()

    const searchInput = screen.getByTestId('search-input')
    expect(searchInput).toHaveValue('some search')
  })

  test('Excludes the sort if present in params', async () => {
    const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
    const params = new URLSearchParams()
    params.set('query', 'some search sort:match-desc')
    useSearchParams.mockImplementation(() => [params, jest.fn()])

    renderComponent()

    const searchInput = screen.getByTestId('search-input')
    expect(searchInput).toHaveValue('some search')
  })
})
