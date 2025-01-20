import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {PlusIcon, TagIcon} from '@primer/octicons-react'
import {Box, LinkButton} from '@primer/react'
import type React from 'react'
import {forwardRef, useCallback, useEffect, useMemo, useRef, useState, type RefObject} from 'react'
import {graphql, readInlineData, useRelayEnvironment, fetchQuery, useFragment} from 'react-relay'
import {clientSideRelayFetchQueryRetained} from '@github-ui/relay-environment'

import {VALUES} from '../constants/values'
import {ERRORS} from '../constants/errors'
import {HOTKEYS} from '../constants/hotkeys'
import {LABELS} from '../constants/labels'
import {CompressedLabelsToken} from './CompressedLabelsToken'
import type {LabelPickerLabel$data, LabelPickerLabel$key} from './__generated__/LabelPickerLabel.graphql'
import type {LabelPickerLabelsPaginated$key} from './__generated__/LabelPickerLabelsPaginated.graphql'
import type {LabelPickerQuery} from './__generated__/LabelPickerQuery.graphql'
import {type ExtendedItemProps, ItemPicker, type SharedBulkActionsItemPickerProps} from './ItemPicker'
import type {ItemGroup} from '../shared'
import {commitUpdateIssueLabelsBulkMutation} from '../mutations/update-issue-labels-bulk-mutation'
import type {updateIssueLabelsBulkMutation$data} from '../mutations/__generated__/updateIssueLabelsBulkMutation.graphql'
import type {updateIssueLabelsBulkByQueryMutation$data} from '../mutations/__generated__/updateIssueLabelsBulkByQueryMutation.graphql'
import {commitUpdateIssueLabelsBulkByQueryMutation} from '../mutations/update-issue-labels-bulk-by-query-mutation'
import {useItemPickerErrorFallback} from './useItemPickerErrorFallback'
import {IS_SERVER, ssrSafeDocument} from '@github-ui/ssr-utils'
import {fuzzyFilter} from '@github-ui/fuzzy-score/fuzzy-filter'
import type {LabelPickerSearchQuery, LabelPickerSearchQuery$data} from './__generated__/LabelPickerSearchQuery.graphql'
import {URLS} from '../constants/urls'
import {useDebounce} from '@github-ui/use-debounce'
import {SPECIAL_VALUES} from '../constants/placeholders'
import {LazyItemPicker} from './LazyItemPicker'
import {commitCreateLabelMutation} from '../mutations/create-label-mutation'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList/Item'
import {hasFuzzyMatch} from '@github-ui/fuzzy-score/has-fuzzy-match'

//
// ItemPicker <== ItemPickerWrapper (internal) <== ItemPickerFetcher (internal) <== LabelPicker (exported)
//                                                                              <== BulkLabelPicker (exported)

export type LabelPickerProps = {
  repo: string
  owner: string
  readonly: boolean
  labels: LabelPickerLabel$data[]
  labelNames?: string[]
  insidePortal?: boolean
  shortcutEnabled: boolean
  noLabelOption?: ExtendedItemProps<LabelPickerLabel$data>
  anchorElement: (props: React.HTMLAttributes<HTMLElement>, ref: RefObject<HTMLButtonElement>) => JSX.Element
  onSelectionChanged: (selectedItems: LabelPickerLabel$data[]) => void
  /**
   * Whether to render the label picker as a nested select panel (true) versus a standalone select
   * panel (false; default).
   */
  nested?: boolean
  triggerOpen?: boolean
  initialFilter?: string
  title?: string
  showEditLabelsButton?: boolean
  showNoMatchItem?: boolean
}

type BulkLabelPickerProps = Omit<LabelPickerProps, 'onSelectionChanged' | 'labels'> & {
  existingIssueLabels: Map<string, string[]>
  labelAppliedToAll: LabelPickerLabel$data[]
  connectionIds: {[key: string]: string[]}
} & SharedBulkActionsItemPickerProps

