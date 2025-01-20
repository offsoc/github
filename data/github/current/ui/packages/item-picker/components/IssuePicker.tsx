import type React from 'react'
import {useCallback, useEffect, useMemo, useRef, useState, type Dispatch} from 'react'
import {graphql, useRelayEnvironment, useFragment} from 'react-relay'

import {VALUES} from '../constants/values'
import {LABELS} from '../constants/labels'
import {ItemPicker} from './ItemPicker'
import {getIssueSearchQueries, type ItemGroup} from '../shared'
import {useItemPickerErrorFallback} from './useItemPickerErrorFallback'
import {clientSideRelayFetchQueryRetained} from '@github-ui/relay-environment'
import type {IssuePickerIssue$data} from './__generated__/IssuePickerIssue.graphql'
import {IssueClosedIcon, IssueOpenedIcon, SkipIcon} from '@primer/octicons-react'
import type {IssuePickerQuery$key} from './__generated__/IssuePickerQuery.graphql'
import type {IssuePickerSearchQuery, IssuePickerSearchQuery$data} from './__generated__/IssuePickerSearchQuery.graphql'
import {useDebounce} from '@github-ui/use-debounce'
import {Octicon, Text} from '@primer/react'
import type {
  IssuePickerSelectedIssuesQuery,
  IssuePickerSelectedIssuesQuery$data,
} from './__generated__/IssuePickerSelectedIssuesQuery.graphql'

const getItemKey = (issue: IssuePickerItem) => issue.id

export type IssuePickerItem = Omit<IssuePickerIssue$data, ' $fragmentType'>

type IssuePickerBaseProps = {
  anchorElement: (props: React.HTMLAttributes<HTMLElement>) => JSX.Element
  onIssueUpdate?: () => void
  onIssueSelection: (issues: IssuePickerItem[]) => void
  repositoryNameWithOwner?: string
  title?: string | React.ReactElement
  triggerOpen?: boolean
  onClose?: () => void
  selectedIssueIds?: string[]
  hiddenIssueIds?: string[]
}

type LazyIssuePickerProps = IssuePickerBaseProps & {
  owner?: string
}

type IssuePickerInternalProps = IssuePickerBaseProps & {
  paginatedKey: IssuePickerQuery$key | null
  isLoading: boolean
  filter: string
  setFilter: Dispatch<string>
}

const selectedGroup = {groupId: 'selected'}
const suggestionGroup = {groupId: 'suggestions', header: {title: 'Suggestions', variant: 'filled'}}
const groups: ItemGroup[] = [selectedGroup, suggestionGroup]

export const IssuePickerSearchGraphQLQuery = graphql`
  query IssuePickerSearchQuery(
    $commenters: String!
    $mentions: String!
    $assignee: String!
    $author: String!
    $open: String!
    $first: Int = 10
    $resource: URI!
    $queryIsUrl: Boolean!
  ) {
    ...IssuePickerQuery
  }
`

export const IssuePickerSelectedIssuesGraphQLQuery = graphql`
  query IssuePickerSelectedIssuesQuery($ids: [ID!]!) {
    nodes(ids: $ids) {
      ...IssuePickerIssue @relay(mask: false)
    }
  }
`

export const IssuePickerQueryFragment = graphql`
  fragment IssuePickerQuery on Query {
    commenters: search(type: ISSUE, first: $first, query: $commenters) {
      nodes {
        ...IssuePickerIssue @relay(mask: false)
      }
    }
    mentions: search(type: ISSUE, first: $first, query: $mentions) {
      nodes {
        ...IssuePickerIssue @relay(mask: false)
      }
    }
    assignee: search(type: ISSUE, first: $first, query: $assignee) {
      nodes {
        ...IssuePickerIssue @relay(mask: false)
      }
    }
    author: search(type: ISSUE, first: $first, query: $author) {
      nodes {
        ...IssuePickerIssue @relay(mask: false)
      }
    }
    open: search(type: ISSUE, first: $first, query: $open) {
      nodes {
        ...IssuePickerIssue @relay(mask: false)
      }
    }
    # Do not return resource unless it is an Issue
    resource: resource(url: $resource) @include(if: $queryIsUrl) {
      ...IssuePickerIssue @relay(mask: false)
    }
  }
`

