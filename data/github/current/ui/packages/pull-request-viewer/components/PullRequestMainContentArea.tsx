import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {Suspense, useEffect, useState} from 'react'
import type {PreloadedQuery} from 'react-relay'
import {graphql, usePreloadedQuery} from 'react-relay'

import {FilteredFilesContextProvider} from '../contexts/FilteredFilesContext'
import {NavigationPaneContextProvider} from '../contexts/NavigationPaneContext'
import {SelectedRefContextProvider} from '../contexts/SelectedRefContext'
import type {PullRequestMainContentAreaQuery} from './__generated__/PullRequestMainContentAreaQuery.graphql'
import {Navigation} from './Navigation'

export const PullRequestMainContentAreaGraphQLQuery = graphql`
  query PullRequestMainContentAreaQuery(
    $number: Int!
    $owner: String!
    $repo: String!
    $singleCommitOid: String
    $startOid: String
    $endOid: String
  ) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        ...Navigation_pullRequest
        comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
          oldCommit {
            oid
          }
        }
      }
    }
  }
`

/**
 * Renders the navigation and wraps the body content for the pull request page
 *
 * @param queryRef - the preloaded main content area query for the pull request
 * @param body - a component that renders the variable body for the pull request page
 */
export function PullRequestMainContentArea({
  queryRef,
  body,
  showFileTree,
}: {
  queryRef: PreloadedQuery<PullRequestMainContentAreaQuery>
  body: JSX.Element
  showFileTree: boolean
}) {
  const [baseRefOid, setBaseRefOid] = useState<string>()
  const fallbackComponent = <Navigation pullRequest={null} showFileTree={showFileTree} />
  return (
    <FilteredFilesContextProvider>
      <NavigationPaneContextProvider>
        <SelectedRefContextProvider baseRefOid={baseRefOid} path={ssrSafeLocation.pathname}>
          <ErrorBoundary fallback={fallbackComponent}>
            <Suspense fallback={fallbackComponent}>
              <NavigationWrapper queryRef={queryRef} setBaseRefOid={setBaseRefOid} showFileTree={showFileTree} />
            </Suspense>
          </ErrorBoundary>
          {body}
        </SelectedRefContextProvider>
      </NavigationPaneContextProvider>
    </FilteredFilesContextProvider>
  )
}

interface NavigationWrapperProps {
  queryRef: PreloadedQuery<PullRequestMainContentAreaQuery>
  setBaseRefOid: (baseRefOid: string | undefined) => void
  showFileTree: boolean
}

function NavigationWrapper({queryRef, setBaseRefOid, ...props}: NavigationWrapperProps) {
  const data = usePreloadedQuery(PullRequestMainContentAreaGraphQLQuery, queryRef)
  const baseRefOid = data.repository?.pullRequest?.comparison?.oldCommit.oid as string | undefined

  useEffect(() => {
    setBaseRefOid(baseRefOid)
  }, [baseRefOid, setBaseRefOid])

  return <Navigation pullRequest={data.repository?.pullRequest ?? null} {...props} />
}
