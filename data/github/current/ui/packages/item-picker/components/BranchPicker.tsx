/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {GitBranchIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Box, Button, Octicon} from '@primer/react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {ERRORS} from '../constants/errors'
import {LABELS} from '../constants/labels'
import {fetchQuery, graphql, readInlineData} from 'relay-runtime'
import type {BranchPickerRef$data, BranchPickerRef$key} from './__generated__/BranchPickerRef.graphql'
import {type ExtendedItemProps, ItemPicker} from '../components/ItemPicker'
import {useFragment, useRelayEnvironment} from 'react-relay'
import type {
  BranchPickerSearchBranchesQuery,
  BranchPickerSearchBranchesQuery$data,
} from './__generated__/BranchPickerSearchBranchesQuery.graphql'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useDebounce} from '@github-ui/use-debounce'
import type {BranchPickerRepositoryBranches$key} from './__generated__/BranchPickerRepositoryBranches.graphql'
import type {BranchPickerSearchBranchesFragment$key} from './__generated__/BranchPickerSearchBranchesFragment.graphql'
import {VALUES} from '../constants/values'

export type Branch = BranchPickerRef$data

export type BranchPickerInternalProps = {
  initialBranch: Branch | null | undefined
  defaultBranchId: string | undefined
  branchesKey: BranchPickerRepositoryBranches$key | null
  onSelect: (branch: Branch | undefined) => void
  enforceAtleastOneSelected?: boolean
  owner: string
  repo: string
  title?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

interface BranchPickerBaseProps {
  items: Branch[]
  initialSelectedItem?: Branch | null
  onFilter: (value: string) => void
  defaultBranchId: string | undefined
  onSelectionChange: (selected?: Branch) => void
  loading?: boolean
  title?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

export const BranchPickerRepositoryBranchesGraphqlQuery = graphql`
  query BranchPickerRepositoryBranchesQuery($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      ...BranchPickerRepositoryBranchRefs
    }
  }
`

export const BranchPickerRepositoryBranchRefsFragment = graphql`
  fragment BranchPickerRepositoryBranchRefs on Repository @inline {
    id
    defaultBranchRef {
      ...BranchPickerRef
    }
    refs(refPrefix: "refs/heads/", first: 25) {
      ...BranchPickerRepositoryBranches
    }
  }
`

export const BranchPickerRepositoryBranchesFragment = graphql`
  fragment BranchPickerRepositoryBranches on RefConnection @inline {
    edges {
      node {
        ...BranchPickerRef
      }
    }
  }
`

export const BranchPickerRefFragment = graphql`
  fragment BranchPickerRef on Ref @inline {
    name
    id
    __typename
    target {
      oid
      id
      __typename
    }
    repository {
      id
      nameWithOwner
      defaultBranchRef {
        name
        id
        target {
          oid
          id
          __typename
        }
        associatedPullRequests {
          totalCount
        }
        repository {
          id
        }
      }
    }
    associatedPullRequests {
      totalCount
    }
  }
`

export const BranchPickerSearchBranches = graphql`
  query BranchPickerSearchBranchesQuery($owner: String!, $name: String!, $first: Int!, $query: String) {
    ...BranchPickerSearchBranchesFragment
  }
`

export const BranchPickerSearchBranchesFragment = graphql`
  fragment BranchPickerSearchBranchesFragment on Query {
    repository(owner: $owner, name: $name) {
      refs(refPrefix: "refs/heads/", first: $first, query: $query) {
        edges {
          node {
            ...BranchPickerRef
          }
        }
      }
    }
  }
`

export const BranchPickerPlaceholder = ({currentBranch}: {currentBranch?: string | null}) => (
  <Button leadingVisual={GitBranchIcon} trailingVisual={TriangleDownIcon} disabled>
    {currentBranch ?? LABELS.selectBranch}
  </Button>
)

export function BranchPickerInternal({
  initialBranch,
  defaultBranchId,
  branchesKey,
  owner,
  repo,
  onSelect,
  title,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: BranchPickerInternalProps) {
  const [searchResultsFragment, setSearchResultsFragment] = useState<BranchPickerSearchBranchesQuery$data | null>(null)
  const [searchResults, setSearchResults] = useState<Branch[] | undefined>(undefined)
  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const [filter, setFilter] = useState('')
  const {addToast} = useToastContext()

  const searchedBranchesData = useFragment<BranchPickerSearchBranchesFragment$key>(
    BranchPickerSearchBranchesFragment,
    searchResultsFragment,
  )

  const suggestedBranches = useMemo(() => {
    if (!searchedBranchesData) {
      return undefined
    }
    return (searchedBranchesData?.repository?.refs?.edges || []).flatMap(edge =>
      // eslint-disable-next-line no-restricted-syntax
      edge?.node ? [readInlineData<BranchPickerRef$key>(BranchPickerRefFragment, edge.node)] : [],
    )
  }, [searchedBranchesData])

  useEffect(() => {
    setSearchResults(suggestedBranches)
  }, [suggestedBranches])

  // eslint-disable-next-line no-restricted-syntax
  const branchesData = readInlineData<BranchPickerRepositoryBranches$key>(
    BranchPickerRepositoryBranchesFragment,
    branchesKey,
  )

  const branches = useMemo(() => {
    const repoBranches =
      branchesData?.edges
        // eslint-disable-next-line no-restricted-syntax
        ?.flatMap(edge => (edge?.node ? [readInlineData<BranchPickerRef$key>(BranchPickerRefFragment, edge.node)] : []))
        .filter(branch => branch.id !== initialBranch?.id) ?? []
    if (initialBranch) {
      repoBranches.unshift(initialBranch)
    }
    return repoBranches
  }, [branchesData?.edges, initialBranch])

  const items = useMemo(() => {
    if (searchResults) {
      return searchResults
    }
    return branches
  }, [branches, searchResults])

  const environment = useRelayEnvironment()

  const fetchSearchData = useCallback(
    (query: string) => {
      if (query === '') {
        setSearchResults([])
        return
      }

      setSearchLoading(true)

      fetchQuery<BranchPickerSearchBranchesQuery>(environment, BranchPickerSearchBranches, {
        owner,
        name: repo,
        query,
        first: 25,
      }).subscribe({
        next: (data: BranchPickerSearchBranchesQuery$data) => {
          if (data !== null) {
            setSearchResultsFragment(data)
          }
          setSearchLoading(false)
        },
        error: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotSearchAssignees,
          })
          setSearchLoading(false)
        },
      })
    },
    [addToast, environment, owner, repo],
  )

  const debounceFetchSearchData = useDebounce(
    (nextValue: string) => fetchSearchData(nextValue),
    VALUES.pickerDebounceTime,
  )

  const filterItems = useCallback(
    (value: string) => {
      const trimmedFilter = value.trim()
      if (filter !== trimmedFilter) {
        debounceFetchSearchData(trimmedFilter)
      }
      setFilter(value)
    },
    [debounceFetchSearchData, filter],
  )

  return (
    <BranchPickerBase
      items={items}
      initialSelectedItem={initialBranch}
      onFilter={filterItems}
      defaultBranchId={defaultBranchId}
      onSelectionChange={onSelect}
      loading={searchLoading}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      title={title}
    />
  )
}

