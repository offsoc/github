import {Link} from '@primer/react'

import styles from './FeedbackLink.module.css'

export interface OptionalFeedbackLinkProps {
  /**
   * Optional feedback URL. Should always be included if the lifecycle label is not part of a navigation item. This
   * should typically be a link to a GitHub Discussion - ensure that all users with access to the feature also have
   * access to this discussion.
   */
  feedbackUrl?: string
}

interface RequiredFeedbackLinkProps extends OptionalFeedbackLinkProps {
  feedbackUrl: string
}

/** "Give feedback" link. Renders nothing if no URL is passed. */
export const FeedbackLink = ({feedbackUrl}: RequiredFeedbackLinkProps) => (
  <Link className={styles.link} href={feedbackUrl}>
    Give feedback
  </Link>
)
