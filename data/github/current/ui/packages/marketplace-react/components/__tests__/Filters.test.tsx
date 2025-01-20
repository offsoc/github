import {screen, fireEvent, act} from '@testing-library/react'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import Filters from '../Filters'
import {mockSearchResults} from '../../test-utils/mock-data'
import {renderWithFilterContext} from '../../test-utils/Render'

const mockSetSearchParams = jest.fn()
jest.mock('@github-ui/use-navigate')

const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetchJSON: jest.fn(),
}))

beforeEach(() => {
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

afterEach(() => {
  jest.clearAllMocks()
})

const renderComponent = () => renderWithFilterContext(<Filters />)

describe('Filters', () => {
  describe('Filter menu', () => {
    test('Renders the filter options and updates when clicked', async () => {
      renderComponent()

      const filterButton = screen.getByTestId('filter-button')
      expect(filterButton).toHaveTextContent('Filter: All')
      fireEvent.click(filterButton)
      expect(screen.getByTestId('filter-menu')).toBeInTheDocument()
      expect(screen.getByRole('menuitemradio', {name: 'All'})).toBeInTheDocument()
      expect(screen.getByRole('menuitemradio', {name: 'Free trial'})).toBeInTheDocument()

      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        fireEvent.click(screen.getByRole('menuitemradio', {name: 'Free trial'}))
      })

      expect(filterButton).toHaveTextContent('Filter: Free trial')
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith('/marketplace?filter=free_trial')
    })

    test('Preselects "Free trial" if present in params', async () => {
      const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
      const params = new URLSearchParams()
      params.set('filter', 'free_trial')
      useSearchParams.mockImplementation(() => [params, jest.fn()])

      renderComponent()

      const filterButton = screen.getByTestId('filter-button')
      expect(filterButton).toHaveTextContent('Filter: Free trial')
    })

    test('Renders model filters if type=models present in params', async () => {
      const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
      const params = new URLSearchParams()
      params.set('type', 'models')
      useSearchParams.mockImplementation(() => [params, jest.fn()])

      renderComponent()

      const filterButton = screen.getByTestId('family-button')
      expect(filterButton).toHaveTextContent('By: All providers')
    })
  })

  describe('Creator menu', () => {
    test('Renders the creator options and updates when clicked', async () => {
      renderComponent()

      const creatorButton = screen.getByTestId('creator-button')
      expect(creatorButton).toHaveTextContent('By: All creators')
      fireEvent.click(creatorButton)
      expect(screen.getByTestId('creator-menu')).toBeInTheDocument()
      expect(screen.getByRole('menuitemradio', {name: 'All creators'})).toBeInTheDocument()
      expect(screen.getByRole('menuitemradio', {name: 'Verified creators'})).toBeInTheDocument()

      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        fireEvent.click(screen.getByRole('menuitemradio', {name: 'Verified creators'}))
      })

      expect(creatorButton).toHaveTextContent('By: Verified creators')
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith('/marketplace?verification=verified_creator')
    })

    test('Preselects "Verified creators" if present in params', async () => {
      const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
      const params = new URLSearchParams()
      params.set('verification', 'verified')
      useSearchParams.mockImplementation(() => [params, jest.fn()])

      renderComponent()

      const creatorButton = screen.getByTestId('creator-button')
      expect(creatorButton).toHaveTextContent('By: Verified creators')
    })
  })

  describe('Sort menu', () => {
    test('Renders the sort options and updates when clicked', async () => {
      renderComponent()

      const sortButton = screen.getByTestId('sort-button')
      expect(sortButton).toHaveTextContent('Sort: Popularity')
      fireEvent.click(sortButton)
      expect(screen.getByTestId('sort-menu')).toBeInTheDocument()
      expect(screen.getByRole('menuitemradio', {name: 'Popularity'})).toBeInTheDocument()
      expect(screen.getByRole('menuitemradio', {name: 'Recently added'})).toBeInTheDocument()
      expect(screen.getByRole('menuitemradio', {name: 'Best match'})).toBeInTheDocument()

      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        fireEvent.click(screen.getByRole('menuitemradio', {name: 'Recently added'}))
      })
      expect(sortButton).toHaveTextContent('Sort: Recently added')
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith('/marketplace?query=sort%3Acreated-desc')

      fireEvent.click(sortButton)
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        fireEvent.click(screen.getByRole('menuitemradio', {name: 'Best match'}))
      })
      expect(sortButton).toHaveTextContent('Sort: Best match')
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith('/marketplace?query=sort%3Amatch-desc')
    })

    test('Preselects "Recently added" if present in params', async () => {
      const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
      const params = new URLSearchParams()
      params.set('query', 'sort:created-desc')
      useSearchParams.mockImplementation(() => [params, jest.fn()])

      renderComponent()

      const sortButton = screen.getByTestId('sort-button')
      expect(sortButton).toHaveTextContent('Sort: Recently added')
    })

    test('Preselects "Best match" if present in params', async () => {
      const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
      const params = new URLSearchParams()
      params.set('query', 'sort:match-desc')
      useSearchParams.mockImplementation(() => [params, jest.fn()])

      renderComponent()

      const sortButton = screen.getByTestId('sort-button')
      expect(sortButton).toHaveTextContent('Sort: Best match')
    })
  })
})