type ItemPickerWrapperProps = Omit<LabelPickerProps, 'labelQueryRef'> & {
  paginatedKey: LabelPickerLabelsPaginated$key | null
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void

  /**
   * Callback to search for labels on the server.
   *
   * Only used when repository has more than VALUES.labelsMaxPreloadCount
   *
   * @param query filter query
   * @returns Search results
   */
  searchLabels?: (query: string) => Promise<LabelPickerLabel$data[]>
  repoNwo?: string
}

export const LabelPickerGraphqlQuery = graphql`
  query LabelPickerQuery(
    $owner: String!
    $repo: String!
    $shouldQueryByNames: Boolean = false
    $labelNames: String = ""
    $count: Int = 100
  ) {
    repository(owner: $owner, name: $repo) {
      ...LabelPickerLabelsPaginated
      labelsByNames: labels(names: $labelNames, first: $count, orderBy: {field: NAME, direction: ASC})
        @include(if: $shouldQueryByNames) {
        nodes {
          ...LabelPickerLabel
        }
      }
    }
  }
`

const LabelPickerSearchGraphqlQuery = graphql`
  query LabelPickerSearchQuery($owner: String!, $repo: String!, $query: String, $count: Int!) {
    repository(owner: $owner, name: $repo) {
      labels(query: $query, first: $count) {
        nodes {
          ...LabelPickerLabel
        }
      }
    }
  }
`

export const AssignedLabelFragment = graphql`
  fragment LabelPickerAssignedLabels on Labelable
  @argumentDefinitions(cursor: {type: "String"}, assignedLabelPageSize: {type: "Int", defaultValue: 100})
  @refetchable(queryName: "LabelPickerAssignedLabelsQuery") {
    labels(first: $assignedLabelPageSize, after: $cursor, orderBy: {field: NAME, direction: ASC})
      @connection(key: "LabelPicker_labels") {
      # eslint-disable-next-line relay/unused-fields
      edges {
        node {
          ...LabelPickerLabel
        }
      }
    }
  }
`

export const LabelPickerLabelsPaginatedFragment = graphql`
  fragment LabelPickerLabelsPaginated on Repository
  @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 100})
  @refetchable(queryName: "LabelsListPaginationQuery") {
    id
    viewerIssueCreationPermissions {
      labelable
    }
    labels(first: $count, after: $cursor, orderBy: {field: NAME, direction: ASC}) {
      nodes {
        ...LabelPickerLabel
      }
      totalCount
    }
  }
`

export const LabelFragment = graphql`
  fragment LabelPickerLabel on Label @inline {
    id
    color
    name
    nameHTML
    description
    # eslint-disable-next-line relay/unused-fields
    url
  }
`

type CompressedLabelAnchorProps = {
  size?: 'small' | 'large'
  labels: LabelPickerLabel$data[]
  anchorProps?: React.HTMLAttributes<HTMLElement>
  displayHotkey: boolean
  MAX_DISPLAYED_LABELS?: number
  readonly?: boolean
}

const CompressedLabelAnchor = forwardRef<HTMLButtonElement, CompressedLabelAnchorProps>(
  ({size = 'small', labels, anchorProps, displayHotkey, MAX_DISPLAYED_LABELS = 2, readonly}, ref) => {
    return (
      <CompressedLabelsToken
        size={size}
        labelNamesWithColor={labels.map(l => ({nameHTML: l.nameHTML, color: l.color}))}
        anchorProps={anchorProps}
        MAX_DISPLAYED_LABELS={MAX_DISPLAYED_LABELS}
        readonly={readonly}
        leadingIcon={TagIcon}
        hotKey={!readonly && displayHotkey ? HOTKEYS.labelPicker.toUpperCase() : undefined}
        anchorText={labels?.length === 0 ? LABELS.noLabels : undefined}
        ref={ref}
      />
    )
  },
)

CompressedLabelAnchor.displayName = 'CompressedLabelAnchor'

const labelsGroup: ItemGroup = {groupId: 'labels'}
const suggestionsGroup: ItemGroup = {groupId: 'suggestions', header: {title: 'Suggestions', variant: 'filled'}}

