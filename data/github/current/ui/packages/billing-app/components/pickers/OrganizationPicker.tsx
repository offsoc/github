import {debounce} from '@github/mini-throttle'
import {GitHubAvatar} from '@github-ui/github-avatar'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {TriangleDownIcon} from '@primer/octicons-react'
import type {Pagination} from '@primer/react'
import {Button, Box, Text, FormControl} from '@primer/react'
import Pluralize from 'pluralize'
import {useCallback, useMemo, useState, useEffect} from 'react'
import type {PreloadedQuery} from 'react-relay'
import {fetchQuery, graphql, readInlineData, usePreloadedQuery, useRelayEnvironment} from 'react-relay'

import {Fonts, Spacing} from '../../utils'
import ResourcePaginator from './ResourcePaginator'
import {SelectedRows} from './SelectedRows'
import {PickerDialog} from './PickerDialog'

import type {OrganizationPickerRecentQuery as OrganizationPickerQueryType} from './__generated__/OrganizationPickerRecentQuery.graphql'
import type {OrganizationPickerInitialQuery as OrganizationPickerInitialQueryType} from './__generated__/OrganizationPickerInitialQuery.graphql'
import type {
  OrganizationPickerFragment$key,
  OrganizationPickerFragment$data,
} from './__generated__/OrganizationPickerFragment.graphql'

import type {Item} from '../../types/common'
import {PickerHeader} from './PickerHeader'

type Organization = OrganizationPickerFragment$data

export const OrganizationPickerRecentQuery = graphql`
  query OrganizationPickerRecentQuery($slug: String!, $query: String) {
    enterprise(slug: $slug) {
      organizations(first: 50, query: $query, orderBy: {field: CREATED_AT, direction: DESC}) {
        totalCount
        nodes {
          ...OrganizationPickerFragment
        }
      }
    }
  }
`

export const OrganizationPickerFragment = graphql`
  fragment OrganizationPickerFragment on Organization @inline {
    id
    login
    avatarUrl
  }
`

export const OrganizationPickerInitialQuery = graphql`
  query OrganizationPickerInitialQuery($ids: [ID!]!) {
    nodes(ids: $ids) {
      ...OrganizationPickerFragment
    }
  }
`

const pageSize = 10

interface Props {
  initialSelectedItemIds: string[]
  preloadedOrganizationsRef: PreloadedQuery<OrganizationPickerQueryType>
  slug: string
  setSelectedItems: (selectedIds: string[]) => void
  entityType?: 'budget' | 'cost center'
  indent?: boolean
  selectionVariant?: 'multiple' | 'single'
  valid?: boolean
  // Optionally display the picker in view-only mode
  viewOnly?: boolean
}

