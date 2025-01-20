import {act, renderHook} from '@testing-library/react'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {MemexItem} from '../../../client/api/memex-items/contracts'
import {createColumnModel} from '../../../client/models/column-model'
import {ColumnsStateProvider} from '../../../client/state-providers/columns/columns-state-provider'
import {useColumnsContext} from '../../../client/state-providers/columns/use-columns-context'
import {assigneesColumn, issueTypeColumn} from '../../../mocks/data/columns'
import {DefaultClosedIssue, DefaultOpenIssue} from '../../../mocks/memex-items'
import {DefaultColumns} from '../../../mocks/mock-data'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {buildGroupedItemsResponse} from '../memex-items/query-client-api/helpers'

function createColumnsStateProviderWrapper() {
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => (
    <ColumnsStateProvider>{children}</ColumnsStateProvider>
  )

  return wrapper
}

describe('ColumnsStateProvider', () => {
  it('setAllColumns sets allColumns', () => {
    seedJSONIsland('memex-columns-data', [DefaultColumns[0]])

    const {result} = renderHook(useColumnsContext, {wrapper: createColumnsStateProviderWrapper()})

    expect(result.current.allColumns).toHaveLength(1)
    expect(result.current.allColumns[0].id).toEqual(DefaultColumns[0].id)

    act(() => {
      result.current.setAllColumns([createColumnModel(DefaultColumns[0]), createColumnModel(DefaultColumns[1])])
    })

    expect(result.current.allColumns).toHaveLength(2)
    expect(result.current.allColumns[0].id).toEqual(DefaultColumns[0].id)
    expect(result.current.allColumns[1].id).toEqual(DefaultColumns[1].id)
  })

  it('setAllColumns sets allColumnsRef', () => {
    seedJSONIsland('memex-columns-data', [DefaultColumns[0]])

    const {result} = renderHook(useColumnsContext, {wrapper: createColumnsStateProviderWrapper()})

    expect(result.current.allColumnsRef.current).toHaveLength(1)
    expect(result.current.allColumnsRef.current[0].id).toEqual(DefaultColumns[0].id)

    act(() => {
      result.current.setAllColumns([createColumnModel(DefaultColumns[0]), createColumnModel(DefaultColumns[1])])
    })

    expect(result.current.allColumnsRef.current).toHaveLength(2)
    expect(result.current.allColumnsRef.current[0].id).toEqual(DefaultColumns[0].id)
    expect(result.current.allColumnsRef.current[1].id).toEqual(DefaultColumns[1].id)
  })

  it('excludes "IssueType" column for ineligible users', () => {
    seedJSONIsland('memex-columns-data', [assigneesColumn, issueTypeColumn])
    seedJSONIsland('memex-enabled-features', [])

    const {result} = renderHook(useColumnsContext, {wrapper: createColumnsStateProviderWrapper()})

    expect(result.current.allColumnsRef.current).toHaveLength(1)
    expect(result.current.allColumnsRef.current[0].id).toEqual(SystemColumnId.Assignees)
  })

  it('includes "IssueType" column for eligible users', () => {
    seedJSONIsland('memex-columns-data', [assigneesColumn, issueTypeColumn])
    seedJSONIsland('memex-enabled-features', ['issue_types'])

    const {result} = renderHook(useColumnsContext, {wrapper: createColumnsStateProviderWrapper()})

    expect(result.current.allColumnsRef.current).toHaveLength(2)
    expect(result.current.allColumnsRef.current[0].id).toEqual(SystemColumnId.Assignees)
    expect(result.current.allColumnsRef.current[1].id).toEqual(SystemColumnId.IssueType)
  })

  describe('reservedColumnNames', () => {
    it('returns [] if no reserved names in JSON island', () => {
      const {result} = renderHook(useColumnsContext, {
        wrapper: createColumnsStateProviderWrapper(),
      })
      expect(result.current.reservedColumnNames.length).toEqual(0)
    })

    it('returns reserved names from JSON Island', () => {
      seedJSONIsland('reserved-column-names', ['reserved-column-name'])

      const {result} = renderHook(useColumnsContext, {
        wrapper: createColumnsStateProviderWrapper(),
      })
      expect(result.current.reservedColumnNames.length).toEqual(1)
      expect(result.current.reservedColumnNames[0]).toEqual('reserved-column-name')
    })
  })

  describe('loaded fields', () => {
    it('loadedFieldIdsRef is read from JSON Island', () => {
      const itemWith2ColumnValues: MemexItem = {
        ...DefaultClosedIssue,
        memexProjectColumnValues: [
          {
            value: {title: {html: 'html', raw: 'raw'}},
            memexProjectColumnId: SystemColumnId.Title,
          },
          {
            value: {id: 'abc'},
            memexProjectColumnId: 10,
          },
        ],
      }
      seedJSONIsland('memex-items-data', [itemWith2ColumnValues])

      const {result} = renderHook(useColumnsContext, {
        wrapper: createColumnsStateProviderWrapper(),
      })

      expect(result.current.loadedFieldIdsRef.current.size).toEqual(2)
      expect(result.current.loadedFieldIdsRef.current.has(SystemColumnId.Title)).toBeTruthy()
      expect(result.current.loadedFieldIdsRef.current.has(10)).toBeTruthy()
    })

    it('handles no items seeded in JSON island data', () => {
      seedJSONIsland('memex-items-data', [])

      const {result} = renderHook(useColumnsContext, {
        wrapper: createColumnsStateProviderWrapper(),
      })

      expect(result.current.loadedFieldIdsRef.current.size).toEqual(0)
    })

    it('loadedFieldIdsRef is read from paginated JSON Island', () => {
      const itemWith2ColumnValues: MemexItem = {
        ...DefaultClosedIssue,
        memexProjectColumnValues: [
          {
            value: {title: {html: 'html', raw: 'raw'}},
            memexProjectColumnId: SystemColumnId.Title,
          },
          {
            value: {id: 'abc'},
            memexProjectColumnId: 10,
          },
        ],
      }
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])

      seedJSONIsland('memex-paginated-items-data', {
        nodes: [itemWith2ColumnValues],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
        totalCount: {isApproximate: false, value: 1},
      })

      const {result} = renderHook(useColumnsContext, {
        wrapper: createColumnsStateProviderWrapper(),
      })

      expect(result.current.loadedFieldIdsRef.current.size).toEqual(2)
      expect(result.current.loadedFieldIdsRef.current.has(SystemColumnId.Title)).toBeTruthy()
      expect(result.current.loadedFieldIdsRef.current.has(10)).toBeTruthy()
    })

    it(`loadedFieldIdsRef is read from paginated, grouped JSON Island,`, () => {
      const itemWith2ColumnValues: MemexItem = {
        ...DefaultClosedIssue,
        memexProjectColumnValues: [
          {
            value: {title: {html: 'html', raw: 'raw'}},
            memexProjectColumnId: SystemColumnId.Title,
          },
          {
            value: {id: 'abc'},
            memexProjectColumnId: 10,
          },
        ],
      }

      const itemWith1ColumnValue: MemexItem = {
        ...DefaultOpenIssue,
        memexProjectColumnValues: [
          {
            value: {id: 'abc'},
            memexProjectColumnId: 15,
          },
        ],
      }
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])

      seedJSONIsland(
        'memex-paginated-items-data',
        buildGroupedItemsResponse({
          groups: [
            {
              groupId: 'group1Id',
              groupValue: 'group1Value',
              items: [itemWith1ColumnValue],
            },
            {
              groupId: 'group2Id',
              groupValue: 'group2Value',
              items: [itemWith2ColumnValues],
            },
          ],
        }),
      )

      const {result} = renderHook(useColumnsContext, {
        wrapper: createColumnsStateProviderWrapper(),
      })

      expect(result.current.loadedFieldIdsRef.current.size).toEqual(2)
      expect(result.current.loadedFieldIdsRef.current.has(SystemColumnId.Title)).toBeTruthy()
      expect(result.current.loadedFieldIdsRef.current.has(10)).toBeTruthy()
      expect(result.current.loadedFieldIdsRef.current.has(15)).toBeFalsy()
    })

    it('addLoadedFieldId updates loadedFieldIdsRef', () => {
      const itemWith1ColumnValues: MemexItem = {
        ...DefaultClosedIssue,
        memexProjectColumnValues: [
          {
            value: {title: {html: 'html', raw: 'raw'}},
            memexProjectColumnId: SystemColumnId.Title,
          },
        ],
      }
      seedJSONIsland('memex-items-data', [itemWith1ColumnValues])

      const {result} = renderHook(useColumnsContext, {
        wrapper: createColumnsStateProviderWrapper(),
      })

      expect(result.current.loadedFieldIdsRef.current.size).toEqual(1)
      expect(result.current.loadedFieldIdsRef.current.has(SystemColumnId.Title)).toBeTruthy()

      act(() => {
        result.current.addLoadedFieldId(10)
      })

      expect(result.current.loadedFieldIdsRef.current.size).toEqual(2)
      expect(result.current.loadedFieldIdsRef.current.has(SystemColumnId.Title)).toBeTruthy()
      expect(result.current.loadedFieldIdsRef.current.has(10)).toBeTruthy()
    })
  })
})
