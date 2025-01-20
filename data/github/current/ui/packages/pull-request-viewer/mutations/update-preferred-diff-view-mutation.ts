import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {updatePreferredDiffViewMutation as updatePreferredDiffViewMutationType} from './__generated__/updatePreferredDiffViewMutation.graphql'

export default function updatePreferredDiffViewMutation(
  environment: Environment,
  {viewerId, newDiffView}: {viewerId: string; newDiffView: string},
) {
  return commitMutation<updatePreferredDiffViewMutationType>(environment, {
    mutation: graphql`
      mutation updatePreferredDiffViewMutation($preferredDiffView: String!) @raw_response_type {
        updatePreferredDiffView(input: {preferredDiffView: $preferredDiffView}) {
          user {
            pullRequestUserPreferences {
              diffView
            }
          }
        }
      }
    `,
    variables: {preferredDiffView: newDiffView},
    optimisticResponse: {
      updatePreferredDiffView: {
        user: {
          id: viewerId,
          pullRequestUserPreferences: {
            diffView: newDiffView,
          },
        },
      },
    },
  })
}