export function OrganizationPicker({
  initialSelectedItemIds,
  slug,
  preloadedOrganizationsRef,
  setSelectedItems,
  entityType = 'budget',
  indent = true,
  selectionVariant,
  valid,
  viewOnly = false,
}: Props) {
  const [localSelected, setLocalSelected] = useState<Array<Item<string>>>([])
  const [selectedCount, setSelectedCount] = useState<number>(initialSelectedItemIds.length)
  const [itemsLoading, setItemsLoading] = useState<boolean>(false)

  const [selectAll, setSelectAll] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [searchResults, setSearchResults] = useState<Array<Item<string>> | undefined>(undefined)
  const [searchResultsLoading, setSearchResultsLoading] = useState<boolean>(false)
  const [searchFilter, setSearchFilter] = useState<string>('')

  const [pageCount, setPageCount] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagedItems, setPagedItems] = useState<Array<Item<string>>>([])

  const {addToast} = useToastContext()
  const environment = useRelayEnvironment()

  const convertToItemProps = (item: Organization) => {
    return {
      id: item.id,
      text: item.login,
      leadingVisual: () => <GitHubAvatar square src={item.avatarUrl} alt="Organizations login" />,
      rowLeadingVisual: () => <GitHubAvatar square src={item.avatarUrl} alt="Organizations login" />,
      viewOnly,
    }
  }

  // Update the page division when the user changes pages
  useEffect(() => {
    setPageCount(Math.ceil(localSelected.length / (1.0 * pageSize)) || 1)
    setPagedItems(localSelected.slice((currentPage - 1) * pageSize, currentPage * pageSize))
  }, [localSelected, currentPage])

  const onPageChange: Parameters<typeof Pagination>['0']['onPageChange'] = (e, page) => {
    e.preventDefault()
    setCurrentPage(page)
  }

  const preloadedOrganizations = usePreloadedQuery<OrganizationPickerQueryType>(
    OrganizationPickerRecentQuery,
    preloadedOrganizationsRef,
  )
  const totalOrganizationCount = preloadedOrganizations.enterprise?.organizations.totalCount || 0
  const fetchedOrgs = useMemo(() => {
    const nodes = (preloadedOrganizations.enterprise?.organizations.nodes || []).flatMap(node =>
      // eslint-disable-next-line no-restricted-syntax
      node ? [readInlineData<OrganizationPickerFragment$key>(OrganizationPickerFragment, node)] : [],
    )
    return nodes
  }, [preloadedOrganizations.enterprise?.organizations.nodes])

  useEffect(() => {
    if (!initialSelectedItemIds.length) return

    setItemsLoading(true)

    /*
    queries have an argument limit of 100 node ids so we are batching them to fetch all organizations
    https://github.com/github/github/blob/0aeff718576cfc236cdcf082ab0bb68cbd35dca3/lib/platform/objects/query.rb#L86
    */
    const BATCH_SIZE = 100
    const chunks: string[][] = []
    for (let i = 0; i < initialSelectedItemIds.length; i += BATCH_SIZE) {
      chunks.push(initialSelectedItemIds.slice(i, i + BATCH_SIZE))
    }

    const promises = chunks.map(chunk => {
      return new Promise<Array<Item<string>>>((resolve, reject) => {
        fetchQuery<OrganizationPickerInitialQueryType>(environment, OrganizationPickerInitialQuery, {
          ids: chunk,
        }).subscribe({
          next: data => {
            const nodes = (data.nodes || []).flatMap(node =>
              // eslint-disable-next-line no-restricted-syntax
              node ? [readInlineData<OrganizationPickerFragment$key>(OrganizationPickerFragment, node)] : [],
            )
            const organizations = nodes.map(n => convertToItemProps(n))
            resolve(organizations)
          },
          error: (err: Error) => {
            reject(err)
          },
        })
      })
    })

    const loadOrganizationsData = async () => {
      try {
        const results = await Promise.all<Array<Item<string>>>(promises)
        const allOrganizations = results.flat()
        setLocalSelected(allOrganizations)
        setPageCount(Math.ceil(allOrganizations.length / (1.0 * pageSize)) || 1)
        setPagedItems(allOrganizations.slice((currentPage - 1) * pageSize, currentPage * pageSize))
        setItemsLoading(false)
      } catch (error) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Unable to load organizations',
        })
        setItemsLoading(false)
      }
    }

    loadOrganizationsData()

    // We only want to run this effect when first loading for an edit page.
    // currentPage will only change in the viewOnly mode so this effect will still run only once in edit mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const items = useMemo(() => {
    if (searchResults) return searchResults
    return fetchedOrgs
      .map(i => convertToItemProps(i))
      .concat(localSelected.filter(o => !fetchedOrgs.find(c => c.id === o.id)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedOrgs, localSelected, searchResults])

  const fetchSearchData = useCallback(
    (query: string) => {
      setSearchResultsLoading(true)
      fetchQuery<OrganizationPickerQueryType>(environment, OrganizationPickerRecentQuery, {
        query,
        slug,
      }).subscribe({
        next: data => {
          const nodes = (data.enterprise?.organizations.nodes || []).flatMap(node =>
            // eslint-disable-next-line no-restricted-syntax
            node ? [readInlineData<OrganizationPickerFragment$key>(OrganizationPickerFragment, node)] : [],
          )
          setSearchResults(nodes.map(n => convertToItemProps(n)))
          setSearchResultsLoading(false)
        },
        error: () => {
          setSearchResultsLoading(false)
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: 'Unable to query organizations',
            role: 'alert',
          })
        },
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addToast, slug, environment],
  )

  // TODO we can use the useDebounce once it's extracted to a shared hook
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceFetchSearchData = useCallback(
    debounce((nextValue: string) => fetchSearchData(nextValue), 200),
    [fetchSearchData],
  )

  const filterItems = useCallback(
    (value: string) => {
      const trimmedFilter = value.trim()
      if (searchFilter !== trimmedFilter) {
        debounceFetchSearchData(trimmedFilter)
      }
      setSearchFilter(value)
    },
    [debounceFetchSearchData, searchFilter],
  )

  const onDialogSubmit = (newSelected: Array<Item<string>>, newSelectAll: boolean) => {
    setOpen(false)
    setLocalSelected(newSelected)
    setSelectedCount(newSelected.length)
    setSelectAll(newSelectAll)
    setSelectedItems(newSelected.map(item => item.id))
  }

  const resetDialog = () => {
    setOpen(false)
    setLocalSelected(localSelected)
    setSelectedCount(localSelected.length)
    setSelectedItems(localSelected.map(item => item.id))
  }

  const openDialog = () => {
    setOpen(true)
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

  const pickerText = selectionVariant === 'multiple' ? 'organizations' : 'organization'
  const ml = indent ? 4 : 0

  return (
    <>
      <PickerHeader title="Organizations" />
      <Box sx={{ml, textAlign: 'left'}}>
        {!viewOnly && (
          <>
            <Button
              data-testid="open-org-picker-dialog-button"
              onClick={openDialog}
              sx={{mb: Spacing.StandardPadding}}
              trailingAction={TriangleDownIcon}
            >
              Select {pickerText}
            </Button>
            <PickerDialog
              open={open}
              resetDialog={resetDialog}
              filter={filterItems}
              selectAll={selectAll}
              selected={localSelected}
              onDialogSubmit={onDialogSubmit}
              items={items}
              totalItemsCount={totalOrganizationCount}
              pickerType={pickerText}
              loading={searchResultsLoading}
              selectionVariant={selectionVariant}
              entityType={entityType}
            />
            {valid === false && (
              <FormControl.Validation variant="error" sx={{mt: 1}}>
                Please select at least one organization
              </FormControl.Validation>
            )}
          </>
        )}
        {selectAll && (
          <Text sx={{fontSize: Fonts.FontSizeSmall}}>
            All {Pluralize('organization', totalOrganizationCount, true)} selected
          </Text>
        )}
        <SelectedRows
          loading={itemsLoading}
          selected={pagedItems}
          removeOption={removeOption}
          totalCount={selectedCount}
        />
        <ResourcePaginator
          pageSize={pageSize}
          pageCount={pageCount}
          totalResources={localSelected.length}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </Box>
    </>
  )
}
