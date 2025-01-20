import type {IdType, Row, TableInstance} from 'react-table'

import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import {shouldDisableGroupFooter} from '../../helpers/table-group-utilities'
import {
  createNavigateAction,
  createNavigationContext,
  createSetFocusStateAction,
  type FocusState,
  type NavigateAction,
  type SetFocusStateAction,
} from '../../navigation/context'
import {
  type CoordinateFocus,
  type Focus,
  type FocusNavigation,
  FocusType,
  NavigationDirection,
} from '../../navigation/types'
import type {TableDataType} from './table-data-type'

export type NavigateActionOptions = {
  wrap?: boolean
  previousFocus?: boolean
}

export const TableFocusType = {
  COORDINATE: 'coordinate',
  FOOTER: 'footer',
  SEARCH_INPUT: 'search-input',
  GROUP_FOOTER: 'group-footer',
  GLOBAL_OMNIBAR: 'global-omnibar',
} as const
export type TableFocusType = ObjectValues<typeof TableFocusType>

export type CellFocus = CoordinateFocus<
  string,
  string,
  {editing?: boolean; suspended?: boolean; replaceContents?: boolean; newContent?: string}
>
type FooterFocus = Focus<null> & {
  type: typeof TableFocusType.FOOTER
}

type SearchInputFocus = Focus<null> & {
  type: typeof TableFocusType.SEARCH_INPUT
}

type GroupFooterFocus = Focus<{groupId: string}> & {
  type: typeof TableFocusType.GROUP_FOOTER
}

type GlobalOmnibarFocus = Focus<null> & {
  type: typeof TableFocusType.GLOBAL_OMNIBAR
}

export type TableFocus = CellFocus | FooterFocus | GroupFooterFocus | SearchInputFocus | GlobalOmnibarFocus

export type TableFocusState = FocusState<TableFocus>
export type TableSetFocusStateAction = SetFocusStateAction<TableFocus>

export type TableNavigateAction = NavigateAction<NavigateActionOptions>

export type GetHeaderFocusType = () => TableFocus | null

export type TableFocusMeta = {
  instance: TableInstance<TableDataType>
  getHeaderFocus: GetHeaderFocusType
  focusableRowFilter?: (
    focus: TableFocus,
    lastFocus: TableFocus | null,
    navigation: FocusNavigation<NavigateActionOptions>,
    row: Row<TableDataType>,
  ) => boolean
  focusableColumnFilter?: (
    columnId: string,
    navigation: FocusNavigation<NavigateActionOptions>,
    row?: Row<TableDataType>,
  ) => boolean
}

/**
 * Determine whether the given focus is on the table's omnibar (as opposed
 * to, for example, a data cell).
 *
 * @param focus The focus to test
 * @returns A type predicate for a footer focus
 */
export function isOmnibarFocus(focus: TableFocus): focus is FooterFocus {
  return focus.type === TableFocusType.FOOTER
}

/**
 * Determine whether the given focus is on the table's search input (as opposed
 * to, for example, a data cell).
 *
 * @param focus The focus to test
 * @returns A type predicate for a search input focus
 */
export function isSearchInputFocus(focus?: TableFocus | null): focus is SearchInputFocus {
  return focus?.type === TableFocusType.SEARCH_INPUT
}

/**
 * Determine whether the given focus is on the omnibar for any group
 *
 * @param focus the focus to test
 *
 * @returns The type predicate for the footer focus for any given group
 */
export function isAnyGroupOmnibarFocus(focus: TableFocus): focus is GroupFooterFocus {
  return focus.type === TableFocusType.GROUP_FOOTER
}

/**
 * Determine whether the given focus is on the omnibar for a particular group
 *
 * @param focus the focus to test
 * @param groupId the id of the requested group
 *
 * @returns The type predicate for the footer focus matching the given group
 */
export function isGroupOmnibarFocus<D extends object>(
  focus: TableFocus,
  groupId: IdType<D>,
): focus is GroupFooterFocus {
  return focus.type === TableFocusType.GROUP_FOOTER && focus.details.groupId === groupId
}

