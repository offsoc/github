import {render} from '@testing-library/react'

import {Filter} from '../../Filter'
import {SortFilterProvider} from '../../providers'
import {updateFilterValue} from '../../test-utils'
import {
  appendToFilterAndRenderAsyncSuggestions,
  expectErrorMessage,
  expectFilterValueToBe,
  expectNoErrorMessage,
  expectSuggestionsToMatchSnapshot,
  selectSuggestion,
  setupAsyncErrorHandler,
} from '../utils/helpers'

describe('Sort', () => {
  setupAsyncErrorHandler()

  it('should filter and select suggestions', async () => {
    const filterProviders = [new SortFilterProvider(['updated'])]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('sort:')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Recently updated')

    expectFilterValueToBe('sort:updated-desc')

    expectNoErrorMessage()
  })

  it('should display error when filter not included in accepted values', async () => {
    const filterProviders = [new SortFilterProvider(['updated'])]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('sort:created-desc ')

    expectErrorMessage('sort', 'created-desc')
  })

  it('should support aliases when matching enabled', async () => {
    const filterProviders = [new SortFilterProvider(['updated'])]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} settings={{aliasMatching: true}} />)

    await updateFilterValue('sort:')

    expectSuggestionsToMatchSnapshot()

    await appendToFilterAndRenderAsyncSuggestions('updated ')

    expectFilterValueToBe('sort:updated ')

    expectNoErrorMessage()
  })

  it('should not support aliases by default', async () => {
    const filterProviders = [new SortFilterProvider(['updated'])]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('sort:')

    expectSuggestionsToMatchSnapshot()

    await appendToFilterAndRenderAsyncSuggestions('updated ')

    expectFilterValueToBe('sort:updated ')

    expectErrorMessage('sort', 'updated')
  })

  it('should support emoji reactions', async () => {
    const filterProviders = [new SortFilterProvider(['reactions'])]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('sort:')

    await appendToFilterAndRenderAsyncSuggestions('reactions-+1 ')

    expectFilterValueToBe('sort:reactions-+1 ')

    expectNoErrorMessage()
  })

  it('should not support invalid emoji reactions', async () => {
    const filterProviders = [new SortFilterProvider(['reactions'])]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('sort:')

    await appendToFilterAndRenderAsyncSuggestions('reactions-cry ')

    expectFilterValueToBe('sort:reactions-cry ')

    expectErrorMessage('sort', 'reactions-cry')
  })
})
