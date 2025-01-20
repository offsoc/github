import type {GraphQLError} from '@github-ui/fetch-graphql'
import {debounce} from '@github/mini-throttle'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {LockIcon, RepoIcon, RepoLockedIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Button, Box, Text, FormControl, type Pagination} from '@primer/react'
import Pluralize from 'pluralize'
import {useCallback, useMemo, useState, useEffect} from 'react'
import type {PreloadedQuery} from 'react-relay'
import {fetchQuery, graphql, readInlineData, usePreloadedQuery, useRelayEnvironment} from 'react-relay'

import {PickerDialog} from './PickerDialog'
import {PickerHeader} from './PickerHeader'
import ResourcePaginator from './ResourcePaginator'
import {SelectedRows} from './SelectedRows'
import {Fonts, Spacing} from '../../utils'

import type {RepositoryPickerRecentQuery as RepositoryPickerQueryType} from './__generated__/RepositoryPickerRecentQuery.graphql'
import type {
  RepositoryPickerInitialQuery$data,
  RepositoryPickerInitialQuery as RepositoryPickerInitialQueryType,
} from './__generated__/RepositoryPickerInitialQuery.graphql'
import type {
  RepositoryPickerFragment$key,
  RepositoryPickerFragment$data,
} from './__generated__/RepositoryPickerFragment.graphql'

import type {Item} from '../../types/common'

type Repository = RepositoryPickerFragment$data

export const RepositoryPickerRecentQuery = graphql`
  query RepositoryPickerRecentQuery($slug: String!, $phrase: String) {
    viewer {
      enterpriseRepositories(phrase: $phrase, slug: $slug, first: 10) {
        totalCount
        nodes {
          ...RepositoryPickerFragment
        }
      }
    }
  }
`
export const RepositoryPickerFragment = graphql`
  fragment RepositoryPickerFragment on Repository @inline {
    id
    nameWithOwner
    isPrivate
    isArchived
  }
`

export const RepositoryPickerInitialQuery = graphql`
  query RepositoryPickerInitialQuery($ids: [ID!]!) {
    nodes(ids: $ids) {
      ...RepositoryPickerFragment
    }
  }
`

const pageSize = 10

const convertToItemProps = (item: Repository, viewOnly: boolean) => {
  return {
    id: item.id,
    text: item.nameWithOwner,
    leadingVisual: () => (item.isPrivate ? <LockIcon /> : <RepoIcon />),
    rowLeadingVisual: () => (item.isPrivate ? <RepoLockedIcon /> : <RepoIcon />),
    viewOnly,
  }
}

interface Props {
  initialSelectedItemIds: string[]
  preloadedRepositoriesRef: PreloadedQuery<RepositoryPickerQueryType>
  setSelectedItems: (selectedIds: string[]) => void
  slug: string
  entityType?: 'budget' | 'cost center'
  indent?: boolean
  selectionVariant?: 'multiple' | 'single'
  valid?: boolean
  // Optionally display the resource selector in view-only mode
  viewOnly?: boolean
}

