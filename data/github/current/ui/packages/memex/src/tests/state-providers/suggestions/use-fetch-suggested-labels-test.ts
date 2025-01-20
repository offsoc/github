import {act, renderHook} from '@testing-library/react'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {SupportedSuggestionOptions} from '../../../client/helpers/suggestions'
import {useFetchSuggestedLabels} from '../../../client/state-providers/suggestions/use-fetch-suggested-labels'
import {getSuggestedLabelsWithSelection} from '../../../mocks/data/labels'
import {mockPublicRepo} from '../../../mocks/data/repositories'
import {DefaultOpenIssue} from '../../../mocks/memex-items'
import {stubGetSuggestedLabels} from '../../mocks/api/memex-items'
import {createMemexItemModel, stubSetColumnValueForItemColumnType} from '../../mocks/models/memex-item-model'
import {createSuggestionsContext} from '../../mocks/state-providers/suggestions-context'
import {createWrapperWithContexts} from '../../wrapper-utils'

describe('useFetchSuggestedLabels', () => {
  it('returns results obtained from server request', async () => {
    const updateColumnValueStub = stubSetColumnValueForItemColumnType()
    const memexItemModel = createMemexItemModel(DefaultOpenIssue, {
      setColumnValueForItemColumnType: updateColumnValueStub,
      getSuggestionsCacheKey: () => `Issue:${DefaultOpenIssue.id}`,
      memexItemId: () => DefaultOpenIssue.id,
      getExtendedRepository: () => mockPublicRepo,
    })

    const mockSuggestedLabels = getSuggestedLabelsWithSelection([1])
    const getSuggestedLabelsStub = stubGetSuggestedLabels(mockSuggestedLabels)

    const {result} = renderHook(useFetchSuggestedLabels, {
      wrapper: createWrapperWithContexts({
        Suggestions: createSuggestionsContext(),
        QueryClient: {memexItems: [memexItemModel]},
      }),
    })

    let suggestions: Error | Array<SupportedSuggestionOptions> | undefined = undefined

    await act(async () => {
      suggestions = await result.current.fetchSuggestedLabels(memexItemModel)
    })

    expect(suggestions).toEqual(mockSuggestedLabels)
    expect(getSuggestedLabelsStub).toHaveBeenCalledTimes(1)
    expect(updateColumnValueStub).toHaveBeenNthCalledWith(1, {
      memexProjectColumnId: SystemColumnId.Labels,
      value: [mockSuggestedLabels[1]],
    })
  })
})
