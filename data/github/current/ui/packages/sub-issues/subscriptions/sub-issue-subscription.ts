import {useMemo} from 'react'
import {useSubscription} from 'react-relay'
import type {GraphQLSubscriptionConfig} from 'relay-runtime'
import {graphql} from 'relay-runtime'

import type {subIssueSubscription} from './__generated__/subIssueSubscription.graphql'

const subscription = graphql`
  subscription subIssueSubscription($issueId: ID!, $fetchSubIssues: Boolean!) {
    issueUpdated(id: $issueId) {
      issueTitleUpdated {
        ...SubIssueTitle_TitleValue
      }
      issueStateUpdated {
        ...SubIssueStateIcon
        ...useSubIssuesSummary_issueState
      }
      issueTypeUpdated {
        ...SubIssueTypeIndicator
      }
      issueMetadataUpdated {
        ...SubIssuesListItem
      }
      subIssuesUpdated {
        ...SubIssuesCompletionPill @arguments(fetchSubIssues: $fetchSubIssues)
        ...SubIssuesListItem_NestedSubIssues @arguments(fetchSubIssues: $fetchSubIssues)
      }
      # We only need to subscribe to the summary if we haven't fetched sub-issues - otherwise, useSubIssuesSummary will
      # just calculate it from the list of sub-issues
      subIssuesSummaryUpdated @skip(if: $fetchSubIssues) {
        ...useSubIssuesSummary @arguments(fetchSubIssues: false)
      }
    }
  }
`

interface UseSubIssueSubscriptionParams {
  /**
   * Control whether full sub-issues data should be loaded when the sub-issues list changes. This is a small
   * optimization to reduce request sizes where the user has not expanded the list.
   * If `false`, will only refresh the summary.
   */
  fetchSubIssues: boolean
}

export const useSubIssueSubscription = (issueId: string, {fetchSubIssues}: UseSubIssueSubscriptionParams) => {
  const config = useMemo<GraphQLSubscriptionConfig<subIssueSubscription>>(
    () => ({
      variables: {issueId, fetchSubIssues},
      subscription,
    }),
    [issueId, fetchSubIssues],
  )

  useSubscription(config)
}