/**
 * Determine whether the given focus is in a cell in the table (as
 * opposed to, for example, the table omnibar).
 *
 *     console.log(isCellFocus(focus)
 *       ? focus.editing
 *       : 'Not a cell focus');
 *
 * @param focus The focus to test
 * @returns A type predicate for a cell focus
 */
export function isCellFocus(focus: TableFocus): focus is CellFocus {
  return focus.type === TableFocusType.COORDINATE
}

/**
 * Determine whether the cell focus is 'suspended' - that is, when the 'real' DOM focus is somewhere else but the
 * focus state still remembers the cell for returning focus.
 */
export function isSuspended(cellFocus: CellFocus) {
  return cellFocus.details.meta.suspended
}

/**
 * Determines whether or not the provided focus state is for the cell at the row / column provided
 * @param focusState Current focus state to compare against
 * @param rowId Id of the row to check - will be the `y` value of the focus state's coordinates
 * @param columnId Id of the column to check - will be the `x` value of the focus state's coordinates
 * @returns true if the focus state is for the cell at the row / column provided, false otherwise
 */
export function cellHasFocus(focusState: TableFocusState | null, rowId: string, columnId: string) {
  if (!focusState?.focus?.details || focusState.focus.type !== 'coordinate') return false
  const focusDetails = focusState.focus.details
  return focusDetails.y === rowId && focusDetails.x === columnId
}

export function focusOmnibar(): SetFocusStateAction<TableFocus> {
  return createSetFocusStateAction<FooterFocus>({
    focusType: FocusType.Focus,
    type: TableFocusType.FOOTER,
    details: null,
  })
}

export function focusSearchInput(): SetFocusStateAction<TableFocus> {
  return createSetFocusStateAction<SearchInputFocus>({
    focusType: FocusType.Focus,
    type: TableFocusType.SEARCH_INPUT,
    details: null,
  })
}

export function focusGroupOmnibar<D extends object>(groupId: IdType<D>): SetFocusStateAction<TableFocus> {
  return createSetFocusStateAction<GroupFooterFocus>({
    focusType: FocusType.Focus,
    type: TableFocusType.GROUP_FOOTER,
    details: {groupId},
  })
}

/**
 * Used when we are trying to globally focus omnibar
 * since we do not know if table is grouped or not
 */
export function focusGlobalOmnibar(): SetFocusStateAction<TableFocus> {
  return createSetFocusStateAction<GlobalOmnibarFocus>({
    focusType: FocusType.Focus,
    type: TableFocusType.GLOBAL_OMNIBAR,
    details: null,
  })
}

/**
 * Create a focus state action for a cell
 *
 * @param newRowID The new row ID to focus on
 * @param newColID The new cell ID to focus on
 * @param editing Whether the new focus should be in editing mode
 */
export function focusCell(
  rowId: string,
  colId: string,
  editing?: boolean,
  suspended?: boolean,
  replaceContents?: boolean,
  newContent?: string,
): SetFocusStateAction<CellFocus> {
  return createSetFocusStateAction<CellFocus>({
    focusType: FocusType.Focus,
    type: TableFocusType.COORDINATE,
    details: {
      y: rowId,
      x: colId,
      meta: {
        editing,
        suspended,
        replaceContents,
        newContent,
      },
    },
  })
}

export function clearFocus() {
  return createSetFocusStateAction(null)
}

export function moveTableFocus(navigation: FocusNavigation<NavigateActionOptions>): TableNavigateAction {
  return createNavigateAction(navigation)
}

export const {
  useNavigation: useTableNavigation,
  useStableNavigation: useStableTableNavigation,
  NavigationProvider: TableNavigationProvider,
} = createNavigationContext(tableNavigationReducer, tableSetFocusReducer)

export function useTableNavigationFocusInitialValue() {
  const {
    state: {focus},
  } = useTableNavigation()

  const newContentFromCellFocusEvent = focus != null && isCellFocus(focus) && focus.details.meta.newContent
  return newContentFromCellFocusEvent || ''
}

