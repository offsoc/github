import {type Environment, commitMutation, graphql} from 'react-relay'
import type {
  CreateLinkedBranchInput,
  createLinkedBranchMutation,
  createLinkedBranchMutation$data,
} from './__generated__/createLinkedBranchMutation.graphql'

export function commitCreateLinkedBranchMutation({
  environment,
  input,
  onError,
  onCompleted,
}: {
  environment: Environment
  input: CreateLinkedBranchInput
  onError?: (error: Error) => void
  onCompleted?: (response: createLinkedBranchMutation$data) => void
}) {
  return commitMutation<createLinkedBranchMutation>(environment, {
    mutation: graphql`
      mutation createLinkedBranchMutation($input: CreateLinkedBranchInput!) @raw_response_type {
        createLinkedBranch(input: $input) {
          linkedBranch {
            ref {
              id
              name
              prefix
            }
          }
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
              repository {
                refs(refPrefix: "refs/heads/", first: 25) {
                  nodes {
                    ...BranchPickerRef
                  }
                }
              }
            }
          }
          clientMutationId
        }
      }
    `,
    variables: {input},
    onError: error => onError?.(error),
    onCompleted: response => {
      if (!response.createLinkedBranch?.linkedBranch) {
        onError?.({name: 'LinkedBranchNotFound', message: 'Linked branch not found'})
      } else {
        onCompleted?.(response)
      }
    },
  })
}
