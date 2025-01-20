import {MilestoneIcon} from '@primer/octicons-react'
import type React from 'react'
import {useCallback, useEffect, useMemo, useState, type RefObject, useRef, forwardRef} from 'react'
import {fetchQuery, graphql, readInlineData, useFragment, useRelayEnvironment} from 'react-relay'

import {VALUES} from '../constants/values'
import {HOTKEYS} from '../constants/hotkeys'
import {LABELS} from '../constants/labels'
import {SPECIAL_VALUES} from '../constants/placeholders'
import type {
  MilestonePickerMilestone$data,
  MilestonePickerMilestone$key,
} from './__generated__/MilestonePickerMilestone.graphql'
import type {MilestonePickerQuery} from './__generated__/MilestonePickerQuery.graphql'
import {type ExtendedItemProps, ItemPicker, type SharedBulkActionsItemPickerProps} from './ItemPicker'
import type {ItemGroup} from '../shared'
import {SharedPicker} from './SharedPicker'
import {commitUpdateIssueMilestoneBulkByQueryMutation} from '../mutations/update-issue-milestone-bulk-by-query-mutation'
import {commitUpdateIssueMilestoneBulkMutation} from '../mutations/update-issue-milestone-bulk-mutation'
import type {updateIssueMilestoneBulkMutation$data} from '../mutations/__generated__/updateIssueMilestoneBulkMutation.graphql'
import type {updateIssueMilestoneBulkByQueryMutation$data} from '../mutations/__generated__/updateIssueMilestoneBulkByQueryMutation.graphql'
import {useItemPickerErrorFallback} from './useItemPickerErrorFallback'
import {clientSideRelayFetchQueryRetained} from '@github-ui/relay-environment'
import {IS_SERVER} from '@github-ui/ssr-utils'
import type {MilestonePickerSearchQuery} from './__generated__/MilestonePickerSearchQuery.graphql'
import {ERRORS} from '../constants/errors'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import type {MilestonePickerRecentlyUpdatedMilestones$key} from './__generated__/MilestonePickerRecentlyUpdatedMilestones.graphql'
import {useDebounce} from '@github-ui/use-debounce'
import {LazyItemPicker} from './LazyItemPicker'
import {MilestoneDescription} from './MilestoneDescription'
import {hasFuzzyMatch} from '@github-ui/fuzzy-score/has-fuzzy-match'

//
// ItemPicker <== ItemPickerWrapper (internal) <== ItemPickerFetcher (internal) <== MilestonePicker (exported)
//                                                                              <== BulkMilestonePicker (exported)

export type Milestone = MilestonePickerMilestone$data

export type MilestonePickerProps = {
  repo: string
  owner: string
  activeMilestone: Milestone | null
  readonly?: boolean
  insidePortal?: boolean
  shortcutEnabled: boolean
  anchorElement: (props: React.HTMLAttributes<HTMLElement>, ref: RefObject<HTMLButtonElement>) => JSX.Element
  /**
   * Whether to render the milestone picker as a nested select panel (true) versus a standalone select
   * panel (false; default).
   */
  nested?: boolean
  triggerOpen?: boolean
  initialFilter?: string
  shortcutHintVisible?: boolean
  noMilestoneItem?: ExtendedItemProps<MilestonePickerMilestone$data>
  onSelectionChanged: (selectedItems: Milestone[]) => void
  showMilestoneDescription?: boolean
  title?: string
}

type ItemPickerWrapperProps = MilestonePickerProps & {
  milestonesKey: MilestonePickerRecentlyUpdatedMilestones$key | null
  isLoading: boolean
}

const openGroup: ItemGroup = {groupId: 'open', header: {title: 'Open', variant: 'filled'}}
const closedGroup: ItemGroup = {groupId: 'closed', header: {title: 'Closed', variant: 'filled'}}

export const MilestonesPickerGraphqlQuery = graphql`
  query MilestonePickerQuery($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      ...MilestonePickerRecentlyUpdatedMilestones
    }
  }
`

const RecentlyUpdatedMilestones = graphql`
  fragment MilestonePickerRecentlyUpdatedMilestones on Repository
  @argumentDefinitions(count: {type: "Int", defaultValue: 100})
  @refetchable(queryName: "RecentlyUpdatedMilestoneQuery") {
    milestones(first: $count, orderBy: {field: UPDATED_AT, direction: DESC}, orderByStates: [OPEN, CLOSED]) {
      nodes {
        ...MilestonePickerMilestone
      }
    }
  }
`