export function tableNavigationReducer(
  state: TableFocusState,
  meta: TableFocusMeta,
  action: TableNavigateAction,
): TableFocusState {
  const {focus, previousFocus} = state
  const {visibleColumns, flatRows, groupedRows, state: tableState} = meta.instance
  // this contains the group values which are collapsed by the user
  const {collapsedGroups} = tableState
  const {getHeaderFocus, focusableRowFilter, focusableColumnFilter} = meta

  if (!focus) {
    return state
  }

  const {navigation} = action

  let newFocus: TableFocus | null = null

  // When the table is grouped, react-table will include the groups in the
  // flatRows array-- with the boolean property `isGrouped`. So in order to make
  // focus navigation work as expected, we need to remove the groups from the
  // flatRows array.
  const rowsWithoutGroups = flatRows.filter(row => !row.isGrouped)

  // If specified, can be used to prevent visible cells from recieving focus
  const focusableRowsWithoutGroups = focusableRowFilter
    ? rowsWithoutGroups.filter(row => focusableRowFilter(focus, previousFocus, navigation, row))
    : rowsWithoutGroups

  const focusableGroupedRows =
    focusableRowFilter && groupedRows
      ? groupedRows.map(group => ({
          ...group,
          subRows: group.subRows.filter(row => focusableRowFilter(focus, previousFocus, navigation, row)),
        }))
      : groupedRows

  const navigableColumnIds = visibleColumns.filter(col => !col.nonNavigable).map(c => c.id)

  // If specified, can be used to prevent visible cells from recieving focus
  const focusableColumnIds = focusableColumnFilter
    ? navigableColumnIds.filter(id => {
        const wouldBeRow = isCellFocus(focus) ? flatRows.find(r => r.id === focus.details.y) : undefined
        return focusableColumnFilter(id, navigation, wouldBeRow)
      })
    : navigableColumnIds

  // `groupedRows` are in the correct group order, so we should use them to
  // ensure when we jump to the next/previous group that we choose the correct
  // group
  if (focusableGroupedRows) {
    const groups = getRowGroups(focusableGroupedRows, collapsedGroups)

    if (isCellFocus(focus)) {
      const groupAndRow = getGroupAndRow(groups, focus)

      if (groupAndRow) {
        newFocus = getGroupedNavigationTargetFromCell(groupAndRow, navigation, groups, focusableColumnIds)
      }

      if (newFocus === null) {
        newFocus = getNavigationTargetFromCell(
          focus,
          navigation,
          focusableRowsWithoutGroups,
          focusableColumnIds,
          getHeaderFocus,
        )
      }
    } else if (isAnyGroupOmnibarFocus(focus)) {
      newFocus = getGroupedNavigationTargetFromFooter(focus, navigation, groups, focusableColumnIds, previousFocus)
    } else if (isSearchInputFocus(focus)) {
      newFocus = getNavigationTargetFromSearch(
        navigation,
        focusableRowsWithoutGroups,
        focusableColumnIds,
        previousFocus,
      )
    }
  } else {
    if (isOmnibarFocus(focus)) {
      newFocus = getNavigationTargetFromFooter(
        navigation,
        focusableRowsWithoutGroups,
        focusableColumnIds,
        getHeaderFocus,
        previousFocus,
      )
    } else if (isSearchInputFocus(focus)) {
      newFocus = getNavigationTargetFromSearch(
        navigation,
        focusableRowsWithoutGroups,
        focusableColumnIds,
        previousFocus,
      )
    } else if (isCellFocus(focus)) {
      newFocus = getNavigationTargetFromCell(
        focus,
        navigation,
        focusableRowsWithoutGroups,
        focusableColumnIds,
        getHeaderFocus,
      )
    }
  }
  if (newFocus) {
    return {
      ...state,
      focus: newFocus,
      previousFocus: getNextPreviousFocus(state),
    }
  }

  return state
}

function tableSetFocusReducer(
  state: TableFocusState,
  meta: TableFocusMeta,
  action: TableSetFocusStateAction,
): TableFocusState {
  let newFocus: TableFocus | null = null

  if (action.focus?.type === TableFocusType.GLOBAL_OMNIBAR) {
    const {groupedRows, state: tableState} = meta.instance

    const groups = groupedRows ? getRowGroups(groupedRows, tableState.collapsedGroups) : undefined
    newFocus = getNavigationTargetFromGlobalOmnibarFocus(state, groups)
  }

  return {
    ...state,
    focus: newFocus ?? action.focus,
    previousFocus: getNextPreviousFocus(state),
  }
}