export function BulkIssuesLabelPicker({
  issuesToActOn,
  existingIssueLabels,
  labelAppliedToAll,
  connectionIds,
  useQueryForAction,
  repositoryId,
  query,
  onCompleted,
  onError,
  ...props
}: BulkLabelPickerProps) {
  const environment = useRelayEnvironment()

  const onSelectionChange = useCallback(
    (selectedLabels: LabelPickerLabel$data[]) => {
      const labelsToAdd = selectedLabels.filter(l => !labelAppliedToAll.some(la => la.id === l.id))
      const labelsToRemove = labelAppliedToAll.filter(la => !selectedLabels.some(l => la.id === l.id))
      const args = {
        applyLabelIds: labelsToAdd.map(l => l.id),
        removeLabelIds: labelsToRemove.map(l => l.id),
      }
      const mutationArgs = {
        environment,
        optimisticUpdateIds: issuesToActOn,
        existingIssueLabels,
        connectionIds,
        onError: (error: Error) => {
          onError?.(error)
        },
      }

      if (useQueryForAction && repositoryId && query) {
        commitUpdateIssueLabelsBulkByQueryMutation({
          ...mutationArgs,
          input: {
            repositoryId,
            query,
            ...args,
          },
          onCompleted: ({updateIssuesBulkByQuery}: updateIssueLabelsBulkByQueryMutation$data) => {
            onCompleted?.(updateIssuesBulkByQuery?.jobId || undefined)
          },
        })
      } else {
        commitUpdateIssueLabelsBulkMutation({
          ...mutationArgs,
          input: {
            ids: [...issuesToActOn],
            ...args,
          },
          onCompleted: ({updateIssuesBulk}: updateIssueLabelsBulkMutation$data) => {
            onCompleted?.(updateIssuesBulk?.jobId || undefined)
          },
        })
      }
    },
    [
      connectionIds,
      environment,
      existingIssueLabels,
      issuesToActOn,
      labelAppliedToAll,
      onCompleted,
      onError,
      query,
      repositoryId,
      useQueryForAction,
    ],
  )

  return (
    <LabelPicker
      labels={labelAppliedToAll}
      onSelectionChanged={onSelectionChange}
      showEditLabelsButton={false}
      {...props}
    />
  )
}

export function LabelPicker({shortcutEnabled, anchorElement, ...rest}: LabelPickerProps) {
  return (
    <LazyItemPicker
      hotkey={shortcutEnabled ? HOTKEYS.labelPicker : undefined}
      anchorElement={(anchorProps, ref) => anchorElement(anchorProps, ref)}
      createChild={() => (
        <ItemPickerFetcher anchorElement={anchorElement} shortcutEnabled={shortcutEnabled} {...rest} />
      )}
      insidePortal={rest.insidePortal}
      keybindingCommandId="item-pickers:open-labels"
    />
  )
}

