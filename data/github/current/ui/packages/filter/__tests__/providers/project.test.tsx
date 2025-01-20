import {render, screen, waitFor} from '@testing-library/react'

import {Filter} from '../../Filter'
import {ProjectFilterProvider} from '../../providers'
import {updateFilterValue} from '../../test-utils'
import {
  expectFilterValueToBe,
  expectSuggestionsToMatchSnapshot,
  selectSuggestion,
  setupAsyncErrorHandler,
  setupProjectsMockApi,
} from '../utils/helpers'

describe('Project', () => {
  setupAsyncErrorHandler()
  setupProjectsMockApi()

  it('should filter and select suggestions based on title', async () => {
    const filterProviders = [new ProjectFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('project:Silk')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Project Silk')

    expectFilterValueToBe('project:github/8800')
  })

  it('should filter and select suggestions based on slug', async () => {
    const filterProviders = [new ProjectFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('project:github/216')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion("almaleksia's memex")

    expectFilterValueToBe('project:github/2169')
  })

  it('should not show any suggestions based on invalid slug', async () => {
    const filterProviders = [new ProjectFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('project:github/6666666666666')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })

  it('should not show any suggestions based on invalid title', async () => {
    const filterProviders = [new ProjectFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('onoenfkoenrf')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })
})