export const MilestonePickerSearchGraphqlQuery = graphql`
  query MilestonePickerSearchQuery($owner: String!, $repo: String!, $query: String, $count: Int!) {
    repository(owner: $owner, name: $repo) {
      milestones(query: $query, first: $count, orderByStates: [OPEN, CLOSED]) {
        nodes {
          ...MilestonePickerMilestone
        }
      }
    }
  }
`

export const MilestoneFragment = graphql`
  fragment MilestonePickerMilestone on Milestone @inline {
    id
    title
    closed
    # eslint-disable-next-line relay/unused-fields
    dueOn
    # eslint-disable-next-line relay/unused-fields
    progressPercentage
    # eslint-disable-next-line relay/unused-fields
    url
    # eslint-disable-next-line relay/unused-fields
    closedAt
  }
`

function ItemPickerFetcher({repo, owner, ...rest}: MilestonePickerProps) {
  const environment = useRelayEnvironment()
  const [isLoading, setIsLoading] = useState(true)
  const [fetchKey, setFetchKey] = useState(0)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<MilestonePickerRecentlyUpdatedMilestones$key | null>(null)

  useEffect(() => {
    if (!IS_SERVER) {
      clientSideRelayFetchQueryRetained<MilestonePickerQuery>({
        environment,
        query: MilestonesPickerGraphqlQuery,
        variables: {owner, repo},
      }).subscribe({
        next: internalData => {
          setData(internalData.repository ?? null)
          setIsLoading(false)
          setIsError(false)
        },
        error: () => {
          setIsError(true)
          setIsLoading(false)
        },
      })
    }
  }, [environment, fetchKey, owner, repo])

  const anchorRef = useRef<HTMLButtonElement>(null)

  const {createFallbackComponent} = useItemPickerErrorFallback({
    errorMessage: LABELS.cantEditItems('milestones'),
    anchorElement: anchorProps => rest.anchorElement(anchorProps, anchorRef),
    open: true,
  })

  if (isError) {
    return createFallbackComponent(() => setFetchKey(current => current + 1))
  }

  return <ItemPickerWrapper repo={repo} owner={owner} milestonesKey={data} isLoading={isLoading} {...rest} />
}

