import {useTrackingRef} from '@github-ui/use-tracking-ref'
import debounce from 'lodash-es/debounce'
import {createContext, memo, useCallback, useMemo} from 'react'

import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {IssueState, type IssueStateReason} from '../../api/common-contracts'
import {REFRESH_DEBOUNCE_TIME} from '../../api/memex/api-get-all-memex-data'
import {ItemType} from '../../api/memex-items/item-type'
import {
  type IssueComment,
  ItemKeyType,
  type ReactionEmotion,
  type SidePanelMetadata,
  type UpdateSidePanelDataRequest,
} from '../../api/side-panel/contracts'
import {
  SidePanelEditComment,
  SidePanelEditItem,
  SidePanelMetadataRefresh,
  SidePanelPostComment,
  SidePanelReact,
  type SidePanelStatsType,
  SidePanelUpdateIssueState,
} from '../../api/stats/contracts'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {
  useAddIssueCommentMutation,
  useEditIssueCommentMutation,
  useEditIssueMutation,
  useGetSidePanelItemWithCapabilities,
  useRefreshIssueWithoutCapabilitiesMutation,
  useUpdateSidePanelItemReactionOptimistically,
  useUpdateSidePanelItemStateOptimistically,
} from '../../queries/side-panel'
import {mapToLocalUpdate} from '../column-values/column-value-payload'
import {useSetColumnValue} from '../column-values/use-set-column-value'
import {useFindMemexItem} from '../memex-items/use-find-memex-item'

type IssueContextType = {
  isLoading: boolean
  sidePanelMetadata: SidePanelMetadata
  reloadSidePanelMetadata: (fromSocketEvent?: boolean) => void
  editIssue: (
    update: UpdateSidePanelDataRequest['update'],
    tasklist_blocks_operation?: string | null,
    tasklist_blocks_operation_tracker?: string,
  ) => Promise<SidePanelMetadata>
  editIssueTitle: (body: string) => Promise<SidePanelMetadata>
  editIssueLabels: (labels: Array<number>) => Promise<SidePanelMetadata>
  editIssueAssignees: (assignees: Array<number>) => Promise<SidePanelMetadata>
  editIssueMilestone: (milestone: number | 'clear') => Promise<SidePanelMetadata>
  addIssueComment: (body: string, state?: IssueState, stateReason?: IssueStateReason) => Promise<IssueComment>
  editIssueComment: (commentId: number, body: string) => Promise<IssueComment>
  reactToSidePanelItem: (
    reaction: ReactionEmotion,
    reacted: boolean,
    actor: string,
    commentId?: number,
  ) => Promise<void>
  updateSidePanelItemState: (state: IssueState, reason?: IssueStateReason) => Promise<void>
}

const emptySidePanelMetadata: SidePanelMetadata = {
  itemKey: {
    kind: ItemKeyType.ISSUE,
    repositoryId: 0,
    itemId: 0,
  },
  title: {
    raw: '',
    html: '',
  },
  description: {
    body: '',
    bodyHtml: '',
  },
  createdAt: '',
  updatedAt: '',
  user: {
    id: 0,
    global_relay_id: '',
    login: '',
    name: '',
    avatarUrl: '',
    isSpammy: false,
  },
  state: {
    state: IssueState.Open,
  },
  capabilities: [],
  liveUpdateChannel: '',
  url: '',
  issueNumber: 0,
}

export const IssueContext = createContext<IssueContextType | null>(null)

class UnsupportedActionError extends TypeError {
  constructor(action: string) {
    // eslint-disable-next-line i18n-text/no-en
    super(`Item does not support ${action}.`)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'UnsupportedActionError'
  }
}