/**
 * Filter out disabled, collapsed and empty groups
 *
 * @param groupedRows State of grouped rows
 * @param collapsedGroups Collapsed groups from the table state
 * @returns Filtered groups
 */
function getRowGroups(groupedRows: Array<Row<TableDataType>>, collapsedGroups: Array<string>) {
  return groupedRows.filter(
    r =>
      r.subRows.length > 0 &&
      !shouldDisableGroupFooter(r.groupedSourceObject) &&
      collapsedGroups.indexOf(r.groupedValue) === -1,
  )
}

const navigateArray = (
  arr: Array<string>,
  currentId: string | undefined,
  currentIndex: number,
  direction: NavigationDirection,
): string | undefined => {
  if (direction === NavigationDirection.Same) {
    return currentId
  }

  if (direction === NavigationDirection.First) {
    return arr[0]
  }
  if (direction === NavigationDirection.Second) {
    return arr[1]
  }

  if (direction === NavigationDirection.Last) {
    return arr[arr.length - 1]
  }

  if (!currentId || currentIndex === -1) return

  if (direction === NavigationDirection.Next) {
    const nextIndex = Math.min(currentIndex + 1, arr.length - 1)
    return arr[nextIndex]
  }

  if (direction === NavigationDirection.Previous) {
    const prevIndex = Math.max(0, currentIndex - 1)
    return arr[prevIndex]
  }
}

/** If the previous focus was a visible table cell then return the column index, else return null. */
function getPreviousColumnIndex(previousFocus: TableFocus | null, navigableColumnIds: Array<string>) {
  if (previousFocus && isCellFocus(previousFocus)) {
    const index = navigableColumnIds.findIndex(id => id === previousFocus?.details?.x)
    return index > -1 ? index : null
  }
  return null
}

export function getNextPreviousFocus({focus, previousFocus}: TableFocusState): TableFocus | null {
  if (!focus) return null

  return isOmnibarFocus(focus) || isAnyGroupOmnibarFocus(focus) || isSearchInputFocus(focus) ? previousFocus : focus
}

/**
 * To locate last added item to the react-table we can use the id of the object.
 * For example let's say we have a table with 3 items, and we added a new item to the table.
 * We do now know where this item will land in out array of rows, since we do not know current sorting.
 * Before adding rows looks like [{id: '1', ...}, {id: '2', ...}, {id: '3', ...}]
 * After added rows looks like [{id: '4', ...}, {id: '1', ...}, {id: '2', ...}, {id: '3', ...}]
 *
 * @param rows Array<Row<D>> - Table rows
 * @returns Row<D> - Last added item in the table
 */
const getLastAddedRow = (rows: Array<Row<TableDataType>>) => {
  if (!rows || rows.length === 0) {
    return null
  }

  let lastIndex = 0
  let lastRowIndex = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (row !== undefined) {
      const rowIndex = row.index
      if (rowIndex > lastRowIndex) {
        lastRowIndex = rowIndex
        lastIndex = i
      }
    }
  }

  return rows[lastIndex]
}

/** Helper internal type for determining where the focus currently is in a group */
type GroupRowFocus = {
  /** Parent row which currently has focus */
  group: Row<TableDataType>
  /** Row index which has focus in the `subRows` group */
  subRowIndex: number
  /** Which column currently has focus */
  colID: string
  /** Helper property to quickly check that the first row of the group has focus */
  firstRow: boolean
  /** Helper property to quickly check that the last row of the group has focus */
  lastRow: boolean
}

