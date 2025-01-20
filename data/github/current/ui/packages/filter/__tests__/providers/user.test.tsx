import {render, screen, waitFor} from '@testing-library/react'

import {Filter} from '../../Filter'
import {
  AssigneeFilterProvider,
  AuthorFilterProvider,
  CommenterFilterProvider,
  InvolvesFilterProvider,
  MentionsFilterProvider,
  ReviewedByFilterProvider,
  ReviewRequestedFilterProvider,
  UserFilterProvider,
  UserReviewRequestedFilterProvider,
} from '../../providers'
import {updateFilterValue} from '../../test-utils'
import {
  appendToFilterAndRenderAsyncSuggestions,
  expectFilterValueToBe,
  expectSuggestionsToMatchSnapshot,
  moveCursor,
  selectSuggestion,
  setupAsyncErrorHandler,
  setupUsersMockApi,
} from '../utils/helpers'

describe('Assignee', () => {
  setupAsyncErrorHandler()
  setupUsersMockApi()

  it('ensures `signed-in user` is part of accessible name for `@me` value', async () => {
    const filterProviders = [new AssigneeFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('assignee:')

    expect(screen.getByRole('option', {name: '@me, Signed-in user'})).toBeInTheDocument()
  })

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new AssigneeFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('assignee:dusa')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('dusave')

    expectFilterValueToBe('assignee:dusave')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new AssigneeFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('duuuuuus')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })

  it('should filter and select suggestions when added in the start of multiple values', async () => {
    const filterProviders = [new AssigneeFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('is:issue assignee:,2percentsilk text')

    moveCursor('is:issue assignee:'.length)

    await appendToFilterAndRenderAsyncSuggestions('dus')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('dusave')

    expectFilterValueToBe('is:issue assignee:dusave,2percentsilk text')
  })
})

describe('Author', () => {
  setupAsyncErrorHandler()
  setupUsersMockApi()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new AuthorFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('author:dusa')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('dusave')

    expectFilterValueToBe('author:dusave')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new AuthorFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('duuuuuus')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })
})

describe('Commenter', () => {
  setupAsyncErrorHandler()
  setupUsersMockApi()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new CommenterFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('commenter:dusa')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('dusave')

    expectFilterValueToBe('commenter:dusave')
  })
})

describe('Involves', () => {
  setupAsyncErrorHandler()
  setupUsersMockApi()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new InvolvesFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('involves:dusa')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('dusave')

    expectFilterValueToBe('involves:dusave')
  })
})

describe('Mentions', () => {
  setupAsyncErrorHandler()
  setupUsersMockApi()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new MentionsFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('mentions:dusa')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('dusave')

    expectFilterValueToBe('mentions:dusave')
  })
})

describe('ReviewedBy', () => {
  setupAsyncErrorHandler()
  setupUsersMockApi()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new ReviewedByFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('reviewed-by:dusa')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('dusave')

    expectFilterValueToBe('reviewed-by:dusave')
  })
})

describe('ReviewedRequested', () => {
  setupAsyncErrorHandler()
  setupUsersMockApi()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new ReviewRequestedFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('review-requested:dusa')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('dusave')

    expectFilterValueToBe('review-requested:dusave')
  })
})

describe('User', () => {
  setupAsyncErrorHandler()
  setupUsersMockApi()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new UserFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('user:dusa')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('dusave')

    expectFilterValueToBe('user:dusave')
  })
})

describe('UserReviewRequested', () => {
  setupAsyncErrorHandler()
  setupUsersMockApi()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new UserReviewRequestedFilterProvider({showAtMe: true})]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('user-review-requested:dusa')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('dusave')

    expectFilterValueToBe('user-review-requested:dusave')
  })
})
