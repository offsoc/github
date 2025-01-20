import {useMergeMethodContext} from '../contexts/MergeMethodContext'
import {graphql, useQueryLoader} from 'react-relay'
import {usePreviousValue} from '@github-ui/use-previous-value'

import type {useLoadMergeBoxQuery} from './__generated__/useLoadMergeBoxQuery.graphql'
import {startTransition, useEffect} from 'react'

export const MergeBoxFragment = graphql`
  fragment useLoadMergeBoxQuery_pullRequest on PullRequest @inline {
    # eslint-disable-next-line relay/unused-fields
    autoMergeRequest {
      mergeMethod
    }
    # eslint-disable-next-line relay/unused-fields
    baseRefName
    # eslint-disable-next-line relay/unused-fields
    commits {
      totalCount
    }
    # eslint-disable-next-line relay/unused-fields
    headRefOid
    # eslint-disable-next-line relay/unused-fields
    headRefName
    # eslint-disable-next-line relay/unused-fields
    headRepository {
      owner {
        login
      }
      name
    }
    # eslint-disable-next-line relay/unused-fields
    id
    # eslint-disable-next-line relay/unused-fields
    isDraft
    # eslint-disable-next-line relay/unused-fields
    isInMergeQueue
    # eslint-disable-next-line relay/unused-fields
    latestOpinionatedReviews(first: 100) {
      edges {
        node {
          authorCanPushToRepository
          author {
            login
            avatarUrl
            name
            url
          }
          onBehalfOf(first: 10) {
            edges {
              node {
                name
              }
            }
          }
          state
        }
      }
    }
    # eslint-disable-next-line relay/unused-fields
    mergeQueueEntry {
      position
      state
    }
    # eslint-disable-next-line relay/unused-fields
    mergeQueue {
      url
    }
    # eslint-disable-next-line relay/unused-fields
    mergeRequirements(mergeMethod: $mergeMethod) {
      commitAuthor
      commitMessageBody
      commitMessageHeadline
      state
      conditions {
        __typename
        message
        result
        ... on PullRequestRulesCondition {
          ruleRollups {
            message
            ruleType
            result
            ... on PullRequestRuleRollup {
              failureReasons
              requiredReviewers
              requiresCodeowners
            }
          }
        }
        ... on PullRequestMergeConflictStateCondition {
          __typename
          conflicts
          isConflictResolvableInWeb
          result
        }
      }
    }
    # eslint-disable-next-line relay/unused-fields
    mergeStateStatus
    # eslint-disable-next-line relay/unused-fields
    resourcePath
    # eslint-disable-next-line relay/unused-fields
    state
    # eslint-disable-next-line relay/unused-fields
    viewerCanAddAndRemoveFromMergeQueue
    # eslint-disable-next-line relay/unused-fields
    viewerCanDeleteHeadRef
    # eslint-disable-next-line relay/unused-fields
    viewerCanDisableAutoMerge
    # eslint-disable-next-line relay/unused-fields
    viewerCanEnableAutoMerge
    # eslint-disable-next-line relay/unused-fields
    viewerCanRestoreHeadRef
    # eslint-disable-next-line relay/unused-fields
    viewerCanUpdate
    # eslint-disable-next-line relay/unused-fields
    viewerCanUpdateBranch
    # eslint-disable-next-line relay/unused-fields
    viewerDidAuthor
    # eslint-disable-next-line relay/unused-fields
    viewerMergeActions {
      name
      isAllowable
      # eslint-disable-next-line relay/unused-fields
      mergeMethods {
        name
        isAllowable
        isAllowableWithBypass
      }
    }
    # eslint-disable-next-line relay/unused-fields
    stateChannel: updatesChannel(name: STATE)
    # eslint-disable-next-line relay/unused-fields
    deployedChannel: updatesChannel(name: DEPLOYED)
    # eslint-disable-next-line relay/unused-fields
    reviewStateChannel: updatesChannel(name: REVIEW_STATE)
    # eslint-disable-next-line relay/unused-fields
    workflowsChannel: updatesChannel(name: WORKFLOWS)
    # eslint-disable-next-line relay/unused-fields
    mergeQueueChannel: updatesChannel(name: MERGE_QUEUE)
    # eslint-disable-next-line relay/unused-fields
    headRefChannel: updatesChannel(name: HEAD_REF)
    # eslint-disable-next-line relay/unused-fields
    baseRefChannel: updatesChannel(name: BASE_REF)
    # eslint-disable-next-line relay/unused-fields
    commitHeadShaChannel: updatesChannel(name: COMMIT_HEAD_SHA)
    # eslint-disable-next-line relay/unused-fields
    gitMergeStateChannel: updatesChannel(name: GIT_MERGE_STATE)
  }
`

export const LoadMergeBoxQuery = graphql`
  query useLoadMergeBoxQuery($id: ID!, $mergeMethod: PullRequestMergeMethod) {
    pullRequest: node(id: $id) {
      ... on PullRequest {
        ...useLoadMergeBoxQuery_pullRequest
      }
    }
    # eslint-disable-next-line relay/unused-fields
    viewer {
      # eslint-disable-next-line relay/unused-fields
      login
    }
  }
`

export function useLoadMergeBoxQuery({pullRequestId}: {pullRequestId: string}) {
  const {mergeMethod} = useMergeMethodContext()
  const previousMergeMethod = usePreviousValue(mergeMethod)

  const [query, loadQuery] = useQueryLoader<useLoadMergeBoxQuery>(LoadMergeBoxQuery)

  useEffect(() => {
    startTransition(() =>
      loadQuery(
        {mergeMethod, id: pullRequestId},
        {
          fetchPolicy:
            !!previousMergeMethod && previousMergeMethod !== mergeMethod ? 'network-only' : 'store-or-network',
        },
      ),
    )
  }, [loadQuery, mergeMethod, previousMergeMethod, pullRequestId])

  return {query, loadQuery}
}
