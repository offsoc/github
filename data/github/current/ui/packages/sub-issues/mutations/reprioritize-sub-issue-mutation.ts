import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  ReprioritizeSubIssueInput,
  reprioritizeSubIssueMutation,
  reprioritizeSubIssueMutation$data,
} from './__generated__/reprioritizeSubIssueMutation.graphql'

export function reprioritizeSubIssueMutation({
  environment,
  input,
  onError,
  onCompleted,
}: {
  environment: Environment
  input: ReprioritizeSubIssueInput
  onError?: (error: Error) => void
  onCompleted?: (response: reprioritizeSubIssueMutation$data) => void
}) {
  return commitMutation<reprioritizeSubIssueMutation>(environment, {
    mutation: graphql`
      mutation reprioritizeSubIssueMutation($input: ReprioritizeSubIssueInput!) @raw_response_type {
        reprioritizeSubIssue(input: $input) {
          issue {
            ... on Issue {
              ...SubIssuesListItem
              subIssues(first: 50) {
                nodes {
                  id
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      input,
    },
    optimisticUpdater: store => {
      const subIssues = store.get(input.issueId)?.getLinkedRecord('subIssues(first:50)')
      if (!subIssues) return

      const nodes = subIssues.getLinkedRecords('nodes')
      if (!nodes) return
      const reorderedNodes = [...nodes]

      const dragIssueIndex = reorderedNodes.findIndex(node => node.getDataID() === input.subIssueId)
      const dropIssueIndex = reorderedNodes.findIndex(node => node.getDataID() === (input.beforeId || input.afterId))
      const draggedIssue = reorderedNodes[dragIssueIndex]
      if (draggedIssue) {
        reorderedNodes.splice(dragIssueIndex, 1)
        reorderedNodes.splice(dropIssueIndex, 0, draggedIssue)
      }

      subIssues.setLinkedRecords(reorderedNodes, 'nodes')
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