export const getGroupedNavigationTargetFromCell = (
  groupAndRow: GroupRowFocus,
  navigation: FocusNavigation<NavigateActionOptions>,
  groups: Array<Row<TableDataType>>,
  navigableColumnIds: Array<string>,
): TableFocus | null => {
  const {firstRow, lastRow, group, colID} = groupAndRow

  const currentColIndex = navigableColumnIds.findIndex(id => id === colID) ?? 0
  const groupIndex = groups.findIndex(g => g.id === group.id)

  // Tab / shift+tab keyboard navigation wraps. Arrow keys do not wrap.
  const wrap = !!navigation.details?.wrap
  const wrapPrevious = wrap && currentColIndex === 0 && navigation.x === NavigationDirection.Previous
  const wrapNext =
    wrap && currentColIndex === navigableColumnIds.length - 1 && navigation.x === NavigationDirection.Next
  const navigateUp = wrapPrevious || navigation.y === NavigationDirection.Previous
  const navigateDown = wrapNext || navigation.y === NavigationDirection.Next

  // Navigate up (previous) from the first row of any group except the first -> focus on previous group omnibar
  if (navigateUp && groupIndex > 0 && firstRow) {
    const previousGroup = groups[groupIndex - 1]
    if (!previousGroup) return null
    return focusGroupOmnibar(previousGroup.id).focus
  }

  // Navigate down (next) from the last row of any group -> focus on that group's omnibar
  if (navigateDown && lastRow) {
    return focusGroupOmnibar(group.id).focus
  }

  return null
}

export const getGroupedNavigationTargetFromFooter = (
  focus: GroupFooterFocus,
  navigation: FocusNavigation<NavigateActionOptions>,
  rows: Array<Row<TableDataType>>,
  navigableColumnIds: Array<string>,
  previousFocus: TableFocus | null,
): TableFocus | null => {
  const groupId = focus.details.groupId
  const groupIndex = rows.findIndex(r => r.id === groupId)
  const group = rows[groupIndex]

  // Tab / shift+tab keyboard navigation wraps. Arrow keys do not wrap.
  const wrap = !!navigation.details?.wrap
  const wrapPrevious = wrap && navigation.x === NavigationDirection.Previous
  const wrapNext = wrap && navigation.x === NavigationDirection.Next
  const navigateUp = wrapPrevious || navigation.y === NavigationDirection.Previous
  const navigateDown = wrapNext || navigation.y === NavigationDirection.Next
  const previousColIndex = getPreviousColumnIndex(previousFocus, navigableColumnIds)

  // not in final group omnibar, moving forwards...
  if (navigateDown && groupIndex < rows.length - 1) {
    const nextGroup = rows[groupIndex + 1]
    const newColIndex = wrap ? 0 : previousColIndex ?? 0

    if (nextGroup && nextGroup.subRows.length > 0) {
      // next group has rows -> move to first row/cell of group
      const newRowID = nextGroup.subRows[0]?.id
      const newColID = navigableColumnIds[newColIndex]

      if (newRowID === undefined || newColID === undefined) return null
      return focusCell(newRowID, newColID).focus
    } else if (nextGroup) {
      // next group is empty -> move to next omnibar
      return focusGroupOmnibar(nextGroup.id).focus
    }
  }

  // current group has rows, and moving backwards -> move to the last cell of the previous row
  if (navigateUp && groupIndex >= 0 && group && group.subRows.length > 0) {
    const newRowID = not_typesafe_nonNullAssertion(group.subRows.at(-1)).id
    const newColIndex = wrap ? navigableColumnIds.length - 1 : previousColIndex ?? 0
    const newColID = navigableColumnIds[newColIndex]
    if (newColID === undefined) return null
    return focusCell(newRowID, newColID).focus
  }

  // no rows in current group, and moving backwards -> move to omnibar of previous group
  if (navigateUp && groupIndex > 0 && group && group.subRows.length === 0) {
    const previousGroup = rows[groupIndex - 1]
    if (!previousGroup) return null
    return focusGroupOmnibar(previousGroup.id).focus
  }

  // We use Y: NavigationDirection.Last, X: NavigationDirection.Second
  // when we hit `Tab` in the Omnibar and want to focus the item that we just added
  // For the grouped by scenario, we want this to be the last added item of the group, not the
  // overall last added item in the table
  if (navigation.y === NavigationDirection.Last && navigation.x === NavigationDirection.Second) {
    if (!group) return null
    const lastRow = getLastAddedRow(group.subRows)

    if (!lastRow) return null
    const nextColumnId = navigableColumnIds[1] ? navigableColumnIds[1] : navigableColumnIds[0]
    if (nextColumnId === undefined) return null
    return focusCell(lastRow.id, nextColumnId).focus
  }

  return null
}

