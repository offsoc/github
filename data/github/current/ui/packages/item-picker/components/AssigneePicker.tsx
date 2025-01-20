import {GitHubAvatar} from '@github-ui/github-avatar'
import {useDebounce} from '@github-ui/use-debounce'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {Box} from '@primer/react'
import type React from 'react'
import {useCallback, useEffect, useMemo, useRef, useState, type RefObject, forwardRef} from 'react'
import {fetchQuery, graphql, readInlineData, useRelayEnvironment} from 'react-relay'

import {clientSideRelayFetchQueryRetained} from '@github-ui/relay-environment'
import {ERRORS} from '../constants/errors'
import {HOTKEYS} from '../constants/hotkeys'
import {LABELS} from '../constants/labels'
import {commitUpdateIssueAssigneesBulkMutation} from '../mutations/update-issue-assignees-bulk-mutation'
import type {
  AssigneePickerAssignee$data,
  AssigneePickerAssignee$key,
} from './__generated__/AssigneePickerAssignee.graphql'
import type {
  AssigneePickerSearchAssignableRepositoryUsersWithLoginsQuery,
  AssigneePickerSearchAssignableRepositoryUsersWithLoginsQuery$data,
} from './__generated__/AssigneePickerSearchAssignableRepositoryUsersWithLoginsQuery.graphql'
import type {
  AssigneePickerSearchAssignableRepositoryUsersWithQuery,
  AssigneePickerSearchAssignableRepositoryUsersWithQuery$data,
} from './__generated__/AssigneePickerSearchAssignableRepositoryUsersWithQuery.graphql'
import type {
  AssigneePickerSearchAssignableUsersQuery,
  AssigneePickerSearchAssignableUsersQuery$data,
} from './__generated__/AssigneePickerSearchAssignableUsersQuery.graphql'
import {type ExtendedItemProps, ItemPicker, type SharedBulkActionsItemPickerProps} from './ItemPicker'
import type {ItemGroup} from '../shared'
import type {updateIssueAssigneesBulkMutation$data} from '../mutations/__generated__/updateIssueAssigneesBulkMutation.graphql'
import {commitUpdateIssueAssigneesBulkByQueryMutation} from '../mutations/update-issue-assignees-bulk-by-query-mutation'
import type {updateIssueAssigneesBulkByQueryMutation$data} from '../mutations/__generated__/updateIssueAssigneesBulkByQueryMutation.graphql'
import {assigneesGroup, getGroupItemId, sortAssigneePickerUsers, suggestionsGroup} from './AssigneePickerUtils'
import {VALUES} from '../constants/values'
import {IS_SERVER} from '@github-ui/ssr-utils'
import {CompressedAssigneeAnchor} from './CompressedAssigneeAnchor'
import {LazyItemPicker} from './LazyItemPicker'
import type {
  AssigneePickerViewerQuery,
  AssigneePickerViewerQuery$data,
} from './__generated__/AssigneePickerViewerQuery.graphql'
import {SPECIAL_VALUES} from '../constants/placeholders'
import {fuzzyFilter} from '@github-ui/fuzzy-score/fuzzy-filter'
import {hasFuzzyMatch} from '@github-ui/fuzzy-score/has-fuzzy-match'

export type Assignee = AssigneePickerAssignee$data

type Name = 'assignee' | 'author'

export type AssigneePickerProps = {
  repo: string
  owner: string
  readonly: boolean
  /** An optional data set to be used when the picker is first opened. If this data is not provided, a loading state
   * is shown in the picker and the data is loaded on demand.
   */
  suggestions?: AssigneePickerAssignee$data[]
  assignees: Assignee[]
  insidePortal?: boolean
  shortcutEnabled: boolean
  noAssigneeOption?: ExtendedItemProps<Assignee>
  selectionVariant?: 'single' | 'multiple'
  anchorElement: (props: React.HTMLAttributes<HTMLElement>, ref: RefObject<HTMLButtonElement>) => JSX.Element
  onSelectionChange: (selectedAssignees: Assignee[]) => void
  /**
   * Whether to render the assignee picker as a nested select panel (true) versus a standalone select
   * panel (false; default).
   */
  nested?: boolean
  triggerOpen?: boolean
  title?: string
  name?: Name
  maximumAssignees?: number
  showNoMatchItem?: boolean
}

