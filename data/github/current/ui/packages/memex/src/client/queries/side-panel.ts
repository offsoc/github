import {useMutation, useQueryClient} from '@tanstack/react-query'
import {createQuery} from 'react-query-kit'

import {apiGetItem} from '../api/memex-items/api-get-item'
import {ItemType} from '../api/memex-items/item-type'
import {apiGetSidePanelItem} from '../api/side-panel/api-get-side-panel-item'
import {apiSidePanelAddComment} from '../api/side-panel/api-side-panel-add-comment'
import {apiSidePanelEditComment} from '../api/side-panel/api-side-panel-edit-comment'
import {apiUpdateSidePanelItem} from '../api/side-panel/api-update-side-panel-item'
import {apiUpdateSidePanelItemReaction} from '../api/side-panel/api-update-side-panel-item-reaction'
import {apiUpdateSidePanelItemState} from '../api/side-panel/api-update-side-panel-item-state'
import {
  type AddCommentRequest,
  type EditCommentRequest,
  ItemKeyType,
  type SidePanelMetadata,
  type UpdateIssueStateRequest,
  type UpdateSidePanelDataRequest,
  type UpdateSidePanelItemReactionRequest,
} from '../api/side-panel/contracts'
import {not_typesafe_nonNullAssertion} from '../helpers/non-null-assertion'
import {getUpdatedReactions} from '../helpers/reactions-helper'
import type {MemexItemModel} from '../models/memex-item-model'
import {createMemexItemModel} from '../models/memex-item-model'

/**
 * For scenarios when not all items on the client are loaded and we only have the item id
 * of the item we want to show in the side panel, we can use this query to fetch the item
 * from the server.
 *
 * The item id is the query parameter from the URL, and if it is malformed (i.e. not a number),
 * then our `queryFn` will return `undefined` and the side panel will not be shown.
 *
 * Additionally, if the item is not found on the server, then `undefined` will be returned as well.
 */
export const useGetSidePanelItemNotOnClient = createQuery<MemexItemModel | undefined, {itemId: string | null}>({
  queryKey: ['side-panel-item-not-on-client'],
  fetcher: async ({itemId}) => {
    const parsedItemId = Number(itemId)
    if (Number.isNaN(parsedItemId)) {
      return undefined
    }
    const response = await apiGetItem({memexProjectItemId: parsedItemId})
    if (response.ok) {
      return createMemexItemModel(response.data.memexProjectItem)
    }
    return undefined
  },
})

export const useGetSidePanelItemWithCapabilities = createQuery<
  SidePanelMetadata,
  {
    contentType: ItemType
    itemId: number
    memexItemId?: number
    repositoryId: number
  },
  {
    contentType: ItemType
    itemId: number
    memexItemId?: number
    repositoryId: number
  }
>({
  queryKey: ['side-panel-item'],
  fetcher: async ({contentType, itemId, memexItemId, repositoryId}, {signal}) => {
    switch (contentType) {
      case ItemType.Issue:
        return apiGetSidePanelItem(
          {
            kind: ItemKeyType.ISSUE,
            itemId,
            repositoryId,
          },
          {signal},
        )
      case ItemType.DraftIssue:
        return apiGetSidePanelItem(
          {
            kind: ItemKeyType.PROJECT_DRAFT_ISSUE,
            projectItemId: not_typesafe_nonNullAssertion(memexItemId),
          },
          {signal},
        )
      default: {
        throw new Error(`${contentType} is not supported`)
      }
    }
  },
})