/**
 * Get the target focus for the given movement, when coming from the
 * table's footer.
 *
 * @param navigation The intended movement
 * @param rows The table's rows
 * @param navigableColumnIds The table's navigable columns
 */
export const getNavigationTargetFromFooter = (
  navigation: FocusNavigation<NavigateActionOptions>,
  rows: Array<Row<TableDataType>>,
  navigableColumnIds: Array<string>,
  getHeaderFocus: GetHeaderFocusType,
  previousFocus: TableFocus | null,
): TableFocus | null => {
  // We use Y: NavigationDirection.Last, X: NavigationDirection.Second
  // when we hit `Tab` in the Omnibar and want to focus the item that we just added
  // We want this to be the last added item
  if (navigation.y === NavigationDirection.Last && navigation.x === NavigationDirection.Second) {
    const lastRow = getLastAddedRow(rows)
    if (!lastRow) return null
    const nextColumnId = navigableColumnIds[1] ? navigableColumnIds[1] : navigableColumnIds[0]
    if (nextColumnId === undefined) return null
    return focusCell(lastRow.id, nextColumnId).focus
  }

  const previousColIndex = getPreviousColumnIndex(previousFocus, navigableColumnIds)
  if (navigation.y === NavigationDirection.Previous) {
    if (rows.length === 0) {
      return getHeaderFocus()
    }

    const nextFocusColumnId = navigableColumnIds[previousColIndex ?? 0]
    if (nextFocusColumnId === undefined) return null
    return focusCell(not_typesafe_nonNullAssertion(rows.at(-1)).id, nextFocusColumnId, false).focus
  } else if (navigation.y) {
    const newRowID = navigateArray(
      rows.map(r => r.id),
      undefined,
      -1,
      navigation.y,
    )

    // If we don't get a new column ID by navigating, default to the first
    // column. This happens when a navigation action uses
    // NavigationDirection.Same for the column.
    const newColID =
      navigateArray(navigableColumnIds, undefined, -1, navigation.x || NavigationDirection.First) ??
      navigableColumnIds[0]

    if (newRowID && newColID) {
      return focusCell(newRowID, newColID, false).focus
    } else {
      return null
    }
  } else if (navigation.x && navigation.details?.wrap) {
    if (rows.length === 0) {
      return getHeaderFocus()
    }

    return focusCell(
      not_typesafe_nonNullAssertion(rows.at(-1)).id,
      not_typesafe_nonNullAssertion(navigableColumnIds.at(-1)),
      false,
    ).focus
  } else if (navigation.details?.previousFocus) {
    return previousFocus
  } else {
    return null
  }
}

/**
 * Get the target focus for the given movement, when coming from the
 * table's search.
 *
 * @param movement The intended movement
 * @param rows The table's rows
 * @param navigableColumnIds The table's navigable columns
 */
export const getNavigationTargetFromSearch = (
  navigation: FocusNavigation<NavigateActionOptions>,
  rows: Array<Row<TableDataType>>,
  navigableColumnIds: Array<string>,
  previousFocus: TableFocus | null,
): TableFocus | null => {
  if (navigation.y) {
    const newRowID = navigateArray(
      rows.map(r => r.id),
      undefined,
      -1,
      navigation.y,
    )
    const newColID =
      navigateArray(navigableColumnIds, undefined, -1, navigation.x || NavigationDirection.First) ??
      navigableColumnIds[0]

    if (newRowID && newColID) {
      return focusCell(newRowID, newColID, false).focus
    } else {
      return focusOmnibar().focus
    }
  } else if (navigation.details?.previousFocus) {
    return previousFocus
  } else {
    return focusOmnibar().focus
  }
}

/**
 * Get the target focus for the given movement, when coming from the
 * given focus.
 *
 * @param focus The table's current focus
 * @param navigation The intended movement
 * @param rows the navigable rows of the table - when grouping is enabled this will exclude the generated rows for each group
 * @param navigableColumnIds The table's navigable columns
 */
