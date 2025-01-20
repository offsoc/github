import {act, renderHook} from '@testing-library/react'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {SupportedSuggestionOptions} from '../../../client/helpers/suggestions'
import {useFetchSuggestedIssueTypes} from '../../../client/state-providers/suggestions/use-fetch-suggested-issue-types'
import {getSuggestedIssueTypesWithSelection} from '../../../mocks/data/issue-types'
import {DefaultOpenIssue} from '../../../mocks/memex-items'
import {stubGetSuggestedIssueTypes} from '../../mocks/api/memex-items'
import {createMemexItemModel, stubSetColumnValueForItemColumnType} from '../../mocks/models/memex-item-model'
import {createSuggestionsStableContext} from '../../mocks/state-providers/suggestions-context'
import {createWrapperWithContexts} from '../../wrapper-utils'

describe('useFetchSuggestedIssueTypes', () => {
  it('returns results obtained from  server request', async () => {
    const updateColumnValueStub = stubSetColumnValueForItemColumnType()
    const memexItemModel = createMemexItemModel(DefaultOpenIssue, {
      setColumnValueForItemColumnType: updateColumnValueStub,
      getSuggestionsCacheKey: () => `Issue:${DefaultOpenIssue.id}`,
      memexItemId: () => DefaultOpenIssue.id,
    })

    const mockGetSuggestedIssueTypes = getSuggestedIssueTypesWithSelection([1])
    const getSuggestedIssueTypesStub = stubGetSuggestedIssueTypes(mockGetSuggestedIssueTypes)

    const {result} = renderHook(useFetchSuggestedIssueTypes, {
      wrapper: createWrapperWithContexts({
        SuggestionsStable: createSuggestionsStableContext(),
        QueryClient: {memexItems: [memexItemModel]},
      }),
    })

    let suggestions: Error | Array<SupportedSuggestionOptions> | undefined = undefined

    await act(async () => {
      suggestions = await result.current.fetchSuggestedIssueTypes(memexItemModel)
    })

    expect(suggestions).toEqual(mockGetSuggestedIssueTypes)
    expect(getSuggestedIssueTypesStub).toHaveBeenCalledTimes(1)
    expect(updateColumnValueStub).toHaveBeenNthCalledWith(1, {
      memexProjectColumnId: SystemColumnId.IssueType,
      value: mockGetSuggestedIssueTypes[1],
    })
  })
})