export const IssueFragment = graphql`
  fragment IssuePickerIssue on Issue {
    id
    title
    state
    stateReason
    repository {
      nameWithOwner
    }
    # Adding this to the main fragment, although it's not used to avoid introducing relay in Memex
    # eslint-disable-next-line relay/unused-fields
    databaseId
    number
    __typename
  }
`

// Handles debouncing queries to fetch issues based on the current filter
const useIssueFiltering = (
  filter: string,
  owner: string = '',
  repositoryNameWithOwner?: string,
): {
  isLoading: boolean
  isError: boolean
  data: IssuePickerSearchQuery$data | null
} => {
  const environment = useRelayEnvironment()

  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<IssuePickerSearchQuery$data | null>(null)

  const fetchSearchData = useCallback(
    (nextFilter: string) =>
      clientSideRelayFetchQueryRetained<IssuePickerSearchQuery>({
        environment,
        query: IssuePickerSearchGraphQLQuery,
        variables: getIssueSearchQueries(owner, nextFilter, repositoryNameWithOwner),
      }).subscribe({
        next: (innerData: IssuePickerSearchQuery$data) => {
          setData(innerData ?? null)
          setIsLoading(false)
          setIsError(false)
        },
        error: () => {
          setIsError(true)
          setIsLoading(false)
        },
      }),
    [environment, owner, repositoryNameWithOwner],
  )

  const debounceFetchSearchData = useDebounce(
    (nextValue: string) => fetchSearchData(nextValue),
    VALUES.pickerDebounceTime,
  )

  useEffect(() => {
    debounceFetchSearchData(filter)
  }, [debounceFetchSearchData, filter])

  return {isLoading, isError, data}
}

export function LazyIssuePicker({
  onIssueSelection,
  selectedIssueIds,
  hiddenIssueIds,
  owner,
  repositoryNameWithOwner,
  ...rest
}: LazyIssuePickerProps) {
  const [filter, setFilter] = useState('')
  const {isLoading, isError, data} = useIssueFiltering(filter, owner, repositoryNameWithOwner)

  // Render a fallback if there is an error fetching the data from the filter
  const {createFallbackComponent} = useItemPickerErrorFallback({
    errorMessage: LABELS.cantEditItems('issues'),
    anchorElement: rest.anchorElement,
    open: true,
  })
  if (isError) {
    return createFallbackComponent(() => {})
  }

  return (
    <IssuePickerInternal
      paginatedKey={data}
      isLoading={isLoading}
      {...rest}
      selectedIssueIds={selectedIssueIds}
      hiddenIssueIds={hiddenIssueIds}
      filter={filter}
      setFilter={setFilter}
      onIssueSelection={onIssueSelection}
      repositoryNameWithOwner={repositoryNameWithOwner}
    />
  )
}