function ItemPickerFetcher({repo, owner, labels, labelNames, onSelectionChanged, ...props}: LabelPickerProps) {
  const environment = useRelayEnvironment()

  const [isLoading, setIsLoading] = useState(true)
  const [fetchKey, setFetchKey] = useState(0)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<LabelPickerLabelsPaginated$key | null>(null)
  const [initialLabels, setInitialLabels] = useState<LabelPickerLabel$data[]>(labels)
  const repoNwo = `${owner}/${repo}`

  useEffect(() => {
    if (!IS_SERVER) {
      clientSideRelayFetchQueryRetained<LabelPickerQuery>({
        environment,
        query: LabelPickerGraphqlQuery,
        variables: {
          owner,
          repo,
          // Used on issues#index for fetching the labels present in the query string
          shouldQueryByNames: labelNames && labelNames.length > 0,
          labelNames: labelNames?.join(','),
          count: VALUES.labelsInitialLoadCount,
        },
      }).subscribe({
        next: response => {
          const repoLabels = response.repository
          setData(repoLabels ?? null)
          if (labelNames && response.repository?.labelsByNames) {
            const labelsByName = (response.repository?.labelsByNames.nodes || []).flatMap(node =>
              // eslint-disable-next-line no-restricted-syntax
              node ? [readInlineData<LabelPickerLabel$key>(LabelFragment, node)] : [],
            )
            setInitialLabels(labelsByName)
          }
          setIsLoading(false)
          setIsError(false)
        },
        error: () => {
          setIsError(true)
        },
      })
    }
  }, [environment, fetchKey, labelNames, owner, repo])

  const searchLabels = useCallback(
    (query: string) =>
      new Promise<LabelPickerLabel$data[]>((resolve, reject) => {
        fetchQuery<LabelPickerSearchQuery>(environment, LabelPickerSearchGraphqlQuery, {
          query,
          owner,
          repo,
          count: VALUES.labelsPageSize,
        }).subscribe({
          next: (fetchedData: LabelPickerSearchQuery$data) => {
            if (fetchedData !== null) {
              const suggestedLabels = (fetchedData.repository?.labels?.nodes || []).flatMap(
                // eslint-disable-next-line no-restricted-syntax
                node => (node ? [readInlineData<LabelPickerLabel$key>(LabelFragment, node)] : []),
              )

              if (props.noLabelOption && hasFuzzyMatch(query, props.noLabelOption?.source?.name ?? '')) {
                suggestedLabels.unshift(SPECIAL_VALUES.noLabelsData as LabelPickerLabel$data)
              }

              resolve(suggestedLabels)
            }
          },
          error: (error: Error) => {
            reject(error)
          },
        })
      }),
    [environment, owner, props.noLabelOption, repo],
  )

  const anchorRef = useRef<HTMLButtonElement>(null)

  const {createFallbackComponent} = useItemPickerErrorFallback({
    errorMessage: LABELS.cantEditItems('labels'),
    anchorElement: anchorProps => props.anchorElement(anchorProps, anchorRef),
    open: true,
  })

  const allLabels = useMemo(() => {
    const a = labelNames ? initialLabels : labels
    if (props.noLabelOption?.selected && !a.find(l => l.id === SPECIAL_VALUES.noLabelsData.id)) {
      a.unshift(SPECIAL_VALUES.noLabelsData as LabelPickerLabel$data)
    }
    return a
  }, [initialLabels, labelNames, labels, props.noLabelOption?.selected])

  if (isError) {
    return createFallbackComponent(() => setFetchKey(fetchKey + 1))
  }

  return (
    <ItemPickerWrapper
      repo={repo}
      owner={owner}
      paginatedKey={data}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      // If we're fetching labels by name, make sure we'll pass here the fetched labels
      // This is a particularity for tests, as we can't rely on the initialLabels default state
      labels={allLabels}
      onSelectionChanged={onSelectionChanged}
      searchLabels={searchLabels}
      repoNwo={repoNwo}
      {...props}
    />
  )
}

