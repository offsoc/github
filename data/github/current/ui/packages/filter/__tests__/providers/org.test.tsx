import {render, screen, waitFor} from '@testing-library/react'

import {Filter} from '../../Filter'
import {OrgFilterProvider} from '../../providers'
import {updateFilterValue} from '../../test-utils'
import {
  appendToFilterAndRenderAsyncSuggestions,
  expectFilterValueToBe,
  expectSuggestionsToMatchSnapshot,
  moveCursor,
  selectSuggestion,
  setupAsyncErrorHandler,
  setupOrgsMockApi,
} from '../utils/helpers'

describe('Org', () => {
  setupAsyncErrorHandler()
  setupOrgsMockApi()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new OrgFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('org:micro')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('microsoft')

    expectFilterValueToBe('org:login-microsoft')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new OrgFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('mycrosoft')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })

  it('should filter and select suggestions when added in the start of multiple values', async () => {
    const filterProviders = [new OrgFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('is:issue org:,github text')

    moveCursor('is:issue org:'.length)

    await appendToFilterAndRenderAsyncSuggestions('microsoft')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('microsoft')

    expectFilterValueToBe('is:issue org:login-microsoft,github text')
  })
})
