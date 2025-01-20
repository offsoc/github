import {TimelineRow} from '@github-ui/timeline-items/TimelineRow'
import {RepoPushIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import type {HeadRefForcePushedEvent_headRefForcePushedEvent$key} from './__generated__/HeadRefForcePushedEvent_headRefForcePushedEvent.graphql'
import {ForcePushEventTimelineRowMainContent} from './force-push-event-shared/ForcePushEventTimelineRowMainContent'
import {ForcePushEventTimelineRowTrailingContent} from './force-push-event-shared/ForcePushEventTimelineRowRowTrailingContent'

export type HeadRefForcePushedEventProps = {
  pullRequestUrl: string
  repositoryUrl: string
  queryRef: HeadRefForcePushedEvent_headRefForcePushedEvent$key
}

export function HeadRefForcePushedEvent({queryRef, pullRequestUrl, repositoryUrl}: HeadRefForcePushedEventProps) {
  const {beforeCommit, afterCommit, databaseId, refName} = useFragment(
    graphql`
      fragment HeadRefForcePushedEvent_headRefForcePushedEvent on HeadRefForcePushedEvent {
        databaseId
        refName
        beforeCommit {
          abbreviatedOid
          oid
        }
        afterCommit {
          abbreviatedOid
          oid
          authoredDate
          authors(first: 1) {
            edges {
              node {
                user {
                  ...TimelineRowEventActor
                }
              }
            }
          }
        }
      }
    `,
    queryRef,
  )

  const actor = afterCommit?.authors?.edges?.[0]?.node?.user
  const compareUrl = `${repositoryUrl}/compare/${beforeCommit?.oid}...${afterCommit?.oid}`
  const beforeCommitUrl = `${pullRequestUrl}/commits/${beforeCommit?.oid}`
  const afterCommitUrl = `${pullRequestUrl}/commits/${afterCommit?.oid}`

  if (!actor || !afterCommit || !beforeCommit) return null

  return (
    <TimelineRow
      actor={actor}
      createdAt={afterCommit.authoredDate}
      deepLinkUrl={`${pullRequestUrl}#event-${databaseId}`}
      highlighted={false}
      leadingIcon={RepoPushIcon}
    >
      <TimelineRow.Main>
        <ForcePushEventTimelineRowMainContent
          afterCommitAbbreviatedOid={afterCommit.abbreviatedOid}
          afterCommitUrl={afterCommitUrl}
          beforeCommitAbbreviatedOid={beforeCommit.abbreviatedOid}
          beforeCommitUrl={beforeCommitUrl}
          compareUrl={compareUrl}
          refName={refName}
        />{' '}
      </TimelineRow.Main>
      <TimelineRow.Trailing>
        <ForcePushEventTimelineRowTrailingContent compareUrl={compareUrl} />
      </TimelineRow.Trailing>
    </TimelineRow>
  )
}
