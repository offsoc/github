import {graphql} from 'relay-runtime'
import type {SubIssuesCompletionPill$key} from './__generated__/SubIssuesCompletionPill.graphql'
import {useFragment} from 'react-relay'
import {
  NestedListViewCompletionPill,
  type NestedListViewCompletionPillProps,
} from '@github-ui/nested-list-view/NestedListViewCompletionPill'
import {useSubIssuesSummary} from '../utils/use-sub-issues-summary'

interface SubIssuesCompletionPillProps extends Pick<NestedListViewCompletionPillProps, 'onClick'> {
  issueKey: SubIssuesCompletionPill$key
}

export function SubIssuesCompletionPill({issueKey, onClick}: SubIssuesCompletionPillProps) {
  const node = useFragment(
    graphql`
      fragment SubIssuesCompletionPill on Issue @argumentDefinitions(fetchSubIssues: {type: "Boolean!"}) {
        ...useSubIssuesSummary @arguments(fetchSubIssues: $fetchSubIssues)
        url
      }
    `,
    issueKey,
  )
  const {url} = node

  const progress = useSubIssuesSummary(node)

  return progress.total > 0 ? <NestedListViewCompletionPill progress={progress} href={url} onClick={onClick} /> : null
}
