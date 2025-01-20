import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  AddReactionInput,
  addReactionMutation,
  addReactionMutation$data,
  ReactionContent,
} from './__generated__/addReactionMutation.graphql'

export function addReactionMutation({
  environment,
  input: {subject, content},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {
    subject: string
    content: ReactionContent
  }
  onError?: (error: Error) => void
  onCompleted?: (response: addReactionMutation$data) => void
}) {
  const inputHash: AddReactionInput = {
    subjectId: subject,
    content,
  }

  return commitMutation<addReactionMutation>(environment, {
    mutation: graphql`
      mutation addReactionMutation($input: AddReactionInput!) @raw_response_type {
        addReaction(input: $input) {
          subject {
            reactionGroups {
              ...ReactionButton_Reaction
            }
          }
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    optimisticUpdater: store => {
      // get the subject from the store
      const subjectRecord = store.get(subject)
      if (!subjectRecord) {
        return
      }

      // get the reaction groups array from the subject
      const reactionGroups = subjectRecord.getLinkedRecords('reactionGroups')
      if (!reactionGroups) {
        return
      }

      // find the index of reaction group with the content
      const reactionGroupIndex = reactionGroups.findIndex(r => r.getValue('content') === content)
      const reactionGroup = reactionGroups[reactionGroupIndex]

      // update the viewerHasReacted field and the total count of reactors
      if (reactionGroup) {
        reactionGroup.setValue(true, 'viewerHasReacted')

        const connectionId = `client:${subject}:reactionGroups:${reactionGroupIndex}:reactors(first:5)`
        const connection = store.get(connectionId)
        if (connection) {
          const totalCount = connection.getValue('totalCount') as number
          connection.setValue(totalCount ? totalCount + 1 : 1, 'totalCount')
        }
      }
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
