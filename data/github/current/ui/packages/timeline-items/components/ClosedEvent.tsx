import {CheckCircleIcon, CircleSlashIcon, TableIcon} from '@primer/octicons-react'
import {Link, Octicon} from '@primer/react'
import {useMemo} from 'react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {VALUES} from '../constants/values'
import {LABELS} from '../constants/labels'

import {createIssueEventExternalUrl} from '../utils/urls'
import type {ClosedEvent$key} from './__generated__/ClosedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {getStateQuery} from '../utils/get-state-query'
import {commitHovercardPath, issueLinkedPullRequestHovercardPath} from '@github-ui/paths'

export type ClosedEventProps = {
  queryRef: ClosedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  timelineEventBaseUrl: string
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  showStateReason?: boolean
}

export function ClosedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  timelineEventBaseUrl,
  highlightedEventId,
  refAttribute,
  showStateReason = true,
}: ClosedEventProps): JSX.Element {
  const {actor, createdAt, stateReason, databaseId, closer, closingProjectItemStatus} = useFragment(
    graphql`
      fragment ClosedEvent on ClosedEvent {
        databaseId
        createdAt
        stateReason
        closingProjectItemStatus
        closer {
          __typename
          ... on ProjectV2 {
            url
            title
          }
          ... on PullRequest {
            url
            number
            repository {
              name
              owner {
                login
              }
            }
          }
          ... on Commit {
            url
            abbreviatedOid
            repository {
              name
              owner {
                login
              }
            }
          }
        }
        actor {
          ...TimelineRowEventActor
        }
      }
    `,
    queryRef,
  )

  const highlighted = String(databaseId) === highlightedEventId
  const {stateChangeQuery, stateReasonString} = getStateQuery(stateReason)
  const backgroundColor = stateReason === VALUES.issueStateReason.NOT_PLANNED ? 'fg.muted' : 'done.fg'
  const icon = stateReason === VALUES.issueStateReason.NOT_PLANNED ? CircleSlashIcon : CheckCircleIcon

  const queryUrl = useMemo(() => {
    return `${timelineEventBaseUrl}?q=${stateReason && encodeURIComponent(stateChangeQuery)}`
  }, [stateChangeQuery, stateReason, timelineEventBaseUrl])

  const closedByCommit = closer?.__typename === 'Commit'
  const closedByMemexProject = closer?.__typename === 'ProjectV2'
  const closerNumber = closer && closer.__typename === 'PullRequest' ? closer.number : undefined
  const closerPullRequestUrl = closer && closer.__typename === 'PullRequest' ? closer.url : undefined
  const closerCommitUrl = closedByCommit ? closer.url : undefined
  const closerMemexProjectUrl = closedByMemexProject ? closer.url : undefined

  const dataHovercardUrl = closer
    ? closer.__typename === 'Commit'
      ? getDataHovercardUrlForCommit(closer.repository.owner.login, closer.repository.name, closer.abbreviatedOid)
      : closer.__typename === 'PullRequest'
        ? getDataHovercardUrlForPullRequest(closer.repository.owner.login, closer.repository.name, closer.number)
        : null
    : null

  const closerLink = closedByMemexProject ? (
    <>
      <Octicon icon={TableIcon} />{' '}
      <Link href={closerMemexProjectUrl} data-testid="closer-link" sx={{color: 'fg.default', mr: 1}} inline>
        {closer.title}
      </Link>
    </>
  ) : (
    <Link
      href={closedByCommit ? closerCommitUrl : closerPullRequestUrl}
      target="_blank"
      sx={{mr: 1}}
      data-hovercard-url={dataHovercardUrl}
      data-testid="closer-link"
    >
      {closedByCommit ? `${closer.abbreviatedOid}` : `#${closerNumber}`}
    </Link>
  )

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={icon}
      iconColoring={{backgroundColor, color: 'white'}}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.closedThis} `}
        {stateReason && showStateReason && (
          <>
            {`${LABELS.timeline.as} `}
            <Link href={queryUrl} sx={{color: 'fg.default', mr: 1}} inline>
              {stateReasonString}
            </Link>
          </>
        )}
        {closer && (
          <>
            {closedByMemexProject ? `by moving to ${closingProjectItemStatus} ` : ''}
            {`${LABELS.timeline.in} `}
            {closerLink}
          </>
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

function getDataHovercardUrlForCommit(owner: string, repo: string, commitHash: string): string {
  return commitHovercardPath({owner, repo, commitish: commitHash})
}

function getDataHovercardUrlForPullRequest(owner: string, repo: string, pullRequestNumber: number): string {
  return issueLinkedPullRequestHovercardPath({
    owner,
    repo,
    pullRequestNumber,
  })
}