export type AssigneeIssuePickerProps = AssigneePickerProps & {
  number: number
}

export type AssigneeRepositoryPickerProps = AssigneePickerProps & {
  assigneeTokens: string[]
}

type ItemPickerWrapperProps = AssigneePickerProps & {
  searchAssignees: (query: string) => Promise<Assignee[]> | Assignee[]
  isLoading?: boolean
  suggestions: AssigneePickerAssignee$data[]
}

type BulkAssigneePickerProps = Omit<AssigneePickerProps, 'id' | 'assignees' | 'onSelectionChange'> & {
  assigneesAppliedToAll: AssigneePickerAssignee$data[]
  assigneesAppliedToSome: AssigneePickerAssignee$data[]
  existingIssueAssignees: Map<string, string[]>
  connectionIds: {[key: string]: string[]}
} & SharedBulkActionsItemPickerProps

// note: when the query variable is empty, this the suggestedAssignees resolvers is returning the participants
export const SearchAssignableUsersQuery = graphql`
  query AssigneePickerSearchAssignableUsersQuery(
    $owner: String!
    $name: String!
    $number: Int!
    $query: String!
    $first: Int!
  ) {
    repository(owner: $owner, name: $name) {
      issueOrPullRequest(number: $number) {
        ... on Assignable {
          suggestedAssignees(first: $first, query: $query) {
            nodes {
              ...AssigneePickerAssignee
            }
          }
        }
      }
    }
  }
`

const SearchAssignableRepositoryUsersWithQuery = graphql`
  query AssigneePickerSearchAssignableRepositoryUsersWithQuery(
    $owner: String!
    $name: String!
    $query: String!
    $first: Int!
  ) {
    repository(owner: $owner, name: $name) {
      assignableUsers(query: $query, first: $first) {
        nodes {
          ...AssigneePickerAssignee
        }
        totalCount
      }
    }
  }
`

export const SearchAssignableRepositoryUsersWithLoginsQuery = graphql`
  query AssigneePickerSearchAssignableRepositoryUsersWithLoginsQuery(
    $owner: String!
    $name: String!
    $query: String!
    $first: Int!
  ) {
    repository(owner: $owner, name: $name) {
      assignableUsers(loginNames: $query, first: $first) {
        nodes {
          ...AssigneePickerAssignee
        }
      }
    }
  }
`

export const AssigneeFragment = graphql`
  fragment AssigneePickerAssignee on User @inline {
    id
    login
    name
    avatarUrl(size: 64)
  }
`

export const ViewerQuery = graphql`
  query AssigneePickerViewerQuery {
    safeViewer {
      ...AssigneePickerAssignee
    }
  }
`

// a utility hook that provides a stateful access to the current viewer
// it will use the relay store to first look for the data and do a query over the network if needed
export function useViewer(): AssigneePickerAssignee$data | undefined {
  const environment = useRelayEnvironment()
  const [viewer, setViewer] = useState<AssigneePickerAssignee$data | undefined>()

  useEffect(() => {
    if (!IS_SERVER) {
      clientSideRelayFetchQueryRetained<AssigneePickerViewerQuery>({
        environment,
        query: ViewerQuery,
        variables: {},
      }).subscribe({
        next: (data: AssigneePickerViewerQuery$data) => {
          if (data.safeViewer) {
            // eslint-disable-next-line no-restricted-syntax
            const currentViewer = readInlineData<AssigneePickerAssignee$key>(AssigneeFragment, data.safeViewer)
            setViewer(currentViewer)
          }
        },
      })
    }
  }, [environment])

  return viewer
}

export function AssigneePicker({anchorElement, shortcutEnabled, ...props}: AssigneeIssuePickerProps) {
  return (
    <LazyItemPicker
      hotkey={shortcutEnabled ? HOTKEYS.assigneePicker : undefined}
      anchorElement={(anchorProps, ref) => anchorElement(anchorProps, ref)}
      createChild={() => (
        <AssigneePickerInternal
          anchorElement={(ref, anchorProps) => anchorElement(ref, anchorProps)}
          shortcutEnabled={shortcutEnabled}
          triggerOpen={true}
          {...props}
        />
      )}
      insidePortal={props.insidePortal}
      keybindingCommandId="item-pickers:open-assignees"
    />
  )
}

