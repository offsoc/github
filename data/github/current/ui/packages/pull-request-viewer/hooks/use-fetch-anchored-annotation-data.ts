import {useCallback} from 'react'
import {fetchQuery, graphql, useRelayEnvironment} from 'react-relay'

import {notEmpty} from '../helpers/not-empty'
import type {
  useFetchAnchoredAnnotationData_AnchoredAnnotationQuery,
  useFetchAnchoredAnnotationData_AnchoredAnnotationQuery$data,
} from './__generated__/useFetchAnchoredAnnotationData_AnchoredAnnotationQuery.graphql'
import {useRouteInfo} from './use-route-info'

const AnchoredAnnotationGraphqlQuery = graphql`
  query useFetchAnchoredAnnotationData_AnchoredAnnotationQuery($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        headCommit {
          commit {
            checkSuites(last: 100) {
              edges {
                node {
                  checkRuns(filterBy: {checkType: LATEST}, last: 100) {
                    edges {
                      node {
                        annotations(last: 100) {
                          edges {
                            node {
                              databaseId
                              __id
                              pathDigest
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

type AnnotationData = {
  id: string
  databaseId: number | null | undefined
  pathDigest: string
}

/**
 * This hook returns a function that, given an annotation id, will return data necessary for scrolling and focusing
 * an anchored annotation.
 * Intended to be passed as a prop to the `PullRequestMarkersDialogContextProvider`.
 */

export function useFetchAnchoredAnnotationData(): (annotationId: number) => Promise<AnnotationData | undefined> {
  const environment = useRelayEnvironment()
  const itemIdentifier = useRouteInfo()
  return useCallback(
    (annotationId: number) => {
      return new Promise<AnnotationData | undefined>((resolve, reject) => {
        if (!itemIdentifier) {
          resolve(undefined)
          return
        }

        const {repo, owner, number} = itemIdentifier
        fetchQuery<useFetchAnchoredAnnotationData_AnchoredAnnotationQuery>(
          environment,
          AnchoredAnnotationGraphqlQuery,
          {owner, repo, number},
          {fetchPolicy: 'store-or-network'},
        ).subscribe({
          next: (data: useFetchAnchoredAnnotationData_AnchoredAnnotationQuery$data) => {
            const annotations: AnnotationData[] = (
              data.repository?.pullRequest?.headCommit?.commit?.checkSuites?.edges ?? []
            )
              .map(edge => edge?.node)
              .filter(notEmpty)
              .flatMap(checkSuite => {
                return (checkSuite.checkRuns?.edges ?? [])
                  .map(edge => edge?.node)
                  .filter(notEmpty)
                  .flatMap(checkRun => {
                    return (checkRun.annotations?.edges ?? [])
                      .map(edge => edge?.node)
                      .filter(notEmpty)
                      .flatMap(annotationNode => {
                        return {
                          id: annotationNode.__id,
                          databaseId: annotationNode.databaseId,
                          pathDigest: annotationNode.pathDigest,
                        }
                      })
                  })
              })

            const annotation = annotations.find(ann => ann.databaseId === annotationId)
            if (!annotation) {
              resolve(undefined)
              return
            }

            resolve(annotation)
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
