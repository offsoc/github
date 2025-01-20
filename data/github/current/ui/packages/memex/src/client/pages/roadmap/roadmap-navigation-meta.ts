import type {Row} from 'react-table'

import type {ColumnData} from '../../api/columns/contracts/storage'
import {ItemType} from '../../api/memex-items/item-type'
import {
  isAnyGroupOmnibarFocus,
  isCellFocus,
  isOmnibarFocus,
  type NavigateActionOptions,
  type TableFocus,
} from '../../components/react_table/navigation'
import type {TableDataType} from '../../components/react_table/table-data-type'
import {ROADMAP_PILL_COLUMN_ID} from '../../components/react_table/use-roadmap-pill-area'
import type {TimeSpan} from '../../helpers/roadmap-helpers'
import {type FocusNavigation, NavigationDirection} from '../../navigation/types'

export const getHeaderFocus = () => null

const isPillAreaFocus = (focus: TableFocus) => isCellFocus(focus) && focus.details.x === ROADMAP_PILL_COLUMN_ID

const rowHasFocusableElement = (
  row: Row<TableDataType>,
  hasWritePermissions: boolean,
  getTimeSpanFromColumnData: (columns: ColumnData) => TimeSpan,
) => {
  // Redacted rows do not have a pill element
  if (row.original.contentType === ItemType.RedactedItem) return false

  // Write users can focus on the Add Dates button
  if (hasWritePermissions) return true

  // Rows without dates do not have a pill element for readonly users
  const timeSpan = getTimeSpanFromColumnData(row.original.columns)
  return !!(timeSpan.start || timeSpan.end)
}

/**
 * Used for filtering focusable cells during navigation. Skip over cells without focusable roadmap elements
 * while navigating using ArrowUp and ArrowDown
 */
export const makeFocusableRowFilter = ({
  hasWritePermissions,
  getTimeSpanFromColumnData,
}: {
  hasWritePermissions: boolean
  getTimeSpanFromColumnData: (columns: ColumnData) => TimeSpan
}) => {
  return (
    focus: TableFocus,
    lastFocus: TableFocus | null,
    navigation: FocusNavigation<NavigateActionOptions>,
    row: Row<TableDataType>,
  ) => {
    // Only filter columns if we're performing vertical navigation
    if (!(navigation.y === NavigationDirection.Next || navigation.y === NavigationDirection.Previous)) return true

    const isPillAreaFocused = isPillAreaFocus(focus)
    const isAnyOmnibarFocused = isOmnibarFocus(focus) || isAnyGroupOmnibarFocus(focus)
    const wasOmnibarFocusedFromPill = isAnyOmnibarFocused && lastFocus && isPillAreaFocus(lastFocus)

    const isNextFocusPillArea = isPillAreaFocused || wasOmnibarFocusedFromPill
    return !isNextFocusPillArea || rowHasFocusableElement(row, hasWritePermissions, getTimeSpanFromColumnData)
  }
}

/**
 * Used for filtering focusable cells during navigation. Skip over cells without focusable roadmap elements
 * while navigating using ArrowLeft and ArrowRight
 */
export const makeFocusableColumnFilter = ({
  hasWritePermissions,
  getTimeSpanFromColumnData,
}: {
  hasWritePermissions: boolean
  getTimeSpanFromColumnData: (columns: ColumnData) => TimeSpan
}) => {
  return (columnId: string, navigation: FocusNavigation<NavigateActionOptions>, row?: Row<TableDataType>) => {
    // Only filter columns if we're performing horizontal navigation
    if (!(navigation.x === NavigationDirection.Next || navigation.x === NavigationDirection.Previous)) return true

    if (columnId !== ROADMAP_PILL_COLUMN_ID || !row) return true
    return rowHasFocusableElement(row, hasWritePermissions, getTimeSpanFromColumnData)
  }
}
