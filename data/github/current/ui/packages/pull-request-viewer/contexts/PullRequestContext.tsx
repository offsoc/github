import type {PropsWithChildren} from 'react'
import {createContext, useContext, useMemo} from 'react'

interface PullRequestContextData {
  pullRequestId: string
  repositoryId: string
  headRefOid: string
  state: string
  isInMergeQueue: boolean
  viewerPendingReviewId?: string
  viewerCanComment?: boolean
  viewerCanApplySuggestion?: boolean
}

const PullRequestContext = createContext<PullRequestContextData | null>(null)

type PullRequestContextProviderProps = PullRequestContextData

export function PullRequestContextProvider({
  children,
  headRefOid,
  isInMergeQueue,
  pullRequestId,
  repositoryId,
  state,
  viewerCanApplySuggestion,
  viewerCanComment,
  viewerPendingReviewId,
}: PropsWithChildren<PullRequestContextProviderProps>) {
  const contextData = useMemo(
    () => ({
      headRefOid,
      isInMergeQueue,
      pullRequestId,
      repositoryId,
      state,
      viewerCanApplySuggestion,
      viewerCanComment,
      viewerPendingReviewId,
    }),
    [
      headRefOid,
      isInMergeQueue,
      pullRequestId,
      repositoryId,
      state,
      viewerCanApplySuggestion,
      viewerCanComment,
      viewerPendingReviewId,
    ],
  )
  return <PullRequestContext.Provider value={contextData}>{children}</PullRequestContext.Provider>
}

export function usePullRequestContext(): PullRequestContextData {
  const contextData = useContext(PullRequestContext)
  if (!contextData) {
    throw new Error('usePullRequestContext must be used within a PullRequestContext')
  }

  return contextData
}
