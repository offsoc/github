// disable relay unused fields rule for this whole file since we are knowingly ejecting from relay best practices and
// just using it for data fetching here.
/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {assertDataPresent} from '@github-ui/assert-data-present'
import type {Thread} from '@github-ui/conversations'
import {useCallback} from 'react'
import {fetchQuery, graphql, readInlineData, useRelayEnvironment} from 'react-relay'

import type {useFetchThread_PullRequestReviewComment$key} from './__generated__/useFetchThread_PullRequestReviewComment.graphql'
import type {useFetchThreadQuery, useFetchThreadQuery$data} from './__generated__/useFetchThreadQuery.graphql'

/**
 * This fragment is used to read the data from the store for a PullRequestReviewComment. This fragment is separate
 * from the query to give all comment fetching/updating operations a common fragment so we can add/remove fields
 * in a single location.
 */
export const PullRequestCommentFragment = graphql`
  fragment useFetchThread_PullRequestReviewComment on PullRequestReviewComment @inline {
    author {
      avatarUrl
      id
      login
      url
    }
    authorAssociation
    bodyHTML
    body
    createdAt
    currentDiffResourcePath
    databaseId
    id
    isHidden: isMinimized
    lastUserContentEdit {
      editor {
        login
        url
      }
    }
    minimizedReason
    publishedAt
    reference: pullRequest {
      number
      author {
        login
      }
    }
    repository {
      id
      isPrivate
      name
      owner {
        id
        login
        url
      }
    }
    state
    subjectType
    viewerDidAuthor
    viewerCanBlockFromOrg
    viewerCanMinimize
    viewerCanReport
    viewerCanReportToMaintainer
    viewerCanSeeMinimizeButton
    viewerCanSeeUnminimizeButton
    viewerCanUnblockFromOrg
    viewerRelationship
    stafftoolsUrl
    url
    viewerCanDelete
    viewerCanUpdate
    # eslint-disable-next-line relay/must-colocate-fragment-spreads
    ...MarkdownEditHistoryViewer_comment
    # eslint-disable-next-line relay/must-colocate-fragment-spreads
    ...ReactionViewerGroups
  }
`

const PullRequestUseFetchThreadQuery = graphql`
  query useFetchThreadQuery($threadId: ID!, $includeAssociatedDiffLines: Boolean!) {
    node(id: $threadId) {
      ... on PullRequestThread {
        id
        isOutdated
        isResolved
        viewerCanReply
        subjectType
        # For regular threads, we intend to access the difflines from the store, but if that fails, we can fallback to loading it via the API like we do for outdated threads.
        subject {
          ... on PullRequestDiffThread {
            originalStartLine @include(if: $includeAssociatedDiffLines)
            originalEndLine @include(if: $includeAssociatedDiffLines)
            startDiffSide
            endDiffSide
            startLine
            endLine
            pullRequestCommit @include(if: $includeAssociatedDiffLines) {
              commit {
                abbreviatedOid
              }
            }
            diffLines @include(if: $includeAssociatedDiffLines) {
              __id
              left
              right
              html
              text
              type
            }
          }
        }
        comments(first: 50) @connection(key: "ReviewThread_comments") {
          __id
          edges {
            node {
              ...useFetchThread_PullRequestReviewComment
            }
          }
        }
      }
    }
  }
`

export function makeThread(data: NonNullable<useFetchThreadQuery$data['node']>): Thread | undefined {
  return {
    ...data,
    commentsData: {
      ...data.comments,
      comments:
        data.comments?.edges
          ?.filter(t => !!t?.node)
          ?.map(c => {
            const node = c?.node
            assertDataPresent(node)
            const commentData = readInlineData<useFetchThread_PullRequestReviewComment$key>(
              PullRequestCommentFragment,
              node,
            )
            return {...commentData}
          }) ?? [],
    },
  } as Thread
}

export function useFetchThread() {
  const environment = useRelayEnvironment()
  return useCallback(
    (threadId: string, includeAssociatedDiffLines?: boolean) => {
      return new Promise<Thread | undefined>((resolve, reject) => {
        fetchQuery<useFetchThreadQuery>(
          environment,
          PullRequestUseFetchThreadQuery,
          {
            threadId,
            includeAssociatedDiffLines: !!includeAssociatedDiffLines,
          },
          {fetchPolicy: 'store-or-network'},
        ).subscribe({
          next: (data: useFetchThreadQuery$data) => {
            const thread = data.node ? makeThread(data.node) : undefined
            resolve(thread)
          },
          error: (error: Error) => {
            reject(error)
          },
        })
      })
    },
    [environment],
  )
}
