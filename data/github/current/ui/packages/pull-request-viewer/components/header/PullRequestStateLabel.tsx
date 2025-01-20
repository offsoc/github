import {StateLabel} from '@primer/react'

import type {PullRequestState} from './__generated__/HeaderMetadata_pullRequest.graphql'

export function PullRequestStateLabel({
  pullState,
  isDraft,
  isInMergeQueue,
}: {
  pullState: PullRequestState
  isDraft: boolean
  isInMergeQueue: boolean
}) {
  switch (true) {
    case isInMergeQueue:
      return (
        <StateLabel className="mr-2" status="pullQueued">
          Queued
        </StateLabel>
      )
    case pullState === 'OPEN' && isDraft:
      return (
        <StateLabel className="mr-2" status="draft">
          Draft
        </StateLabel>
      )
    case pullState === 'CLOSED':
      return (
        <StateLabel className="mr-2" status="pullClosed">
          Closed
        </StateLabel>
      )
    case pullState === 'MERGED':
      return (
        <StateLabel className="mr-2" status="pullMerged">
          Merged
        </StateLabel>
      )
    default:
      return (
        <StateLabel className="mr-2" status="pullOpened">
          Open
        </StateLabel>
      )
  }
}
