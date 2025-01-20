import {SkipIcon} from '@primer/octicons-react'

import type {PullRequestState} from '../components/__generated__/ConnectedEvent.graphql'
import type {IssueStateReason} from '../components/__generated__/ClosedEvent.graphql'
import {PullRequestStateIcons, IssueStateIcons} from '../constants/icons'
import type {SourceIconType} from '../constants/icons'

type subjectType = 'Issue' | 'PullRequest'

export function getSourceIcon(
  subjectType: subjectType,
  state?: PullRequestState,
  stateReason?: IssueStateReason | null,
  isDraft?: boolean,
  isInMergeQueue?: boolean,
): SourceIconType {
  if (subjectType === 'Issue') {
    if (stateReason === null || stateReason === undefined || stateReason === 'REOPENED') return IssueStateIcons['OPEN']
    // @ts-expect-error state not fully checked
    if (stateReason in IssueStateIcons) return IssueStateIcons[stateReason]

    return {color: 'fg.muted', icon: SkipIcon}
  } else {
    if (isDraft) return PullRequestStateIcons['DRAFT']
    if (isInMergeQueue) return PullRequestStateIcons['IN_MERGE_QUEUE']
    if (state === undefined || state === null) throw new Error('PullRequestState is undefined')
    // @ts-expect-error state not fully checked
    if (state in PullRequestStateIcons) return PullRequestStateIcons[state]

    return {color: 'fg.muted', icon: SkipIcon}
  }
}
