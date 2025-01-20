import {render, screen, waitFor} from '@testing-library/react'

import {Filter} from '../../Filter'
import {LanguageFilterProvider} from '../../providers'
import {updateFilterValue} from '../../test-utils'
import {
  appendToFilterAndRenderAsyncSuggestions,
  expectFilterValueToBe,
  expectSuggestionsToMatchSnapshot,
  moveCursor,
  selectSuggestion,
  setupAsyncErrorHandler,
  setupLanguageMockApi,
} from '../utils/helpers'

describe('Language', () => {
  setupAsyncErrorHandler()
  setupLanguageMockApi()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new LanguageFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('language:java')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('JavaScript')

    expectFilterValueToBe('language:JavaScript')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new LanguageFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('language:jaaaava')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })

  it('should filter and select suggestions when added in the start of multiple values', async () => {
    const filterProviders = [new LanguageFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('is:issue language:,python text')

    moveCursor('is:issue language:'.length)

    await appendToFilterAndRenderAsyncSuggestions('java')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('JavaScript')

    expectFilterValueToBe('is:issue language:JavaScript,python text')
  })
})