function ItemPickerWrapper({
  repo,
  owner,
  milestonesKey,
  activeMilestone,
  onSelectionChanged,
  insidePortal,
  shortcutEnabled,
  anchorElement,
  nested,
  triggerOpen,
  initialFilter,
  isLoading,
  noMilestoneItem,
  showMilestoneDescription,
  title,
}: ItemPickerWrapperProps) {
  const environment = useRelayEnvironment()
  const [filter, setFilter] = useState('')
  const [isServerFetching, setIsServerFetching] = useState(false)
  const [searchedMilestones, setSearchedMilestones] = useState<MilestonePickerMilestone$data[] | undefined>()
  const {addToast} = useToastContext()

  const data = useFragment(RecentlyUpdatedMilestones, milestonesKey)

  const fetchedMilestones = useMemo(
    () =>
      data?.milestones?.nodes?.flatMap(milestone =>
        // eslint-disable-next-line no-restricted-syntax
        milestone ? [readInlineData<MilestonePickerMilestone$key>(MilestoneFragment, milestone)] : [],
      ) || [],
    [data],
  )

  const items = useMemo(() => {
    if (searchedMilestones !== undefined) return searchedMilestones

    const repositoryMilestones = fetchedMilestones.slice().sort((a, b) => a.title.localeCompare(b.title))
    noMilestoneItem && repositoryMilestones.unshift(SPECIAL_VALUES.noMilestoneData as MilestonePickerMilestone$data)
    if (!filter) return repositoryMilestones
    return repositoryMilestones.filter(l => l.title.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
  }, [fetchedMilestones, filter, noMilestoneItem, searchedMilestones])

  const isNoMilestoneSelected = noMilestoneItem && noMilestoneItem.selected

  const openItems = useMemo(() => {
    if (noMilestoneItem) {
      return items.filter(m => m.closed === false)
    } else {
      return []
    }
  }, [noMilestoneItem, items])

  const searchMilestones = useCallback(
    async (query: string) => {
      setIsServerFetching(true)
      setFilter(query)

      try {
        const fetchedData = await fetchQuery<MilestonePickerSearchQuery>(
          environment,
          MilestonePickerSearchGraphqlQuery,
          {
            query,
            owner,
            repo,
            count: 10,
          },
        ).toPromise()

        if (fetchedData !== undefined) {
          const parsedNodes = (fetchedData.repository?.milestones?.nodes || []).flatMap(
            // eslint-disable-next-line no-restricted-syntax
            node => (node ? [readInlineData<MilestonePickerMilestone$key>(MilestoneFragment, node)] : []),
          )

          if (noMilestoneItem && hasFuzzyMatch(query, noMilestoneItem.source?.title ?? '')) {
            parsedNodes.unshift(SPECIAL_VALUES.noMilestoneData as MilestonePickerMilestone$data)
          }

          setSearchedMilestones(parsedNodes)
        }
      } catch {
        // Temporarily disabling this until we have a standard way of displaying fetch errors
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: ERRORS.couldNotSearchLabels,
        })
      } finally {
        setIsServerFetching(false)
      }
    },
    [addToast, environment, noMilestoneItem, owner, repo],
  )

  const debounceFetchSearchData = useDebounce(
    (nextValue: string) => searchMilestones(nextValue),
    VALUES.pickerDebounceTime,
  )

  const filterItems = useCallback(
    async (value: string) => {
      const trimmedFilter = value.trim()
      if (filter === trimmedFilter) {
        return
      }

      if (trimmedFilter === '') {
        setSearchedMilestones(undefined)
        setFilter(trimmedFilter)
        return
      }

      debounceFetchSearchData(trimmedFilter)
    },
    [debounceFetchSearchData, filter],
  )

  const getItemKey = useCallback((milestone: Milestone) => milestone.id, [])

  const convertToItemProps = useCallback(
    (milestone: Milestone): ExtendedItemProps<Milestone> => {
      if (noMilestoneItem && milestone.id === SPECIAL_VALUES.noMilestoneData.id) {
        return {...noMilestoneItem}
      }

      const {closed, closedAt, progressPercentage, dueOn} = milestone

      return {
        id: milestone.id,
        text: milestone.title,
        description: showMilestoneDescription
          ? ((
              <MilestoneDescription
                closed={closed}
                closedAt={closedAt}
                progressPercentage={progressPercentage}
                dueOn={dueOn}
                showProgressPercentage={false}
              />
            ) as unknown as string)
          : undefined,
        descriptionVariant: 'block',
        sx: {wordBreak: 'break-word'},
        source: milestone,
        groupId: milestone.closed ? closedGroup.groupId : openGroup.groupId,
        leadingVisual: () => <MilestoneIcon size={16} />,
      }
    },
    [noMilestoneItem, showMilestoneDescription],
  )

  // Only show groups for which the filter returns at least one item
  const groups: ItemGroup[] = useMemo(() => {
    const itemGroups = []
    if (items.some(i => !i.closed)) {
      itemGroups.push(openGroup)
    }
    if (items.some(i => i.closed)) {
      itemGroups.push(closedGroup)
    }
    return itemGroups
  }, [items])

  if (noMilestoneItem && isNoMilestoneSelected) {
    activeMilestone = SPECIAL_VALUES.noMilestoneData as MilestonePickerMilestone$data
  }

  const anchorRef = useRef<HTMLButtonElement>(null)

  return (
    <ItemPicker
      loading={isLoading || isServerFetching}
      items={noMilestoneItem ? openItems : items}
      initialSelectedItems={activeMilestone ? [activeMilestone] : []}
      openHotkey={shortcutEnabled ? HOTKEYS.milestonePicker : undefined}
      filterItems={filterItems}
      title={title ?? LABELS.milestonesHeader}
      getItemKey={getItemKey}
      convertToItemProps={convertToItemProps}
      placeholderText={`Filter milestones ${
        fetchedMilestones.length >= VALUES.milestonesMaxPreloadCount
          ? `(${VALUES.milestonesMaxPreloadCount} milestones loaded)`
          : ''
      }`}
      selectionVariant="single"
      onSelectionChange={onSelectionChanged}
      groups={noMilestoneItem ? undefined : groups}
      renderAnchor={props => anchorElement(props, anchorRef)}
      insidePortal={insidePortal}
      height={'large'}
      width={'medium'}
      nested={nested}
      resultListAriaLabel={'Milestone results'}
      triggerOpen={triggerOpen}
      initialFilter={initialFilter}
      selectPanelRef={anchorRef}
      keybindingCommandId="item-pickers:open-milestone"
    />
  )
}