export function AssigneeRepositoryPicker({shortcutEnabled, anchorElement, ...props}: AssigneeRepositoryPickerProps) {
  return (
    <LazyItemPicker
      hotkey={shortcutEnabled ? HOTKEYS.assigneePicker : undefined}
      anchorElement={(anchorProps, ref) => anchorElement(anchorProps, ref)}
      keybindingCommandId="item-pickers:open-assignees"
      createChild={() => (
        <AssigneeRepositoryPickerInternal
          shortcutEnabled={shortcutEnabled}
          anchorElement={anchorElement}
          triggerOpen={true}
          {...props}
        />
      )}
    />
  )
}

function AssigneeRepositoryPickerInternal({
  repo,
  owner,
  assignees,
  assigneeTokens,
  suggestions,
  maximumAssignees,
  ...props
}: AssigneeRepositoryPickerProps & {assigneeTokens: string[]}) {
  const environment = useRelayEnvironment()
  const mustFetchData = assigneeTokens.length > 0
  const [isLoading, setIsLoading] = useState(suggestions ? false : true)
  const [data, setData] = useState<AssigneePickerSearchAssignableRepositoryUsersWithLoginsQuery$data | null>(null)
  const [suggestedAssignees, setSuggestedAssignees] = useState<Assignee[] | null>(null)
  const [totalAssignableUsers, setTotalAssignableUsers] = useState<number | null>(null)

  useEffect(() => {
    if (!IS_SERVER && mustFetchData) {
      clientSideRelayFetchQueryRetained<AssigneePickerSearchAssignableRepositoryUsersWithLoginsQuery>({
        environment,
        query: SearchAssignableRepositoryUsersWithLoginsQuery,
        variables: {owner, name: repo, query: assigneeTokens.join(','), first: assigneeTokens.length},
      }).subscribe({
        next: internalData => {
          setData(internalData ?? null)
          setIsLoading(false)
        },
        error: () => {
          setIsLoading(false)
        },
      })
    }
  }, [environment, owner, repo, assigneeTokens, mustFetchData])

  const searchAssignees = useCallback(
    (query: string) => {
      if (totalAssignableUsers && totalAssignableUsers <= VALUES.maximumSuggestedUsers && suggestedAssignees) {
        setIsLoading(false)
        return fuzzyFilter<Assignee>({
          items: [
            ...suggestedAssignees,
            ...(props.noAssigneeOption ? [SPECIAL_VALUES.noAssigneeData as Assignee] : []),
          ],
          filter: query,
          key: (l: Assignee) => l.login || (props.noAssigneeOption?.source?.login ?? ''),
          secondaryKey: (l: Assignee) => `${l.name}`,
        })
      }

      return new Promise<Assignee[]>((resolve, reject) => {
        fetchQuery<AssigneePickerSearchAssignableRepositoryUsersWithQuery>(
          environment,
          SearchAssignableRepositoryUsersWithQuery,
          {
            owner,
            name: repo,
            query,
            first: VALUES.maximumSuggestedUsers,
          },
        ).subscribe({
          next: (response: AssigneePickerSearchAssignableRepositoryUsersWithQuery$data) => {
            if (response !== null) {
              const assignableUsers = (response.repository?.assignableUsers?.nodes || []).flatMap(node =>
                // eslint-disable-next-line no-restricted-syntax
                node ? [readInlineData<AssigneePickerAssignee$key>(AssigneeFragment, node)] : [],
              )
              if (totalAssignableUsers === null)
                setTotalAssignableUsers(response.repository?.assignableUsers?.totalCount || 0)

              if (props.noAssigneeOption && hasFuzzyMatch(query, props.noAssigneeOption?.source?.login ?? '')) {
                assignableUsers.unshift(SPECIAL_VALUES.noAssigneeData as Assignee)
              }

              setIsLoading(false)
              resolve(assignableUsers)
            }
          },
          error: (error: Error) => {
            reject(error)
            setIsLoading(false)
          },
        })
      })
    },
    [totalAssignableUsers, suggestedAssignees, props.noAssigneeOption, environment, owner, repo],
  )

  const selectedAssignees: AssigneePickerAssignee$data[] = useMemo(() => {
    let all: AssigneePickerAssignee$data[] = []
    if (assignees.length > 0) {
      all = assignees
    } else if (assigneeTokens.length > 0) {
      all = (data?.repository?.assignableUsers?.nodes || []).flatMap(participant =>
        participant
          ? // eslint-disable-next-line no-restricted-syntax
            [readInlineData<AssigneePickerAssignee$key>(AssigneeFragment, participant)]
          : [],
      )
    }

    if (props.noAssigneeOption?.selected) {
      all.unshift(SPECIAL_VALUES.noAssigneeData as Assignee)
    }

    return all
  }, [assigneeTokens.length, assignees, data?.repository?.assignableUsers?.nodes, props.noAssigneeOption?.selected])

  useEffect(() => {
    const fetchSuggestedAssignees = async () => {
      const result = await searchAssignees('')
      setSuggestedAssignees(result)
      setIsLoading(false)
    }

    fetchSuggestedAssignees()
    // disabling this as we only want to fetch the suggested assignees once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ItemPickerWrapper
      {...props}
      suggestions={suggestions ? suggestions : suggestedAssignees || []}
      repo={repo}
      owner={owner}
      isLoading={isLoading}
      assignees={selectedAssignees}
      searchAssignees={searchAssignees}
      maximumAssignees={maximumAssignees}
    />
  )
}

function AssigneePickerInternal({
  number,
  owner,
  repo,
  assignees,
  suggestions,
  maximumAssignees,
  ...props
}: AssigneeIssuePickerProps) {
  const environment = useRelayEnvironment()
  const hasPreloadedData = (suggestions?.length || 0) > 0
  const [isLoading, setIsLoading] = useState(!hasPreloadedData)
  const [data, setData] = useState<AssigneePickerSearchAssignableUsersQuery$data | null>(null)

  useEffect(() => {
    if (!IS_SERVER && !hasPreloadedData) {
      clientSideRelayFetchQueryRetained<AssigneePickerSearchAssignableUsersQuery>({
        environment,
        query: SearchAssignableUsersQuery,
        variables: {owner, name: repo, number, query: '', first: 10},
      }).subscribe({
        next: internalData => {
          setData(internalData ?? null)
          setIsLoading(false)
        },
        error: () => {
          setIsLoading(false)
        },
      })
    }
  }, [environment, owner, repo, number, hasPreloadedData])

  const suggestedAssignees = suggestions
    ? suggestions
    : (data?.repository?.issueOrPullRequest?.suggestedAssignees?.nodes || []).flatMap(assignee =>
        assignee
          ? [
              // eslint-disable-next-line no-restricted-syntax
              readInlineData<AssigneePickerAssignee$key>(AssigneeFragment, assignee),
            ]
          : [],
      )

  const searchAssignees = useCallback(
    (query: string) => {
      return new Promise<Assignee[]>((resolve, reject) => {
        fetchQuery<AssigneePickerSearchAssignableUsersQuery>(environment, SearchAssignableUsersQuery, {
          owner,
          name: repo,
          number,
          first: 10,
          query,
        }).subscribe({
          next: (response: AssigneePickerSearchAssignableUsersQuery$data) => {
            if (response !== null) {
              const nodes = (response.repository?.issueOrPullRequest?.suggestedAssignees?.nodes || []).flatMap(
                // eslint-disable-next-line no-restricted-syntax
                node => (node ? [readInlineData<AssigneePickerAssignee$key>(AssigneeFragment, node)] : []),
              )

              resolve(nodes)
            }
          },
          error: (error: Error) => {
            reject(error)
          },
        })
      })
    },
    [environment, number, owner, repo],
  )

  return (
    <ItemPickerWrapper
      {...props}
      repo={repo}
      owner={owner}
      isLoading={isLoading}
      assignees={assignees}
      suggestions={suggestedAssignees}
      maximumAssignees={maximumAssignees}
      searchAssignees={searchAssignees}
    />
  )
}

function ItemPickerWrapper({
  assignees,
  suggestions,
  searchAssignees,
  onSelectionChange,
  insidePortal,
  shortcutEnabled,
  anchorElement,
  nested,
  isLoading = false,
  noAssigneeOption = undefined,
  triggerOpen,
  selectionVariant = 'multiple',
  title,
  maximumAssignees,
  name = 'assignee',
  showNoMatchItem = false,
}: ItemPickerWrapperProps) {
  const [filter, setFilter] = useState('')
  const [searchResults, setSearchResults] = useState<Assignee[] | undefined>(undefined)
  const viewer = useViewer()
  const {addToast} = useToastContext()

  const getItemKey = useCallback((assignee: Assignee) => assignee.login, [])

  const items = useMemo(() => {
    let sortedItems = []
    if (searchResults) {
      sortedItems = sortAssigneePickerUsers(assignees, searchResults, filter)
    } else {
      sortedItems = sortAssigneePickerUsers(
        assignees,
        assignees.concat(
          suggestions.filter(suggestion => !assignees.find(assignee => assignee.login === suggestion.login)),
        ),
        filter,
      )
    }

    if (viewer) {
      const currentUserIndex = sortedItems.findIndex(item => item.login === viewer.login)
      if (currentUserIndex !== -1) {
        // Remove the current user from its current position in the list to avoid duplicates
        sortedItems.splice(currentUserIndex, 1)
      } else if (searchResults) {
        // If the current user is not in the search results, we don't want to show it in the suggestions
        return sortedItems
      }
      // Add the current user to the top of the list
      sortedItems.unshift(viewer)
    }

    if (
      noAssigneeOption &&
      !noAssigneeOption.selected &&
      !sortedItems.find(i => i.id === SPECIAL_VALUES.noAssigneeData.id)
    ) {
      sortedItems.unshift(SPECIAL_VALUES.noAssigneeData as Assignee)
    }

    return sortedItems
  }, [searchResults, viewer, noAssigneeOption, assignees, filter, suggestions])

  const groupItemId = useCallback((assignee: Assignee) => getGroupItemId(assignees, assignee), [assignees])

  const convertToItemProps = useCallback(
    (assignee: Assignee): ExtendedItemProps<Assignee> => {
      if (noAssigneeOption && assignee.id === SPECIAL_VALUES.noAssigneeData.id) {
        const noAssigneeItem = {...noAssigneeOption}
        noAssigneeItem.groupId = groupItemId(assignee)
        return noAssigneeItem
      }
      if (showNoMatchItem && assignee.id === SPECIAL_VALUES.noMatchData.id) {
        return {
          ...SPECIAL_VALUES.noMatchData,
          groupId: groupItemId(assignee),
          source: assignee,
          text: `${name}:${filter}`,
          sx: {wordBreak: 'break-word'},
        }
      }

      return {
        id: assignee.id,
        text: assignee.login,
        description: assignee.name ?? '',
        source: assignee,
        groupId: groupItemId(assignee),
        leadingVisual: () =>
          assignee.avatarUrl.length === 0 ? null : <GitHubAvatar alt={assignee.login} src={assignee.avatarUrl} />,
        sx: {wordBreak: 'break-word'},
      }
    },
    [filter, groupItemId, name, noAssigneeOption, showNoMatchItem],
  )

  const onClose = useCallback(() => {
    setSearchResults(undefined)
  }, [])

  const fetchSearchData = useCallback(
    async (query: string) => {
      if (query === '') {
        setSearchResults(undefined)
        return
      }

      try {
        const suggestedAssignees = await searchAssignees(query)
        setSearchResults(suggestedAssignees)
      } catch {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: ERRORS.couldNotSearchAssignees,
        })
      }
    },
    [addToast, searchAssignees],
  )

  const debounceFetchSearchData = useDebounce(
    (nextValue: string) => fetchSearchData(nextValue),
    VALUES.pickerDebounceTime,
    {
      leading: true,
      trailing: true,
      onChangeBehavior: 'flush',
    },
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

  const groups: ItemGroup[] = useMemo(() => {
    const itemGroups = []

    // Find items that are assignees and suggestions (non-assignees are suggestion items)
    const assigneeItems = items.filter(i => assignees.find(a => a.id === i.id))
    const suggestionItems = items.filter(i => !assignees.find(a => a.id === i.id))

    if (assigneeItems.length > 0) {
      itemGroups.push(assigneesGroup)
    }
    if (suggestionItems.length > 0) {
      itemGroups.push(suggestionsGroup)
    }
    return itemGroups
  }, [assignees, items])

  const anchorRef = useRef<HTMLButtonElement>(null)

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1}}>
      <ItemPicker
        items={items}
        initialSelectedItems={assignees}
        loading={isLoading}
        openHotkey={shortcutEnabled ? HOTKEYS.assigneePicker : undefined}
        filterItems={filterItems}
        title={title || LABELS.assigneesHeader(maximumAssignees ?? 10)}
        getItemKey={getItemKey}
        triggerOpen={triggerOpen}
        convertToItemProps={convertToItemProps}
        placeholderText={LABELS.filterUsers(name)}
        selectionVariant={maximumAssignees === 1 ? 'single' : selectionVariant || 'multiple'}
        onSelectionChange={onSelectionChange}
        onClose={onClose}
        renderAnchor={props => anchorElement(props, anchorRef)}
        groups={groups}
        insidePortal={insidePortal}
        height={'large'}
        width={'medium'}
        nested={nested}
        resultListAriaLabel={'User results'}
        selectPanelRef={anchorRef}
        customNoMatchItem={
          showNoMatchItem
            ? ({
                id: SPECIAL_VALUES.noMatchData.id,
                avatarUrl: SPECIAL_VALUES.noMatchData.avatarUrl,
                login: filter,
              } as Omit<AssigneePickerAssignee$data, '$fragmentType'>)
            : undefined
        }
        keybindingCommandId="item-pickers:open-assignees"
      />
    </Box>
  )
}

