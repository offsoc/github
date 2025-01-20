/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {Box, Button, Octicon, Text} from '@primer/react'
import {type ExtendedItemProps, ItemPicker} from './ItemPicker'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {ERRORS} from '../constants/errors'
import {LABELS} from '../constants/labels'
import {GitPullRequestIcon, TriangleDownIcon} from '@primer/octicons-react'
import {
  type PreloadedQuery,
  graphql,
  readInlineData,
  usePreloadedQuery,
  useRelayEnvironment,
  fetchQuery,
  useFragment,
} from 'react-relay'
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
  PullRequestState,
} from './__generated__/PullRequestPickerPullRequest.graphql'
import {useDebounce} from '@github-ui/use-debounce'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

import type {ItemGroup} from '../shared'
import {PullRequestStateIcons} from '../constants/icons'
import {VALUES} from '../constants/values'

type PullRequestPickerProps = {
  repoNameWithOwner: string
  pullRequestQueryRef: PreloadedQuery<PullRequestPickerSearchQuery>
  initialSelectedPrs: PullRequestPickerPullRequest$data[]
  onSelectionChange: (selected: PullRequestPickerPullRequest$data[]) => void
  triggerOpen?: boolean
}

type PullRequestPickerInternalProps = Omit<PullRequestPickerProps, 'pullRequestQueryRef'> & {
  fragmentKey: PullRequestPickerQuery$key
}

export const PullRequestPickerFragment = graphql`
  fragment PullRequestPickerPullRequest on PullRequest @inline {
    id
    __typename
    url
    number
    title
    state
    isDraft
    isInMergeQueue
    createdAt
    repository {
      id
      name
      nameWithOwner
      owner {
        login
        __typename
      }
    }
  }
`

export const PullRequestPickerQueryFragment = graphql`
  fragment PullRequestPickerQuery on Query {
    commenters: search(type: ISSUE, first: $first, query: $commenters) {
      nodes {
        ...PullRequestPickerPullRequest
      }
    }
    mentions: search(type: ISSUE, first: $first, query: $mentions) {
      nodes {
        ...PullRequestPickerPullRequest
      }
    }
    assignee: search(type: ISSUE, first: $first, query: $assignee) {
      nodes {
        ...PullRequestPickerPullRequest
      }
    }
    author: search(type: ISSUE, first: $first, query: $author) {
      nodes {
        ...PullRequestPickerPullRequest
      }
    }
    open: search(type: ISSUE, first: $first, query: $open) {
      nodes {
        ...PullRequestPickerPullRequest
      }
    }
  }
`

export const PullRequestPickerSearchPullRequestsGraphQLQuery = graphql`
  query PullRequestPickerSearchQuery(
    $commenters: String!
    $mentions: String!
    $assignee: String!
    $author: String!
    $open: String!
    $first: Int = 10
  ) {
    ...PullRequestPickerQuery
  }
`

export const getPullRequestSearchQueries = (repoName: string, query = '') => {
  const sharedQuery = `is:pr repo:${repoName}`
  let modifiedQuery = query.trim()
  modifiedQuery = modifiedQuery.length > 0 ? ` ${modifiedQuery}` : ''

  return {
    commenters: `${sharedQuery} commenter:@me${modifiedQuery}`,
    mentions: `${sharedQuery} mentions:@me${modifiedQuery}`,
    assignee: `${sharedQuery} assignee:@me${modifiedQuery}`,
    author: `${sharedQuery} author:@me${modifiedQuery}`,
    open: `${sharedQuery} state:open${modifiedQuery}`,
  }
}

export const PullRequestPickerPlaceholder = () => (
  <Button
    leadingVisual={GitPullRequestIcon}
    trailingVisual={TriangleDownIcon}
    aria-labelledby="pr-picker-label"
    disabled
  >
    {LABELS.selectPr}
  </Button>
)

