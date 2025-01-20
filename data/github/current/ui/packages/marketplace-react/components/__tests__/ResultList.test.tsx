import {screen} from '@testing-library/react'
import ResultList from '../ResultList'
import {getIndexRoutePayload} from '../../test-utils/mock-data'
import type {IndexPayload} from '../../types'
import {renderWithFilterContext} from '../../test-utils/Render'

jest.mock('@github-ui/use-navigate')

beforeEach(() => {
  const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
  useSearchParams.mockImplementation(() => [new URLSearchParams(), jest.fn()])
})

const renderComponent = (searchResults: IndexPayload['searchResults']) => {
  renderWithFilterContext(<ResultList categories={getIndexRoutePayload().categories} />, {searchResults})
}

describe('SearchResults', () => {
  describe('Dynamic heading text', () => {
    test('Renders the search heading when searching', () => {
      const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
      const params = new URLSearchParams()
      params.set('query', 'something sort:created-desc')
      useSearchParams.mockImplementation(() => [params, jest.fn()])
      renderComponent(getIndexRoutePayload().searchResults)

      expect(screen.getByTestId('heading-text')).toHaveTextContent('Search results for “something”')
      expect(screen.getByTestId('detail-text')).toHaveTextContent('10 results')
    })

    test('Renders the copilot heading when copilot_app is in the params', () => {
      const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
      const params = new URLSearchParams()
      params.set('copilot_app', 'true')
      useSearchParams.mockImplementation(() => [params, jest.fn()])
      renderComponent(getIndexRoutePayload().searchResults)

      expect(screen.getByTestId('heading-text')).toHaveTextContent('Copilot Extensions')
      expect(screen.getByTestId('detail-text')).toHaveTextContent(
        'Extend Copilot capabilities using third party tools, services, and data',
      )
    })

    test('Renders the models heading when models type is in the params', () => {
      const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
      const params = new URLSearchParams()
      params.set('type', 'models')
      useSearchParams.mockImplementation(() => [params, jest.fn()])
      renderComponent(getIndexRoutePayload().searchResults)

      expect(screen.getByTestId('heading-text')).toHaveTextContent('Models')
      expect(screen.getByTestId('detail-text')).toHaveTextContent(
        'Try, test, and deploy from a wide range of model types, sizes, and specializations',
      )
    })

    test('Renders the category heading when a category and app type is in the params', () => {
      const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
      const params = new URLSearchParams()
      params.set('category', 'mock-category')
      params.set('type', 'apps')
      useSearchParams.mockImplementation(() => [params, jest.fn()])
      renderComponent(getIndexRoutePayload().searchResults)

      expect(screen.getByTestId('heading-text')).toHaveTextContent('Mock Category apps')
      expect(screen.getByTestId('detail-text')).toHaveTextContent('This is a description') // From the category mock
    })

    test('Renders the action category heading when a category and action type is in the params', () => {
      const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
      const params = new URLSearchParams()
      params.set('category', 'mock-category')
      params.set('type', 'actions')
      useSearchParams.mockImplementation(() => [params, jest.fn()])
      renderComponent(getIndexRoutePayload().searchResults)

      expect(screen.getByTestId('heading-text')).toHaveTextContent('Mock Category actions')
      expect(screen.getByTestId('detail-text')).toHaveTextContent('This is a description') // From the category mock
    })

    test('Renders the action heading when the app type is in the params', () => {
      const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
      const params = new URLSearchParams()
      params.set('type', 'apps')
      useSearchParams.mockImplementation(() => [params, jest.fn()])
      renderComponent(getIndexRoutePayload().searchResults)

      expect(screen.getByTestId('heading-text')).toHaveTextContent('Apps')
      expect(screen.getByTestId('detail-text')).toHaveTextContent(
        'Build on your workflow with apps that integrate with GitHub',
      )
    })

    test('Renders the action heading when the action type is in the params', () => {
      const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
      const params = new URLSearchParams()
      params.set('type', 'actions')
      useSearchParams.mockImplementation(() => [params, jest.fn()])
      renderComponent(getIndexRoutePayload().searchResults)

      expect(screen.getByTestId('heading-text')).toHaveTextContent('Actions')
      expect(screen.getByTestId('detail-text')).toHaveTextContent('Automate your workflow from idea to production')
    })
  })

  describe('When there are search results', () => {
    test('Renders the filters', () => {
      renderComponent(getIndexRoutePayload().searchResults)

      expect(screen.getByTestId('filter-button')).toBeInTheDocument()
      expect(screen.getByTestId('creator-button')).toBeInTheDocument()
      expect(screen.getByTestId('sort-button')).toBeInTheDocument()
    })

    test('Renders the search results', () => {
      const results = getIndexRoutePayload().searchResults
      renderComponent(results)

      expect(screen.getByTestId('search-results')).toBeInTheDocument()
      for (const result of results.results) {
        expect(screen.getByText(result.name)).toBeInTheDocument()
      }
    })
  })

  describe('When there are no search results', () => {
    test('Render the filters', () => {
      renderComponent({results: [], total: 0, totalPages: 0})

      expect(screen.getByTestId('filter-button')).toBeInTheDocument()
      expect(screen.getByTestId('creator-button')).toBeInTheDocument()
      expect(screen.getByTestId('sort-button')).toBeInTheDocument()
    })

    test('Renders the blankslate', () => {
      renderComponent({results: [], total: 0, totalPages: 0})

      expect(screen.getByText('No results')).toBeInTheDocument()
      expect(screen.getByText('Try searching by different keywords.')).toBeInTheDocument()
    })
  })
})
