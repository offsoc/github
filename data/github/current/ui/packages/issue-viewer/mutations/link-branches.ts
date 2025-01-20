import {type Environment, commitMutation, graphql} from 'react-relay'
import type {linkBranchesMutation} from './__generated__/linkBranchesMutation.graphql'

type LinkBranchesMutationParams = {
  environment: Environment
  input: {baseIssueId: string; linkingIds: string[]}
  onError: (error: Error) => void
}

export function linkBranchesMutation({
  environment,
  input: {baseIssueId, linkingIds},
  onError,
}: LinkBranchesMutationParams) {
  return commitMutation<linkBranchesMutation>(environment, {
    mutation: graphql`
      mutation linkBranchesMutation($baseIssueId: ID!, $linkingIds: [ID!]!) @raw_response_type {
        linkBranches(input: {issueId: $baseIssueId, linkingIds: $linkingIds}) {
          issue {
            ... on Issue {
              linkedBranches(first: 25) {
                nodes {
                  id
                  ref {
                    ...BranchPickerRef
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: {baseIssueId, linkingIds},
    onError,
  })
}
