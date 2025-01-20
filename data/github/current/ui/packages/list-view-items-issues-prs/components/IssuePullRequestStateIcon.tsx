import {graphql, useFragment, usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'

import {TEST_IDS} from '../constants/test-ids'
import {getIssueStateIcon, getPullRequestStateIcon} from '../constants/stateIcon'
import type {IssuePullRequestStateIcon$key} from './__generated__/IssuePullRequestStateIcon.graphql'
import type {IssueRowSecondaryQuery} from './__generated__/IssueRowSecondaryQuery.graphql'
import {Suspense} from 'react'
import {IssuesIndexSecondaryGraphqlQuery} from './IssueRow'
import type {IssuePullRequestStateIconViewed$key} from './__generated__/IssuePullRequestStateIconViewed.graphql'

const stateIconFragment = graphql`
  fragment IssuePullRequestStateIcon on IssueOrPullRequest {
    __typename
    ... on Issue {
      state
      stateReason
    }
    ... on PullRequest {
      isDraft
      isInMergeQueue
      pullRequestState: state
    }
  }
`

const notificationFragment = graphql`
  fragment IssuePullRequestStateIconViewed on IssueOrPullRequest {
    __typename
    ... on Issue {
      isReadByViewer
    }
    ... on PullRequest {
      isReadByViewer
    }
  }
`

type IssuePullRequestStateIconProps = {
  dataKey: IssuePullRequestStateIcon$key
}

type LazyIssuePullRequestStateIconProps = IssuePullRequestStateIconProps & {
  issueId: string
  metadataRef?: PreloadedQuery<IssueRowSecondaryQuery> | null
}

export function LazyIssuePullRequestStateIcon({metadataRef, ...props}: LazyIssuePullRequestStateIconProps) {
  // We need this to render the loading state in ssr
  if (!metadataRef) return <IssuePullRequestStateIcon dataKey={props.dataKey} notificationKey={undefined} />

  return (
    <Suspense fallback={<IssuePullRequestStateIcon dataKey={props.dataKey} notificationKey={undefined} />}>
      <LazyIssuePRStateFetched metadataRef={metadataRef} {...props} />
    </Suspense>
  )
}

function LazyIssuePRStateFetched({
  metadataRef,
  dataKey,
  issueId,
}: Omit<LazyIssuePullRequestStateIconProps, 'metadataRef'> & {metadataRef: PreloadedQuery<IssueRowSecondaryQuery>}) {
  const {nodes} = usePreloadedQuery<IssueRowSecondaryQuery>(IssuesIndexSecondaryGraphqlQuery, metadataRef)
  const issueNode = nodes?.find(node => node?.id === issueId)

  if (!issueNode) return null

  return <IssuePullRequestStateIcon dataKey={dataKey} notificationKey={issueNode} />
}

export function IssuePullRequestStateIcon({
  dataKey,
  notificationKey,
}: IssuePullRequestStateIconProps & {notificationKey?: IssuePullRequestStateIconViewed$key}) {
  const data = useFragment(stateIconFragment, dataKey)
  const dataNotif = useFragment(notificationFragment, notificationKey)
  const isReadByViewer =
    (dataNotif?.__typename === 'PullRequest' || dataNotif?.__typename === 'Issue' ? dataNotif?.isReadByViewer : true) ||
    false
  const defaultState = getIssueStateIcon(null)
  let {icon, color, description} = defaultState
  let hasNewActivity

  if (data.__typename === 'PullRequest') {
    const state = getIssueEntityState(data.isDraft, data.isInMergeQueue, data.pullRequestState)
    const stateData = getPullRequestStateIcon(state)
    icon = stateData.icon
    color = stateData.color
    description = stateData.description
    hasNewActivity = !isReadByViewer
  }

  if (data.__typename === 'Issue') {
    const stateOrReason = data.state === 'CLOSED' && data.stateReason === 'NOT_PLANNED' ? 'NOT_PLANNED' : data.state
    const state = getIssueStateIcon(stateOrReason)
    icon = state.icon
    color = state.color
    description = state.description
    hasNewActivity = !isReadByViewer
  }

  return (
    <ListItemLeadingVisual
      newActivity={hasNewActivity}
      icon={icon}
      color={color}
      description={description}
      data-testid={TEST_IDS.listRowStateIcon}
    />
  )
}

function getIssueEntityState(isDraft: boolean, isInMergeQueue: boolean, state: string): string {
  if (isDraft) {
    return 'DRAFT'
  }

  if (isInMergeQueue) {
    return 'IN_MERGE_QUEUE'
  }

  return state
}
