import {userHovercardPath} from '@github-ui/paths'
import {StatusAvatar} from '@github-ui/status-avatar/StatusAvatar'

import {REVIEW_STATES} from './review-states'
import {GitHubAvatar} from '@github-ui/github-avatar'

export type ReviewerAvatarProps = {
  state: string
  author: {
    login: string
    avatarUrl: string
  }
  position?: number
  size?: 20 | 24
}

/**
 * Renders the Avatar for the reviewer and an icon indicating the state of their review
 */
export function ReviewerAvatar({state, author, position, size}: ReviewerAvatarProps) {
  let currentReviewState
  if (state !== 'SUGGESTED') {
    currentReviewState = REVIEW_STATES[state as keyof typeof REVIEW_STATES]
  }
  const reviewerZIndex = position ? {zIndex: position + 1} : {}
  return (
    (currentReviewState && (
      <StatusAvatar
        key={author.login}
        altText={`${author.login}'s reviewer avatar image`}
        hovercardUrl={userHovercardPath({owner: author.login || ''})}
        square={false}
        src={author.avatarUrl}
        zIndex={reviewerZIndex}
        size={size}
        backgroundColor={currentReviewState.background}
        icon={currentReviewState.icon}
        iconColor={currentReviewState.color}
      />
    )) || <GitHubAvatar src={author.avatarUrl} size={size} alt={`${author.login}'s suggested reviewer avatar image`} />
  )
}
