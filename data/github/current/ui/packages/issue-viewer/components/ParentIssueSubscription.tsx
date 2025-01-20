import {useSubscription} from 'react-relay'
import type {GraphQLSubscriptionConfig} from 'relay-runtime'
import {graphql} from 'relay-runtime'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useMemo} from 'react'
import type {ParentIssueSubscription} from './__generated__/ParentIssueSubscription.graphql'

const subscription = graphql`
  subscription ParentIssueSubscription($issueId: ID!) {
    issueUpdated(id: $issueId) {
      # This could be made more efficient by splitting the fragment into subparts, but it's already pretty small
      issueStateUpdated {
        ...ParentIssueFragment
        ...HeaderParentTitle
      }
      issueTitleUpdated {
        ...ParentIssueFragment
        ...HeaderParentTitle
      }
      subIssuesSummaryUpdated {
        ...useSubIssuesSummary @arguments(fetchSubIssues: false)
      }
    }
  }
`

export const useParentIssueSubscription = (issueId: string) => {
  const enabled = useFeatureFlag('sub_issues_live_updates')

  const config = useMemo<GraphQLSubscriptionConfig<ParentIssueSubscription>>(
    () => ({
      variables: {issueId},
      subscription,
    }),
    [issueId],
  )

  // There's no way around a conditional hook call here - useSubscription doesn't take an enabled argument. But it
  // should be safe for feature flagging.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (enabled) useSubscription(config)
}