export function RepositoryPicker({
  initialSelectedItemIds,
  preloadedRepositoriesRef,
  setSelectedItems,
  slug,
  entityType = 'budget',
  indent = true,
  selectionVariant,
  valid,
  viewOnly = false,
}: Props) {
  // These are the repos that are currently selected through the UI.
  const [localSelected, setLocalSelected] = useState<Array<Item<string>>>([])
  const [selectedCount, setSelectedCount] = useState<number>(initialSelectedItemIds.length)
  const [itemsLoading, setItemsLoading] = useState<boolean>(false)

  const [selectAll, setSelectAll] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const [searchResults, setSearchResults] = useState<Array<Item<string>> | undefined>()
  const [searchResultsLoading, setSearchResultsLoading] = useState<boolean>(false)
  const [searchFilter, setSearchFilter] = useState<string>('')

  const [pageCount, setPageCount] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagedItems, setPagedItems] = useState<Array<Item<string>>>([])

  const {addToast} = useToastContext()
  const environment = useRelayEnvironment()

  // Preload the user's repos via a GraphQL query
  const preloadedData = usePreloadedQuery<RepositoryPickerQueryType>(
    RepositoryPickerRecentQuery,
    preloadedRepositoriesRef,
  )
  const fetchedRepos = useMemo(() => {
    const repos = (preloadedData.viewer.enterpriseRepositories.nodes || []).flatMap(node =>
      // eslint-disable-next-line no-restricted-syntax
      node ? [readInlineData<RepositoryPickerFragment$key>(RepositoryPickerFragment, node)] : [],
    )
    return repos
  }, [preloadedData.viewer.enterpriseRepositories.nodes])
  const totalRepositoryCount = useMemo(() => {
    return preloadedData.viewer.enterpriseRepositories.totalCount || 0
  }, [preloadedData.viewer.enterpriseRepositories.totalCount])
  // Store the fetched IDs as a set for quick lookup
  const fetchedRepoIds = useMemo(() => {
    return new Set(fetchedRepos.map(repo => repo.id))
  }, [fetchedRepos])

  // Do an initial load of the repos already added to the cost center so that they can be displayed to the user.
  // Repos are either loaded or not found depending on permissions. The data we get back can contain a mix of both.
  // This happens when private repos are selected and a user without access tries to view the owning object.
  useEffect(() => {
    if (!initialSelectedItemIds.length) return

    setItemsLoading(true)

    // Keep track of repos that can't be loaded due to permissions so that we can display placeholders for them
    let unloadedRepos: Array<Item<string>> = []

    const onGraphQLSuccess = (data: RepositoryPickerInitialQuery$data) => {
      const repos = (data.nodes || []).flatMap(node =>
        // eslint-disable-next-line no-restricted-syntax
        node ? [readInlineData<RepositoryPickerFragment$key>(RepositoryPickerFragment, node)] : [],
      )
      const loadedRepoItems = repos.map(repo =>
        convertToItemProps(
          repo,
          // Show in viewOnly mode if it isn't one of the repos the user has baseline access to
          viewOnly || !fetchedRepoIds.has(repo.id),
        ),
      )
      setLocalSelected([...loadedRepoItems, ...unloadedRepos])
      setItemsLoading(false)
    }

    const onGraphQLError = () => {
      setLocalSelected(unloadedRepos)
      setItemsLoading(false)
    }

    /*
    queries have an argument limit of 100 node ids so we are batching them to fetch all repositories
    https://github.com/github/github/blob/0aeff718576cfc236cdcf082ab0bb68cbd35dca3/lib/platform/objects/query.rb#L86
    */
    const BATCH_SIZE = 100
    const chunks: string[][] = []
    for (let i = 0; i < initialSelectedItemIds.length; i += BATCH_SIZE) {
      chunks.push(initialSelectedItemIds.slice(i, i + BATCH_SIZE))
    }

    const promises = chunks.map(chunk => {
      return new Promise<RepositoryPickerInitialQuery$data>((resolve, reject) => {
        fetchQuery<RepositoryPickerInitialQueryType>(environment, RepositoryPickerInitialQuery, {
          ids: chunk,
        }).subscribe({
          next: data => {
            resolve(data)
          },
          error: (error: Error) => {
            // Get the indeces that failed to load the first time so that we can remove them and try again with the rest.
            const invalidIndeces = (error.cause as GraphQLError[]).reverse().map(e => {
              // This is always the index of the node that failed to load
              return e.path[e.path.length - 1] as number
            })

            unloadedRepos = initialSelectedItemIds
              .filter((_, idx) => invalidIndeces.includes(idx))
              .map(id => {
                return {
                  id,
                  text: 'Insufficient permission to view',
                  leadingVisual: () => <LockIcon />,
                  rowLeadingVisual: () => <RepoLockedIcon />,
                  viewOnly: true,
                }
              })

            // If there are some repos that can be loaded successfully, try to load them on their own
            const updatedInitialSelectItemIds = initialSelectedItemIds.filter((_, idx) => !invalidIndeces.includes(idx))
            if (updatedInitialSelectItemIds.length) {
              fetchQuery<RepositoryPickerInitialQueryType>(environment, RepositoryPickerInitialQuery, {
                ids: updatedInitialSelectItemIds,
              }).subscribe({
                next: onGraphQLSuccess,
                error: onGraphQLError,
              })
            } else {
              reject(error)
            }
          },
        })
      })
    })

    const loadRepositoriesData = async () => {
      try {
        const results = await Promise.all<RepositoryPickerInitialQuery$data>(promises)
        const allRepositories = {nodes: results.flatMap(r => r.nodes || [])}
        onGraphQLSuccess(allRepositories)
      } catch (error) {
        onGraphQLError()
      }
    }

    loadRepositoriesData()

    // We only want to perform this query once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update the page division when the user changes pages
  useEffect(() => {
    setPageCount(Math.ceil(localSelected.length / (1.0 * pageSize)) || 1)
    setPagedItems(localSelected.slice((currentPage - 1) * pageSize, currentPage * pageSize))
  }, [localSelected, currentPage])

  const onPageChange: Parameters<typeof Pagination>['0']['onPageChange'] = (e, page) => {
    e.preventDefault()
    setCurrentPage(page)
  }

  const items = useMemo(() => {
    if (searchResults) return searchResults
    return fetchedRepos
      .filter(repo => !repo.isArchived)
      .map(i => convertToItemProps(i, viewOnly))
      .concat(localSelected.filter(o => !fetchedRepos.find(c => c.id === o.id)))
  }, [fetchedRepos, localSelected, searchResults, viewOnly])

  const fetchSearchData = useCallback(
    (phrase: string) => {
      setSearchResultsLoading(true)
      fetchQuery<RepositoryPickerQueryType>(environment, RepositoryPickerRecentQuery, {
        phrase,
        slug,
      }).subscribe({
        next: data => {
          const repos = (data.viewer.enterpriseRepositories?.nodes || []).flatMap(node =>
            // eslint-disable-next-line no-restricted-syntax
            node ? [readInlineData<RepositoryPickerFragment$key>(RepositoryPickerFragment, node)] : [],
          )

          setSearchResults(repos.map(repo => convertToItemProps(repo, viewOnly)))
          setSearchResultsLoading(false)
        },
        error: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: 'Unable to query repositories',
            role: 'alert',
          })
          setSearchResultsLoading(false)
        },
      })
    },

    [environment, slug, viewOnly, addToast],
  )

  // TODO we can use the useDebounce once it's extracted to a shared hook
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceFetchSearchData = useCallback(
    debounce((nextValue: string) => fetchSearchData(nextValue), 200),
    [fetchSearchData],
  )

  useEffect(() => {
    if (searchFilter.length === 0) {
      setSearchResults(undefined)
      return
    }
    debounceFetchSearchData(searchFilter)
  }, [debounceFetchSearchData, searchFilter])

  const filterItems = useCallback((value: string) => {
    setSearchFilter(value)
  }, [])

  const onDialogSubmit = (newSelected: Array<Item<string>>, newSelectAll: boolean) => {
    setDialogOpen(false)
    setLocalSelected(newSelected)
    setSelectedCount(newSelected.length)
    setSelectAll(newSelectAll)
    setSelectedItems(newSelected.map(opt => opt.id))
  }

  const resetDialog = () => {
    setDialogOpen(false)
    setLocalSelected(localSelected)
    setSelectedCount(localSelected.length)
    setSelectedItems(localSelected.map(opt => opt.id))
  }

  const openDialog = () => {
    setDialogOpen(true)
    setSearchFilter('')
    setSearchResults(undefined)
  }

  const canRemoveOption = localSelected.length > 0
  const removeOption = (id: string) => {
    if (!canRemoveOption) return

    const newOptions = localSelected.filter(option => option.id !== id)
    setLocalSelected(newOptions)
    setSelectedCount(newOptions.length)
    setSelectedItems(newOptions.map(opt => opt.id))
  }

  const pickerText = selectionVariant === 'multiple' ? 'repositories' : 'repository'
  const ml = indent ? 4 : 0

  return (
    <>
      <PickerHeader title="Repositories" />
      <Box sx={{ml, textAlign: 'left'}}>
        {!viewOnly && (
          <>
            <Button onClick={openDialog} sx={{mb: Spacing.StandardPadding}} trailingAction={TriangleDownIcon}>
              Select {pickerText}
            </Button>
            <PickerDialog
              open={dialogOpen}
              resetDialog={resetDialog}
              filter={filterItems}
              selectAll={selectAll}
              selected={localSelected}
              onDialogSubmit={onDialogSubmit}
              items={items}
              totalItemsCount={totalRepositoryCount}
              pickerType={pickerText}
              loading={searchResultsLoading}
              selectionVariant={selectionVariant}
              entityType={entityType}
            />
            {valid === false && (
              <FormControl.Validation variant="error" sx={{mt: 1}}>
                Please select at least one repository
              </FormControl.Validation>
            )}
          </>
        )}
        {selectAll && (
          <Text sx={{fontSize: Fonts.FontSizeSmall}}>
            All {Pluralize('repository', totalRepositoryCount, true)} selected
          </Text>
        )}
        <SelectedRows
          loading={itemsLoading}
          removeOption={removeOption}
          selected={pagedItems}
          totalCount={selectedCount}
        />
        <ResourcePaginator
          pageSize={pageSize}
          pageCount={pageCount}
          totalResources={selectedCount}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </Box>
    </>
  )
}