export const IssueStateProvider = memo<{
  children: React.ReactNode
  contentType: ItemType
  itemId: number
  memexItemId?: number
  repositoryId: number
}>(function IssueStateProvider({children, contentType, itemId, memexItemId, repositoryId}) {
  const {findMemexItem} = useFindMemexItem()
  const {setColumnValue} = useSetColumnValue()
  const {postStats} = usePostStats()

  const {data: sidePanelMetadata = emptySidePanelMetadata, isInitialLoading} = useGetSidePanelItemWithCapabilities({
    variables: {
      contentType,
      itemId,
      repositoryId,
      memexItemId,
    },
  })

  const postStatsRef = useTrackingRef(({name, context = {}}: {name: SidePanelStatsType; context?: object}) => {
    postStats({
      name,
      context: JSON.stringify({
        contentType,
        ...context,
      }),
    })
  })

  const {mutate: updateSidePanelItemWithoutCapabilities} = useRefreshIssueWithoutCapabilitiesMutation()

  // Store the latest reload so we never call an outdated function from the debounce
  const reloadMetadataRef = useTrackingRef(async (fromSocketEvent = false) => {
    updateSidePanelItemWithoutCapabilities(
      {
        contentType,
        itemId,
        repositoryId,
        memexItemId,
      },
      {
        onSuccess: () => {
          postStatsRef.current({name: SidePanelMetadataRefresh, context: {fromSocketEvent}})
        },
      },
    )
  })
  // Create a debounced function to call the latest reload, ideally
  // reloadMetadataRef should update, making it so this memo never
  // updates
  const reloadSidePanelMetadata = useMemo(
    () =>
      debounce(
        (...args: Parameters<typeof reloadMetadataRef.current>) => reloadMetadataRef.current(...args),
        REFRESH_DEBOUNCE_TIME,
      ),
    [reloadMetadataRef],
  )
  const {mutateAsync: editIssueMutate} = useEditIssueMutation()
  const editIssue = useCallback(
    async (
      update: UpdateSidePanelDataRequest['update'],
      tasklist_blocks_operation?: string | null,
      tasklist_blocks_operation_tracker?: string,
    ) => {
      return editIssueMutate(
        {
          contentType,
          itemId,
          memexItemId,
          repositoryId,
          update,
          tasklist_blocks_operation,
          tasklist_blocks_operation_tracker,
        },
        {
          onSettled: () => {
            postStatsRef.current({name: SidePanelEditItem, context: {updates: Object.keys(update)}})
          },
          onSuccess: response => {
            if (memexItemId && response) {
              const memexItem = findMemexItem(memexItemId)
              if (memexItem) {
                // TODO: perform other local updates based on side-panel API response?
                // TODO: move this update specifically to editIssueTitle()?
                const titleValue = memexItem.columns.Title?.value
                if (titleValue && titleValue.title !== response.title) {
                  // Update local memex item if title was changed
                  const localUpdate = mapToLocalUpdate({
                    dataType: MemexColumnDataType.Title,
                    value: {...titleValue, title: response.title},
                  })
                  if (localUpdate) {
                    setColumnValue(memexItem, localUpdate)
                  }
                }
              }
            }
          },
        },
      )
    },
    [contentType, editIssueMutate, findMemexItem, itemId, memexItemId, postStatsRef, repositoryId, setColumnValue],
  )

  // TODO: We should probably just begin to expose editIssue which takes an update object
  const editIssueTitle = useCallback(async (title: string) => editIssue({title}), [editIssue])
  const editIssueLabels = useCallback(async (labels: Array<number>) => editIssue({labels}), [editIssue])
  const editIssueAssignees = useCallback(async (assignees: Array<number>) => editIssue({assignees}), [editIssue])
  const editIssueMilestone = useCallback(async (milestone: number | 'clear') => editIssue({milestone}), [editIssue])

  const {mutateAsync: addIssueCommentMutate} = useAddIssueCommentMutation()
  const addIssueComment = useCallback(
    async (body: string, state?: IssueState, stateReason?: IssueStateReason) => {
      const comments = sidePanelMetadata.comments
      if (!comments) throw new UnsupportedActionError('comments')
      return addIssueCommentMutate(
        {
          kind: ItemKeyType.ISSUE,
          itemId,
          repositoryId,
          comment: body,
          updateState: state,
          stateReason,
          memexItemId,
        },
        {
          onSuccess: () => {
            postStatsRef.current({name: SidePanelPostComment, context: {state, stateReason}})
          },
        },
      )
    },
    [sidePanelMetadata.comments, addIssueCommentMutate, itemId, repositoryId, memexItemId, postStatsRef],
  )

  const {mutateAsync: editIssueCommentMutate} = useEditIssueCommentMutation()
  const editIssueComment = useCallback(
    async (commentId: number, body: string) => {
      const comments = sidePanelMetadata.comments
      if (!comments) throw new UnsupportedActionError('comments')

      return editIssueCommentMutate(
        {
          kind: ItemKeyType.ISSUE,
          itemId,
          repositoryId,
          commentId,
          body,
          memexItemId,
        },
        {
          onSuccess: () => {
            postStatsRef.current({name: SidePanelEditComment})
          },
        },
      )
    },
    [sidePanelMetadata.comments, editIssueCommentMutate, itemId, repositoryId, memexItemId, postStatsRef],
  )

  const {mutate: updateSidePanelItemReaction} = useUpdateSidePanelItemReactionOptimistically()
  const reactToSidePanelItem = useCallback(
    async (reaction: ReactionEmotion, reacted: boolean, actor: string, commentId?: number) => {
      if (!sidePanelMetadata.reactions) throw new UnsupportedActionError('reactions')

      return updateSidePanelItemReaction(
        {
          reaction,
          command: reacted ? 'unreact' : 'react',
          commentId,
          itemId,
          repositoryId,
          actor,
          memexItemId,
          kind: ItemKeyType.ISSUE,
        },
        {
          onSuccess: () => {
            postStatsRef.current({
              name: SidePanelReact,
              context: {
                command: reacted ? ('unreact' as const) : ('react' as const),
                subject: commentId ? 'comment' : 'issue',
              },
            })
          },
        },
      )
    },
    [sidePanelMetadata.reactions, updateSidePanelItemReaction, itemId, repositoryId, memexItemId, postStatsRef],
  )

  const {mutate: updateSidePanelItemStateMutate} = useUpdateSidePanelItemStateOptimistically()
  const updateSidePanelItemState = useCallback(
    async (state: IssueState, reason?: IssueStateReason) => {
      if (contentType !== ItemType.Issue) throw new UnsupportedActionError('state updates')
      return updateSidePanelItemStateMutate(
        {
          state,
          stateReason: reason,
          itemId,
          repositoryId,
          memexItemId,
          kind: ItemKeyType.ISSUE,
        },
        {
          onSuccess: () => {
            postStatsRef.current({name: SidePanelUpdateIssueState, context: {state, stateReason: reason}})
          },
        },
      )
    },
    [contentType, updateSidePanelItemStateMutate, itemId, repositoryId, memexItemId, postStatsRef],
  )

  const contextValue: IssueContextType = useMemo(() => {
    return {
      isLoading: isInitialLoading,
      sidePanelMetadata,
      editIssue,
      editIssueTitle,
      addIssueComment,
      editIssueComment,
      reactToSidePanelItem,
      updateSidePanelItemState,
      editIssueLabels,
      editIssueAssignees,
      editIssueMilestone,
      reloadSidePanelMetadata,
    }
  }, [
    isInitialLoading,
    sidePanelMetadata,
    editIssue,
    editIssueTitle,
    addIssueComment,
    editIssueComment,
    editIssueLabels,
    editIssueAssignees,
    editIssueMilestone,
    reactToSidePanelItem,
    updateSidePanelItemState,
    reloadSidePanelMetadata,
  ])

  return <IssueContext.Provider value={contextValue}>{children}</IssueContext.Provider>
})
