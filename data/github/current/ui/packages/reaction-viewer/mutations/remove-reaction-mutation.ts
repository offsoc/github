import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  ReactionContent,
  RemoveReactionInput,
  removeReactionMutation,
  removeReactionMutation$data,
} from './__generated__/removeReactionMutation.graphql'

export function removeReactionMutation({
  environment,
  input: {subject, content},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {subject: string; content: ReactionContent}
  onError?: (error: Error) => void
  onCompleted?: (response: removeReactionMutation$data) => void
}) {
  const inputHash: RemoveReactionInput = {
    subjectId: subject,
    content,
  }

  return commitMutation<removeReactionMutation>(environment, {
    mutation: graphql`
      mutation removeReactionMutation($input: RemoveReactionInput!) @raw_response_type {
        removeReaction(input: $input) {
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
        reactionGroup.setValue(false, 'viewerHasReacted')

        const connectionId = `client:${subject}:reactionGroups:${reactionGroupIndex}:reactors(first:5)`
        const connection = store.get(connectionId)
        if (connection) {
          const totalCount = connection.getValue('totalCount') as number
          connection.setValue(totalCount && totalCount > 0 ? totalCount - 1 : 0, 'totalCount')
        }
      }
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