type BulkIssueMilestonePickerProps = Omit<MilestonePickerProps, 'issueId' | 'onIssueUpdate' | 'onSelectionChanged'> &
  SharedBulkActionsItemPickerProps

export function BulkIssueMilestonePicker({
  onError,
  onCompleted,
  issuesToActOn,
  useQueryForAction,
  repositoryId,
  query,
  ...rest
}: BulkIssueMilestonePickerProps) {
  const environment = useRelayEnvironment()
  const onSelectionChange = useCallback(
    (selectedMilestone: Milestone[]) => {
      const milestoneId = selectedMilestone.length === 1 ? selectedMilestone[0]?.id : null
      if (!milestoneId) return
      const mutationArgs = {
        environment,
        onError: (error: Error) => {
          onError?.(error)
        },
      }

      if (useQueryForAction && repositoryId && query) {
        commitUpdateIssueMilestoneBulkByQueryMutation({
          ...mutationArgs,
          input: {
            repositoryId,
            query,
            milestoneId,
          },
          onCompleted: ({updateIssuesBulkByQuery}: updateIssueMilestoneBulkByQueryMutation$data) => {
            onCompleted?.(updateIssuesBulkByQuery?.jobId || undefined)
          },
        })
      } else {
        commitUpdateIssueMilestoneBulkMutation({
          ...mutationArgs,
          input: {
            ids: [...issuesToActOn],
            milestoneId,
          },
          onCompleted: ({updateIssuesBulk}: updateIssueMilestoneBulkMutation$data) => {
            onCompleted?.(updateIssuesBulk?.jobId || undefined)
          },
        })
      }
    },
    [environment, issuesToActOn, onCompleted, onError, query, repositoryId, useQueryForAction],
  )

  return <MilestonePicker onSelectionChanged={onSelectionChange} {...rest} />
}

export function MilestonePicker({
  repo,
  owner,
  shortcutEnabled,
  anchorElement,
  readonly,
  activeMilestone,
  noMilestoneItem,
  ...rest
}: MilestonePickerProps) {
  return (
    <LazyItemPicker
      hotkey={shortcutEnabled ? HOTKEYS.milestonePicker : undefined}
      keybindingCommandId="item-pickers:open-milestone"
      anchorElement={(ref, anchorProps) => anchorElement(ref, anchorProps)}
      createChild={() => (
        <ItemPickerFetcher
          repo={repo}
          owner={owner}
          readonly={readonly}
          shortcutEnabled={shortcutEnabled}
          initialFilter={''}
          activeMilestone={activeMilestone}
          triggerOpen={true}
          anchorElement={anchorElement}
          noMilestoneItem={noMilestoneItem}
          {...rest}
        />
      )}
      insidePortal={rest.insidePortal}
    />
  )
}

type DefaultMilestonePickerAnchorProps = Pick<MilestonePickerProps, 'activeMilestone' | 'readonly' | 'nested'> & {
  anchorProps?: React.HTMLAttributes<HTMLElement> | undefined
}

export const DefaultMilestonePickerAnchor = forwardRef<HTMLButtonElement, DefaultMilestonePickerAnchorProps>(
  ({activeMilestone, readonly, nested, anchorProps}, ref) => {
    return (
      <SharedPicker
        anchorText={LABELS.noMilestones}
        sharedPickerMainValue={activeMilestone?.title}
        anchorProps={readonly ? undefined : anchorProps}
        ariaLabel={LABELS.selectMilestones}
        readonly={readonly}
        nested={nested}
        leadingIcon={MilestoneIcon}
        hotKey={undefined}
        ref={ref}
      />
    )
  },
)

DefaultMilestonePickerAnchor.displayName = 'DefaultMilestonePickerAnchor'
