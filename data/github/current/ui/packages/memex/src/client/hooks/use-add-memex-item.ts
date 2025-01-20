import {useCallback} from 'react'

import type {LocalUpdatePayload, RemoteUpdatePayload, UpdateColumnValueAction} from '../api/columns/contracts/domain'
import {SystemColumnId} from '../api/columns/contracts/memex-column'
import {TrackedBy} from '../api/issues-graph/contracts'
import {ItemType} from '../api/memex-items/item-type'
import type {RepositoryItem} from '../api/repository/contracts'
import {ItemAddedDoesNotMatchFilter} from '../api/stats/contracts'
import {
  getColumnValueFromFilters,
  isValuePresenceFilter,
  normalizeToLowercaseFieldName,
} from '../components/filter-bar/helpers/search-filter'
import {useSearch} from '../components/filter-bar/search-context'
import useToasts, {ToastType} from '../components/toasts/use-toasts'
import {not_typesafe_nonNullAssertion} from '../helpers/non-null-assertion'
import {ViewType} from '../helpers/view-type'
import type {DraftIssueModel, IssueModel, MemexItemModel, PullRequestModel} from '../models/memex-item-model'
import {mapToLocalUpdate, mapToRemoteUpdate} from '../state-providers/column-values/column-value-payload'
import {useUpdateItemColumnValue} from '../state-providers/column-values/use-update-item-column-value'
import {useFindColumnByName} from '../state-providers/columns/use-find-column-by-name'
import {isValidDraftItemColumn} from '../state-providers/memex-items/memex-item-helpers'
import {usePaginatedMemexItemsQuery} from '../state-providers/memex-items/queries/use-paginated-memex-items-query'
import {useMemexItems} from '../state-providers/memex-items/use-memex-items'
import {useRemoveParentIssues} from '../state-providers/tracked-by-items/use-remove-parent-issues'
import {Resources} from '../strings'
import {usePostStats} from './common/use-post-stats'
import {useApiRequest} from './use-api-request'
import {useBuildItemPayloadFromFilter} from './use-build-item-payload-from-filter'
import {useEnabledFeatures} from './use-enabled-features'
import {useFilterKeywords} from './use-filter-keywords'
import {useSidePanel} from './use-side-panel'
import {useViewType} from './use-view-type'

interface ColumnValuesFromFilter {
  /**
   * all fields that need to be set as part of the create item server request,
   * `excluding` repository fields
   */
  columnValuesForCreate: Array<UpdateColumnValueAction>

  /**
   * all column values at the repository level that require user permissions validation,
   * prior to attempting to set the value - Currently supported fields: `Assignees`, `Labels`, and `Milestone`
   */
  columnValuesFromSuggestions: Array<{
    memexProjectColumnId:
      | typeof SystemColumnId.Assignees
      | typeof SystemColumnId.Labels
      | typeof SystemColumnId.Milestone
      | typeof SystemColumnId.TrackedBy
    filterValue: string
  }>
}

export interface UseAddMemexItemProps {
  /**
   * Make the API request to add an issue or PR to this project. This method typically comes
   * from `useCreateMemexItem`.
   */
  onAddItem: (
    item: AddedRepositoryItem,
    repositoryId: number,
    memexProjectColumnValues: Array<RemoteUpdatePayload>,
    localColumnValues: Array<LocalUpdatePayload>,
    previousMemexProjectItemId: number | '' | undefined,
    groupId: string | undefined,
    secondaryGroupId: string | undefined,
  ) => Promise<MemexItemModel | null>
  /**
   * Make the API request to add a draft to this project. This method typically comes
   * from `useCreateMemexItem`.
   */
  onAddDraftItem: (
    text: string,
    memexProjectColumnValues: Array<RemoteUpdatePayload>,
    localColumnValues: Array<LocalUpdatePayload>,
    previousMemexProjectItemId: number | '' | undefined,
    groupId: string | undefined,
    secondaryGroupId: string | undefined,
  ) => Promise<MemexItemModel | null>
  /** Always called upon adding the item to the project. */
  onSave?: () => void
  updateActions?: ReadonlyArray<UpdateColumnValueAction>
  /** ID of the item after which this new item should be inserted. */
  previousItemId?: number | ''
  /**
   * Control whether system fields (fields that exist outside of Memex) should be updated
   * when trying to keep the new item in view.
   */
  keepSystemFields?: boolean

  /**
   * A server-created group id associated with the item being added. If this hook is being used
   * in an ungrouped view, this should be undefifned.
   * We will use this to determine if the item that the group is being added to
   * has more data on the server than what is currently in the view
   */
  groupId?: string

  secondaryGroupId?: string
}

/** Just the fields needed to add the item to the project. */
type AddedRepositoryItem = Pick<RepositoryItem, 'type' | 'id'>

type ItemWithRepo = AddedRepositoryItem & {repositoryId: number}

/** `string` for draft items. */
type Item = ItemWithRepo | string

const defaultUpdateActions: Array<UpdateColumnValueAction> = []

/**
 * Returns a function to add a new item to the current Memex view. Attempts to update the
 * item to match the view and shows a toast if that's not possible.
 */
