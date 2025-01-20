import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {updateTitleAndBaseBranchMutation} from './__generated__/updateTitleAndBaseBranchMutation.graphql'

export default function commitUpdateTitleAndBaseBranchMutation({
  environment,
  input: {pullRequestId, newTitle, newBaseBranch, titleChanged, baseBranchChanged},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {
    pullRequestId: string
    newTitle: string
    newBaseBranch: string | undefined
    titleChanged: boolean
    baseBranchChanged: boolean
  }
  onCompleted?: () => void
  onError?: (error: Error) => void
}) {
  return commitMutation<updateTitleAndBaseBranchMutation>(environment, {
    mutation: graphql`
      mutation updateTitleAndBaseBranchMutation(
        $id: ID!
        $newTitle: String!
        $newBaseBranch: String
        $singleCommitOid: String = null
        $diffEntryCount: Int = 5
        $diffEntryCursor: String
        $endOid: String = null
        $injectedContextLines: [DiffLineRange!]
        $inlineThreadCount: Int = 20
        $startOid: String = null
        $titleChanged: Boolean!
        $baseBranchChanged: Boolean!
        $isSingleCommit: Boolean = false
      ) @raw_response_type {
        updatePullRequest(input: {pullRequestId: $id, title: $newTitle, baseRefName: $newBaseBranch}) {
          pullRequest {
            id
            baseRefName @include(if: $baseBranchChanged)
            title @include(if: $titleChanged)
            titleHTML @include(if: $titleChanged)
            ...DiffsWithComments_pullRequest @include(if: $baseBranchChanged)
            ...FileTree_pullRequest @include(if: $baseBranchChanged)
          }
        }
      }
    `,
    variables: {
      id: pullRequestId,
      newTitle,
      newBaseBranch,
      baseBranchChanged,
      titleChanged,
    },
    optimisticUpdater: store => {
      const pullRequest = store.get(pullRequestId)
      if (!pullRequest) return

      pullRequest.setValue(newTitle, 'titleHTML')
      pullRequest.setValue(newTitle, 'title')
      if (baseBranchChanged) {
        pullRequest.setValue(newBaseBranch, 'baseRefName')
      }
    },
    onCompleted,
    onError,
  })
}
