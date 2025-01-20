import {act, renderHook} from '@testing-library/react'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {SupportedSuggestionOptions} from '../../../client/helpers/suggestions'
import {useFetchSuggestedAssignees} from '../../../client/state-providers/suggestions/use-fetch-suggested-assignees'
import {getSuggestedAssigneesWithSelection} from '../../../mocks/data/users'
import {DefaultOpenIssue} from '../../../mocks/memex-items'
import {stubGetSuggestedAssignees} from '../../mocks/api/memex-items'
import {createMemexItemModel, stubSetColumnValueForItemColumnType} from '../../mocks/models/memex-item-model'
import {createSuggestionsStableContext} from '../../mocks/state-providers/suggestions-context'
import {createWrapperWithContexts} from '../../wrapper-utils'

describe('useFetchSuggestedAssignees', () => {
  it('returns results obtained from server request', async () => {
    const updateColumnValueStub = stubSetColumnValueForItemColumnType()
    const memexItemModel = createMemexItemModel(DefaultOpenIssue, {
      setColumnValueForItemColumnType: updateColumnValueStub,
      getSuggestionsCacheKey: () => `Issue:${DefaultOpenIssue.id}`,
      memexItemId: () => DefaultOpenIssue.id,
    })

    const mockSuggestedAssignees = getSuggestedAssigneesWithSelection([1])
    const getSuggestedAssigneesStub = stubGetSuggestedAssignees(mockSuggestedAssignees)

    const {result} = renderHook(useFetchSuggestedAssignees, {
      wrapper: createWrapperWithContexts({
        SuggestionsStable: createSuggestionsStableContext(),
        QueryClient: {memexItems: [memexItemModel]},
      }),
    })

    let suggestions: Error | Array<SupportedSuggestionOptions> | undefined = undefined

    await act(async () => {
      suggestions = await result.current.fetchSuggestedAssignees(memexItemModel)
    })

    expect(suggestions).toEqual(mockSuggestedAssignees)
    expect(getSuggestedAssigneesStub).toHaveBeenCalledTimes(1)
    expect(updateColumnValueStub).toHaveBeenNthCalledWith(1, {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [mockSuggestedAssignees[1]],
    })
  })
})
