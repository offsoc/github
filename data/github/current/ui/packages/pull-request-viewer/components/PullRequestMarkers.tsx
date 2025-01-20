import type {NavigationThread} from '@github-ui/conversations'
import {memo, startTransition, useEffect} from 'react'
import {
  ConnectionHandler,
  graphql,
  type PreloadedQuery,
  readInlineData,
  useFragment,
  usePreloadedQuery,
  useQueryLoader,
} from 'react-relay'

import {useSelectedRefContext} from '../contexts/SelectedRefContext'
import {filterValidAnnotations, groupAnnotationsByPath} from '../helpers/annotation-helpers'
import {notEmpty} from '../helpers/not-empty'
import type {
  PullRequestMarkers_pullRequest$data,
  PullRequestMarkers_pullRequest$key,
} from './__generated__/PullRequestMarkers_pullRequest.graphql'
import type {PullRequestMarkers_pullRequestThread$key} from './__generated__/PullRequestMarkers_pullRequestThread.graphql'
import type {PullRequestMarkersAnnotations_pullRequest$key} from './__generated__/PullRequestMarkersAnnotations_pullRequest.graphql'
import type {PullRequestMarkersCommentSidesheetQuery as PullRequestMarkersCommentSidesheetQueryType} from './__generated__/PullRequestMarkersCommentSidesheetQuery.graphql'
import type {MarkersState} from './DiffsWithComments'

type PullRequestMarkersProps = {
  repoName: string
  repoOwner: string
  number: number
}

type PullRequestMarkersCommonProps = {
  onMarkerDataLoaded: (data: MarkersState) => void
}

export const PullRequestMarkersCommentSidesheetQuery = graphql`
  query PullRequestMarkersCommentSidesheetQuery(
    $owner: String!
    $repo: String!
    $number: Int!
    $startOid: String
    $endOid: String
    $singleCommitOid: String
  ) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...CommentsSidesheet_pullRequest
        ...PullRequestMarkers_pullRequest
      }
    }
    viewer {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...CommentsSidesheet_viewer
    }
  }
`

export const PullRequestMarkersLoader = memo(function PullRequestMarkersLoader({
  repoOwner: owner,
  repoName: name,
  number,
  ...rest
}: PullRequestMarkersProps & PullRequestMarkersCommonProps) {
  const [queryReference, loadQuery] = useQueryLoader<PullRequestMarkersCommentSidesheetQueryType>(
    PullRequestMarkersCommentSidesheetQuery,
  )

  const {startOid, endOid, isSingleCommit} = useSelectedRefContext()
  useEffect(() => {
    const queryArgs = isSingleCommit
      ? {owner, repo: name, number, singleCommitOid: endOid}
      : {owner, repo: name, number, startOid, endOid}
    startTransition(() => {
      loadQuery(queryArgs, {fetchPolicy: 'store-or-network'})
    })
  }, [loadQuery, owner, name, number, isSingleCommit, endOid, startOid])

  if (!queryReference) return null

  return <PullRequestThreadNavWrapper queryReference={queryReference} {...rest} />
})

function PullRequestThreadNavWrapper({
  queryReference,
  ...rest
}: {
  queryReference: PreloadedQuery<PullRequestMarkersCommentSidesheetQueryType>
} & PullRequestMarkersCommonProps) {
  const data = usePreloadedQuery<PullRequestMarkersCommentSidesheetQueryType>(
    PullRequestMarkersCommentSidesheetQuery,
    queryReference,
  )

  if (!data.repository?.pullRequest) return null
  return <PullRequestThreadNav pullRequest={data.repository.pullRequest} {...rest} />
}

export const PullRequestAnnotationsFragment = graphql`
  fragment PullRequestMarkersAnnotations_pullRequest on PullRequest @inline {
    # eslint-disable-next-line relay/unused-fields
    comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
      annotations(last: 100) {
        edges {
          node {
            __id
            annotationLevel
            checkRun {
              checkSuite {
                app {
                  logoUrl
                  name
                }
                name
              }
              detailsUrl
              name
            }
            databaseId
            location {
              end {
                line
              }
              start {
                line
              }
            }
            message
            path
            pathDigest
            rawDetails
            title
          }
        }
      }
    }
  }
`

/**
 * Shared fragment for the PullRequestMarkers data, used to populate the navigation context
 */
const PullRequestThreadNavFragment = graphql`
  fragment PullRequestMarkers_pullRequestThread on PullRequestThread @inline {
    id
    isResolved
    pathDigest
    path
    line
    firstComment: comments(first: 1) {
      edges {
        node {
          databaseId
        }
      }
    }
  }
`

/**
 * Get the connection ID for the `PullRequestMarkers_allThreads` thread connection
 * The filters should be kept in sync with the arguments used in the `PullRequestMarkers_pullRequest` fragment
 *
 * @param pullRequestId The ID of the pull request
 * @returns The connection ID
 */
export function threadNavigationConnectionId(pullRequestId: string): string {
  return `${ConnectionHandler.getConnectionID(pullRequestId, `PullRequestMarkers_allThreads`, {
    isPositioned: false,
    orderBy: 'DIFF_POSITION',
  })}`
}

function PullRequestThreadNav({
  pullRequest,
  onMarkerDataLoaded,
}: {
  pullRequest: PullRequestMarkers_pullRequest$key
} & PullRequestMarkersCommonProps) {
  const data = useFragment(
    graphql`
      fragment PullRequestMarkers_pullRequest on PullRequest {
        allThreads: threads(first: 50, isPositioned: false, orderBy: DIFF_POSITION)
          @connection(key: "PullRequestMarkers_allThreads") {
          edges {
            node {
              ...PullRequestMarkers_pullRequestThread
            }
          }
        }
        ...PullRequestMarkersAnnotations_pullRequest
      }
    `,
    pullRequest,
  )

  useEffect(() => {
    if (data) {
      const navigationThreads = flattenThreadsForNavigation(data.allThreads.edges)
      const diffAnnotations = filterValidAnnotations(
        // eslint-disable-next-line no-restricted-syntax
        readInlineData<PullRequestMarkersAnnotations_pullRequest$key>(PullRequestAnnotationsFragment, data),
      )
      const mappedAnnotations = groupAnnotationsByPath(diffAnnotations)
      onMarkerDataLoaded({navigationThreads, diffAnnotations, annotationMap: mappedAnnotations})
    }
  }, [data, onMarkerDataLoaded])

  return null
}

export function flattenThreadsForNavigation(
  threadEdges: PullRequestMarkers_pullRequest$data['allThreads']['edges'],
): NavigationThread[] {
  if (!threadEdges) return []

  return threadEdges
    .map(edge => {
      if (!edge?.node) return null
      // Read the inline data because it's not rendered but used to populate the navigation context
      // eslint-disable-next-line no-restricted-syntax
      const node = readInlineData<PullRequestMarkers_pullRequestThread$key>(PullRequestThreadNavFragment, edge.node)

      return {
        id: node.id,
        isResolved: node.isResolved,
        pathDigest: node.pathDigest,
        firstReviewCommentId: node.firstComment?.edges?.[0]?.node?.databaseId,
        line: node.line,
        path: node.path,
      }
    })
    .filter(notEmpty)
}
