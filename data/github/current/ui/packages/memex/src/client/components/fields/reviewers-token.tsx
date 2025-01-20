import {testIdProps} from '@github-ui/test-id-props'
import {forwardRef} from 'react'

import type {Review} from '../../api/common-contracts'
import {Resources} from '../../strings'
import {AvatarsToken, type AvatarsTokenProps} from '../common/avatars-token'
import type {MemexAvatarStackItem} from '../memex-avatar-stack'

interface ReviewersTokenProps extends Omit<AvatarsTokenProps, 'text' | 'avatars'> {
  reviews: Array<Review>
}

function itemFromReview(review: Review): MemexAvatarStackItem {
  return {
    ...review.reviewer,
    hovercardUrl:
      review.reviewer.type === 'User'
        ? `/hovercards?user_id=${review.reviewer.id}`
        : `${review.reviewer.url}/hovercard`,
  }
}

export const ReviewersToken = forwardRef<HTMLElement, ReviewersTokenProps>(({reviews, ...tokenProps}, ref) => (
  <AvatarsToken
    ref={ref}
    avatars={reviews.map(itemFromReview)}
    text={Resources.reviewersCount(reviews.length)}
    {...testIdProps('reviewers-token')}
    {...tokenProps}
  />
))

ReviewersToken.displayName = 'ReviewersToken'