export const useRefreshIssueWithoutCapabilitiesMutation = () => {
  const client = useQueryClient()
  return useMutation<
    Omit<SidePanelMetadata, 'capabilities'> | undefined,
    unknown,
    {
      contentType: ItemType
      itemId: number
      memexItemId?: number
      repositoryId: number
    }
  >({
    mutationFn: async ({contentType, itemId, memexItemId, repositoryId}) => {
      switch (contentType) {
        case ItemType.Issue: {
          return apiGetSidePanelItem({
            kind: ItemKeyType.ISSUE,
            itemId,
            repositoryId,
            omitCapabilities: true,
          })
        }
        case ItemType.DraftIssue: {
          return apiGetSidePanelItem({
            kind: ItemKeyType.PROJECT_DRAFT_ISSUE,
            projectItemId: not_typesafe_nonNullAssertion(memexItemId),
            omitCapabilities: true,
          })
        }
        default: {
          throw new Error(`${contentType} is not supported`)
        }
      }
    },
    onMutate: async ({contentType, repositoryId, itemId, memexItemId}) => {
      client.cancelQueries({
        queryKey: useGetSidePanelItemWithCapabilities.getKey({contentType, repositoryId, itemId, memexItemId}),
      })
    },
    onSuccess: async (data, {contentType, repositoryId, itemId, memexItemId}) => {
      // TODO: This needs to be refactored to use `query-client-api.ts`. Issue: https://github.com/github/memex/issues/15755
      // eslint-disable-next-line no-restricted-syntax
      client.setQueriesData<SidePanelMetadata>(
        {
          queryKey: useGetSidePanelItemWithCapabilities.getKey({contentType, repositoryId, itemId, memexItemId}),
        },
        old => {
          if (!old) return old
          return {
            ...old,
            ...data,
          }
        },
      )
    },
  })
}

export const useEditIssueMutation = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({
      contentType,
      itemId,
      memexItemId,
      repositoryId,
      update,
      tasklist_blocks_operation,
      tasklist_blocks_operation_tracker,
    }: {
      contentType: ItemType
      itemId: number
      memexItemId?: number
      repositoryId: number
      update: UpdateSidePanelDataRequest['update']
      tasklist_blocks_operation?: string | null
      tasklist_blocks_operation_tracker?: string
    }) => {
      switch (contentType) {
        case ItemType.Issue: {
          return apiUpdateSidePanelItem({
            kind: ItemKeyType.ISSUE,
            itemId,
            repositoryId,
            update,
            tasklist_blocks_operation,
            tasklist_blocks_operation_tracker,
          })
        }
        case ItemType.DraftIssue: {
          return apiUpdateSidePanelItem({
            kind: ItemKeyType.PROJECT_DRAFT_ISSUE,
            projectItemId: not_typesafe_nonNullAssertion(memexItemId),
            update,
            tasklist_blocks_operation,
            tasklist_blocks_operation_tracker,
          })
        }
        default: {
          throw new Error(`${contentType} is not supported`)
        }
      }
    },
    onMutate: async ({contentType, repositoryId, itemId, memexItemId}) => {
      client.cancelQueries({
        queryKey: useGetSidePanelItemWithCapabilities.getKey({contentType, repositoryId, itemId, memexItemId}),
      })
    },
    onSuccess: async (data, {contentType, repositoryId, itemId, memexItemId}) => {
      // TODO: This needs to be refactored to use `query-client-api.ts`. Issue: https://github.com/github/memex/issues/15755
      // eslint-disable-next-line no-restricted-syntax
      client.setQueriesData<SidePanelMetadata>(
        {
          queryKey: useGetSidePanelItemWithCapabilities.getKey({contentType, repositoryId, itemId, memexItemId}),
        },
        old => {
          if (!old) return old
          return {
            ...old,
            ...data,
          }
        },
      )
    },
    onSettled: (_data, _error, {contentType, repositoryId, itemId, memexItemId}) => {
      client.invalidateQueries({
        queryKey: useGetSidePanelItemWithCapabilities.getKey({contentType, repositoryId, itemId, memexItemId}),
      })
    },
  })
}

export const useAddIssueCommentMutation = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (variables: AddCommentRequest & {memexItemId?: number}) => apiSidePanelAddComment(variables),
    onSuccess: async (data, {repositoryId, itemId, memexItemId, updateState, stateReason}) => {
      // TODO: This needs to be refactored to use `query-client-api.ts`. Issue: https://github.com/github/memex/issues/15755
      // eslint-disable-next-line no-restricted-syntax
      client.setQueriesData<SidePanelMetadata>(
        {
          queryKey: useGetSidePanelItemWithCapabilities.getKey({
            contentType: ItemType.Issue,
            repositoryId,
            itemId,
            memexItemId,
          }),
        },
        old => {
          if (!old) return old
          return {
            ...old,
            comments: old.comments?.concat(data),
            state: {
              state: updateState ?? old.state.state,
              stateReason: stateReason ?? old.state.stateReason,
            },
          }
        },
      )
    },
    onSettled: (_data, _error, {repositoryId, itemId, memexItemId}) => {
      client.invalidateQueries({
        queryKey: useGetSidePanelItemWithCapabilities.getKey({
          contentType: ItemType.Issue,
          repositoryId,
          itemId,
          memexItemId,
        }),
      })
    },
  })
}

