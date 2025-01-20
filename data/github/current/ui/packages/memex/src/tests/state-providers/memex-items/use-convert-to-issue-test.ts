import {act, renderHook} from '@testing-library/react'

import {apiConvertToIssue} from '../../../client/api/memex-items/api-convert-to-issue'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {getMemexItemModelsFromQueryClient} from '../../../client/state-providers/memex-items/query-client-api/memex-items'
import {useConvertToIssue} from '../../../client/state-providers/memex-items/use-convert-to-issue'
import {getRepository} from '../../../mocks/data/repositories'
import {DefaultDraftIssue} from '../../../mocks/memex-items'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {generateConvertToIssueResponse} from '../../mocks/models/convert-to-issue'
import {createMemexItemModel} from '../../mocks/models/memex-item-model'
import {createTestQueryClient} from '../../test-app-wrapper'
import {createWrapperWithContexts} from '../../wrapper-utils'

jest.mock('../../../client/api/memex-items/api-convert-to-issue')

const repository = getRepository(2)

describe('useConvertToIssue', () => {
  describe('convertToIssue', () => {
    it('should convert a DraftIssue into an Issue', async () => {
      const memexItem = DefaultDraftIssue

      const convertItemsStub = stubResolvedApiResponse(
        apiConvertToIssue,
        generateConvertToIssueResponse(memexItem, repository),
      )
      const queryClient = createTestQueryClient()

      const firstItem = createMemexItemModel(memexItem)
      const {result} = renderHook(useConvertToIssue, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: [firstItem]},
        }),
      })

      await act(async () => {
        await result.current.convertToIssue(memexItem.id, repository.id)
      })

      expect(convertItemsStub).toHaveBeenCalledWith({memexProjectItemId: memexItem.id, repositoryId: repository.id})

      const itemsConverted = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemsConverted[0].id).toEqual(memexItem.id)
      expect(itemsConverted[0].contentType).toEqual(ItemType.Issue)
    })
  })
})
