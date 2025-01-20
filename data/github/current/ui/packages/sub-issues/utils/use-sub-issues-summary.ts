import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import type {useSubIssuesSummary$key} from './__generated__/useSubIssuesSummary.graphql'

// We need a fragment to spread in `subIssueSubscription` to ensure this field is updated when the issue state changes
graphql`
  fragment useSubIssuesSummary_issueState on Issue {
    closed
  }
`

/**
 * `subIssuesSummary` is updated asynchronously, meaning that it is not guarunteed to be synchronized with `subIssues`.
 * This can cause issues when the sub-issues list is visible, as `subIssuesSummary` may not align with the list of
 * visible issues. To resolve this, we calculate the summary on the client side if the sub-issues list is loaded.
 *
 * Consumers should *always* prefer calling `useSubIssuesSummary` over reading the `subIssuesSummary` field directly.
 *
 * Note: this would work much better as a [derived field](https://relay.dev/docs/guides/relay-resolvers/derived-fields/)
 * but that's an experimental v17 Relay feature we don't have access to yet.
 */
export function useSubIssuesSummary(issueKey?: useSubIssuesSummary$key) {
  const data = useFragment(
    graphql`
      fragment useSubIssuesSummary on Issue @argumentDefinitions(fetchSubIssues: {type: "Boolean!"}) {
        subIssuesSummary @skip(if: $fetchSubIssues) {
          completed
        }
        subIssuesConnection: subIssues {
          # Important to use totalCount (not subIssuesSummary.total) so we use the same field everywhere, keeping in sync when mutating
          totalCount
        }
        subIssues(first: 50) @include(if: $fetchSubIssues) {
          nodes {
            # Unfortunately have to duplicate the fragment to be able to access the value locally
            closed
            # There's not really a purpose to spreading the fragment here but it's good to show where it's relevant
            ...useSubIssuesSummary_issueState
          }
        }
      }
    `,
    issueKey,
  )

  const {subIssuesSummary, subIssues, subIssuesConnection} = data || {}
  const total = subIssues?.nodes?.length ?? subIssuesConnection?.totalCount ?? 0
  const completed = subIssues?.nodes?.filter(issue => issue?.closed).length ?? subIssuesSummary?.completed ?? 0

  return useMemo(
    () => ({
      total,
      completed,
      percentCompleted: total !== 0 ? Math.floor((completed / total) * 100) : 0,
    }),
    [total, completed],
  )
}
