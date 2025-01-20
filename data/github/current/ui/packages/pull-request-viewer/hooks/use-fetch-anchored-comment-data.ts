import {useCallback} from 'react'
import {fetchQuery, graphql, useRelayEnvironment} from 'react-relay'

import type {
  useFetchAnchoredCommentData_AnchoredCommentQuery,
  useFetchAnchoredCommentData_AnchoredCommentQuery$data,
} from './__generated__/useFetchAnchoredCommentData_AnchoredCommentQuery.graphql'
import {useRouteInfo} from './use-route-info'

const AnchoredCommentGraphqlQuery = graphql`
  query useFetchAnchoredCommentData_AnchoredCommentQuery(
    $owner: String!
    $repo: String!
    $number: Int!
    $commentId: Int!
  ) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        reviewComment(databaseId: $commentId) {
          pullRequestThread {
            id
            pathDigest
          }
        }
      }
    }
  }
`

export interface CommentData {
  /**
   * Relay id of the thread that the comment is a part of
   */
  threadId: string
  /**
   * Path digest of the file that the comment is in
   */
  threadPathDigest: string
}

/**
 * This hooks returns a function that, given a comment id, will return data necessary for scrolling and focusing
 * an anchored comment.
 * Intended to be passed as a prop to the `AnchoredCommentContextProvider`.
 */
export function useFetchAnchoredCommentData(): (commentId: number) => Promise<CommentData | undefined> {
  const environment = useRelayEnvironment()
  const itemIdentifier = useRouteInfo()
  return useCallback(
    (commentId: number) => {
      return new Promise<CommentData | undefined>((resolve, reject) => {
        if (!itemIdentifier) {
          resolve(undefined)
          return
        }

        const {repo, owner, number} = itemIdentifier
        fetchQuery<useFetchAnchoredCommentData_AnchoredCommentQuery>(
          environment,
          AnchoredCommentGraphqlQuery,
          {owner, repo, number, commentId},
          {fetchPolicy: 'store-or-network'},
        ).subscribe({
          next: (data: useFetchAnchoredCommentData_AnchoredCommentQuery$data) => {
            const thread = data.repository?.pullRequest?.reviewComment?.pullRequestThread
            const threadPathDigest = thread?.pathDigest
            const threadId = thread?.id
            if (!threadPathDigest || !threadId) {
              resolve(undefined)
              return
            }

            resolve({
              threadId,
              threadPathDigest,
            })
          },
          error: (error: Error) => {
            reject(error)
          },
        })
      })
    },
    [environment, itemIdentifier],
  )
}
