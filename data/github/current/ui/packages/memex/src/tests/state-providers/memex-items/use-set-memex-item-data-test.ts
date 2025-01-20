import {act, renderHook} from '@testing-library/react'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {IssueState} from '../../../client/api/common-contracts'
import type {
  IssueContent,
  MemexItem,
  PullRequestContent,
  UpdateMemexItemResponseData,
} from '../../../client/api/memex-items/contracts'
import type {ItemType} from '../../../client/api/memex-items/item-type'
import type {IssueModel} from '../../../client/models/memex-item-model'
import {getMemexItemModelsFromQueryClient} from '../../../client/state-providers/memex-items/query-client-api/memex-items'
import {useSetMemexItemData} from '../../../client/state-providers/memex-items/use-set-memex-item-data'
import {DefaultOpenIssue, DefaultOpenPullRequest} from '../../../mocks/memex-items'
import {assertIsIssueTitle, createMemexItemModel} from '../../mocks/models/memex-item-model'
import {createTestQueryClient} from '../../test-app-wrapper'
import {createWrapperWithContexts} from '../../wrapper-utils'

describe('useSetMemexItemData', () => {
  describe('setItemData', () => {
    it('should update an item with the next item state', () => {
      const issueModel = createMemexItemModel(DefaultOpenIssue) as IssueModel
      const queryClient = createTestQueryClient()

      const items = [issueModel]

      const {result} = renderHook(useSetMemexItemData, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: items},
        }),
      })

      const prevTitle = issueModel.columns.Title

      const issueTitle = assertIsIssueTitle(prevTitle)

      expect(issueTitle.value.state).toBe(IssueState.Open)

      const nextItemState: MemexItem = {
        ...DefaultOpenIssue,
        memexProjectColumnValues: [
          {
            memexProjectColumnId: SystemColumnId.Title,
            value: {
              ...issueTitle.value,
              state: IssueState.Closed,
            },
          },
        ],
      }

      act(() => result.current.setItemData(nextItemState))

      const itemsAfterUpdate = getMemexItemModelsFromQueryClient(queryClient)
      const [nextTitleState] = nextItemState.memexProjectColumnValues
      expect(itemsAfterUpdate[0].columns.Title!.value).toEqual(nextTitleState.value)
    })

    it("should fallback to the previous item state as a result of a change in the item's priority", () => {
      const issueModel = createMemexItemModel(DefaultOpenIssue) as IssueModel
      const queryClient = createTestQueryClient()

      const items = [issueModel]

      const {result} = renderHook(useSetMemexItemData, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: items},
        }),
      })

      expect(issueModel.priority).toBe(2)

      // This emulates the response of a priority change
      const nextItemState: UpdateMemexItemResponseData = {
        ...DefaultOpenIssue,
        priority: 3,
        memexProjectColumnValues: undefined, // Note, this is an optional field
      }

      act(() => result.current.setItemData(nextItemState))

      const itemsAfterUpdate = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemsAfterUpdate[0].columns).toEqual(issueModel.columns)
    })

    it('should ignore a state update if the previous item state cannot be found', () => {
      const memexItem = DefaultOpenIssue
      const queryClient = createTestQueryClient()

      const {result} = renderHook(useSetMemexItemData, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: []},
        }),
      })

      act(() => result.current.setItemData(memexItem))

      const itemsAfterUpdate = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemsAfterUpdate).toEqual([])
    })

    it('should ignore a state update if the payload contains an invalid content type', () => {
      const item = DefaultOpenIssue
      const queryClient = createTestQueryClient()

      const items = [createMemexItemModel(item)]

      const {result} = renderHook(useSetMemexItemData, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: items},
        }),
      })

      const contentType = 'invalid' as ItemType
      act(() => {
        expect(() => result.current.setItemData({...item, contentType})).toThrow()
      })

      const itemsAfterUpdate = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemsAfterUpdate).toEqual(items)
    })

    it.each([
      {content: {} as IssueContent, desc: 'containing an empty object'},
      {content: {id: 3} as IssueContent, desc: 'containing only the content "id" property'},
      {
        content: {url: 'https://github.com/github/memex/issues/336'} as IssueContent,
        desc: 'containing only the content "url" property',
      },
    ])('should ignore a state update with content $desc for an Issue', ({content}) => {
      const item = DefaultOpenIssue
      const queryClient = createTestQueryClient()

      const items = [createMemexItemModel(item)]

      const {result} = renderHook(useSetMemexItemData, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: items},
        }),
      })

      act(() => result.current.setItemData({...item, content}))

      const itemsAfterUpdate = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemsAfterUpdate).toEqual(items)
    })

    it.each([
      {content: {} as PullRequestContent, desc: 'containing an empty object'},
      {content: {id: 3} as PullRequestContent, desc: 'containing only the content "id" property'},
      {
        content: {url: 'https://github.com/github/memex/pull/337'} as PullRequestContent,
        desc: 'containing only the content "url" property',
      },
    ])('should ignore a state update with content $desc for a Pull Request', ({content}) => {
      const item = DefaultOpenPullRequest
      const queryClient = createTestQueryClient()

      const items = [createMemexItemModel(item)]

      const {result} = renderHook(useSetMemexItemData, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient, memexItems: items},
        }),
      })

      act(() => result.current.setItemData({...item, content}))

      const itemsAfterUpdate = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemsAfterUpdate).toEqual(items)
    })
  })
})
