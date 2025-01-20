import {act, renderHook} from '@testing-library/react'

import {createMemexItemModel} from '../../../client/models/memex-item-model'
import {useRemoveSuggestions} from '../../../client/state-providers/suggestions/use-remove-suggestions'
import {DefaultOpenIssue} from '../../../mocks/memex-items'
import {MockHierarchySidePanelItemFactory} from '../../components/side-panel/side-panel-test-helpers'
import {createSuggestionsStableContext} from '../../mocks/state-providers/suggestions-context'
import {createWrapperWithContexts} from '../../wrapper-utils'

describe('useRemoveSuggestions', () => {
  it('should relay to SuggestionsStableContext', () => {
    const removeSuggestionsStub = jest.fn()

    const firstItem = MockHierarchySidePanelItemFactory.build({
      getSuggestionsCacheKey: () => 'Issue:1',
    })
    const secondItem = createMemexItemModel(DefaultOpenIssue)

    const {result} = renderHook(useRemoveSuggestions, {
      wrapper: createWrapperWithContexts({
        SuggestionsStable: createSuggestionsStableContext({removeSuggestions: removeSuggestionsStub}),
        QueryClient: {memexItems: [secondItem]},
      }),
    })

    act(() => {
      result.current.removeSuggestions([firstItem, DefaultOpenIssue.id])
    })

    expect(removeSuggestionsStub).toHaveBeenCalledWith(['Issue:1', 'Issue:3'])
  })
})
