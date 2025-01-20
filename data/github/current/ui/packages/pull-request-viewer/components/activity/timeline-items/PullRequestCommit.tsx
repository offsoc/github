import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {TimelineRow} from '@github-ui/timeline-items/TimelineRow'
import {GitCommitIcon} from '@primer/octicons-react'
import {Box, Button, Label, Link, Truncate} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import type {PullRequestCommit_pullRequestCommit$key} from './__generated__/PullRequestCommit_pullRequestCommit.graphql'

// This width is set to allow for all possible trailing elements to fit on one line
const MAX_TRUNCATED_WIDTH = '320px'

export type PullRequestCommitProps = {
  pullRequestUrl: string
  queryRef: PullRequestCommit_pullRequestCommit$key
}

export function PullRequestCommit({queryRef, pullRequestUrl}: PullRequestCommitProps) {
  const {
    commit: {abbreviatedOid, message, authoredDate, verificationStatus, authors, ...commitData},
  } = useFragment(
    graphql`
      fragment PullRequestCommit_pullRequestCommit on PullRequestCommit {
        commit {
          abbreviatedOid
          oid
          message
          authoredDate
          verificationStatus
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

  const oid = commitData.oid as string
  const actor = authors?.edges?.[0]?.node?.user
  const commitUrl = `${pullRequestUrl}/commits/${oid}`
  const isVerified = verificationStatus === 'VERIFIED'

  if (!actor) return null

  return (
    <TimelineRow
      actor={actor}
      createdAt={authoredDate}
      // We currently don't use this deepLinkURL as it's only used if you enable `showAgoTimestamp`, but deepLinkUrl is required by `TimelineRow` component as of 3/25/24
      deepLinkUrl={`${pullRequestUrl}#commits-pushed-${abbreviatedOid}`}
      highlighted={false}
      leadingIcon={GitCommitIcon}
      showAgoTimestamp={false}
    >
      <TimelineRow.Main>
        {' '}
        <Link
          muted
          href={commitUrl}
          sx={{
            fontFamily: 'mono',
            fontSize: 'var(--text-codeBlock-size)',
            verticalAlign: 'bottom',
          }}
        >
          <Truncate inline={true} sx={{maxWidth: MAX_TRUNCATED_WIDTH}} title={message}>
            {message}
          </Truncate>
        </Link>
      </TimelineRow.Main>
      <TimelineRow.Trailing>
        <Box
          sx={{
            mt: '-1px',
            mr: -5,
            justifyContent: 'end',
            alignItems: 'center',
            flexWrap: 'nowrap',
            display: 'flex',
          }}
        >
          {isVerified && (
            <Label sx={{mr: 1}} variant="success">
              Verified
            </Label>
          )}
          {/** TODO: Add status check rollup badge that opens check runs in a dialog. We should be able to follow patterns used in ui/packages/repos-branches/components/StatusCheckRollup.tsx. Unfortunately that component isn't a 1:1 but we can use their pattern for fetching check runs with the RestAPI */}
          <Button
            as={Link}
            href={commitUrl}
            size="small"
            sx={{color: 'fg.muted', fontFamily: 'mono'}}
            variant="invisible"
          >
            {abbreviatedOid}
          </Button>
          <CopyToClipboardButton
            ariaLabel={`Copy full SHA for ${abbreviatedOid}`}
            hasPortalTooltip={true}
            size="small"
            sx={{mt: '-2px'}}
            textToCopy={oid}
            tooltipProps={{direction: 'sw', sx: {position: 'relative', mt: '30px'}}}
          />
        </Box>
      </TimelineRow.Trailing>
    </TimelineRow>
  )
}
