import {FileFilterLoading, FileFilterShared} from '@github-ui/diff-file-tree/file-filter'
import {ActionList} from '@primer/react'
import {Suspense, useEffect, useMemo} from 'react'
import {graphql, useLazyLoadQuery} from 'react-relay'

import {useFilteredFilesContext} from '../../contexts/FilteredFilesContext'
import {useSelectedRefContext} from '../../contexts/SelectedRefContext'
import {getFileExtension} from '../../helpers/get-file-extension'
import {useRouteInfo} from '../../hooks/use-route-info'
import type {ItemIdentifier} from '../../types/pull-request'
import type {FileFilterQuery} from './__generated__/FileFilterQuery.graphql'

export function FileFilter() {
  const itemIdentifier = useRouteInfo()

  if (!itemIdentifier) {
    return null
  }

  return (
    <Suspense fallback={<FileFilterLoading />}>
      <FileFilterWithQuery routeInfo={itemIdentifier} />
    </Suspense>
  )
}

/**
 * Component managing filtering of files in a pull request
 */
export function FileFilterWithQuery({routeInfo}: {routeInfo: ItemIdentifier}) {
  const {startOid, endOid, isSingleCommit} = useSelectedRefContext()
  const {filterText, setFilterText, fileExtensions, state, setFilterData, setFilterState} = useFilteredFilesContext()
  const queryArgs = isSingleCommit
    ? {
        singleCommitOid: endOid,
      }
    : {startOid, endOid}

  const data = useLazyLoadQuery<FileFilterQuery>(
    graphql`
      query FileFilterQuery(
        $owner: String!
        $repo: String!
        $number: Int!
        $startOid: String
        $endOid: String
        $singleCommitOid: String
      ) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $number) {
            comparison(endOid: $endOid, startOid: $startOid, singleCommitOid: $singleCommitOid) {
              summary {
                path
                pathDigest
                pathOwnership {
                  isOwnedByViewer
                }
                viewerViewedState
              }
            }
          }
        }
      }
    `,
    {...routeInfo, ...queryArgs},
  )

  const comparison = data.repository?.pullRequest?.comparison

  const filterData = useMemo(() => {
    const fileEdges = comparison?.summary ?? []
    const files = fileEdges.map(patch => ({
      isOwnedByViewer: patch?.pathOwnership.isOwnedByViewer,
      pathDigest: patch?.pathDigest,
      viewed: patch?.viewerViewedState === 'VIEWED',
      newPath: patch.path,
    }))

    const comparisonSummary = comparison?.summary ?? []
    const newFileExtensions = comparisonSummary.map(summary => getFileExtension(summary.path))

    return {
      files,
      fileExtensions: newFileExtensions,
    }
  }, [comparison])

  useEffect(() => {
    setFilterData?.(filterData)
  }, [filterData, setFilterData])

  const setShowViewed = (shouldShowViewed: boolean) => {
    const action = shouldShowViewed ? 'selectViewed' : 'unselectViewed'
    setFilterState?.({type: action})
  }
  const setShowOnlyFilesCodeownedByUser = (showOnlyFilesCodeownedByUser: boolean) => {
    const action = showOnlyFilesCodeownedByUser ? 'selectCodeownersOwnedOnly' : 'unselectCodeownersOwnedOnly'
    setFilterState?.({type: action})
  }

  return (
    <FileFilterShared
      fileExtensions={fileExtensions}
      filterText={filterText}
      unselectedFileExtensions={state?.unselectedFileExtensions}
      onFilterChange={(action, payload) => setFilterState?.({type: action, payload})}
      // eslint-disable-next-line react/jsx-sort-props
      onFilterTextChange={setFilterText}
      additionalFilterGroups={
        <>
          <ActionList.Divider />
          <ActionList.Group selectionVariant="single">
            <ActionList.Item selected={state?.showViewed} onSelect={() => setShowViewed(!state?.showViewed)}>
              Show viewed
            </ActionList.Item>
            <ActionList.Divider />
          </ActionList.Group>
          <ActionList.Group selectionVariant="single">
            <ActionList.Item
              selected={state?.showOnlyFilesCodeownedByUser}
              onSelect={() => {
                setShowOnlyFilesCodeownedByUser(!state?.showOnlyFilesCodeownedByUser)
              }}
            >
              Only files owned by you
            </ActionList.Item>
          </ActionList.Group>
        </>
      }
    />
  )
}
