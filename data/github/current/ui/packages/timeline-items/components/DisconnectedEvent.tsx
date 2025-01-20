import {Link, Octicon} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {getSourceIcon} from '../utils/get-source-icon'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {DisconnectedEvent$key} from './__generated__/DisconnectedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import {issueLinkedPullRequestHovercardPath} from '@github-ui/paths'

type DisconnectedEventProps = {
  queryRef: DisconnectedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function DisconnectedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: DisconnectedEventProps): JSX.Element {
  const {actor, createdAt, subject, databaseId} = useFragment(
    graphql`
      fragment DisconnectedEvent on DisconnectedEvent {
        databaseId
        actor {
          ...TimelineRowEventActor
        }
        createdAt
        subject {
          ... on PullRequest {
            title
            url
            number
            state
            isDraft
            isInMergeQueue
            repository {
              name
              owner {
                login
              }
            }
          }
        }
      }
    `,
    queryRef,
  )

  const {title, number, url, isDraft, isInMergeQueue, state, repository} = subject || {}

  const icon = getSourceIcon('PullRequest', state, null, isDraft, isInMergeQueue)
  const highlighted = String(databaseId) === highlightedEventId

  const dataHovercardUrl =
    repository && number
      ? issueLinkedPullRequestHovercardPath({
          owner: repository?.owner.login,
          repo: repository?.name,
          pullRequestNumber: number,
        })
      : null

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={icon.icon}
      iconColoring={{color: icon.color}}
    >
      <TimelineRow.Main>
        {LABELS.timeline.removedLinkedPR}
        <Octicon icon={icon.icon} sx={{ml: 1, mr: 1, color: icon.color}} />
        <Link href={url} target="_blank" sx={{color: 'fg.default', mr: 1}} data-hovercard-url={dataHovercardUrl} inline>
          {`${title} #${number}`}
        </Link>
      </TimelineRow.Main>
    </TimelineRow>
  )
}
