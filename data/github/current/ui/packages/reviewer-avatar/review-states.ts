import {CheckCircleFillIcon, DotFillIcon, FeedDiscussionIcon, XCircleFillIcon} from '@primer/octicons-react'

export const REVIEW_STATES = {
  APPROVED: {
    icon: CheckCircleFillIcon,
    color: 'var(--fgColor-success, var(--color-success-fg))',
    background: 'var(--fgColor-onEmphasis, var(--color-fg-on-emphasis))',
    description: 'Approved',
  },
  CHANGES_REQUESTED: {
    icon: XCircleFillIcon,
    color: 'var(--fgColor-severe, var(--color-severe-fg))',
    background: 'var(--fgColor-onEmphasis, var(--color-fg-on-emphasis))',
    description: 'Requested changes',
  },
  COMMENTED: {
    icon: FeedDiscussionIcon,
    color: 'var(--fgColor-muted, var(--color-fg-muted))',
    background: 'var(--fgColor-onEmphasis, var(--color-fg-on-emphasis))',
    description: 'Commented',
  },
  DISMISSED: {
    icon: FeedDiscussionIcon,
    color: 'var(--fgColor-muted, var(--color-fg-muted))',
    background: 'var(--fgColor-onEmphasis, var(--color-fg-on-emphasis))',
    description: 'Dismissed',
  },
  PENDING: {
    icon: DotFillIcon,
    color: 'var(--fgColor-attention, var(--color-attention-fg))',
    background: 'var(--bgColor-attention-muted, var(--color-attention-muted))',
    description: 'Awaiting review',
  },
}
