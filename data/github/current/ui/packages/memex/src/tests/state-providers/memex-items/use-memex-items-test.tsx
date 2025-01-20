import {renderHook} from '@testing-library/react'

import {useMemexItems} from '../../../client/state-providers/memex-items/use-memex-items'
import {DefaultClosedIssue} from '../../../mocks/memex-items/issues'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {buildSystemColumns} from '../../factories/columns/system-column-factory'
import {QueryClientWrapper, TestAppContainer} from '../../test-app-wrapper'

describe('useMemexItems', () => {
  describe('with memex_table_without_limits disabled', () => {
    it('should initialize items read from "memex-items-data" JSON Island and pull items from the first page of data', () => {
      seedJSONIsland('memex-items-data', [DefaultClosedIssue])

      const {result} = renderHook(() => useMemexItems(), {wrapper: QueryClientWrapper})
      const items = result.current.items

      expect(items).toHaveLength(1)
      expect(items[0].content.id).toEqual(DefaultClosedIssue.id)
    })

    it('resolves item.prioritizedIndex based on relative index', () => {
      seedJSONIsland('memex-items-data', [DefaultClosedIssue])

      const {result} = renderHook(() => useMemexItems(), {wrapper: QueryClientWrapper})
      const items = result.current.items

      expect(items[0].prioritizedIndex).not.toEqual(items[0].id)
      expect(items[0].prioritizedIndex).toEqual(0)
    })
  })

  describe('with memex_table_without_limits enabled', () => {
    it('should initialize items read from "memex-paginated-items-data" JSON Island and pull items from the first page of data', () => {
      seedJSONIsland('memex-columns-data', buildSystemColumns())
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])
      seedJSONIsland('memex-paginated-items-data', {
        nodes: [DefaultClosedIssue],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
        totalCount: {value: 1, isApproximate: false},
      })

      const {result} = renderHook(() => useMemexItems(), {wrapper: TestAppContainer})
      const items = result.current.items

      expect(items).toHaveLength(1)
      expect(items[0].content.id).toEqual(DefaultClosedIssue.id)
    })
  })
})
