import {useMemo} from 'react'
import {graphql, useSubscription} from 'react-relay'

import type {IssueRowSubscription} from './__generated__/IssueRowSubscription.graphql'

const subscription = graphql`
  subscription IssueRowSubscription($issueId: ID!) {
    issueUpdated(id: $issueId) {
      issueTitleUpdated {
        title
        titleHTML
      }
      issueStateUpdated {
        state
        stateReason
      }
      issueTypeUpdated {
        ...IssueTypeIndicator
      }
      issueMetadataUpdated {
        ...Labels @arguments(labelPageSize: 20)
        ...Assignees @arguments(assigneePageSize: 20)
        ...MilestonesSectionMilestone

        projectItemsNext(first: 10) {
          edges {
            node {
              id
              project {
                ...ProjectPickerProject
              }
            }
          }
        }
      }
    }
  }
`

export const useIssueRowSubscription = (issueId: string) => {
  const config = useMemo(() => {
    return {
      subscription,
      variables: {issueId},
    }
  }, [issueId])

  useSubscription<IssueRowSubscription>(config)
}
