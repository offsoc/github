import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'
import {TimelineRow} from '@github-ui/timeline-items/TimelineRow'
import {CommentIcon, XIcon} from '@primer/octicons-react'
import {Box, IconButton, Link, Popover} from '@primer/react'
import {useState} from 'react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import type {ReviewDismissedEvent_reviewDismissedEvent$key} from './__generated__/ReviewDismissedEvent_reviewDismissedEvent.graphql'

function DismissedDescription({
  actorLogin,
  reviewAuthorLogin,
  reviewDatabaseId,
}: {
  actorLogin?: string
  reviewAuthorLogin?: string
  reviewDatabaseId?: number
}) {
  const selfDismissed = reviewAuthorLogin && actorLogin && reviewAuthorLogin === actorLogin
  const reviewAnchor = `#pullrequestreview-${reviewDatabaseId}`

  if (selfDismissed) {
    return (
      <span>
        dismissed their{' '}
        <Link inline href={reviewAnchor}>
          stale review
        </Link>
      </span>
    )
  } else if (reviewDatabaseId && reviewAuthorLogin) {
    return (
      <span>
        dismissed{' '}
        <Link inline href={`/${reviewAuthorLogin}`}>
          {reviewAuthorLogin}
        </Link>
        &apos;s{' '}
        <Link inline href={reviewAnchor}>
          stale review
        </Link>
      </span>
    )
  } else {
    return <span>dismissed a stale review</span>
  }
}

function ViaCommit({commitUrl, abbreviatedOid}: {commitUrl?: string; abbreviatedOid?: string}) {
  if (!commitUrl || !abbreviatedOid) return null

  return (
    <span>
      via{' '}
      <Link href={commitUrl} sx={{fontWeight: 'var(--base-text-weight-semibold)', color: 'fg.default'}}>
        {abbreviatedOid}
      </Link>{' '}
    </span>
  )
}

export type ReviewDismissedEventProps = {
  queryRef: ReviewDismissedEvent_reviewDismissedEvent$key
  pullRequestUrl: string
}

export function ReviewDismissedEvent({queryRef, pullRequestUrl}: ReviewDismissedEventProps) {
  const [showReason, setShowReason] = useState(false)
  const {actor, pullRequestCommit, review, dismissalMessageHTML, createdAt, databaseId} = useFragment(
    graphql`
      fragment ReviewDismissedEvent_reviewDismissedEvent on ReviewDismissedEvent {
        actor {
          login
          ...TimelineRowEventActor
        }
        pullRequestCommit {
          commit {
            abbreviatedOid
          }
          resourcePath
        }
        review {
          fullDatabaseId
          author {
            login
          }
        }
        dismissalMessageHTML
        createdAt
        databaseId
      }
    `,
    queryRef,
  )

  return (
    <TimelineRow
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={`${pullRequestUrl}#event-${databaseId}`}
      highlighted={false}
      leadingIcon={XIcon}
    >
      <TimelineRow.Main>
        <DismissedDescription
          actorLogin={actor?.login}
          reviewAuthorLogin={review?.author?.login}
          reviewDatabaseId={review?.fullDatabaseId as number}
        />{' '}
        <ViaCommit
          abbreviatedOid={pullRequestCommit?.commit?.abbreviatedOid}
          commitUrl={pullRequestCommit?.resourcePath}
        />
      </TimelineRow.Main>
      {dismissalMessageHTML && (
        <TimelineRow.Trailing>
          <Box sx={{mr: -5, position: 'relative'}}>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              aria-label="View reason"
              icon={CommentIcon}
              size="small"
              unsafeDisableTooltip={true}
              onClick={() => setShowReason(show => !show)}
            />
            <Popover caret="top-right" open={showReason} sx={{right: '-4px', top: 'calc(100% + 14px)'}}>
              <Popover.Content sx={{pb: '14px', width: '320px'}}>
                <SafeHTMLText as="span" html={dismissalMessageHTML as SafeHTMLString} />
              </Popover.Content>
            </Popover>
          </Box>
        </TimelineRow.Trailing>
      )}
    </TimelineRow>
  )
}
