import {Label, Link} from '@primer/react'

import feedbackLinkStyles from './internal-components/FeedbackLink.module.css'
import {LabelWithLink} from './internal-components/LabelWithLink'

export interface DeprecatedLabelProps {
  /** Override label content if necessary. */
  children?: React.ReactNode
  /**
   * Optional link to documentation or a deprecation announcement. Should typically be included unless this is
   * annotating a navigation item in a menu.
   */
  docsUrl?: string
}

/**
 * Represents a feature that is deprecated and will be removed soon. Note that features that were never promoted
 * beyond the "Alpha" lifecycle do not need to go through a deprecation lifecycle.
 */
export const DeprecatedLabel = ({children = 'Deprecated', docsUrl}: DeprecatedLabelProps) => (
  <LabelWithLink
    label={<Label variant="attention">{children}</Label>}
    link={
      docsUrl ? (
        <Link className={feedbackLinkStyles.link} href={docsUrl}>
          Learn more
        </Link>
      ) : null
    }
  />
)