export function BulkIssuesAssigneePicker({
  useQueryForAction,
  repositoryId,
  query,
  issuesToActOn,
  assigneesAppliedToAll,
  assigneesAppliedToSome: _assigneesAppliedToSome,
  existingIssueAssignees,
  connectionIds,
  onError,
  onCompleted,
  ...rest
}: BulkAssigneePickerProps) {
  const environment = useRelayEnvironment()

  const onSelectionChange = useCallback(
    (selectedAssignees: AssigneePickerAssignee$data[]) => {
      const assigneesToAdd = selectedAssignees.filter(a => !assigneesAppliedToAll.some(aa => aa.id === a.id))
      const assigneesToRemove = assigneesAppliedToAll.filter(a => !selectedAssignees.some(aa => aa.id === a.id))
      const args = {
        applyAssigneeIds: assigneesToAdd.map(l => l.id),
        removeAssigneeIds: assigneesToRemove.map(l => l.id),
      }
      const mutationArgs = {
        environment,
        optimisticUpdateIds: issuesToActOn,
        existingIssueAssignees,
        connectionIds,
        onError: (error: Error) => {
          onError?.(error)
        },
      }
      if (useQueryForAction && repositoryId && query) {
        commitUpdateIssueAssigneesBulkByQueryMutation({
          ...mutationArgs,
          input: {
            repositoryId,
            query,
            ...args,
          },
          onCompleted: ({updateIssuesBulkByQuery}: updateIssueAssigneesBulkByQueryMutation$data) => {
            onCompleted?.(updateIssuesBulkByQuery?.jobId || undefined)
          },
        })
      } else {
        commitUpdateIssueAssigneesBulkMutation({
          ...mutationArgs,
          input: {
            ids: [...issuesToActOn],
            ...args,
          },
          onCompleted: ({updateIssuesBulk}: updateIssueAssigneesBulkMutation$data) => {
            onCompleted?.(updateIssuesBulk?.jobId || undefined)
          },
        })
      }
    },
    [
      assigneesAppliedToAll,
      connectionIds,
      environment,
      existingIssueAssignees,
      issuesToActOn,
      onCompleted,
      onError,
      query,
      repositoryId,
      useQueryForAction,
    ],
  )

  return (
    <AssigneeRepositoryPicker
      {...rest}
      assignees={assigneesAppliedToAll}
      assigneeTokens={[]}
      onSelectionChange={onSelectionChange}
    />
  )
}

type DefaultAssigneePickerAnchorProps = Pick<AssigneePickerProps, 'assignees' | 'readonly'> & {
  anchorProps?: React.HTMLAttributes<HTMLElement> | undefined
}

export const DefaultAssigneePickerAnchor = forwardRef<HTMLButtonElement, DefaultAssigneePickerAnchorProps>(
  ({assignees, readonly, anchorProps}, ref) => {
    return (
      <CompressedAssigneeAnchor
        assignees={assignees}
        displayHotkey={false}
        anchorProps={readonly ? undefined : anchorProps}
        readonly={readonly}
        ref={ref}
      />
    )
  },
)

DefaultAssigneePickerAnchor.displayName = 'DefaultAssigneePickerAnchor'
