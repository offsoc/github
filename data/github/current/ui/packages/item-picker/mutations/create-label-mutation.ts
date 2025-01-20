import {commitMutation, graphql, type Environment} from 'react-relay'
import type {createLabelMutation$data, createLabelMutation} from './__generated__/createLabelMutation.graphql'

export function commitCreateLabelMutation({
  environment,
  input,
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {
    repositoryId: string
    color: string
    name: string
  }
  onError?: (error: Error) => void
  onCompleted?: (response: createLabelMutation$data) => void
}) {
  return commitMutation<createLabelMutation>(environment, {
    mutation: graphql`
      mutation createLabelMutation($input: CreateLabelInput!) @raw_response_type {
        createLabel(input: $input) {
          label {
            id
            name
            nameHTML
            color
            description
            url
          }
        }
      }
    `,
    variables: {input},
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
