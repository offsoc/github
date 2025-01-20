import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import {REVIEW_STATES, ReviewerAvatar} from '@github-ui/reviewer-avatar'
import {PeopleIcon, ShieldLockIcon} from '@primer/octicons-react'
import {Box, Link, Octicon, Tooltip, Truncate} from '@primer/react'
import {useRef} from 'react'

import type {PullRequestReviewState} from './__generated__/ReviewDetails_pullRequest.graphql'

type ReviewerProps = {
  displayName: string
  avatarUrl: string
  url: string
  hovercardUrl: string
  afterAvatarContent?: React.ReactNode
  trailingContent?: React.ReactNode
  reviewState?: PullRequestReviewState | 'SUGGESTED'
  onBehalfOfTeam?: string
  assignedFromTeam?: string
  codeownerTooltip?: string
}

/**
 * Presentational component that displays
 * the avatar, state, link, codeowner status, and optional trailing content for a review-like entity (review, review request, suggested reviewer, etc.)
 */
export default function Reviewer({
  afterAvatarContent,
  avatarUrl,
  codeownerTooltip,
  displayName,
  hovercardUrl,
  onBehalfOfTeam,
  assignedFromTeam,
  reviewState = 'PENDING',
  trailingContent,
  url,
}: ReviewerProps) {
  let stateKey = `${reviewState}` as keyof typeof REVIEW_STATES
  let currentReviewState = undefined
  let associatedTeamTooltipCopy = undefined

  stateKey = `${reviewState}` as keyof typeof REVIEW_STATES
  currentReviewState = REVIEW_STATES[stateKey]
  const description = currentReviewState?.description || 'Suggested'

  if (onBehalfOfTeam) {
    associatedTeamTooltipCopy = `On behalf of ${onBehalfOfTeam}`
  } else if (assignedFromTeam) {
    associatedTeamTooltipCopy = `Assigned from ${assignedFromTeam}`
  }

  const contentRef = useRef<HTMLDivElement>(null)
  const [boxContentProps, boxTooltipElement] = usePortalTooltip({
    contentRef,
    'aria-label': codeownerTooltip,
    direction: 'nw',
  })

  return (
    <Box
      as="li"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 'var(--control-medium-size)',
        gap: 1,
      }}
    >
      <Truncate
        sx={{flexGrow: 1, display: 'unset', fontWeight: 400, fontSize: 1, maxWidth: 'unset'}}
        title={displayName}
      >
        <Link
          className="js-hovercard-left"
          data-hovercard-url={hovercardUrl}
          href={url}
          sx={{
            color: 'fg.default',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 1,
            fontWeight: 'bold',
            fontSize: 0,
            borderRadius: 2,
            mr: 1,
            height: 'var(--control-medium-size)',
            '&:hover': {
              backgroundColor: 'canvas.subtle',
              textDecoration: 'none',
            },
          }}
        >
          <ReviewerAvatar author={{login: displayName, avatarUrl}} state={reviewState} />

          <Box as="span" sx={{overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {displayName}
          </Box>
          <span className="sr-only">{description}</span>
          {afterAvatarContent ? afterAvatarContent : null}
        </Link>
      </Truncate>

      <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        {associatedTeamTooltipCopy && (
          <Tooltip wrap aria-label={`${associatedTeamTooltipCopy}`} direction="nw">
            <Box sx={{p: '6px', display: 'flex'}}>
              <Octicon icon={PeopleIcon} sx={{color: 'fg.muted'}} />
            </Box>
          </Tooltip>
        )}
        {codeownerTooltip && (
          <Box ref={contentRef} sx={{p: '6px', display: 'flex'}} {...boxContentProps}>
            <Octicon icon={ShieldLockIcon} sx={{color: 'fg.muted'}} />
            {boxTooltipElement}
          </Box>
        )}
        {trailingContent}
      </Box>
    </Box>
  )
}
