import {SystemColumnId} from '../../../../client/api/columns/contracts/memex-column'
import type {ColumnData} from '../../../../client/api/columns/contracts/storage'
import {
  focusCell,
  type TableFocusMeta,
  type TableNavigateAction,
  tableNavigationReducer,
} from '../../../../client/components/react_table/navigation'
import {
  ROADMAP_PILL_COLUMN_ID,
  useRoadmapPillArea,
} from '../../../../client/components/react_table/use-roadmap-pill-area'
import type {TimeSpan} from '../../../../client/helpers/roadmap-helpers'
import type {MemexItemModel} from '../../../../client/models/memex-item-model'
import {createNavigateAction} from '../../../../client/navigation/context'
import {FocusType, NavigationDirection} from '../../../../client/navigation/types'
import {
  getHeaderFocus,
  makeFocusableColumnFilter,
  makeFocusableRowFilter,
} from '../../../../client/pages/roadmap/roadmap-navigation-meta'
import {columns, data, dataWithRedactedItem} from '../../../components/table/data/projects-table'
import {renderTable} from '../../../components/table/table-renderer'
import {createMockEnvironment} from '../../../create-mock-environment'

function createMeta(
  metaOptions: {
    hasWritePermissions: boolean
    getTimeSpanFromColumnData: (columns: ColumnData) => TimeSpan
  },
  tableData = data,
): TableFocusMeta {
  const filtered = columns.filter(col => col.id === SystemColumnId.Title)
  const {result} = renderTable(
    filtered,
    tableData,
    {
      initialState: {
        groupByColumnIds: [],
      },
    },
    [useRoadmapPillArea],
  )
  const instance = result.current
  const {hasWritePermissions, getTimeSpanFromColumnData} = metaOptions
  return {
    instance,
    getHeaderFocus,
    focusableRowFilter: makeFocusableRowFilter({hasWritePermissions, getTimeSpanFromColumnData}),
    focusableColumnFilter: makeFocusableColumnFilter({hasWritePermissions, getTimeSpanFromColumnData}),
  }
}

const getCellFocus = (rowIndex: number, colId: string, items: Array<MemexItemModel> = data) => {
  const rowId = items[rowIndex].id.toString()
  return focusCell(rowId, colId, false, false).focus
}

describe('roadmap navigation meta', () => {
  const mockGetTimeSpanWithDates = jest.fn().mockReturnValue({
    start: new Date(),
    end: new Date(),
  })
  const mockGetTimeSpanWithoutDates = jest.fn().mockReturnValue({
    start: undefined,
    end: undefined,
  })

  beforeEach(() => {
    createMockEnvironment()
  })

  afterEach(() => {
    mockGetTimeSpanWithDates.mockClear()
    mockGetTimeSpanWithoutDates.mockClear()
  })

  describe('with write access', () => {
    it('allows moving from title cell to pill area with dates', () => {
      const initialState = {focus: getCellFocus(0, SystemColumnId.Title), previousFocus: null}
      const meta = createMeta({
        hasWritePermissions: true,
        getTimeSpanFromColumnData: mockGetTimeSpanWithDates,
      })

      const action: TableNavigateAction = createNavigateAction({
        x: NavigationDirection.Next,
        focusType: FocusType.Focus,
      })
      const state = tableNavigationReducer(initialState, meta, action)

      expect(state).toMatchObject({
        focus: getCellFocus(0, ROADMAP_PILL_COLUMN_ID),
        previousFocus: initialState.focus,
      })
    })

    it('allows moving from title cell to pill area without dates', () => {
      const initialState = {focus: getCellFocus(0, SystemColumnId.Title), previousFocus: null}
      const meta = createMeta({
        hasWritePermissions: true,
        getTimeSpanFromColumnData: mockGetTimeSpanWithoutDates,
      })

      const action: TableNavigateAction = createNavigateAction({
        x: NavigationDirection.Next,
        focusType: FocusType.Focus,
      })
      const state = tableNavigationReducer(initialState, meta, action)

      expect(state).toMatchObject({
        focus: getCellFocus(0, ROADMAP_PILL_COLUMN_ID),
        previousFocus: initialState.focus,
      })
    })

    it('skips redacted items', () => {
      const initialState = {focus: getCellFocus(0, ROADMAP_PILL_COLUMN_ID), previousFocus: null}
      const meta = createMeta(
        {
          hasWritePermissions: true,
          getTimeSpanFromColumnData: mockGetTimeSpanWithDates,
        },
        dataWithRedactedItem,
      )

      const action: TableNavigateAction = createNavigateAction({
        y: NavigationDirection.Next,
        focusType: FocusType.Focus,
      })
      const state = tableNavigationReducer(initialState, meta, action)

      expect(state).toMatchObject({
        focus: getCellFocus(2, ROADMAP_PILL_COLUMN_ID, dataWithRedactedItem),
        previousFocus: initialState.focus,
      })
    })
  })

  describe('with read access', () => {
    it('allows moving from title cell to pill area with dates', () => {
      const initialState = {focus: getCellFocus(0, SystemColumnId.Title), previousFocus: null}
      const meta = createMeta({
        hasWritePermissions: false,
        getTimeSpanFromColumnData: mockGetTimeSpanWithDates,
      })

      const action: TableNavigateAction = createNavigateAction({
        x: NavigationDirection.Next,
        focusType: FocusType.Focus,
      })
      const state = tableNavigationReducer(initialState, meta, action)

      expect(state).toMatchObject({
        focus: getCellFocus(0, ROADMAP_PILL_COLUMN_ID),
        previousFocus: initialState.focus,
      })
    })

    it('does not allow moving from title cell to pill area without dates', () => {
      const initialState = {focus: getCellFocus(0, SystemColumnId.Title), previousFocus: null}
      const meta = createMeta({
        hasWritePermissions: false,
        getTimeSpanFromColumnData: mockGetTimeSpanWithoutDates,
      })

      const action: TableNavigateAction = createNavigateAction({
        x: NavigationDirection.Next,
        focusType: FocusType.Focus,
      })
      const state = tableNavigationReducer(initialState, meta, action)

      expect(state).toMatchObject({
        focus: getCellFocus(0, SystemColumnId.Title),
        previousFocus: initialState.focus,
      })
    })

    it('skips redacted items', () => {
      const initialState = {focus: getCellFocus(0, ROADMAP_PILL_COLUMN_ID), previousFocus: null}
      const meta = createMeta(
        {
          hasWritePermissions: false,
          getTimeSpanFromColumnData: mockGetTimeSpanWithDates,
        },
        dataWithRedactedItem,
      )

      const action: TableNavigateAction = createNavigateAction({
        y: NavigationDirection.Next,
        focusType: FocusType.Focus,
      })
      const state = tableNavigationReducer(initialState, meta, action)

      expect(state).toMatchObject({
        focus: getCellFocus(2, ROADMAP_PILL_COLUMN_ID, dataWithRedactedItem),
        previousFocus: initialState.focus,
      })
    })
  })
})
