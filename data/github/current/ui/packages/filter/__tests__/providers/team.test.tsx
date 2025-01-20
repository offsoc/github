import {render, screen, waitFor} from '@testing-library/react'

import {Filter} from '../../Filter'
import {TeamFilterProvider} from '../../providers'
import {updateFilterValue} from '../../test-utils'
import {
  appendToFilterAndRenderAsyncSuggestions,
  expectFilterValueToBe,
  expectSuggestionsToMatchSnapshot,
  moveCursor,
  selectSuggestion,
  setupAsyncErrorHandler,
  setupTeamsMockApi,
} from '../utils/helpers'

describe('Team', () => {
  setupAsyncErrorHandler()
  setupTeamsMockApi()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new TeamFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('team:planning')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('github/planning-tracking')

    expectFilterValueToBe('team:github/planning-tracking')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new TeamFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('plaaaannning')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })

  it('should filter and select suggestions when added in the start of multiple values', async () => {
    const filterProviders = [new TeamFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('is:issue team:,foo text')

    moveCursor('is:issue team:'.length)

    await appendToFilterAndRenderAsyncSuggestions('planning')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('github/planning-tracking')

    expectFilterValueToBe('is:issue team:github/planning-tracking,foo text')
  })
})
