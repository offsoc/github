/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {Box, Button, Octicon, Text} from '@primer/react'
import {type ExtendedItemProps, ItemPicker} from './ItemPicker'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {ERRORS} from '../constants/errors'
import {LABELS} from '../constants/labels'
import {GitBranchIcon, GitPullRequestIcon, TriangleDownIcon} from '@primer/octicons-react'
import {readInlineData, useRelayEnvironment, fetchQuery, useFragment, graphql} from 'react-relay'
import type {
  PullRequestPickerSearchQuery,
  PullRequestPickerSearchQuery$data,
} from './__generated__/PullRequestPickerSearchQuery.graphql'
import type {
  PullRequestPickerQuery$data,
  PullRequestPickerQuery$key,
} from './__generated__/PullRequestPickerQuery.graphql'
import type {
  PullRequestPickerPullRequest$data,
  PullRequestPickerPullRequest$key,
} from './__generated__/PullRequestPickerPullRequest.graphql'
import {useDebounce} from '@github-ui/use-debounce'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

import type {ItemGroup} from '../shared'
import {
  PullRequestPickerFragment,
  PullRequestPickerQueryFragment,
  PullRequestPickerSearchPullRequestsGraphQLQuery,
  getPrIcon,
  getPrIconColor,
  getPullRequestSearchQueries,
} from './PullRequestPicker'
import type {
  BranchPickerSearchBranchesQuery,
  BranchPickerSearchBranchesQuery$data,
} from './__generated__/BranchPickerSearchBranchesQuery.graphql'
import {BranchPickerRefFragment, BranchPickerSearchBranches, BranchPickerSearchBranchesFragment} from './BranchPicker'
import type {BranchPickerSearchBranchesFragment$key} from './__generated__/BranchPickerSearchBranchesFragment.graphql'
import type {BranchPickerRef$data, BranchPickerRef$key} from './__generated__/BranchPickerRef.graphql'
import {IS_SERVER} from '@github-ui/ssr-utils'
import {HOTKEYS} from '../constants/hotkeys'
import {VALUES} from '../constants/values'

type PullRequestAndBranchPickerSharedProps = {
  onSelectionChange: (selected: Array<PullRequestPickerPullRequest$data | BranchPickerRef$data>) => void
  shortcutsEnabled: boolean
  anchorElement?: (props: React.HTMLAttributes<HTMLElement>) => JSX.Element
  subtitle?: string | React.ReactElement
  title?: string | React.ReactElement
  triggerOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  preventClose?: boolean
  loading?: boolean
}

export type PullRequestAndBranchPickerProps = PullRequestAndBranchPickerSharedProps & {
  repoNameWithOwner: string
  initialSelectedPrs: PullRequestPickerPullRequest$data[]
  initialSelectedBranches: BranchPickerRef$data[]
  preventClose?: boolean
}

type PullRequestPickerInternalProps = PullRequestAndBranchPickerSharedProps & {
  pullRequestItemsKey: PullRequestPickerQuery$key | null
  branchItemsKey: BranchPickerSearchBranchesFragment$key | null
  initialSelectedBranches?: BranchPickerRef$data[]
  initialSelectedPrs?: PullRequestPickerPullRequest$data[]
  onFilter: (value: string) => void
}

export type PullRequestPickerBaseProps = Omit<
  PullRequestPickerInternalProps,
  'pullRequestItemsKey' | 'branchItemsKey'
> & {
  branchItems: BranchPickerRef$data[]
  pullRequestItems: PullRequestPickerPullRequest$data[]
}

export const PullRequestAndBranchPickerBranchFragment = graphql`
  fragment PullRequestAndBranchPickerBranch on PullRequest @inline {
    id
    url
    number
    title
    state
    isDraft
    repository {
      id
      name
      nameWithOwner
      owner {
        login
        __typename
      }
    }
    __typename
  }
`