function ItemPickerWrapper({
  labels: selectedLabels,
  searchLabels,
  paginatedKey,
  isLoading,
  setIsLoading,
  onSelectionChanged,
  insidePortal,
  shortcutEnabled,
  anchorElement,
  nested = false,
  triggerOpen = true,
  initialFilter,
  repoNwo,
  showEditLabelsButton = true,
  noLabelOption = undefined,
  title,
  showNoMatchItem = false,
}: ItemPickerWrapperProps) {
  const [filter, setFilter] = useState('')
  const [isServerFetching, setIsServerFetching] = useState(false)
  const [loadedLabels, setLoadedLabels] = useState<Array<LabelPickerLabel$data & {__isNew__?: boolean}>>([])
  const {addToast} = useToastContext()
  const environment = useRelayEnvironment()

  const data = useFragment(LabelPickerLabelsPaginatedFragment, paginatedKey)
  const totalNumberOfLabels = data?.labels?.totalCount || 0
  const fetchedLabels = useMemo(() => {
    const labels = (data?.labels?.nodes || []).flatMap(a =>
      // eslint-disable-next-line no-restricted-syntax
      a ? [readInlineData<LabelPickerLabel$key>(LabelFragment, a)] : [],
    )

    if (noLabelOption) {
      labels.unshift(SPECIAL_VALUES.noLabelsData as LabelPickerLabel$data)
    }

    return labels
  }, [data?.labels?.nodes, noLabelOption])
  const shouldServerFetch = searchLabels && totalNumberOfLabels > VALUES.labelsInitialLoadCount

  const sortedSelectedLabels = useMemo(
    () => selectedLabels.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [selectedLabels],
  )
  const repositoryId = data?.id
  const canCreateLabel = data?.viewerIssueCreationPermissions?.labelable || false

  useEffect(() => {
    if (loadedLabels.length > 0 || fetchedLabels.length === 0) return

    setLoadedLabels(fetchedLabels)
  }, [fetchedLabels, loadedLabels.length])

  const items = useMemo(() => {
    if (!filter) {
      const allLabels = sortedSelectedLabels.concat(
        fetchedLabels.filter(l => !selectedLabels.find(l2 => l2.id === l.id)),
      )

      return allLabels
    }

    return fuzzyFilter<LabelPickerLabel$data>({
      items: loadedLabels,
      filter,
      key: (l: LabelPickerLabel$data) => l.name,
      secondaryKey: (l: LabelPickerLabel$data) => `${l.name} ${l.description}`,
    })
  }, [filter, loadedLabels, sortedSelectedLabels, fetchedLabels, selectedLabels])

  const fetchSearchData = useCallback(
    async (query: string) => {
      if (query === '') {
        setLoadedLabels(fetchedLabels)
        setIsServerFetching(false)
        return
      }

      if (!searchLabels) return
      setIsServerFetching(true)

      try {
        setLoadedLabels(await searchLabels(query))
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
    [addToast, fetchedLabels, searchLabels],
  )

  const debounceFetchSearchData = useDebounce(
    (nextValue: string) => fetchSearchData(nextValue),
    VALUES.pickerDebounceTime,
  )

  const filterItems = useCallback(
    (value: string) => {
      const trimmedFilter = value.trim()
      if (filter !== trimmedFilter && shouldServerFetch) {
        setIsServerFetching(true)
        debounceFetchSearchData(trimmedFilter)
      }

      setFilter(value)
    },
    [debounceFetchSearchData, filter, shouldServerFetch],
  )

  const getItemKey = useCallback((label: LabelPickerLabel$data) => label.id, [])

  const createNewLabel = useCallback(
    (
      _: ItemProps,
      label: LabelPickerLabel$data,
      event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
    ) => {
      event.preventDefault()
      event.stopPropagation()

      if (!repositoryId) return
      setIsLoading(true)

      commitCreateLabelMutation({
        environment,
        input: {
          repositoryId,
          color: label.color,
          name: label.name,
        },
        onError: () => {
          // Temporarily disabling this until we have a standard way of displaying fetch errors
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotCreateLabel,
          })
          setIsLoading(false)
        },
        onCompleted: response => {
          const newLabel = response?.createLabel?.label as LabelPickerLabel$data | null
          if (newLabel) {
            setLoadedLabels([{...newLabel, __isNew__: true}, ...loadedLabels])
          }
          setIsLoading(false)
        },
      })
    },
    [addToast, environment, loadedLabels, repositoryId, setIsLoading],
  )

  const convertToItemProps = useCallback(
    (label: LabelPickerLabel$data): ExtendedItemProps<LabelPickerLabel$data> => {
      if (noLabelOption && label.id === SPECIAL_VALUES.noLabelsData.id) {
        const noLabelItem = {...noLabelOption}
        noLabelItem.groupId = noLabelItem.selected ? labelsGroup.groupId : suggestionsGroup.groupId
        return noLabelItem
      }

      if (label.id === filter) {
        return {
          id: label.id,
          description: label.description || undefined,
          descriptionVariant: 'block',
          source: label,
          text: `Create new label: "${label.name}"`,
          trailingVisual: PlusIcon,
          sx: {wordBreak: 'break-word', '& [class*=BaseVisualContainer]:first-child': {display: 'none'}},
          onAction: (item: ItemProps, event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) =>
            createNewLabel(item, label, event),
        }
      }

      return {
        id: label.id,
        description: label.description ?? undefined,
        descriptionVariant: 'block',
        children: <SafeHTMLText sx={{wordBreak: 'break-word'}} html={label.nameHTML as SafeHTMLString} />,
        source: label,
        groupId: selectedLabels.find(l => l.id === label.id) ? labelsGroup.groupId : suggestionsGroup.groupId,
        leadingVisual: () => (
          <Box
            sx={{
              bg: `#${label.color}`,
              borderColor: `#${label.color}`,
              width: 14,
              height: 14,
              borderRadius: 10,
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          />
        ),
      }
    },
    [noLabelOption, filter, selectedLabels, createNewLabel],
  )

  const groups: ItemGroup[] = useMemo(() => {
    const itemGroups = []
    if (selectedLabels.length > 0) {
      itemGroups.push(labelsGroup)
    }
    if (items.length > 0 && items.length - selectedLabels.length > 0) {
      itemGroups.push(suggestionsGroup)
    }
    return itemGroups
  }, [selectedLabels, items])

  const editLabelsPath = useMemo(() => {
    if (!repoNwo || !ssrSafeDocument?.location) return undefined
    const baseUrl = ssrSafeDocument.location.origin
    return `${baseUrl}/${repoNwo}${URLS.labelPageSuffix}`
  }, [repoNwo])

  const onFooterClick = useCallback(
    (e: React.MouseEvent) => {
      if (ssrSafeDocument?.location?.href && showEditLabelsButton && editLabelsPath) {
        // if the mouse wheel is clicked, do nothing
        if (e.button === 1) return

        // if a keyboard modifier is used, do nothing as the underlying default logic will
        // already open this into a new tab.
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

        e.preventDefault()
        ssrSafeDocument.location.href = editLabelsPath
      }
    },
    [editLabelsPath, showEditLabelsButton],
  )

  const footer: React.ReactElement | undefined = useMemo(() => {
    if (!showEditLabelsButton || !editLabelsPath) {
      return undefined
    }

    return (
      <Box sx={{display: 'flex', flexGrow: 1, justifyContent: 'center'}}>
        <LinkButton
          variant="invisible"
          sx={{fontWeight: 'bold', fontSize: 0}}
          onClick={onFooterClick}
          href={editLabelsPath}
          size={'small'}
        >
          {LABELS.editLabels}
        </LinkButton>
      </Box>
    )
  }, [editLabelsPath, onFooterClick, showEditLabelsButton])

  const anchorRef = useRef<HTMLButtonElement>(null)

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1}}>
      <ItemPicker
        loading={isLoading || isServerFetching}
        items={items}
        initialSelectedItems={selectedLabels}
        openHotkey={shortcutEnabled ? HOTKEYS.labelPicker : undefined}
        title={title || LABELS.labelsHeader}
        filterItems={filterItems}
        getItemKey={getItemKey}
        convertToItemProps={convertToItemProps}
        placeholderText={'Filter labels'}
        selectionVariant={items.length === 0 ? 'single' : 'multiple'}
        onSelectionChange={onSelectionChanged}
        renderAnchor={props => anchorElement(props, anchorRef)}
        groups={!filter ? groups : undefined}
        insidePortal={insidePortal}
        height={'large'}
        width={'medium'}
        nested={nested}
        resultListAriaLabel={'Label results'}
        triggerOpen={triggerOpen}
        initialFilter={initialFilter}
        selectPanelRef={anchorRef}
        footer={footer}
        keybindingCommandId="item-pickers:open-labels"
        customNoMatchItem={
          canCreateLabel && showNoMatchItem && filter
            ? ({
                id: filter,
                color: 'aaaaaa',
                name: filter,
                nameHTML: filter,
                description: undefined,
                url: '',
              } as Omit<LabelPickerLabel$data, '$fragmentType'>)
            : undefined
        }
      />
    </Box>
  )
}

type DefaultLabelAnchorProps = Pick<LabelPickerProps, 'labels' | 'readonly'> & {
  anchorProps?: React.HTMLAttributes<HTMLElement> | undefined
}
export const DefaultLabelAnchor = forwardRef<HTMLButtonElement, DefaultLabelAnchorProps>(
  ({labels, readonly, anchorProps}, ref) => {
    return (
      <CompressedLabelAnchor
        labels={labels}
        readonly={readonly}
        displayHotkey={false}
        anchorProps={readonly ? undefined : anchorProps}
        ref={ref}
      />
    )
  },
)

DefaultLabelAnchor.displayName = 'DefaultLabelAnchor'
