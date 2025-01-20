import {Box, Link, Text, Token, Octicon} from '@primer/react'
import {graphql, useFragment} from 'react-relay'
import {IssueClosedIcon, IssueOpenedIcon, SkipIcon} from '@primer/octicons-react'
import type {FC} from 'react'
import type {IssueStateReason, TrackedByFragment$key} from './__generated__/TrackedByFragment.graphql'

type TrackingIssue = {
  number: number
  url: string
  stateReason?: IssueStateReason | null
}

type TrackedByProps = {
  trackedByKey?: TrackedByFragment$key
  url: string
  isSmall?: boolean
}

export const TrackedByFragment = graphql`
  fragment TrackedByFragment on Issue {
    ... on Issue {
      trackedInIssues(first: 10) {
        nodes {
          number
          url
          stateReason
        }
        totalCount
      }
    }
  }
`

export const SmallTrackedBy: FC<TrackedByProps> = props => <TrackedBy {...props} isSmall={true} />

export function TrackedBy({trackedByKey, url, isSmall = false}: TrackedByProps) {
  const data = useFragment(TrackedByFragment, trackedByKey)

  if (!data) {
    return null
  }

  const numberOfTrackingIssues = data.trackedInIssues?.totalCount ?? 0
  if (numberOfTrackingIssues === 0) return null

  const trackingIssues = data.trackedInIssues?.nodes?.flatMap(a => (a ? a : [])) ?? []

  const trackingItem =
    trackingIssues.length === 1 ? (
      <SingleTrackingItem trackingIssue={trackingIssues[0]!} url={url} omitIcon={isSmall} omitHover={isSmall} />
    ) : (
      <MultipleTrackingItems trackingIssues={trackingIssues} url={url} omitHover={isSmall} />
    )

  const tokenContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {trackingItem}
    </Box>
  )

  if (isSmall) {
    return tokenContent
  }

  return (
    <div>
      <Token
        text={tokenContent}
        size={'xlarge'}
        sx={{
          px: 'var(--control-small-paddingInline-normal)',
          backgroundColor: 'canvas.default',
          fontWeight: '400',
          fontSize: 0,
          gap: 1,
        }}
      />
    </div>
  )
}

function getIssueIcon(stateReason?: IssueStateReason | null) {
  if (stateReason === 'COMPLETED') {
    return {
      color: 'done.fg',
      icon: IssueClosedIcon,
    }
  } else if (stateReason === 'NOT_PLANNED') {
    return {
      color: 'fg.muted',
      icon: SkipIcon,
    }
  } else {
    return {
      color: 'open.fg',
      icon: IssueOpenedIcon,
    }
  }
}

type TrackingItemBaseProps = {
  url: string
  omitIcon?: boolean
  omitHover?: boolean
}
type SingleTrackingItemProps = {
  trackingIssue: TrackingIssue
} & TrackingItemBaseProps

const SingleTrackingItem: FC<SingleTrackingItemProps> = ({trackingIssue, url, omitIcon, omitHover}) => {
  const icon = getIssueIcon(trackingIssue.stateReason)

  return (
    <>
      <Text
        data-hovercard-url={!omitHover ? `${url}/tracked_in/hovercard/` : undefined}
        sx={{
          marginRight: '4px',
        }}
      >
        Tracked by
      </Text>
      <Box
        key={trackingIssue.number}
        data-hovercard-url={!omitHover ? `${trackingIssue.url}/hovercard` : undefined}
        sx={{display: 'flex', alignItems: 'center', gap: '2px'}}
      >
        {!omitIcon && <Octicon icon={icon.icon} size={16} sx={{color: icon.color}} />}
        <Link href={trackingIssue.url}>{`#${trackingIssue.number}`}</Link>
      </Box>
    </>
  )
}

type MultipleTrackingItemProps = {
  trackingIssues: TrackingIssue[]
} & TrackingItemBaseProps

const MultipleTrackingItems: FC<MultipleTrackingItemProps> = ({trackingIssues, url, omitHover}) => (
  <span
    data-hovercard-url={!omitHover ? `${url}/tracked_in/hovercard/` : undefined}
  >{`Tracked by ${trackingIssues.length} issues`}</span>
)