export function BranchPickerBase({
  items,
  initialSelectedItem,
  onFilter,
  defaultBranchId,
  onSelectionChange,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  title,
  loading = false,
}: BranchPickerBaseProps) {
  const filterItems = useCallback(
    (value: string) => {
      onFilter(value)
    },
    [onFilter],
  )

  const getItemKey = useCallback((branch: Branch) => branch.id, [])

  const convertToItemProps = useCallback(
    (branch: Branch): ExtendedItemProps<Branch> => ({
      // this is a hack to make sure that we are using the prop
      id: `${branch.id}`,
      children: <span>{branch.name}</span>,
      source: branch,
      leadingVisual: () => <Octicon icon={GitBranchIcon} size={16} />,
      trailingVisual: () => (branch.id === defaultBranchId ? <span>Default</span> : null),
    }),
    [defaultBranchId],
  )

  const branchPickerRef = useRef<HTMLButtonElement>(null)

  const renderAnchor = useCallback(
    ({...anchorProps}: React.HTMLAttributes<HTMLElement>) => (
      <Button
        leadingVisual={GitBranchIcon}
        trailingVisual={TriangleDownIcon}
        aria-label={!ariaLabelledBy ? LABELS.selectBranch : undefined}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        {...anchorProps}
        ref={branchPickerRef}
      >
        {initialSelectedItem ? <span>{initialSelectedItem.name}</span> : LABELS.selectBranch}
      </Button>
    ),
    [ariaDescribedBy, ariaLabelledBy, initialSelectedItem],
  )

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1}}>
      <ItemPicker
        items={items}
        initialSelectedItems={initialSelectedItem ? [initialSelectedItem] : []}
        filterItems={filterItems}
        getItemKey={getItemKey}
        convertToItemProps={convertToItemProps}
        placeholderText={LABELS.selectBranch}
        selectionVariant="single"
        onSelectionChange={([branch]) => onSelectionChange(branch)}
        loading={loading}
        renderAnchor={renderAnchor}
        selectPanelRef={branchPickerRef}
        enforceAtleastOneSelected={true}
        resultListAriaLabel={'Branch results'}
        title={title ?? 'Select a branch'}
        width={'large'}
      />
    </Box>
  )
}
