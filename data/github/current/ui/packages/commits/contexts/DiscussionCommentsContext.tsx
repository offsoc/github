import type {RepositoryNWO} from '@github-ui/current-repository'
import {noop} from '@github-ui/noop'
import {commitDiscussionsPath} from '@github-ui/paths'
import {reactFetchJSON} from '@github-ui/verified-fetch'
import type React from 'react'
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react'

import type {CommitComment} from '../types/commit-types'
import type {FetchRequestState} from '../types/shared'

type DiscussionCommentsContextType = {
  comments: CommitComment[]
  addComment: (comments: CommitComment) => void
  deleteComment: (commentId: CommitComment['id']) => void
  updateComment: (comment: CommitComment) => void
  loadMore: () => void
  retry: () => void
  canLoadMore: boolean
  count: number
  subscribed: boolean
  providerState: FetchRequestState
}

const DiscussionCommentsContext = createContext<DiscussionCommentsContextType>({
  comments: [],
  addComment: noop,
  deleteComment: noop,
  updateComment: noop,
  loadMore: noop,
  retry: noop,
  canLoadMore: false,
  count: 0,
  subscribed: false,
  providerState: 'initial',
})

export interface DiscussionCommentData {
  comments: CommitComment[]
  count: number
  canLoadMore: boolean
  subscribed: boolean
}

type DiscussionCommentsProviderProps = {
  comments?: CommitComment[]
  commentCount?: number
  canLoadMore?: boolean
  subscribed?: boolean
  providerState?: FetchRequestState
  repo: RepositoryNWO
  commitOid: string
}

export function DiscussionCommentsProvider({
  children,
  comments: externalComments = [],
  commentCount: externalCommentCount = 0,
  canLoadMore: externalCanLoadMore = false,
  subscribed: externalSubscribed = false,
  providerState: externalProviderState = 'initial',
  repo,
  commitOid,
}: React.PropsWithChildren<DiscussionCommentsProviderProps>) {
  const [comments, setComments] = useState<CommitComment[]>(externalComments)
  const [count, setCount] = useState<number>(externalCommentCount)
  const [canLoadMore, setCanLoadMore] = useState(externalCanLoadMore)
  const [providerState, setProviderState] = useState(externalProviderState)
  const [subscribed, setSubscribed] = useState(externalSubscribed)

  // Sync external state with internal state
  // if this provider state changes, it's due to a navigation and refetch of useFetchDeferredCommentData in Commit.tsx
  // when this happens we sync/re-set the other related values
  useEffect(() => {
    setCount(externalCommentCount)
    setComments(externalComments)
    setCanLoadMore(externalCanLoadMore)
    setSubscribed(externalSubscribed)
    setProviderState(externalProviderState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalProviderState])

  const loadDiscussionComments = useCallback(
    async (beforeCommentId?: string) => {
      setProviderState('loading')

      const response = await reactFetchJSON(
        commitDiscussionsPath({
          owner: repo.ownerLogin,
          repo: repo.name,
          commitOid,
          beforeCommentId,
        }),
      )

      if (response.ok) {
        const data: DiscussionCommentData = await response.json()
        if (beforeCommentId) {
          setComments(c => [...data.comments, ...c]) // pagination
        } else {
          setComments(data.comments) //retry
        }

        setProviderState('loaded')

        // We should only need these value from the initial useFetchDeferredCommentData
        // however, in the case of a failure and retry, we need to update these values
        setCount(data.count)
        setSubscribed(data.subscribed)
        setCanLoadMore(data.canLoadMore)
      } else {
        setProviderState('error')
      }
    },
    [repo.ownerLogin, repo.name, commitOid],
  )

  const loadMore = useCallback(() => {
    const earliestComment = comments[0]

    if (!earliestComment || !canLoadMore) {
      return
    }

    loadDiscussionComments(earliestComment.id.toString())
  }, [canLoadMore, comments, loadDiscussionComments])

  const addComment = useCallback(
    (comment: CommitComment) => {
      setComments([...comments, comment])
      setCount((count ?? 0) + 1)
    },
    [comments, count],
  )

  const deleteComment = useCallback(
    (commentId: CommitComment['id']) => {
      setComments(comments.filter(c => c.id !== commentId))
      setCount((count ?? 0) - 1)
    },
    [comments, count],
  )

  const updateComment = useCallback(
    (comment: CommitComment) => {
      setComments(comments.map(c => (c.id === comment.id ? comment : c)))
    },
    [comments],
  )

  const DiscussionComments = useMemo(
    () => ({
      addComment,
      canLoadMore,
      comments,
      count,
      deleteComment,
      loadMore,
      retry: loadDiscussionComments,
      subscribed,
      providerState,
      updateComment,
    }),
    [
      addComment,
      canLoadMore,
      comments,
      count,
      deleteComment,
      loadDiscussionComments,
      loadMore,
      providerState,
      subscribed,
      updateComment,
    ],
  )

  return <DiscussionCommentsContext.Provider value={DiscussionComments}>{children}</DiscussionCommentsContext.Provider>
}

export function useDiscussionComments() {
  const context = useContext(DiscussionCommentsContext)

  if (!context) {
    throw new Error('useDiscussionComments must be used within a DiscussionCommentsProvider')
  }

  return context
}
