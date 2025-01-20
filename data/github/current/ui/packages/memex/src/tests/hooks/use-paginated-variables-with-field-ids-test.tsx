import {act, renderHook} from '@testing-library/react'

import {usePaginatedVariablesWithFieldIds} from '../../client/hooks/use-paginated-variables-with-field-ids'
import {useVisibleFields} from '../../client/hooks/use-visible-fields'
import {createColumnModel} from '../../client/models/column-model'
import {useNextPlaceholderQuery} from '../../client/state-providers/memex-items/queries/use-next-placeholder-query'
import {customColumnFactory} from '../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../factories/columns/system-column-factory'
import {viewFactory} from '../factories/views/view-factory'
import {asMockHook} from '../mocks/stub-utilities'
import {createTestEnvironment, TestAppContainer} from '../test-app-wrapper'

jest.mock('../../client/state-providers/memex-items/queries/use-next-placeholder-query')

describe('usePaginatedVariablesWithFieldIds', () => {
  const columns = [
    systemColumnFactory.title().build(),
    systemColumnFactory.status({optionNames: ['Todo', 'In progress', 'Done']}).build(),
    systemColumnFactory.assignees().build(),
    customColumnFactory.build(),
  ]
  const visibleColumns = [columns[0], columns[2]]
  const view = viewFactory.table().build({visibleFields: visibleColumns.map(c => c.databaseId)})

  const mockSetUpNextPlaceholderQueries = jest.fn()
  beforeAll(() => {
    asMockHook(useNextPlaceholderQuery).mockReturnValue({
      setUpNextPlaceholderQueries: mockSetUpNextPlaceholderQueries,
    })
  })

  it('when memex_mwl_limited_field_ids is disabled, sets fieldIds to undefined', () => {
    createTestEnvironment({
      'memex-columns-data': columns,
      'memex-views': [view],
    })
    const {result} = renderHook(() => usePaginatedVariablesWithFieldIds({}), {wrapper: TestAppContainer})
    expect(result.current.fieldIds).toBeUndefined()
  })
  describe('when memex_mwl_limited_field_ids is enabled', () => {
    it('returns undefined when no fields are visible', () => {
      createTestEnvironment({'memex-enabled-features': ['memex_mwl_limited_field_ids']})
      const {result} = renderHook(() => usePaginatedVariablesWithFieldIds({}), {wrapper: TestAppContainer})
      expect(result.current.fieldIds).toBeUndefined()
    })
    it("returns a sorted list of synthetic ids for the current view's visible fields", () => {
      createTestEnvironment({
        'memex-columns-data': columns,
        'memex-views': [view],
        'memex-enabled-features': ['memex_mwl_limited_field_ids'],
      })

      const {result} = renderHook(() => usePaginatedVariablesWithFieldIds({}), {wrapper: TestAppContainer})
      expect(result.current.fieldIds).toHaveLength(2)
      expect(result.current.fieldIds).toEqual(visibleColumns.map(c => c.id).sort())
    })
    it('seeds placeholder data when fieldIds change', () => {
      createTestEnvironment({
        'memex-columns-data': columns,
        'memex-views': [view],
        'memex-enabled-features': ['memex_mwl_limited_field_ids'],
      })
      const {result, rerender} = renderHook(
        () => {
          return {
            usePaginatedVariablesWithFieldIds: usePaginatedVariablesWithFieldIds({}),
            useVisibleFields: useVisibleFields(),
          }
        },
        {wrapper: TestAppContainer},
      )
      expect(result.current.usePaginatedVariablesWithFieldIds.fieldIds).toHaveLength(2)
      act(() => {
        result.current.useVisibleFields.showField(view.number, createColumnModel(columns[1]))
      })
      rerender()
      expect(result.current.usePaginatedVariablesWithFieldIds.fieldIds).toHaveLength(3)
      expect(mockSetUpNextPlaceholderQueries).toHaveBeenCalled()
    })
  })
})
