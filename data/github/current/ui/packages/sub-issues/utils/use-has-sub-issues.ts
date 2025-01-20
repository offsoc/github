import {useFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import type {useHasSubIssues$key} from './__generated__/useHasSubIssues.graphql'

/** Returns true if this issue has sub-issues. */
export function useHasSubIssues(issueKey: useHasSubIssues$key | null | undefined) {
  const data = useFragment(
    graphql`
      fragment useHasSubIssues on Issue {
        subIssuesConnection: subIssues {
          totalCount
        }
      }
    `,
    issueKey,
  )

  return (data?.subIssuesConnection.totalCount ?? 0) > 0
}
