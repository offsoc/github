import {isFeatureEnabled} from '@github-ui/feature-flags'
import {render} from '@github-ui/react-core/test-utils'
import {act} from '@testing-library/react'
import {hasMatch} from 'fzy.js'

import {Filter} from '../Filter'
import {labels, labelSuggestions} from '../mocks'
import {LabelFilterProvider} from '../providers'
import {setupExpectedAsyncErrorHandler, updateFilterValue} from '../test-utils'
import {
  appendToFilterAndRenderAsyncSuggestions,
  expectFilterValueToBe,
  expectSuggestionsToBeEmpty,
  expectSuggestionsToMatchSnapshot,
  selectSuggestion,
} from './utils/helpers'

jest.mock('@github-ui/feature-flags')

jest.setTimeout(4_500)
const globalFetch = global.fetch

describe('Caching suggestions', () => {
  const set = new Set()
  let error: Error | null = null

  beforeEach(() => {
    global.fetch = jest.fn(url => {
      const parsedUrl = new URL(url, window.location.origin)
      const filterValue = parsedUrl.searchParams.get('q')
      // fail the test if fetch is called more than once for the same value
      if (set.has(url)) {
        error = new Error('Error: fetch should not be called more than once for value')
        return Promise.reject(error)
      }
      set.add(url)
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            labels: filterValue
              ? labels.filter(l => {
                  return hasMatch(filterValue, l.name)
                })
              : labelSuggestions,
          }),
      })
    }) as jest.Mock
    setupExpectedAsyncErrorHandler()
  })

  afterEach(() => {
    set.clear()
    jest.restoreAllMocks()
    ;(isFeatureEnabled as jest.Mock).mockRestore()
    global.fetch = globalFetch
  })

  function expectFetchToBeCalledOnce() {
    if (error) throw error
  }

  it('should filter and select cached suggestions on empty value', async () => {
    const filterProviders = [new LabelFilterProvider()]
    const {user} = render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('label:')
    expectFetchToBeCalledOnce()

    expectSuggestionsToMatchSnapshot()

    await appendToFilterAndRenderAsyncSuggestions('a')
    expectFetchToBeCalledOnce()

    expectSuggestionsToMatchSnapshot()

    await user.keyboard('{Backspace}')

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      jest.runAllTimers()
    })
    expectFetchToBeCalledOnce()

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('No label')
    expectFilterValueToBe('no:label')
  })

  it('should filter and select cached suggestions on value', async () => {
    const filterProviders = [new LabelFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('label:a')
    expectFetchToBeCalledOnce()

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('triage')

    expectFilterValueToBe('label:triage')

    await appendToFilterAndRenderAsyncSuggestions(',b')
    expectFetchToBeCalledOnce()

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('accessibility review')

    expectFilterValueToBe('label:triage,"accessibility review"')
  })

  it('should filter and select cached suggestions on value with prefetching enabled', async () => {
    ;(isFeatureEnabled as jest.Mock).mockImplementation(flag => flag === 'filter_prefetch_suggestions')

    const filterProviders = [new LabelFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('label:a')
    expectFetchToBeCalledOnce()

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('triage')

    expectFilterValueToBe('label:triage')

    await appendToFilterAndRenderAsyncSuggestions(',b')
    expectFetchToBeCalledOnce()

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('accessibility review')

    expectFilterValueToBe('label:triage,"accessibility review"')
  })

  it('should filter and select cached suggestions on backspace', async () => {
    const filterProviders = [new LabelFilterProvider()]
    const {user} = render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('label:')
    expectFetchToBeCalledOnce()

    await appendToFilterAndRenderAsyncSuggestions('a11')
    expectFetchToBeCalledOnce()

    await appendToFilterAndRenderAsyncSuggestions('y')
    expectFetchToBeCalledOnce()

    await expectSuggestionsToBeEmpty()

    await user.keyboard('{Backspace>4}')
    expectFetchToBeCalledOnce()

    expectFilterValueToBe('label:')
  })

  it('should not display selected from cached suggestion', async () => {
    const filterProviders = [new LabelFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('label:c')

    expectFetchToBeCalledOnce()

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('accessibility review')

    expectFilterValueToBe('label:"accessibility review"')

    await appendToFilterAndRenderAsyncSuggestions(',c')

    expectFetchToBeCalledOnce()

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('batch')

    expectFilterValueToBe('label:"accessibility review",batch')
  })
})
