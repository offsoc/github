import type {VariantType} from '@github-ui/list-view/ListViewVariantContext'
import {CheckCircleFillIcon, NoEntryFillIcon, XCircleFillIcon} from '@primer/octicons-react'
import {Box, Octicon, Text} from '@primer/react'

import type {PullRequestReviewDecision} from './__generated__/IssuePullRequestDescription.graphql'

export function ReviewDecision({
  decision,
  variant = 'default',
}: {
  decision: PullRequestReviewDecision
  variant?: VariantType
}) {
  const reviewDecision = getStyledDecision(decision)
  if (!reviewDecision) return null

  return variant === 'default' ? (
    <Box sx={{whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 1, ml: 1}}>
      {' '}
      &middot;
      <Box as="span" sx={{display: 'inline-flex', alignItems: 'center', gap: 1}}>
        {reviewDecision}
      </Box>
    </Box>
  ) : (
    <Box sx={{whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 1, ml: 1}}>
      <span>&middot;</span>
      {reviewDecision}
    </Box>
  )
}

function getStyledDecision(decision: string) {
  const textStyle = {color: 'fg.muted', fontWeight: 'normal', fontSize: 0}
  switch (decision) {
    case 'APPROVED':
      return (
        <>
          <Octicon icon={CheckCircleFillIcon} size={12} sx={{color: 'success.fg'}} />{' '}
          <Text sx={textStyle}>Approved</Text>
        </>
      )
    case 'CHANGES_REQUESTED':
      return (
        <>
          <Octicon icon={XCircleFillIcon} size={12} sx={{color: 'danger.fg'}} />{' '}
          <Text sx={textStyle}>Changes requested</Text>
        </>
      )
    case 'REVIEW_REQUIRED':
      return (
        <>
          <Octicon icon={NoEntryFillIcon} size={12} sx={{color: 'attention.fg'}} />{' '}
          <Text sx={textStyle}>Review required</Text>
        </>
      )
    default:
      return null
  }
}
