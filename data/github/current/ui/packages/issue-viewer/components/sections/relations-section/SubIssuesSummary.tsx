import {Box, Tooltip} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import {SubIssuesSummaryToken} from './SubIssuesSummaryToken'
import type {SubIssueCompletionTokenProps} from './SubIssuesSummaryToken'
import type {SubIssuesSummary$key} from './__generated__/SubIssuesSummary.graphql'
import {useSubIssuesSummary} from '@github-ui/sub-issues/useSubIssuesSummary'

interface SubIssueSummaryProps {
  issue: SubIssuesSummary$key
  onSummaryClick?: (event: React.MouseEvent, issueNode: {url: string} & unknown) => void
}

export function SubIssuesSummary({issue, onSummaryClick}: SubIssueSummaryProps) {
  const data = useFragment(
    graphql`
      fragment SubIssuesSummary on Issue {
        url
        ...useSubIssuesSummary @arguments(fetchSubIssues: false)
      }
    `,
    issue,
  )

  const progress = useSubIssuesSummary(data)

  const anchorAttrs: Partial<SubIssueCompletionTokenProps> | undefined = onSummaryClick && {
    as: 'a',
    href: data.url,
    onClick: e => onSummaryClick(e, data),
  }

  return progress.total > 0 ? (
    <Box sx={{gridArea: 'main-content', ml: 2, display: 'flex', alignItems: 'center'}}>
      <Tooltip aria-label={`${progress.percentCompleted}% completed`}>
        <SubIssuesSummaryToken {...anchorAttrs} progress={progress} />
      </Tooltip>
    </Box>
  ) : null
}
