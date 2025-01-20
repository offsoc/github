import {Label} from '@primer/react'

import {FeedbackLink, type OptionalFeedbackLinkProps} from './internal-components/FeedbackLink'
import {LabelWithLink} from './internal-components/LabelWithLink'

export interface BetaLabelProps extends OptionalFeedbackLinkProps {
  /** Override label content if necessary. */
  children?: React.ReactNode
}

/**
 * Indicates a feature that is available to some, but not all, external (non-staff) users. The beta lifecycle can be
 * private, limited, or public (the type of beta does not need to be indicated in this label).
 */
export const BetaLabel = ({children = 'Beta', feedbackUrl}: BetaLabelProps) => (
  <LabelWithLink
    label={<Label variant="success">{children}</Label>}
    link={feedbackUrl ? <FeedbackLink feedbackUrl={feedbackUrl} /> : undefined}
  />
)