export const getNavigationTargetFromCell = (
  focus: CellFocus,
  navigation: FocusNavigation<NavigateActionOptions>,
  rows: Array<Row<TableDataType>>,
  navigableColumnIds: Array<string>,
  getHeaderFocus: GetHeaderFocusType,
): TableFocus | null => {
  if (focus.details.y === rows.at(-1)?.id && navigation.y === NavigationDirection.Next) {
    return focusOmnibar().focus
  }

  if (focus.details.y === rows.at(0)?.id && navigation.y === NavigationDirection.Previous) {
    return getHeaderFocus()
  }

  const currentRowIndex = rows.findIndex(row => row.id === focus.details.y) ?? 0
  const currentColIndex = navigableColumnIds.findIndex(id => id === focus.details.x) ?? 0

  let newRowID = navigateArray(
    rows.map(r => r.id),
    focus?.details.y,
    currentRowIndex,
    navigation.y || NavigationDirection.Same,
  )
  let newColID = navigateArray(
    navigableColumnIds,
    focus?.details.x,
    currentColIndex,
    navigation.x || NavigationDirection.Same,
  )

  if (navigation?.details?.wrap) {
    if (
      navigation.x === NavigationDirection.Next &&
      navigableColumnIds.findIndex(id => id === focus?.details.x) + 1 >= navigableColumnIds.length
    ) {
      if (currentRowIndex + 1 <= rows.length - 1) {
        newColID = navigableColumnIds[0]
        newRowID = rows[currentRowIndex + 1]?.id
      } else {
        return focusOmnibar().focus
      }
    } else if (
      navigation.x === NavigationDirection.Previous &&
      navigableColumnIds.findIndex(id => id === focus?.details.x) - 1 < 0
    ) {
      if (currentRowIndex - 1 >= 0) {
        newColID = navigableColumnIds[navigableColumnIds.length - 1]
        newRowID = rows[currentRowIndex - 1]?.id
      } else {
        return getHeaderFocus()
      }
    }
  }

  let newEditing = focus?.details.meta.editing ?? false
  let newSuspended = focus?.details.meta.suspended ?? false

  if (navigation.focusType === FocusType.Edit) {
    newEditing = true
  } else if (navigation.focusType === FocusType.Focus) {
    newEditing = false
  }

  if (navigation.focusType === FocusType.Suspended) {
    newSuspended = true
  } else if (navigation.focusType !== FocusType.Same) {
    newSuspended = false
  }

  if (newRowID && newColID) {
    return focusCell(newRowID, newColID, newEditing, newSuspended).focus
  }

  return null
}

/**
 * Get the currently focused row
 *
 * @param groups State of grouped rows
 * @param focus Current focus
 * @returns Currently focused group row
 */

export function getGroupAndRow(groups: Array<Row<TableDataType>>, focus: CellFocus): GroupRowFocus | null {
  const {x: colID, y: rowID} = focus.details

  for (const group of groups) {
    const subRowIndex = group.subRows.findIndex(subrow => subrow.id === rowID)
    if (subRowIndex >= 0) {
      const firstRow = subRowIndex === 0
      const lastRow = subRowIndex === group.subRows.length - 1

      return {group, subRowIndex, colID, firstRow, lastRow}
    }
  }

  return null
}

export function getNavigationTargetFromGlobalOmnibarFocus(state: TableFocusState, groups?: Array<Row<TableDataType>>) {
  const {focus} = state
  if (groups) {
    // If no available groups don't do anything
    if (!groups.length) {
      return state.focus
    }

    // If cell is focused, try to focus cells group omnibar
    if (focus && isCellFocus(focus)) {
      const groupAndRow = getGroupAndRow(groups, focus)

      if (groupAndRow) {
        return focusGroupOmnibar(groupAndRow.group.id).focus
      }
    }

    const nextGroup = groups[0]
    if (nextGroup) {
      // If nothing is found first group omnibar
      return focusGroupOmnibar(nextGroup.id).focus
    }
  }

  // If table is not grouped, there is only one omnibar to focus
  return focusOmnibar().focus
}
