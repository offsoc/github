import {render, screen, waitFor} from '@testing-library/react'

import {Filter} from '../../Filter'
import {
  ArchivedFilterProvider,
  CommentsFilterProvider,
  DraftFilterProvider,
  InteractionsFilterProvider,
  IsFilterProvider,
  LinkedFilterProvider,
  ReactionsFilterProvider,
  ReasonFilterProvider,
  ReviewFilterProvider,
} from '../../providers'
import {updateFilterValue} from '../../test-utils'
import {
  expectFilterValueToBe,
  expectSuggestionsToMatchSnapshot,
  selectSuggestion,
  setupAsyncErrorHandler,
} from '../utils/helpers'

describe('Archived', () => {
  setupAsyncErrorHandler()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new ArchivedFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('archived:tr')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('true')

    expectFilterValueToBe('archived:true')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new ArchivedFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('tttrrr')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })
})

describe('Comments', () => {
  setupAsyncErrorHandler()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new CommentsFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('comments:Less')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Less than 10')

    expectFilterValueToBe('comments:<10')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new CommentsFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('tttrrr')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })
})

describe('Draft', () => {
  setupAsyncErrorHandler()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new DraftFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('draft:tr')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('true')

    expectFilterValueToBe('draft:true')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new DraftFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('tttrrr')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })
})

describe('Interactions', () => {
  setupAsyncErrorHandler()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new InteractionsFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('interactions:Less')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Less than 10')

    expectFilterValueToBe('interactions:<10')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new InteractionsFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('tttrrr')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })
})

describe('Is', () => {
  setupAsyncErrorHandler()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new IsFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('is:iss')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Issue')

    expectFilterValueToBe('is:issue')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new IsFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('Isssss')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })
})

describe('Linked', () => {
  setupAsyncErrorHandler()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new LinkedFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('linked:p')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Pull Request')

    expectFilterValueToBe('linked:pr')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new LinkedFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('Prrrr')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })
})

describe('Reactions', () => {
  setupAsyncErrorHandler()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new ReactionsFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('reactions:Less')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Less than 10')

    expectFilterValueToBe('reactions:<10')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new ReactionsFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('tttrrr')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })
})

describe('Reason', () => {
  setupAsyncErrorHandler()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new ReasonFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('reason:comp')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Completed')

    expectFilterValueToBe('reason:completed')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new ReasonFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('tttrrr')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })
})

describe('Review', () => {
  setupAsyncErrorHandler()

  it('should filter and select suggestions based on name', async () => {
    const filterProviders = [new ReviewFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('review:no')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('No reviews')

    expectFilterValueToBe('review:none')
  })

  it('should not show any suggestions based on invalid name', async () => {
    const filterProviders = [new ReviewFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('tttrrr')

    await waitFor(() => {
      expect(screen.getByTestId('filter-results')).toBeEmptyDOMElement()
    })
  })
})