function IssuePickerInternal({
  paginatedKey,
  onIssueSelection,
  anchorElement,
  setFilter,
  isLoading,
  title,
  onClose,
  triggerOpen,
  hiddenIssueIds,
  selectedIssueIds,
}: IssuePickerInternalProps) {
  const environment = useRelayEnvironment()
  const data = useFragment(IssuePickerQueryFragment, paginatedKey)
  const [fetchedSelectedIssues, setFetchedSelectedIssues] = useState<Record<string, IssuePickerItem>>({})

  const fetchSelectedIssues = useCallback(
    (ids: string[]) => {
      return new Promise<IssuePickerSelectedIssuesQuery$data>((resolve, reject) => {
        clientSideRelayFetchQueryRetained<IssuePickerSelectedIssuesQuery>({
          environment,
          query: IssuePickerSelectedIssuesGraphQLQuery,
          variables: {ids},
        }).subscribe({
          next: (fetchedData: IssuePickerSelectedIssuesQuery$data) => {
            if (fetchedData !== null) {
              resolve(fetchedData)
            }
          },
          error: (error: Error) => {
            reject(error)
          },
        })
      })
    },
    [environment],
  )

  const queriedIssuesMap: Map<string, IssuePickerItem> = useMemo(() => {
    if (!data) {
      return new Map()
    }

    // When resource is returned, we only want to show that issue as the user's intent is to
    // select a specific issue otherwise, we show all the issues from the search queries
    if (data.resource?.__typename === 'Issue') {
      return new Map([[data.resource?.id, data.resource]])
    }

    // Order the unique issues from each of the queries. Changing the order of this spread
    // will change the relative priority of each individual search query.
    const searchResultNodes = [
      ...(data.commenters?.nodes || []),
      ...(data.mentions?.nodes || []),
      ...(data.assignee?.nodes || []),
      ...(data.author?.nodes || []),
      ...(data.open?.nodes || []),
    ]

    type searchResultNode = (typeof searchResultNodes)[0]

    const issueNodes = searchResultNodes.filter((node: searchResultNode): node is IssuePickerItem => {
      return node?.__typename === 'Issue'
    })

    const issuesMap = new Map<string, IssuePickerItem>()

    for (const issue of issueNodes) {
      if (hiddenIssueIds?.some(id => id === issue.id)) {
        continue
      }

      issuesMap.set(issue.id, issue)
    }

    return issuesMap
  }, [data, hiddenIssueIds])

  useEffect(() => {
    // Wait until the data is fetched before fetching any missing selected issues
    if (!data) return

    async function doFetch(missingIssueIds: string[]) {
      const {nodes = []} = await fetchSelectedIssues(missingIssueIds)
      for (const node of nodes) {
        if (!node || node.__typename !== 'Issue') continue
        setFetchedSelectedIssues(loadedSelectedIssuesMap => {
          return {...loadedSelectedIssuesMap, [node.id]: node}
        })
      }
    }

    // Check if the selected issues are already fetched and cache
    // them to avoid bugs when they're not returned in subsequent queries
    if (selectedIssueIds) {
      const missingIssueIds = []
      for (const selectedIssueId of selectedIssueIds) {
        const foundSelectedIssue = queriedIssuesMap.get(selectedIssueId)

        if (foundSelectedIssue) {
          setFetchedSelectedIssues(loadedSelectedIssuesMap => {
            return {...loadedSelectedIssuesMap, [selectedIssueId]: foundSelectedIssue}
          })
        } else if (!fetchedSelectedIssues?.[selectedIssueId]) {
          missingIssueIds.push(selectedIssueId)
        }
      }

      if (missingIssueIds.length > 0) {
        doFetch(missingIssueIds)
      }
    }
    // We only need to run this after the initial query, as we'll have
    // cached the selected issues for subsequent queries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, queriedIssuesMap])

  // Merge the fetched selected issues with the queried issues and ensure there are no duplicates
  for (const [id, issue] of Object.entries(fetchedSelectedIssues)) {
    queriedIssuesMap.set(id, issue)
  }

  const allIssues = Array.from(queriedIssuesMap.values())

  const convertToItemProps = useCallback(
    (issue: IssuePickerItem) => {
      let icon = IssueOpenedIcon
      let fill = 'open.fg'

      if (issue.state === 'CLOSED') {
        icon = issue.stateReason === 'COMPLETED' ? IssueClosedIcon : SkipIcon
        fill = issue.stateReason === 'COMPLETED' ? 'done.fg' : 'muted.fg'
      }

      const issueIsSelected = selectedIssueIds?.includes(issue.id)

      return {
        id: issue.id,
        text: issue.title,
        sx: {wordBreak: 'break-word'},
        source: issue,
        groupId: issueIsSelected ? selectedGroup.groupId : suggestionGroup.groupId,
        leadingVisual: () => <Octicon icon={icon} sx={{path: {fill}}} />,
        trailingVisual: () => <Text sx={{color: 'fg.muted'}}>{`#${issue.number}`}</Text>,
        // Show NWO when the issue is selected as it might reside in another repository than what is being queried.
        description: issueIsSelected ? issue.repository.nameWithOwner : undefined,
        descriptionVariant: 'block' as const,
      }
    },
    [selectedIssueIds],
  )

  const issuePickerRef = useRef<HTMLButtonElement>(null)

  return (
    <ItemPicker
      loading={isLoading}
      items={allIssues}
      initialSelectedItems={selectedIssueIds || []}
      filterItems={setFilter}
      title={title || LABELS.issueHeader}
      getItemKey={getItemKey}
      convertToItemProps={convertToItemProps}
      placeholderText="Search issues"
      selectionVariant="single"
      onSelectionChange={onIssueSelection}
      renderAnchor={anchorElement}
      height="large"
      width="medium"
      resultListAriaLabel="issue results"
      selectPanelRef={issuePickerRef}
      triggerOpen={triggerOpen}
      groups={groups}
      onClose={onClose}
    />
  )
}
