import {act, renderHook} from '@testing-library/react'

import {DefaultOmitPropertiesForView} from '../../../client/api/view/contracts'
import {useColumnWidth} from '../../../client/state-providers/columns/use-column-width'
import {stageColumn} from '../../../mocks/data/columns'
import {omit} from '../../../utils/omit'
import {customColumnFactory} from '../../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {viewFactory} from '../../factories/views/view-factory'
import {stubUpdateColumn} from '../../mocks/api/columns'
import {stubUpdateView, stubUpdateViewWithError} from '../../mocks/api/views'
import {mockUseHasColumnData} from '../../mocks/hooks/use-has-column-data'
import {mockUseRepositories} from '../../mocks/hooks/use-repositories'
import {createTestEnvironment, TestAppContainer} from '../../test-app-wrapper'

describe('useColumnWidth', () => {
  beforeAll(() => {
    // Mock async data fetching hooks to avoid open handles
    mockUseHasColumnData()
    mockUseRepositories()
  })

  const setupWidthForColumn = ({
    columnSettingsWidth,
    layoutSettingsColumnWidth,
  }: {
    columnSettingsWidth: number | undefined
    layoutSettingsColumnWidth: number | undefined
  }) => {
    const columns = [
      systemColumnFactory.title().build(),
      systemColumnFactory.status({optionNames: ['todo', 'in progress', 'done']}).build(),
      customColumnFactory.text().build({name: 'Text', settings: {width: columnSettingsWidth}}),
    ]
    const unchangedColumnWidth = 80
    const view = viewFactory.table().build(
      layoutSettingsColumnWidth
        ? {
            layoutSettings: {
              table: {
                columnWidths: {
                  [columns[2].databaseId.toString()]: layoutSettingsColumnWidth,
                  [columns[0].databaseId.toString()]: unchangedColumnWidth,
                },
              },
            },
          }
        : {},
    )

    createTestEnvironment({
      'memex-columns-data': columns,
      'memex-views': [view],
    })

    return {column: columns[2], view, unchangedColumn: columns[0], unchangedColumnWidth}
  }

  describe('updateWidth', () => {
    const setup = () => {
      const originalWidth = 200
      const newWidth = 100
      const {view, column, unchangedColumn, unchangedColumnWidth} = setupWidthForColumn({
        layoutSettingsColumnWidth: originalWidth,
        columnSettingsWidth: originalWidth,
      })

      const expectedViewUpdate = {
        view: omit(
          {
            ...view,
            layoutSettings: {
              table: {
                columnWidths: {
                  [column.databaseId.toString()]: newWidth,
                  [unchangedColumn.databaseId.toString()]: unchangedColumnWidth,
                },
              },
            },
          },
          DefaultOmitPropertiesForView,
        ),
        viewNumber: view.number,
      }
      const updateViewStub = stubUpdateView(view)

      const expectedColumnUpdate = {
        memexProjectColumnId: column.id,
        width: newWidth,
      }

      const updateColumnStub = stubUpdateColumn(column)

      return {
        columnId: column.id,
        expectedViewUpdate,
        expectedColumnUpdate,
        originalWidth,
        newWidth,
        unchangedColumnId: unchangedColumn.id,
        unchangedColumnWidth,
        updateColumnStub,
        updateViewStub,
      }
    }

    it('should update the column width in layout settings', async () => {
      const {columnId, expectedViewUpdate, newWidth, updateViewStub, unchangedColumnId, unchangedColumnWidth} = setup()
      const {result} = renderHook(useColumnWidth, {
        wrapper: TestAppContainer,
      })

      await act(async () => {
        await result.current.updateWidth(columnId, newWidth)
      })

      expect(updateViewStub).toHaveBeenCalledWith(expectedViewUpdate)

      act(() => {
        expect(result.current.getWidth(columnId)).toBe(newWidth)
        expect(result.current.getWidth(unchangedColumnId)).toBe(unchangedColumnWidth)
      })
    })

    it('should update a rounded width when a float is provided', async () => {
      const {columnId, expectedViewUpdate, updateViewStub, unchangedColumnId, unchangedColumnWidth} = setup()
      const newWidth = 99.9999999999999
      const expectedRoundedWidth = 100
      const {result} = renderHook(useColumnWidth, {
        wrapper: TestAppContainer,
      })

      await act(async () => {
        await result.current.updateWidth(columnId, newWidth)
      })

      expect(updateViewStub).toHaveBeenCalledWith(expectedViewUpdate)

      act(() => {
        expect(result.current.getWidth(columnId)).toBe(expectedRoundedWidth)
        expect(result.current.getWidth(unchangedColumnId)).toBe(unchangedColumnWidth)
      })
    })

    it('not should update the column width in layout settings if the api request fails', async () => {
      const {columnId, expectedViewUpdate, newWidth, originalWidth, unchangedColumnId, unchangedColumnWidth} = setup()
      const updateViewStub = stubUpdateViewWithError(new Error('Error'))

      const {result} = renderHook(useColumnWidth, {
        wrapper: TestAppContainer,
      })

      await act(async () => {
        await result.current.updateWidth(columnId, newWidth)
      })

      expect(updateViewStub).toHaveBeenCalledWith(expectedViewUpdate)

      act(() => {
        expect(result.current.getWidth(columnId)).toBe(originalWidth)
        expect(result.current.getWidth(unchangedColumnId)).toBe(unchangedColumnWidth)
      })
    })

    it('should ignore an update if the column was not found', async () => {
      const {newWidth, updateViewStub} = setup()

      const {result} = renderHook(useColumnWidth, {
        wrapper: TestAppContainer,
      })

      await act(async () => {
        await result.current.updateWidth(stageColumn.id, newWidth)
      })

      expect(updateViewStub).not.toHaveBeenCalled()

      act(() => {
        expect(result.current.getWidth(stageColumn.id)).toBe(undefined)
      })
    })

    it('should ignore an update if the next state is the same as the previous state', async () => {
      const {columnId, originalWidth, updateViewStub} = setup()
      const {result} = renderHook(useColumnWidth, {
        wrapper: TestAppContainer,
      })

      await act(async () => {
        await result.current.updateWidth(columnId, originalWidth)
      })

      expect(updateViewStub).not.toHaveBeenCalled()

      act(() => {
        expect(result.current.getWidth(columnId)).toBe(originalWidth)
      })
    })
  })

  describe('getWidth', () => {
    it('returns width from layout settings if it is defined for a column', () => {
      const {column} = setupWidthForColumn({columnSettingsWidth: 120, layoutSettingsColumnWidth: 100})

      const {result} = renderHook(useColumnWidth, {
        wrapper: TestAppContainer,
      })

      act(() => {
        expect(result.current.getWidth(column.id)).toBe(100)
      })
    })

    it('returns width from column settings if no layout settings are defined for a column', () => {
      const {column} = setupWidthForColumn({columnSettingsWidth: 120, layoutSettingsColumnWidth: undefined})

      const {result} = renderHook(useColumnWidth, {
        wrapper: TestAppContainer,
      })

      act(() => {
        expect(result.current.getWidth(column.id)).toBe(120)
      })
    })
  })
})