export const useAddMemexItem = ({
  onAddItem,
  onAddDraftItem,
  onSave,
  updateActions = defaultUpdateActions,
  previousItemId,
  keepSystemFields = false,
  groupId,
  secondaryGroupId,
}: UseAddMemexItemProps) => {
  const {fieldFilters, query, matchesSearchQuery, transientQuery} = useSearch()
  const {items} = useMemexItems()
  const {addToast} = useToasts()
  const {findColumnByName} = useFindColumnByName()
  const {updateMultipleSequentially} = useUpdateItemColumnValue()
  const buildItemPayloadFromFilter = useBuildItemPayloadFromFilter()
  const {isKeywordQualifier} = useFilterKeywords()
  const {postStats} = usePostStats()
  const {openProjectItemInPane, supportedItemTypes: sidePanelSupportedItemTypes} = useSidePanel()
  const {setChildParentRelationship} = useRemoveParentIssues()
  const {tasklist_block, memex_table_without_limits} = useEnabledFeatures()

  const {hasNextPage, hasNextPageForGroupedItems} = !memex_table_without_limits
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      {hasNextPage: false, hasNextPageForGroupedItems: useCallback(() => false, [])}
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      usePaginatedMemexItemsQuery()

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {viewType} = memex_table_without_limits ? useViewType() : {viewType: ViewType.Table}

  const buildColumnValuesFromFilters = useCallback((): ColumnValuesFromFilter | undefined => {
    if (!fieldFilters.length && !transientQuery.fieldFilters.length) return

    const {columnValuesForCreate, columnValuesFromSuggestions} = [
      ...fieldFilters,
      ...transientQuery.fieldFilters,
    ].reduce<ColumnValuesFromFilter>(
      (columnValuesAcc, [filterName, filterValues]) => {
        if (!filterValues.length || isValuePresenceFilter(filterName) || isKeywordQualifier(filterName)) {
          return columnValuesAcc
        }
        if (filterName === TrackedBy.FilterName && !tasklist_block) {
          return columnValuesAcc
        }

        let values = [...filterValues]

        // Find the column that corresponds to the filter name
        const column = findColumnByName(normalizeToLowercaseFieldName(filterName))
        if (!column || (keepSystemFields && !column.userDefined)) return columnValuesAcc

        // Any filter fields that we already have in the updateAction take priority over the
        // values derived from the filter

        // updateAction only has a memexProjectColumnId for custom fields, if it doesn't have it
        // we compare by dataType as it's a system column
        const updateAction = updateActions.find(action => {
          if ('memexProjectColumnId' in action) {
            return action.memexProjectColumnId === column.id
          }
          return action.dataType === column.dataType
        })

        if (updateAction) {
          return columnValuesAcc
        }

        // If there are multiple filter values, then we don't set a column value
        // and let item be created outside of the filter
        if (values.length > 1) {
          values = []
        }

        // If the column requires us to load suggestions to find the correct value,
        // we'll need to do that later after initial item creation.
        if (columnRequiresSuggestions(column.id)) {
          return {
            ...columnValuesAcc,
            columnValuesFromSuggestions: [
              ...columnValuesAcc.columnValuesFromSuggestions,
              {memexProjectColumnId: column.id, filterValue: not_typesafe_nonNullAssertion(values[0])},
            ],
          }
        }

        // Lookup the valid item value based on the filter string value
        const columnValueAction = getColumnValueFromFilters(items, column, values)
        if (!columnValueAction) return columnValuesAcc

        return {
          ...columnValuesAcc,
          columnValuesForCreate: [...columnValuesAcc.columnValuesForCreate, columnValueAction],
        }
      },
      {columnValuesForCreate: [], columnValuesFromSuggestions: []},
    )

    // If we have an updateAction add it to our list of column values

    columnValuesForCreate.push(...updateActions)

    return {columnValuesForCreate, columnValuesFromSuggestions}
  }, [
    fieldFilters,
    transientQuery.fieldFilters,
    updateActions,
    isKeywordQualifier,
    tasklist_block,
    findColumnByName,
    keepSystemFields,
    items,
  ])

  const request = useCallback(
    async (item: Item) => {
      let model: MemexItemModel | null = null
      const memexProjectColumnValues: Array<RemoteUpdatePayload> = []
      const localColumnValues: Array<LocalUpdatePayload> = []
      let columnValuesFromSuggestions: ColumnValuesFromFilter['columnValuesFromSuggestions'] = []

      if (fieldFilters.length || transientQuery.fieldFilters.length) {
        const result = buildColumnValuesFromFilters()
        if (result) {
          for (const columnValueAction of result.columnValuesForCreate) {
            const localUpdate = mapToLocalUpdate(columnValueAction)
            if (localUpdate) localColumnValues.push(localUpdate)

            const remoteUpdate = mapToRemoteUpdate(columnValueAction)
            if (remoteUpdate) memexProjectColumnValues.push(remoteUpdate)
          }

          columnValuesFromSuggestions = result.columnValuesFromSuggestions
        }
      } else {
        for (const updateAction of updateActions) {
          const remoteUpdate = mapToRemoteUpdate(updateAction)
          const localUpdate = mapToLocalUpdate(updateAction)
          if (remoteUpdate) memexProjectColumnValues.push(remoteUpdate)
          if (localUpdate) localColumnValues.push(localUpdate)
        }
      }

      if (typeof item === 'object') {
        const {repositoryId, ...itemWithoutRepo} = item
        model = await onAddItem(
          itemWithoutRepo,
          repositoryId,
          memexProjectColumnValues,
          localColumnValues,
          previousItemId,
          groupId,
          secondaryGroupId,
        )
      } else {
        model = await onAddDraftItem(
          item,
          memexProjectColumnValues,
          localColumnValues,
          previousItemId,
          groupId,
          secondaryGroupId,
        )
      }

      if (!model) return

      onSave?.()

      if (tasklist_block) {
        // Updates child parent relationships when new items are added to a view
        setChildParentRelationship(model.content.id)
      }

      let errorUpdatingColumns = false
      if (columnValuesFromSuggestions) {
        const updates = await Promise.all(
          columnValuesFromSuggestions.map(async ({memexProjectColumnId, filterValue}) => {
            if (columnValidForModel(model, memexProjectColumnId)) {
              try {
                return await buildItemPayloadFromFilter(model, memexProjectColumnId, filterValue)
              } catch (e) {
                // cannot set this column for the current item and/or user
                errorUpdatingColumns = true
              }
            }
          }),
        )

        const nonEmptyUpdates = updates.filter((update): update is UpdateColumnValueAction => !!update)

        // We update the column values sequentially as the model will not handle race-conditions between
        // updates, which can result in the incorrect data being stored locally at the end of all the updates.
        await updateMultipleSequentially(model, nonEmptyUpdates)
      }

      if (!matchesSearchQuery(model) || errorUpdatingColumns) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: ToastType.warning,
          message: Resources.newItemFilterWarning,
          action: sidePanelSupportedItemTypes.has(model.contentType)
            ? {
                handleClick: () => model && openProjectItemInPane(model),
                text: Resources.viewItem,
              }
            : undefined,
        })
        postStats({
          name: ItemAddedDoesNotMatchFilter,
          context: JSON.stringify({model, filter: query}),
        })
      }

      const hasMoreItems = groupId ? hasNextPageForGroupedItems({groupId}) : hasNextPage
      if (hasMoreItems) {
        let message = ''
        if (viewType === ViewType.Table) {
          message = Resources.newItemAddedToBottomOfTable
        } else if (viewType === ViewType.Roadmap) {
          message = Resources.newItemAddedToBottomOfRoadmap
        } else if (viewType === ViewType.Board) {
          message = Resources.newItemAddedToBottomOfColumn
        }
        // For MWL, we don't want to add an item to the table and scroll to it
        // if we have more data on the server that has not yet been loaded. In this scenario
        // we inform the user that the item has been added to the bottom of the table,
        // and give them a call to action to open the item in the side panel
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: ToastType.warning,
          message,
          action: sidePanelSupportedItemTypes.has(model.contentType)
            ? {
                handleClick: () => model && openProjectItemInPane(model),
                text: Resources.viewItem,
              }
            : undefined,
        })
      }
    },
    [
      fieldFilters.length,
      transientQuery.fieldFilters.length,
      onSave,
      tasklist_block,
      matchesSearchQuery,
      groupId,
      hasNextPageForGroupedItems,
      hasNextPage,
      buildColumnValuesFromFilters,
      updateActions,
      onAddItem,
      previousItemId,
      secondaryGroupId,
      onAddDraftItem,
      setChildParentRelationship,
      updateMultipleSequentially,
      buildItemPayloadFromFilter,
      addToast,
      sidePanelSupportedItemTypes,
      postStats,
      query,
      openProjectItemInPane,
      viewType,
    ],
  )

  const {perform: addMemexItem} = useApiRequest({request})

  return addMemexItem
}

/**
 * Used to determine whether or not a column has server generated suggestions from which
 * we have to pick a value for the update
 *
 * @param columnId - the column id to check
 * @returns whether or not the column requires suggestions
 */
const columnRequiresSuggestions = (
  columnId: number | SystemColumnId,
): columnId is
  | typeof SystemColumnId.Assignees
  | typeof SystemColumnId.Labels
  | typeof SystemColumnId.Milestone
  | typeof SystemColumnId.TrackedBy => {
  return (
    columnId === SystemColumnId.Assignees ||
    columnId === SystemColumnId.Labels ||
    columnId === SystemColumnId.Milestone ||
    columnId === SystemColumnId.TrackedBy
  )
}

const columnValidForModel = (
  model: MemexItemModel | null,
  memexProjectColumnId: SystemColumnId,
): model is IssueModel | PullRequestModel | DraftIssueModel => {
  if (!model) return false
  if (model.contentType === ItemType.RedactedItem) return false
  if (model.contentType === ItemType.DraftIssue) {
    return isValidDraftItemColumn(memexProjectColumnId)
  }
  return true
}
