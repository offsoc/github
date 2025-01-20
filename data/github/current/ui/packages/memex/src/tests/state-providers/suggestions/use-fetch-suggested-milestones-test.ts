import {act, renderHook} from '@testing-library/react'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {SupportedSuggestionOptions} from '../../../client/helpers/suggestions'
import {useFetchSuggestedMilestones} from '../../../client/state-providers/suggestions/use-fetch-suggested-milestones'
import {getSuggestedMilestonesWithSelection} from '../../../mocks/data/milestones'
import {DefaultOpenIssue} from '../../../mocks/memex-items'
import {stubGetSuggestedMilestones} from '../../mocks/api/memex-items'
import {createMemexItemModel, stubSetColumnValueForItemColumnType} from '../../mocks/models/memex-item-model'
import {createSuggestionsStableContext} from '../../mocks/state-providers/suggestions-context'
import {createWrapperWithContexts} from '../../wrapper-utils'

describe('useFetchSuggestedMilestones', () => {
  it('returns results obtained from  server request', async () => {
    const updateColumnValueStub = stubSetColumnValueForItemColumnType()
    const memexItemModel = createMemexItemModel(DefaultOpenIssue, {
      setColumnValueForItemColumnType: updateColumnValueStub,
      getSuggestionsCacheKey: () => `Issue:${DefaultOpenIssue.id}`,
      memexItemId: () => DefaultOpenIssue.id,
    })

    const mockSuggestedMilestones = getSuggestedMilestonesWithSelection([1])
    const getSuggestedMilestonesStub = stubGetSuggestedMilestones(mockSuggestedMilestones)

    const {result} = renderHook(useFetchSuggestedMilestones, {
      wrapper: createWrapperWithContexts({
        SuggestionsStable: createSuggestionsStableContext(),
        QueryClient: {memexItems: [memexItemModel]},
      }),
    })

    let suggestions: Error | Array<SupportedSuggestionOptions> | undefined = undefined

    await act(async () => {
      suggestions = await result.current.fetchSuggestedMilestones(memexItemModel)
    })

    expect(suggestions).toEqual(mockSuggestedMilestones)
    expect(getSuggestedMilestonesStub).toHaveBeenCalledTimes(1)
    expect(updateColumnValueStub).toHaveBeenNthCalledWith(1, {
      memexProjectColumnId: SystemColumnId.Milestone,
      value: mockSuggestedMilestones[1],
    })
  })
})
