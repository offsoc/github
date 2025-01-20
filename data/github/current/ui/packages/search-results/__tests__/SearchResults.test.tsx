import {screen, waitFor, waitForElementToBeRemoved} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SearchResults} from '../SearchResults'
import {getSearchResultsProps} from '../test-utils/mock-data'
import {mockFetch} from '@github-ui/mock-fetch'

test('Renders the search results', async () => {
  const searchResultsMock = mockFetch.mockRouteOnce('/stafftools/search/search_results_async?query=test', {
    resultCount: 2,
    resultsFragment: '<p>Search results are loaded</p>',
  })
  const props = getSearchResultsProps()
  render(<SearchResults {...props} />)
  //expect(screen.getByRole('paragraph')).toHaveTextContent('Loading search results...')

  expect(searchResultsMock).toHaveBeenCalled()
  expect(await screen.findByText('Search results are loaded')).toBeInTheDocument()
})

test('Redirect to the search result', async () => {
  expect(window.location.href).toEqual('http://localhost/')
  Object.defineProperty(window, 'location', {
    value: {
      href: window.location.href,
    },
    writable: true, // possibility to override
  })
  const searchResultsMock = mockFetch.mockRouteOnce('/stafftools/search/search_results_async?query=test', {
    resultCount: 2,
    redirectUrl: 'http://localhost/redirected',
  })
  const props = getSearchResultsProps()
  render(<SearchResults {...props} />)
  expect(screen.getByRole('paragraph')).toHaveTextContent('Loading search results...')

  expect(searchResultsMock).toHaveBeenCalled()
  await waitForElementToBeRemoved(() => screen.queryByRole('paragraph'))
  await waitFor(() => expect(window.location.href).toEqual('http://localhost/redirected'))
})
