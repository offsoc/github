import {render} from '@github-ui/react-core/test-utils'

import {Filter} from '../../Filter'
import {LinkedFilterProvider} from '../../providers'
import {updateFilterValue} from '../../test-utils'
import {
  expectFilterValueToBe,
  expectSuggestionsToMatchSnapshot,
  selectSuggestion,
  setupAsyncErrorHandler,
  setupLabelsMockApi,
} from '../utils/helpers'

describe('Linked', () => {
  setupAsyncErrorHandler()
  setupLabelsMockApi()

  it('should provide issue and pr as value options by default', async () => {
    const filterProviders = [new LinkedFilterProvider()]

    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('link')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Linked')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Pull Request')

    expectFilterValueToBe('linked:pr')
  })

  it('should provide single value option when initialized with only "issue"', async () => {
    const filterProviders = [new LinkedFilterProvider(['issue'])]

    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('link')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Linked')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Issue')

    expectFilterValueToBe('linked:issue')
  })

  it('should provide single value option when initialized with only "pr"', async () => {
    const filterProviders = [new LinkedFilterProvider(['pr'])]

    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('link')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Linked')

    expectSuggestionsToMatchSnapshot()

    await selectSuggestion('Pull Request')

    expectFilterValueToBe('linked:pr')
  })
})