export const useEditIssueCommentMutation = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (variables: EditCommentRequest & {memexItemId?: number}) => apiSidePanelEditComment(variables),
    onSuccess: async (data, {repositoryId, itemId, memexItemId}) => {
      // TODO: This needs to be refactored to use `query-client-api.ts`. Issue: https://github.com/github/memex/issues/15755
      // eslint-disable-next-line no-restricted-syntax
      client.setQueriesData<SidePanelMetadata>(
        {
          queryKey: useGetSidePanelItemWithCapabilities.getKey({
            contentType: ItemType.Issue,
            repositoryId,
            itemId,
            memexItemId,
          }),
        },
        old => {
          if (!old) return old
          return {
            ...old,
            comments: old.comments?.map(comment => {
              if (comment.id === data.id) {
                return data
              }
              return comment
            }),
          }
        },
      )
    },
    onSettled: (_data, _error, {repositoryId, itemId, memexItemId}) => {
      client.invalidateQueries({
        queryKey: useGetSidePanelItemWithCapabilities.getKey({
          contentType: ItemType.Issue,
          repositoryId,
          itemId,
          memexItemId,
        }),
      })
    },
  })
}

export const useUpdateSidePanelItemReactionOptimistically = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (variables: UpdateSidePanelItemReactionRequest & {memexItemId?: number}) => {
      await apiUpdateSidePanelItemReaction(variables)
      return variables
    },
    onMutate: async ({repositoryId, itemId, memexItemId, commentId, reaction, actor, command}) => {
      // TODO: This needs to be refactored to use `query-client-api.ts`. Issue: https://github.com/github/memex/issues/15755
      // eslint-disable-next-line no-restricted-syntax
      client.setQueriesData<SidePanelMetadata>(
        {
          queryKey: useGetSidePanelItemWithCapabilities.getKey({
            contentType: ItemType.Issue,
            repositoryId,
            itemId,
            memexItemId,
          }),
        },
        old => {
          if (!old) return old
          if (commentId === undefined && old.reactions) {
            return {
              ...old,
              reactions: getUpdatedReactions(old.reactions, reaction, actor, command === 'unreact'),
            }
          }
          return {
            ...old,
            comments: old.comments?.map(comment => {
              if (comment.id === commentId) {
                const updatedReactions = getUpdatedReactions(comment.reactions, reaction, actor, command === 'unreact')
                return {
                  ...comment,
                  reactions: updatedReactions,
                }
              }
              return comment
            }),
          }
        },
      )
    },
    onSettled: (_data, _error, {repositoryId, itemId, memexItemId}) => {
      client.invalidateQueries({
        queryKey: useGetSidePanelItemWithCapabilities.getKey({
          contentType: ItemType.Issue,
          repositoryId,
          itemId,
          memexItemId,
        }),
      })
    },
  })
}

export const useUpdateSidePanelItemStateOptimistically = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (variables: UpdateIssueStateRequest & {memexItemId?: number}) => {
      await apiUpdateSidePanelItemState(variables)
      return variables
    },
    onMutate: variables => {
      // TODO: This needs to be refactored to use `query-client-api.ts`. Issue: https://github.com/github/memex/issues/15755
      // eslint-disable-next-line no-restricted-syntax
      client.setQueriesData<SidePanelMetadata>(
        {
          queryKey: useGetSidePanelItemWithCapabilities.getKey({
            contentType: ItemType.Issue,
            repositoryId: variables.repositoryId,
            itemId: variables.itemId,
            memexItemId: variables.memexItemId,
          }),
        },
        old => {
          if (!old) return old
          return {
            ...old,
            state: {
              state: variables.state ?? old.state.state,
              stateReason: variables.stateReason ?? old.state.stateReason,
            },
          }
        },
      )
    },
    onSettled: (_data, _error, {itemId, repositoryId, memexItemId}) => {
      client.invalidateQueries({
        queryKey: useGetSidePanelItemWithCapabilities.getKey({
          contentType: ItemType.Issue,
          itemId,
          repositoryId,
          memexItemId,
        }),
      })
    },
  })
}
