import {act, render, renderHook, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type {ColumnInstance, Row, TableInstance} from 'react-table'

import {HorizontalGroupedByContext} from '../../client/features/grouping/hooks/use-horizontal-grouped-by'
import {
  useInitialTableFocusAction,
  useReinitializeFocusStateEffect,
} from '../../client/hooks/use-initial-table-focus-action'
import {SortedByContext} from '../../client/hooks/use-sorted-by'
import {ViewContext} from '../../client/hooks/use-views'
import type {MemexItemModel} from '../../client/models/memex-item-model'
import {ActionTypes} from '../../client/navigation/context'
import {systemColumnFactory} from '../factories/columns/system-column-factory'
import {issueFactory} from '../factories/memex-items/issue-factory'
import {setupTableView} from '../test-app-wrapper'

const viewContextValue = {viewStateDispatch: jest.fn(), updateViewServerStates: jest.fn()} as any
const sortedByContextValue: SortedByContext = {
  sorts: [],
  setSortedBy: jest.fn(),
  clearSortedBy: jest.fn(),
  isSortedByDirty: false,
  isSorted: false,
  setColumnSort: jest.fn(),
  setPrimarySortPreservingSecondary: jest.fn(),
  getColumnSort: jest.fn(),
}
const horizontalGroupedByContextValue = {
  groupedByColumnId: undefined,
  groupedByColumn: undefined,
  setGroupedBy: jest.fn(),
  clearGroupedBy: jest.fn(),
  isGroupedByDirty: false,
  collapsedGroups: [],
  toggleGroupCollapsed: jest.fn(),
} as any

const Wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
  return (
    <ViewContext.Provider value={viewContextValue}>
      <SortedByContext.Provider value={sortedByContextValue}>
        <HorizontalGroupedByContext.Provider value={horizontalGroupedByContextValue}>
          {children}
        </HorizontalGroupedByContext.Provider>
      </SortedByContext.Provider>
    </ViewContext.Provider>
  )
}

async function renderFilterBar() {
  const columns = [
    systemColumnFactory.title().build(),
    systemColumnFactory.status({optionNames: ['Todo', 'In progress', 'Done']}).build(), // status
  ]

  const {Table} = setupTableView({columns, items: [issueFactory.build()]})
  render(<Table />)
  await userEvent.click(await screen.findByTestId('filter-bar-input'))
}

function getFilterInput(): HTMLInputElement {
  return screen.getByTestId('filter-bar-input')
}

describe('useInitialTableFocusAction', () => {
  it('returns initial focus action', () => {
    const table = {
      flatRows: [] as Array<Row<MemexItemModel>>,
      visibleColumns: [] as Array<ColumnInstance<MemexItemModel>>,
    } as TableInstance<MemexItemModel>

    const {result} = renderHook(() => useInitialTableFocusAction(table), {wrapper: Wrapper})
    expect(result.current).toEqual({
      focus: {details: null, focusType: 'Focus', type: 'footer'},
      type: ActionTypes.SET_FOCUS,
    })
  })

  describe('useReinitializeFocusStateEffect', () => {
    const defaultUseReinitializeFocusStateEffectProps = {
      currentViewNumber: 1,
      missingRequiredColumnData: false,
      setInitialFocalPoint: jest.fn(),
      table: {
        flatRows: [] as Array<Row<MemexItemModel>>,
        visibleColumns: [] as Array<ColumnInstance<MemexItemModel>>,
      } as TableInstance<MemexItemModel>,
      autoFocus: true,
    }

    it('does not update focus when view does not change', () => {
      const setInitialFocalPointStub = jest.fn()
      const {rerender} = renderHook(props => useReinitializeFocusStateEffect(props), {
        wrapper: Wrapper,
        initialProps: {...defaultUseReinitializeFocusStateEffectProps, setInitialFocalPoint: setInitialFocalPointStub},
      })
      rerender({
        ...defaultUseReinitializeFocusStateEffectProps,
        currentViewNumber: 1,
        setInitialFocalPoint: setInitialFocalPointStub,
      })

      expect(setInitialFocalPointStub).not.toHaveBeenCalled()
    })

    it('updates focus when view changes', () => {
      const setInitialFocalPointStub = jest.fn()
      const {rerender} = renderHook(props => useReinitializeFocusStateEffect(props), {
        wrapper: Wrapper,
        initialProps: {...defaultUseReinitializeFocusStateEffectProps, setInitialFocalPoint: setInitialFocalPointStub},
      })
      rerender({
        ...defaultUseReinitializeFocusStateEffectProps,
        currentViewNumber: 2,
        setInitialFocalPoint: setInitialFocalPointStub,
      })

      expect(setInitialFocalPointStub).toHaveBeenCalledTimes(1)
    })

    it('does not update focus when is missingRequiredColumnData', () => {
      const setInitialFocalPointStub = jest.fn()
      const {rerender} = renderHook(props => useReinitializeFocusStateEffect(props), {
        wrapper: Wrapper,
        initialProps: {...defaultUseReinitializeFocusStateEffectProps, setInitialFocalPoint: setInitialFocalPointStub},
      })
      rerender({
        ...defaultUseReinitializeFocusStateEffectProps,
        currentViewNumber: 2,
        missingRequiredColumnData: true,
        setInitialFocalPoint: setInitialFocalPointStub,
      })

      expect(setInitialFocalPointStub).not.toHaveBeenCalled()
    })

    it('updates focus when no missingRequiredColumnData', () => {
      const setInitialFocalPointStub = jest.fn()
      const {rerender} = renderHook(props => useReinitializeFocusStateEffect(props), {
        wrapper: Wrapper,
        initialProps: {...defaultUseReinitializeFocusStateEffectProps, setInitialFocalPoint: setInitialFocalPointStub},
      })
      rerender({
        ...defaultUseReinitializeFocusStateEffectProps,
        currentViewNumber: 2,
        missingRequiredColumnData: false,
        setInitialFocalPoint: setInitialFocalPointStub,
      })

      expect(setInitialFocalPointStub).toHaveBeenCalledTimes(1)
    })

    it('does not update focus when there is new project data and user is filtering', async () => {
      // Mocks user focusing on the filter bar
      await renderFilterBar()
      const filterBarInput = getFilterInput()
      act(() => {
        filterBarInput.focus()
      })
      const setInitialFocalPointStub = jest.fn()

      const {rerender} = renderHook(props => useReinitializeFocusStateEffect(props), {
        wrapper: Wrapper,
        initialProps: {
          ...defaultUseReinitializeFocusStateEffectProps,
          missingRequiredColumnData: true,
          setInitialFocalPoint: setInitialFocalPointStub,
        },
      })
      rerender({
        ...defaultUseReinitializeFocusStateEffectProps,
        missingRequiredColumnData: false,
        setInitialFocalPoint: setInitialFocalPointStub,
      })

      expect(setInitialFocalPointStub).not.toHaveBeenCalled()
    })
  })
})
