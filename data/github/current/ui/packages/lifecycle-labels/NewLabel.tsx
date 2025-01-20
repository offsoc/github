import {Label} from '@primer/react'

import {FeedbackLink, type OptionalFeedbackLinkProps} from './internal-components/FeedbackLink'
import {LabelWithLink} from './internal-components/LabelWithLink'

export interface NewLabelProps extends OptionalFeedbackLinkProps {
  /** Override label content if necessary. */
  children?: React.ReactNode
}

/**
 * Represents a recently-released feature that is available to everyone. Can be used to draw attention to new public
 * features, encouraging users to try them out.
 */
export const NewLabel = ({children = 'New', feedbackUrl}: NewLabelProps) => (
  <LabelWithLink
    label={<Label variant="accent">{children}</Label>}
    link={feedbackUrl ? <FeedbackLink feedbackUrl={feedbackUrl} /> : undefined}
  />
)