export const PullRequestAndBranchPickerPlaceholder = () => (
  <Button
    leadingVisual={GitPullRequestIcon}
    trailingVisual={TriangleDownIcon}
    aria-labelledby="pr-picker-label"
    disabled
  >
    {LABELS.selectPr}
  </Button>
)

const selectedGroup: ItemGroup = {groupId: 'selected'}
const suggestionsGroup: ItemGroup = {groupId: 'suggestions', header: {title: 'Suggestions', variant: 'filled'}}

export const LazyPullRequestAndBranchPicker = ({
  repoNameWithOwner,
  initialSelectedPrs,
  initialSelectedBranches,
  loading,
  ...rest
}: PullRequestAndBranchPickerProps) => {
  const {addToast} = useToastContext()
  const relayEnvironment = useRelayEnvironment()
  const [pullRequestsQueryFragmentKey, setPullRequestsQueryFragmentKey] = useState<PullRequestPickerQuery$key | null>(
    null,
  )
  const [filter, setFilter] = useState('')
  const [searchLoading, setSearchLoading] = useState<boolean>(loading ?? false)

  const [branchesQueryFragmentData, setBranchesQueryFragmentData] =
    useState<BranchPickerSearchBranchesQuery$data | null>(null)

  const fetchBranchesSearchData = useCallback(
    (query: string) => {
      const repoNameWithOwnerParts = repoNameWithOwner.split('/')
      const owner = repoNameWithOwnerParts[0]
      const repo = repoNameWithOwnerParts[1]
      if (!owner || !repo) {
        return
      }
      return new Promise<BranchPickerRef$data[]>((resolve, reject) => {
        fetchQuery<BranchPickerSearchBranchesQuery>(relayEnvironment, BranchPickerSearchBranches, {
          owner,
          name: repo,
          query,
          first: 25,
        }).subscribe({
          next: (data: BranchPickerSearchBranchesQuery$data) => {
            if (data !== null) {
              setBranchesQueryFragmentData(data)
              setSearchLoading(false)
            }
          },
          error: (error: Error) => {
            reject(error)
          },
        })
      })
    },
    [relayEnvironment, repoNameWithOwner],
  )

  const fetchPullRequestsSearchData = useCallback(
    (searchQuery: string) => {
      if (!repoNameWithOwner) return

      setSearchLoading(true)
      const queryString = `${searchQuery} sort:created-desc`
      fetchQuery<PullRequestPickerSearchQuery>(
        relayEnvironment,
        PullRequestPickerSearchPullRequestsGraphQLQuery,
        getPullRequestSearchQueries(repoNameWithOwner, queryString),
      ).subscribe({
        next: (data: PullRequestPickerSearchQuery$data) => {
          if (data !== null) {
            setPullRequestsQueryFragmentKey(data)
            setSearchLoading(false)
          }
        },
        error: () => {
          setSearchLoading(false)
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotSearchPullRequests,
          })
        },
      })
    },
    [addToast, relayEnvironment, repoNameWithOwner],
  )

  const fetchSearchData = useCallback(
    (query: string) => {
      fetchBranchesSearchData(query)
      fetchPullRequestsSearchData(query)
    },
    [fetchPullRequestsSearchData, fetchBranchesSearchData],
  )

  function onFilter(value: string) {
    setFilter(value)
  }

  const debounceFetchSearchData = useDebounce(
    (nextValue: string) => fetchSearchData(nextValue),
    VALUES.pickerDebounceTime,
  )

  useEffect(() => {
    if (!IS_SERVER) {
      fetchSearchData(filter)
    }
    // intentionally running this not debounced on repoNameWithOwner changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoNameWithOwner])

  useEffect(() => {
    debounceFetchSearchData(filter)
  }, [debounceFetchSearchData, filter])

  return (
    <PullRequestAndBranchPickerInternal
      pullRequestItemsKey={pullRequestsQueryFragmentKey}
      branchItemsKey={branchesQueryFragmentData}
      initialSelectedPrs={initialSelectedPrs}
      initialSelectedBranches={initialSelectedBranches}
      onFilter={onFilter}
      loading={searchLoading}
      {...rest}
    />
  )
}

export function PullRequestAndBranchPickerInternal({
  pullRequestItemsKey,
  branchItemsKey,
  initialSelectedPrs = [],
  initialSelectedBranches = [],
  ...rest
}: PullRequestPickerInternalProps) {
  const fetchedPrData = useFragment<PullRequestPickerQuery$key>(PullRequestPickerQueryFragment, pullRequestItemsKey)

  const pullRequestItems = useMemo<PullRequestPickerPullRequest$data[]>(() => {
    const map = new Map<string, PullRequestPickerPullRequest$data>()
    const searchedPRs = getLinkedPullRequests(fetchedPrData ?? null)
    for (const spr of searchedPRs) {
      map.set(spr.id, spr)
    }
    for (const ipr of initialSelectedPrs) {
      map.set(ipr.id, ipr)
    }
    return [...map.values()].sort(sortPrsByCreationDate)
  }, [fetchedPrData, initialSelectedPrs])

  const fetchedBranches = useFragment<BranchPickerSearchBranchesFragment$key>(
    BranchPickerSearchBranchesFragment,
    branchItemsKey,
  )

  const branchItems = useMemo<BranchPickerRef$data[]>(() => {
    const map = new Map<string, BranchPickerRef$data>()

    const searchedBranches =
      fetchedBranches?.repository?.refs?.edges?.flatMap(edge =>
        // eslint-disable-next-line no-restricted-syntax
        edge?.node ? [readInlineData<BranchPickerRef$key>(BranchPickerRefFragment, edge.node)] : [],
      ) ?? []
    for (const searchBranch of searchedBranches) {
      map.set(searchBranch.id, searchBranch)
    }
    for (const initialBranch of initialSelectedBranches) {
      map.set(initialBranch.id, initialBranch)
    }

    return [...map.values()]
  }, [initialSelectedBranches, fetchedBranches?.repository?.refs?.edges])

  return (
    <PullRequestAndBranchPickerBase
      initialSelectedPrs={initialSelectedPrs}
      initialSelectedBranches={initialSelectedBranches}
      pullRequestItems={pullRequestItems}
      branchItems={branchItems}
      {...rest}
    />
  )
}

export function PullRequestAndBranchPickerBase({
  pullRequestItems,
  branchItems,
  initialSelectedPrs = [],
  initialSelectedBranches = [],
  loading,
  onFilter,
  anchorElement,
  shortcutsEnabled,
  ...rest
}: PullRequestPickerBaseProps) {
  const initialSelectedItems = useMemo(
    () => [...initialSelectedPrs, ...initialSelectedBranches],
    [initialSelectedPrs, initialSelectedBranches],
  )
  const pullRequestPickerRef = useRef<HTMLButtonElement>(null)

  // Not showing the default branch or branches that already have a PR
  const filteredBranchItems = useMemo(() => {
    return branchItems.filter(
      branch => branch.id !== branch.repository.defaultBranchRef?.id && branch.associatedPullRequests.totalCount === 0,
    )
  }, [branchItems])

  const filterItems = useCallback(
    (value: string) => {
      onFilter(value)
    },
    [onFilter],
  )

  const getItemKey = useCallback((item: PullRequestPickerPullRequest$data | BranchPickerRef$data) => item.id, [])

  const groups: ItemGroup[] = useMemo(() => {
    const itemGroups = []
    if (initialSelectedItems.length > 0) {
      itemGroups.push(selectedGroup)
    }
    if (
      branchItems.length + pullRequestItems.length > 0 &&
      pullRequestItems.length + branchItems.length - initialSelectedItems.length > 0
    ) {
      itemGroups.push(suggestionsGroup)
    }
    return itemGroups
  }, [branchItems.length, initialSelectedItems.length, pullRequestItems.length])

  const convertToItemProps = useCallback(
    (
      item: PullRequestPickerPullRequest$data | BranchPickerRef$data,
    ): ExtendedItemProps<PullRequestPickerPullRequest$data | BranchPickerRef$data> => {
      const isPr = item.__typename === 'PullRequest'
      const displayName = isPr ? item.title : item.name
      const displaySubtitle = isPr ? `${item.repository.nameWithOwner}#${item.number}` : LABELS.noPullRequest
      const icon = isPr ? (
        <Octicon icon={getPrIcon(item)} size={16} sx={{path: {fill: getPrIconColor(item)}}} />
      ) : (
        <Octicon icon={GitBranchIcon} size={16} />
      )

      return {
        // this is a hack to make sure that we are using the prop
        id: `${item.id}`,
        groupId: [...initialSelectedBranches, ...initialSelectedPrs].find(r => r.id === item.id)
          ? selectedGroup.groupId
          : suggestionsGroup.groupId,
        children: (
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <span>{displayName}</span>
            <Text sx={{fontSize: 0, color: 'fg.muted'}}>{displaySubtitle}</Text>
          </Box>
        ),
        source: item,
        leadingVisual: () => icon,
        sx: {wordBreak: 'break-word'},
      }
    },
    [initialSelectedBranches, initialSelectedPrs],
  )

  const renderAnchor = useCallback(
    ({...anchorProps}: React.HTMLAttributes<HTMLElement>) => {
      if (anchorElement) {
        return anchorElement(anchorProps)
      }

      return (
        <Button
          leadingVisual={GitPullRequestIcon}
          trailingVisual={TriangleDownIcon}
          {...anchorProps}
          aria-labelledby="pr-picker-label"
          ref={pullRequestPickerRef}
        >
          {initialSelectedItems.length > 0
            ? LABELS.getNumberOfSelectedPrsLabel(initialSelectedItems.length)
            : LABELS.selectPr}
        </Button>
      )
    },
    [anchorElement, initialSelectedItems.length],
  )

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1}}>
      <ItemPicker
        loading={loading}
        items={[...pullRequestItems, ...filteredBranchItems]}
        initialSelectedItems={initialSelectedItems}
        groups={groups}
        openHotkey={shortcutsEnabled ? HOTKEYS.developmentSection : undefined}
        filterItems={filterItems}
        getItemKey={getItemKey}
        convertToItemProps={convertToItemProps}
        placeholderText={LABELS.searchPr}
        selectionVariant="multiple"
        selectPanelRef={pullRequestPickerRef}
        renderAnchor={renderAnchor}
        width="medium"
        resultListAriaLabel={'Pull request results'}
        height="large"
        {...rest}
      />
    </Box>
  )
}

function getLinkedPullRequests(data: PullRequestPickerQuery$data | null): PullRequestPickerPullRequest$data[] {
  if (!data) return []

  const {commenters, mentions, assignee, author, open} = data

  const allPrs = [
    ...(commenters?.nodes || []),
    ...(mentions?.nodes || []),
    ...(assignee?.nodes || []),
    ...(author?.nodes || []),
    ...(open?.nodes || []),
  ]

  const fetchedPrsMap = new Map<string, PullRequestPickerPullRequest$data>()

  for (const pr of allPrs) {
    if (pr !== undefined) {
      // eslint-disable-next-line no-restricted-syntax
      const prData = readInlineData<PullRequestPickerPullRequest$key>(PullRequestPickerFragment, pr)
      if (prData) {
        fetchedPrsMap.set(prData.id, prData)
      }
    }
  }

  return Array.from(fetchedPrsMap.values())
}

function sortPrsByCreationDate(first: PullRequestPickerPullRequest$data, second: PullRequestPickerPullRequest$data) {
  const firstDate = new Date(first.createdAt)
  const secondDate = new Date(second.createdAt)

  if (firstDate < secondDate) {
    return 1
  } else if (firstDate > secondDate) {
    return -1
  } else {
    return 0
  }
}