export const PullRequestPicker = ({
  initialSelectedPrs,
  pullRequestQueryRef,
  repoNameWithOwner,
  onSelectionChange,
  triggerOpen,
}: PullRequestPickerProps) => {
  const data = usePreloadedQuery(PullRequestPickerSearchPullRequestsGraphQLQuery, pullRequestQueryRef)

  return data ? (
    <PullRequestPickerInternal
      repoNameWithOwner={repoNameWithOwner}
      initialSelectedPrs={initialSelectedPrs}
      fragmentKey={data}
      onSelectionChange={onSelectionChange}
      triggerOpen={triggerOpen}
    />
  ) : (
    <></>
  )
}

const pullRequestsGroup: ItemGroup = {groupId: 'pullRequests'}
const suggestionsGroup: ItemGroup = {groupId: 'suggestions', header: {title: 'Suggestions', variant: 'filled'}}

// We are using a SelectPanel group to show the warning, as there is no other way to display an error message in the PullRequestPicker.
const warningGroup: ItemGroup = {
  groupId: 'warning',
  header: {title: LABELS.maxPRsLinkingWarning, variant: 'subtle'},
}

const PullRequestPickerInternal = ({
  repoNameWithOwner,
  initialSelectedPrs,
  fragmentKey,
  onSelectionChange,
  triggerOpen,
}: PullRequestPickerInternalProps) => {
  const {addToast} = useToastContext()
  const relayEnvironment = useRelayEnvironment()
  const [queryFragmentKey, setQueryFragmentKey] = useState<PullRequestPickerQuery$key>(fragmentKey)
  const fetchedPrData = useFragment(PullRequestPickerQueryFragment, queryFragmentKey)

  const [filter, setFilter] = useState('')
  const [searchLoading, setSearchLoading] = useState<boolean>(false)

  const fetchedLinkedPullRequests = useMemo<PullRequestPickerPullRequest$data[]>(() => {
    const map = new Map<string, PullRequestPickerPullRequest$data>()
    const searchedPRs = getLinkedPullRequests(fetchedPrData)
    for (const spr of searchedPRs) {
      map.set(spr.id, spr)
    }
    for (const ipr of initialSelectedPrs) {
      map.set(ipr.id, ipr)
    }
    return [...map.values()]
  }, [fetchedPrData, initialSelectedPrs])

  const fetchSearchData = useCallback(
    (searchQuery: string) => {
      // run query on search
      setSearchLoading(true)
      fetchQuery<PullRequestPickerSearchQuery>(
        relayEnvironment,
        PullRequestPickerSearchPullRequestsGraphQLQuery,
        getPullRequestSearchQueries(repoNameWithOwner, searchQuery),
      ).subscribe({
        next: (data: PullRequestPickerSearchQuery$data) => {
          if (data !== null) {
            setQueryFragmentKey(data)
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

  function onFilter(value: string) {
    setFilter(value)
  }

  const debounceFetchSearchData = useDebounce(
    (nextValue: string) => fetchSearchData(nextValue),
    VALUES.pickerDebounceTime,
  )

  useEffect(() => {
    if (filter.length === 0) {
      setQueryFragmentKey(fragmentKey)
    }
    debounceFetchSearchData(filter)
  }, [debounceFetchSearchData, filter, fragmentKey])

  return (
    <PullRequestPickerBase
      items={fetchedLinkedPullRequests}
      initialSelectedItems={initialSelectedPrs}
      onFilter={onFilter}
      onSelectionChange={onSelectionChange}
      loading={searchLoading}
      triggerOpen={triggerOpen}
    />
  )
}

interface PullRequestPickerBaseProps {
  items: PullRequestPickerPullRequest$data[]
  initialSelectedItems?: PullRequestPickerPullRequest$data[]
  onFilter: (value: string) => void
  onSelectionChange: (selected: PullRequestPickerPullRequest$data[]) => void
  loading?: boolean
  triggerOpen?: boolean
}

export function PullRequestPickerBase({
  items,
  initialSelectedItems = [],
  onFilter,
  onSelectionChange,
  loading = false,
  triggerOpen = false,
}: PullRequestPickerBaseProps) {
  const pullRequestPickerRef = useRef<HTMLButtonElement>(null)

  const filterItems = useCallback(
    (value: string) => {
      onFilter(value)
    },
    [onFilter],
  )

  const getItemKey = useCallback((pr: PullRequestPickerPullRequest$data) => pr.id, [])

  const groups: ItemGroup[] = useMemo(() => {
    const itemGroups = []
    itemGroups.push(warningGroup)
    if (initialSelectedItems.length > 0) {
      itemGroups.push(pullRequestsGroup)
    }
    if (items.length > 0 && items.length - initialSelectedItems.length > 0) {
      itemGroups.push(suggestionsGroup)
    }
    return itemGroups
  }, [initialSelectedItems.length, items.length])

  const convertToItemProps = useCallback(
    (pr: PullRequestPickerPullRequest$data): ExtendedItemProps<PullRequestPickerPullRequest$data> => ({
      // this is a hack to make sure that we are using the prop
      id: `${pr.id}`,
      groupId: initialSelectedItems.find(r => r.id === pr.id) ? pullRequestsGroup.groupId : suggestionsGroup.groupId,
      children: (
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
          <span>{pr.title}</span>
          <Text sx={{fontSize: 0, color: 'fg.muted'}}>{`${pr.repository.nameWithOwner}#${pr.number}`}</Text>
        </Box>
      ),
      source: pr,
      leadingVisual: () => <Octicon icon={getPrIcon(pr)} size={16} sx={{path: {fill: getPrIconColor(pr)}}} />,
    }),
    [initialSelectedItems],
  )

  const renderAnchor = useCallback(
    ({...anchorProps}: React.HTMLAttributes<HTMLElement>) => (
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
    ),
    [initialSelectedItems.length],
  )

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1}}>
      <ItemPicker
        items={items}
        initialSelectedItems={initialSelectedItems}
        groups={groups}
        filterItems={filterItems}
        getItemKey={getItemKey}
        convertToItemProps={convertToItemProps}
        placeholderText={LABELS.searchPr}
        selectionVariant="multiple"
        onSelectionChange={onSelectionChange}
        selectPanelRef={pullRequestPickerRef}
        renderAnchor={renderAnchor}
        loading={loading}
        width="medium"
        resultListAriaLabel={'Pull request results'}
        triggerOpen={triggerOpen}
      />
    </Box>
  )
}

export const getPrState = (isDraft: boolean, isInMergeQueue: boolean, state: PullRequestState) => {
  if (isDraft) {
    return 'DRAFT'
  } else if (isInMergeQueue) {
    return 'IN_MERGE_QUEUE'
  } else if (state === 'CLOSED' || state === 'MERGED' || state === 'OPEN') {
    return state
  }

  throw new Error(`Unknown pull request state: ${state}`)
}

export function getPrIconColor(pullRequest: PullRequestPickerPullRequest$data) {
  const item = PullRequestStateIcons[getPrState(pullRequest.isDraft, pullRequest.isInMergeQueue, pullRequest.state)]
  return item.color
}

export function getPrIcon(pullRequest: PullRequestPickerPullRequest$data) {
  const item = PullRequestStateIcons[getPrState(pullRequest.isDraft, pullRequest.isInMergeQueue, pullRequest.state)]
  return item.icon
}

function getLinkedPullRequests(data: PullRequestPickerQuery$data): PullRequestPickerPullRequest$data[] {
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
    if (pr === undefined) continue
    // eslint-disable-next-line no-restricted-syntax
    const prData = readInlineData<PullRequestPickerPullRequest$key>(PullRequestPickerFragment, pr)
    if (prData) {
      fetchedPrsMap.set(prData.id, prData)
    }
  }

  return Array.from(fetchedPrsMap.values())
}
